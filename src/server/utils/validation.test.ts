import { describe, expect, it } from "vitest";

import { validateBatchName, ValidationError } from "./validation.js";

describe("Validation module", () => {
  describe("ValidationError", () => {
    it("should create an error with correct name", () => {
      const error = new ValidationError("Test error");

      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe("Test error");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("validateBatchName", () => {
    it("should accept valid batch names", () => {
      // simple survey prefix
      expect(() => validateBatchName("LFS_01012024_143022")).not.toThrow();
      expect(() => validateBatchName("OPN_15062023_235959")).not.toThrow();
      expect(() => validateBatchName("ABC_31122025_000000")).not.toThrow();
      // no prefix
      expect(() => validateBatchName("26032021_080842")).not.toThrow();
      // questionnaire name with trailing letter (OPN2607L)
      expect(() => validateBatchName("OPN2607L_26032021_080842")).not.toThrow();
      // 4-segment questionnaire name (LMS2605_LJ2)
      expect(() => validateBatchName("LMS2605_LJ2_26032021_080842")).not.toThrow();
      expect(() => validateBatchName("LMS2212_FB1_30032021_141600")).not.toThrow();
    });

    it("should reject non-string values", () => {
      expect(() => validateBatchName(123)).toThrow(ValidationError);
      expect(() => validateBatchName(null)).toThrow(ValidationError);
      expect(() => validateBatchName(undefined)).toThrow(ValidationError);
    });

    it("should reject empty strings", () => {
      expect(() => validateBatchName("")).toThrow(ValidationError);
      expect(() => validateBatchName("   ")).toThrow(ValidationError);
    });

    it("should reject invalid batch name formats", () => {
      expect(() => validateBatchName("INVALID_BATCH")).toThrow(ValidationError);
      expect(() => validateBatchName("LFS_01012024")).toThrow(ValidationError);
      expect(() => validateBatchName("LFS_01012024_14:30:22")).toThrow(ValidationError);
      // invalid date ranges
      expect(() => validateBatchName("OPN_00012024_143022")).toThrow(ValidationError); // day 00
      expect(() => validateBatchName("OPN_32012024_143022")).toThrow(ValidationError); // day 32
      expect(() => validateBatchName("OPN_01132024_143022")).toThrow(ValidationError); // month 13
      expect(() => validateBatchName("OPN_01011800_143022")).toThrow(ValidationError); // year 1800
      // invalid time ranges
      expect(() => validateBatchName("OPN_01012024_243022")).toThrow(ValidationError); // hour 24
      expect(() => validateBatchName("OPN_01012024_146022")).toThrow(ValidationError); // minute 60
    });

    it("should handle newlines in batch names", () => {
      expect(() => validateBatchName("LFS_01012024_143022\n")).toThrow(ValidationError);
      expect(() => validateBatchName("LFS_01012024_143022\r\n")).toThrow(ValidationError);
    });
  });
});
