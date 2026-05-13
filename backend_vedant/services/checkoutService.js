import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import Product from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { WalletConfig } from "../models/walletConfig.model.js";
import { TaxConfig } from "../models/taxConfig.model.js";
import { getShiprocketShippingRate } from "./shippingService.js";

export const CHECKOUT_CURRENCY = "INR";
const MIN_SHIPMENT_WEIGHT_KG = 0.5;
const DEFAULT_DIMENSION_CM = 10;

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

const toPositiveNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const getEffectiveItemPrice = (product, skuVariant, cartPrice) => {
  if (skuVariant) {
    const variant = product.variants?.find((entry) => entry.sku === skuVariant);
    if (!variant) {
      throw new ApiError(400, `Selected variant for "${product.name}" is no longer available.`);
    }

    return roundCurrency(variant.sale_price ?? variant.price ?? cartPrice);
  }

  return roundCurrency(product.sale_price ?? product.price ?? cartPrice);
};

const getVariant = (product, skuVariant) => {
  if (!skuVariant) return null;
  return product.variants?.find((entry) => entry.sku === skuVariant) || null;
};

const getPackageValues = (product, skuVariant, quantity) => {
  const variant = getVariant(product, skuVariant);
  const source = variant || product;

  return {
    weight: toPositiveNumber(source.weight, 0.1) * quantity,
    length: toPositiveNumber(source.length, DEFAULT_DIMENSION_CM),
    breadth: toPositiveNumber(source.breadth, DEFAULT_DIMENSION_CM),
    height: toPositiveNumber(source.height, DEFAULT_DIMENSION_CM),
  };
};

export const loadUserCheckoutCart = async (userId, session) => {
  const query = User.findById(userId).populate({
    path: "cart.product",
    select:
      "name price sale_price images stock_quantity variants type weight length breadth height minQuantity userInputInstructions",
  });

  if (session) {
    query.session(session);
  }

  const user = await query;
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!user.cart?.length) {
    throw new ApiError(400, "Your cart is empty.");
  }

  return user;
};

export const buildCheckoutQuote = async ({
  userId,
  addressId,
  couponCode,
  pointsToRedeem = 0,
  paymentMethod = "Razorpay",
  serviceInputs,
  session,
}) => {
  const user = await loadUserCheckoutCart(userId, session);
  const normalizedPaymentMethod = paymentMethod === "COD" ? "COD" : "Razorpay";

  let containsPhysicalProduct = false;
  let containsService = false;
  let itemsPrice = 0;
  let totalWeight = 0;
  let maxLength = 0;
  let maxBreadth = 0;
  let maxHeight = 0;
  const orderItems = [];

  for (const item of user.cart) {
    const product = item.product;
    if (!product) {
      throw new ApiError(404, "A product in your cart is no longer available.");
    }

    const productType = product.type === "service" ? "service" : "product";
    containsPhysicalProduct = containsPhysicalProduct || productType === "product";
    containsService = containsService || productType === "service";

    if (normalizedPaymentMethod === "COD" && productType === "service") {
      throw new ApiError(400, "COD is not available for service orders.");
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, `Invalid quantity for "${product.name}".`);
    }

    const minQuantity = Number(product.minQuantity || 1);
    if (quantity < minQuantity) {
      throw new ApiError(400, `The minimum order quantity for "${product.name}" is ${minQuantity}.`);
    }

    const variant = getVariant(product, item.sku_variant);
    if (item.sku_variant && !variant) {
      throw new ApiError(400, `Selected variant for "${product.name}" is no longer available.`);
    }

    if (productType === "product") {
      const availableStock = item.sku_variant ? variant?.stock_quantity : product.stock_quantity;
      if (Number(availableStock) < quantity) {
        throw new ApiError(400, `Not enough stock for "${product.name}".`);
      }

      const packageValues = getPackageValues(product, item.sku_variant, quantity);
      totalWeight += packageValues.weight;
      maxLength = Math.max(maxLength, packageValues.length);
      maxBreadth = Math.max(maxBreadth, packageValues.breadth);
      maxHeight = Math.max(maxHeight, packageValues.height);
    }

    const price = getEffectiveItemPrice(product, item.sku_variant, item.price);
    itemsPrice = roundCurrency(itemsPrice + price * quantity);

    let userInput;
    if (productType === "service") {
      userInput = serviceInputs?.[item._id.toString()]?.trim();
      if (!userInput) {
        throw new ApiError(400, `Please provide required details for "${product.name}".`);
      }
    }

    orderItems.push({
      product_id: product._id,
      product_name: product.name,
      product_type: productType,
      quantity,
      price_per_item: price,
      image: item.image || product.images?.[0] || "/placeholder.svg",
      sku_variant: item.sku_variant,
      size: variant?.size,
      color: variant?.color,
      userInput,
    });
  }

  let selectedAddress;
  let shippingPrice = 0;
  let shippingQuote = null;

  if (containsPhysicalProduct) {
    if (!addressId) {
      throw new ApiError(400, "Shipping address is required for physical products.");
    }

    selectedAddress = user.addresses.id(addressId);
    if (!selectedAddress) {
      throw new ApiError(404, "Selected shipping address not found.");
    }

    shippingQuote = await getShiprocketShippingRate({
      deliveryPostcode: selectedAddress.postalCode,
      weightInKg: Math.max(roundCurrency(totalWeight), MIN_SHIPMENT_WEIGHT_KG),
      cod: normalizedPaymentMethod === "COD",
    });

    shippingPrice = roundCurrency(shippingQuote.shippingPrice);
  }

  let couponDiscount = 0;
  let validatedCouponCode = null;
  if (couponCode) {
    const couponQuery = Coupon.findOne({
      code: String(couponCode).trim().toUpperCase(),
      status: "active",
    });

    if (session) couponQuery.session(session);
    const coupon = await couponQuery;

    if (!coupon) {
      throw new ApiError(400, "Invalid or inactive coupon code.");
    }

    couponDiscount = roundCurrency((itemsPrice * Number(coupon.discountPercentage || 0)) / 100);
    validatedCouponCode = coupon.code;
  }

  const discountableAmount = Math.max(0, roundCurrency(itemsPrice - couponDiscount));
  const pointsToApply = Number(pointsToRedeem || 0);
  if (!Number.isInteger(pointsToApply) || pointsToApply < 0) {
    throw new ApiError(400, "Invalid wallet points value.");
  }

  let walletDiscount = 0;
  let rupeesPerPoint = 1;
  let appliedPoints = 0;
  if (pointsToApply > 0) {
    const walletConfigQuery = WalletConfig.findOne();
    if (session) walletConfigQuery.session(session);
    const walletConfig = await walletConfigQuery;
    rupeesPerPoint = toPositiveNumber(walletConfig?.rupeesPerPoint, 1);

    const maxRedeemablePoints = Math.floor(discountableAmount / rupeesPerPoint);
    appliedPoints = Math.min(pointsToApply, Number(user.wallet || 0), maxRedeemablePoints);
    walletDiscount = roundCurrency(appliedPoints * rupeesPerPoint);
  }

  const taxConfigQuery = TaxConfig.findOne().lean();
  if (session) taxConfigQuery.session(session);
  await taxConfigQuery;

  const discountAmount = roundCurrency(couponDiscount + walletDiscount);
  const taxableAmount = Math.max(0, roundCurrency(itemsPrice - discountAmount));
  const taxPrice = 0;
  const totalPrice = roundCurrency(taxableAmount + shippingPrice + taxPrice);

  return {
    user,
    checkout: {
      addressId: selectedAddress?._id?.toString(),
      shippingAddress: selectedAddress?.toObject(),
      orderItems,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      couponCode: validatedCouponCode,
      totalPrice,
      pointsToRedeem: appliedPoints,
      paymentMethod: normalizedPaymentMethod,
      containsPhysicalProduct,
      containsService,
      package: {
        weight: Math.max(roundCurrency(totalWeight), containsPhysicalProduct ? MIN_SHIPMENT_WEIGHT_KG : 0),
        length: maxLength || DEFAULT_DIMENSION_CM,
        breadth: maxBreadth || DEFAULT_DIMENSION_CM,
        height: maxHeight || DEFAULT_DIMENSION_CM,
      },
      shippingQuote,
    },
  };
};

export const buildStockUpdateOperations = async (orderItems, session) => {
  const operations = [];

  for (const item of orderItems) {
    if (item.product_type !== "product") continue;

    const query = Product.findById(item.product_id).select("name stock_quantity variants type");
    if (session) query.session(session);
    const product = await query;

    if (!product || product.type === "service") {
      throw new ApiError(400, `Product "${item.product_name}" is no longer available.`);
    }

    if (item.sku_variant) {
      const variant = product.variants?.find((entry) => entry.sku === item.sku_variant);
      if (!variant || Number(variant.stock_quantity) < Number(item.quantity)) {
        throw new ApiError(400, `Not enough stock for "${item.product_name}".`);
      }

      operations.push({
        updateOne: {
          filter: { _id: product._id, "variants.sku": item.sku_variant },
          update: { $inc: { "variants.$.stock_quantity": -Number(item.quantity) } },
        },
      });
      continue;
    }

    if (Number(product.stock_quantity) < Number(item.quantity)) {
      throw new ApiError(400, `Not enough stock for "${item.product_name}".`);
    }

    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock_quantity: -Number(item.quantity) } },
      },
    });
  }

  return operations;
};

export const removePurchasedItemsFromCart = (user, orderItems) => {
  const purchasedKeys = new Set(
    orderItems.map((item) => `${item.product_id.toString()}::${item.sku_variant || ""}`)
  );

  user.cart = user.cart.filter((item) => {
    const key = `${item.product.toString()}::${item.sku_variant || ""}`;
    return !purchasedKeys.has(key);
  });
};

export const applyWalletAdjustments = async ({ user, checkout, session }) => {
  const pointsRedeemed = Number(checkout.pointsToRedeem || 0);
  if (pointsRedeemed > 0) {
    user.wallet = Math.max(0, Number(user.wallet || 0) - pointsRedeemed);
  }

  const walletConfigQuery = WalletConfig.findOne().lean();
  if (session) walletConfigQuery.session(session);
  const walletConfig = await walletConfigQuery;

  const sortedRules = [...(walletConfig?.rewardRules || [])].sort(
    (first, second) => Number(second.minSpend || 0) - Number(first.minSpend || 0)
  );
  const rewardRule = sortedRules.find(
    (rule) => Number(checkout.totalPrice || 0) >= Number(rule.minSpend || 0) - 5
  );

  if (rewardRule?.pointsAwarded) {
    user.wallet = Number(user.wallet || 0) + Number(rewardRule.pointsAwarded || 0);
  }
};

export const toRazorpayAmount = (amount) => Math.round(roundCurrency(amount) * 100);
