import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../config/prisma", () => ({
  prisma: prismaMock,
}));

import { getUserPreferences, updateUserPreferences } from "./user.service";

describe("user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user preferences", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      preferences: {
        theme: "dark",
        language: "pt-BR",
      },
    });

    const result = await getUserPreferences("user-1");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { preferences: true },
    });
    expect(result).toEqual({
      preferences: {
        theme: "dark",
        language: "pt-BR",
      },
    });
  });

  it("throws when the user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getUserPreferences("missing-user")).rejects.toThrow(
      "Usuario nao encontrado",
    );
  });

  it("updates and returns the authenticated user preferences", async () => {
    prismaMock.user.update.mockResolvedValue({
      preferences: {
        theme: "light",
        notifications: {
          email: true,
        },
      },
    });

    const preferences = {
      theme: "light",
      notifications: {
        email: true,
      },
    };

    const result = await updateUserPreferences("user-1", preferences);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { preferences },
      select: { preferences: true },
    });
    expect(result).toEqual({
      preferences,
    });
  });
});
