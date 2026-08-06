import { type IncomingMessage } from "http";

import logger from "pino-http";

import sanitiseLog from "./sanitiseLog.js";

import type * as PinoHttp from "pino-http";

const PinoLevelToSeverityLookup = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

type PinoLevel = keyof typeof PinoLevelToSeverityLookup;

function isPinoLevel(value: unknown): value is PinoLevel {
  return typeof value === "string" && value in PinoLevelToSeverityLookup;
}

const defaultPinoConf = {
  messageKey: "message",
  formatters: {
    level(label: unknown, number: unknown) {
      return {
        severity: isPinoLevel(label)
          ? PinoLevelToSeverityLookup[label]
          : PinoLevelToSeverityLookup["info"],
        level: number,
      };
    },
    log(info: Record<string, unknown>) {
      return { info };
    },
  },
  serializers: {
    req: (req: IncomingMessage & { raw?: { user?: unknown } }) => ({
      method: sanitiseLog(req.method),
      url: sanitiseLog(req.url),
      user: req.raw?.user,
    }),
  },
};

export default function createLogger(options = { autoLogging: false }): PinoHttp.HttpLogger {
  let pinoConfig = {};

  if (process.env.NODE_ENV === "production") {
    pinoConfig = defaultPinoConf;
  }

  const pinoHttp = logger as unknown as (options?: PinoHttp.Options) => PinoHttp.HttpLogger;

  return pinoHttp(Object.assign({}, options, pinoConfig));
}
