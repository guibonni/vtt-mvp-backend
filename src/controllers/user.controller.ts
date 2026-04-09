import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../services/user.service";
import { sendErrorResponse } from "../utils/api-error";

export async function getPreferences(req: AuthRequest, res: Response) {
  try {
    const preferences = await getUserPreferences(req.userId!);

    res.json(preferences);
  } catch (error) {
    sendErrorResponse(res, 400, "user.controller.getPreferences", error);
  }
}

export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    const { preferences } = req.body;

    const result = await updateUserPreferences(req.userId!, preferences);

    res.json(result);
  } catch (error) {
    sendErrorResponse(res, 400, "user.controller.updatePreferences", error);
  }
}
