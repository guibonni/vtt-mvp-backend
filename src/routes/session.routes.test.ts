import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const {
  authMiddlewareMock,
  sessionGuardMock,
  createMock,
  listMock,
  joinMock,
  getMock,
} = vi.hoisted(() => ({
  authMiddlewareMock: vi.fn(),
  sessionGuardMock: vi.fn(),
  createMock: vi.fn(),
  listMock: vi.fn(),
  joinMock: vi.fn(),
  getMock: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  authMiddleware: authMiddlewareMock,
}));

vi.mock("../middleware/session.middleware", () => ({
  sessionGuard: sessionGuardMock,
}));

vi.mock("../controllers/session.controller", () => ({
  create: createMock,
  list: listMock,
  join: joinMock,
  get: getMock,
}));

import router from "./session.routes";

describe("session.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMiddlewareMock.mockImplementation((_req, _res, next) => next());
    sessionGuardMock.mockImplementation((_req, _res, next) => next());
    createMock.mockImplementation((_req, res) => res.status(201).json({ route: "create" }));
    listMock.mockImplementation((_req, res) => res.json({ route: "list" }));
    joinMock.mockImplementation((_req, res) => res.json({ route: "join" }));
    getMock.mockImplementation((_req, res) => res.json({ route: "get" }));
  });

  it("maps GET /sessions to list with auth middleware", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).get("/sessions");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).not.toHaveBeenCalled();
  });

  it("maps POST /sessions to create with auth middleware", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).post("/sessions").send({ name: "Mesa" });

    expect(response.status).toBe(201);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).not.toHaveBeenCalled();
  });

  it("maps POST /sessions/join to join with auth middleware", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).post("/sessions/join").send({ sessionId: "session-1" });

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).not.toHaveBeenCalled();
  });

  it("maps GET /sessions/:sessionId to get with auth and session guard", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).get("/sessions/session-1");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledTimes(1);
  });
});
