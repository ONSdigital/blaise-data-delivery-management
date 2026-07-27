import { cleanup } from "@testing-library/react";
import { getAllBatches, getBatchInfo, getBatchStatusDescriptions } from "./dataDeliveryStatus";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const BatchList = [
    { survey: "OPN", date: "2021-03-26T11:29:54.000Z", name: "OPN_26032021_112954" },
    { survey: "OPN", date: "2021-03-25T14:58:38.000Z", name: "OPN_25032021_145838" },
    { survey: "OPN", date: "2021-03-24T16:50:33.000Z", name: "OPN_24032021_165033" }
];

describe("Function getAllBatches(filename: string) ", () => {

    it("It should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/batch").reply(200, BatchList);
        const [success, batches] = await getAllBatches();

        expect(success).toBeTruthy();
        expect(batches).toEqual(batches);
    });

    it("It should return true with an empty list if a 404 is returned from the server", async () => {
        mock.onGet("/api/batch").reply(404, []);
        const [success, batches] = await getAllBatches();

        expect(success).toBeTruthy();
        expect(batches).toEqual([]);
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock.onGet("/api/batch").reply(500, {});
        const [success, batches] = await getAllBatches();

        expect(success).toBeFalsy();
        expect(batches).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is invalid", async () => {
        mock.onGet("/api/batch").reply(200, { name: "NAME" });
        const [success, batches] = await getAllBatches();

        expect(success).toBeFalsy();
        expect(batches).toEqual([]);
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock.onGet("/api/batch").reply(() => {
            throw "error";
        });
        const [success, batches] = await getAllBatches();

        expect(success).toBeFalsy();
        expect(batches).toEqual([]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

const BatchInfoList = [
    {
        batch: "OPN_26032021_121540",
        dd_filename: "OPN2004A",
        instrumentName: "OPN2004A",
        prefix: "dd",
        state: "inactive",
        updated_at: "2021-03-26T12:21:10+00:00"
    },
    {
        batch: "OPN_26032021_121540",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        prefix: "dd",
        state: "generated",
        updated_at: "2021-03-26T12:21:10+00:00"
    }
];

describe("Function getBatchInfo(filename: string) ", () => {

    it("It should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/batch/OPN_26032021_121540").reply(200, BatchInfoList);
        const [success, batchInfo] = await getBatchInfo("OPN_26032021_121540");

        expect(success).toBeTruthy();
        expect(batchInfo).toEqual(batchInfo);
    });

    it("It should return true with an empty list if a 404 is returned from the server", async () => {
        mock.onGet("/api/batch/OPN_26032021_121540").reply(404, []);
        const [success, batchInfo] = await getBatchInfo("OPN_26032021_121540");

        expect(success).toBeTruthy();
        expect(batchInfo).toEqual([]);
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock.onGet("/api/batch/OPN_26032021_121540").reply(500, {});
        const [success, batchInfo] = await getBatchInfo("OPN_26032021_121540");

        expect(success).toBeFalsy();
        expect(batchInfo).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is invalid", async () => {
        mock.onGet("/api/batch/OPN_26032021_121540").reply(200, { name: "NAME" });
        const [success, batchInfo] = await getBatchInfo("OPN_26032021_121540");

        expect(success).toBeFalsy();
        expect(batchInfo).toEqual([]);
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock.onGet("/api/batch/OPN_26032021_121540").reply(() => {
            throw "error";
        });
        const [success, batchInfo] = await getBatchInfo("OPN_26032021_121540");

        expect(success).toBeFalsy();
        expect(batchInfo).toEqual([]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

const StatusDescriptions = {
    "inactive": "The data delivery instrument has no active survey days, we will not generate a data delivery file, we should never alert",
    "started": "The data delivery process has found an instrument with active survey days",
    "generated": "The data delivery process has generated the required files",
    "in_staging": "The data delivery files have been copied to the staging bucket",
    "encrypted": "The data delivery files have been encrypted and are ready for NiFi",
    "in_nifi_bucket": "The data delivery files are in the NiFi bucket",
    "nifi_notified": "NiFi has been notified that we have files to ingest",
    "in_arc": "NiFi has copied the files to ARC (on prem) and sent a receipt",
    "errored": "An error has occurred processing the file (error receipt from NiFi for example)",
};

describe("Function getBatchStatusDescriptions(filename: string) ", () => {

    it("It should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/state/descriptions").reply(200, StatusDescriptions);
        const [success, batchStatusDescriptions] = await getBatchStatusDescriptions();

        expect(success).toBeTruthy();
        expect(batchStatusDescriptions).toEqual(batchStatusDescriptions);
    });

    it("It should return true with an empty list if a 404 is returned from the server", async () => {
        mock.onGet("/api/state/descriptions").reply(404, []);
        const [success, batchStatusDescriptions] = await getBatchStatusDescriptions();

        expect(success).toBeTruthy();
        expect(batchStatusDescriptions).toEqual({});
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock.onGet("/api/state/descriptions").reply(500, {});
        const [success, batchStatusDescriptions] = await getBatchStatusDescriptions();

        expect(success).toBeFalsy();
        expect(batchStatusDescriptions).toEqual({});
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock.onPost("/api/state/descriptions").reply(() => Promise.reject("error"));
        const [success, batchStatusDescriptions] = await getBatchStatusDescriptions();

        expect(success).toBeFalsy();
        expect(batchStatusDescriptions).toEqual({});
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
