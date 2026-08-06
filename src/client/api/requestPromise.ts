import axios from "axios";

import type { Method } from "axios";

type JsonResponse<TData> = {
  ok: boolean;
  status: number;
  data: TData | null;
};

type PromiseResponseList<TListItem> = [boolean, TListItem[]];

async function requestPromiseJson<TData>(
  method: Method,
  url: string,
  body: unknown = null,
): Promise<JsonResponse<TData>> {
  try {
    const response = await axios({
      url: url,
      method: method,
      data: body,
      validateStatus: () => true,
    });

    const data = (response.data ?? null) as TData | null;

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: null,
    };
  }
}

async function requestPromiseJsonList<TListItem>(
  method: Method,
  url: string,
  body: unknown = null,
): Promise<PromiseResponseList<TListItem>> {
  const response = await axios({
    url: url,
    method: method,
    data: body,
    validateStatus: () => true,
  });

  const data = response.data;

  if (response.status === 200) {
    if (!Array.isArray(data)) {
      return [false, []];
    }

    return [true, data as TListItem[]];
  } else if (response.status === 404) {
    return [true, []];
  } else {
    return [false, []];
  }
}

export { requestPromiseJson, requestPromiseJsonList };
