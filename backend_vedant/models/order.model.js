import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  type: { type: String, default: "Home" },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [
      {
        product_name: { type: String, required: true },
        product_type: {
          type: String,
          enum: ["product", "service"],
          default: "product",
        },
        quantity: { type: Number, required: true },
        price_per_item: { type: Number, required: true },
        image: { type: String, required: true },
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sku_variant: { type: String },
        size: { type: String },
        color: { type: String },
        userInput: {
          type: String,
          trim: true,
        },
      },
    ],
    shippingAddress: {
      type: shippingAddressSchema,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Paid",
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "paid",
    },
    paidAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay"],
      required: true,
      default: "Razorpay",
    },
    shipmentDetails: {
      shiprocketChannelOrderId: { type: String },
      shiprocketShipmentId: { type: String },
      shiprocketOrderId: { type: String },
      trackingNumber: { type: String },
      courier: { type: String },
      trackingUrl: { type: String },
      status: { type: String },
      pickupStatus: { type: String },
      lastError: { type: String },
      awbAssignedAt: { type: Date },
      pickupScheduledAt: { type: Date },
      webhookEvent: { type: String },
      webhookStatus: { type: String },
      webhookReceivedAt: { type: Date },
    },
    refundDetails: {
      refundId: String,
      amount: Number,
      status: String,
      createdAt: Date,
    },
    cancellationDetails: {
      cancelledBy: {
        type: String,
        enum: ["User", "Admin"],
      },
      reason: { type: String },
      cancellationDate: { type: Date },
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentId: 1 }, { sparse: true });
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });
orderSchema.index({ "shipmentDetails.shiprocketChannelOrderId": 1 }, { sparse: true });
orderSchema.index({ "shipmentDetails.shiprocketOrderId": 1 }, { sparse: true });
orderSchema.index({ "shipmentDetails.shiprocketShipmentId": 1 }, { sparse: true });

export const Order = mongoose.model("Order", orderSchema);
