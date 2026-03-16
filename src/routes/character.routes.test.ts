import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const {
  authMiddlewareMock,
  sessionGuardMock,
  createMock,
  listMock,
  updateMock,
  removeMock,
} = vi.hoisted(() => ({
  authMiddlewareMock: vi.fn(),
  sessionGuardMock: vi.fn(),
  createMock: vi.fn(),
  listMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  authMiddleware: authMiddlewareMock,
}));

vi.mock("../middleware/session.middleware", () => ({
  sessionGuard: sessionGuardMock,
}));

vi.mock("../controllers/character.controller", () => ({
  create: createMock,
  list: listMock,
  update: updateMock,
  remove: removeMock,
}));

import router from "./character.routes";

describe("character.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMiddlewareMock.mockImplementation((_req, _res, next) => next());
    sessionGuardMock.mockImplementation((_req, _res, next) => next());
    createMock.mockImplementation((_req, res) => res.status(201).json({ route: "create" }));
    listMock.mockImplementation((_req, res) => res.json({ route: "list" }));
    updateMock.mockImplementation((_req, res) => res.json({ route: "update" }));
    removeMock.mockImplementation((_req, res) => res.json({ route: "remove" }));
  });

  it("maps GET /sessions/:sessionId/characters", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).get("/sessions/session-1/characters");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("maps POST /sessions/:sessionId/characters", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app)
      .post("/sessions/session-1/characters")
      .send({ name: "Aragorn" });

    expect(response.status).toBe(201);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("maps PUT /sessions/:sessionId/characters/:characterId", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app)
      .put("/sessions/session-1/characters/character-1")
      .send({ data: { hp: 10 } });

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it("maps DELETE /sessions/:sessionId/characters/:characterId", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).delete(
      "/sessions/session-1/characters/character-1",
    );

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});
