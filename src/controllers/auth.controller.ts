import { Request, Response } from "express"
import { registerUser, loginUser } from "../services/auth.service"
import { sendErrorResponse } from "../utils/api-error"

export async function register(req: Request, res: Response) {
  try {

    const { name, email, password } = req.body

    const result = await registerUser(name, email, password)

    res.json(result)

  } catch (error: any) {
    sendErrorResponse(res, 400, "auth.controller.register", error)
  }
}

export async function login(req: Request, res: Response) {
  try {

    const { email, password } = req.body

    const result = await loginUser(email, password)

    res.json(result)

  } catch (error: any) {
    sendErrorResponse(res, 400, "auth.controller.login", error)
  }
}
