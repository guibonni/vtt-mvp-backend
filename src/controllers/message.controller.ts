import { Response } from "express"
import { AuthRequest } from "../middleware/auth.middleware"

import {
  createMessage,
  getSessionMessages
} from "../services/message.service"

import { io } from "../server"
import { getRequiredParam } from "../utils/parameter-validation";
import { sendErrorResponse } from "../utils/api-error";

export async function sendMessage(req: AuthRequest, res: Response) {

  try {

    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");
    const { content, type, diceData } = req.body

    const message = await createMessage(
      content,
      type,
      diceData,
      req.userId!,
      sessionId
    )

    io.to(sessionId).emit("new-message", message)

    res.json(message)

  } catch (error: any) {
    sendErrorResponse(res, 400, "message.controller.sendMessage", error)
  }
}

export async function listMessages(req: AuthRequest, res: Response) {

  try {

    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    const messages = await getSessionMessages(sessionId)

    res.json(messages)

  } catch (error: any) {
    sendErrorResponse(res, 400, "message.controller.listMessages", error)
  }
}
