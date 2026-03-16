import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

const {
  createCharacterMock,
  getSessionCharactersMock,
  updateCharacterMock,
  deleteCharacterMock,
} = vi.hoisted(() => ({
  createCharacterMock: vi.fn(),
  getSessionCharactersMock: vi.fn(),
  updateCharacterMock: vi.fn(),
  deleteCharacterMock: vi.fn(),
}));

vi.mock("../services/character.service", () => ({
  createCharacter: createCharacterMock,
  getSessionCharacters: getSessionCharactersMock,
  updateCharacter: updateCharacterMock,
  deleteCharacter: deleteCharacterMock,
}));

import { create, list, remove, update } from "./character.controller";

describe("character.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create returns the created character", async () => {
    const req = {
      params: { sessionId: "session-1" },
      body: { name: "Aragorn", template: "dnd5e", data: { hp: 10 } },
      userId: "user-1",
    } as any;
    const res = createResponse();

    createCharacterMock.mockResolvedValue({ id: "character-1" });

    await create(req, res as any);

    expect(createCharacterMock).toHaveBeenCalledWith(
      "Aragorn",
      "dnd5e",
      { hp: 10 },
      "user-1",
      "session-1",
    );
    expect(res.json).toHaveBeenCalledWith({ id: "character-1" });
  });

  it("list returns session characters", async () => {
    const req = {
      params: { sessionId: "session-1" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    getSessionCharactersMock.mockResolvedValue([{ id: "character-1" }]);

    await list(req, res as any);

    expect(getSessionCharactersMock).toHaveBeenCalledWith(
      "session-1",
      "user-1",
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "character-1" }]);
  });

  it("update returns the updated character", async () => {
    const req = {
      params: { sessionId: "session-1", characterId: "character-1" },
      body: { data: { hp: 8 } },
      userId: "user-1",
    } as any;
    const res = createResponse();

    updateCharacterMock.mockResolvedValue({ id: "character-1" });

    await update(req, res as any);

    expect(updateCharacterMock).toHaveBeenCalledWith(
      "character-1",
      "session-1",
      { hp: 8 },
    );
    expect(res.json).toHaveBeenCalledWith({ id: "character-1" });
  });

  it("remove returns success when deletion succeeds", async () => {
    const req = {
      params: { sessionId: "session-1", characterId: "character-1" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    deleteCharacterMock.mockResolvedValue(true);

    await remove(req, res as any);

    expect(deleteCharacterMock).toHaveBeenCalledWith(
      "character-1",
      "session-1",
    );
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("returns 400 when a required param is missing", async () => {
    const req = {
      params: { sessionId: "session-1" },
      body: { data: { hp: 8 } },
      userId: "user-1",
    } as any;
    const res = createResponse();

    await update(req, res as any);

    expect(updateCharacterMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Parametro invalido: characterId",
    });
  });
});
