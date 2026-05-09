import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import Product from "../models/product.model.js";
import { PaymentSession } from "../models/paymentSession.model.js";
import {
  applyWalletAdjustments,
  buildCheckoutQuote,
  buildStockUpdateOperations,
  CHECKOUT_CURRENCY,
  removePurchasedItemsFromCart,
  toRazorpayAmount,
} from "../services/checkoutService.js";
import {
  sendOrderConfirmationEmail,
  sendServiceNotificationToAdmin,
} from "../services/emailService.js";
import { cancelShiprocketOrder, createShiprocketOrder } from "../services/shippingService.js";

let razorpayClient;

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(
      500,
      "Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
};

const createReceipt = () => `vnt_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;

const timingSafeStringEqual = (first, second) => {
  const firstBuffer = Buffer.from(String(first));
  const secondBuffer = Buffer.from(String(second));

  return firstBuffer.length === secondBuffer.length && crypto.timingSafeEqual(firstBuffer, secondBuffer);
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, signature }) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!timingSafeStringEqual(expectedSignature, signature)) {
    throw new ApiError(400, "Invalid payment signature.");
  }
};

const fetchCapturedPayment = async ({ razorpay, paymentId, expectedOrderId, expectedAmount }) => {
  const payment = await razorpay.payments.fetch(paymentId);

  if (payment.order_id !== expectedOrderId) {
    throw new ApiError(400, "Payment does not belong to this Razorpay order.");
  }

  if (Number(payment.amount) !== Number(expectedAmount)) {
    throw new ApiError(400, "Paid amount does not match the checkout amount.");
  }

  if (payment.currency !== CHECKOUT_CURRENCY) {
    throw new ApiError(400, "Payment currency mismatch.");
  }

  if (payment.status === "authorized" && process.env.RAZORPAY_CAPTURE_AUTHORIZED_PAYMENTS === "true") {
    return razorpay.payments.capture(paymentId, expectedAmount, CHECKOUT_CURRENCY);
  }

  if (payment.status !== "captured" && payment.captured !== true) {
    throw new ApiError(400, "Payment is not captured yet. Please enable automatic capture in Razorpay.");
  }

  return payment;
};

const initiateRazorpayRefund = async (paymentId, amountInPaisa) => {
  try {
    return await getRazorpayClient().payments.refund(paymentId, {
      amount: amountInPaisa,
      speed: "normal",
      notes: { reason: "Order cancelled by customer or admin." },
    });
  } catch (error) {
    if (error.error?.description?.includes("already been fully refunded")) {
      return {
        status: "processed",
        id: "already_refunded",
        amount: amountInPaisa,
      };
    }

    throw new Error(`Refund failed: ${error.error ? JSON.stringify(error.error) : error.message}`);
  }
};

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { addressId, couponCode, pointsToRedeem, serviceInputs } = req.body;
  const razorpay = getRazorpayClient();

  const { checkout } = await buildCheckoutQuote({
    userId: req.user._id,
    addressId,
    couponCode,
    pointsToRedeem,
    serviceInputs,
    paymentMethod: "Razorpay",
  });

  if (checkout.totalPrice <= 0) {
    throw new ApiError(400, "Online payment amount must be greater than zero.");
  }

  const amount = toRazorpayAmount(checkout.totalPrice);
  const receipt = createReceipt();

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: CHECKOUT_CURRENCY,
    receipt,
    notes: {
      userId: req.user._id.toString(),
      addressId: checkout.addressId || "",
    },
  });

  await PaymentSession.create({
    user: req.user._id,
    razorpayOrderId: razorpayOrder.id,
    receipt,
    amount,
    currency: CHECKOUT_CURRENCY,
    status: "created",
    checkout,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        receipt,
        checkout,
      },
      "Razorpay order created successfully."
    )
  );
});

export const verifyPaymentAndPlaceOrder = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing required payment details.");
  }

  const existingOrder = await Order.findOne({
    $or: [{ paymentId: razorpay_payment_id }, { razorpayOrderId: razorpay_order_id }],
    user: req.user._id,
  });

  if (existingOrder) {
    return res
      .status(200)
      .json(new ApiResponse(200, { order: existingOrder }, "Payment already verified."));
  }

  const paymentSession = await PaymentSession.findOne({
    razorpayOrderId: razorpay_order_id,
    user: req.user._id,
    status: "created",
  });

  if (!paymentSession) {
    throw new ApiError(404, "Payment session not found or already processed.");
  }

  verifyRazorpaySignature({
    razorpayOrderId: paymentSession.razorpayOrderId,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  const razorpay = getRazorpayClient();
  let capturedPayment;
  const [razorpayOrder, fetchedPayment] = await Promise.all([
    razorpay.orders.fetch(paymentSession.razorpayOrderId),
    fetchCapturedPayment({
      razorpay,
      paymentId: razorpay_payment_id,
      expectedOrderId: paymentSession.razorpayOrderId,
      expectedAmount: paymentSession.amount,
    }),
  ]);
  capturedPayment = fetchedPayment;

  if (Number(razorpayOrder.amount) !== Number(paymentSession.amount)) {
    throw new ApiError(400, "Razorpay order amount mismatch.");
  }

  let newOrder;
  let orderOwner;
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const duplicateOrder = await Order.findOne({
      $or: [{ paymentId: razorpay_payment_id }, { razorpayOrderId: razorpay_order_id }],
      user: req.user._id,
    }).session(dbSession);

    if (duplicateOrder) {
      await dbSession.commitTransaction();
      return res
        .status(200)
        .json(new ApiResponse(200, { order: duplicateOrder }, "Payment already verified."));
    }

    const freshPaymentSession = await PaymentSession.findById(paymentSession._id).session(dbSession);
    if (!freshPaymentSession || freshPaymentSession.status !== "created") {
      throw new ApiError(409, "Payment session has already been processed.");
    }

    const stockUpdateOperations = await buildStockUpdateOperations(
      freshPaymentSession.checkout.orderItems,
      dbSession
    );

    orderOwner = await User.findById(req.user._id).session(dbSession);
    if (!orderOwner) {
      throw new ApiError(404, "User not found.");
    }

    await applyWalletAdjustments({
      user: orderOwner,
      checkout: freshPaymentSession.checkout,
      session: dbSession,
    });
    removePurchasedItemsFromCart(orderOwner, freshPaymentSession.checkout.orderItems);

    const [createdOrder] = await Order.create(
      [
        {
          user: req.user._id,
          orderItems: freshPaymentSession.checkout.orderItems,
          shippingAddress: freshPaymentSession.checkout.shippingAddress,
          itemsPrice: freshPaymentSession.checkout.itemsPrice,
          shippingPrice: freshPaymentSession.checkout.shippingPrice,
          taxPrice: freshPaymentSession.checkout.taxPrice,
          discountAmount: freshPaymentSession.checkout.discountAmount,
          couponCode: freshPaymentSession.checkout.couponCode,
          totalPrice: freshPaymentSession.checkout.totalPrice,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          paymentMethod: "Razorpay",
          paymentStatus: "paid",
          paidAt: new Date((capturedPayment.created_at || Date.now() / 1000) * 1000),
          orderStatus: freshPaymentSession.checkout.containsPhysicalProduct ? "Paid" : "Processing",
        },
      ],
      { session: dbSession }
    );

    if (stockUpdateOperations.length > 0) {
      await Product.bulkWrite(stockUpdateOperations, { session: dbSession });
    }

    await orderOwner.save({ session: dbSession, validateBeforeSave: false });

    freshPaymentSession.status = "paid";
    freshPaymentSession.razorpayPaymentId = razorpay_payment_id;
    freshPaymentSession.expiresAt = undefined;
    await freshPaymentSession.save({ session: dbSession, validateBeforeSave: false });

    newOrder = createdOrder;
    await dbSession.commitTransaction();
  } catch (error) {
    await dbSession.abortTransaction();
    if (capturedPayment) {
      try {
        const orderAfterFailure = await Order.findOne({
          $or: [{ paymentId: razorpay_payment_id }, { razorpayOrderId: razorpay_order_id }],
          user: req.user._id,
        });

        if (!orderAfterFailure) {
          await initiateRazorpayRefund(razorpay_payment_id, Number(paymentSession.amount));
          await PaymentSession.findByIdAndUpdate(paymentSession._id, {
            $set: {
              status: "failed",
              razorpayPaymentId: razorpay_payment_id,
              failureReason: error.message,
            },
            $unset: { expiresAt: "" },
          });
        }
      } catch (refundError) {
        console.error("Automatic refund after order placement failure failed:", refundError.message);
      }
    }
    throw error;
  } finally {
    dbSession.endSession();
  }

  let responseOrder = newOrder;
  if (newOrder.shippingAddress) {
    responseOrder = await createShiprocketOrder(newOrder, orderOwner.email);
  }

  const containsService = newOrder.orderItems.some((item) => item.product_type === "service");
  if (containsService) {
    sendServiceNotificationToAdmin(newOrder).catch((error) =>
      console.error("Failed to send admin service notification:", error)
    );
  }

  if (orderOwner.email) {
    sendOrderConfirmationEmail(orderOwner.email, responseOrder || newOrder).catch((error) =>
      console.error("Failed to send order confirmation email:", error)
    );
  }

  res
    .status(201)
    .json(new ApiResponse(201, { order: responseOrder || newOrder }, "Payment verified and order placed."));
});

export const placeCodOrder = asyncHandler(async (req, res) => {
  const { addressId, couponCode, pointsToRedeem } = req.body;
  let newOrder;
  let orderOwner;

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const { user, checkout } = await buildCheckoutQuote({
      userId: req.user._id,
      addressId,
      couponCode,
      pointsToRedeem,
      paymentMethod: "COD",
      session: dbSession,
    });

    const stockUpdates = await buildStockUpdateOperations(checkout.orderItems, dbSession);
    await applyWalletAdjustments({ user, checkout, session: dbSession });
    removePurchasedItemsFromCart(user, checkout.orderItems);

    const [createdOrder] = await Order.create(
      [
        {
          user: req.user._id,
          orderItems: checkout.orderItems,
          shippingAddress: checkout.shippingAddress,
          itemsPrice: checkout.itemsPrice,
          shippingPrice: checkout.shippingPrice,
          taxPrice: checkout.taxPrice,
          discountAmount: checkout.discountAmount,
          couponCode: checkout.couponCode,
          totalPrice: checkout.totalPrice,
          paymentMethod: "COD",
          paymentStatus: "pending",
          orderStatus: "Processing",
        },
      ],
      { session: dbSession }
    );

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, { session: dbSession });
    }

    await user.save({ session: dbSession, validateBeforeSave: false });

    newOrder = createdOrder;
    orderOwner = user;
    await dbSession.commitTransaction();
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }

  const responseOrder = await createShiprocketOrder(newOrder, orderOwner.email);

  if (orderOwner.email) {
    sendOrderConfirmationEmail(orderOwner.email, responseOrder || newOrder).catch((error) =>
      console.error("Failed to send order confirmation email:", error)
    );
  }

  res
    .status(201)
    .json(new ApiResponse(201, { order: responseOrder || newOrder }, "COD order placed successfully."));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID format.");
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();
  let updatedOrder;

  try {
    const order = await Order.findById(orderId).session(dbSession);
    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "You are not authorized to cancel this order.");
    }

    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      throw new ApiError(400, `Order is already ${order.orderStatus.toLowerCase()} and cannot be cancelled.`);
    }

    if (order.paymentMethod === "Razorpay" && order.paymentId && order.paymentStatus !== "refunded") {
      const refund = await initiateRazorpayRefund(order.paymentId, Math.round(order.totalPrice * 100));
      order.refundDetails = {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status || "processed",
        createdAt: new Date(),
      };
      order.paymentStatus = "refunded";
    }

    const stockRestoreOps = order.orderItems
      .filter((item) => item.product_type !== "service")
      .map((item) => {
        if (item.sku_variant) {
          return {
            updateOne: {
              filter: { _id: item.product_id, "variants.sku": item.sku_variant },
              update: { $inc: { "variants.$.stock_quantity": item.quantity } },
            },
          };
        }

        return {
          updateOne: {
            filter: { _id: item.product_id },
            update: { $inc: { stock_quantity: item.quantity } },
          },
        };
      });

    if (stockRestoreOps.length > 0) {
      await Product.bulkWrite(stockRestoreOps, { session: dbSession });
    }

    order.orderStatus = "Cancelled";
    order.cancellationDetails = {
      cancelledBy: isAdmin ? "Admin" : "User",
      reason: req.body.reason || "Cancelled by request",
      cancellationDate: new Date(),
    };

    updatedOrder = await order.save({ session: dbSession });
    await dbSession.commitTransaction();
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }

  if (updatedOrder?.shipmentDetails?.shiprocketOrderId) {
    try {
      await cancelShiprocketOrder(updatedOrder.shipmentDetails.shiprocketOrderId);
      updatedOrder = await Order.findByIdAndUpdate(
        updatedOrder._id,
        {
          $set: {
            "shipmentDetails.status": "Cancelled",
            "shipmentDetails.lastError": null,
          },
        },
        { new: true }
      );
    } catch (error) {
      updatedOrder = await Order.findByIdAndUpdate(
        updatedOrder._id,
        {
          $set: {
            "shipmentDetails.lastError": error.message,
          },
        },
        { new: true }
      );
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order has been cancelled successfully."));
});
