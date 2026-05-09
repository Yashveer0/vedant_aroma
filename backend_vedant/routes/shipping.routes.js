import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    checkServiceability,
    handleShiprocketWebhook,
    shiprocketWebhookHealth,
    trackOrder,
} from "../controllers/shipping.controller.js";

const router = Router();

router.route("/webhook/status").get(shiprocketWebhookHealth).post(handleShiprocketWebhook);
router.route("/webhook/shiprocket").get(shiprocketWebhookHealth).post(handleShiprocketWebhook);

router.use(authMiddleware);

router.route("/serviceability").post(checkServiceability);
router.route("/track/:orderId").get(trackOrder);

export default router;
