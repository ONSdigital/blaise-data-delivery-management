// Generic function to make requests to the API
import { Request, Response } from "express";
import axios, { AxiosRequestConfig } from "axios";
import * as PinoHttp from "pino-http";
import { DataDeliveryBatchData, DataDeliveryFile, DataDeliveryFileStatus, JSONValue } from "../../Interfaces";

type PromiseResponse = [
    number,
    DataDeliveryFile | DataDeliveryFile[] | DataDeliveryFileStatus | DataDeliveryFileStatus[] | DataDeliveryBatchData | DataDeliveryBatchData[] | string | JSONValue | { [key: string]: string } | null,
    string
];

export function SendAPIRequest(
    logger: PinoHttp.HttpLogger,
    req: Request,
    res: Response,
    url: string,
    method: AxiosRequestConfig["method"],
    data: JSONValue | null = null,
    headers: { [key: string]: string } | null = null): Promise<PromiseResponse> {
    logger(req, res);

    return new Promise((resolve: (object: PromiseResponse) => void) => {
        axios({
            url: url,
            method: method,
            data: data,
            headers,
            validateStatus: function (status) {
                return status >= 200;
            },
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                req.log.info(`Status ${response.status} from ${method} ${url}`);
            } else {
                req.log.warn(`Status ${response.status} from ${method} ${url}`);
            }
            let contentType = "";
            try {
                contentType = response.headers["content-type"];
            } finally {
                resolve([response.status, response.data, contentType]);
            }
        }).catch((error) => {
            req.log.error(error, `${method} ${url} endpoint failed`);
            resolve([500, null, ""]);
        });
    });
}