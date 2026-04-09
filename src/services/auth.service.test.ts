import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  bcryptMock,
  generateTokenMock,
  sendVerificationCodeEmailMock,
} = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    pendingUserRegistration: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  bcryptMock: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  generateTokenMock: vi.fn(),
  sendVerificationCodeEmailMock: vi.fn(),
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

vi.mock("./email.service", () => ({
  sendVerificationCodeEmail: sendVerificationCodeEmailMock,
}));

import { loginUser, registerUser, verifyRegisterCode } from "./auth.service";

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

      expect(prismaMock.pendingUserRegistration.upsert).not.toHaveBeenCalled();
      expect(sendVerificationCodeEmailMock).not.toHaveBeenCalled();
    });

    it("stores the pending registration and sends the verification code", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash
        .mockResolvedValueOnce("hashed-password")
        .mockResolvedValueOnce("hashed-code");

      const result = await registerUser("Gui", "Test@Example.com", "secret");

      expect(bcryptMock.hash).toHaveBeenNthCalledWith(1, "secret", 10);
      expect(bcryptMock.hash).toHaveBeenNthCalledWith(2, expect.any(String), 10);
      expect(prismaMock.pendingUserRegistration.upsert).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        update: {
          name: "Gui",
          passwordHash: "hashed-password",
          codeHash: "hashed-code",
          expiresAt: expect.any(Date),
        },
        create: {
          name: "Gui",
          email: "test@example.com",
          passwordHash: "hashed-password",
          codeHash: "hashed-code",
          expiresAt: expect.any(Date),
        },
      });
      expect(sendVerificationCodeEmailMock).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringMatching(/^\d{6}$/),
      );
      expect(result).toEqual({
        message: "Código de verificação enviado para o email informado.",
        email: "test@example.com",
      });
    });
  });

  describe("verifyRegisterCode", () => {
    it("throws when the pending registration does not exist", async () => {
      prismaMock.pendingUserRegistration.findUnique.mockResolvedValue(null);

      await expect(
        verifyRegisterCode("test@example.com", "123456"),
      ).rejects.toThrow("Cadastro pendente não encontrado");
    });

    it("throws when the code is expired", async () => {
      prismaMock.pendingUserRegistration.findUnique.mockResolvedValue({
        email: "test@example.com",
        expiresAt: new Date(Date.now() - 1_000),
      });

      await expect(
        verifyRegisterCode("test@example.com", "123456"),
      ).rejects.toThrow("Código de verificação expirado");

      expect(prismaMock.pendingUserRegistration.delete).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("throws when the code is invalid", async () => {
      prismaMock.pendingUserRegistration.findUnique.mockResolvedValue({
        email: "test@example.com",
        codeHash: "hashed-code",
        expiresAt: new Date(Date.now() + 60_000),
      });
      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        verifyRegisterCode("test@example.com", "000000"),
      ).rejects.toThrow("Código de verificação inválido");
    });

    it("creates the user from the pending registration and returns a safe payload", async () => {
      const userCreateMock = vi.fn().mockResolvedValue({
        id: "user-1",
        name: "Gui",
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      const pendingDeleteMock = vi.fn().mockResolvedValue(undefined);

      prismaMock.pendingUserRegistration.findUnique.mockResolvedValue({
        name: "Gui",
        email: "test@example.com",
        passwordHash: "hashed-password",
        codeHash: "hashed-code",
        expiresAt: new Date(Date.now() + 60_000),
      });
      bcryptMock.compare.mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (callback: any) =>
        callback({
          user: {
            create: userCreateMock,
          },
          pendingUserRegistration: {
            delete: pendingDeleteMock,
          },
        }),
      );
      generateTokenMock.mockReturnValue("jwt-token");

      const result = await verifyRegisterCode("test@example.com", "123456");

      expect(userCreateMock).toHaveBeenCalledWith({
        data: {
          name: "Gui",
          email: "test@example.com",
          passwordHash: "hashed-password",
        },
      });
      expect(pendingDeleteMock).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
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
