import express, { Request, Response, Router } from "express";
import { EnvironmentVariables } from "../Config";
import { batch_to_data, dd_filename_to_data } from "../../src/Functions";
import { DataDeliveryBatchData, DataDeliveryFileStatus } from "../../Interfaces";
import { SendAPIRequest } from "../SendRequest";
import * as PinoHttp from "pino-http";
import AuthProvider from "../AuthProvider";

export default function DataDeliveryStatus(environmentVariables: EnvironmentVariables, logger: PinoHttp.HttpLogger): Router {
    const { DDS_API_URL, DDS_CLIENT_ID }: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const authProvider = new AuthProvider(DDS_CLIENT_ID);

    router.get("/api/batch/:batchName", async function (req: ResponseQuery, res: Response) {
        const { batchName } = req.params;
        logger(req, res);
        req.log.info(`Called get batch status with batch ${batchName}`);

        const url = `${DDS_API_URL}/v1/batch/${batchName}`;

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
            Object.assign(item, dd_filename_to_data(item.dd_filename));
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
            batchList.push(batch_to_data(item));
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

