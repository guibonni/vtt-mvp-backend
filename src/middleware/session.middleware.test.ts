import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    sessionParticipant: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../config/prisma", () => ({
  prisma: prismaMock,
}));

import { sessionGuard } from "./session.middleware";

describe("session.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when sessionId is not provided", async () => {
    const req = {
      params: {},
      body: {},
      userId: "user-1",
    } as any;
    const res = createResponse();
    const next = vi.fn();

    await sessionGuard(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "SessionId não informado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("uses sessionId from params and calls next when participant exists", async () => {
    const req = {
      params: { sessionId: "session-1" },
      body: {},
      userId: "user-1",
    } as any;
    const res = createResponse();
    const next = vi.fn();

    prismaMock.sessionParticipant.findUnique.mockResolvedValue({
      userId: "user-1",
      sessionId: "session-1",
    });

    await sessionGuard(req, res as any, next);

    expect(prismaMock.sessionParticipant.findUnique).toHaveBeenCalledWith({
      where: {
        userId_sessionId: {
          userId: "user-1",
          sessionId: "session-1",
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("uses sessionId from body when params are empty", async () => {
    const req = {
      params: {},
      body: { sessionId: "session-1" },
      userId: "user-1",
    } as any;
    const res = createResponse();
    const next = vi.fn();

    prismaMock.sessionParticipant.findUnique.mockResolvedValue({
      userId: "user-1",
      sessionId: "session-1",
    });

    await sessionGuard(req, res as any, next);

    expect(prismaMock.sessionParticipant.findUnique).toHaveBeenCalledWith({
      where: {
        userId_sessionId: {
          userId: "user-1",
          sessionId: "session-1",
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when user is not a participant", async () => {
    const req = {
      params: { sessionId: "session-1" },
      body: {},
      userId: "user-1",
    } as any;
    const res = createResponse();
    const next = vi.fn();

    prismaMock.sessionParticipant.findUnique.mockResolvedValue(null);

    await sessionGuard(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuário não participa dessa sessão",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 500 when validation fails unexpectedly", async () => {
    const req = {
      params: { sessionId: "session-1" },
      body: {},
      userId: "user-1",
    } as any;
    const res = createResponse();
    const next = vi.fn();

    prismaMock.sessionParticipant.findUnique.mockRejectedValue(new Error("boom"));

    await sessionGuard(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro ao validar sessão",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
