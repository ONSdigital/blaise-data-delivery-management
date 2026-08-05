import path from "path";
import { fileURLToPath } from "url";

import ejs from "ejs";
import express, { type Express, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { type HttpLogger } from "pino-http";

import { type EnvironmentVariables } from "./config.js";
import createDataDeliveryRouter from "./utils/dataDeliveryRouter.js";
import { keyGeneratorFromForwardedHeader, parseRateLimit } from "./utils/rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_API_RATE_LIMIT = 3000;
const DEFAULT_PAGE_RATE_LIMIT = 1000;

const apiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: parseRateLimit("DDM_API_RATE_LIMIT", DEFAULT_API_RATE_LIMIT),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: keyGeneratorFromForwardedHeader,
  message: { error: "Too many requests, please try again later" },
});

const pageRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: parseRateLimit("DDM_PAGE_RATE_LIMIT", DEFAULT_PAGE_RATE_LIMIT),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: keyGeneratorFromForwardedHeader,
  message: { error: "Too many requests, please try again later" },
});

export function createServerErrorHandler(httpLogger: HttpLogger, errorViewPath: string) {
  return function serverErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: express.NextFunction,
  ) {
    httpLogger(req, res);
    req.log.error(err, err.message);
    res.status(500).render(errorViewPath, {});
  };
}

export function newServer(
  environmentVariables: EnvironmentVariables,
  httpLogger: HttpLogger,
): Express {
  const server = express();

  server.set("trust proxy", 1);
  server.disable("x-powered-by");
  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "data:", "https://cdn.ons.gov.uk"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  server.use(httpLogger);

  const buildFolder = "../client";

  server.set("views", path.join(__dirname, buildFolder));
  server.engine("html", ejs.renderFile);
  server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

  server.use("/api", apiRateLimiter);

  server.use("/", createDataDeliveryRouter(environmentVariables, httpLogger));

  server.get("/ddm-ui/:version/health", function (_req: Request, res: Response) {
    res.status(200).json({ healthy: true });
  });

  server.get("/{*splat}", pageRateLimiter, function (_req: Request, res: Response) {
    res.render("index.html");
  });

  server.use(createServerErrorHandler(httpLogger, path.join(__dirname, "views/500.html")));

  return server;
}
