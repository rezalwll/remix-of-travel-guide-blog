import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";
import { PrismaRuntimeRepository } from "./repositories/prisma-runtime.js";
import { createProviderRegistry } from "./providers/registry.js";
import { MockPaymentGateway } from "./providers/payment.js";
import { MockTravelSupplier } from "./providers/travel.js";
import { mockFlights } from "../src/data/flights.js";
import { vi } from "vitest";

const databaseUrl = process.env.DATABASE_URL_TEST;
const integration = describe.skipIf(!databaseUrl);
const env = { NODE_ENV: "test" as const, API_PORT: 8787, DATABASE_URL: databaseUrl ?? "", WEB_ORIGIN: "http://localhost:8080", SESSION_TTL_HOURS: 1 };
const prisma = new PrismaClient({ datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined });
let repository: PrismaRuntimeRepository;

async function login(app: Awaited<ReturnType<typeof buildApp>>, mobile: string) {
  const requested = await app.inject({ method: "POST", url: "/api/auth/request-otp", payload: { mobile } });
  const challengeId = requested.json().challengeId;
  const verified = await app.inject({ method: "POST", url: "/api/auth/verify-otp", payload: { challengeId, code: "12345" } });
  const rawCookie = verified.headers["set-cookie"];
  return (Array.isArray(rawCookie) ? rawCookie[0] : rawCookie ?? "").split(";")[0];
}

integration("PostgreSQL runtime persistence", () => {
  beforeAll(async () => { repository = new PrismaRuntimeRepository(prisma); await repository.connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  it("persists session, checkout, order and wallet debit across app restart", async () => {
    const mobile = `09${String(Date.now()).slice(-9)}`;
    const firstApp = await buildApp({ repository, env });
    const cookie = await login(firstApp, mobile);
    const user = await prisma.user.findUniqueOrThrow({ where: { mobile } });
    await prisma.wallet.update({ where: { userId: user.id }, data: { balance: 20_000_000 } });
    const me = await firstApp.inject({ method: "GET", url: "/api/auth/me", headers: { cookie } });
    expect(me.statusCode).toBe(200);
    const profile = await firstApp.inject({ method: "PATCH", url: "/api/account/profile", headers: { cookie }, payload: { firstName: "رضا", lastName: "احمدی", email: "reza@example.com", birthDate: "1990-03-12", nationalId: "0012345678" } });
    expect(profile.statusCode).toBe(200);
    expect(profile.json().user.email).toBe("reza@example.com");
    const created = await firstApp.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie }, payload: { serviceType: "flight", quantity: 1 } });
    expect(created.statusCode).toBe(201);
    const checkout = created.json().checkoutSession;
    const paid = await firstApp.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "integration-payment-1", method: "wallet" } });
    expect(paid.statusCode).toBe(200);
    const order = paid.json().order;
    await firstApp.close();

    const restartedPrisma = new PrismaClient({ datasources: { db: { url: databaseUrl! } } });
    const restartedRepository = new PrismaRuntimeRepository(restartedPrisma);
    await restartedRepository.connect();
    const secondApp = await buildApp({ repository: restartedRepository, env });
    expect((await secondApp.inject({ method: "GET", url: "/api/auth/me", headers: { cookie } })).statusCode).toBe(200);
    expect((await secondApp.inject({ method: "GET", url: "/api/account/profile", headers: { cookie } })).json().user.nationalId).toBe("0012345678");
    const orders = await secondApp.inject({ method: "GET", url: "/api/account/orders", headers: { cookie } });
    expect(orders.json().orders.some((item: { id: string }) => item.id === order.id)).toBe(true);
    const duplicate = await secondApp.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "integration-payment-1", method: "wallet" } });
    expect(duplicate.json().payment.id).toBe(paid.json().payment.id);
    const wallet = await restartedPrisma.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    expect(wallet.balance).toBe(20_000_000 - checkout.total);
    expect(await restartedPrisma.walletTransaction.count({ where: { walletId: wallet.id } })).toBe(1);
    await secondApp.close();
    await restartedPrisma.$disconnect();
  });

  it("requires matching mobile for tracking and masks the response", async () => {
    const mobile = `09${String(Date.now() + 1).slice(-9)}`;
    const app = await buildApp({ repository, env });
    const cookie = await login(app, mobile);
    const checkout = (await app.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie }, payload: { serviceType: "ziyarat", quantity: 1 } })).json().checkoutSession;
    const paid = await app.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "tracking-payment-1", method: "online_mock" } });
    const order = paid.json().order;
    expect((await app.inject({ method: "POST", url: "/api/order-tracking", payload: { identifier: order.orderNumber, mobile: "09120000000" } })).statusCode).toBe(404);
    const tracked = await app.inject({ method: "POST", url: "/api/order-tracking", payload: { identifier: order.trackingCode, mobile } });
    expect(tracked.statusCode).toBe(200);
    expect(tracked.json().tracking.buyerMobile).toContain("***");
    await app.close();
  });

  it("routes OTP through the SMS interface and processes signed callbacks once", async () => {
    const mobile = `09${String(Date.now() + 2).slice(-9)}`;
    const gateway = new MockPaymentGateway();
    const send = vi.fn().mockResolvedValue({ status: "sent", providerReference: "SMS-TEST" });
    const providers = { ...createProviderRegistry(), payment: gateway, sms: { name: "probe", send, checkStatus: async () => "sent" as const } };
    const app = await buildApp({ repository, env, providers });
    const cookie = await login(app, mobile);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ mobile, template: "login_otp" }));
    const checkoutResponse = await app.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie }, payload: { serviceType: "flight", quantity: 1, service: { outbound: mockFlights[0] } } });
    expect(checkoutResponse.statusCode).toBe(201);
    const checkoutId = checkoutResponse.json().checkoutSession.id;
    const created = await app.inject({ method: "POST", url: `/api/checkout/sessions/${checkoutId}/payment-intents`, headers: { cookie }, payload: { idempotencyKey: "callback-integration-1", method: "online_mock" } });
    expect(created.statusCode).toBe(201);
    const reference = created.json().paymentIntent.externalReference;
    const callbackUrl = "/api/payments/callback/mock";
    const unsigned = await app.inject({ method: "POST", url: callbackUrl, payload: { externalReference: reference, status: "succeeded" } });
    expect(unsigned.statusCode).toBe(400);
    const callback = gateway.createTestCallback(reference, "succeeded");
    const paid = await app.inject({ method: "POST", url: callbackUrl, payload: callback });
    expect(paid.statusCode).toBe(200);
    expect(paid.json()).toMatchObject({ ok: true, status: "succeeded", duplicate: false });
    const order = await prisma.order.findUniqueOrThrow({ where: { checkoutSessionId: checkoutId } });
    expect(order.bookingStatus).toBe("confirmed");
    expect(order.providerName).toBe("flight-mock");
    const repeated = await app.inject({ method: "POST", url: callbackUrl, payload: callback });
    expect(repeated.statusCode).toBe(200);
    expect(repeated.json()).toMatchObject({ ok: true, duplicate: true });
    expect(await prisma.paymentCallback.count({ where: { externalReference: reference } })).toBe(1);
    expect(await prisma.bookingAttempt.count({ where: { orderId: order.id } })).toBe(1);
    await app.close();
  });

  it("keeps failed and cancelled mock simulations unpaid", async () => {
    const mobile = `09${String(Date.now() + 3).slice(-9)}`;
    const app = await buildApp({ repository, env });
    const cookie = await login(app, mobile);
    const checkout = (await app.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie }, payload: { serviceType: "hotel", quantity: 1 } })).json().checkoutSession;
    for (const status of ["failed", "cancelled"] as const) {
      const created = await app.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payment-intents`, headers: { cookie }, payload: { idempotencyKey: `simulate-${status}-1`, method: "online_mock" } });
      expect(created.statusCode).toBe(201);
      const reference = created.json().paymentIntent.externalReference;
      const url = `/api/payments/mock/${reference}/simulate`;
      expect((await app.inject({ method: "POST", url, payload: { status } })).statusCode).toBe(401);
      const simulated = await app.inject({ method: "POST", url, headers: { cookie }, payload: { status } });
      expect(simulated.statusCode).toBe(200);
      expect(simulated.json().verification.status).toBe(status);
    }
    expect(await prisma.order.count({ where: { checkoutSessionId: checkout.id } })).toBe(0);
    await app.close();
  });

  it("automatically compensates a deterministic supplier failure exactly once", async () => {
    const mobile = `09${String(Date.now() + 4).slice(-9)}`;
    const gateway = new MockPaymentGateway();
    const providers = { ...createProviderRegistry(), payment: gateway, flight: new MockTravelSupplier("flight-mock", [{ id: "fail-after-pay", price: 8_900_000, mockBookingOutcome: "failed" }]) };
    const app = await buildApp({ repository, env, providers });
    const cookie = await login(app, mobile);
    const user = await prisma.user.findUniqueOrThrow({ where: { mobile } });
    await prisma.wallet.update({ where: { userId: user.id }, data: { balance: 2_000_000 } });
    const created = await app.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie }, payload: { serviceType: "flight", quantity: 1, service: { outbound: { id: "fail-after-pay", price: 8_900_000 } } } });
    const checkout = created.json().checkoutSession;
    const payment = await app.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "compensation-integration-1", method: "combined" } });
    expect(payment.statusCode).toBe(200);
    expect(payment.json().order.bookingStatus).toBe("refunded");
    const orderId = payment.json().order.id;
    expect(await prisma.refundRequest.count({ where: { orderId, status: "completed" } })).toBe(1);
    expect(await prisma.notification.count({ where: { dedupeKey: `compensation:${orderId}` } })).toBe(1);
    expect(await prisma.walletTransaction.count({ where: { reference: { startsWith: "COMP-WAL-" } } })).toBeGreaterThan(0);
    expect((await prisma.wallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(2_000_000);
    const repeated = await app.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payments`, headers: { cookie }, payload: { idempotencyKey: "compensation-integration-1", method: "combined" } });
    expect(repeated.statusCode).toBe(200);
    expect(await prisma.refundRequest.count({ where: { orderId } })).toBe(1);
    expect(await prisma.notification.count({ where: { dedupeKey: `compensation:${orderId}` } })).toBe(1);
    await app.close();
  });

  it("enforces ownership and immutable finalized snapshots", async () => {
    const app = await buildApp({ repository, env });
    const firstMobile = `09${String(Date.now() + 5).slice(-9)}`;
    const secondMobile = `09${String(Date.now() + 6).slice(-9)}`;
    const firstCookie = await login(app, firstMobile);
    const secondCookie = await login(app, secondMobile);
    const checkout = (await app.inject({ method: "POST", url: "/api/checkout/sessions", headers: { cookie: firstCookie }, payload: { serviceType: "tour", quantity: 1 } })).json().checkoutSession;
    const paid = await app.inject({ method: "POST", url: `/api/checkout/sessions/${checkout.id}/payments`, headers: { cookie: firstCookie }, payload: { idempotencyKey: "ownership-payment-1", method: "online_mock" } });
    const order = paid.json().order;
    // Hide the existence of another user's order instead of disclosing it with 403.
    expect((await app.inject({ method: "GET", url: `/api/orders/${order.id}`, headers: { cookie: secondCookie } })).statusCode).toBe(404);
    await expect(prisma.order.update({ where: { id: order.id }, data: { total: order.total + 1 } })).rejects.toThrow();
    await app.close();
  });
});
