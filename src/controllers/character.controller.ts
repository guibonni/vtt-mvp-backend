import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  createCharacter,
  getSessionCharacters,
  updateCharacter,
  deleteCharacter,
} from "../services/character.service";
import { getRequiredParam } from "../utils/parameter-validation";

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name, template, data } = req.body;
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    const character = await createCharacter(name, template, data, req.userId!, sessionId);

    res.json(character);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    const characters = await getSessionCharacters(sessionId, req.userId!);

    res.json(characters);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const characterId = getRequiredParam(req.params.characterId, "characterId");
    const sessionId = getRequiredParam(req.params.sessionId, "sessionId");

    await deleteCharacter(characterId, sessionId);

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
