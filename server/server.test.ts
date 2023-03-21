import app from "./server"; // Link to your server file
import supertest, { Response } from "supertest";
const request = supertest(app);

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async done => {
        const response: Response = await request.get("/ddm-ui/version/health");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
        done();
    });
});
