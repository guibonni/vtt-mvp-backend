import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    template: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../config/prisma", () => ({
  prisma: prismaMock,
}));

import {
  createTemplate,
  deleteTemplate,
  getTemplateById,
  listTemplates,
  updateTemplate,
} from "./template.service";

describe("template.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a template", async () => {
    prismaMock.template.create.mockResolvedValue({ id: "template-1" });

    const result = await createTemplate("Mage", { mana: 10 }, "user-1");

    expect(prismaMock.template.create).toHaveBeenCalledWith({
      data: {
        name: "Mage",
        data: { mana: 10 },
        createdById: "user-1",
      },
      select: {
        id: true,
        name: true,
        data: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual({ id: "template-1" });
  });

  it("lists templates with filters", async () => {
    prismaMock.template.findMany.mockResolvedValue([{ id: "template-1" }]);

    const result = await listTemplates("mag", "user-1");

    expect(prismaMock.template.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "mag",
          mode: "insensitive",
        },
        createdById: "user-1",
      },
      select: {
        id: true,
        name: true,
        data: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual([{ id: "template-1" }]);
  });

  it("lists templates without filters", async () => {
    await listTemplates();

    expect(prismaMock.template.findMany).toHaveBeenCalledWith({
      where: {},
      select: {
        id: true,
        name: true,
        data: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it("returns the template by id", async () => {
    prismaMock.template.findUnique.mockResolvedValue({ id: "template-1" });

    const result = await getTemplateById("template-1");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: { id: "template-1" },
      select: {
        id: true,
        name: true,
        data: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual({ id: "template-1" });
  });

  it("throws when template is not found by id", async () => {
    prismaMock.template.findUnique.mockResolvedValue(null);

    await expect(getTemplateById("template-1")).rejects.toThrow(
      "Template nÃ£o encontrado",
    );
  });

  it("updates a template owned by the user", async () => {
    prismaMock.template.findUnique.mockResolvedValue({ createdById: "user-1" });
    prismaMock.template.update.mockResolvedValue({ id: "template-1" });

    const result = await updateTemplate(
      "template-1",
      "Mage",
      { mana: 12 },
      "user-1",
    );

    expect(prismaMock.template.update).toHaveBeenCalledWith({
      where: { id: "template-1" },
      data: {
        name: "Mage",
        data: { mana: 12 },
      },
      select: {
        id: true,
        name: true,
        data: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual({ id: "template-1" });
  });

  it("throws when updating a missing template", async () => {
    prismaMock.template.findUnique.mockResolvedValue(null);

    await expect(
      updateTemplate("template-1", "Mage", { mana: 12 }, "user-1"),
    ).rejects.toThrow("Template nÃ£o encontrado");
  });

  it("throws when updating a template owned by another user", async () => {
    prismaMock.template.findUnique.mockResolvedValue({ createdById: "user-2" });

    await expect(
      updateTemplate("template-1", "Mage", { mana: 12 }, "user-1"),
    ).rejects.toThrow("UsuÃ¡rio nÃ£o pode alterar este template");
  });

  it("deletes a template owned by the user", async () => {
    prismaMock.template.findUnique.mockResolvedValue({ createdById: "user-1" });
    prismaMock.template.delete.mockResolvedValue({ id: "template-1" });

    const result = await deleteTemplate("template-1", "user-1");

    expect(prismaMock.template.delete).toHaveBeenCalledWith({
      where: { id: "template-1" },
    });
    expect(result).toBe(true);
  });

  it("throws when deleting a missing template", async () => {
    prismaMock.template.findUnique.mockResolvedValue(null);

    await expect(deleteTemplate("template-1", "user-1")).rejects.toThrow(
      "Template nÃ£o encontrado",
    );
  });

  it("throws when deleting a template owned by another user", async () => {
    prismaMock.template.findUnique.mockResolvedValue({ createdById: "user-2" });

    await expect(deleteTemplate("template-1", "user-1")).rejects.toThrow(
      "UsuÃ¡rio nÃ£o pode excluir este template",
    );
  });
});
