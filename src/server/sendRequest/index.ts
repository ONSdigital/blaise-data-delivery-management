// Generic function to make requests to the API
import { type Request, type Response } from "express";
import axios, { type AxiosRequestConfig } from "axios";
import type * as PinoHttp from "pino-http";
import { type DataDeliveryBatchData, type DataDeliveryFile, type DataDeliveryFileStatus, type JSONValue } from "../helpers/types";

type PromiseResponse = [
    number,
    DataDeliveryFile | DataDeliveryFile[] | DataDeliveryFileStatus | DataDeliveryFileStatus[] | DataDeliveryBatchData | DataDeliveryBatchData[] | string | JSONValue | { [key: string]: string } | null,
    string
];

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

function sanitizeLog(value: unknown): string {
    return String(value ?? "")
        .replace(/[\r\n\t\f\v]+/g, " ")
        .replace(CONTROL_CHARS, "")
        .trim();
}

export function SendAPIRequest(
    logger: PinoHttp.HttpLogger,
    req: Request,
    res: Response,
    url: string,
    method: AxiosRequestConfig["method"],
    data: JSONValue | null = null,
    headers: { [key: string]: string }): Promise<PromiseResponse> {
    logger(req, res);

    const safeMethod = sanitizeLog(method);
    const safeUrl = sanitizeLog(url);

    return new Promise((resolve: (_object: PromiseResponse) => void) => {
        axios({
            url: safeUrl,
            method: safeMethod,
            data: data,
            headers,
            validateStatus: function (status) {
                return status >= 200;
            },
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                req.log.info(`Status ${response.status} from ${safeMethod} ${safeUrl}`);
            } else {
                req.log.warn(`Status ${response.status} from ${safeMethod} ${safeUrl}`);
            }

            let contentType = "";

            try {
                const header = response.headers["content-type"];

                if (typeof header === "string") {
                    contentType = header;
                }
            } finally {
                resolve([response.status, response.data, contentType]);
            }
        }).catch((error) => {
            req.log.error(error, `${safeMethod} ${safeUrl} endpoint failed`);
            resolve([500, null, ""]);
        });
    });
}