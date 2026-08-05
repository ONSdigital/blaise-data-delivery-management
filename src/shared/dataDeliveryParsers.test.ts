import {
  batchToData,
  dataDeliveryFilenameToData,
  generateDateFromString,
} from "./dataDeliveryParsers.js";

describe("DD file to data test", () => {
  it.each([
    ["dd_OPN2102T_12032021_023052.zip", "OPN2102T"],
    ["dd_LMS2101_AA1_27042021_043113.zip", "LMS2101_AA1"],
    ["dd_WLS2301_19012023_155829.zip", "WLS2301"],
  ])("should return the instrumentName", (filename, instrumentName) => {
    const file_data = dataDeliveryFilenameToData(filename);

    expect(file_data.instrumentName).toBe(instrumentName);
  });

  it("returns original filename when format is invalid", () => {
    expect(dataDeliveryFilenameToData("invalid-file-name")).toEqual({
      instrumentName: "invalid-file-name",
    });
  });
});

describe("generateDateFromString", () => {
  it("uses zeroed time when time string is empty", () => {
    const [, dateString] = generateDateFromString("30032021", "");

    expect(dateString).toEqual("30/03/2021 0:0:0");
  });

  it("uses zeroed time when time parts are incomplete", () => {
    const [, dateString] = generateDateFromString("30032021", "12");

    expect(dateString).toEqual("30/03/2021 0:0:0");
  });

  it("uses provided time when six digits are supplied", () => {
    const [, dateString] = generateDateFromString("30032021", "141600");

    expect(dateString).toEqual("30/03/2021 14:16:00");
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
    ["LMS2212_FB1_30032021_141600", "LM", "30/03/2021 14:16:00"],
    ["OPN2101A_30032021_141600", "OPN", "30/03/2021 14:16:00"],
  ])("should return the parsed survey info", (batchName, survey, dateString) => {
    const batch_data = batchToData(batchName);

    expect(batch_data.survey).toBe(survey);
    expect(batch_data.dateString).toBe(dateString);
    expect(batch_data.name).toBe(batchName);
  });

  it("should throw an error for unrecognised batch name format", () => {
    expect(() => {
      batchToData("random-batch-name");
    }).toThrow('Unrecognised batch name format: "random-batch-name"');
  });
});
