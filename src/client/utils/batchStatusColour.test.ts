import { getDataDeliveryFileStatusStyle } from "./batchStatusColour";

describe("Function getDataDeliveryFileStatusStyle() ", () => {
    it("should return 'dead' is status is inactive", async () => {
        const status = getDataDeliveryFileStatusStyle("inactive", undefined);

        expect(status).toEqual("dead");
    });

    it("should return 'success' is status is in_arc", async () => {
        const status = getDataDeliveryFileStatusStyle("in_arc", undefined);

        expect(status).toEqual("success");
    });

    it("should return 'error' is status is errored", async () => {
        const status = getDataDeliveryFileStatusStyle("errored", undefined);

        expect(status).toEqual("error");
    });

    it("should return 'pending' is status is not inactive, errored or in in_arc", async () => {
        const status = getDataDeliveryFileStatusStyle("bacon", undefined);

        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is started", async () => {
        const status = getDataDeliveryFileStatusStyle("started", undefined);

        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is generated", async () => {
        const status = getDataDeliveryFileStatusStyle("generated", undefined);

        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is in_staging", async () => {
        const status = getDataDeliveryFileStatusStyle("in_staging", undefined);

        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is encrypted", async () => {
        const status = getDataDeliveryFileStatusStyle("encrypted", "");

        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is in_nifi_bucket", async () => {
        const status = getDataDeliveryFileStatusStyle("in_nifi_bucket", null);

        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is nifi_notified", async () => {
        const status = getDataDeliveryFileStatusStyle("nifi_notified", null);

        expect(status).toEqual("pending");
    });

    it("should return 'error' is regardless of status if error_info is defined", async () => {
        const status = getDataDeliveryFileStatusStyle("nifi_notified", "Errored stuff and things");

        expect(status).toEqual("error");
    });
});
