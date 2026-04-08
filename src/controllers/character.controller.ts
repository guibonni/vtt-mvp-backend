import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  createCharacter,
  getSessionCharacters,
  updateCharacter,
  deleteCharacter,
} from "../services/character.service";
import { sendErrorResponse } from "../utils/api-error";
import { getRequiredParam } from "../utils/parameter-validation";

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name, templateId, data } = req.body;
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    const character = await createCharacter(name, templateId, data, req.userId!, sessionId);

    res.json(character);
  } catch (error: any) {
    sendErrorResponse(res, 400, "character.controller.create", error);
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    const characters = await getSessionCharacters(sessionId, req.userId!);

    res.json(characters);
  } catch (error: any) {
    sendErrorResponse(res, 400, "character.controller.list", error);
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const characterId = getRequiredParam(req.params.characterId, "characterId");
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");
    const { data } = req.body;

    const character = await updateCharacter(characterId, sessionId, data);

    res.json(character);
  } catch (error: any) {
    sendErrorResponse(res, 400, "character.controller.update", error);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const characterId = getRequiredParam(req.params.characterId, "characterId");
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    await deleteCharacter(characterId, sessionId);

    res.json({ success: true });
  } catch (error: any) {
    sendErrorResponse(res, 400, "character.controller.remove", error);
  }
}
