import app from "../server"; // Link to your server file
import supertest, { Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    BatchInfoListFromAPI,
    BatchInfoListServerProcessed,
    BatchListFromAPI,
    BatchListServerProcessed, StatusDescriptions
} from "./mockObjects";

// Mock Express Server
const request = supertest(app);
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

describe("Data Delivery Get all batches from API", () => {
    it("should return a 200 status and an empty json list when API returns a empty list", async done => {
        mock.onGet(/\/v1\/batch$/).reply(200, [], jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
        done();
    });

    it("should return a 200 status and an empty json list when API returns batches witch blank names", async done => {
        mock.onGet(/\/v1\/batch$/).reply(200, ["", "", ""], jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
        expect(response.body.length).toStrictEqual(0);
        done();
    });

    it("should return a 200 status and an json list of 3 items when API returns a 3 item string list", async done => {
        mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(BatchListServerProcessed);
        expect(response.body.length).toStrictEqual(3);
        done();
    });

    it("should return a 400 status if the content type is not application/json", async done => {
        mock.onGet(/\/v1\/batch$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(400);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/\/v1\/batch$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/\/v1\/batch$/).networkError();

        const response: Response = await request.get("/api/batch");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Data Delivery Get a specific batch from API", () => {
    it("should return a 200 status and an empty json list when API returns a empty list", async done => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, [], jsonHeaders);

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
        done();
    });

    it("should return a 200 status and an json list of 2 items when API returns a 2 item list", async done => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, BatchInfoListFromAPI, jsonHeaders);

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(BatchInfoListServerProcessed);
        expect(response.body.length).toStrictEqual(3);
        done();
    });

    it("should return a 400 status if the content type is not application/json", async done => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(400);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/\/v1\/batch\/OPN_26032021_112954$/).networkError();

        const response: Response = await request.get("/api/batch/OPN_26032021_112954");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Data Delivery Get status descriptions", () => {
    it("should return a 200 status and an json object when API returns the objects", async done => {
        mock.onGet(/\/v1\/state\/descriptions$/).reply(200, StatusDescriptions, jsonHeaders);

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(StatusDescriptions);
        done();
    });

    it("should return a 400 status if the content type is not application/json", async done => {
        mock.onGet(/\/v1\/state\/descriptions$/).reply(200, BatchListFromAPI, { "content-type": "bacon" });

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(400);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/\/v1\/state\/descriptions$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/\/v1\/state\/descriptions$/).networkError();

        const response: Response = await request.get("/api/state/descriptions");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});
