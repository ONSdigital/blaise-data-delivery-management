import express, { type Request, type Response, type Router } from "express";
import { type EnvironmentVariables } from "../config";
import type * as PinoHttp from "pino-http";
import { SendAPIRequest } from "../sendRequest";

export default function DataDeliveryTrigger(environmentVariables: EnvironmentVariables, logger: PinoHttp.HttpLogger): Router {
    const { PROJECT_ID, AZURE_AUTH_TOKEN, ENV_NAME, GIT_BRANCH, DATA_DELIVERY_AZURE_PIPELINE_NO }: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const base64token = Buffer.from(`:${AZURE_AUTH_TOKEN}`).toString("base64");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64token}`
    };

    interface ResponseQuery extends Request {
        query: { filename: string }
    }

    router.post("/api/trigger", async function (req: ResponseQuery, res: Response) {
        console.log("Called data delivery trigger");
        const data = {
            "resources": {
                "repositories": { "self": { "refName": `refs/heads/${GIT_BRANCH}` } }
            },
            "templateParameters": { "VarGroup": PROJECT_ID, "Environment": ENV_NAME },
        };

        const url = `https://dev.azure.com/blaise-gcp/csharp/_apis/pipelines/${DATA_DELIVERY_AZURE_PIPELINE_NO}/runs?api-version=6.0-preview.1`;

        const [status] = await SendAPIRequest(logger, req, res, url, "POST", data, headers);

        res.status(status).json("completed");
    });

    return router;
}

