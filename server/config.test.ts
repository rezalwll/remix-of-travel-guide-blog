import { describe, expect, it } from "vitest";
import { parseConfig } from "./config.js";

describe("runtime configuration", () => {
  it("keeps ergonomic development defaults", () => expect(parseConfig({ NODE_ENV: "development" }).WEB_ORIGIN).toBe("http://localhost:8080"));
  it("fails closed for incomplete production configuration", () => {
    expect(() => parseConfig({ NODE_ENV: "production" })).toThrow();
  });
  it("accepts an explicit safe production mock configuration", () => {
    const value = parseConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://db/kiashi", WEB_ORIGIN: "https://example.com", API_PUBLIC_URL: "https://api.example.com", TRUST_PROXY: "172.28.0.10", MOCK_PAYMENT_SECRET: "x".repeat(32), APP_VERSION: "1.2.3", GIT_SHA: "abc1234", BUILD_TIME: "2026-09-21T12:00:00.000Z" });
    expect(value.NODE_ENV).toBe("production");
    expect(value.TRUST_PROXY).toEqual(["172.28.0.10"]);
  });
  it("rejects trusting arbitrary forwarded headers", () => {
    expect(() => parseConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://db/kiashi", WEB_ORIGIN: "https://example.com", API_PUBLIC_URL: "https://api.example.com", TRUST_PROXY: "true", MOCK_PAYMENT_SECRET: "x".repeat(32), APP_VERSION: "1.2.3", GIT_SHA: "abc1234", BUILD_TIME: "2026-09-21T12:00:00.000Z" })).toThrow();
  });
});
