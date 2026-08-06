import AuthProvider from "./authProvider.js";

import jwt from "jsonwebtoken";

vi.mock("./googleTokenProvider.js");
import getGoogleAuthToken from "./googleTokenProvider.js";

const mockedGetGoogleAuthToken = vi.mocked(getGoogleAuthToken);
const logger = {
  warn: vi.fn(),
  error: vi.fn(),
};

function mock_AuthToken(token: string) {
  mockedGetGoogleAuthToken.mockImplementationOnce(() => {
    return Promise.resolve(token);
  });
}

describe("AuthProvider", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("We can get back Auth headers with a token", async () => {
    const fakeUniqueAccessToken = "test_UniqueAccessTokenValue";

    mock_AuthToken(fakeUniqueAccessToken);
    const googleAuthProvider = new AuthProvider("DDS_CLIENT_ID", logger);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({ Authorization: `Bearer ${fakeUniqueAccessToken}` });
    expect(mockedGetGoogleAuthToken).toHaveBeenCalledWith("DDS_CLIENT_ID", logger);
  });

  it("We get a new token when a token has expired", async () => {
    // Setup old token for 30 seconds in the past
    const older_token = jwt.sign({ foo: "bar", exp: Math.floor(Date.now() / 1000) - 30 }, "shh");

    mock_AuthToken(older_token);
    const googleAuthProvider = new AuthProvider("DDS_CLIENT_ID", logger);

    await googleAuthProvider.getAuthHeader();

    const fakeUpdatedAccessToken = "test_UpdatedAccessTokenValue";

    mock_AuthToken(fakeUpdatedAccessToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({ Authorization: `Bearer ${fakeUpdatedAccessToken}` });
    expect(logger.warn).toHaveBeenCalledWith(
      "Auth token expired, calling for new Google auth token",
    );
  });

  it("We receive the same token if it hasn't expired", async () => {
    // Setup token for an hour in the future
    const older_token = jwt.sign(
      { foo: "bar", exp: Math.floor(Date.now() / 1000) + 60 * 60 },
      "shh",
    );

    mock_AuthToken(older_token);
    const googleAuthProvider = new AuthProvider("DDS_CLIENT_ID", logger);

    await googleAuthProvider.getAuthHeader();

    const fakeUpdatedToken = "test_SecondaryTokenCalled";

    mock_AuthToken(fakeUpdatedToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({ Authorization: `Bearer ${older_token}` });
    expect(mockedGetGoogleAuthToken).toHaveBeenCalledTimes(1);
  });

  it("We get a new token when a token is invalid", async () => {
    // Setup old token which is broken
    mock_AuthToken("%%%%%");
    const googleAuthProvider = new AuthProvider("DDS_CLIENT_ID", logger);

    await googleAuthProvider.getAuthHeader();

    const fakeUpdatedAccessToken = "test_UpdatedAccessTokenValue";

    mock_AuthToken(fakeUpdatedAccessToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({ Authorization: `Bearer ${fakeUpdatedAccessToken}` });
    expect(logger.warn).toHaveBeenCalledWith(
      "Failed to decode token, calling for new Google auth token",
    );
  });

  it("We get a new token when a token has no exp claim", async () => {
    const tokenWithoutExpiry = jwt.sign({ foo: "bar" }, "shh");

    mock_AuthToken(tokenWithoutExpiry);
    const googleAuthProvider = new AuthProvider("DDS_CLIENT_ID", logger);

    await googleAuthProvider.getAuthHeader();

    const fakeUpdatedAccessToken = "test_UpdatedAccessTokenWithoutExp";

    mock_AuthToken(fakeUpdatedAccessToken);

    const authHeader = await googleAuthProvider.getAuthHeader();

    expect(authHeader).toEqual({ Authorization: `Bearer ${fakeUpdatedAccessToken}` });
    expect(logger.warn).toHaveBeenCalledWith(
      "Token expiry is undefined, calling for new Google auth token",
    );
  });
});
