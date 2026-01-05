import express from "express";
import { createListening, generateContent, getListeningHistory, getAdminListeningStats, getAllListeningHistory, deleteListeningHistory, cleanupTTS } from "../controllers/listeningController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Route cho người dùng
router.post("/create", protect, createListening);
router.post("/generate", protect, generateContent);
router.delete("/cleanup", protect, cleanupTTS);
router.get("/history", protect, getListeningHistory);

// Route cho Admin
router.get("/admin/stats", protect, isAdmin, getAdminListeningStats);
router.get("/admin/history", protect, isAdmin, getAllListeningHistory);
router.delete("/admin/history/:id", protect, isAdmin, deleteListeningHistory);

export default router;
