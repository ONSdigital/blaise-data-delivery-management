import express, { type Request, type Response, type Router } from "express";

import { batchToData, dataDeliveryFilenameToData } from "../../shared/dataDeliveryParsers.js";
import { type DataDeliveryBatchData, type DataDeliveryFileStatus } from "../../shared/types.js";
import { type EnvironmentVariables } from "../config.js";

import AuthProvider from "./authProvider.js";
import sanitiseLog from "./sanitiseLog.js";
import { sendApiRequest } from "./sendApiRequest.js";
import { validateBatchName } from "./validation.js";

import type * as PinoHttp from "pino-http";

export function extractBatchName(rawBatchName: unknown): string | null {
  if (Array.isArray(rawBatchName)) {
    return typeof rawBatchName[0] === "string" ? rawBatchName[0] : null;
  }

  return typeof rawBatchName === "string" ? rawBatchName : null;
}

export function parseBatchList(
  result: unknown,
  log: Pick<PinoHttp.HttpLogger["logger"], "warn">,
): DataDeliveryBatchData[] {
  if (!Array.isArray(result)) {
    log.warn("Invalid batch list received from DDS API");

    return [];
  }

  return result.flatMap((item: unknown) => {
    if (typeof item !== "string" || item === "") {
      return [];
    }

    try {
      return [batchToData(item)];
    } catch {
      const safeItem = sanitiseLog(item);

      log.warn(`Skipping unrecognised batch name from DDS API: ${safeItem}`);

      return [];
    }
  });
}

export function isJsonContentType(contentType: string): boolean {
  const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase() ?? "";

  return mediaType === "application/json";
}

export default function createDataDeliveryRouter(
  environmentVariables: EnvironmentVariables,
  logger: PinoHttp.HttpLogger,
): Router {
  const { DDS_API_URL, DDS_CLIENT_ID }: EnvironmentVariables = environmentVariables;
  const router = express.Router();

  const authProvider = new AuthProvider(DDS_CLIENT_ID, logger.logger);

  router.get("/api/batch/:batchName", async function (req: Request, res: Response) {
    const batchName = extractBatchName(req.params.batchName);

    try {
      validateBatchName(batchName);
    } catch {
      req.log.warn("Invalid batch name type received");
      res.status(400).json([]);

      return;
    }

    const safeBatchName = sanitiseLog(batchName);

    req.log.info({ batchName: safeBatchName }, "Called get batch status with batch");

    const url = `${DDS_API_URL}/v1/batch/${encodeURIComponent(batchName)}`;

    const authHeader = await authProvider.getAuthHeader();

    req.log.info("Obtained Google auth request header");

    const [status, result, contentType] = (await sendApiRequest(
      logger,
      req,
      res,
      url,
      "GET",
      null,
      authHeader,
    )) as [number, DataDeliveryFileStatus[], string];

    if (status !== 200) {
      res.status(status).json([]);

      return;
    }

    if (!isJsonContentType(contentType)) {
      req.log.warn("Response was not JSON, most likely invalid auth");
      res.status(400).json([]);

      return;
    }

    const fileStatuses = result.map((item: DataDeliveryFileStatus) => ({
      ...item,
      ...dataDeliveryFilenameToData(item.dd_filename),
    }));

    res.status(status).json(fileStatuses);
  });

  router.get("/api/batch", async function (req: Request, res: Response) {
    req.log.info("Called get data delivery status");

    const url = `${DDS_API_URL}/v1/batch`;

    const authHeader = await authProvider.getAuthHeader();

    req.log.info("Obtained Google auth request header");

    const [status, result, contentType] = (await sendApiRequest(
      logger,
      req,
      res,
      url,
      "GET",
      null,
      authHeader,
    )) as [number, string[], string];

    if (status !== 200) {
      res.status(status).json([]);

      return;
    }

    if (!isJsonContentType(contentType)) {
      req.log.warn("Response was not JSON, most likely invalid auth");
      res.status(400).json([]);

      return;
    }

    const batchList = parseBatchList(result, req.log);

    res.status(status).json(batchList);
  });

  router.get("/api/state/descriptions", async function (req: Request, res: Response) {
    req.log.info("Called get Batch Status Descriptions");

    const url = `${DDS_API_URL}/v1/state/descriptions`;

    const authHeader = await authProvider.getAuthHeader();

    req.log.info("Obtained Google auth request header");

    const [status, result, contentType] = await sendApiRequest(
      logger,
      req,
      res,
      url,
      "GET",
      null,
      authHeader,
    );

    if (status !== 200) {
      res.status(status).json([]);

      return;
    }

    if (!isJsonContentType(contentType)) {
      req.log.warn("Response was not JSON, most likely invalid auth");
      res.status(400).json([]);

      return;
    }

    res.status(status).json(result);
  });

  return router;
}
