import { beforeEach, describe, expect, it, vi } from "vitest";
import { createResponse } from "../test-utils/http";

vi.mock("../utils/api-error", () => ({
  sendErrorResponse: vi.fn((res, status) =>
    res.status(status).json({ message: "Nao foi possivel processar a solicitacao." }),
  ),
}));

const { getUserPreferencesMock, updateUserPreferencesMock } = vi.hoisted(() => ({
  getUserPreferencesMock: vi.fn(),
  updateUserPreferencesMock: vi.fn(),
}));

vi.mock("../services/user.service", () => ({
  getUserPreferences: getUserPreferencesMock,
  updateUserPreferences: updateUserPreferencesMock,
}));

import { getPreferences, updatePreferences } from "./user.controller";

describe("user.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to the service and returns the payload", async () => {
    const req = {
      userId: "user-1",
    } as any;
    const res = createResponse();

    getUserPreferencesMock.mockResolvedValue({
      preferences: { theme: "dark" },
    });

    await getPreferences(req, res as any);

    expect(getUserPreferencesMock).toHaveBeenCalledWith("user-1");
    expect(res.json).toHaveBeenCalledWith({
      preferences: { theme: "dark" },
    });
  });

  it("returns a generic 400 response when service throws", async () => {
    const req = {
      userId: "user-1",
    } as any;
    const res = createResponse();

    getUserPreferencesMock.mockRejectedValue(new Error("Usuario nao encontrado"));

    await getPreferences(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Nao foi possivel processar a solicitacao.",
    });
  });

  it("updates preferences through the service and returns the payload", async () => {
    const req = {
      userId: "user-1",
      body: {
        preferences: { theme: "light" },
      },
    } as any;
    const res = createResponse();

    updateUserPreferencesMock.mockResolvedValue({
      preferences: { theme: "light" },
    });

    await updatePreferences(req, res as any);

    expect(updateUserPreferencesMock).toHaveBeenCalledWith("user-1", {
      theme: "light",
    });
    expect(res.json).toHaveBeenCalledWith({
      preferences: { theme: "light" },
    });
  });

  it("returns a generic 400 response when update service throws", async () => {
    const req = {
      userId: "user-1",
      body: {
        preferences: { theme: "light" },
      },
    } as any;
    const res = createResponse();

    updateUserPreferencesMock.mockRejectedValue(new Error("Falha ao atualizar"));

    await updatePreferences(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Nao foi possivel processar a solicitacao.",
    });
  });
});
