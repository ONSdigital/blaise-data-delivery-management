const { dotenvConfig, errorLogger, exitSpy, infoLogger, listenMock, newServerMock, onMock } =
  vi.hoisted(() => ({
    dotenvConfig: vi.fn(),
    errorLogger: vi.fn(),
    exitSpy: vi.spyOn(process, "exit").mockImplementation(() => undefined as never),
    infoLogger: vi.fn(),
    listenMock: vi.fn(),
    newServerMock: vi.fn(),
    onMock: vi.fn(),
  }));

vi.mock("dotenv", () => ({
  default: {
    config: dotenvConfig,
  },
}));

vi.mock("./config.js", () => ({
  getEnvironmentVariables: vi.fn(() => ({
    DDS_API_URL: "http://localhost",
    DDS_CLIENT_ID: "client-id",
    PROJECT_ID: "project-id",
  })),
}));

vi.mock("./utils/createLogger.js", () => ({
  default: vi.fn(() => ({
    logger: {
      error: errorLogger,
      info: infoLogger,
    },
  })),
}));

vi.mock("./server.js", () => ({
  newServer: newServerMock,
}));

describe("server entrypoint", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPort = process.env.PORT;

  beforeEach(() => {
    vi.resetModules();
    process.env.NODE_ENV = "test";
    process.env.PORT = "7777";

    onMock.mockImplementation((_event: string, _handler: (error: Error) => void) => {
      return { on: onMock };
    });

    listenMock.mockImplementation((_port: string, callback: () => void) => {
      callback();

      return { on: onMock };
    });

    newServerMock.mockImplementation(() => ({
      listen: listenMock,
    }));
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.PORT = originalPort;
    dotenvConfig.mockClear();
    errorLogger.mockClear();
    exitSpy.mockClear();
    infoLogger.mockClear();
    listenMock.mockClear();
    newServerMock.mockClear();
    onMock.mockClear();
  });

  afterAll(() => {
    exitSpy.mockRestore();
  });

  it("loads dotenv outside production and starts server on configured port", async () => {
    await import("./index.js");

    expect(dotenvConfig).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith("7777", expect.any(Function));
    expect(infoLogger).toHaveBeenCalledWith("App is listening on port 7777");
  });

  it("uses default port when PORT is not set", async () => {
    delete process.env.PORT;

    await import("./index.js");

    expect(listenMock).toHaveBeenCalledWith("5000", expect.any(Function));
  });

  it("does not load dotenv in production", async () => {
    process.env.NODE_ENV = "production";

    await import("./index.js");

    expect(dotenvConfig).not.toHaveBeenCalled();
  });

  it("logs and exits when the server emits an error", async () => {
    await import("./index.js");

    const registeredErrorHandler =
      onMock.mock.calls.find(([eventName]) => eventName === "error")?.[1] ?? (() => undefined);
    const error = new Error("listen failed");

    registeredErrorHandler(error);

    expect(errorLogger).toHaveBeenCalledWith(error, "Failed to start server");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
