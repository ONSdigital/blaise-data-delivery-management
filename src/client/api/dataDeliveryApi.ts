import { type DataDeliveryBatchData, type DataDeliveryFileStatus } from "../../shared/types";

import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";

type BatchListResponse = [boolean, DataDeliveryBatchData[]];
type BatchInfoResponse = [boolean, DataDeliveryFileStatus[]];
type StatusDescriptionsResponse = [boolean, { [key: string]: string }];

function isStringRecord(value: unknown): value is { [key: string]: string } {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry: unknown) => typeof entry === "string");
}

async function getAllBatches(): Promise<BatchListResponse> {
  const url = "/api/batch";

  try {
    const [success, data] = await requestPromiseJsonList<DataDeliveryBatchData>("GET", url);

    if (!success) {
      return [false, []];
    }

    return [true, data];
  } catch {
    return [false, []];
  }
}

async function getBatchInfo(batchName: string): Promise<BatchInfoResponse> {
  const url = `/api/batch/${batchName}`;

  try {
    const [success, data] = await requestPromiseJsonList<DataDeliveryFileStatus>("GET", url);

    if (!success) {
      return [false, []];
    }

    return [true, data];
  } catch {
    return [false, []];
  }
}

async function getBatchStatusDescriptions(): Promise<StatusDescriptionsResponse> {
  const url = "/api/state/descriptions";

  const response = await requestPromiseJson<{ [key: string]: string }>("GET", url);

  if (response.status === 200 && isStringRecord(response.data)) {
    return [true, response.data];
  }

  if (response.status === 404) {
    return [true, {}];
  }

  if (!response.ok) {
    return [false, {}];
  }

  return [false, {}];
}

export { getAllBatches, getBatchInfo, getBatchStatusDescriptions };
