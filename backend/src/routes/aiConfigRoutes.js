import express from "express";
import { getAIConfigs, updateAIConfig } from "../controllers/aiConfigController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAIConfigs);
router.put("/", updateAIConfig);

export default router;
