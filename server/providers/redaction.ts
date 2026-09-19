import { createHash } from "node:crypto";

const secretKey = /(?:authorization|api[-_]?key|secret|token|password|signature|credential|cookie|otp|code|cvv|pan|card|mobile|phone)/i;

export type RedactionOptions = { maxDepth?: number; maxItems?: number; maxStringLength?: number; maxBytes?: number };

export function redactProviderData(value: unknown, options: RedactionOptions = {}, depth = 0): unknown {
  const maxDepth = options.maxDepth ?? 6;
  const maxItems = options.maxItems ?? 50;
  const maxStringLength = options.maxStringLength ?? 500;
  if (depth >= maxDepth) return "[MAX_DEPTH]";
  if (typeof value === "string") return value.length > maxStringLength ? `${value.slice(0, maxStringLength)}[TRUNCATED]` : value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, maxItems).map((entry) => redactProviderData(entry, options, depth + 1));
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, maxItems).map(([key, entry]) => [key, secretKey.test(key) ? "[REDACTED]" : redactProviderData(entry, options, depth + 1)]));
}

export function sanitizeProviderPayload(value: unknown, options: RedactionOptions = {}): Record<string, unknown> {
  const redacted = redactProviderData(value, options);
  const object = redacted && typeof redacted === "object" && !Array.isArray(redacted) ? redacted as Record<string, unknown> : { value: redacted };
  const serialized = JSON.stringify(object);
  const maxBytes = options.maxBytes ?? 16_384;
  return Buffer.byteLength(serialized) <= maxBytes ? object : { truncated: true, originalBytes: Buffer.byteLength(serialized) };
}

export function fingerprintSensitiveValue(value?: string) {
  if (!value) return undefined;
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
