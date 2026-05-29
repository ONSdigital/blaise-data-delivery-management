import { cleanup } from "@testing-library/react";
import { sendDataDeliveryRequest } from "./dataDelivery";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Function sendDataDeliveryRequest() ", () => {

    it("It should return true the trigger was successful", async () => {
        mock.onPost("/api/trigger").reply(200, "completed");
        const success = await sendDataDeliveryRequest();

        expect(success).toBeTruthy();
    });

    it("It should return false when the trigger returned a 200 but the state was 'failed'", async () => {
        mock.onPost("/api/trigger").reply(200, "failed");
        const success = await sendDataDeliveryRequest();

        expect(success).toBeFalsy();
    });

    it("It should return false when the trigger returned a 200 but the state was 'canceled'", async () => {
        mock.onPost("/api/trigger").reply(200, "cancelled");
        const success = await sendDataDeliveryRequest();

        expect(success).toBeFalsy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock.onPost("/api/trigger").reply(404, []);
        const success = await sendDataDeliveryRequest();

        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock.onPost("/api/trigger").reply(500, {});
        const success = await sendDataDeliveryRequest();

        expect(success).toBeFalsy();
    });

    it("It should return false if request JSON is invalid", async () => {
        mock.onPost("/api/trigger").reply(200, { name: "NAME" });
        const success = await sendDataDeliveryRequest();

        expect(success).toBeFalsy();
    });

    it("It should return false request call fails", async () => {
        mock.onPost("/api/trigger").reply(() => Promise.reject("error"));
        const success = await sendDataDeliveryRequest();

        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
