import crypto from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { shiprocketApi } from "../utils/shiprocketService.js";
import { Order } from "../models/order.model.js";
import { getShiprocketShippingRate } from "../services/shippingService.js";

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const cleanValue = (value) => {
    if (!hasValue(value)) return undefined;
    return String(value).trim();
};

const firstValue = (...values) => values.map(cleanValue).find(Boolean);

const readBearerToken = (authorizationHeader) => {
    const authorization = cleanValue(authorizationHeader);
    if (!authorization) return undefined;
    return authorization.toLowerCase().startsWith("bearer ")
        ? authorization.slice(7).trim()
        : authorization;
};

const tokensMatch = (incomingToken, expectedToken) => {
    if (!incomingToken || !expectedToken) return false;
    const incoming = Buffer.from(incomingToken);
    const expected = Buffer.from(expectedToken);
    return incoming.length === expected.length && crypto.timingSafeEqual(incoming, expected);
};

const getWebhookToken = (req) => firstValue(
    req.query?.token,
    req.headers?.["x-shiprocket-webhook-secret"],
    req.headers?.["x-webhook-token"],
    req.headers?.["x-api-key"],
    readBearerToken(req.headers?.authorization)
);

const verifyShiprocketWebhookSecret = (req) => {
    const configuredSecret = cleanValue(process.env.SHIPROCKET_WEBHOOK_SECRET);
    if (!configuredSecret) return;

    const incomingToken = getWebhookToken(req);
    if (!tokensMatch(incomingToken, configuredSecret)) {
        throw new ApiError(401, "Invalid Shiprocket webhook token.");
    }
};

const getWebhookSources = (payload) => {
    const root = Array.isArray(payload) ? payload[0] : payload;
    const body = root && typeof root === "object" ? root : {};

    return [
        body,
        body.data,
        body.payload,
        body.shipment,
        body.shipment_data,
        body.order,
        body.order_data,
        body.data?.shipment,
        body.data?.order,
        body.payload?.shipment,
        body.payload?.order,
    ].filter((source) => source && typeof source === "object");
};

const pickWebhookField = (sources, keys) => {
    for (const source of sources) {
        for (const key of keys) {
            const value = cleanValue(source[key]);
            if (value) return value;
        }
    }
    return undefined;
};

const extractShiprocketWebhookFields = (payload) => {
    const sources = getWebhookSources(payload);

    return {
        eventName: pickWebhookField(sources, ["event", "event_name", "type", "webhook_event", "activity"]),
        statusText: pickWebhookField(sources, [
            "current_status",
            "shipment_status",
            "shipment_status_name",
            "status",
            "status_name",
            "latest_status",
        ]),
        statusId: pickWebhookField(sources, ["current_status_id", "shipment_status_id", "status_id"]),
        awb: pickWebhookField(sources, ["awb", "awb_code", "awb_number", "tracking_number", "tracking_no"]),
        courier: pickWebhookField(sources, ["courier", "courier_name", "courier_company", "courier_company_name"]),
        trackingUrl: pickWebhookField(sources, ["tracking_url", "track_url", "shipment_track_url"]),
        shipmentId: pickWebhookField(sources, ["shipment_id", "shiprocket_shipment_id", "sr_shipment_id"]),
        shiprocketOrderId: pickWebhookField(sources, ["shiprocket_order_id", "sr_order_id", "order_id"]),
        channelOrderId: pickWebhookField(sources, [
            "channel_order_id",
            "channel_order_no",
            "channel_order_number",
            "reference_id",
            "order_number",
            "order_id",
        ]),
    };
};

const getLocalOrderStatusFromShiprocket = (statusText = "") => {
    const status = statusText.toLowerCase();

    if (status.includes("cancel") || status.includes("rto") || status.includes("return")) {
        return "Cancelled";
    }

    if (status.includes("delivered")) {
        return "Delivered";
    }

    if (
        status.includes("shipped") ||
        status.includes("in transit") ||
        status.includes("out for delivery") ||
        status.includes("picked") ||
        status.includes("pickup") ||
        status.includes("manifest") ||
        status.includes("awb") ||
        status.includes("ready to ship")
    ) {
        return "Shipped";
    }

    return null;
};

const buildShiprocketOrderLookup = ({ shipmentId, shiprocketOrderId, channelOrderId, awb }) => {
    const conditions = [];
    const uniqueIds = [...new Set([shiprocketOrderId, channelOrderId].filter(Boolean))];

    for (const id of uniqueIds) {
        conditions.push({ "shipmentDetails.shiprocketOrderId": id });
        conditions.push({ "shipmentDetails.shiprocketChannelOrderId": id });
    }

    if (shipmentId) {
        conditions.push({ "shipmentDetails.shiprocketShipmentId": shipmentId });
    }

    if (awb) {
        conditions.push({ "shipmentDetails.trackingNumber": awb });
    }

    return conditions;
};

const addSetIfPresent = (update, path, value) => {
    if (hasValue(value)) {
        update.$set[path] = cleanValue(value);
    }
};

/**
 * @desc Checks courier serviceability and gets shipping rates
 * @route POST /api/v1/shipping/serviceability
 * @access Private (Logged-in User)
 */
const checkServiceability = asyncHandler(async (req, res) => {
    const { delivery_postcode, weight_in_kg = 0.5, cod = false } = req.body;
    if (!delivery_postcode) {
        throw new ApiError(400, "Delivery pincode is required.");
    }

    try {
        const shippingQuote = await getShiprocketShippingRate({
            deliveryPostcode: delivery_postcode,
            weightInKg: weight_in_kg,
            cod,
        });
        return res.status(200).json(new ApiResponse(200, shippingQuote, "Shipping rate calculated successfully."));

    } catch (error) {
        console.error("Shiprocket serviceability error:", error.response?.data || error.message);
        if (error instanceof ApiError && error.statusCode === 400) {
            return res.status(200).json(
                new ApiResponse(200, { shippingPrice: null }, "No shipping service available for this pincode.")
            );
        }
        throw error;
    }
});

export const shiprocketWebhookHealth = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { ok: true }, "Shiprocket webhook endpoint is active.")
    );
});

export const handleShiprocketWebhook = asyncHandler(async (req, res) => {
    verifyShiprocketWebhookSecret(req);

    const webhookFields = extractShiprocketWebhookFields(req.body);
    const statusForShipment = firstValue(
        webhookFields.statusText,
        webhookFields.eventName,
        webhookFields.statusId && `Status ${webhookFields.statusId}`
    );
    const lookupConditions = buildShiprocketOrderLookup(webhookFields);

    if (!lookupConditions.length) {
        console.warn("Shiprocket webhook received without usable order identifiers:", req.body);
        return res.status(200).json(
            new ApiResponse(200, { matched: false }, "Shiprocket webhook received, but no order identifier was found.")
        );
    }

    const order = await Order.findOne({ $or: lookupConditions });

    if (!order) {
        console.warn("Shiprocket webhook did not match any local order:", webhookFields);
        return res.status(200).json(
            new ApiResponse(200, { matched: false }, "Shiprocket webhook received, but no matching local order was found.")
        );
    }

    const update = {
        $set: {
            "shipmentDetails.webhookReceivedAt": new Date(),
        },
    };

    addSetIfPresent(update, "shipmentDetails.status", statusForShipment);
    addSetIfPresent(update, "shipmentDetails.webhookStatus", webhookFields.statusText);
    addSetIfPresent(update, "shipmentDetails.webhookEvent", webhookFields.eventName);
    addSetIfPresent(update, "shipmentDetails.shiprocketShipmentId", webhookFields.shipmentId);
    addSetIfPresent(update, "shipmentDetails.shiprocketOrderId", webhookFields.shiprocketOrderId);
    addSetIfPresent(update, "shipmentDetails.shiprocketChannelOrderId", webhookFields.channelOrderId);
    addSetIfPresent(update, "shipmentDetails.trackingNumber", webhookFields.awb);
    addSetIfPresent(update, "shipmentDetails.courier", webhookFields.courier);
    addSetIfPresent(update, "shipmentDetails.trackingUrl", webhookFields.trackingUrl);

    const localStatus = getLocalOrderStatusFromShiprocket(statusForShipment || "");
    if (localStatus === "Cancelled") {
        update.$set.orderStatus = "Cancelled";
        update.$set["cancellationDetails.cancelledBy"] = order.cancellationDetails?.cancelledBy || "Admin";
        update.$set["cancellationDetails.reason"] =
            order.cancellationDetails?.reason || `Cancelled in Shiprocket${statusForShipment ? `: ${statusForShipment}` : ""}`;
        update.$set["cancellationDetails.cancellationDate"] =
            order.cancellationDetails?.cancellationDate || new Date();
    } else if (localStatus === "Delivered" && order.orderStatus !== "Cancelled") {
        update.$set.orderStatus = "Delivered";
    } else if (
        localStatus === "Shipped" &&
        !["Cancelled", "Delivered"].includes(order.orderStatus)
    ) {
        update.$set.orderStatus = "Shipped";
    }

    const updatedOrder = await Order.findByIdAndUpdate(order._id, update, {
        new: true,
        runValidators: true,
    }).select("_id orderStatus shipmentDetails cancellationDetails");

    console.log(
        `Shiprocket webhook synced order ${updatedOrder._id}: ${statusForShipment || "status received"}`
    );

    return res.status(200).json(
        new ApiResponse(200, { matched: true, order: updatedOrder }, "Shiprocket webhook processed successfully.")
    );
});

export const trackOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).lean();

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view tracking for this order.");
    }

    const { trackingNumber, shiprocketShipmentId, shiprocketOrderId } = order.shipmentDetails || {};

    if (!shiprocketShipmentId && !shiprocketOrderId) {
        // Return a custom object that mimics the TrackingData structure
        return res.status(200).json(new ApiResponse(200, {
            track_status: 0, // Use 0 to indicate processing
            shipment_status: 0,
            shipment_track: [],
            shipment_track_activities: null,
            error: "Order has been placed but is awaiting shipment."
        }, "Tracking status fetched."));
    }

    try {
        const trackingParams = {};
        if (trackingNumber) trackingParams.awb = trackingNumber;
        if (shiprocketShipmentId) trackingParams.shipment_id = shiprocketShipmentId;
        if (shiprocketOrderId) trackingParams.order_id = shiprocketOrderId;

        const { data: rawResponse } = await shiprocketApi.get('/courier/track', { params: trackingParams });
        
        if (!Array.isArray(rawResponse) || rawResponse.length === 0) {
            throw new ApiError(404, "Tracking information not found in the shipping partner's system.");
        }

        const firstElement = rawResponse[0];
        const responseData = Object.values(firstElement)[0];

        if (!responseData || !responseData.tracking_data) {
            throw new ApiError(404, responseData?.message || "Invalid response structure from the shipping partner.");
        }

        const trackingData = responseData.tracking_data;

        // THIS IS THE MOST IMPORTANT PART:
        // We are NOT throwing an error for track_status: 0.
        // We are successfully returning the data received from Shiprocket.
        // The `fulfilled` case in the frontend Redux slice will handle this.
        return res.status(200).json(new ApiResponse(200, trackingData, "Tracking data fetched successfully."));

    } catch (error) {
        // This catch block will now only be triggered for genuine network errors or 500-level server errors.
        const errorMessage = error.response?.data?.message || error.message || "Failed to retrieve tracking information.";
        console.error("Shiprocket tracking error:", errorMessage);
        // This will trigger the `rejected` case in the frontend Redux slice.
        throw new ApiError(error.statusCode || 500, errorMessage);
    }
});

export { checkServiceability };
