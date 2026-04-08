import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

vi.mock("../utils/api-error", () => ({
  sendErrorResponse: vi.fn((res, status) => {
    const messages: Record<number, string> = {
      401: "Nao autorizado.",
    };

    return res.status(status).json({ message: messages[status] });
  }),
}));

const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

vi.mock("../utils/jwt", () => ({
  verifyToken: verifyTokenMock,
}));

import { authMiddleware } from "./auth.middleware";

describe("auth.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when authorization header is missing", () => {
    const req = { headers: {} } as any;
    const res = createResponse();
    const next = vi.fn();

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Nao autorizado." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is malformed", () => {
    const req = { headers: { authorization: "Bearer" } } as any;
    const res = createResponse();
    const next = vi.fn();

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Nao autorizado." });
    expect(next).not.toHaveBeenCalled();
  });

  it("stores the userId and calls next when token is valid", () => {
    const req = { headers: { authorization: "Bearer valid-token" } } as any;
    const res = createResponse();
    const next = vi.fn();

    verifyTokenMock.mockReturnValue({ userId: "user-1" });

    authMiddleware(req, res as any, next);

    expect(verifyTokenMock).toHaveBeenCalledWith("valid-token");
    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when token verification fails", () => {
    const req = { headers: { authorization: "Bearer invalid-token" } } as any;
    const res = createResponse();
    const next = vi.fn();

    verifyTokenMock.mockImplementation(() => {
      throw new Error("invalid");
    });

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Nao autorizado." });
    expect(next).not.toHaveBeenCalled();
  });
});
