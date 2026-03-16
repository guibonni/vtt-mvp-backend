import express, { type RequestHandler, type Router } from "express";
import { vi } from "vitest";

export function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  };

  res.status.mockReturnValue(res);

  return res;
}

export function createTestApp(basePath: string, router: Router | RequestHandler) {
  const app = express();
  app.use(express.json());
  app.use(basePath, router);
  return app;
}
