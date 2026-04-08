import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    sessionParticipant: {
      upsert: vi.fn(),
    },
  },
  bcryptMock: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../config/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: bcryptMock,
}));

import {
  createSession,
  getSession,
  joinSession,
  listSessions,
} from "./session.service";

describe("session.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a session with hashed password when provided", async () => {
    bcryptMock.hash.mockResolvedValue("hashed-password");
    prismaMock.session.create.mockResolvedValue({ id: "session-1" });

    const result = await createSession("Mesa", "secret", "user-1");

    expect(bcryptMock.hash).toHaveBeenCalledWith("secret", 10);
    expect(prismaMock.session.create).toHaveBeenCalledWith({
      data: {
        name: "Mesa",
        passwordHash: "hashed-password",
        createdById: "user-1",
        participants: {
          create: {
            userId: "user-1",
          },
        },
      },
    });
    expect(result).toEqual({ id: "session-1" });
  });

  it("creates a session without password hash when password is null", async () => {
    prismaMock.session.create.mockResolvedValue({ id: "session-1" });

    await createSession("Mesa", null, "user-1");

    expect(bcryptMock.hash).not.toHaveBeenCalled();
    expect(prismaMock.session.create).toHaveBeenCalledWith({
      data: {
        name: "Mesa",
        passwordHash: null,
        createdById: "user-1",
        participants: {
          create: {
            userId: "user-1",
          },
        },
      },
    });
  });

  it("lists sessions", async () => {
    prismaMock.session.findMany.mockResolvedValue([
      {
        id: "session-1",
        name: "Mesa 1",
        createdAt: new Date("2026-04-08T00:00:00.000Z"),
        createdBy: { name: "Ana" },
        participants: [{ id: "participant-1" }],
      },
      {
        id: "session-2",
        name: "Mesa 2",
        createdAt: new Date("2026-04-08T00:00:00.000Z"),
        createdBy: { name: "Beto" },
        participants: [],
      },
    ]);

    const result = await listSessions("user-1");

    expect(prismaMock.session.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        participants: {
          where: {
            userId: "user-1",
          },
          select: {
            id: true,
          },
        },
      },
    });
    expect(result).toEqual([
      {
        id: "session-1",
        name: "Mesa 1",
        createdAt: new Date("2026-04-08T00:00:00.000Z"),
        createdBy: { name: "Ana" },
        isParticipant: true,
      },
      {
        id: "session-2",
        name: "Mesa 2",
        createdAt: new Date("2026-04-08T00:00:00.000Z"),
        createdBy: { name: "Beto" },
        isParticipant: false,
      },
    ]);
  });

  it("throws when session is not found during join", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(joinSession("session-1", undefined, "user-1")).rejects.toThrow(
      "Sessão não encontrada",
    );
  });

  it("requires password when joining a protected session", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-1",
      passwordHash: "hashed-password",
    });

    await expect(joinSession("session-1", undefined, "user-1")).rejects.toThrow(
      "Senha necessária",
    );
  });

  it("throws when the provided session password is wrong", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-1",
      passwordHash: "hashed-password",
    });
    bcryptMock.compare.mockResolvedValue(false);

    await expect(joinSession("session-1", "wrong", "user-1")).rejects.toThrow(
      "Senha incorreta",
    );
  });

  it("upserts the participant when join succeeds", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-1",
      passwordHash: "hashed-password",
    });
    bcryptMock.compare.mockResolvedValue(true);
    prismaMock.sessionParticipant.upsert.mockResolvedValue({
      userId: "user-1",
      sessionId: "session-1",
    });

    const result = await joinSession("session-1", "secret", "user-1");

    expect(prismaMock.sessionParticipant.upsert).toHaveBeenCalledWith({
      where: {
        userId_sessionId: {
          userId: "user-1",
          sessionId: "session-1",
        },
      },
      update: {},
      create: {
        userId: "user-1",
        sessionId: "session-1",
      },
    });
    expect(result).toEqual({
      userId: "user-1",
      sessionId: "session-1",
    });
  });

  it("returns the requested session", async () => {
    prismaMock.session.findUnique.mockResolvedValue({ id: "session-1" });

    const result = await getSession("session-1");

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { id: "session-1" },
    });
    expect(result).toEqual({ id: "session-1" });
  });
});
