import express from "express";
import {
    submitFeedback,
    getMyFeedbacks,
    getAllFeedbacks,
    updateFeedback,
    deleteFeedback,
    getFeedbackStats,
    getFeedbackStatus,
} from "../controllers/feedbackController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Route cho người dùng
router.post("/", protect, submitFeedback);
router.get("/my", protect, getMyFeedbacks);
router.get("/status", protect, getFeedbackStatus);

// Route cho Admin
router.get("/stats", protect, isAdmin, getFeedbackStats);
router.get("/", protect, isAdmin, getAllFeedbacks);
router.put("/:id", protect, isAdmin, updateFeedback);
router.delete("/:id", protect, isAdmin, deleteFeedback);

export default router;
