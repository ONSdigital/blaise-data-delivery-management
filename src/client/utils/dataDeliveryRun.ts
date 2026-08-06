import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { type DataDeliveryBatchData } from "../../shared/types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export function determineOverallStatus(batchEntryStatuses: string[]): string {
  const hasRedAlerts = batchEntryStatuses.includes("error");
  const hasGreyAlerts = batchEntryStatuses.includes("dead");
  const hasAmberAlerts = batchEntryStatuses.includes("pending");

  if (hasRedAlerts) {
    return "error";
  }

  if (hasGreyAlerts) {
    return "dead";
  }

  if (hasAmberAlerts) {
    return "pending";
  }

  return "success";
}

export function parseLondonDateString(dateString: string): Date {
  if (!/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }

  const parsedDate = dayjs.tz(dateString, "DD/MM/YYYY HH:mm:ss", "Europe/London");

  if (!parsedDate.isValid()) {
    return new Date(dateString);
  }

  return parsedDate.toDate();
}

export function getBatchRunStartedDate(batch: DataDeliveryBatchData): Date {
  const parsedDate = parseLondonDateString(batch.dateString);

  if (Number.isNaN(parsedDate.valueOf())) {
    return new Date(batch.date);
  }

  return parsedDate;
}
