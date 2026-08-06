import axios from "axios";

import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";

vi.mock("axios", () => ({
  default: vi.fn(),
}));

const mockedAxios = vi.mocked(axios);

describe("requestPromise helpers", () => {
  afterEach(() => {
    mockedAxios.mockReset();
  });

  it("returns null payload for empty response data", async () => {
    mockedAxios.mockResolvedValueOnce({
      data: null,
      status: 204,
    });

    await expect(requestPromiseJson("GET", "/api/no-content")).resolves.toEqual({
      ok: true,
      status: 204,
      data: null,
    });
  });

  it("returns failure response when requestPromiseJson request fails", async () => {
    const error = new Error("network");

    mockedAxios.mockRejectedValueOnce(error);

    await expect(requestPromiseJson("GET", "/api/boom")).resolves.toEqual({
      ok: false,
      status: 500,
      data: null,
    });
  });

  it("throws when requestPromiseJsonList request fails", async () => {
    const error = new Error("network-list");

    mockedAxios.mockRejectedValueOnce(error);

    await expect(requestPromiseJsonList("GET", "/api/boom")).rejects.toThrow("network-list");
  });

  it("returns success with an empty list for a 404 list response", async () => {
    mockedAxios.mockResolvedValueOnce({
      data: { ignored: true },
      status: 404,
    });

    await expect(requestPromiseJsonList("GET", "/api/missing")).resolves.toEqual([true, []]);
  });

  it("returns failure with an empty list for a non-array 200 payload", async () => {
    mockedAxios.mockResolvedValueOnce({
      data: { bad: "shape" },
      status: 200,
    });

    await expect(requestPromiseJsonList("GET", "/api/bad-shape")).resolves.toEqual([false, []]);
  });
});
