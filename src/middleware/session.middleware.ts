import { Response, NextFunction } from "express"
import { prisma } from "../config/prisma"
import { AuthRequest } from "./auth.middleware"

export async function sessionGuard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  try {

    const sessionId = req.params.sessionId || req.body.sessionId
    const userId = req.userId

    if (!sessionId) {
      return res.status(400).json({
        message: "SessionId não informado"
      })
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
      return res.status(403).json({
        message: "Usuário não participa dessa sessão"
      })
    }

    next()

  } catch (error) {

    res.status(500).json({
      message: "Erro ao validar sessão"
    })

  }
}