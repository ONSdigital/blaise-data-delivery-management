import sanitiseLog from "./sanitiseLog.js";

describe("sanitiseLog", () => {
  it("removes line breaks and other control characters", () => {
    expect(sanitiseLog("alpha\n\rbeta\u0000gamma")).toBe("alpha beta gamma");
  });

  it("collapses repeated whitespace", () => {
    expect(sanitiseLog("  one\t\t two   three  ")).toBe("one two three");
  });

  it("handles nullish and non-string values", () => {
    expect(sanitiseLog(undefined)).toBe("");
    expect(sanitiseLog(123)).toBe("123");
  });
});
