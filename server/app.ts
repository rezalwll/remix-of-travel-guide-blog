import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { Prisma } from "@prisma/client";
import { randomInt, randomUUID } from "node:crypto";
import { z } from "zod";
import { config } from "./config.js";
import { getPrismaClient } from "./db/prisma.js";
import { DomainError } from "./domain/errors.js";
import { PrismaRuntimeRepository, type CheckoutInput, type PaymentMethod } from "./repositories/prisma-runtime.js";
import { createProviderRegistry, type ProviderRegistry } from "./providers/registry.js";
import { SmsService } from "./services/sms-service.js";
import { PaymentService } from "./services/payment-service.js";
import { ProviderError, providerErrorStatus } from "./providers/types.js";
import { sanitizeProviderPayload } from "./providers/redaction.js";
import { BookingService, type BookingOrder } from "./services/booking-service.js";
import { ProviderExecutor } from "./providers/execute.js";
import { CompensationService } from "./services/compensation-service.js";

const sessionCookie = "kiashi_session";
const mobileSchema = z.string().regex(/^09\d{9}$/);
const serviceTypeSchema = z.enum(["flight", "hotel", "tour", "ziyarat", "train", "bus", "insurance", "cip", "transfer"]);
const supplierKindSchema = z.enum(["flight", "hotel", "train", "bus", "insurance", "cip", "transfer", "visa"]);
const paymentMethodSchema = z.enum(["online_mock", "wallet", "combined", "installment_mock", "organizational_credit_mock", "voucher_mock"]);
const errorResponse = (reply: FastifyReply, status: number, code: string, message: string, details?: Record<string, unknown>) => reply.code(status).send({ error: { code, message, ...(details ? { details } : {}), requestId: reply.request.id } });

export type AppOptions = { repository?: PrismaRuntimeRepository; env?: Partial<typeof config>; providers?: ProviderRegistry };

export async function buildApp(options: AppOptions = {}) {
  const repository = options.repository ?? new PrismaRuntimeRepository(getPrismaClient());
  const env = { ...config, ...options.env };
  const providers = options.providers ?? createProviderRegistry(env);
  const app = Fastify({ logger: env.NODE_ENV === "test" ? false : { level: "info" }, requestIdHeader: false, genReqId: () => randomUUID(), bodyLimit: 1_048_576, trustProxy: env.TRUST_PROXY });
  const executor = new ProviderExecutor(env.PROVIDER_TIMEOUT_MS, (entry) => app.log.info(entry, "provider operation"));
  const smsService = new SmsService(providers.sms, repository, executor);
  const paymentService = new PaymentService(providers.payment, repository, executor);
  const bookingService = new BookingService(providers, repository, executor);
  const compensationService = new CompensationService(providers.payment, repository, executor);
  await app.register(cookie);
  await app.register(cors, { origin: env.WEB_ORIGIN, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof DomainError) return errorResponse(reply, error.statusCode, error.code, error.message);
    if (error instanceof ProviderError) return errorResponse(reply, providerErrorStatus(error), error.code, error.message, error.details ? sanitizeProviderPayload(error.details, { maxBytes: 2_048 }) : undefined);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return errorResponse(reply, 409, "CONFLICT", "این رکورد قبلاً ثبت شده است");
      if (error.code === "P2025") return errorResponse(reply, 404, "NOT_FOUND", "موردی پیدا نشد");
    }
    request.log.error({ requestId: request.id, errorName: error instanceof Error ? error.name : "unknown" }, "request failed");
    return errorResponse(reply, 500, "INTERNAL_ERROR", "خطای داخلی سرور");
  });

  const currentUser = async (request: FastifyRequest) => {
    const token = request.cookies[sessionCookie];
    return token ? repository.userFromSession(token) : undefined;
  };
  const requireUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await currentUser(request);
    if (!user) { errorResponse(reply, 401, "AUTH_REQUIRED", "برای ادامه وارد حساب شوید"); return undefined; }
    return user;
  };
  const rateWindows = new Map<string, { count: number; resetAt: number }>();
  const enforceRate = (key: string, limit: number, windowMs: number) => {
    const now = Date.now();
    if (rateWindows.size > 10_000) for (const [storedKey, value] of rateWindows) if (value.resetAt <= now) rateWindows.delete(storedKey);
    const current = rateWindows.get(key);
    if (!current || current.resetAt <= now) { rateWindows.set(key, { count: 1, resetAt: now + windowMs }); return; }
    if (current.count >= limit) throw new DomainError("RATE_LIMITED", "تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید", 429);
    current.count += 1;
  };
  const pageFrom = (query: unknown) => {
    const parsed = z.object({ page: z.coerce.number().int().min(1).max(10_000).default(1), perPage: z.coerce.number().int().min(1).max(50).default(20) }).safeParse(query);
    return parsed.success ? parsed.data : { page: 1, perPage: 20 };
  };
  const completeBooking = async (paymentResult: unknown, requestId: string) => {
    const result = paymentResult as { order: BookingOrder };
    if (result.order.bookingStatus === "refunded") return result;
    const order = await bookingService.confirmOrder(result.order, requestId);
    if (order.bookingStatus === "reservation_failed") {
      const compensated = await compensationService.compensate(order.id, "SUPPLIER_BOOKING_FAILED", requestId);
      return { ...result, order: compensated.order ?? order, compensation: compensated };
    }
    return { ...result, order };
  };

  app.get("/health", async () => ({ ok: true, service: "kiashi-api" }));
  app.get("/health/live", async () => ({ ok: true }));
  app.get("/health/ready", async (_request, reply) => { try { await repository.ready(); return { ok: true, database: "ready" }; } catch { return errorResponse(reply, 503, "DATABASE_UNAVAILABLE", "پایگاه داده آماده نیست"); } });
  app.get("/api/health/providers", async () => {
    const providerStatuses = await providers.status();
    const requiredUnhealthy = providerStatuses.some((entry) => !entry.optional && entry.enabled && !entry.healthy);
    return { ok: !requiredUnhealthy, providers: providerStatuses.map(({ key, adapter, mode, lifecycle, enabled, optional, healthy, checkedAt, reason }) => ({ key, adapter, mode, lifecycle, enabled, optional, healthy, checkedAt, ...(reason ? { reason } : {}) })) };
  });

  app.get<{ Params: { kind: string } }>("/api/providers/:kind/search", async (request, reply) => {
    const kind = supplierKindSchema.safeParse(request.params.kind);
    if (!kind.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "نوع تامین‌کننده معتبر نیست");
    return { items: await bookingService.search(kind.data, request.query as Record<string, unknown>, request.id) };
  });

  app.post("/api/auth/request-otp", async (request, reply) => {
    enforceRate(`otp:${request.ip}`, 10, 10 * 60_000);
    const parsed = z.object({ mobile: mobileSchema }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "شماره موبایل معتبر نیست");
    const demoCode = env.NODE_ENV === "production" ? String(randomInt(0, 100_000)).padStart(5, "0") : "12345";
    const challenge = await repository.requestOtp(parsed.data.mobile, demoCode);
    await smsService.send({ mobile: parsed.data.mobile, template: "OTP_LOGIN", variables: { code: demoCode }, idempotencyKey: challenge.id }, request.id);
    return reply.code(202).send({ challengeId: challenge.id, expiresIn: 120, ...(env.NODE_ENV === "production" ? {} : { demoCode }) });
  });
  app.post("/api/auth/verify-otp", async (request, reply) => {
    const parsed = z.object({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{5}$/) }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "کد تایید معتبر نیست");
    const result = await repository.verifyOtp(parsed.data.challengeId, parsed.data.code, env.SESSION_TTL_HOURS);
    reply.setCookie(sessionCookie, result.token, { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/", maxAge: env.SESSION_TTL_HOURS * 3600 });
    return { user: result.user };
  });
  app.post("/api/auth/logout", async (request, reply) => { const token = request.cookies[sessionCookie]; if (token) await repository.logout(token); reply.clearCookie(sessionCookie, { path: "/" }); return { ok: true }; });
  app.get("/api/auth/me", async (request, reply) => { const user = await requireUser(request, reply); return user ? { user } : undefined; });

  app.get("/api/account/profile", async (request, reply) => { const user = await requireUser(request, reply); return user ? { user: await repository.profile(user.id) } : undefined; });
  app.patch("/api/account/profile", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const parsed = z.object({
      firstName: z.string().max(80).optional(),
      lastName: z.string().max(80).optional(),
      email: z.union([z.string().email(), z.literal("")]).optional(),
      birthDate: z.union([z.string().date(), z.literal("")]).optional(),
      nationalId: z.string().max(20).optional(),
    }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات پروفایل معتبر نیست");
    return { user: await repository.updateProfile(user.id, parsed.data) };
  });

  app.post("/api/checkout/sessions", async (request, reply) => {
    const user = await currentUser(request);
    const parsed = z.object({ serviceType: serviceTypeSchema, quantity: z.coerce.number().int().min(1).max(9).default(1), guestMobile: mobileSchema.optional(), service: z.record(z.unknown()).optional(), buyer: z.record(z.unknown()).optional(), travelers: z.array(z.unknown()).optional(), addOns: z.array(z.object({ code: z.string().max(40), quantity: z.number().int().min(1).max(9).optional() })).optional(), coupon: z.string().max(40).optional() }).safeParse(request.body);
    if (!parsed.success || (!user && !parsed.data?.guestMobile)) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات checkout معتبر نیست");
    await bookingService.validateSelection(parsed.data.serviceType!, parsed.data.service, request.id);
    const checkoutSession = await repository.createCheckout(user?.id, parsed.data as CheckoutInput);
    return reply.code(201).send({ checkoutSession });
  });
  app.get<{ Params: { id: string } }>("/api/checkout/sessions/:id", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const checkoutSession = await repository.getCheckout(request.params.id, user.id); if (!checkoutSession) return errorResponse(reply, 404, "NOT_FOUND", "checkout پیدا نشد"); return { checkoutSession }; });
  app.post<{ Params: { id: string } }>("/api/checkout/sessions/:id/payments", async (request, reply) => {
    const user = await requireUser(request, reply); if (!user) return;
    const parsed = z.object({ idempotencyKey: z.string().min(8).max(120), method: paymentMethodSchema.default("online_mock"), metadata: z.record(z.unknown()).optional() }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "درخواست پرداخت معتبر نیست");
    const checkout = await repository.getCheckout(request.params.id, user.id);
    if (!checkout) return errorResponse(reply, 404, "NOT_FOUND", "checkout پیدا نشد");
    const completed = await repository.getCompletedPaymentByKey(checkout.id, user.id, parsed.data.idempotencyKey);
    if (completed) return completeBooking(completed, request.id);
    await bookingService.revalidateCheckout(checkout, request.id);
    const split = await repository.paymentSplit(checkout.id, user.id, parsed.data.method);
    if (split.onlineAmount === 0) return completeBooking(await repository.finalizePayment(checkout.id, user.id, parsed.data.idempotencyKey, parsed.data.method, parsed.data.metadata, { provider: "wallet" }), request.id);
    const handled = await paymentService.pay({ checkoutSessionId: checkout.id, userId: user.id, method: parsed.data.method as PaymentMethod, idempotencyKey: parsed.data.idempotencyKey, amount: split.onlineAmount, currency: checkout.currency, callbackUrl: `${env.API_PUBLIC_URL}/api/payments/callback/${providers.payment.name}`, metadata: parsed.data.metadata, requestId: request.id });
    return completeBooking(handled.result, request.id);
  });
  app.post<{ Params: { id: string } }>("/api/checkout/sessions/:id/payment-intents", async (request, reply) => {
    const user = await requireUser(request, reply); if (!user) return;
    const parsed = z.object({ idempotencyKey: z.string().min(8).max(120), method: paymentMethodSchema.default("online_mock"), metadata: z.record(z.unknown()).optional() }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "درخواست پرداخت معتبر نیست");
    const checkout = await repository.getCheckout(request.params.id, user.id);
    if (!checkout) return errorResponse(reply, 404, "NOT_FOUND", "checkout پیدا نشد");
    const existing = await repository.getPaymentIntentByKey(checkout.id, parsed.data.idempotencyKey);
    if (existing) return { paymentIntent: existing };
    await bookingService.revalidateCheckout(checkout, request.id);
    const split = await repository.paymentSplit(checkout.id, user.id, parsed.data.method);
    if (split.onlineAmount === 0) return errorResponse(reply, 409, "PAYMENT_INTENT_NOT_REQUIRED", "پرداخت کیف پول باید مستقیماً نهایی شود");
    const intent = await paymentService.createIntent({ checkoutSessionId: checkout.id, userId: user.id, method: parsed.data.method, amount: split.onlineAmount, currency: checkout.currency, idempotencyKey: parsed.data.idempotencyKey, callbackUrl: `${env.API_PUBLIC_URL}/api/payments/callback/${providers.payment.name}`, metadata: parsed.data.metadata, requestId: request.id });
    return reply.code(201).send({ paymentIntent: intent });
  });
  if (env.NODE_ENV !== "production") app.post<{ Params: { reference: string } }>("/api/payments/mock/:reference/simulate", async (request, reply) => {
    const user = await requireUser(request, reply); if (!user) return;
    const parsed = z.object({ status: z.enum(["succeeded", "failed", "cancelled"]) }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "وضعیت پرداخت آزمایشی معتبر نیست");
    if (parsed.data.status === "succeeded") {
      const checkout = await repository.getCheckoutByPaymentReference(request.params.reference);
      if (checkout && checkout.status !== "completed") await bookingService.revalidateCheckout(checkout, request.id);
    }
    const handled = await paymentService.simulateMock(request.params.reference, user.id, parsed.data.status!, request.id);
    return handled.result ? completeBooking(handled.result, request.id) : handled;
  });
  app.post<{ Params: { provider: string } }>("/api/payments/callback/:provider", async (request, reply) => {
    if (request.params.provider !== providers.payment.name) return errorResponse(reply, 400, "INVALID_CALLBACK", "provider callback معتبر نیست");
    const parsed = z.object({ externalReference: z.string().min(3), status: z.enum(["succeeded", "failed", "cancelled"]), signature: z.string().min(1), payload: z.record(z.unknown()).optional() }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "INVALID_CALLBACK", "callback معتبر نیست");
    if (parsed.data.status === "succeeded") {
      const checkout = await repository.getCheckoutByPaymentReference(parsed.data.externalReference);
      if (checkout && checkout.status !== "completed") await bookingService.revalidateCheckout(checkout, request.id);
    }
    const handled = await paymentService.handleCallback({ externalReference: parsed.data.externalReference!, status: parsed.data.status!, signature: parsed.data.signature!, payload: parsed.data.payload }, request.id);
    if (handled.result) await completeBooking(handled.result, request.id);
    return { ok: true, status: handled.verification.status, duplicate: handled.duplicate };
  });
  app.post<{ Params: { id: string } }>("/api/orders/:id/payments", async (request, reply) => {
    const user = await requireUser(request, reply); if (!user) return;
    const parsed = z.object({ idempotencyKey: z.string().min(8).max(120), method: paymentMethodSchema.optional(), provider: z.string().optional() }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "درخواست پرداخت معتبر نیست");
    const order = await repository.getOrder(request.params.id, user.id);
    const checkout = await repository.getCheckout(order.checkoutSessionId, user.id);
    if (!checkout) return errorResponse(reply, 404, "NOT_FOUND", "checkout پیدا نشد");
    const completed = await repository.getCompletedPaymentByKey(checkout.id, user.id, parsed.data.idempotencyKey);
    if (completed) return completeBooking(completed, request.id);
    await bookingService.revalidateCheckout(checkout, request.id);
    const method = parsed.data.method ?? "online_mock";
    const split = await repository.paymentSplit(checkout.id, user.id, method);
    if (split.onlineAmount === 0) return completeBooking(await repository.finalizePayment(checkout.id, user.id, parsed.data.idempotencyKey, method, undefined, { provider: "wallet" }), request.id);
    const handled = await paymentService.pay({ checkoutSessionId: checkout.id, userId: user.id, method, idempotencyKey: parsed.data.idempotencyKey, amount: split.onlineAmount, currency: checkout.currency, callbackUrl: `${env.API_PUBLIC_URL}/api/payments/callback/${providers.payment.name}`, requestId: request.id });
    return completeBooking(handled.result, request.id);
  });

  const ordersHandler = async (request: FastifyRequest, reply: FastifyReply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const orders = await repository.listOrders(user.id, page.page, page.perPage); return { orders: orders.slice(0, page.perPage), pagination: { ...page, hasMore: orders.length > page.perPage } }; };
  app.get("/api/account/orders", ordersHandler);
  app.get("/api/orders", ordersHandler);
  app.get<{ Params: { id: string } }>("/api/account/orders/:id", async (request, reply) => { const user = await requireUser(request, reply); return user ? { order: await repository.getOrder(request.params.id, user.id) } : undefined; });
  app.get<{ Params: { id: string } }>("/api/orders/:id", async (request, reply) => { const user = await requireUser(request, reply); return user ? { order: await repository.getOrder(request.params.id, user.id) } : undefined; });

  app.get("/api/account/wallet", async (request, reply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const wallet = await repository.wallet(user.id, page.page, page.perPage); return { wallet: { ...wallet, transactions: wallet.transactions.slice(0, page.perPage) }, pagination: { ...page, hasMore: wallet.transactions.length > page.perPage } }; });
  app.get("/api/wallet", async (request, reply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const wallet = await repository.wallet(user.id, page.page, page.perPage); return { wallet: { ...wallet, transactions: wallet.transactions.slice(0, page.perPage) }, pagination: { ...page, hasMore: wallet.transactions.length > page.perPage } }; });

  app.get("/api/account/passengers", async (request, reply) => { const user = await requireUser(request, reply); return user ? { passengers: await repository.listPassengers(user.id) } : undefined; });
  app.post("/api/account/passengers", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ firstName: z.string().min(1).max(80), lastName: z.string().min(1).max(80), nationalId: z.string().max(20).optional(), passportNumber: z.string().max(30).optional() }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات مسافر معتبر نیست"); return reply.code(201).send({ passenger: await repository.createPassenger(user.id, { ...parsed.data, firstName: parsed.data.firstName!, lastName: parsed.data.lastName! }) }); });
  app.patch<{ Params: { id: string } }>("/api/account/passengers/:id", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ firstName: z.string().min(1).max(80).optional(), lastName: z.string().min(1).max(80).optional(), nationalId: z.string().max(20).optional(), passportNumber: z.string().max(30).optional() }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات مسافر معتبر نیست"); return { passenger: await repository.updatePassenger(request.params.id, user.id, parsed.data) }; });
  app.delete<{ Params: { id: string } }>("/api/account/passengers/:id", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; await repository.deletePassenger(request.params.id, user.id); return reply.code(204).send(); });

  app.get("/api/account/favorites", async (request, reply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const favorites = await repository.listFavorites(user.id, page.page, page.perPage); return { favorites: favorites.slice(0, page.perPage), pagination: { ...page, hasMore: favorites.length > page.perPage } }; });
  app.post("/api/account/favorites", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ itemType: z.string().min(1).max(40), itemId: z.string().min(1).max(120) }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "مورد علاقه معتبر نیست"); return reply.code(201).send({ favorite: await repository.createFavorite(user.id, parsed.data.itemType, parsed.data.itemId) }); });
  app.delete<{ Params: { id: string } }>("/api/account/favorites/:id", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; await repository.deleteFavorite(request.params.id, user.id); return reply.code(204).send(); });

  app.get("/api/account/notifications", async (request, reply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const notifications = await repository.listNotifications(user.id, page.page, page.perPage); return { notifications: notifications.slice(0, page.perPage), pagination: { ...page, hasMore: notifications.length > page.perPage } }; });
  app.patch<{ Params: { id: string } }>("/api/account/notifications/:id/read", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; await repository.readNotification(request.params.id, user.id); return { ok: true }; });
  app.post("/api/account/notifications/read-all", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; await repository.readAllNotifications(user.id); return { ok: true }; });

  app.get("/api/account/support", async (request, reply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const tickets = await repository.listSupport(user.id, page.page, page.perPage); return { tickets: tickets.slice(0, page.perPage), pagination: { ...page, hasMore: tickets.length > page.perPage } }; });
  app.post("/api/account/support", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ subject: z.string().min(3).max(120), body: z.string().min(3).max(2000) }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "پیام پشتیبانی معتبر نیست"); return reply.code(201).send({ ticket: await repository.createSupport(user.id, parsed.data.subject, parsed.data.body) }); });
  app.post<{ Params: { id: string } }>("/api/account/support/:id/messages", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ body: z.string().min(1).max(2000) }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "پیام معتبر نیست"); return reply.code(201).send({ message: await repository.addSupportMessage(request.params.id, user.id, parsed.data.body) }); });

  app.get("/api/account/visa-applications", async (request, reply) => { const user = await requireUser(request, reply); const page = pageFrom(request.query); if (!user) return; const applications = await repository.listVisa(user.id, page.page, page.perPage); return { applications: applications.slice(0, page.perPage), pagination: { ...page, hasMore: applications.length > page.perPage } }; });
  app.post("/api/account/visa-applications", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ country: z.string().min(2).max(80), payload: z.record(z.unknown()).default({}) }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "درخواست ویزا معتبر نیست"); return reply.code(201).send({ application: await repository.createVisa(user.id, parsed.data.country, parsed.data.payload) }); });
  app.patch<{ Params: { id: string } }>("/api/account/visa-applications/:id", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ status: z.enum(["draft", "submitted"]).optional(), payload: z.record(z.unknown()).optional() }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "درخواست ویزا معتبر نیست"); return { application: await repository.updateVisa(request.params.id, user.id, parsed.data) }; });

  app.get("/api/account/refunds", async (request, reply) => { const user = await requireUser(request, reply); return user ? { refunds: await repository.listRefunds(user.id) } : undefined; });
  app.post("/api/account/refunds", async (request, reply) => { const user = await requireUser(request, reply); if (!user) return; const parsed = z.object({ orderId: z.string().uuid(), reason: z.string().min(3).max(500), destination: z.enum(["wallet", "original_payment"]) }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "درخواست استرداد معتبر نیست"); return reply.code(201).send({ refund: await repository.requestRefund(user.id, parsed.data.orderId, parsed.data.reason, parsed.data.destination) }); });

  app.post("/api/order-tracking", async (request, reply) => { enforceRate(`tracking:${request.ip}`, 30, 10 * 60_000); const parsed = z.object({ identifier: z.string().min(3).max(100), mobile: mobileSchema }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات پیگیری معتبر نیست"); return { tracking: await repository.track(parsed.data.identifier, parsed.data.mobile) }; });
  return app;
}
