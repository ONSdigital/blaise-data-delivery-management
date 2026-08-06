import supertest, { type Response } from "supertest";
import { describe, expect, it, vi } from "vitest";

import { type EnvironmentVariables } from "./config.js";
import createLogger from "./utils/createLogger.js";
import { createServerErrorHandler, newServer } from "./server.js";

const mockEnvironmentVariables: EnvironmentVariables = {
  PROJECT_ID: "test-project",
  DDS_API_URL: "http://localhost",
  DDS_CLIENT_ID: "test-client-id",
};

const app = newServer(mockEnvironmentVariables, createLogger());
const request = supertest(app);

describe("Test Heath Endpoint", () => {
  it("should return a 200 status and json message", async () => {
    const response: Response = await request.get("/ddm-ui/version/health");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });

  it("should return a 500 error page when the catch-all view cannot be rendered", async () => {
    const response: Response = await request.get("/some-page");

    expect(response.status).toEqual(500);
    expect(response.text).toContain("<!doctype html>");
  });
});

describe("createServerErrorHandler", () => {
  it("logs and renders the configured error view", () => {
    const logError = vi.fn();
    const req = {
      log: {
        error: logError,
      },
    };
    const render = vi.fn();
    const status = vi.fn();
    const res = {
      status,
      render,
    };

    status.mockReturnValue(res);
    const httpLogger = vi.fn();
    const handler = createServerErrorHandler(
      httpLogger as unknown as Parameters<typeof createServerErrorHandler>[0],
      "/tmp/views/500.html",
    );
    const error = new Error("boom");

    handler(
      error,
      req as unknown as Parameters<typeof handler>[1],
      res as unknown as Parameters<typeof handler>[2],
      vi.fn(),
    );

    expect(httpLogger).toHaveBeenCalledWith(req, res);
    expect(logError).toHaveBeenCalledWith(error, "boom");
    expect(status).toHaveBeenCalledWith(500);
    expect(render).toHaveBeenCalledWith("/tmp/views/500.html", {});
  });
});
