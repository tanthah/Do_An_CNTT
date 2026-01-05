import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createList,
  getLists,
  getListDetail,
  deleteList,
  addWordFromVietnamese,
  getRecentWords,
} from "../controllers/vocabController.js";

const router = express.Router();

router.use(protect);

router.get("/lists", getLists);
router.post("/lists", createList);
router.get("/lists/:id", getListDetail);
router.delete("/lists/:id", deleteList);
router.post("/lists/:id/words", addWordFromVietnamese);
router.get("/recent-words", getRecentWords);

export default router;


