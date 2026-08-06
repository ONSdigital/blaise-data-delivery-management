import createLogger from "./createLogger.js";

const { pinoHttpFactory } = vi.hoisted(() => ({
  pinoHttpFactory: vi.fn((options?: unknown) => ({
    logger: {
      error: vi.fn(),
      info: vi.fn(),
    },
    options,
  })),
}));

vi.mock("pino-http", () => ({
  default: pinoHttpFactory,
}));

describe("createLogger", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    pinoHttpFactory.mockClear();
  });

  it("uses default non-production options", () => {
    process.env.NODE_ENV = "test";

    const logger = createLogger();

    expect(logger).toBeDefined();
    expect(pinoHttpFactory).toHaveBeenCalledTimes(1);
    expect(pinoHttpFactory).toHaveBeenCalledWith({ autoLogging: false });
  });

  it("includes production formatter and serializer configuration", () => {
    process.env.NODE_ENV = "production";

    createLogger({ autoLogging: true });

    const [[options]] = pinoHttpFactory.mock.calls;
    const typedOptions = options as {
      autoLogging: boolean;
      formatters: {
        level: (label: unknown, number: unknown) => { level: unknown; severity: string };
        log: (info: Record<string, unknown>) => { info: Record<string, unknown> };
      };
      serializers: {
        req: (req: { method?: string; raw?: { user?: string }; url?: string }) => {
          method: string | undefined;
          url: string | undefined;
          user: string | undefined;
        };
      };
    };

    expect(typedOptions.autoLogging).toEqual(true);
    expect(typedOptions.formatters.level("info", 30)).toEqual({
      level: 30,
      severity: "INFO",
    });
    expect(typedOptions.formatters.level("unknown", 30)).toEqual({
      level: 30,
      severity: "INFO",
    });
    expect(typedOptions.formatters.log({ value: "hello" })).toEqual({ info: { value: "hello" } });
    expect(
      typedOptions.serializers.req({
        method: "GET",
        raw: { user: "alice" },
        url: "/health",
      }),
    ).toEqual({
      method: "GET",
      url: "/health",
      user: "alice",
    });
  });
});
