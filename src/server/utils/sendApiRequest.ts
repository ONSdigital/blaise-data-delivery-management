import axios, { type AxiosRequestConfig } from "axios";
import { type Request, type Response } from "express";

import { type JSONValue } from "../../shared/types.js";

import type * as PinoHttp from "pino-http";

type PromiseResponse = [number, unknown, string];

function sanitiseLog(value: unknown): string {
  return (
    String(value ?? "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

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

  try {
    const response = await axios({
      url: safeUrl,
      method: safeMethod,
      data: data,
      headers,
      validateStatus: function (status) {
        return status >= 200;
      },
    });

    if (response.status >= 200 && response.status < 300) {
      req.log.info(`Status ${response.status} from ${safeMethod} ${safeUrl}`);
    } else {
      req.log.warn(`Status ${response.status} from ${safeMethod} ${safeUrl}`);
    }

    let contentType = "";
    const header = response.headers["content-type"];

    if (typeof header === "string") {
      contentType = header;
    }

    return [response.status, response.data, contentType];
  } catch (error) {
    req.log.error(error, `${safeMethod} ${safeUrl} endpoint failed`);

    return [500, null, ""];
  }
}
