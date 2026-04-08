import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"
import { sendErrorResponse } from "../utils/api-error"

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
    return sendErrorResponse(
      res,
      401,
      "auth.middleware.missingAuthorizationHeader",
      new Error("Authorization header was not provided"),
    )
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return sendErrorResponse(
      res,
      401,
      "auth.middleware.malformedAuthorizationHeader",
      new Error("Authorization header does not contain a bearer token"),
    )
  }

  try {
    const decoded = verifyToken(token) as any
    req.userId = decoded.userId
    next()
  } catch (error) {
    return sendErrorResponse(
      res,
      401,
      "auth.middleware.invalidToken",
      error,
    )
  }
}
