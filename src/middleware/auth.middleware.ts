import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"

export interface AuthRequest extends Request {
  userId?: string
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" })
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token inválido" })
  }

  try {
    const decoded = verifyToken(token) as any
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ message: "Token inválido" })
  }
}