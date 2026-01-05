
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserActive,
  getUserVocabularyLists,
  getUserVocabularyListDetail,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.get("/profile", getUserStats);
router.put("/profile", updateUser);

// Route cho Admin
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.get("/:id/vocabulary-lists", authorize("admin"), getUserVocabularyLists);
router.get("/:id/vocabulary-lists/:listId", authorize("admin"), getUserVocabularyListDetail);
router.delete("/:id", authorize("admin"), deleteUser);
router.put("/:id/toggle-active", authorize("admin"), toggleUserActive);

export default router;

