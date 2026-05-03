import { Router } from "express";
import {
    submitInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry
} from "../controllers/contact.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/").post(submitInquiry);



router.route("/admin").get(authMiddleware, adminMiddleware, getAllInquiries);

router.route("/admin/:inquiryId")
    .get(authMiddleware, adminMiddleware, getInquiryById)
    .put(authMiddleware, adminMiddleware, updateInquiry) 
    .delete(authMiddleware, adminMiddleware, deleteInquiry);

export default router;
