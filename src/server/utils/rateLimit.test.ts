import { ipKeyGenerator } from "express-rate-limit";
import { afterEach, describe, expect, it } from "vitest";

import {
  forwardedHeaderForValue,
  keyGeneratorFromForwardedHeader,
  normaliseForwardedForValue,
  parseRateLimit,
} from "./rateLimit.js";

describe("parseRateLimit", () => {
  const envName = "DDM_TEST_RATE_LIMIT";

  afterEach(() => {
    delete process.env[envName];
  });

  it("returns fallback when value is missing", () => {
    expect(parseRateLimit(envName, 123)).toEqual(123);
  });

  it("returns fallback when value is empty", () => {
    process.env[envName] = "  ";

    expect(parseRateLimit(envName, 456)).toEqual(456);
  });

  it("returns fallback when value is invalid", () => {
    process.env[envName] = "not-a-number";

    expect(parseRateLimit(envName, 789)).toEqual(789);
  });

  it("returns fallback when value is zero", () => {
    process.env[envName] = "0";

    expect(parseRateLimit(envName, 3000)).toEqual(3000);
  });

  it("returns parsed value for valid input", () => {
    process.env[envName] = "42";

    expect(parseRateLimit(envName, 1)).toEqual(42);
  });
});

describe("forwarded header parsing", () => {
  it("normalises unknown and blank values to null", () => {
    expect(normaliseForwardedForValue("unknown")).toBeNull();
    expect(normaliseForwardedForValue('"unknown"')).toBeNull();
    expect(normaliseForwardedForValue("   ")).toBeNull();
  });

  it("normalises bracketed IPv6 values", () => {
    expect(normaliseForwardedForValue("[2001:db8:cafe::17]:4711")).toEqual("2001:db8:cafe::17");
    expect(normaliseForwardedForValue("[")).toBeNull();
  });

  it("normalises IPv4 host:port values", () => {
    expect(normaliseForwardedForValue("192.168.0.1:8080")).toEqual("192.168.0.1");
  });

  it("returns plain token values unchanged", () => {
    expect(normaliseForwardedForValue("proxy-token")).toEqual("proxy-token");
  });

  it("returns first valid forwarded for parameter", () => {
    const value = 'proto=https;for="unknown", for=192.168.1.10:5000;by=203.0.113.43';

    expect(forwardedHeaderForValue(value)).toEqual("192.168.1.10");
  });

  it("returns null when forwarded header has no valid for value", () => {
    expect(forwardedHeaderForValue("proto=https;by=203.0.113.43")).toBeNull();
  });

  it("uses forwarded header in key generator when available", () => {
    const requestLike = {
      headers: {
        forwarded: 'for="192.168.1.15:1234"',
      },
      ip: "10.0.0.1",
      socket: {
        remoteAddress: "127.0.0.1",
      },
    };

    const key = keyGeneratorFromForwardedHeader(
      requestLike as unknown as Parameters<typeof keyGeneratorFromForwardedHeader>[0],
    );

    expect(key).toEqual(ipKeyGenerator("192.168.1.15"));
  });

  it("falls back to request IP when forwarded header is unavailable", () => {
    const requestLike = {
      headers: {},
      ip: "10.0.0.2",
      socket: {
        remoteAddress: "127.0.0.2",
      },
    };

    const key = keyGeneratorFromForwardedHeader(
      requestLike as unknown as Parameters<typeof keyGeneratorFromForwardedHeader>[0],
    );

    expect(key).toEqual(ipKeyGenerator("10.0.0.2"));
  });

  it("supports forwarded header arrays", () => {
    const requestLike = {
      headers: {
        forwarded: ['for="192.168.1.12:9999"', "proto=https"],
      },
      ip: "10.0.0.3",
      socket: {
        remoteAddress: "127.0.0.3",
      },
    };

    const key = keyGeneratorFromForwardedHeader(
      requestLike as unknown as Parameters<typeof keyGeneratorFromForwardedHeader>[0],
    );

    expect(key).toEqual(ipKeyGenerator("192.168.1.12"));
  });

  it("falls back to remoteAddress when forwarded header and req.ip are unavailable", () => {
    const requestLike = {
      headers: {},
      ip: undefined,
      socket: {
        remoteAddress: "127.0.0.4",
      },
    };

    const key = keyGeneratorFromForwardedHeader(
      requestLike as unknown as Parameters<typeof keyGeneratorFromForwardedHeader>[0],
    );

    expect(key).toEqual(ipKeyGenerator("127.0.0.4"));
  });

  it("falls back to unknown when no client IP value exists", () => {
    const requestLike = {
      headers: {},
      ip: undefined,
      socket: {
        remoteAddress: undefined,
      },
    };

    const key = keyGeneratorFromForwardedHeader(
      requestLike as unknown as Parameters<typeof keyGeneratorFromForwardedHeader>[0],
    );

    expect(key).toEqual(ipKeyGenerator("unknown"));
  });
});
