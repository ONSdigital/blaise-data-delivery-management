import app from "../server";
import supertest, { type Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const request = supertest(app);
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Data Delivery Trigger Azure", () => {
    it("should return a 200 status and 'completed' when Azure API returns 200", async () => {
        mock.onPost(/^https:\/\/dev\.azure\.com\/blaise-gcp\/csharp\/_apis\/pipelines/).reply(200, { data: "cool" });

        const response: Response = await request.post("/api/trigger");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual("completed");

    });

    it("should return a 500 status direct from the Azure Azure API", async () => {
        mock.onPost(/^https:\/\/dev\.azure\.com\/blaise-gcp\/csharp\/_apis\/pipelines/).reply(500, {});

        const response: Response = await request.post("/api/trigger");

        expect(response.status).toEqual(500);

    });

    it("should return a 500 status when there is a network error from the Azure API request", async () => {
        mock.onPost(/^https:\/\/dev\.azure\.com\/blaise-gcp\/csharp\/_apis\/pipelines/).networkError();

        const response: Response = await request.post("/api/trigger");

        expect(response.status).toEqual(500);

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});
