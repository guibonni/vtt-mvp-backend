import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

const {
  createTemplateMock,
  listTemplatesMock,
  getTemplateByIdMock,
  updateTemplateMock,
  deleteTemplateMock,
} = vi.hoisted(() => ({
  createTemplateMock: vi.fn(),
  listTemplatesMock: vi.fn(),
  getTemplateByIdMock: vi.fn(),
  updateTemplateMock: vi.fn(),
  deleteTemplateMock: vi.fn(),
}));

vi.mock("../services/template.service", () => ({
  createTemplate: createTemplateMock,
  listTemplates: listTemplatesMock,
  getTemplateById: getTemplateByIdMock,
  updateTemplate: updateTemplateMock,
  deleteTemplate: deleteTemplateMock,
}));

import { create, get, list, remove, update } from "./template.controller";

describe("template.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create returns the created template", async () => {
    const req = {
      body: { name: "Mage", data: { mana: 10 } },
      userId: "user-1",
    } as any;
    const res = createResponse();

    createTemplateMock.mockResolvedValue({ id: "template-1" });

    await create(req, res as any);

    expect(createTemplateMock).toHaveBeenCalledWith(
      "Mage",
      { mana: 10 },
      "user-1",
    );
    expect(res.json).toHaveBeenCalledWith({ id: "template-1" });
  });

  it("list returns templates with filters", async () => {
    const req = {
      query: { name: "mag", userId: "user-1" },
    } as any;
    const res = createResponse();

    listTemplatesMock.mockResolvedValue([{ id: "template-1" }]);

    await list(req, res as any);

    expect(listTemplatesMock).toHaveBeenCalledWith("mag", "user-1");
    expect(res.json).toHaveBeenCalledWith([{ id: "template-1" }]);
  });

  it("get returns the requested template", async () => {
    const req = {
      params: { templateId: "template-1" },
    } as any;
    const res = createResponse();

    getTemplateByIdMock.mockResolvedValue({ id: "template-1" });

    await get(req, res as any);

    expect(getTemplateByIdMock).toHaveBeenCalledWith("template-1");
    expect(res.json).toHaveBeenCalledWith({ id: "template-1" });
  });

  it("update returns the updated template", async () => {
    const req = {
      params: { templateId: "template-1" },
      body: { name: "Mage", data: { mana: 12 } },
      userId: "user-1",
    } as any;
    const res = createResponse();

    updateTemplateMock.mockResolvedValue({ id: "template-1" });

    await update(req, res as any);

    expect(updateTemplateMock).toHaveBeenCalledWith(
      "template-1",
      "Mage",
      { mana: 12 },
      "user-1",
    );
    expect(res.json).toHaveBeenCalledWith({ id: "template-1" });
  });

  it("remove returns success when deletion succeeds", async () => {
    const req = {
      params: { templateId: "template-1" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    deleteTemplateMock.mockResolvedValue(true);

    await remove(req, res as any);

    expect(deleteTemplateMock).toHaveBeenCalledWith("template-1", "user-1");
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("returns 400 when templateId param is missing", async () => {
    const req = {
      params: {},
      userId: "user-1",
    } as any;
    const res = createResponse();

    await get(req, res as any);

    expect(getTemplateByIdMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Parametro invalido: templateId",
    });
  });
});
