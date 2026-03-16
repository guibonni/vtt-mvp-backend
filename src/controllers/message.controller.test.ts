import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

const { createMessageMock, getSessionMessagesMock, ioMock } = vi.hoisted(() => ({
  createMessageMock: vi.fn(),
  getSessionMessagesMock: vi.fn(),
  ioMock: {
    to: vi.fn(),
  },
}));

const emitMock = vi.fn();
ioMock.to.mockReturnValue({ emit: emitMock });

vi.mock("../services/message.service", () => ({
  createMessage: createMessageMock,
  getSessionMessages: getSessionMessagesMock,
}));

vi.mock("../server", () => ({
  io: ioMock,
}));

import { listMessages, sendMessage } from "./message.controller";

describe("message.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ioMock.to.mockReturnValue({ emit: emitMock });
  });

  it("sendMessage creates the message, emits the socket event and returns the payload", async () => {
    const req = {
      params: { sessionId: "session-1" },
      body: { content: "Oi", type: "TEXT", diceData: null },
      userId: "user-1",
    } as any;
    const res = createResponse();

    createMessageMock.mockResolvedValue({ id: "message-1" });

    await sendMessage(req, res as any);

    expect(createMessageMock).toHaveBeenCalledWith(
      "Oi",
      "TEXT",
      null,
      "user-1",
      "session-1",
    );
    expect(ioMock.to).toHaveBeenCalledWith("session-1");
    expect(emitMock).toHaveBeenCalledWith("new-message", { id: "message-1" });
    expect(res.json).toHaveBeenCalledWith({ id: "message-1" });
  });

  it("listMessages returns the session messages", async () => {
    const req = {
      params: { sessionId: "session-1" },
      userId: "user-1",
    } as any;
    const res = createResponse();

    getSessionMessagesMock.mockResolvedValue([{ id: "message-1" }]);

    await listMessages(req, res as any);

    expect(getSessionMessagesMock).toHaveBeenCalledWith("session-1");
    expect(res.json).toHaveBeenCalledWith([{ id: "message-1" }]);
  });

  it("returns 400 when sessionId is missing", async () => {
    const req = {
      params: {},
      body: { content: "Oi", type: "TEXT", diceData: null },
      userId: "user-1",
    } as any;
    const res = createResponse();

    await sendMessage(req, res as any);

    expect(createMessageMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Parametro invalido: sessionId",
    });
  });
});
