import app from "../server"; // Link to your server file
import supertest, { Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Mock Express Server
const request = supertest(app);
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Data Delivery Trigger Azure", () => {
    it("should return a 200 status and 'completed' when Azure API returns 200", async done => {
        mock.onPost(/^https:\/\/dev.azure.com\/blaise-gcp\/csharp\/_apis\/pipelines/).reply(200, { data: "cool" });

        const response: Response = await request.post("/api/trigger");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual("completed");
        done();
    });

    it("should return a 500 status direct from the Azure Azure API", async done => {
        mock.onPost(/^https:\/\/dev.azure.com\/blaise-gcp\/csharp\/_apis\/pipelines/).reply(500, {});

        const response: Response = await request.post("/api/trigger");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the Azure API request", async done => {
        mock.onPost(/^https:\/\/dev.azure.com\/blaise-gcp\/csharp\/_apis\/pipelines/).networkError();

        const response: Response = await request.post("/api/trigger");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});
