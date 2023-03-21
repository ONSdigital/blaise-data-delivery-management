import { getDDFileStatusStyle } from "./batchStatusColour";

describe("Function getDDFileStatusStyle() ", () => {
    it("should return 'dead' is status is inactive", async () => {
        const status = getDDFileStatusStyle("inactive", undefined);
        expect(status).toEqual("dead");
    });

    it("should return 'success' is status is in_arc", async () => {
        const status = getDDFileStatusStyle("in_arc", undefined);
        expect(status).toEqual("success");
    });

    it("should return 'error' is status is errored", async () => {
        const status = getDDFileStatusStyle("errored", undefined);
        expect(status).toEqual("error");
    });

    it("should return 'pending' is status is not inactive, errored or in in_arc", async () => {
        const status = getDDFileStatusStyle("bacon", undefined);
        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is started", async () => {
        const status = getDDFileStatusStyle("started", undefined);
        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is generated", async () => {
        const status = getDDFileStatusStyle("generated", undefined);
        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is in_staging", async () => {
        const status = getDDFileStatusStyle("in_staging", undefined);
        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is encrypted", async () => {
        const status = getDDFileStatusStyle("encrypted", "");
        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is in_nifi_bucket", async () => {
        const status = getDDFileStatusStyle("in_nifi_bucket", null);
        expect(status).toEqual("pending");
    });

    it("should return 'pending' is status is nifi_notified", async () => {
        const status = getDDFileStatusStyle("nifi_notified", null);
        expect(status).toEqual("pending");
    });

    it("should return 'error' is regardless of status if error_info is defined", async () => {
        const status = getDDFileStatusStyle("nifi_notified", "Errored stuff and things");
        expect(status).toEqual("error");
    });
});
