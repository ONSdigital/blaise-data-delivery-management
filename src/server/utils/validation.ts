export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateBatchName(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new ValidationError("Batch name must be a string");
  }

  if (value.trim() === "") {
    throw new ValidationError("Batch name cannot be empty");
  }

  if (/[\r\n]/.test(value)) {
    throw new ValidationError("Batch name cannot contain newlines or carriage returns");
  }

  // Date/time components with range validation
  const date = `(?:0[1-9]|[12][0-9]|3[01])(?:0[1-9]|1[0-2])(?:19|20)\\d{2}`;
  const time = `(?:[01][0-9]|2[0-3])(?:[0-5][0-9])(?:[0-5][0-9])`;

  // Supported prefix shapes (most-specific first to avoid partial matches):
  //   LMS2605_LJ2_  ([A-Za-z]{3}\d{4}_[A-Za-z0-9]{3}_)
  //   OPN2607L_     ([A-Za-z]{3}\d{4}[A-Za-z]_)
  //   OPN_          ([A-Za-z]+_)
  //   (no prefix)   (26032021_080842)
  const batchNameRegex = new RegExp(
    `^(?:[A-Za-z]{3}[0-9]{4}_[A-Za-z0-9]{3}_|[A-Za-z]{3}[0-9]{4}[A-Za-z]_|[A-Za-z]+_)?${date}_${time}$`,
  );

  if (!batchNameRegex.test(value)) {
    throw new ValidationError(
      `Invalid batch name format: "${value}". Expected one of: DDMMYYYY_HHMMSS, XX_DDMMYYYY_HHMMSS, XXXNNNNL_DDMMYYYY_HHMMSS, XXXNNNN_AAA_DDMMYYYY_HHMMSS`,
    );
  }
}
