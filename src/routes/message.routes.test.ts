import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const {
  authMiddlewareMock,
  sessionGuardMock,
  sendMessageMock,
  listMessagesMock,
} = vi.hoisted(() => ({
  authMiddlewareMock: vi.fn(),
  sessionGuardMock: vi.fn(),
  sendMessageMock: vi.fn(),
  listMessagesMock: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  authMiddleware: authMiddlewareMock,
}));

vi.mock("../middleware/session.middleware", () => ({
  sessionGuard: sessionGuardMock,
}));

vi.mock("../controllers/message.controller", () => ({
  sendMessage: sendMessageMock,
  listMessages: listMessagesMock,
}));

import router from "./message.routes";

describe("message.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMiddlewareMock.mockImplementation((_req, _res, next) => next());
    sessionGuardMock.mockImplementation((_req, _res, next) => next());
    sendMessageMock.mockImplementation((_req, res) => res.status(201).json({ route: "send" }));
    listMessagesMock.mockImplementation((_req, res) => res.json({ route: "list" }));
  });

  it("maps GET /sessions/:sessionId/messages", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app).get("/sessions/session-1/messages");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(listMessagesMock).toHaveBeenCalledTimes(1);
  });

  it("maps POST /sessions/:sessionId/messages", async () => {
    const app = createTestApp("/sessions", router);

    const response = await request(app)
      .post("/sessions/session-1/messages")
      .send({ content: "Oi" });

    expect(response.status).toBe(201);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(sessionGuardMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });
});
