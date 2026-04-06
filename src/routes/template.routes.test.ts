import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../test-utils/http";

const {
  authMiddlewareMock,
  createMock,
  listMock,
  getMock,
  updateMock,
  removeMock,
} = vi.hoisted(() => ({
  authMiddlewareMock: vi.fn(),
  createMock: vi.fn(),
  listMock: vi.fn(),
  getMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  authMiddleware: authMiddlewareMock,
}));

vi.mock("../controllers/template.controller", () => ({
  create: createMock,
  list: listMock,
  get: getMock,
  update: updateMock,
  remove: removeMock,
}));

import router from "./template.routes";

describe("template.routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMiddlewareMock.mockImplementation((_req, _res, next) => next());
    createMock.mockImplementation((_req, res) =>
      res.status(201).json({ route: "create" }),
    );
    listMock.mockImplementation((_req, res) => res.json({ route: "list" }));
    getMock.mockImplementation((_req, res) => res.json({ route: "get" }));
    updateMock.mockImplementation((_req, res) => res.json({ route: "update" }));
    removeMock.mockImplementation((_req, res) => res.json({ route: "remove" }));
  });

  it("maps GET /templates to list with auth middleware", async () => {
    const app = createTestApp("/templates", router);

    const response = await request(app).get("/templates");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("maps GET /templates/:templateId to get with auth middleware", async () => {
    const app = createTestApp("/templates", router);

    const response = await request(app).get("/templates/template-1");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it("maps POST /templates to create with auth middleware", async () => {
    const app = createTestApp("/templates", router);

    const response = await request(app)
      .post("/templates")
      .send({ name: "Mage", data: {} });

    expect(response.status).toBe(201);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("maps PUT /templates/:templateId to update with auth middleware", async () => {
    const app = createTestApp("/templates", router);

    const response = await request(app)
      .put("/templates/template-1")
      .send({ name: "Mage", data: {} });

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it("maps DELETE /templates/:templateId to remove with auth middleware", async () => {
    const app = createTestApp("/templates", router);

    const response = await request(app).delete("/templates/template-1");

    expect(response.status).toBe(200);
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});
