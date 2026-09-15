import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { config } from "./config.js";
import { hashOtp, MemoryStore, type User } from "./store.js";

const mobileSchema = z.string().regex(/^09\d{9}$/, "mobile must be an Iranian mobile number");
const jsonError = (reply: FastifyReply, statusCode: number, code: string, message: string) => reply.code(statusCode).send({ error: { code, message } });
const now = () => Date.now();
const sessionCookie = "kiashi_session";

export type AppOptions = { store?: MemoryStore; env?: typeof config };

export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const store = options.store ?? new MemoryStore();
  const env = options.env ?? config;
  const app = Fastify({ logger: env.NODE_ENV === "test" ? false : { level: "info" }, requestIdHeader: "x-request-id", genReqId: () => randomUUID() });
  await app.register(cookie);
  await app.register(cors, { origin: env.WEB_ORIGIN, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ requestId: request.id, err: error }, "request failed");
    return jsonError(reply, 500, "INTERNAL_ERROR", "خطای داخلی سرور");
  });

  const currentUser = (request: FastifyRequest): User | undefined => {
    const token = request.cookies[sessionCookie];
    if (!token) return undefined;
    const session = store.sessions.get(token);
    if (!session || session.expiresAt < now()) {
      if (token) store.sessions.delete(token);
      return undefined;
    }
    return store.users.get(session.userId);
  };
  const requireUser = (request: FastifyRequest, reply: FastifyReply) => {
    const user = currentUser(request);
    if (!user) { jsonError(reply, 401, "AUTH_REQUIRED", "برای ادامه وارد حساب شوید"); return undefined; }
    return user;
  };

  app.get("/health", async () => ({ ok: true, service: "kiashi-api", timestamp: new Date().toISOString() }));

  app.post("/api/auth/request-otp", async (request, reply) => {
    const parsed = z.object({ mobile: mobileSchema }).safeParse(request.body);
    if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "شماره موبایل معتبر نیست");
    const challengeId = randomUUID();
    store.otpChallenges.set(challengeId, { mobile: parsed.data.mobile, hash: hashOtp("12345"), expiresAt: now() + 120_000, attempts: 0, used: false });
    const response: { challengeId: string; expiresIn: number; demoCode?: string } = { challengeId, expiresIn: 120 };
    if (env.NODE_ENV !== "production") response.demoCode = "12345";
    return reply.code(202).send(response);
  });

  app.post("/api/auth/verify-otp", async (request, reply) => {
    const parsed = z.object({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{5}$/) }).safeParse(request.body);
    if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "کد تایید معتبر نیست");
    const challenge = store.otpChallenges.get(parsed.data.challengeId);
    if (!challenge || challenge.used || challenge.expiresAt < now()) return jsonError(reply, 400, "OTP_EXPIRED", "کد تایید منقضی شده است");
    challenge.attempts += 1;
    if (challenge.attempts > 5) return jsonError(reply, 429, "OTP_LOCKED", "تعداد تلاش بیش از حد مجاز است");
    if (hashOtp(parsed.data.code) !== challenge.hash) return jsonError(reply, 400, "OTP_INVALID", "کد تایید اشتباه است");
    challenge.used = true;
    const user = store.findUserByMobile(challenge.mobile) ?? store.createUser(challenge.mobile);
    const token = randomUUID();
    store.sessions.set(token, { userId: user.id, expiresAt: now() + env.SESSION_TTL_HOURS * 3_600_000 });
    reply.setCookie(sessionCookie, token, { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/", maxAge: env.SESSION_TTL_HOURS * 3600 });
    return { user };
  });

  app.post("/api/auth/logout", async (request, reply) => { const token = request.cookies[sessionCookie]; if (token) store.sessions.delete(token); reply.clearCookie(sessionCookie, { path: "/" }); return { ok: true }; });
  app.get("/api/auth/me", async (request, reply) => { const user = currentUser(request); if (!user) return jsonError(reply, 401, "AUTH_REQUIRED", "برای ادامه وارد حساب شوید"); return { user }; });

  app.get("/api/account/profile", async (request, reply) => { const user = requireUser(request, reply); return user ? { user } : undefined; });
  app.patch("/api/account/profile", async (request, reply) => {
    const user = requireUser(request, reply); if (!user) return undefined;
    const parsed = z.object({ firstName: z.string().max(80).optional(), lastName: z.string().max(80).optional() }).safeParse(request.body);
    if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "اطلاعات پروفایل معتبر نیست");
    Object.assign(user, parsed.data); return { user };
  });

  app.get("/api/orders", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { orders: [...store.orders.values()].filter((order) => order.userId === user.id) }; });
  app.get<{ Params: { id: string } }>("/api/orders/:id", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; const order = store.orders.get(request.params.id); if (!order || order.userId !== user.id) return jsonError(reply, 404, "NOT_FOUND", "سفارش پیدا نشد"); return { order }; });

  app.post("/api/checkout/sessions", async (request, reply) => {
    const user = requireUser(request, reply); if (!user) return undefined;
    const parsed = z.object({ serviceType: z.enum(["flight", "hotel", "tour", "train", "bus", "insurance", "cip", "transfer"]), quantity: z.coerce.number().int().min(1).max(9).default(1) }).safeParse(request.body);
    if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "اطلاعات checkout معتبر نیست");
    const base = { flight: 8_900_000, hotel: 5_500_000, tour: 29_800_000, train: 1_200_000, bus: 850_000, insurance: 950_000, cip: 1_800_000, transfer: 700_000 }[parsed.data.serviceType];
    const order = { id: randomUUID(), userId: user.id, trackingCode: `KS-${randomUUID().slice(0, 8).toUpperCase()}`, serviceType: parsed.data.serviceType, status: "pending_payment" as const, total: base * parsed.data.quantity, createdAt: new Date().toISOString() };
    store.orders.set(order.id, order); return reply.code(201).send({ checkoutSession: { id: randomUUID(), order } });
  });

  app.post<{ Params: { id: string } }>("/api/orders/:id/payments", async (request, reply) => {
    const user = requireUser(request, reply); if (!user) return undefined;
    const order = store.orders.get(request.params.id); if (!order || order.userId !== user.id) return jsonError(reply, 404, "NOT_FOUND", "سفارش پیدا نشد");
    const parsed = z.object({ idempotencyKey: z.string().min(8).max(120), provider: z.enum(["mock", "wallet"]).default("mock") }).safeParse(request.body);
    if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "درخواست پرداخت معتبر نیست");
    const existing = [...store.payments.values()].find((payment) => payment.orderId === order.id && payment.idempotencyKey === parsed.data.idempotencyKey);
    if (existing) return { payment: existing, order };
    if (parsed.data.provider === "wallet") {
      const balance = store.wallets.get(user.id) ?? 0; if (balance < order.total) return jsonError(reply, 409, "INSUFFICIENT_WALLET", "موجودی کیف پول کافی نیست"); store.wallets.set(user.id, balance - order.total);
    }
    const payment = { id: randomUUID(), orderId: order.id, idempotencyKey: parsed.data.idempotencyKey, status: "succeeded" as const, amount: order.total, createdAt: new Date().toISOString() };
    store.payments.set(payment.id, payment); order.status = "paid"; return { payment, order };
  });

  app.get("/api/wallet", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { balance: store.wallets.get(user.id) ?? 0, currency: "IRR" }; });
  app.get("/api/passengers", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { passengers: [...store.passengers.values()].filter((item) => item.userId === user.id) }; });
  app.post("/api/passengers", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; const parsed = z.object({ firstName: z.string().min(1).max(80), lastName: z.string().min(1).max(80), nationalId: z.string().max(20).optional() }).safeParse(request.body); if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "اطلاعات مسافر معتبر نیست"); const passenger = { id: randomUUID(), userId: user.id, firstName: parsed.data.firstName, lastName: parsed.data.lastName, nationalId: parsed.data.nationalId }; store.passengers.set(passenger.id, passenger); return reply.code(201).send({ passenger }); });
  app.get("/api/favorites", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { favorites: [...store.favorites.values()].filter((item) => item.userId === user.id) }; });
  app.post("/api/favorites", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; const parsed = z.object({ itemType: z.string().min(1).max(40), itemId: z.string().min(1).max(120) }).safeParse(request.body); if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "مورد علاقه معتبر نیست"); const favorite = { id: randomUUID(), userId: user.id, itemType: parsed.data.itemType, itemId: parsed.data.itemId, createdAt: new Date().toISOString() }; store.favorites.set(favorite.id, favorite); return reply.code(201).send({ favorite }); });
  app.get("/api/notifications", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { notifications: [...store.notifications.values()].filter((item) => item.userId === user.id) }; });
  app.get("/api/support/tickets", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { tickets: [...store.supportTickets.values()].filter((item) => item.userId === user.id) }; });
  app.post("/api/support/tickets", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; const parsed = z.object({ subject: z.string().min(3).max(120), body: z.string().min(3).max(2000) }).safeParse(request.body); if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "پیام پشتیبانی معتبر نیست"); const ticket = { id: randomUUID(), userId: user.id, subject: parsed.data.subject, body: parsed.data.body, status: "open" as const, createdAt: new Date().toISOString() }; store.supportTickets.set(ticket.id, ticket); return reply.code(201).send({ ticket }); });
  app.get("/api/visa/applications", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; return { applications: [...store.visaApplications.values()].filter((item) => item.userId === user.id) }; });
  app.post("/api/visa/applications", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; const parsed = z.object({ country: z.string().min(2).max(80), payload: z.record(z.unknown()).default({}) }).safeParse(request.body); if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "درخواست ویزا معتبر نیست"); const application = { id: randomUUID(), userId: user.id, country: parsed.data.country, payload: parsed.data.payload, status: "draft" as const, createdAt: new Date().toISOString() }; store.visaApplications.set(application.id, application); return reply.code(201).send({ application }); });
  app.post("/api/refunds", async (request, reply) => { const user = requireUser(request, reply); if (!user) return undefined; const parsed = z.object({ orderId: z.string().uuid(), reason: z.string().min(3).max(500) }).safeParse(request.body); if (!parsed.success) return jsonError(reply, 400, "VALIDATION_ERROR", "درخواست استرداد معتبر نیست"); const order = store.orders.get(parsed.data.orderId); if (!order || order.userId !== user.id) return jsonError(reply, 404, "NOT_FOUND", "سفارش پیدا نشد"); const refund = { id: randomUUID(), orderId: order.id, userId: user.id, amount: order.total, reason: parsed.data.reason, status: "requested" as const, createdAt: new Date().toISOString() }; store.refunds.set(refund.id, refund); return reply.code(201).send({ refund }); });
  app.get<{ Params: { code: string } }>("/api/tracking/:code", async (request, reply) => { const order = [...store.orders.values()].find((item) => item.trackingCode === request.params.code); if (!order) return jsonError(reply, 404, "NOT_FOUND", "سفارش پیدا نشد"); return { tracking: { trackingCode: order.trackingCode, serviceType: order.serviceType, status: order.status, createdAt: order.createdAt } }; });
  return app;
}
