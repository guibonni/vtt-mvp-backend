import { Response, NextFunction } from "express"
import { prisma } from "../config/prisma"
import { AuthRequest } from "./auth.middleware"
import { sendErrorResponse } from "../utils/api-error"

export async function sessionGuard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  try {

    const sessionId = req.params.sessionId || req.body.sessionId
    const userId = req.userId

    if (!sessionId) {
      return sendErrorResponse(
        res,
        400,
        "session.middleware.missingSessionId",
        new Error("Session identifier was not provided"),
      )
    }

    const participant = await prisma.sessionParticipant.findUnique({
      where: {
        userId_sessionId: {
          userId: userId!,
          sessionId
        }
      }
    })

    if (!participant) {
      return sendErrorResponse(
        res,
        403,
        "session.middleware.userNotParticipant",
        new Error(`User ${userId} is not a participant of session ${sessionId}`),
      )
    }

    next()

  } catch (error) {

    return sendErrorResponse(
      res,
      500,
      "session.middleware.validationFailed",
      error,
    )

  }
}
