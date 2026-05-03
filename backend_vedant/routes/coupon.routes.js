import { Router } from "express";
import {
    createCoupon,
    getAllCoupons,
    getCouponByCode,
    updateCoupon,
    deleteCoupon
} from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

// --- Secure all coupon routes ---
// This middleware will run for all routes defined below
// router.use(verifyJWT);

// --- Routes for creating and fetching all coupons ---
router.route("/")
    .post(authMiddleware, adminMiddleware, createCoupon)
    .get(authMiddleware, adminMiddleware, getAllCoupons);

// --- Routes for updating and deleting a specific coupon ---
router.route("/:couponId")
    .patch(authMiddleware, adminMiddleware, updateCoupon) // PATCH is suitable for partial updates
    .delete(authMiddleware, adminMiddleware, deleteCoupon);

router.route('/code/:code').get(getCouponByCode);

export default router;
