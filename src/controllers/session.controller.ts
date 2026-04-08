import { Response } from "express"
import { AuthRequest } from "../middleware/auth.middleware"

import {
  createSession,
  listSessions,
  joinSession,
  getSession
} from "../services/session.service"
import { sendErrorResponse } from "../utils/api-error"
import { getRequiredParam } from "../utils/parameter-validation"

export async function create(req: AuthRequest, res: Response) {

  try {

    const { name, password } = req.body

    const session = await createSession(
      name,
      password,
      req.userId!
    )

    res.json(session)

  } catch (error: any) {
    sendErrorResponse(res, 400, "session.controller.create", error)
  }
}

export async function list(req: AuthRequest, res: Response) {

  try {

    const sessions = await listSessions(req.userId!)

    res.json(sessions)

  } catch (error: any) {
    sendErrorResponse(res, 400, "session.controller.list", error)
  }
}

export async function join(req: AuthRequest, res: Response) {

  try {

    const { sessionId, password } = req.body

    const session = await joinSession(sessionId, password, req.userId!)

    res.json(session)

  } catch (error: any) {
    sendErrorResponse(res, 400, "session.controller.join", error)
  }
}

export async function get(req: AuthRequest, res: Response) {

  try {

    const sessionId = getRequiredParam(req.params.sessionId, "sessionId")
  
    const session = await getSession(sessionId)
  
    res.json(session)

  } catch (error: any) {
    sendErrorResponse(res, 400, "session.controller.get", error)
  }

}
