import { Prisma, PrismaClient } from "@prisma/client";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DomainError, forbidden, notFound } from "../domain/errors.js";
import { MONEY_CURRENCY } from "../domain/money.js";
import { assertTransition, type BookingAttemptState, type OrderBookingState, type PaymentIntentState } from "../domain/states.js";
import { sanitizeProviderPayload } from "../providers/redaction.js";
import { assertDepartureSaleable, calculatePackageTotal, capacitySnapshot, effectiveDepartureStatus, type DepartureSaleStatus } from "../programs/domain.js";
import { inventoryPrice, stayDates } from "../hotels/domain.js";
import { assertVisaTransition, customerEditableVisaPayload, emptyVisaChecklist, normalizeVisaStatus, publicVisaPayload } from "../visa/domain.js";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
const mobilePattern = /^09\d{9}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const recordOf = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const managedIds = (service: unknown) => {
  const value = recordOf(service); const offer = recordOf(value.offer); const departure = recordOf(value.departure); const pack = recordOf(value.package);
  const ids = { programId: typeof offer.id === "string" ? offer.id : "", departureId: typeof departure.id === "string" ? departure.id : "", packageId: typeof pack.id === "string" ? pack.id : "" };
  return Object.values(ids).every((id) => uuidPattern.test(id)) ? ids : null;
};
const managedHotelIds = (service: unknown) => { const value=recordOf(service);const hotel=recordOf(value.hotel);const room=recordOf(value.room);const rate=recordOf(value.ratePlan);const stay=recordOf(value.stay);const ids={propertyId:typeof hotel.id==="string"?hotel.id:"",roomTypeId:typeof room.id==="string"?room.id:"",ratePlanId:typeof rate.id==="string"?rate.id:""};const checkIn=typeof stay.checkIn==="string"?new Date(`${stay.checkIn}T00:00:00.000Z`):null;const checkOut=typeof stay.checkOut==="string"?new Date(`${stay.checkOut}T00:00:00.000Z`):null;const roomCount=Math.max(1,Math.min(20,Number(value.roomCount)||1));return Object.values(ids).every(id=>uuidPattern.test(id))&&checkIn&&!Number.isNaN(checkIn.getTime())&&checkOut&&!Number.isNaN(checkOut.getTime())?{...ids,checkIn,checkOut,roomCount}:null;};
const bookedCounts = (orders: Array<{ travelers: unknown; paymentStatus: string; bookingStatus: string }>) => orders.reduce((result, order) => { const count = Array.isArray(order.travelers) ? Math.max(1, order.travelers.length) : 1; if (order.paymentStatus === "paid" && ["confirmed", "paid_booking_pending", "manual_review_required", "compensation_pending"].includes(order.bookingStatus)) { result.bookedTravelers += count; if (order.bookingStatus === "confirmed") result.confirmedTravelers += count; } return result; }, { bookedTravelers: 0, confirmedTravelers: 0 });
const servicePrices = {
  flight: 8_900_000,
  hotel: 5_500_000,
  tour: 29_800_000,
  ziyarat: 18_500_000,
  train: 1_200_000,
  bus: 850_000,
  insurance: 950_000,
  cip: 1_800_000,
  transfer: 700_000,
} as const;
const addOnPrices: Record<string, number> = { baggage: 900_000, breakfast: 350_000, transfer: 700_000, insurance: 950_000 };
export type ServiceType = keyof typeof servicePrices;
export type PaymentMethod = "online_mock" | "wallet" | "combined" | "installment_mock" | "organizational_credit_mock" | "voucher_mock" | "refah_card_mock";

export type CheckoutInput = {
  serviceType: ServiceType;
  quantity: number;
  guestMobile?: string;
  service?: Record<string, unknown>;
  buyer?: Record<string, unknown>;
  travelers?: unknown[];
  addOns?: Array<{ code: string; quantity?: number }>;
  coupon?: string;
};

export class PrismaRuntimeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async releaseHotelInventory(tx: Prisma.TransactionClient, orderId: string, refundId: string, reason: string) {
    const allocation = await tx.hotelInventoryAllocation.findUnique({ where: { orderId } });
    if (!allocation) return { released: false, reason: "NO_MANAGED_ALLOCATION" as const };
    if (allocation.status === "RELEASED") return { released: false, reason: "ALREADY_RELEASED" as const };
    if (!["DIRECT", "DEMO"].includes(allocation.sourceType)) throw new DomainError("HOTEL_INVENTORY_RELEASE_FORBIDDEN", "موجودی این رزرو توسط کیاشی مدیریت نمی‌شود", 409);
    const dates = stayDates(allocation.checkIn, allocation.checkOut);
    const inventory = await tx.dailyInventory.findMany({ where: { ratePlanId: allocation.ratePlanId, date: { in: dates } }, select: { id: true } });
    if (inventory.length !== dates.length) throw new DomainError("HOTEL_INVENTORY_RELEASE_INCOMPLETE", "رکورد موجودی تمام شب‌های رزرو پیدا نشد", 409);
    const marked = await tx.hotelInventoryAllocation.updateMany({ where: { id: allocation.id, status: "ACTIVE" }, data: { status: "RELEASED", releasedByRefundId: refundId, releaseReason: reason, releasedAt: new Date() } });
    if (marked.count !== 1) return { released: false, reason: "ALREADY_RELEASED" as const };
    const restored = await tx.dailyInventory.updateMany({ where: { ratePlanId: allocation.ratePlanId, date: { in: dates } }, data: { availableRooms: { increment: allocation.roomCount } } });
    if (restored.count !== dates.length) throw new DomainError("HOTEL_INVENTORY_RELEASE_INCOMPLETE", "آزادسازی تمام شب‌های رزرو انجام نشد", 409);
    return { released: true, nights: dates.length, roomCount: allocation.roomCount };
  }

  private async serializable<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.prisma.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5_000, timeout: 15_000 });
      } catch (error) {
        const retryable = error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2034" || error.code === "P2002");
        if (!retryable || attempt >= 2) throw error;
      }
    }
  }

  connect() { return this.prisma.$connect(); }
  disconnect() { return this.prisma.$disconnect(); }
  async ready() { await this.prisma.$queryRaw`SELECT 1`; }

  async requestOtp(mobile: string, code: string) {
    const recent = await this.prisma.otpChallenge.findFirst({ where: { mobile, createdAt: { gt: new Date(Date.now() - 60_000) } }, orderBy: { createdAt: "desc" } });
    if (recent) throw new DomainError("OTP_THROTTLED", "برای دریافت کد جدید کمی صبر کنید", 429);
    return this.prisma.otpChallenge.create({ data: { mobile, codeHash: hash(code), expiresAt: new Date(Date.now() + 120_000) }, select: { id: true, expiresAt: true } });
  }

  createSmsDeliveryAttempt(input: { mobile: string; template: string; provider: string; status: string; providerReference?: string; errorCode?: string }) {
    return this.prisma.smsDeliveryAttempt.create({ data: input, select: { id: true } });
  }
  updateSmsDeliveryAttempt(id: string, input: { status: string; providerReference?: string; errorCode?: string }) {
    return this.prisma.smsDeliveryAttempt.update({ where: { id }, data: input });
  }

  async createPaymentIntent(input: { checkoutSessionId: string; userId: string; provider: string; method: string; amount: number; currency: string; idempotencyKey: string; externalReference: string; redirectUrl: string; metadata?: Record<string, unknown> }) {
    return this.serializable(async (tx) => {
      const checkout = await tx.checkoutSession.findFirst({ where: { id: input.checkoutSessionId, userId: input.userId } });
      if (!checkout) throw forbidden();
      if (!["ready_for_payment", "payment_pending"].includes(checkout.status)) throw new DomainError("CHECKOUT_STATE_INVALID", "وضعیت checkout معتبر نیست", 409);
      const intent = await tx.paymentIntent.create({ data: { checkoutSessionId: input.checkoutSessionId, provider: input.provider, method: input.method, amount: input.amount, currency: input.currency, idempotencyKey: input.idempotencyKey, externalReference: input.externalReference, redirectUrl: input.redirectUrl, metadata: asJson(sanitizeProviderPayload(input.metadata ?? {})) } });
      if (checkout.status === "ready_for_payment") await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: "payment_pending" } });
      return intent;
    });
  }
  async getPaymentIntentByKey(checkoutSessionId: string, idempotencyKey: string) {
    return this.prisma.paymentIntent.findUnique({ where: { checkoutSessionId_idempotencyKey: { checkoutSessionId, idempotencyKey } }, select: { externalReference: true, redirectUrl: true, provider: true, status: true } });
  }
  async getPaymentIntentByReference(externalReference: string) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { externalReference }, include: { checkoutSession: { select: { userId: true } } } });
    return intent ? { checkoutSessionId: intent.checkoutSessionId, userId: intent.checkoutSession.userId, provider: intent.provider, method: intent.method, idempotencyKey: intent.idempotencyKey, status: intent.status } : null;
  }
  async getCheckoutByPaymentReference(externalReference: string) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { externalReference }, include: { checkoutSession: true } });
    return intent?.checkoutSession ?? null;
  }
  async recordPaymentCallback(input: { paymentIntentReference: string; provider: string; status: string; payload?: Record<string, unknown>; signature?: string; callbackKey: string }) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { externalReference: input.paymentIntentReference } });
    if (!intent || intent.provider !== input.provider) throw new DomainError("INVALID_CALLBACK", "مرجع callback معتبر نیست", 400);
    assertTransition("paymentIntent", intent.status as PaymentIntentState, input.status);
    try {
      await this.prisma.$transaction([
        this.prisma.paymentCallback.create({ data: { paymentIntentId: intent.id, provider: input.provider, externalReference: input.paymentIntentReference, status: input.status, payload: asJson(input.payload ?? {}), signature: input.signature, callbackKey: input.callbackKey, processedAt: new Date() } }),
        this.prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: input.status } }),
        this.prisma.checkoutSession.update({ where: { id: intent.checkoutSessionId }, data: { status: input.status === "succeeded" ? "payment_pending" : "ready_for_payment" } }),
      ]);
      return { duplicate: false };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const previous = await this.prisma.paymentCallback.findUnique({ where: { callbackKey: input.callbackKey } });
        if (previous?.status !== input.status || previous?.paymentIntentId !== intent.id) throw new DomainError("INVALID_CALLBACK", "وضعیت callback با پردازش قبلی سازگار نیست", 400);
        return { duplicate: true };
      }
      throw error;
    }
  }
  async recordPaymentVerification(input: { paymentIntentReference: string; provider: string; status: string; providerPayload?: Record<string, unknown>; errorCode?: string }) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { externalReference: input.paymentIntentReference } });
    if (!intent) throw new DomainError("INVALID_CALLBACK", "مرجع پرداخت معتبر نیست", 400);
    return this.prisma.paymentVerification.create({ data: { paymentIntentId: intent.id, provider: input.provider, externalReference: input.paymentIntentReference, status: input.status, response: asJson(sanitizeProviderPayload(input.providerPayload ?? {})), errorCode: input.errorCode } });
  }
  listUnresolvedPaymentIntents(limit = 50) {
    return this.prisma.paymentIntent.findMany({ where: { status: { in: ["created", "pending"] } }, include: { checkoutSession: { select: { userId: true } } }, orderBy: { updatedAt: "asc" }, take: Math.min(limit, 100) }).then((items) => items.map((item) => ({ checkoutSessionId: item.checkoutSessionId, userId: item.checkoutSession.userId, provider: item.provider, method: item.method, idempotencyKey: item.idempotencyKey, status: item.status, externalReference: item.externalReference })));
  }
  async updatePaymentIntentStatus(externalReference: string, status: PaymentIntentState) {
    const intent = await this.prisma.paymentIntent.findUniqueOrThrow({ where: { externalReference } });
    assertTransition("paymentIntent", intent.status as PaymentIntentState, status);
    await this.prisma.paymentIntent.update({ where: { id: intent.id }, data: { status } });
    if (status === "failed" || status === "cancelled") await this.prisma.checkoutSession.update({ where: { id: intent.checkoutSessionId }, data: { status: "ready_for_payment" } });
  }

  createBookingAttempt(input: { orderId?: string; requestKey: string; provider: string; providerReference?: string; status: string; requestSnapshot?: unknown; responseSnapshot?: unknown; error?: string }) {
    return this.prisma.bookingAttempt.upsert({ where: { requestKey: input.requestKey }, create: { orderId: input.orderId, requestKey: input.requestKey, provider: input.provider, providerReference: input.providerReference, status: input.status, requestSnapshot: input.requestSnapshot ? asJson(sanitizeProviderPayload(input.requestSnapshot)) : undefined, responseSnapshot: input.responseSnapshot ? asJson(sanitizeProviderPayload(input.responseSnapshot)) : undefined, error: input.error }, update: {} });
  }
  getBookingAttempt(orderId: string) {
    return this.prisma.bookingAttempt.findFirst({ where: { orderId }, orderBy: { createdAt: "desc" }, select: { id: true, requestKey: true, status: true, providerReference: true } });
  }
  async updateBookingAttempt(id: string, input: { providerReference?: string; status: string; responseSnapshot?: unknown; error?: string }) {
    const current = await this.prisma.bookingAttempt.findUniqueOrThrow({ where: { id }, select: { status: true } });
    assertTransition("booking", current.status as BookingAttemptState, input.status);
    return this.prisma.bookingAttempt.update({ where: { id }, data: { providerReference: input.providerReference, status: input.status, responseSnapshot: input.responseSnapshot ? asJson(sanitizeProviderPayload(input.responseSnapshot)) : undefined, error: input.error } });
  }
  async updateOrderBooking(orderId: string, input: { bookingStatus: OrderBookingState; providerName?: string; externalReference?: string; providerPayload?: Record<string, unknown> }) {
    const current = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { bookingStatus: true } });
    assertTransition("order", current.bookingStatus as OrderBookingState, input.bookingStatus);
    return this.prisma.order.update({ where: { id: orderId }, data: { bookingStatus: input.bookingStatus, providerName: input.providerName, externalReference: input.externalReference, providerPayload: input.providerPayload ? asJson(sanitizeProviderPayload(input.providerPayload)) : undefined } });
  }

  listUnresolvedBookings(limit = 50) {
    return this.prisma.order.findMany({ where: { bookingStatus: { in: ["paid_booking_pending", "manual_review_required"] } }, include: { bookingAttempts: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "asc" }, take: Math.min(limit, 100) });
  }

  async beginCompensation(orderId: string, reason: string) {
    return this.serializable(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { payments: { where: { status: { in: ["succeeded", "refunded"] } }, orderBy: { createdAt: "desc" }, take: 1 }, user: { include: { wallet: true } } } });
      if (!order || !order.userId) throw new DomainError("COMPENSATION_UNAVAILABLE", "سفارش برای جبران مالی معتبر نیست", 409);
      const payment = order.payments[0];
      if (!payment) throw new DomainError("PAYMENT_STATE_INVALID", "پرداخت موفق پیدا نشد", 409);
      const compensationKey = `booking:${order.id}`;
      const existing = await tx.refundRequest.findUnique({ where: { compensationKey } });
      if (existing?.status === "completed") return { order, payment, refund: existing, walletId: order.user?.wallet?.id ?? null, alreadyCompleted: true, externalReference: (order.paymentSnapshot as Record<string, unknown>)?.externalReference as string | undefined };
      if (!["confirmed", "reservation_failed", "compensation_pending", "manual_review_required"].includes(order.bookingStatus)) throw new DomainError("INVALID_STATE_TRANSITION", "وضعیت سفارش برای جبران معتبر نیست", 409);
      const refund = existing
        ? await tx.refundRequest.update({ where: { id: existing.id }, data: { status: "processing", reason } })
        : await tx.refundRequest.create({ data: { orderId: order.id, userId: order.userId, amount: order.total, walletAmount: payment.walletAmount, onlineAmount: payment.onlineAmount, reason, destination: "original_payment", status: "processing", compensationKey } });
      if (order.bookingStatus !== "compensation_pending") await tx.order.update({ where: { id: order.id }, data: { bookingStatus: "compensation_pending" } });
      return { order, payment, refund, walletId: order.user?.wallet?.id ?? null, alreadyCompleted: false, externalReference: (order.paymentSnapshot as Record<string, unknown>)?.externalReference as string | undefined };
    });
  }

  async completeCompensation(refundId: string, providerReference?: string) {
    return this.serializable(async (tx) => {
      const refund = await tx.refundRequest.findUniqueOrThrow({ where: { id: refundId }, include: { order: { include: { payments: { where: { status: { in: ["succeeded", "refunded"] } }, orderBy: { createdAt: "desc" }, take: 1 }, user: { include: { wallet: true } } } } } });
      if (refund.status === "completed") return refund.order;
      if (refund.status !== "processing") throw new DomainError("INVALID_STATE_TRANSITION", "وضعیت استرداد معتبر نیست", 409);
      const payment = refund.order.payments[0];
      if (!payment) throw new DomainError("PAYMENT_STATE_INVALID", "پرداخت موفق پیدا نشد", 409);
      if (refund.walletAmount > 0) {
        const wallet = refund.order.user?.wallet;
        if (!wallet) throw new DomainError("WALLET_NOT_FOUND", "کیف پول پیدا نشد", 409);
        const reference = `COMP-WAL-${refund.id}`;
        const existingCredit = await tx.walletTransaction.findUnique({ where: { reference } });
        if (!existingCredit) {
          const updated = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: refund.walletAmount } } });
          await tx.walletTransaction.create({ data: { walletId: wallet.id, type: "compensation_credit", amount: refund.walletAmount, balanceAfter: updated.balance, reference } });
        }
      }
      await tx.transaction.upsert({ where: { reference: `COMP-${refund.id}` }, create: { orderId: refund.orderId, walletId: refund.order.user?.wallet?.id, type: "refund", status: "succeeded", amount: refund.amount, currency: MONEY_CURRENCY, reference: `COMP-${refund.id}` }, update: {} });
      await tx.paymentAttempt.update({ where: { id: payment.id }, data: { status: "refunded" } });
      const order = await tx.order.update({ where: { id: refund.orderId }, data: { paymentStatus: "refunded", bookingStatus: "refunded" } });
      await this.releaseHotelInventory(tx, refund.orderId, refund.id, refund.reason);
      await tx.refundRequest.update({ where: { id: refund.id }, data: { status: "completed", providerReference, completedAt: new Date() } });
      await tx.notification.upsert({ where: { dedupeKey: `compensation:${refund.orderId}` }, create: { userId: refund.order.userId!, type: "refund", title: "وجه سفارش بازگردانده شد", body: `جبران مالی سفارش ${refund.order.orderNumber} با موفقیت انجام شد.`, dedupeKey: `compensation:${refund.orderId}` }, update: {} });
      return order;
    });
  }

  async failCompensation(refundId: string, manualReview = true) {
    const refund = await this.prisma.refundRequest.update({ where: { id: refundId }, data: { status: "failed" } });
    return this.prisma.order.update({ where: { id: refund.orderId }, data: { bookingStatus: manualReview ? "manual_review_required" : "compensation_pending" } });
  }

  async verifyOtp(challengeId: string, code: string, sessionTtlHours: number) {
    const challenge = await this.prisma.otpChallenge.findUnique({ where: { id: challengeId } });
    if (!challenge || challenge.usedAt || challenge.expiresAt <= new Date()) throw new DomainError("OTP_EXPIRED", "کد تایید منقضی شده است");
    const counted = await this.prisma.otpChallenge.updateMany({ where: { id: challengeId, usedAt: null, attempts: { lt: 5 } }, data: { attempts: { increment: 1 } } });
    if (!counted.count) throw new DomainError("OTP_LOCKED", "تعداد تلاش بیش از حد مجاز است", 429);
    if (hash(code) !== challenge.codeHash) throw new DomainError("OTP_INVALID", "کد تایید اشتباه است");
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.otpChallenge.updateMany({ where: { id: challengeId, usedAt: null }, data: { usedAt: new Date() } });
      if (!claimed.count) throw new DomainError("OTP_EXPIRED", "کد تایید قبلاً استفاده شده است");
      const user = await tx.user.upsert({ where: { mobile: challenge.mobile }, update: {}, create: { mobile: challenge.mobile } });
      await tx.otpChallenge.update({ where: { id: challengeId }, data: { userId: user.id } });
      await tx.wallet.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, currency: MONEY_CURRENCY } });
      await tx.order.updateMany({ where: { userId: null, guestMobile: user.mobile }, data: { userId: user.id } });
      const token = randomBytes(32).toString("base64url");
      await tx.authSession.create({ data: { userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + sessionTtlHours * 3_600_000) } });
      return { user, token };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async userFromSession(token: string) {
    const session = await this.prisma.authSession.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
    if (!session || session.expiresAt <= new Date()) { if (session) await this.prisma.authSession.delete({ where: { id: session.id } }); return undefined; }
    return session.user;
  }
  async logout(token: string) { await this.prisma.authSession.deleteMany({ where: { tokenHash: hash(token) } }); }
  profile(userId: string) { return this.prisma.user.findUniqueOrThrow({ where: { id: userId } }); }
  updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string; birthDate?: string; nationalId?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email === "" ? null : data.email,
        birthDate: data.birthDate ? new Date(`${data.birthDate}T00:00:00.000Z`) : data.birthDate === "" ? null : undefined,
        nationalId: data.nationalId === "" ? null : data.nationalId,
      },
    });
  }

  async createCheckout(userId: string | undefined, input: CheckoutInput) {
    const quantity = Math.max(1, Math.min(9, Math.trunc(input.quantity)));
    let base: number = servicePrices[input.serviceType];
    let managedPricing = false;
    let service: Record<string, unknown> = input.service ?? { offer: `${input.serviceType}-demo` };
    const ids = (input.serviceType === "tour" || input.serviceType === "ziyarat") ? managedIds(service) : null;
    if (ids) {
      const program = await this.prisma.travelProgram.findFirst({ where: { id: ids.programId, type: input.serviceType === "tour" ? "TOUR" : "ZIYARAT", status: "ACTIVE", publicationStatus: "PUBLISHED" }, include: { destinations: { orderBy: { sortOrder: "asc" } }, media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] }, departures: { where: { id: ids.departureId }, include: { orders: { select: { travelers: true, paymentStatus: true, bookingStatus: true } } } }, packages: { where: { id: ids.packageId, status: "ACTIVE" }, include: { orders: { select: { travelers: true, paymentStatus: true, bookingStatus: true } } } } } });
      const departure = program?.departures[0]; const pack = program?.packages[0];
      if (!program || !departure || !pack || (pack.departureId && pack.departureId !== departure.id)) throw new DomainError("PROGRAM_SELECTION_INVALID", "انتخاب برنامه، حرکت یا پکیج معتبر نیست", 409);
      const counts = bookedCounts(departure.orders); const capacity = capacitySnapshot({ totalCapacity: departure.totalCapacity, heldCapacity: departure.heldCapacity, ...counts });
      const status = effectiveDepartureStatus(departure.saleStatus as DepartureSaleStatus, capacity.remaining, capacity.totalCapacity);
      assertDepartureSaleable({ status, remaining: capacity.remaining, salesStartAt: departure.salesStartAt, salesEndAt: departure.salesEndAt });
      const travelers = input.travelers?.length ? input.travelers : Array.from({ length: quantity }, () => ({ ageCategory: "adult" }));
      if (travelers.length > capacity.remaining) throw new DomainError("PROGRAM_CAPACITY_EXCEEDED", "ظرفیت کافی برای تعداد مسافران وجود ندارد", 409);
      if (pack.capacity !== null) { const packageBooked = bookedCounts(pack.orders).bookedTravelers; if (travelers.length > Math.max(0, pack.capacity - packageBooked)) throw new DomainError("PACKAGE_CAPACITY_EXCEEDED", "ظرفیت این پکیج تکمیل شده است", 409); }
      base = calculatePackageTotal(pack, travelers);
      managedPricing = true;
      service = { managed: true, sourceType: program.sourceType, offer: { id: program.id, slug: program.slug, type: input.serviceType, title: program.title, origin: program.origin, destinations: program.destinations.map((item) => item.label), durationDays: program.durationDays, durationNights: program.durationNights, images: program.media.map((item) => item.url), description: program.description }, departure: { id: departure.id, startDate: departure.startDate.toISOString(), endDate: departure.endDate.toISOString(), transport: departure.transportType, status: status.toLowerCase(), availableMock: capacity.remaining, basePrice: pack.adultPrice }, package: { id: pack.id, name: pack.name, hotel: pack.hotelName ?? "", hotelStars: pack.hotelStars ?? 0, roomType: pack.roomType ?? "", mealPlan: pack.mealPlan ?? "", pricePerAdult: pack.adultPrice, pricePerChild: pack.childPrice, pricePerInfant: pack.infantPrice, currency: "TOMAN" }, searchUrl: typeof service.searchUrl === "string" ? service.searchUrl : `/${input.serviceType}` };
    }
    const hotelIds=input.serviceType==="hotel"?managedHotelIds(service):null;
    if(hotelIds){const dates=stayDates(hotelIds.checkIn,hotelIds.checkOut);const property=await this.prisma.property.findFirst({where:{id:hotelIds.propertyId,sourceType:{in:["DIRECT","DEMO"]},publicationStatus:"PUBLISHED",operationalStatus:"ACTIVE"},include:{roomTypes:{where:{id:hotelIds.roomTypeId,status:"ACTIVE"},include:{ratePlans:{where:{id:hotelIds.ratePlanId,status:"ACTIVE"},include:{inventory:{where:{date:{in:dates}}}}}}}}});const room=property?.roomTypes[0];const rate=room?.ratePlans[0];if(!property||!room||!rate)throw new DomainError("HOTEL_SELECTION_INVALID","انتخاب هتل، اتاق یا نرخ معتبر نیست",409);if(rate.inventory.length!==dates.length)throw new DomainError("HOTEL_AVAILABILITY_UNKNOWN","موجودی همه شب‌های اقامت ثبت نشده است",409);if(dates.length<(Math.max(...rate.inventory.map(day=>day.minimumStay))))throw new DomainError("HOTEL_MINIMUM_STAY","حداقل مدت اقامت این نرخ رعایت نشده است",409);const prices=rate.inventory.map(day=>inventoryPrice(rate.baseRate,day));if(prices.some(price=>price===null)||rate.inventory.some(day=>day.availableRooms<hotelIds.roomCount))throw new DomainError("HOTEL_SOLD_OUT","اتاق برای تمام شب‌های انتخابی موجود نیست",409);base=prices.reduce<number>((sum,price)=>sum+(price??0),0)*hotelIds.roomCount;managedPricing=true;service={managed:true,sourceType:property.sourceType,hotel:{id:property.id,slug:property.slug,name:property.name,city:property.city,country:property.country,address:property.address,stars:property.stars,images:property.images},stay:{checkIn:hotelIds.checkIn.toISOString().slice(0,10),checkOut:hotelIds.checkOut.toISOString().slice(0,10)},room:{id:room.id,name:room.name,capacity:room.capacity,bedType:room.bedType},ratePlan:{id:rate.id,title:rate.title,mealPlan:rate.mealPlan,refundable:rate.refundable,cancellationPolicy:rate.cancellationPolicy,nightlyPrice:rate.baseRate,taxesIncluded:rate.taxesIncluded},roomCount:hotelIds.roomCount,searchUrl:typeof service.searchUrl==="string"?service.searchUrl:`/hotels/${property.slug}`};}
    const addOns = (input.addOns ?? []).filter((item) => addOnPrices[item.code]).map((item) => ({ code: item.code, quantity: Math.max(1, Math.min(9, Math.trunc(item.quantity ?? 1))), unitPrice: addOnPrices[item.code] }));
    const subtotal = (managedPricing ? base : base * quantity) + addOns.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discount = input.coupon?.toUpperCase() === "DEMO10" ? Math.floor(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    const guestMobile = input.guestMobile && mobilePattern.test(input.guestMobile) ? input.guestMobile : undefined;
    return this.prisma.checkoutSession.create({ data: { userId, guestMobile, serviceType: input.serviceType, service: asJson(service), buyer: asJson(input.buyer ?? { mobile: guestMobile }), travelers: asJson(input.travelers ?? []), addOns: asJson(addOns), coupon: input.coupon, pricing: asJson({ base, quantity, addOns, subtotal, discount, total }), total, currency: MONEY_CURRENCY, status: "ready_for_payment", expiresAt: new Date(Date.now() + 30 * 60_000) } });
  }

  getCheckout(id: string, userId: string) { return this.prisma.checkoutSession.findFirst({ where: { id, userId } }); }
  async paymentSplit(checkoutSessionId: string, userId: string, method: PaymentMethod | string) {
    const checkout = await this.prisma.checkoutSession.findFirst({ where: { id: checkoutSessionId, userId }, include: { user: { include: { wallet: true } } } });
    if (!checkout) throw forbidden();
    const balance = checkout.user?.wallet?.balance ?? 0;
    const walletAmount = method === "wallet" ? checkout.total : method === "combined" ? Math.min(balance, checkout.total) : 0;
    if (method === "wallet" && balance < checkout.total) throw new DomainError("INSUFFICIENT_WALLET", "موجودی کیف پول کافی نیست", 409);
    return { walletAmount, onlineAmount: checkout.total - walletAmount };
  }
  async getCompletedPaymentByKey(checkoutSessionId: string, userId: string, idempotencyKey: string) {
    const payment = await this.prisma.paymentAttempt.findFirst({ where: { checkoutSessionId, idempotencyKey, status: { in: ["succeeded", "refunded"] }, checkoutSession: { userId } }, include: { order: true } });
    return payment?.order ? { payment, order: payment.order } : null;
  }
  listOrders(userId: string, page = 1, perPage = 20) { return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage + 1 }); }
  async getOrder(id: string, userId: string) { const order = await this.prisma.order.findFirst({ where: { id, userId }, include: { payments: true, refunds: true } }); if (!order) throw forbidden(); return order; }

  async finalizePayment(checkoutSessionId: string, userId: string, idempotencyKey: string, method: PaymentMethod | string, metadata?: Record<string, unknown>, providerData?: { provider: string; externalReference?: string; payload?: Record<string, unknown> }) {
    const existing = await this.prisma.paymentAttempt.findUnique({ where: { checkoutSessionId_idempotencyKey: { checkoutSessionId, idempotencyKey } }, include: { order: true } });
    if (existing?.status === "succeeded" && existing.order) return { payment: existing, order: existing.order };
    try {
      return await this.serializable(async (tx) => {
        const duplicate = await tx.paymentAttempt.findUnique({ where: { checkoutSessionId_idempotencyKey: { checkoutSessionId, idempotencyKey } }, include: { order: true } });
        if (duplicate?.status === "succeeded" && duplicate.order) return { payment: duplicate, order: duplicate.order };
        const checkout = await tx.checkoutSession.findFirst({ where: { id: checkoutSessionId, userId }, include: { user: { include: { wallet: true } }, order: true } });
        if (!checkout) throw forbidden();
        if (checkout.order) { const paid = await tx.paymentAttempt.findFirst({ where: { orderId: checkout.order.id, status: "succeeded" } }); if (!paid) throw new DomainError("PAYMENT_STATE_INVALID", "وضعیت پرداخت معتبر نیست", 409); return { payment: paid, order: checkout.order }; }
        if (checkout.expiresAt <= new Date()) throw new DomainError("CHECKOUT_EXPIRED", "زمان پرداخت به پایان رسیده است", 409);
        if (checkout.status !== "ready_for_payment" && checkout.status !== "payment_pending") throw new DomainError("CHECKOUT_STATE_INVALID", "وضعیت checkout معتبر نیست", 409);
        const wallet = checkout.user?.wallet;
        const balance = wallet?.balance ?? 0;
        const walletAmount = method === "wallet" ? checkout.total : method === "combined" ? Math.min(balance, checkout.total) : 0;
        const onlineAmount = checkout.total - walletAmount;
        if (method === "wallet" && balance < checkout.total) throw new DomainError("INSUFFICIENT_WALLET", "موجودی کیف پول کافی نیست", 409);
        const payment = duplicate ?? await tx.paymentAttempt.create({ data: { checkoutSessionId, provider: providerData?.provider ?? "mock", method, status: "pending", amount: checkout.total, walletAmount, onlineAmount, idempotencyKey, metadata: asJson({ ...(metadata ?? {}), providerPayload: providerData?.payload ?? {} }) } });
        if (walletAmount > 0) {
          if (!wallet) throw new DomainError("INSUFFICIENT_WALLET", "کیف پول پیدا نشد", 409);
          const debited = await tx.wallet.updateMany({ where: { id: wallet.id, balance: { gte: walletAmount } }, data: { balance: { decrement: walletAmount } } });
          if (debited.count !== 1) throw new DomainError("INSUFFICIENT_WALLET", "موجودی کیف پول کافی نیست", 409);
          const updated = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
          await tx.walletTransaction.create({ data: { walletId: wallet.id, type: "debit", amount: -walletAmount, balanceAfter: updated.balance, reference: `WAL-${payment.id}` } });
        }
        const counter = await tx.orderCounter.upsert({ where: { id: 1 }, create: { id: 1, nextValue: 1 }, update: { nextValue: { increment: 1 } } });
        const orderNumber = `KIA-${new Date().getUTCFullYear()}-${String(counter.nextValue).padStart(6, "0")}`;
        const reference = `PAY-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
        const trackingCode = `TRK-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
        const internalService = checkout.serviceType === "tour" || checkout.serviceType === "ziyarat";
        const ids = internalService ? managedIds(checkout.service) : null;
        let managed: { organizationId: string; programId: string; departureId: string; packageId: string; title: string; startDate: Date; sourceType: string } | null = null;
        if (ids) {
          const program = await tx.travelProgram.findFirst({ where: { id: ids.programId, status: "ACTIVE", publicationStatus: "PUBLISHED" }, include: { departures: { where: { id: ids.departureId }, include: { orders: { select: { travelers: true, paymentStatus: true, bookingStatus: true } } } }, packages: { where: { id: ids.packageId, status: "ACTIVE" }, include: { orders: { select: { travelers: true, paymentStatus: true, bookingStatus: true } } } } } });
          const departure = program?.departures[0]; const pack = program?.packages[0];
          if (!program || !departure || !pack || (pack.departureId && pack.departureId !== departure.id)) throw new DomainError("PROGRAM_SELECTION_INVALID", "انتخاب برنامه دیگر معتبر نیست", 409);
          const capacity = capacitySnapshot({ totalCapacity: departure.totalCapacity, heldCapacity: departure.heldCapacity, ...bookedCounts(departure.orders) }); const status = effectiveDepartureStatus(departure.saleStatus as DepartureSaleStatus, capacity.remaining, capacity.totalCapacity); const requested = Array.isArray(checkout.travelers) ? Math.max(1, checkout.travelers.length) : 1;
          assertDepartureSaleable({ status, remaining: capacity.remaining, salesStartAt: departure.salesStartAt, salesEndAt: departure.salesEndAt });
          if (requested > capacity.remaining) throw new DomainError("PROGRAM_CAPACITY_EXCEEDED", "ظرفیت حرکت در زمان پرداخت تکمیل شده است", 409);
          if (pack.capacity !== null && requested > Math.max(0, pack.capacity - bookedCounts(pack.orders).bookedTravelers)) throw new DomainError("PACKAGE_CAPACITY_EXCEEDED", "ظرفیت پکیج در زمان پرداخت تکمیل شده است", 409);
          managed = { organizationId: program.organizationId, programId: program.id, departureId: departure.id, packageId: pack.id, title: program.title, startDate: departure.startDate, sourceType: program.sourceType };
        }
        const hotelIds=checkout.serviceType==="hotel"?managedHotelIds(checkout.service):null;let managedHotel:{organizationId:string;propertyId:string;roomTypeId:string;ratePlanId:string;title:string;checkIn:Date;checkOut:Date;roomCount:number;sourceType:string}|null=null;if(hotelIds){const dates=stayDates(hotelIds.checkIn,hotelIds.checkOut);const property=await tx.property.findFirst({where:{id:hotelIds.propertyId,sourceType:{in:["DIRECT","DEMO"]},publicationStatus:"PUBLISHED",operationalStatus:"ACTIVE"},include:{roomTypes:{where:{id:hotelIds.roomTypeId,status:"ACTIVE"},include:{ratePlans:{where:{id:hotelIds.ratePlanId,status:"ACTIVE"},include:{inventory:{where:{date:{in:dates}}}}}}}}});const room=property?.roomTypes[0];const rate=room?.ratePlans[0];if(!property||!room||!rate||rate.inventory.length!==dates.length)throw new DomainError("HOTEL_SELECTION_INVALID","انتخاب هتل دیگر معتبر نیست",409);for(const day of rate.inventory){if(inventoryPrice(rate.baseRate,day)===null)throw new DomainError("HOTEL_SOLD_OUT","موجودی اقامت تکمیل شده است",409);const updated=await tx.dailyInventory.updateMany({where:{id:day.id,closed:false,availableRooms:{gte:hotelIds.roomCount}},data:{availableRooms:{decrement:hotelIds.roomCount}}});if(updated.count!==1)throw new DomainError("HOTEL_SOLD_OUT","موجودی اقامت در زمان پرداخت تکمیل شد",409);}managedHotel={organizationId:property.organizationId,propertyId:property.id,roomTypeId:room.id,ratePlanId:rate.id,title:property.name,checkIn:hotelIds.checkIn,checkOut:hotelIds.checkOut,roomCount:hotelIds.roomCount,sourceType:property.sourceType};}
        const managedOrganizationId=managed?.organizationId??managedHotel?.organizationId;const order = await tx.order.create({ data: { userId, checkoutSessionId: checkout.id, orderNumber, trackingCode, guestMobile: checkout.guestMobile ?? checkout.user?.mobile, serviceType: checkout.serviceType, merchantOrganizationId: managedOrganizationId, travelProgramId: managed?.programId, travelProgramDepartureId: managed?.departureId, travelProgramPackageId: managed?.packageId,propertyId:managedHotel?.propertyId,roomTypeId:managedHotel?.roomTypeId,ratePlanId:managedHotel?.ratePlanId, summary: asJson(managed ? { serviceType: checkout.serviceType, title: managed.title, managed: true, sourceType: managed.sourceType } : managedHotel?{serviceType:"hotel",title:managedHotel.title,managed:true,sourceType:managedHotel.sourceType}:{ serviceType: checkout.serviceType }), buyer: checkout.buyer, travelers: checkout.travelers, serviceSnapshot: checkout.service, pricingSnapshot: checkout.pricing, paymentSnapshot: asJson({ method, reference, walletAmount, onlineAmount, metadata: metadata ?? {}, provider: providerData?.provider ?? "mock", externalReference: providerData?.externalReference }), total: checkout.total, currency: MONEY_CURRENCY, paymentStatus: "paid", bookingStatus: managed||managedHotel ? "confirmed" : "paid_booking_pending", providerName: managed ? (managed.sourceType === "DEMO" ? "managed-demo" : "direct-managed") : managedHotel?(managedHotel.sourceType==="DEMO"?"managed-demo-hotel":"direct-hotel"):internalService ? "internal-mock" : undefined, relevantDate: managed?.startDate??managedHotel?.checkIn } });
        if (managedHotel) await tx.hotelInventoryAllocation.create({ data: { orderId: order.id, organizationId: managedHotel.organizationId, propertyId: managedHotel.propertyId, roomTypeId: managedHotel.roomTypeId, ratePlanId: managedHotel.ratePlanId, checkIn: managedHotel.checkIn, checkOut: managedHotel.checkOut, roomCount: managedHotel.roomCount, sourceType: managedHotel.sourceType } });
        const completed = await tx.paymentAttempt.update({ where: { id: payment.id }, data: { orderId: order.id, status: "succeeded", reference, completedAt: new Date() } });
        await tx.transaction.create({ data: { orderId: order.id, walletId: walletAmount ? wallet?.id : undefined, type: "payment", status: "succeeded", amount: checkout.total, currency: MONEY_CURRENCY, reference } });
        await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: "completed" } });
        await tx.notification.create({ data: { userId, type: "order", title: "سفارش ثبت شد", body: `سفارش ${orderNumber} با موفقیت ثبت شد.` } });
        return { payment: completed, order };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const result = await this.prisma.paymentAttempt.findUnique({ where: { checkoutSessionId_idempotencyKey: { checkoutSessionId, idempotencyKey } }, include: { order: true } });
        if (result?.order) return { payment: result, order: result.order };
      }
      throw error;
    }
  }

  async wallet(userId: string, page = 1, perPage = 20) { return this.prisma.wallet.findUniqueOrThrow({ where: { userId }, include: { transactions: { orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage + 1 } } }); }
  listPassengers(userId: string) { return this.prisma.passenger.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); }
  createPassenger(userId: string, data: { firstName: string; lastName: string; nationalId?: string; passportNumber?: string }) { return this.prisma.passenger.create({ data: { userId, ...data } }); }
  async updatePassenger(id: string, userId: string, data: { firstName?: string; lastName?: string; nationalId?: string; passportNumber?: string }) { const owned = await this.prisma.passenger.findFirst({ where: { id, userId } }); if (!owned) throw forbidden(); return this.prisma.passenger.update({ where: { id }, data }); }
  async deletePassenger(id: string, userId: string) { const deleted = await this.prisma.passenger.deleteMany({ where: { id, userId } }); if (!deleted.count) throw forbidden(); }

  listFavorites(userId: string, page = 1, perPage = 20) { return this.prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage + 1 }); }
  createFavorite(userId: string, itemType: string, itemId: string) { return this.prisma.favorite.upsert({ where: { userId_itemType_itemId: { userId, itemType, itemId } }, create: { userId, itemType, itemId }, update: {} }); }
  async deleteFavorite(id: string, userId: string) { const deleted = await this.prisma.favorite.deleteMany({ where: { id, userId } }); if (!deleted.count) throw forbidden(); }

  listNotifications(userId: string, page = 1, perPage = 20) { return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage + 1 }); }
  async readNotification(id: string, userId: string) { const updated = await this.prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } }); if (!updated.count) throw forbidden(); }
  async readAllNotifications(userId: string) { await this.prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } }); }

  listSupport(userId: string, page = 1, perPage = 20) { return this.prisma.supportTicket.findMany({ where: { userId }, include: { messages: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage + 1 }); }
  createSupport(userId: string, subject: string, body: string) { return this.prisma.supportTicket.create({ data: { userId, subject, messages: { create: { authorType: "customer", body } } }, include: { messages: true } }); }
  async addSupportMessage(ticketId: string, userId: string, body: string) { const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, userId } }); if (!ticket) throw forbidden(); return this.prisma.supportMessage.create({ data: { ticketId, authorType: "customer", body } }); }

  async listVisa(userId: string, page = 1, perPage = 20) { const rows=await this.prisma.visaApplication.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage + 1 });return rows.map(row=>({...row,status:normalizeVisaStatus(row.status),payload:publicVisaPayload(row.payload)})); }
  async createVisa(userId: string, country: string, payload: Record<string, unknown>) { const editable=customerEditableVisaPayload(payload);const created=await this.prisma.visaApplication.create({ data: { userId, country, status:"DRAFT", payload: asJson({...editable,checklist:emptyVisaChecklist(),timeline:[{status:"DRAFT",at:new Date().toISOString(),audience:"customer",note:"پرونده ایجاد شد"}]}) } });return{...created,payload:publicVisaPayload(created.payload)}; }
  async updateVisa(id: string, userId: string, data: { status?: string; payload?: Record<string, unknown> }) { const visa = await this.prisma.visaApplication.findFirst({ where: { id, userId } }); if (!visa) throw forbidden();const currentStatus=normalizeVisaStatus(visa.status);if(!["DRAFT","DOCUMENTS_REQUIRED"].includes(currentStatus))throw new DomainError("VISA_CUSTOMER_UPDATE_DENIED","این پرونده در حال بررسی است و قابل ویرایش نیست",409);const nextStatus=data.status?normalizeVisaStatus(data.status):currentStatus;if(!["DRAFT","SUBMITTED"].includes(nextStatus))throw new DomainError("VISA_CUSTOMER_STATUS_DENIED","این وضعیت توسط مشتری قابل ثبت نیست",409);assertVisaTransition(currentStatus,nextStatus);const existing=visa.payload&&typeof visa.payload==="object"&&!Array.isArray(visa.payload)?visa.payload as Record<string,unknown>:{};const editable=data.payload?customerEditableVisaPayload(data.payload):customerEditableVisaPayload(existing);const timeline=Array.isArray(existing.timeline)?existing.timeline:[];const updated=await this.prisma.visaApplication.update({ where: { id }, data: { status: nextStatus, payload: asJson({...existing,...editable,...(nextStatus!==currentStatus?{submittedAt:new Date().toISOString(),timeline:[...timeline,{status:nextStatus,at:new Date().toISOString(),audience:"customer",note:"درخواست توسط مشتری ارسال شد"}]}:{})}) } });return{...updated,payload:publicVisaPayload(updated.payload)}; }

  async requestRefund(userId: string, orderId: string, reason: string, destination: "wallet" | "original_payment") {
    return this.serializable(async (tx) => {
      const order = await tx.order.findFirst({ where: { id: orderId, userId }, include: { payments: { where: { status: "succeeded" }, orderBy: { createdAt: "desc" }, take: 1 } } }); if (!order) throw forbidden();
      if (order.paymentStatus !== "paid" || order.bookingStatus === "refunded") throw new DomainError("REFUND_NOT_AVAILABLE", "این سفارش قابل استرداد نیست", 409);
      const duplicate = await tx.refundRequest.findFirst({ where: { orderId, status: { in: ["requested", "processing"] } } }); if (duplicate) throw new DomainError("REFUND_ALREADY_OPEN", "برای این سفارش درخواست استرداد باز وجود دارد", 409);
      const payment = order.payments[0];
      const walletAmount = destination === "wallet" ? order.total : payment?.walletAmount ?? 0;
      const onlineAmount = order.total - walletAmount;
      return tx.refundRequest.create({ data: { orderId, userId, amount: order.total, walletAmount, onlineAmount, reason, destination } });
    });
  }
  listRefunds(userId: string) { return this.prisma.refundRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); }

  async track(identifier: string, mobile: string) {
    const order = await this.prisma.order.findFirst({ where: { OR: [{ orderNumber: identifier }, { trackingCode: identifier }, { payments: { some: { reference: identifier } } }] }, include: { user: { select: { mobile: true } } } });
    if (!order || (order.guestMobile ?? order.user?.mobile) !== mobile) throw notFound("سفارشی با این مشخصات پیدا نشد");
    const maskedMobile = `${mobile.slice(0, 4)}***${mobile.slice(-4)}`;
    return { orderNumber: order.orderNumber, trackingCode: order.trackingCode, buyerMobile: maskedMobile, serviceType: order.serviceType, summary: order.summary, relevantDate: order.relevantDate, paymentStatus: order.paymentStatus, bookingStatus: order.bookingStatus, total: order.total, currency: order.currency, createdAt: order.createdAt };
  }
}
