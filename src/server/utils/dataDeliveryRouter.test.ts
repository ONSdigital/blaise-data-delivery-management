vi.mock("./authProvider.js", () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        getAuthHeader: vi.fn().mockResolvedValue({ Authorization: "Bearer mock-token" }),
      };
    }),
  };
});

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import supertest, { type Response } from "supertest";

import createLogger from "./createLogger.js";
import { newServer } from "../server.js";

const mockEnvironmentVariables = {
  PROJECT_ID: "test-project",
  DDS_API_URL: "http://localhost",
  DDS_CLIENT_ID: "test-client-id",
};

const app = newServer(mockEnvironmentVariables, createLogger());

import {
  BatchInfoListFromAPI,
  BatchInfoListServerProcessed,
  BatchListFromAPI,
  BatchListServerProcessed,
  StatusDescriptions,
} from "./dataDeliveryRouter.mock.js";
import { extractBatchName, isJsonContentType, parseBatchList } from "./dataDeliveryRouter.js";
import createDataDeliveryRouter from "./dataDeliveryRouter.js";

const request = supertest(app);
const mock = new MockAdapter(axios as unknown as ConstructorParameters<typeof MockAdapter>[0], {
  onNoMatch: "throwException",
});
const jsonHeaders = { "content-type": "application/json" };
const jsonWithCharsetHeaders = { "content-type": "application/json; charset=utf-8" };

describe("extractBatchName", () => {
  it("returns string values", () => {
    expect(extractBatchName("OPN_26032021_112954")).toEqual("OPN_26032021_112954");
  });

  it("returns first item when array contains a string", () => {
    expect(extractBatchName(["OPN_26032021_112954"])).toEqual("OPN_26032021_112954");
  });

  it("returns null for unsupported values", () => {
    expect(extractBatchName(undefined)).toBeNull();
    expect(extractBatchName([123])).toBeNull();
  });

  it("route returns 400 when batch name extraction returns null", async () => {
    const router = createDataDeliveryRouter(mockEnvironmentVariables, createLogger());

    type RouteHandler = (req: unknown, res: unknown, next?: unknown) => Promise<void> | void;
    const batchRouteLayer = router.stack.find(
      (layer) =>
        (layer as unknown as { route?: { path?: string } }).route?.path === "/api/batch/:batchName",
    ) as unknown as { route: { stack: Array<{ handle: RouteHandler }> } };
    const handler = batchRouteLayer.route.stack[0].handle;
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const req = {
      log: {
        warn: vi.fn(),
      },
      params: {
        batchName: [123],
      },
    };
    const res = { json, status };

    await handler(req, res);

    expect(req.log.warn).toHaveBeenCalledWith("Invalid batch name type received");
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith([]);
  });
});

describe("parseBatchList", () => {
  it("returns an empty list and warns when API payload is not an array", () => {
    const warn = vi.fn();

    expect(parseBatchList({ batches: [] }, { warn })).toEqual([]);
    expect(warn).toHaveBeenCalledWith("Invalid batch list received from DDS API");
  });

  it("skips unrecognised batch names instead of throwing", () => {
    const warn = vi.fn();

    expect(parseBatchList(["OPN_26032021_112954", "unexpected-batch-name", ""], { warn })).toEqual([
      {
        survey: "OPN",
        date: new Date("2021-03-26 11:29:54").toISOString(),
        dateString: "26/03/2021 11:29:54",
        name: "OPN_26032021_112954",
      },
    ]);
    expect(warn).toHaveBeenCalledWith(
      "Skipping unrecognised batch name from DDS API: unexpected-batch-name",
    );
  });
});

describe("isJsonContentType", () => {
  it("accepts application/json with media-type parameters", () => {
    expect(isJsonContentType("application/json; charset=utf-8")).toBe(true);
    expect(isJsonContentType("application/json ; charset=UTF-8")).toBe(true);
  });

  it("accepts mixed-case application/json", () => {
    expect(isJsonContentType("Application/Json")).toBe(true);
  });

  it("rejects non-JSON content types", () => {
    expect(isJsonContentType("text/plain")).toBe(false);
    expect(isJsonContentType("application/problem+json")).toBe(false);
  });
});

describe("Data Delivery Get all batches from API", () => {
  beforeEach(() => {
    mock.reset();
  });

  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mock.onGet(/\/v1\/batch$/).reply(200, [], jsonHeaders);

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and an empty json list when API returns batches with blank names", async () => {
    mock.onGet(/\/v1\/batch$/).reply(200, ["", "", ""], jsonHeaders);

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
    expect(response.body.length).toStrictEqual(0);
  });

  it("should return a 200 status and an json list of 3 items when API returns a 3 item string list", async () => {
    mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, jsonHeaders);

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(BatchListServerProcessed);
    expect(response.body.length).toStrictEqual(3);
  });

  it("should accept JSON responses with charset parameter", async () => {
    mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, jsonWithCharsetHeaders);

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(BatchListServerProcessed);
  });

  it("should skip unrecognised batch names returned by the API", async () => {
    mock
      .onGet(/\/v1\/batch$/)
      .reply(200, ["OPN_26032021_112954", "unexpected-batch-name"], jsonHeaders);

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([
      {
        survey: "OPN",
        date: "2021-03-26T11:29:54.000Z",
        dateString: "26/03/2021 11:29:54",
        name: "OPN_26032021_112954",
      },
    ]);
  });

  it("should return a 400 status if the content type is not application/json", async () => {
    mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(400);
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(/\/v1\/batch$/).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(/\/v1\/batch$/).networkError();

    const response: Response = await request.get("/api/batch");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mock.reset();
  });
});

describe("Data Delivery Get a specific batch from API", () => {
  it("should return a 200 status and an empty json list when API returns a empty list", async () => {
    mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, [], jsonHeaders);

    const response: Response = await request.get("/api/batch/OPN_26032021_112954");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual([]);
  });

  it("should return a 200 status and an json list of 2 items when API returns a 2 item list", async () => {
    mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, BatchInfoListFromAPI, jsonHeaders);

    const response: Response = await request.get("/api/batch/OPN_26032021_112954");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(BatchInfoListServerProcessed);
    expect(response.body.length).toStrictEqual(3);
  });

  it("should accept JSON batch responses with charset parameter", async () => {
    mock
      .onGet(/\/v1\/batch\/OPN_26032021_112954$/)
      .reply(200, BatchInfoListFromAPI, jsonWithCharsetHeaders);

    const response: Response = await request.get("/api/batch/OPN_26032021_112954");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(BatchInfoListServerProcessed);
  });

  it("should not mutate the API response objects when enriching file statuses", async () => {
    mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, BatchInfoListFromAPI, jsonHeaders);

    await request.get("/api/batch/OPN_26032021_112954");

    expect(BatchInfoListFromAPI).toStrictEqual([
      {
        batch: "OPN_26032021_112954",
        dd_filename: "OPN2004A",
        state: "inactive",
        updated_at: "2021-03-26T12:29:54.000Z",
      },
      {
        batch: "OPN_26032021_112954",
        dd_filename: "dd_OPN2101A_26032021_112954.zip",
        state: "generated",
        updated_at: "2021-03-26T12:29:54.000Z",
      },
      {
        batch: "LMS_27042021_112954",
        dd_filename: "dd_LMS2101_AA1_27042021_112954.zip",
        state: "generated",
        updated_at: "2021-04-27T12:29:54.000Z",
      },
    ]);
  });

  it("should return a 400 status if the content type is not application/json", async () => {
    mock
      .onGet(/\/v1\/batch\/OPN_26032021_112954$/)
      .reply(200, BatchListFromAPI, { "content-type": "bacon" });

    const response: Response = await request.get("/api/batch/OPN_26032021_112954");

    expect(response.status).toEqual(400);
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/batch/OPN_26032021_112954");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).networkError();

    const response: Response = await request.get("/api/batch/OPN_26032021_112954");

    expect(response.status).toEqual(500);
  });

  it("should return a 400 status when batchname is not valid", async () => {
    mock.onGet(/\/v1\/batch\/OPN_26032021_1130$/);

    const response: Response = await request.get("/api/batch/OPN_26032021_1130");

    expect(response.status).toEqual(400);
    expect(response.body).toEqual([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mock.reset();
  });
});

describe("Data Delivery Get status descriptions", () => {
  it("should return a 200 status and an json object when API returns the objects", async () => {
    mock.onGet(/\/v1\/state\/descriptions$/).reply(200, StatusDescriptions, jsonHeaders);

    const response: Response = await request.get("/api/state/descriptions");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(StatusDescriptions);
  });

  it("should accept JSON descriptions responses with charset parameter", async () => {
    mock.onGet(/\/v1\/state\/descriptions$/).reply(200, StatusDescriptions, jsonWithCharsetHeaders);

    const response: Response = await request.get("/api/state/descriptions");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual(StatusDescriptions);
  });

  it("should return a 400 status if the content type is not application/json", async () => {
    mock
      .onGet(/\/v1\/state\/descriptions$/)
      .reply(200, BatchListFromAPI, { "content-type": "bacon" });

    const response: Response = await request.get("/api/state/descriptions");

    expect(response.status).toEqual(400);
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(/\/v1\/state\/descriptions$/).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/state/descriptions");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(/\/v1\/state\/descriptions$/).networkError();

    const response: Response = await request.get("/api/state/descriptions");

    expect(response.status).toEqual(500);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mock.reset();
  });
});
