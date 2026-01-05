import express from "express";
import {
  sendMessage,
  getChatHistory,
  getSession,
  deleteSession,
  explainWordPhrase,
  uploadChatFile,
  getAdminChatStats,
  getAllChatSessions,
  adminDeleteSession,
} from "../controllers/chatController.js";
import { protect, isAdmin } from "../middleware/auth.js";
import { checkEnglishRelated } from "../middleware/filter.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Tất cả các route đều được bảo vệ
router.use(protect);

router.post("/", checkEnglishRelated, sendMessage);
router.get("/history", getChatHistory);
router.get("/session/:id", getSession);
router.delete("/session/:id", deleteSession);
router.post("/explain", explainWordPhrase);
router.post("/upload", upload.single("file"), uploadChatFile);

// Các route cho Admin
router.get("/admin/stats", isAdmin, getAdminChatStats);
router.get("/admin/sessions", isAdmin, getAllChatSessions);
router.delete("/admin/session/:id", isAdmin, adminDeleteSession);

export default router;
