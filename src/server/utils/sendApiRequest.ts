import axios, { type AxiosRequestConfig } from "axios";
import { type Request, type Response } from "express";

import { type JSONValue } from "../../shared/types.js";

import sanitiseLog from "./sanitiseLog.js";

import type * as PinoHttp from "pino-http";

type PromiseResponse = [number, unknown, string];

export async function sendApiRequest(
  logger: PinoHttp.HttpLogger,
  req: Request,
  res: Response,
  url: string,
  method: AxiosRequestConfig["method"],
  data: JSONValue | null = null,
  headers: { [key: string]: string },
): Promise<PromiseResponse> {
  const safeMethod = sanitiseLog(method);
  const safeUrl = sanitiseLog(url);
  const safeEndpoint = [safeMethod, safeUrl].filter((value) => value !== "").join(" ");

  try {
    const response = await axios({
      url,
      method,
      data: data,
      headers,
      validateStatus: function (status) {
        return status >= 200;
      },
    });

    if (response.status >= 200 && response.status < 300) {
      req.log.info({ status: response.status, endpoint: safeEndpoint }, "Status from endpoint");
    } else {
      req.log.warn({ status: response.status, endpoint: safeEndpoint }, "Status from endpoint");
    }

    let contentType = "";
    const header = response.headers["content-type"];

    if (typeof header === "string") {
      contentType = header;
    }

    return [response.status, response.data, contentType];
  } catch (error) {
    req.log.error({ err: error, endpoint: safeEndpoint }, "Endpoint failed");

    return [500, null, ""];
  }
}
