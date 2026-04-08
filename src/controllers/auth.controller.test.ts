import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

vi.mock("../utils/api-error", () => ({
  sendErrorResponse: vi.fn((res, status) =>
    res.status(status).json({ message: "Nao foi possivel processar a solicitacao." }),
  ),
}));

const { registerUserMock, loginUserMock } = vi.hoisted(() => ({
  registerUserMock: vi.fn(),
  loginUserMock: vi.fn(),
}));

vi.mock("../services/auth.service", () => ({
  registerUser: registerUserMock,
  loginUser: loginUserMock,
}));

import { login, register } from "./auth.controller";

describe("auth.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register delegates to the service and returns the payload", async () => {
    const req = {
      body: {
        name: "Gui",
        email: "gui@example.com",
        password: "secret",
      },
    } as any;
    const res = createResponse();

    registerUserMock.mockResolvedValue({ token: "jwt-token" });

    await register(req, res as any);

    expect(registerUserMock).toHaveBeenCalledWith(
      "Gui",
      "gui@example.com",
      "secret",
    );
    expect(res.json).toHaveBeenCalledWith({ token: "jwt-token" });
  });

  it("register returns a generic 400 response when service throws", async () => {
    const req = {
      body: {
        name: "Gui",
        email: "gui@example.com",
        password: "secret",
      },
    } as any;
    const res = createResponse();

    registerUserMock.mockRejectedValue(new Error("Email ja registrado"));

    await register(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Nao foi possivel processar a solicitacao.",
    });
  });

  it("login delegates to the service and returns the payload", async () => {
    const req = {
      body: {
        email: "gui@example.com",
        password: "secret",
      },
    } as any;
    const res = createResponse();

    loginUserMock.mockResolvedValue({ token: "jwt-token" });

    await login(req, res as any);

    expect(loginUserMock).toHaveBeenCalledWith("gui@example.com", "secret");
    expect(res.json).toHaveBeenCalledWith({ token: "jwt-token" });
  });

  it("login returns a generic 400 response when service throws", async () => {
    const req = {
      body: {
        email: "gui@example.com",
        password: "wrong",
      },
    } as any;
    const res = createResponse();

    loginUserMock.mockRejectedValue(new Error("Credenciais invalidas"));

    await login(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Nao foi possivel processar a solicitacao.",
    });
  });
});
