import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const { authMiddlewareMock, getPreferencesMock, updatePreferencesMock } = vi.hoisted(() => ({
  authMiddlewareMock: vi.fn(),
  getPreferencesMock: vi.fn(),
  updatePreferencesMock: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  authMiddleware: authMiddlewareMock,
}));

vi.mock("../controllers/user.controller", () => ({
  getPreferences: getPreferencesMock,
  updatePreferences: updatePreferencesMock,
}));

import router from "./user.routes";

describe("user.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMiddlewareMock.mockImplementation((_req, _res, next) => next());
    getPreferencesMock.mockImplementation((_req, res) =>
      res.json({ route: "getPreferences" }),
    );
    updatePreferencesMock.mockImplementation((_req, res) =>
      res.json({ route: "updatePreferences" }),
    );
  });

  it("maps GET /user/preferences to getPreferences with auth middleware", async () => {
    const app = createTestApp("/user", router);

    const response = await request(app).get("/user/preferences");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(getPreferencesMock).toHaveBeenCalledTimes(1);
  });

  it("maps PUT /user/preferences to updatePreferences with auth middleware", async () => {
    const app = createTestApp("/user", router);

    const response = await request(app)
      .put("/user/preferences")
      .send({ preferences: { theme: "light" } });

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(updatePreferencesMock).toHaveBeenCalledTimes(1);
  });
});
