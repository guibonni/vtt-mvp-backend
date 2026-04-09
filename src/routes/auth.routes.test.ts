import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const { registerMock, verifyRegisterMock, loginMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
  verifyRegisterMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock("../controllers/auth.controller", () => ({
  register: registerMock,
  verifyRegister: verifyRegisterMock,
  login: loginMock,
}));

import router from "./auth.routes";

describe("auth.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerMock.mockImplementation((_req, res) => res.status(202).json({ ok: true }));
    verifyRegisterMock.mockImplementation((_req, res) =>
      res.status(201).json({ ok: true }),
    );
    loginMock.mockImplementation((_req, res) => res.json({ ok: true }));
  });

  it("maps POST /auth/register to register controller", async () => {
    const app = createTestApp("/auth", router);

    const response = await request(app)
      .post("/auth/register")
      .send({ name: "Gui", email: "gui@example.com", password: "secret" });

    expect(response.status).toBe(202);
    expect(registerMock).toHaveBeenCalledTimes(1);
    expect(verifyRegisterMock).not.toHaveBeenCalled();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("maps POST /auth/register/verify to verifyRegister controller", async () => {
    const app = createTestApp("/auth", router);

    const response = await request(app)
      .post("/auth/register/verify")
      .send({ email: "gui@example.com", code: "123456" });

    expect(response.status).toBe(201);
    expect(verifyRegisterMock).toHaveBeenCalledTimes(1);
    expect(registerMock).not.toHaveBeenCalled();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("maps POST /auth/login to login controller", async () => {
    const app = createTestApp("/auth", router);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "gui@example.com", password: "secret" });

    expect(response.status).toBe(200);
    expect(loginMock).toHaveBeenCalledTimes(1);
    expect(registerMock).not.toHaveBeenCalled();
    expect(verifyRegisterMock).not.toHaveBeenCalled();
  });
});
