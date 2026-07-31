jest.mock("../authProvider", () => {
    return jest.fn().mockImplementation(() => {
        return {
            getAuthHeader: jest.fn().mockResolvedValue({ Authorization: "Bearer mock-token" })
        };
    });
});

import app from "../server";
import supertest, { type Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    BatchInfoListFromAPI,
    BatchInfoListServerProcessed,
    BatchListFromAPI,
    BatchListServerProcessed, StatusDescriptions
} from "./mockObjects";

const request = supertest(app);
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

describe("Data Delivery Get all batches from API", () => {

    beforeEach(() => {
        mock.reset();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mock.onGet(/\/v1\/batch$/).reply(200, [], jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and an empty json list when API returns batches with blank names", async () => {
        mock.onGet(/\/v1\/batch$/).reply(200, ["", "", ""], jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
        expect(response.body.length).toStrictEqual(0);
    });

    it("should return a 200 status and an json list of 3 items when API returns a 3 item string list", async () => {
        mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(BatchListServerProcessed);
        expect(response.body.length).toStrictEqual(3);

    });

    it("should return a 400 status if the content type is not application/json", async () => {
        mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(400);

    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(/\/v1\/batch$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(500);
    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(/\/v1\/batch$/).networkError();

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(500);

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Data Delivery Get a specific batch from API", () => {
    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, [], jsonHeaders);

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);

    });

    it("should return a 200 status and an json list of 2 items when API returns a 2 item list", async () => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, BatchInfoListFromAPI, jsonHeaders);

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(BatchInfoListServerProcessed);
        expect(response.body.length).toStrictEqual(3);

    });

    it("should return a 400 status if the content type is not application/json", async () => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(400);

    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(500);

    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).networkError();

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(500);

    });

    it("should return a 400 status when batchname is not valid", async () => {

        mock.onGet(/\/v1\/batch\/OPN_26032021_1130$/);

        const response: Response = await request.get("/api/batch/OPN_26032021_1130");

        expect(response.status).toEqual(400);
        expect(response.body).toEqual([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Data Delivery Get status descriptions", () => {
    it("should return a 200 status and an json object when API returns the objects", async () => {
        mock.onGet(/\/v1\/state\/descriptions$/).reply(200, StatusDescriptions, jsonHeaders);

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(StatusDescriptions);

    });

    it("should return a 400 status if the content type is not application/json", async () => {
        mock.onGet(/\/v1\/state\/descriptions$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(400);

    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(/\/v1\/state\/descriptions$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(500);
    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(/\/v1\/state\/descriptions$/).networkError();

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(500);

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});
