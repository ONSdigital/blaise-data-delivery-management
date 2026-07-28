import express, { type Request, type Response, type Router } from "express";
import { type EnvironmentVariables } from "../config";
import { batchToData, dataDeliveryFilenameToData } from "../helpers/dataDeliveryParsers";
import { type DataDeliveryBatchData, type DataDeliveryFileStatus } from "../helpers/types";
import { SendAPIRequest } from "../sendRequest";
import type * as PinoHttp from "pino-http";
import AuthProvider from "../authProvider";

export default function DataDeliveryStatus(environmentVariables: EnvironmentVariables, logger: PinoHttp.HttpLogger): Router {
    const { DDS_API_URL, DDS_CLIENT_ID }: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const authProvider = new AuthProvider(DDS_CLIENT_ID);

    const BATCH_NAME_REGEX =
        /^[A-Z]{2,3}_(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])(19|20)\d{2}_([01][0-9]|2[0-3])([0-5][0-9])([0-5][0-9])$/;

    function isValidBatchName(value: string): boolean {
        return BATCH_NAME_REGEX.test(value);
    }

    router.get("/api/batch/:batchName", async function (req: ResponseQuery, res: Response) {
        const { batchName } = req.params;
        const sanitizedBatchName = batchName.replace(/[\r\n]/g, "");

        logger(req, res);
        req.log.info(`Called get batch status with batch ${sanitizedBatchName}`);

        if (!isValidBatchName(batchName)) {
            req.log.warn(`Invalid batch name received: ${sanitizedBatchName}`);
            res.status(400).json([]);

            return;
        }

        const url = `${DDS_API_URL}/v1/batch/${encodeURIComponent(batchName)}`;

        const authHeader = await authProvider.getAuthHeader();

        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader) as [number, DataDeliveryFileStatus[], string];

        if (status !== 200) {
            res.status(status).json([]);

            return;
        }

        if (contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json([]);

            return;
        }

        result.map((item: DataDeliveryFileStatus) => {
            Object.assign(item, dataDeliveryFilenameToData(item.dd_filename));
        });

        res.status(status).json(result);
    });

    router.get("/api/batch", async function (req: ResponseQuery, res: Response) {
        logger(req, res);
        req.log.info("Called get data delivery status");

        const url = `${DDS_API_URL}/v1/batch`;

        const authHeader = await authProvider.getAuthHeader();

        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader) as [number, string[], string];

        if (status !== 200) {
            res.status(status).json([]);

            return;
        }

        if (contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json([]);

            return;
        }

        const batchList: DataDeliveryBatchData[] = [];

        result.map((item: string) => {
            if (item === "") return;
            batchList.push(batchToData(item));
        });

        res.status(status).json(batchList);

        return;
    });

    router.get("/api/state/descriptions", async function (req: ResponseQuery, res: Response) {
        logger(req, res);
        req.log.info("Called get Batch Status Descriptions");

        const url = `${DDS_API_URL}/v1/state/descriptions`;

        const authHeader = await authProvider.getAuthHeader();

        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);

        if (status !== 200) {
            res.status(status).json([]);

            return;
        }

        if (contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json([]);

            return;
        }

        res.status(status).json(result);
    });

    interface ResponseQuery extends Request {
        query: { filename: string }
    }

    return router;
}

