import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getPreferences,
  updatePreferences,
} from "../controllers/user.controller";

const router = Router();

router.get("/preferences", authMiddleware, getPreferences);
router.put("/preferences", authMiddleware, updatePreferences);

export default router;
