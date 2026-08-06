import { type Request } from "express";
import { ipKeyGenerator } from "express-rate-limit";

export function parseRateLimit(envName: string, fallback: number): number {
  const value = process.env[envName];

  if (value == null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function normaliseForwardedForValue(forwardedForValue: string): string | null {
  const trimmedValue = forwardedForValue.trim().replace(/^"|"$/g, "");

  if (!trimmedValue || trimmedValue.toLowerCase() === "unknown") {
    return null;
  }

  if (trimmedValue.startsWith("[")) {
    const closingBracketIndex = trimmedValue.indexOf("]");

    return closingBracketIndex > 1 ? trimmedValue.slice(1, closingBracketIndex) : null;
  }

  const parts = trimmedValue.split(":");

  if (parts.length === 2 && trimmedValue.includes(".")) {
    return parts[0];
  }

  return trimmedValue;
}

export function forwardedHeaderForValue(forwardedHeaderValue: string): string | null {
  for (const entry of forwardedHeaderValue.split(",")) {
    for (const parameter of entry.split(";")) {
      const [parameterName, parameterValue] = parameter.split("=");

      if (parameterName?.trim().toLowerCase() !== "for" || !parameterValue) {
        continue;
      }

      const normalisedValue = normaliseForwardedForValue(parameterValue);

      if (normalisedValue) {
        return normalisedValue;
      }
    }
  }

  return null;
}

export function keyGeneratorFromForwardedHeader(req: Request): string {
  const forwardedHeaderValue = req.headers.forwarded;
  const combinedHeaderValue = Array.isArray(forwardedHeaderValue)
    ? forwardedHeaderValue.join(",")
    : forwardedHeaderValue;

  const forwardedFor = combinedHeaderValue ? forwardedHeaderForValue(combinedHeaderValue) : null;

  return ipKeyGenerator(forwardedFor ?? req.ip ?? req.socket.remoteAddress ?? "unknown");
}
