const { mockedAxios } = vi.hoisted(() => ({ mockedAxios: vi.fn() }));

vi.mock("axios", () => ({
  default: mockedAxios,
}));

import { sendApiRequest } from "./sendApiRequest.js";

describe("sendApiRequest", () => {
  function buildDependencies() {
    const logger = vi.fn();
    const req = {
      log: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
    };
    const res = {};

    return { logger, req, res };
  }

  afterEach(() => {
    mockedAxios.mockReset();
  });

  it("logs info and returns data for successful responses", async () => {
    const { logger, req, res } = buildDependencies();

    mockedAxios.mockResolvedValueOnce({
      data: { hello: "world" },
      headers: { "content-type": "application/json" },
      status: 200,
    });

    const response = await sendApiRequest(
      logger as unknown as Parameters<typeof sendApiRequest>[0],
      req as unknown as Parameters<typeof sendApiRequest>[1],
      res as unknown as Parameters<typeof sendApiRequest>[2],
      "http://localhost/v1/batch",
      "GET",
      null,
      { Authorization: "Bearer token" },
    );

    expect(response).toEqual([200, { hello: "world" }, "application/json"]);
    expect(req.log.info).toHaveBeenCalledWith("Status 200 from GET http://localhost/v1/batch");
  });

  it("sanitises control characters and warns for non-2xx statuses", async () => {
    const { logger, req, res } = buildDependencies();

    mockedAxios.mockResolvedValueOnce({
      data: { error: "not found" },
      headers: { "content-type": ["application/json"] },
      status: 404,
    });

    const response = await sendApiRequest(
      logger as unknown as Parameters<typeof sendApiRequest>[0],
      req as unknown as Parameters<typeof sendApiRequest>[1],
      res as unknown as Parameters<typeof sendApiRequest>[2],
      "http://localhost/v1/batch\n",
      "GET\t",
      null,
      { Authorization: "Bearer token" },
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "http://localhost/v1/batch",
      }),
    );
    expect(req.log.warn).toHaveBeenCalledWith("Status 404 from GET http://localhost/v1/batch");
    expect(response).toEqual([404, { error: "not found" }, ""]);
  });

  it("replaces null bytes and other control characters in request URL with a space", async () => {
    const { logger, req, res } = buildDependencies();

    mockedAxios.mockResolvedValueOnce({
      data: {},
      headers: { "content-type": "application/json" },
      status: 200,
    });

    await sendApiRequest(
      logger as unknown as Parameters<typeof sendApiRequest>[0],
      req as unknown as Parameters<typeof sendApiRequest>[1],
      res as unknown as Parameters<typeof sendApiRequest>[2],
      "http://localhost/v1/ba\u0000tch",
      "GET",
      null,
      { Authorization: "Bearer token" },
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://localhost/v1/ba tch",
      }),
    );
  });

  it("returns 500 and logs when the request throws", async () => {
    const { logger, req, res } = buildDependencies();
    const error = new Error("network");

    mockedAxios.mockRejectedValueOnce(error);

    const response = await sendApiRequest(
      logger as unknown as Parameters<typeof sendApiRequest>[0],
      req as unknown as Parameters<typeof sendApiRequest>[1],
      res as unknown as Parameters<typeof sendApiRequest>[2],
      "http://localhost/v1/batch",
      "GET",
      null,
      { Authorization: "Bearer token" },
    );

    expect(response).toEqual([500, null, ""]);
    expect(req.log.error).toHaveBeenCalledWith(
      error,
      "GET http://localhost/v1/batch endpoint failed",
    );
  });

  it("handles undefined method values safely in logs", async () => {
    const { logger, req, res } = buildDependencies();

    mockedAxios.mockResolvedValueOnce({
      data: {},
      headers: { "content-type": "application/json" },
      status: 200,
    });

    await sendApiRequest(
      logger as unknown as Parameters<typeof sendApiRequest>[0],
      req as unknown as Parameters<typeof sendApiRequest>[1],
      res as unknown as Parameters<typeof sendApiRequest>[2],
      "http://localhost/v1/batch",
      undefined,
      null,
      { Authorization: "Bearer token" },
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "",
      }),
    );
  });

  it("collapses consecutive spaces in URL and method", async () => {
    const { logger, req, res } = buildDependencies();

    mockedAxios.mockResolvedValueOnce({
      data: {},
      headers: { "content-type": "application/json" },
      status: 200,
    });

    await sendApiRequest(
      logger as unknown as Parameters<typeof sendApiRequest>[0],
      req as unknown as Parameters<typeof sendApiRequest>[1],
      res as unknown as Parameters<typeof sendApiRequest>[2],
      "http://localhost/v1/ba  tch",
      "GE  T",
      null,
      { Authorization: "Bearer token" },
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://localhost/v1/ba tch",
        method: "GE T",
      }),
    );
  });
});
