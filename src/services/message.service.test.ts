import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../config/prisma", () => ({
  prisma: prismaMock,
}));

import { createMessage, getSessionMessages } from "./message.service";

describe("message.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a message with the expected relations", async () => {
    prismaMock.message.create.mockResolvedValue({ id: "message-1" });

    const result = await createMessage(
      "Oi",
      "TEXT",
      null,
      "user-1",
      "session-1",
    );

    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: {
        content: "Oi",
        type: "TEXT",
        diceData: null,
        userId: "user-1",
        sessionId: "session-1",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual({ id: "message-1" });
  });

  it("lists session messages ordered by creation date", async () => {
    prismaMock.message.findMany.mockResolvedValue([{ id: "message-1" }]);

    const result = await getSessionMessages("session-1");

    expect(prismaMock.message.findMany).toHaveBeenCalledWith({
      where: { sessionId: "session-1" },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual([{ id: "message-1" }]);
  });
});
