import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { MemoryStore } from "./store.js";

async function login(app: Awaited<ReturnType<typeof buildApp>>, mobile = "09121234567") {
  const requested = await app.inject({ method: "POST", url: "/api/auth/request-otp", payload: { mobile } });
  const { challengeId } = requested.json();
  const verified = await app.inject({ method: "POST", url: "/api/auth/verify-otp", payload: { challengeId, code: "12345" } });
  const rawCookie = verified.headers["set-cookie"];
  return { cookie: (Array.isArray(rawCookie) ? rawCookie[0] : rawCookie ?? "").split(";")[0] };
}

describe("production API foundation", () => {
  it("authenticates with single-use OTP and an httpOnly session", async () => {
    const app = await buildApp({ store: new MemoryStore(), env: { NODE_ENV: "test", API_PORT: 8787, DATABASE_URL: "", WEB_ORIGIN: "http://localhost:8080", SESSION_TTL_HOURS: 1 } });
    const requested = await app.inject({ method: "POST", url: "/api/auth/request-otp", payload: { mobile: "09120000000" } });
    const challengeId = requested.json().challengeId;
    const verified = await app.inject({ method: "POST", url: "/api/auth/verify-otp", payload: { challengeId, code: "12345" } });
    expect(verified.statusCode).toBe(200); expect(verified.headers["set-cookie"]).toContain("HttpOnly");
    const replay = await app.inject({ method: "POST", url: "/api/auth/verify-otp", payload: { challengeId, code: "12345" } });
    expect(replay.statusCode).toBe(400);
  });

  it("enforces ownership and payment idempotency", async () => {
    const app = await buildApp({ store: new MemoryStore(), env: { NODE_ENV: "test", API_PORT: 8787, DATABASE_URL: "", WEB_ORIGIN: "http://localhost:8080", SESSION_TTL_HOURS: 1 } });
    const { cookie } = await login(app, "09121111111");
    const created = await app.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie }, payload: { serviceType: "flight", quantity: 1 } });
    expect(created.statusCode).toBe(201);
    const order = created.json().checkoutSession.order;
    const first = await app.inject({ method: "POST", url: `/api/orders/${order.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "checkout-1234", provider: "mock" } });
    const second = await app.inject({ method: "POST", url: `/api/orders/${order.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "checkout-1234", provider: "mock" } });
    expect(first.json().payment.id).toBe(second.json().payment.id);
    const other = await login(app, "09122222222");
    const denied = await app.inject({ method: "GET", url: `/api/orders/${order.id}`, headers: { cookie: other.cookie } });
    expect(denied.statusCode).toBe(404);
  });
});
