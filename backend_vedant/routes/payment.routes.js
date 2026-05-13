// your-project/backend/src/routes/payment.routes.js

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
  verifyPaymentAndPlaceOrder,
  cancelOrder,
  // getSingleOrderDetails,
} from "../controllers/payment.controller.js";

const router = Router();

router.route("/webhook").post(handleRazorpayWebhook);

router.use(authMiddleware);

// YEH HAI NAYA ROUTE
// router.route("/price-breakdown").post(getPriceBreakdown);

router.route("/create-order").post(createRazorpayOrder);

router.route("/verify").post(verifyPaymentAndPlaceOrder);

// router.route("/:orderId").get(getSingleOrderDetails);
router.route("/:orderId/cancel").post(cancelOrder); // patch ko post se badal diya gaya hai
export default router;
