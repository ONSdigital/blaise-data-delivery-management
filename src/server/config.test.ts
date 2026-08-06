import { getEnvironmentVariables } from "./config.js";

describe("Config setup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PROJECT_ID: "a-project-name",
      DDS_API_URL: "mock-api",
      DDS_CLIENT_ID: "mock-client-id",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return the correct environment variables", () => {
    const { PROJECT_ID, DDS_API_URL, DDS_CLIENT_ID } = getEnvironmentVariables();

    expect(PROJECT_ID).toBe("a-project-name");
    expect(DDS_API_URL).toBe("mock-api");
    expect(DDS_CLIENT_ID).toBe("mock-client-id");
  });

  it("should throw an error if required variables are not defined", () => {
    process.env.PROJECT_ID = undefined;
    process.env.DDS_API_URL = undefined;
    process.env.DDS_CLIENT_ID = undefined;

    expect(() => getEnvironmentVariables()).toThrow(
      "Missing required environment variables: PROJECT_ID, DDS_API_URL, DDS_CLIENT_ID",
    );
  });
});
