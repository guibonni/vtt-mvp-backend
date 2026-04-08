import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

const {
  createSessionMock,
  listSessionsMock,
  joinSessionMock,
  getSessionMock,
} = vi.hoisted(() => ({
  createSessionMock: vi.fn(),
  listSessionsMock: vi.fn(),
  joinSessionMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock("../services/session.service", () => ({
  createSession: createSessionMock,
  listSessions: listSessionsMock,
  joinSession: joinSessionMock,
  getSession: getSessionMock,
}));

import { create, get, join, list } from "./session.controller";

describe("session.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create returns the created session", async () => {
    const req = {
      body: { name: "Mesa", password: "secret" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    createSessionMock.mockResolvedValue({ id: "session-1" });

    await create(req, res as any);

    expect(createSessionMock).toHaveBeenCalledWith("Mesa", "secret", "user-1");
    expect(res.json).toHaveBeenCalledWith({ id: "session-1" });
  });

  it("create returns 400 on service error", async () => {
    const req = {
      body: { name: "Mesa", password: "secret" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    createSessionMock.mockRejectedValue(new Error("Falha"));

    await create(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Falha" });
  });

  it("list returns all sessions", async () => {
    const req = { userId: "user-1" } as any;
    const res = createResponse();

    listSessionsMock.mockResolvedValue([{ id: "session-1" }]);

    await list(req, res as any);

    expect(listSessionsMock).toHaveBeenCalledWith("user-1");
    expect(res.json).toHaveBeenCalledWith([{ id: "session-1" }]);
  });

  it("join returns the participant", async () => {
    const req = {
      body: { sessionId: "session-1", password: "secret" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    joinSessionMock.mockResolvedValue({ sessionId: "session-1" });

    await join(req, res as any);

    expect(joinSessionMock).toHaveBeenCalledWith(
      "session-1",
      "secret",
      "user-1",
    );
    expect(res.json).toHaveBeenCalledWith({ sessionId: "session-1" });
  });

  it("get returns the session when param is valid", async () => {
    const req = {
      params: { sessionId: "session-1" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    getSessionMock.mockResolvedValue({ id: "session-1" });

    await get(req, res as any);

    expect(getSessionMock).toHaveBeenCalledWith("session-1");
    expect(res.json).toHaveBeenCalledWith({ id: "session-1" });
  });

  it("get returns 400 when sessionId is missing", async () => {
    const req = {
      params: {},
      userId: "user-1",
    } as any;
    const res = createResponse();

    await get(req, res as any);

    expect(getSessionMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Parametro invalido: sessionId",
    });
  });
});
