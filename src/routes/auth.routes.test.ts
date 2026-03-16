import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const { registerMock, loginMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock("../controllers/auth.controller", () => ({
  register: registerMock,
  login: loginMock,
}));

import router from "./auth.routes";

describe("auth.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerMock.mockImplementation((_req, res) => res.status(201).json({ ok: true }));
    loginMock.mockImplementation((_req, res) => res.json({ ok: true }));
  });

  it("maps POST /auth/register to register controller", async () => {
    const app = createTestApp("/auth", router);

    const response = await request(app)
      .post("/auth/register")
      .send({ name: "Gui", email: "gui@example.com", password: "secret" });

    expect(response.status).toBe(201);
    expect(registerMock).toHaveBeenCalledTimes(1);
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
  });
});
