const { fetchIdToken, getIdTokenClient } = vi.hoisted(() => ({
  fetchIdToken: vi.fn(),
  getIdTokenClient: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  GoogleAuth: class {
    getIdTokenClient = getIdTokenClient;
  },
}));

import getGoogleAuthToken from "./googleTokenProvider.js";

describe("getGoogleAuthToken", () => {
  const logger = { error: vi.fn() };

  afterEach(() => {
    logger.error.mockClear();
    fetchIdToken.mockReset();
    getIdTokenClient.mockReset();
  });

  it("returns the fetched token", async () => {
    getIdTokenClient.mockResolvedValueOnce({ idTokenProvider: { fetchIdToken } });
    fetchIdToken.mockResolvedValueOnce("token-123");

    const token = await getGoogleAuthToken("target-audience", logger);

    expect(getIdTokenClient).toHaveBeenCalledWith("target-audience");
    expect(fetchIdToken).toHaveBeenCalledWith("target-audience");
    expect(token).toEqual("token-123");
  });

  it("throws when token retrieval fails", async () => {
    getIdTokenClient.mockRejectedValueOnce(new Error("boom"));

    await expect(getGoogleAuthToken("target-audience", logger)).rejects.toThrow("boom");
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(Error),
      "Could not get the Google auth token credentials",
    );
  });
});
