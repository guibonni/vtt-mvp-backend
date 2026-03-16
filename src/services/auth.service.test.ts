import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock, generateTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  bcryptMock: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  generateTokenMock: vi.fn(),
}));

vi.mock("../config/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: bcryptMock,
}));

vi.mock("../utils/jwt", () => ({
  generateToken: generateTokenMock,
}));

import { loginUser, registerUser } from "./auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("throws when email is already registered", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      await expect(
        registerUser("Gui", "test@example.com", "secret"),
      ).rejects.toThrow("Email já registrado");

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(bcryptMock.hash).not.toHaveBeenCalled();
    });

    it("creates the user, hashes the password and returns a safe payload", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue("hashed-password");
      prismaMock.user.create.mockResolvedValue({
        id: "user-1",
        name: "Gui",
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      generateTokenMock.mockReturnValue("jwt-token");

      const result = await registerUser("Gui", "test@example.com", "secret");

      expect(bcryptMock.hash).toHaveBeenCalledWith("secret", 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: "Gui",
          email: "test@example.com",
          passwordHash: "hashed-password",
        },
      });
      expect(generateTokenMock).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({
        user: {
          id: "user-1",
          name: "Gui",
          email: "test@example.com",
        },
        token: "jwt-token",
      });
    });
  });

  describe("loginUser", () => {
    it("throws when user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(loginUser("test@example.com", "secret")).rejects.toThrow(
        "Credenciais inválidas",
      );

      expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it("throws when password is invalid", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      bcryptMock.compare.mockResolvedValue(false);

      await expect(loginUser("test@example.com", "wrong")).rejects.toThrow(
        "Credenciais inválidas",
      );

      expect(generateTokenMock).not.toHaveBeenCalled();
    });

    it("returns the authenticated user without password hash", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Gui",
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      bcryptMock.compare.mockResolvedValue(true);
      generateTokenMock.mockReturnValue("jwt-token");

      const result = await loginUser("test@example.com", "secret");

      expect(bcryptMock.compare).toHaveBeenCalledWith(
        "secret",
        "hashed-password",
      );
      expect(generateTokenMock).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({
        user: {
          id: "user-1",
          name: "Gui",
          email: "test@example.com",
        },
        token: "jwt-token",
      });
    });
  });
});
