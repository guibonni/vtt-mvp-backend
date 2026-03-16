import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findUnique: vi.fn(),
    },
    character: {
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
  createCharacter,
  deleteCharacter,
  getSessionCharacters,
  updateCharacter,
} from "./character.service";

describe("character.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a character", async () => {
    prismaMock.character.create.mockResolvedValue({ id: "character-1" });

    const result = await createCharacter(
      "Aragorn",
      "dnd5e",
      { level: 5 },
      "user-1",
      "session-1",
    );

    expect(prismaMock.character.create).toHaveBeenCalledWith({
      data: {
        name: "Aragorn",
        template: "dnd5e",
        data: { level: 5 },
        userId: "user-1",
        sessionId: "session-1",
      },
    });
    expect(result).toEqual({ id: "character-1" });
  });

  it("throws when session is not found while listing characters", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(getSessionCharacters("session-1", "user-1")).rejects.toThrow(
      "Sessão não encontrada",
    );
  });

  it("lists all session characters for the session creator", async () => {
    prismaMock.session.findUnique.mockResolvedValue({ createdById: "user-1" });
    prismaMock.character.findMany.mockResolvedValue([{ id: "character-1" }]);

    const result = await getSessionCharacters("session-1", "user-1");

    expect(prismaMock.character.findMany).toHaveBeenCalledWith({
      where: { sessionId: "session-1" },
      select: {
        id: true,
        name: true,
        template: true,
        data: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual([{ id: "character-1" }]);
  });

  it("lists only the user's characters when user is not the session creator", async () => {
    prismaMock.session.findUnique.mockResolvedValue({ createdById: "user-2" });
    prismaMock.character.findMany.mockResolvedValue([{ id: "character-1" }]);

    await getSessionCharacters("session-1", "user-1");

    expect(prismaMock.character.findMany).toHaveBeenCalledWith({
      where: { sessionId: "session-1", userId: "user-1" },
      select: {
        id: true,
        name: true,
        template: true,
        data: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it("throws when updating a character from another session", async () => {
    prismaMock.character.findUnique.mockResolvedValue({
      id: "character-1",
      sessionId: "session-2",
    });

    await expect(
      updateCharacter("character-1", "session-1", { hp: 10 }),
    ).rejects.toThrow("Personagem não pertence à sessão");
  });

  it("updates the character data when it belongs to the session", async () => {
    prismaMock.character.findUnique.mockResolvedValue({
      id: "character-1",
      sessionId: "session-1",
    });
    prismaMock.character.update.mockResolvedValue({
      id: "character-1",
      data: { hp: 10 },
    });

    const result = await updateCharacter("character-1", "session-1", {
      hp: 10,
    });

    expect(prismaMock.character.update).toHaveBeenCalledWith({
      where: { id: "character-1" },
      data: { data: { hp: 10 } },
    });
    expect(result).toEqual({
      id: "character-1",
      data: { hp: 10 },
    });
  });

  it("throws when deleting a character from another session", async () => {
    prismaMock.character.findUnique.mockResolvedValue({
      id: "character-1",
      sessionId: "session-2",
    });

    await expect(deleteCharacter("character-1", "session-1")).rejects.toThrow(
      "Personagem não pertence à sessão",
    );
  });

  it("deletes the character and returns true", async () => {
    prismaMock.character.findUnique.mockResolvedValue({
      id: "character-1",
      sessionId: "session-1",
    });
    prismaMock.character.delete.mockResolvedValue({ id: "character-1" });

    const result = await deleteCharacter("character-1", "session-1");

    expect(prismaMock.character.delete).toHaveBeenCalledWith({
      where: { id: "character-1" },
    });
    expect(result).toBe(true);
  });
});
