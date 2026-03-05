import { Router } from "express"

import {
  create,
  list,
  join,
  get
} from "../controllers/session.controller"

import { authMiddleware } from "../middleware/auth.middleware"
import { sessionGuard } from "../middleware/session.middleware"

const router = Router()

router.get("/", authMiddleware, list)

router.post("/", authMiddleware, create)

router.post("/join", authMiddleware, join)

router.get("/:sessionId",
  authMiddleware,
  sessionGuard,
  get
)

export default router