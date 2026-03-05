import { Router } from "express"

import { authMiddleware } from "../middleware/auth.middleware"
import { sessionGuard } from "../middleware/session.middleware"

import {
  create,
  list,
  update,
  remove
} from "../controllers/character.controller"

const router = Router()

router.get(
  "/:sessionId/characters",
  authMiddleware,
  sessionGuard,
  list
)

router.post(
  "/:sessionId/characters",
  authMiddleware,
  sessionGuard,
  create
)

router.put(
  "/:sessionId/characters/:characterId",
  authMiddleware,
  sessionGuard,
  update
)

router.delete(
  "/:sessionId/characters/:characterId",
  authMiddleware,
  sessionGuard,
  remove
)

export default router