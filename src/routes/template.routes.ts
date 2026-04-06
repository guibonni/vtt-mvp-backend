import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";

import {
  create,
  get,
  list,
  remove,
  update,
} from "../controllers/template.controller";

const router = Router();

router.get("/", authMiddleware, list);

router.get("/:templateId", authMiddleware, get);

router.post("/", authMiddleware, create);

router.put("/:templateId", authMiddleware, update);

router.delete("/:templateId", authMiddleware, remove);

export default router;
