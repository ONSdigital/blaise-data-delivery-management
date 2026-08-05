import { type DataDeliveryBatchData } from "../../shared/types";

import {
  determineOverallStatus,
  getBatchRunStartedDate,
  parseLondonDateString,
} from "./dataDeliveryRun";

describe("determineOverallStatus", () => {
  it("returns error when any entry is error", () => {
    expect(determineOverallStatus(["success", "pending", "error"])).toBe("error");
  });

  it("returns dead when there are no errors and an entry is dead", () => {
    expect(determineOverallStatus(["success", "pending", "dead"])).toBe("dead");
  });

  it("returns pending when there are no errors or dead entries", () => {
    expect(determineOverallStatus(["success", "pending"])).toBe("pending");
  });

  it("returns success when all entries are successful", () => {
    expect(determineOverallStatus(["success", "success"])).toBe("success");
  });
});

describe("parseLondonDateString", () => {
  it("parses winter date strings as UTC", () => {
    const parsedDate = parseLondonDateString("24/01/2026 10:30:00");

    expect(parsedDate.toISOString()).toBe("2026-01-24T10:30:00.000Z");
  });

  it("parses summer date strings with BST offset", () => {
    const parsedDate = parseLondonDateString("24/06/2026 10:30:00");

    expect(parsedDate.toISOString()).toBe("2026-06-24T09:30:00.000Z");
  });

  it("falls back to native date parsing when format does not match", () => {
    const parsedDate = parseLondonDateString("2026-06-24T10:30:00.000Z");

    expect(parsedDate.toISOString()).toBe("2026-06-24T10:30:00.000Z");
  });
});

describe("getBatchRunStartedDate", () => {
  it("uses parsed dateString when dateString is valid", () => {
    const batch = {
      date: "2026-01-24T00:00:00.000Z",
      dateString: "24/06/2026 10:30:00",
      name: "OPN_24062026_103000",
    } as DataDeliveryBatchData;

    expect(getBatchRunStartedDate(batch).toISOString()).toBe("2026-06-24T09:30:00.000Z");
  });

  it("falls back to batch.date when dateString cannot be parsed", () => {
    const fallbackDate = new Date("2026-03-01T12:00:00.000Z");
    const batch = {
      date: fallbackDate.toISOString(),
      dateString: "not-a-date",
      name: "OPN_01032026_120000",
    } as DataDeliveryBatchData;

    expect(getBatchRunStartedDate(batch).toISOString()).toBe("2026-03-01T12:00:00.000Z");
  });
});
