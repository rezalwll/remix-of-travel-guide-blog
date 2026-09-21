// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProviderRegistry } from "./registry.js";
import { ProviderHttpClient } from "./http-client.js";
import { redactProviderData, sanitizeProviderPayload } from "./redaction.js";
import { buildProviderStubServer } from "./testing/stub-server.js";
import { verifyPaymentContract, verifySmsContract, verifyTravelContract } from "./testing/contract-kit.js";
import { config } from "../config.js";

describe("provider contract kit", () => {
  const registry = createProviderRegistry();
  it("certifies SMS", () => verifySmsContract(registry.sms));
  it("certifies payment", () => verifyPaymentContract(registry.payment));
  it("certifies travel adapters", async () => { for (const kind of ["flight", "hotel", "train", "bus", "insurance", "cip", "transfer", "visa"] as const) await verifyTravelContract(registry[kind]); });
});

describe("provider HTTP boundary", () => {
  const stub = buildProviderStubServer("test");
  let baseUrl = "";
  beforeAll(async () => { baseUrl = await stub.listen({ port: 0, host: "127.0.0.1" }); });
  afterAll(async () => { await stub.close(); });
  it("parses success and rejects malformed payloads", async () => {
    const client = new ProviderHttpClient({ provider: "stub", baseUrl, timeoutMs: 100, maxAttempts: 1 });
    await expect(client.request<{ status: string }>({ path: "/sms/send", method: "POST", requestId: "contract-http", operation: "send", body: {} })).resolves.toMatchObject({ status: "queued" });
    await expect(client.request({ path: "/sms/send", method: "POST", requestId: "contract-malformed", operation: "send", headers: { "x-stub-scenario": "malformed" }, body: {} })).rejects.toMatchObject({ category: "MALFORMED_RESPONSE" });
  });
  it("normalizes timeout and rate limiting", async () => {
    const client = new ProviderHttpClient({ provider: "stub", baseUrl, timeoutMs: 20, maxAttempts: 1 });
    await expect(client.request({ path: "/payments", method: "POST", requestId: "contract-timeout", operation: "createPayment", headers: { "x-stub-scenario": "timeout" }, body: {} })).rejects.toMatchObject({ category: "TIMEOUT" });
    await expect(client.request({ path: "/travel/search", method: "POST", requestId: "contract-rate", operation: "search", headers: { "x-stub-scenario": "rate-limit" }, body: {} })).rejects.toMatchObject({ category: "RATE_LIMIT" });
  });
});

describe("provider redaction", () => {
  it("redacts recursively and caps persistence payload size", () => {
    const redacted = redactProviderData({ token: "secret", nested: { signature: "sig", safe: "ok" } });
    expect(redacted).toEqual({ token: "[REDACTED]", nested: { signature: "[REDACTED]", safe: "ok" } });
    expect(sanitizeProviderPayload({ safe: "x".repeat(500) }, { maxBytes: 32 })).toMatchObject({ truncated: true });
  });
});

describe("provider activation", () => {
  it("reports sandbox lifecycle without exposing configuration", async () => {
    const registry = createProviderRegistry();
    expect((await registry.status()).every((entry) => entry.lifecycle === "SANDBOX")).toBe(true);
    expect(JSON.stringify(await registry.status())).not.toContain("SECRET");
  });
  it("fails closed when real configuration is incomplete", () => {
    expect(() => createProviderRegistry({ ...config, SMS_PROVIDER_MODE: "real", SMS_PROVIDER: "vendor" })).toThrow("missing required configuration");
  });
  it("never falls back to mock for an unavailable real adapter", () => {
    expect(() => createProviderRegistry({ ...config, PAYMENT_PROVIDER_MODE: "real", PAYMENT_PROVIDER: "vendor", PAYMENT_PROVIDER_BASE_URL: "https://payments.example.test", PAYMENT_PROVIDER_MERCHANT_ID: "merchant", PAYMENT_PROVIDER_SECRET: "a-private-secret-value" })).toThrow("not available in this build");
  });
  it("blocks calls when an activation flag disables a provider", async () => {
    const registry = createProviderRegistry({ ...config, TRAVEL_PROVIDER_MODE: "disabled" });
    await expect(registry.flight.search({})).rejects.toMatchObject({ category: "CONFIGURATION" });
  });
});
