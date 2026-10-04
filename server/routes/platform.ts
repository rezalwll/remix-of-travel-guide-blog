import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { DomainError } from "../domain/errors.js";
import { permissionCatalog, requirePermission, type PermissionCode } from "../platform/permissions.js";
import { reportRange, type ReportPreset } from "../platform/reporting.js";
import type { PlatformAccessContext } from "../repositories/platform.js";
import { PlatformRepository } from "../repositories/platform.js";
import { visaDocumentKeys, visaDocumentStates, visaStatuses } from "../visa/domain.js";

type AuthenticatedUser = { id: string };
type FeatureConfig = { WEB_ORIGIN: string; BACKOFFICE_ENABLED: boolean; MERCHANT_PORTAL_ENABLED: boolean };

type RouteDependencies = {
  repository: PlatformRepository;
  env: FeatureConfig;
  currentUser: (request: FastifyRequest) => Promise<AuthenticatedUser | undefined>;
  enforceRate: (key: string, limit: number, windowMs: number) => void;
  errorResponse: (reply: FastifyReply, status: number, code: string, message: string, details?: Record<string, unknown>) => FastifyReply;
  providerStatus?:()=>Promise<Array<{key:string;adapter:string;mode:string;lifecycle:string;enabled:boolean;optional:boolean;healthy:boolean;checkedAt:string;reason?:string}>>;
  runReconciliation?:(limit:number)=>Promise<unknown>;
};

const pageSchema = z.object({ page: z.coerce.number().int().min(1).max(10_000).default(1), perPage: z.coerce.number().int().min(1).max(100).default(20) });
const rangeSchema = z.object({
  preset: z.enum(["today", "7d", "30d", "current_month"]).default("30d"),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
}).superRefine((value, context) => {
  if ((value.from && !value.to) || (!value.from && value.to)) context.addIssue({ code: z.ZodIssueCode.custom, message: "from و to باید با هم ارسال شوند" });
  if (value.from && value.to && new Date(value.from) >= new Date(value.to)) context.addIssue({ code: z.ZodIssueCode.custom, message: "بازه زمانی معتبر نیست" });
  if (value.from && value.to && new Date(value.to).getTime() - new Date(value.from).getTime() > 366 * 86_400_000) context.addIssue({ code: z.ZodIssueCode.custom, message: "بازه گزارش حداکثر ۳۶۶ روز است" });
});
const uuid = z.string().uuid();
const merchantBusinessType = z.enum(["HOTEL", "TOUR_OPERATOR", "TRAVEL_AGENCY", "TRANSPORT_PROVIDER", "SERVICE_PROVIDER", "GENERAL_PARTNER"]);
const organizationStatus = z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]);
const onboardingStatus = z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"]);
const contractStatus = z.enum(["NOT_STARTED", "PENDING", "ACTIVE", "EXPIRED", "SUSPENDED"]);
const settlementProfileStatus = z.enum(["INACTIVE", "ACTIVE", "SUSPENDED"]);
const membershipStatus = z.enum(["INVITED", "ACTIVE", "SUSPENDED", "REVOKED"]);
const providerDrivenService = z.enum(["flight", "train", "bus", "insurance", "cip", "transfer"]);
const settlementStatus=z.enum(["DRAFT","READY","APPROVED","PROCESSING","PAID","FAILED","CANCELLED"]);
const merchantRole=z.enum(["MERCHANT_OWNER","MERCHANT_MANAGER","MERCHANT_FINANCE","MERCHANT_OPERATOR","MERCHANT_READONLY"]);

function parsePage(query: unknown) {
  const result = pageSchema.safeParse(query);
  if (!result.success) throw new DomainError("VALIDATION_ERROR", "صفحه‌بندی معتبر نیست", 400);
  return { page: result.data.page ?? 1, perPage: result.data.perPage ?? 20 };
}

function parseRange(query: unknown) {
  const result = rangeSchema.safeParse(query);
  if (!result.success) throw new DomainError("VALIDATION_ERROR", "بازه زمانی معتبر نیست", 400);
  if (result.data.from && result.data.to) return { from: new Date(result.data.from), to: new Date(result.data.to) };
  return reportRange(result.data.preset as ReportPreset);
}

function pagination(page: { page: number; perPage: number }, total: number) {
  return { ...page, total, totalPages: Math.ceil(total / page.perPage), hasMore: page.page * page.perPage < total };
}

function mutationOriginAllowed(request: FastifyRequest, webOrigin: string) {
  const origin = request.headers.origin;
  const fetchSite = request.headers["sec-fetch-site"];
  if (origin && origin !== webOrigin) return false;
  if (fetchSite === "cross-site") return false;
  return true;
}

function actorFrom(request: FastifyRequest, context: PlatformAccessContext) {
  return { userId: context.user.id, organizationId: context.organization.id, requestId: request.id, ipAddress: request.ip, userAgent: request.headers["user-agent"] };
}

export async function registerPlatformRoutes(app: FastifyInstance, dependencies: RouteDependencies) {
  const { repository, env, currentUser, enforceRate, errorResponse,providerStatus,runReconciliation } = dependencies;

  app.addHook("onSend", async (request, reply, payload) => {
    if (request.url.startsWith("/api/backoffice/") || request.url.startsWith("/api/merchant/")) {
      reply.header("Cache-Control", "private, no-store, max-age=0");
      reply.header("Pragma", "no-cache");
      reply.header("Vary", "Origin, Cookie, Authorization, X-Organization-Id");
    }
    return payload;
  });

  async function contextFor(request: FastifyRequest, reply: FastifyReply, scope: "INTERNAL" | "MERCHANT", permission: PermissionCode) {
    const enabled = scope === "INTERNAL" ? env.BACKOFFICE_ENABLED : env.MERCHANT_PORTAL_ENABLED;
    if (!enabled) { errorResponse(reply, 404, "NOT_FOUND", "موردی پیدا نشد"); return undefined; }
    const user = await currentUser(request);
    if (!user) { errorResponse(reply, 401, "AUTH_REQUIRED", "برای ادامه وارد حساب شوید"); return undefined; }
    const requested = scope === "MERCHANT" && typeof request.headers["x-organization-id"] === "string" ? request.headers["x-organization-id"] : undefined;
    if (requested && !uuid.safeParse(requested).success) { errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه سازمان معتبر نیست"); return undefined; }
    const context = await repository.accessContext(user.id, scope, requested);
    if (!context) { errorResponse(reply, 403, "ACCESS_DENIED", "دسترسی به این بخش برای حساب شما فعال نیست"); return undefined; }
    requirePermission(context.permissions, permission);
    request.log.info({ actorUserId: user.id, organizationId: context.organization.id, accessScope: scope }, "platform access authorized");
    return context;
  }

  function protectMutation(request: FastifyRequest, context: PlatformAccessContext, action: string) {
    if (!mutationOriginAllowed(request, env.WEB_ORIGIN)) throw new DomainError("CSRF_REJECTED", "مبدأ درخواست معتبر نیست", 403);
    enforceRate(`platform:${action}:${context.user.id}`, 30, 10 * 60_000);
  }

  app.get("/api/backoffice/me", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.dashboard.view");
    return context ? { user: context.user, organization: context.organization, roles: context.roles, permissions: context.permissions } : undefined;
  });

  app.get("/api/backoffice/dashboard/summary", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.dashboard.view"); if (!context) return;
    return { report: await repository.reportSummary(parseRange(request.query)) };
  });

  app.get("/api/backoffice/orders", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.orders.read"); if (!context) return;
    const page = parsePage(request.query);
    const parsed = z.object({ serviceType: z.string().max(40).optional(), paymentStatus: z.string().max(40).optional(), bookingStatus: z.string().max(60).optional(), merchant: uuid.optional(), provider: z.string().max(80).optional(), orderNumber: z.string().max(80).optional(), trackingCode: z.string().max(80).optional(),query:z.string().max(100).optional() }).safeParse(request.query);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر سفارش معتبر نیست");
    const result = await repository.listBackofficeOrders({ ...parseRange(request.query), ...parsed.data, merchantOrganizationId: parsed.data.merchant }, page);
    return { orders: result.items, pagination: pagination(page, result.total) };
  });

  app.get<{ Params: { service: string } }>("/api/backoffice/operations/:service", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.orders.read"); if (!context) return;
    const service = providerDrivenService.safeParse(request.params.service);
    const filters = z.object({
      provider: z.string().trim().max(80).optional(),
      route: z.string().trim().max(120).optional(),
      bookingStatus: z.string().trim().max(60).optional(),
      paymentStatus: z.string().trim().max(40).optional(),
      manualReview: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    }).safeParse(request.query);
    if (!service.success || !filters.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر عملیات سرویس معتبر نیست");
    const page = parsePage(request.query);
    const result = await repository.listServiceOperations(service.data, { ...parseRange(request.query), ...filters.data }, page);
    return { service: service.data, operations: result.items, pagination: pagination(page, result.total), inventoryAuthority: "provider" };
  });

  app.get<{ Params: { id: string } }>("/api/backoffice/orders/:id", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.orders.read"); if (!context) return;
    if (!uuid.safeParse(request.params.id).success) return errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه سفارش معتبر نیست");
    const order = await repository.getBackofficeOrder(request.params.id);
    if (!order) return errorResponse(reply, 404, "NOT_FOUND", "سفارش پیدا نشد");
    return { order };
  });

  app.get("/api/backoffice/payments", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.payments.read"); if (!context) return;
    const page = parsePage(request.query); const result = await repository.listPayments(parseRange(request.query), page);
    return { payments: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/backoffice/refunds", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.refunds.read"); if (!context) return;
    const page = parsePage(request.query); const result = await repository.listRefunds(parseRange(request.query), page);
    return { refunds: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/backoffice/support", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.support.read"); if (!context) return;
    const parsed=z.object({status:z.enum(["open","pending","resolved","closed"]).optional()}).safeParse(request.query);if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","فیلتر پشتیبانی معتبر نیست");
    const page = parsePage(request.query); const result = await repository.listSupport(page,parsed.data.status);
    return { tickets: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/backoffice/visa", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.visa.read"); if (!context) return;
    const parsed=z.object({status:z.enum(visaStatuses).optional(),country:z.string().trim().max(80).optional(),query:z.string().trim().max(120).optional()}).safeParse(request.query);
    if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","فیلتر پرونده ویزا معتبر نیست");
    const page=parsePage(request.query);const result=await repository.listVisaCases(parsed.data,page);
    return{applications:result.items,pagination:pagination(page,result.total)};
  });

  app.get<{Params:{id:string}}>("/api/backoffice/visa/:id",async(request,reply)=>{
    const context=await contextFor(request,reply,"INTERNAL","backoffice.visa.read");if(!context)return;
    if(!uuid.safeParse(request.params.id).success)return errorResponse(reply,400,"VALIDATION_ERROR","شناسه پرونده معتبر نیست");
    return{application:await repository.getVisaCase(request.params.id)};
  });

  app.patch<{Params:{id:string}}>("/api/backoffice/visa/:id",async(request,reply)=>{
    const context=await contextFor(request,reply,"INTERNAL","backoffice.visa.manage");if(!context)return;protectMutation(request,context,"visa-case");
    const checklistItem=z.object({status:z.enum(visaDocumentStates),note:z.string().trim().max(500).optional()});
    const checklist=z.record(z.enum(visaDocumentKeys),checklistItem);
    const parsed=z.object({status:z.enum(visaStatuses).optional(),checklist:checklist.optional(),internalNote:z.string().trim().max(3000).nullable().optional(),customerNote:z.string().trim().max(1500).nullable().optional(),reviewerId:uuid.nullable().optional(),providerReference:z.string().trim().max(180).nullable().optional()}).refine(value=>Object.keys(value).length>0).safeParse(request.body);
    if(!uuid.safeParse(request.params.id).success||!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","تغییرات پرونده ویزا معتبر نیست");
    await repository.updateVisaCase(request.params.id,parsed.data,actorFrom(request,context));
    return{application:await repository.getVisaCase(request.params.id)};
  });

  app.get<{Params:{id:string}}>("/api/backoffice/support/:id",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.support.read");if(!context)return;if(!uuid.safeParse(request.params.id).success)return errorResponse(reply,400,"VALIDATION_ERROR","شناسه معتبر نیست");return{ticket:await repository.getSupport(request.params.id)};});
  app.post<{Params:{id:string}}>("/api/backoffice/support/:id/internal-notes",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.support.manage");if(!context)return;protectMutation(request,context,"support-note");const parsed=z.object({note:z.string().trim().min(2).max(3000)}).safeParse(request.body);if(!uuid.safeParse(request.params.id).success||!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","یادداشت معتبر نیست");return reply.code(201).send({message:await repository.addSupportInternalNote(request.params.id,parsed.data.note,actorFrom(request,context))});});

  app.get("/api/backoffice/customers",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.customers.read");if(!context)return;const parsed=z.object({q:z.string().trim().min(2).max(120)}).safeParse(request.query);if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","عبارت جست‌وجو معتبر نیست");return{customers:await repository.customerLookup(parsed.data.q,actorFrom(request,context))};});
  app.get("/api/backoffice/action-required",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.orders.read");if(!context)return;return{queue:await repository.operationsQueue()};});

  app.get("/api/backoffice/providers",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.providers.read");if(!context)return;if(!providerStatus)return{providers:[]};const rows=await providerStatus();return{providers:rows.map(({key,adapter,mode,lifecycle,enabled,optional,healthy,checkedAt,reason})=>({key,adapter,mode,lifecycle,enabled,optional,healthy,checkedAt,...(reason?{reason}:{})}))};});
  app.get("/api/backoffice/reconciliation",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.providers.read");if(!context)return;const parsed=z.object({provider:z.string().trim().max(80).optional(),status:z.string().trim().max(40).optional()}).safeParse(request.query);if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","فیلتر تطبیق معتبر نیست");const page=parsePage(request.query);const result=await repository.reconciliationView(parseRange(request.query),page,parsed.data.provider,parsed.data.status);return{...result,pagination:pagination(page,result.total)};});
  app.post("/api/backoffice/reconciliation/run",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.reconciliation.run");if(!context)return;protectMutation(request,context,"reconciliation-run");if(!runReconciliation)return errorResponse(reply,409,"RECONCILIATION_UNAVAILABLE","اجرای تطبیق در این محیط فعال نیست");const parsed=z.object({limit:z.number().int().min(1).max(100).default(50)}).safeParse(request.body??{});if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","محدوده اجرای تطبیق معتبر نیست");await repository.recordOperatorAction({...actorFrom(request,context),action:"reconciliation.booking.triggered",resourceType:"BookingAttempt",metadata:{limit:parsed.data.limit,source:"backoffice"}});return{results:await runReconciliation(parsed.data.limit)};});

  app.get("/api/backoffice/merchants", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.merchants.read"); if (!context) return;
    const page = parsePage(request.query);
    const parsed = z.object({ status: organizationStatus.optional(), businessType: merchantBusinessType.optional() }).safeParse(request.query);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر پذیرنده معتبر نیست");
    const result = await repository.listMerchants(page, parsed.data.status, parsed.data.businessType);
    return { merchants: result.items, pagination: pagination(page, result.total) };
  });

  app.get<{ Params: { id: string } }>("/api/backoffice/merchants/:id", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.merchants.read"); if (!context) return;
    if (!uuid.safeParse(request.params.id).success) return errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه پذیرنده معتبر نیست");
    return { merchant: await repository.getMerchant(request.params.id) };
  });

  app.post("/api/backoffice/merchants", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.merchants.manage"); if (!context) return;
    protectMutation(request, context, "merchant-create");
    const parsed = z.object({ name: z.string().trim().min(2).max(120), legalName: z.string().trim().min(2).max(180).optional(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), contactEmail: z.string().email().optional(), contactMobile: z.string().regex(/^09\d{9}$/).optional(), merchantCode: z.string().regex(/^[A-Z0-9_-]{3,40}$/), businessType: merchantBusinessType, legalIdentifier: z.string().max(60).optional(), taxIdentifier: z.string().max(60).optional(), supportPhone: z.string().max(30).optional() }).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات پذیرنده معتبر نیست");
    return reply.code(201).send({ merchant: await repository.createMerchant({ ...parsed.data, name: parsed.data.name!, slug: parsed.data.slug!, merchantCode: parsed.data.merchantCode!, businessType: parsed.data.businessType! }, actorFrom(request, context)) });
  });

  app.patch<{ Params: { id: string } }>("/api/backoffice/merchants/:id", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.merchants.manage"); if (!context) return;
    protectMutation(request, context, "merchant-update");
    if (!uuid.safeParse(request.params.id).success) return errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه پذیرنده معتبر نیست");
    const parsed = z.object({ name: z.string().trim().min(2).max(120).optional(), legalName: z.string().trim().min(2).max(180).nullable().optional(), status: organizationStatus.optional(), contactEmail: z.string().email().nullable().optional(), contactMobile: z.string().regex(/^09\d{9}$/).nullable().optional(), onboardingStatus: onboardingStatus.optional(), contractStatus: contractStatus.optional(), settlementStatus: settlementProfileStatus.optional() }).refine((value) => Object.keys(value).length > 0).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تغییرات پذیرنده معتبر نیست");
    return { merchant: await repository.updateMerchant(request.params.id, parsed.data, actorFrom(request, context)) };
  });

  app.get("/api/backoffice/audit", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.audit.read"); if (!context) return;
    const page = parsePage(request.query);
    const parsed = z.object({ actor: uuid.optional(), action: z.string().max(100).optional(), resource: z.string().max(100).optional() }).safeParse(request.query);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر گزارش ممیزی معتبر نیست");
    const result = await repository.listAudit({ ...parseRange(request.query), actorUserId: parsed.data.actor, action: parsed.data.action, resourceType: parsed.data.resource }, page);
    return { audit: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/backoffice/reports/summary", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.reports.view"); if (!context) return;
    return { report: await repository.reportSummary(parseRange(request.query)) };
  });

  app.get("/api/backoffice/finance/summary",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.finance.view");if(!context)return;return{finance:await repository.backofficeFinanceSummary(parseRange(request.query))};});
  app.get("/api/backoffice/settlements",async(request,reply)=>{const context=await contextFor(request,reply,"INTERNAL","backoffice.finance.view");if(!context)return;const parsed=z.object({status:settlementStatus.optional(),merchantId:uuid.optional()}).safeParse(request.query);if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","فیلتر تسویه معتبر نیست");const page=parsePage(request.query);const result=await repository.listBackofficeSettlements(page,parsed.data.status,parsed.data.merchantId);return{settlements:result.items,pagination:pagination(page,result.total)};});

  app.post<{ Params: { id: string } }>("/api/backoffice/merchants/:id/finance-adjustments", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.finance.manage"); if (!context) return;
    protectMutation(request, context, "finance-adjustment");
    const parsed = z.object({ amount: z.number().int().safe().refine((value) => value !== 0), currency: z.literal("TOMAN").default("TOMAN"), reason: z.string().trim().min(3).max(500), idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{8,120}$/) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.id).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تعدیل مالی معتبر نیست");
    return reply.code(201).send({ entry: await repository.createFinanceAdjustment(request.params.id, { amount: parsed.data.amount!, currency: parsed.data.currency ?? "TOMAN", reason: parsed.data.reason!, idempotencyKey: parsed.data.idempotencyKey! }, actorFrom(request, context)) });
  });

  app.patch<{ Params: { merchantId: string; settlementId: string } }>("/api/backoffice/merchants/:merchantId/settlements/:settlementId", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.finance.manage"); if (!context) return;
    protectMutation(request, context, "settlement-status");
    const parsed = z.object({ status: z.enum(["DRAFT", "READY", "APPROVED", "PROCESSING", "PAID", "FAILED", "CANCELLED"]), notes: z.string().max(1000).optional() }).safeParse(request.body);
    if (!uuid.safeParse(request.params.merchantId).success || !uuid.safeParse(request.params.settlementId).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تغییر وضعیت تسویه معتبر نیست");
    return { settlement: await repository.updateSettlementStatus(request.params.merchantId, request.params.settlementId, parsed.data.status, parsed.data.notes, actorFrom(request, context)) };
  });

  app.patch<{ Params: { orderId: string } }>("/api/backoffice/bookings/:orderId", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.orders.manage"); if (!context) return;
    protectMutation(request, context, "booking-override");
    const parsed = z.object({ bookingStatus: z.enum(["confirmed", "reservation_failed", "manual_review_required", "refunded"]), reason: z.string().trim().min(5).max(500) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.orderId).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "بازنویسی وضعیت رزرو معتبر نیست");
    return { order: await repository.overrideBooking(request.params.orderId, parsed.data.bookingStatus, parsed.data.reason, actorFrom(request, context)) };
  });

  app.put<{ Params: { merchantId: string } }>("/api/backoffice/merchants/:merchantId/memberships", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.roles.manage"); if (!context) return;
    protectMutation(request, context, "membership-change");
    const parsed = z.object({ userId: uuid, status: membershipStatus }).safeParse(request.body);
    if (!uuid.safeParse(request.params.merchantId).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "عضویت معتبر نیست");
    return { membership: await repository.upsertMembership(request.params.merchantId, { userId: parsed.data.userId!, status: parsed.data.status! }, actorFrom(request, context)) };
  });

  app.put<{ Params: { merchantId: string; membershipId: string } }>("/api/backoffice/merchants/:merchantId/memberships/:membershipId/roles", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.roles.manage"); if (!context) return;
    protectMutation(request, context, "role-change");
    const parsed = z.object({ roles: z.array(z.string().max(80)).max(10) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.merchantId).success || !uuid.safeParse(request.params.membershipId).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "نقش‌ها معتبر نیستند");
    return { membership: await repository.setMembershipRoles(request.params.merchantId, request.params.membershipId, parsed.data.roles, actorFrom(request, context)) };
  });

  app.put<{ Params: { roleId: string } }>("/api/backoffice/roles/:roleId/permissions", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.roles.manage"); if (!context) return;
    protectMutation(request, context, "permission-change");
    const parsed = z.object({ permissions: z.array(z.enum(permissionCatalog)).max(permissionCatalog.length) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.roleId).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "مجوزها معتبر نیستند");
    return { role: await repository.setRolePermissions(request.params.roleId, parsed.data.permissions, actorFrom(request, context)) };
  });

  app.patch<{ Params: { id: string } }>("/api/backoffice/refunds/:id", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.refunds.manage"); if (!context) return;
    protectMutation(request, context, "refund-admin");
    const parsed = z.object({ status: z.enum(["processing", "failed"]), reason: z.string().trim().min(3).max(500) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.id).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "عملیات استرداد معتبر نیست");
    return { refund: await repository.updateRefundStatus(request.params.id, parsed.data.status, parsed.data.reason, actorFrom(request, context)) };
  });

  app.patch<{ Params: { id: string } }>("/api/backoffice/support/:id", async (request, reply) => {
    const context = await contextFor(request, reply, "INTERNAL", "backoffice.support.manage"); if (!context) return;
    protectMutation(request, context, "support-admin");
    const parsed = z.object({ status: z.enum(["open", "pending", "resolved", "closed"]) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.id).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "وضعیت پشتیبانی معتبر نیست");
    return { ticket: await repository.updateSupportStatus(request.params.id, parsed.data.status, actorFrom(request, context)) };
  });

  app.get("/api/merchant/me", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.dashboard.view");
    return context ? { user: context.user, organization: context.organization, roles: context.roles, permissions: context.permissions } : undefined;
  });

  app.get("/api/merchant/dashboard/summary", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.dashboard.view"); if (!context) return;
    return { report: await repository.reportSummary(parseRange(request.query), context.organization.id) };
  });

  app.get("/api/merchant/orders", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.orders.read"); if (!context) return;
    const page = parsePage(request.query);
    const parsed = z.object({ serviceType: z.string().max(40).optional(), paymentStatus: z.string().max(40).optional(), bookingStatus: z.string().max(60).optional() }).safeParse(request.query);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر سفارش معتبر نیست");
    const result = await repository.listMerchantOrders(context.organization.id, { ...parseRange(request.query), ...parsed.data }, page);
    return { orders: result.items, pagination: pagination(page, result.total) };
  });

  app.get<{ Params: { id: string } }>("/api/merchant/orders/:id", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.orders.read"); if (!context) return;
    if (!uuid.safeParse(request.params.id).success) return errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه سفارش معتبر نیست");
    return { order: await repository.getMerchantOrder(context.organization.id, request.params.id) };
  });

  app.get("/api/merchant/bookings", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.bookings.read"); if (!context) return;
    const page = parsePage(request.query); const result = await repository.listMerchantBookings(context.organization.id, parseRange(request.query), page);
    return { bookings: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/merchant/finance/summary", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.finance.view"); if (!context) return;
    return { finance: await repository.merchantFinanceSummary(context.organization.id, parseRange(request.query)) };
  });

  app.get("/api/merchant/settlements", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.settlements.read"); if (!context) return;
    const page = parsePage(request.query); const result = await repository.listMerchantSettlements(context.organization.id, page);
    return { settlements: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/merchant/team", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.team.read"); if (!context) return;
    const page = parsePage(request.query); const result = await repository.listMerchantTeam(context.organization.id, page);
    return { team: result.items, pagination: pagination(page, result.total) };
  });

  app.get("/api/merchant/profile", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.dashboard.view"); if (!context) return;
    return { profile: await repository.getMerchantProfile(context.organization.id) };
  });

  app.get("/api/merchant/action-required",async(request,reply)=>{const context=await contextFor(request,reply,"MERCHANT","merchant.dashboard.view");if(!context)return;return{queue:await repository.operationsQueue(context.organization.id)};});
  app.post("/api/merchant/support",async(request,reply)=>{const context=await contextFor(request,reply,"MERCHANT","merchant.dashboard.view");if(!context)return;protectMutation(request,context,"merchant-support");const parsed=z.object({subject:z.string().trim().min(3).max(180),body:z.string().trim().min(3).max(3000),category:z.enum(["booking","settlement","hotel_operation","tour_operation","profile"]),orderId:uuid.optional()}).safeParse(request.body);if(!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","درخواست پشتیبانی معتبر نیست");return reply.code(201).send({ticket:await repository.createMerchantSupport(context.organization.id,context.user.id,parsed.data as {subject:string;body:string;category:string;orderId?:string})});});

  app.patch("/api/merchant/profile", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.profile.manage"); if (!context) return;
    protectMutation(request, context, "merchant-profile");
    const parsed = z.object({ name: z.string().trim().min(2).max(120).optional(), contactEmail: z.string().email().nullable().optional(), contactMobile: z.string().regex(/^09\d{9}$/).nullable().optional(), supportPhone: z.string().max(30).nullable().optional() }).refine((value) => Object.keys(value).length > 0).safeParse(request.body);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات پروفایل معتبر نیست");
    return { profile: await repository.updateOwnMerchantProfile(context.organization.id, parsed.data, actorFrom(request, context)) };
  });

  app.put<{ Params: { membershipId: string } }>("/api/merchant/team/:membershipId/roles", async (request, reply) => {
    const context = await contextFor(request, reply, "MERCHANT", "merchant.team.manage"); if (!context) return;
    protectMutation(request, context, "merchant-team-role");
    const parsed = z.object({ roles: z.array(merchantRole).min(1).max(3) }).safeParse(request.body);
    if (!uuid.safeParse(request.params.membershipId).success || !parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "نقش‌ها معتبر نیستند");
    return { membership: await repository.setMembershipRoles(context.organization.id, request.params.membershipId, parsed.data.roles, actorFrom(request, context)) };
  });

  app.patch<{Params:{membershipId:string}}>("/api/merchant/team/:membershipId",async(request,reply)=>{const context=await contextFor(request,reply,"MERCHANT","merchant.team.manage");if(!context)return;protectMutation(request,context,"merchant-team-status");const parsed=z.object({status:z.enum(["ACTIVE","SUSPENDED"])}).safeParse(request.body);if(!uuid.safeParse(request.params.membershipId).success||!parsed.success)return errorResponse(reply,400,"VALIDATION_ERROR","وضعیت عضویت معتبر نیست");if(request.params.membershipId===context.membershipId)return errorResponse(reply,409,"SELF_MEMBERSHIP_CHANGE","وضعیت عضویت فعال خودتان را نمی‌توانید تغییر دهید");return{membership:await repository.updateMembershipStatus(context.organization.id,request.params.membershipId,parsed.data.status,actorFrom(request,context))};});
}
