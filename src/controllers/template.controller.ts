import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  createTemplate,
  deleteTemplate,
  getTemplateById,
  listTemplates,
  updateTemplate,
} from "../services/template.service";
import { getRequiredParam } from "../utils/parameter-validation";

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name, data } = req.body;

    const template = await createTemplate(name, data, req.userId!);

    res.json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const name = typeof req.query.name === "string" ? req.query.name : undefined;
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined;

    const templates = await listTemplates(name, userId);

    res.json(templates);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const templateId = getRequiredParam(req.params.templateId, "templateId");

    const template = await getTemplateById(templateId);

    res.json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const templateId = getRequiredParam(req.params.templateId, "templateId");
    const { name, data } = req.body;

    const template = await updateTemplate(
      templateId,
      name,
      data,
      req.userId!,
    );

    res.json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const templateId = getRequiredParam(req.params.templateId, "templateId");

    await deleteTemplate(templateId, req.userId!);

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
