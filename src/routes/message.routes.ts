import { Router } from "express"

import { authMiddleware } from "../middleware/auth.middleware"
import { sessionGuard } from "../middleware/session.middleware"

import {
  sendMessage,
  listMessages
} from "../controllers/message.controller"

const router = Router()

router.get(
  "/:sessionId/messages",
  authMiddleware,
  sessionGuard,
  listMessages
)

router.post(
  "/:sessionId/messages",
  authMiddleware,
  sessionGuard,
  sendMessage
)

export default router