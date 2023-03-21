import Functions from "./functions";

describe("DD file to data test", () => {
    it.each([
        ["dd_OPN2102T_12032021_023052.zip", "OPN2102T", "dd"],
        ["dd_LMS2101_AA1_27042021_043113.zip", "LMS2101_AA1", "dd"],
        ["dd_WLS2301_19012023_155829.zip", "WLS2301", "dd"]
    ])("should return the prefix and instrumentName", (filename, instrumentName, prefix) => {
        const file_data = Functions.dd_filename_to_data(filename);
        expect(file_data.instrumentName).toBe(instrumentName);
        expect(file_data.prefix).toBe(prefix);
    });
});

describe("Batch name to data", () => {
    it.each([
        ["OPN_26032021_083000", "OPN", "26/03/2021 08:30:00"],
        ["OPN_30032021_141600", "OPN", "30/03/2021 14:16:00"],
        ["LMS_30032021_141600", "LMS", "30/03/2021 14:16:00"],
        ["LM_30032021_141600", "LM", "30/03/2021 14:16:00"],
        ["SOMETHINGLONG_30032021_141600", "SOMETHINGLONG", "30/03/2021 14:16:00"],
        ["30032021_141600", "", "30/03/2021 14:16:00"],
        ["batch-name-RANDOMM-", undefined, "batch-name-RANDOMM-"],
        ["LMS2212_FB1_30032021_141600", "LM", "30/03/2021 14:16:00"],
        ["OPN2101A_30032021_141600", "OPN", "30/03/2021 14:16:00"],
    ])("should return the parsed survey info", (batchName, survey, dateString) => {
        const batch_data = Functions.batch_to_data(batchName);
        expect(batch_data.survey).toBe(survey);
        expect(batch_data.dateString).toBe(dateString);
        expect(batch_data.name).toBe(batchName);
    });
});
