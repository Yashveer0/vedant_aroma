import { Order } from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { shiprocketApi } from "../utils/shiprocketService.js";

const MIN_SHIPMENT_WEIGHT_KG = 0.5;
const MIN_DIMENSION_CM = 1;
const DEFAULT_DIMENSION_CM = 10;

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;
const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const formatShiprocketDate = (date = new Date()) => {
  const value = new Date(date);
  const pad = (part) => String(part).padStart(2, "0");

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(
    value.getHours()
  )}:${pad(value.getMinutes())}`;
};

const splitName = (fullName = "") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" "),
  };
};

const normalizeDigits = (value = "") => String(value).replace(/\D/g, "");

const normalizeIndianPhone = (value) => {
  const digits = normalizeDigits(value);
  const normalized = digits.length > 10 ? digits.slice(-10) : digits;

  if (normalized.length !== 10) {
    throw new ApiError(400, "Shipping phone number must be a valid 10 digit Indian mobile number.");
  }

  return normalized;
};

const normalizeIndianPincode = (value) => {
  const digits = normalizeDigits(value);

  if (digits.length !== 6) {
    throw new ApiError(400, "Shipping pincode must be a valid 6 digit Indian pincode.");
  }

  return digits;
};

const normalizeRequiredText = (value, fieldName) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new ApiError(400, `${fieldName} is required for Shiprocket order creation.`);
  }

  return normalized;
};

const getShiprocketChannelOrderId = (order) => {
  const localOrderId = order?._id?.toString();
  if (!localOrderId) return String(Date.now());

  if (/^\d{1,50}$/.test(localOrderId)) {
    return localOrderId;
  }

  if (/^[a-f0-9]{24}$/i.test(localOrderId)) {
    return BigInt(`0x${localOrderId}`).toString();
  }

  const digitsOnly = normalizeDigits(localOrderId);
  return (digitsOnly || String(Date.now())).slice(0, 50);
};

const stringifyShiprocketResponse = (response) => {
  try {
    const serialized = JSON.stringify(response);
    return serialized.length > 700 ? `${serialized.slice(0, 700)}...` : serialized;
  } catch {
    return String(response);
  }
};

const getShiprocketResponseMessage = (response, fallbackMessage) => {
  const errors = response?.errors || response?.data?.errors || response?.response?.errors;
  if (errors && typeof errors === "object") {
    const details = Object.values(errors)
      .flat()
      .filter(Boolean)
      .join(" ");
    if (details) return details;
  }

  return (
    response?.message ||
    response?.data?.message ||
    response?.response?.message ||
    response?.error ||
    response?.data?.error ||
    fallbackMessage
  );
};

const getShiprocketCreateIds = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.response,
    response?.response?.data,
    response?.payload,
    response?.result,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const shiprocketOrderId =
      candidate.order_id || candidate.shiprocket_order_id || candidate.shiprocketOrderId || candidate.id;
    const shipmentId =
      candidate.shipment_id ||
      candidate.shiprocket_shipment_id ||
      candidate.shiprocketShipmentId ||
      candidate.shipment?.id ||
      candidate.shipments?.[0]?.shipment_id ||
      candidate.shipments?.[0]?.id;

    if (shiprocketOrderId && shipmentId) {
      return {
        shiprocketOrderId: String(shiprocketOrderId),
        shipmentId: String(shipmentId),
      };
    }
  }

  return null;
};

const getShiprocketErrorMessage = (error, fallbackMessage) => {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || error.message || fallbackMessage;
};

const getPackageValues = (product, skuVariant, quantity) => {
  const variant = skuVariant ? product.variants?.find((entry) => entry.sku === skuVariant) : null;
  const source = variant || product;

  return {
    weight: toPositiveNumber(source.weight, 0.1) * quantity,
    length: Math.max(toPositiveNumber(source.length, DEFAULT_DIMENSION_CM), MIN_DIMENSION_CM),
    breadth: Math.max(toPositiveNumber(source.breadth, DEFAULT_DIMENSION_CM), MIN_DIMENSION_CM),
    height: Math.max(toPositiveNumber(source.height, DEFAULT_DIMENSION_CM), MIN_DIMENSION_CM),
  };
};

export const getShiprocketShippingRate = async ({ deliveryPostcode, weightInKg, cod = false }) => {
  const pickupPostcode = process.env.PICKUP_PINCODE || process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupPostcode) {
    throw new ApiError(500, "Pickup pincode is not configured on the server.");
  }

  if (!deliveryPostcode) {
    throw new ApiError(400, "Delivery pincode is required.");
  }

  const normalizedWeight = Math.max(
    Number(Number(weightInKg || MIN_SHIPMENT_WEIGHT_KG).toFixed(3)),
    MIN_SHIPMENT_WEIGHT_KG
  );

  try {
    const { data } = await shiprocketApi.get("/courier/serviceability/", {
      params: {
        pickup_postcode: pickupPostcode,
        delivery_postcode: deliveryPostcode,
        weight: normalizedWeight,
        cod: cod ? 1 : 0,
      },
    });

    const companies = data?.data?.available_courier_companies || [];
    if (data?.status !== 200 || companies.length === 0) {
      throw new ApiError(400, "No shipping service is available for the selected pincode.");
    }

    const recommendedCourierId = data.data.recommended_courier_company_id;
    const recommendedCourier =
      companies.find((company) => String(company.courier_company_id) === String(recommendedCourierId)) ||
      companies[0];

    return {
      shippingPrice: roundCurrency(recommendedCourier.rate),
      courierCompanyId: recommendedCourier.courier_company_id,
      courierName: recommendedCourier.courier_name,
      etd: recommendedCourier.etd,
      raw: recommendedCourier,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Shiprocket serviceability error:", error.response?.data || error.message);
    throw new ApiError(502, getShiprocketErrorMessage(error, "Error fetching shipping availability."));
  }
};

const buildShiprocketPayload = async (order, userEmail) => {
  if (!order.shippingAddress) {
    throw new ApiError(400, "Order does not have a shipping address.");
  }

  let totalWeight = 0;
  let maxLength = 0;
  let maxBreadth = 0;
  let maxHeight = 0;
  const physicalItems = [];

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product_id).select(
      "name type variants weight length breadth height"
    );
    if (!product || product.type === "service") continue;

    const quantity = Number(item.quantity || 1);
    const packageValues = getPackageValues(product, item.sku_variant, quantity);
    totalWeight += packageValues.weight;
    maxLength = Math.max(maxLength, packageValues.length);
    maxBreadth = Math.max(maxBreadth, packageValues.breadth);
    maxHeight = Math.max(maxHeight, packageValues.height);

    physicalItems.push({
      name: item.product_name,
      sku: item.sku_variant || item.product_id.toString(),
      units: quantity,
      selling_price: roundCurrency(item.price_per_item),
      discount: 0,
      tax: 0,
      hsn: process.env.SHIPROCKET_DEFAULT_HSN || "",
    });
  }

  if (physicalItems.length === 0) {
    return null;
  }

  const { firstName, lastName } = splitName(order.shippingAddress.fullName);
  const billingEmail = normalizeRequiredText(
    userEmail || process.env.MAIL_USER || process.env.SHIPROCKET_API_EMAIL,
    "Billing email"
  );
  const billingAddress = normalizeRequiredText(order.shippingAddress.street, "Shipping address");
  const billingCity = normalizeRequiredText(order.shippingAddress.city, "Shipping city");
  const billingState = normalizeRequiredText(order.shippingAddress.state, "Shipping state");
  const billingCountry = normalizeRequiredText(order.shippingAddress.country || "India", "Shipping country");
  const billingPincode = normalizeIndianPincode(order.shippingAddress.postalCode);
  const billingPhone = normalizeIndianPhone(order.shippingAddress.phone);
  const pickupLocation = normalizeRequiredText(
    process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    "Shiprocket pickup location"
  );
  const itemSubtotal = roundCurrency(
    physicalItems.reduce((sum, item) => sum + Number(item.selling_price) * Number(item.units), 0)
  );
  const totalDiscount = roundCurrency(order.discountAmount || 0);
  const payload = {
    order_id: getShiprocketChannelOrderId(order),
    order_date: formatShiprocketDate(order.createdAt),
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: billingAddress,
    billing_address_2: "",
    billing_city: billingCity,
    billing_pincode: billingPincode,
    billing_state: billingState,
    billing_country: billingCountry,
    billing_email: billingEmail,
    billing_phone: billingPhone,
    shipping_is_billing: true,
    shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: billingAddress,
    shipping_address_2: "",
    shipping_city: billingCity,
    shipping_pincode: billingPincode,
    shipping_state: billingState,
    shipping_country: billingCountry,
    shipping_email: billingEmail,
    shipping_phone: billingPhone,
    order_items: physicalItems,
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    shipping_charges: roundCurrency(order.shippingPrice || 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: totalDiscount,
    sub_total: roundCurrency(Math.max(0, itemSubtotal - totalDiscount)),
    length: maxLength || DEFAULT_DIMENSION_CM,
    breadth: maxBreadth || DEFAULT_DIMENSION_CM,
    height: maxHeight || DEFAULT_DIMENSION_CM,
    weight: Math.max(Number(totalWeight.toFixed(3)), MIN_SHIPMENT_WEIGHT_KG),
  };

  if (process.env.SHIPROCKET_CHANNEL_ID) {
    payload.channel_id = Number(process.env.SHIPROCKET_CHANNEL_ID);
  }

  return payload;
};

export const createShiprocketOrder = async (order, userEmail) => {
  try {
    if (order.shipmentDetails?.shiprocketOrderId && order.shipmentDetails?.shiprocketShipmentId) {
      return order;
    }

    const orderPayload = await buildShiprocketPayload(order, userEmail);
    if (!orderPayload) {
      return order;
    }

    const { data: createOrderResponse } = await shiprocketApi.post(
      "/orders/create/adhoc",
      orderPayload
    );

    const createOrderIds = getShiprocketCreateIds(createOrderResponse);
    if (!createOrderIds) {
      const responseMessage = getShiprocketResponseMessage(
        createOrderResponse,
        "Shiprocket order response did not include order_id/shipment_id."
      );
      throw new ApiError(
        502,
        `${responseMessage} Response: ${stringifyShiprocketResponse(createOrderResponse)}`
      );
    }

    const { shiprocketOrderId, shipmentId } = createOrderIds;

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        "shipmentDetails.shiprocketChannelOrderId": orderPayload.order_id,
        "shipmentDetails.shiprocketOrderId": shiprocketOrderId,
        "shipmentDetails.shiprocketShipmentId": shipmentId,
        "shipmentDetails.status": "Order Created",
        "shipmentDetails.lastError": null,
      },
      $unset: {
        "shipmentDetails.trackingNumber": "",
        "shipmentDetails.courier": "",
        "shipmentDetails.trackingUrl": "",
        "shipmentDetails.pickupStatus": "",
        "shipmentDetails.awbAssignedAt": "",
        "shipmentDetails.pickupScheduledAt": "",
      },
    });

    return Order.findById(order._id);
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : getShiprocketErrorMessage(error, "Shiprocket order creation failed.");

    console.error(`Shiprocket automation failed for local order ${order._id}:`, message);
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        "shipmentDetails.status": "Failed",
        "shipmentDetails.lastError": message,
      },
    });

    return Order.findById(order._id);
  }
};

export const cancelShiprocketOrder = async (shiprocketOrderId) => {
  if (!shiprocketOrderId) return null;

  try {
    const { data } = await shiprocketApi.post("/orders/cancel", {
      ids: [Number(shiprocketOrderId)],
    });

    return data || { success: true };
  } catch (error) {
    console.error("Shiprocket cancellation failed:", error.response?.data || error.message);
    throw new ApiError(502, getShiprocketErrorMessage(error, "Shiprocket cancellation failed."));
  }
};
