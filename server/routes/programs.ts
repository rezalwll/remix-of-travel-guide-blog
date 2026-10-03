import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { DomainError } from "../domain/errors.js";
import { requirePermission, type PermissionCode } from "../platform/permissions.js";
import type { ProgramType, PublicationStatus } from "../programs/domain.js";
import type { PlatformAccessContext } from "../repositories/platform.js";
import { PlatformRepository } from "../repositories/platform.js";
import { ProgramRepository, type DepartureWriteInput, type PackageWriteInput, type ProgramWriteInput } from "../repositories/programs.js";

type Dependencies = {
  repository: ProgramRepository;
  platformRepository: PlatformRepository;
  env: { WEB_ORIGIN: string; BACKOFFICE_ENABLED: boolean; MERCHANT_PORTAL_ENABLED: boolean };
  currentUser: (request: FastifyRequest) => Promise<{ id: string } | undefined>;
  enforceRate: (key: string, limit: number, windowMs: number) => void;
  errorResponse: (reply: FastifyReply, status: number, code: string, message: string, details?: Record<string, unknown>) => FastifyReply;
};

const uuid = z.string().uuid();
const pageSchema = z.object({ page: z.coerce.number().int().min(1).max(10_000).default(1), perPage: z.coerce.number().int().min(1).max(100).default(20) });
const typeSchema = z.enum(["TOUR", "ZIYARAT"]);
const publicationSchema = z.enum(["DRAFT", "SUBMITTED", "NEEDS_CHANGES", "REJECTED", "PUBLISHED", "PAUSED", "ARCHIVED"]);
const departureStatusSchema = z.enum(["DRAFT", "OPEN", "LOW_CAPACITY", "FULL", "CLOSED", "DEPARTED", "CANCELLED"]);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);
const destinationSchema = z.object({ city: z.string().trim().min(1).max(100), country: z.string().trim().min(1).max(100), label: z.string().trim().min(1).max(160), sortOrder: z.number().int().min(0).max(1000).optional() });
const itinerarySchema = z.object({ dayNumber: z.number().int().min(1).max(180), title: z.string().trim().min(1).max(180), description: z.string().trim().min(1).max(4000), accommodation: z.string().max(500).optional(), meals: z.string().max(500).optional(), transportNote: z.string().max(1000).optional(), activityNote: z.string().max(1000).optional(), sortOrder: z.number().int().min(0).max(1000).optional() });
const contentSchema = z.object({ kind: z.enum(["INCLUDED_SERVICE", "EXCLUDED_SERVICE", "REQUIRED_DOCUMENT", "TRAVELER_NOTE", "PILGRIMAGE_NOTE", "ACCOMMODATION_SPLIT"]), title: z.string().trim().min(1).max(300), detail: z.string().max(2000).optional(), sortOrder: z.number().int().min(0).max(1000).optional() });
const mediaSchema = z.object({ url: z.string().trim().min(1).max(1000).refine((value) => value.startsWith("/") || value.startsWith("https://"), "نشانی تصویر معتبر نیست"), altText: z.string().trim().min(2).max(300), isCover: z.boolean().optional(), sortOrder: z.number().int().min(0).max(1000).optional() });
const programFields = {
  type: typeSchema.optional(), slug: slugSchema.optional(), title: z.string().trim().min(2).max(180).optional(), shortDescription: z.string().max(500).nullable().optional(), description: z.string().max(10_000).optional(), origin: z.string().max(120).optional(), durationDays: z.number().int().min(1).max(180).optional(), durationNights: z.number().int().min(0).max(180).optional(), sourceType: z.enum(["DIRECT", "DEMO"]).optional(), featured: z.boolean().optional(), futureSalePolicy: z.boolean().optional(), visaNote: z.string().max(3000).nullable().optional(), cancellationPolicy: z.string().max(5000).optional(), guideNote: z.string().max(3000).nullable().optional(), destinations: z.array(destinationSchema).max(30).optional(), itinerary: z.array(itinerarySchema).max(180).optional(), contentItems: z.array(contentSchema).max(200).optional(), media: z.array(mediaSchema).max(30).optional(),
} as const;
const createProgramSchema = z.object({ ...programFields, type: typeSchema, slug: slugSchema, title: z.string().trim().min(2).max(180) });
const updateProgramSchema = z.object(programFields).refine((value) => Object.keys(value).length > 0);
const departureObject = z.object({ startDate: z.coerce.date(), endDate: z.coerce.date(), transportType: z.string().trim().min(1).max(100), transportDetails: z.string().max(1000).nullable().optional(), totalCapacity: z.number().int().min(0).max(100_000), heldCapacity: z.number().int().min(0).max(100_000).optional(), saleStatus: departureStatusSchema.optional(), salesStartAt: z.coerce.date().nullable().optional(), salesEndAt: z.coerce.date().nullable().optional(), notes: z.string().max(3000).nullable().optional() });
const departureSchema = departureObject.refine((value) => value.endDate >= value.startDate, { message: "تاریخ پایان باید بعد از شروع باشد" }).refine((value) => (value.heldCapacity ?? 0) <= value.totalCapacity, { message: "ظرفیت نگهداشت بیشتر از کل ظرفیت است" });
const updateDepartureSchema = departureObject.partial().refine((value) => Object.keys(value).length > 0);
const packageObject = z.object({ departureId: uuid.nullable().optional(), name: z.string().trim().min(1).max(180), hotelName: z.string().max(200).nullable().optional(), hotelStars: z.number().int().min(1).max(5).nullable().optional(), roomType: z.string().max(160).nullable().optional(), mealPlan: z.string().max(300).nullable().optional(), transport: z.string().max(300).nullable().optional(), adultPrice: z.number().int().min(0).max(2_000_000_000), childPrice: z.number().int().min(0).max(2_000_000_000), infantPrice: z.number().int().min(0).max(2_000_000_000).optional(), singleSupplement: z.number().int().min(0).max(2_000_000_000).optional(), capacity: z.number().int().min(0).max(100_000).nullable().optional(), status: z.enum(["ACTIVE", "INACTIVE"]).optional(), metadata: z.record(z.unknown()).optional() });
const packageSchema = packageObject;
const updatePackageSchema = packageObject.partial().refine((value) => Object.keys(value).length > 0);

function pageOf(query: unknown) {
  const parsed = pageSchema.safeParse(query);
  if (!parsed.success) throw new DomainError("VALIDATION_ERROR", "صفحه‌بندی معتبر نیست", 400);
  return { page: parsed.data.page ?? 1, perPage: parsed.data.perPage ?? 20 };
}
function pagination(page: { page: number; perPage: number }, total: number) { return { ...page, total, totalPages: Math.ceil(total / page.perPage), hasMore: page.page * page.perPage < total }; }
function originAllowed(request: FastifyRequest, webOrigin: string) { const origin = request.headers.origin; return (!origin || origin === webOrigin) && request.headers["sec-fetch-site"] !== "cross-site"; }
function actor(request: FastifyRequest, context: PlatformAccessContext) { return { userId: context.user.id, organizationId: context.organization.id, requestId: request.id, ipAddress: request.ip, userAgent: request.headers["user-agent"] }; }

export async function registerProgramRoutes(app: FastifyInstance, dependencies: Dependencies) {
  const { repository, platformRepository, env, currentUser, enforceRate, errorResponse } = dependencies;

  app.addHook("onSend", async (request, reply, payload) => {
    if (request.url.startsWith("/api/catalog/programs")) reply.header("Cache-Control", "public, max-age=30, stale-while-revalidate=30");
    return payload;
  });

  async function contextFor(request: FastifyRequest, reply: FastifyReply, scope: "INTERNAL" | "MERCHANT", permission: PermissionCode) {
    const enabled = scope === "INTERNAL" ? env.BACKOFFICE_ENABLED : env.MERCHANT_PORTAL_ENABLED;
    if (!enabled) { errorResponse(reply, 404, "NOT_FOUND", "موردی پیدا نشد"); return undefined; }
    const user = await currentUser(request);
    if (!user) { errorResponse(reply, 401, "AUTH_REQUIRED", "برای ادامه وارد حساب شوید"); return undefined; }
    const requested = scope === "MERCHANT" && typeof request.headers["x-organization-id"] === "string" ? request.headers["x-organization-id"] : undefined;
    if (requested && !uuid.safeParse(requested).success) { errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه سازمان معتبر نیست"); return undefined; }
    const context = await platformRepository.accessContext(user.id, scope, requested);
    if (!context) { errorResponse(reply, 403, "ACCESS_DENIED", "دسترسی به این بخش فعال نیست"); return undefined; }
    requirePermission(context.permissions, permission);
    return context;
  }
  function protect(request: FastifyRequest, context: PlatformAccessContext, action: string) { if (!originAllowed(request, env.WEB_ORIGIN)) throw new DomainError("CSRF_REJECTED", "مبدأ درخواست معتبر نیست", 403); enforceRate(`program:${action}:${context.user.id}`, 40, 10 * 60_000); }
  function parseId(value: string, reply: FastifyReply) { if (!uuid.safeParse(value).success) { errorResponse(reply, 400, "VALIDATION_ERROR", "شناسه معتبر نیست"); return false; } return true; }
  function filters(query: unknown) { const parsed = z.object({ type: typeSchema.optional(), publicationStatus: publicationSchema.optional(), merchantId: uuid.optional(), destination: z.string().max(100).optional(), search: z.string().max(180).optional(), upcoming: z.coerce.boolean().optional(), lowCapacity: z.coerce.boolean().optional() }).safeParse(query); if (!parsed.success) throw new DomainError("VALIDATION_ERROR", "فیلتر برنامه معتبر نیست", 400); return parsed.data; }

  app.get("/api/catalog/programs", async (request, reply) => {
    const parsed = z.object({ type: typeSchema.optional() }).safeParse(request.query);
    if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "نوع برنامه معتبر نیست");
    return { programs: await repository.publicPrograms(parsed.data.type as ProgramType | undefined) };
  });
  app.get<{ Params: { slug: string } }>("/api/catalog/programs/:slug", async (request) => ({ program: await repository.publicProgram(request.params.slug) }));

  app.get("/api/backoffice/programs", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.read"); if (!context) return; const page = pageOf(request.query); const result = await repository.listPrograms(filters(request.query), page); return { programs: result.items, pagination: pagination(page, result.total) }; });
  app.get<{ Params: { id: string } }>("/api/backoffice/programs/:id", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.read"); if (!context || !parseId(request.params.id, reply)) return; return { program: await repository.getProgram(request.params.id) }; });
  app.post("/api/backoffice/programs", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.manage"); if (!context) return; protect(request, context, "admin-create"); const parsed = createProgramSchema.extend({ organizationId: uuid }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات برنامه معتبر نیست"); const { organizationId, ...input } = parsed.data; return reply.code(201).send({ program: await repository.createProgram(organizationId!, input as Required<Pick<ProgramWriteInput, "type" | "slug" | "title">> & ProgramWriteInput, actor(request, context)) }); });
  app.patch<{ Params: { id: string } }>("/api/backoffice/programs/:id", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.manage"); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "admin-update"); const parsed = updateProgramSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تغییرات برنامه معتبر نیست"); return { program: await repository.updateProgram(request.params.id, parsed.data as ProgramWriteInput, actor(request, context)) }; });
  app.post<{ Params: { id: string } }>("/api/backoffice/programs/:id/duplicate", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.manage"); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "admin-duplicate"); return reply.code(201).send({ program: await repository.duplicateProgram(request.params.id, actor(request, context)) }); });
  app.post<{ Params: { id: string } }>("/api/backoffice/programs/:id/moderation", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.approve"); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "moderation"); const parsed = z.object({ status: z.enum(["PUBLISHED", "NEEDS_CHANGES", "REJECTED", "PAUSED", "ARCHIVED"]), reason: z.string().trim().min(3).max(1000).optional() }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تصمیم بررسی معتبر نیست"); return { program: await repository.transitionProgram(request.params.id, parsed.data.status, parsed.data.reason, actor(request, context), "INTERNAL") }; });

  app.get("/api/merchant/programs", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.read"); if (!context) return; const page = pageOf(request.query); const result = await repository.listPrograms(filters(request.query), page, context.organization.id); return { programs: result.items, pagination: pagination(page, result.total) }; });
  app.get<{ Params: { id: string } }>("/api/merchant/programs/:id", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.read"); if (!context || !parseId(request.params.id, reply)) return; return { program: await repository.getProgram(request.params.id, context.organization.id) }; });
  app.post("/api/merchant/programs", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.manage"); if (!context) return; protect(request, context, "merchant-create"); const parsed = createProgramSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات برنامه معتبر نیست"); return reply.code(201).send({ program: await repository.createProgram(context.organization.id, parsed.data as Required<Pick<ProgramWriteInput, "type" | "slug" | "title">> & ProgramWriteInput, actor(request, context)) }); });
  app.patch<{ Params: { id: string } }>("/api/merchant/programs/:id", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.manage"); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "merchant-update"); const parsed = updateProgramSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تغییرات برنامه معتبر نیست"); return { program: await repository.updateProgram(request.params.id, parsed.data as ProgramWriteInput, actor(request, context), context.organization.id) }; });
  app.post<{ Params: { id: string } }>("/api/merchant/programs/:id/duplicate", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.manage"); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "merchant-duplicate"); return reply.code(201).send({ program: await repository.duplicateProgram(request.params.id, actor(request, context), context.organization.id) }); });
  app.post<{ Params: { id: string } }>("/api/merchant/programs/:id/workflow", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.manage"); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "merchant-workflow"); const parsed = z.object({ status: z.enum(["SUBMITTED", "PAUSED", "ARCHIVED"]), reason: z.string().max(1000).optional() }).safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "عملیات برنامه معتبر نیست"); return { program: await repository.transitionProgram(request.params.id, parsed.data.status, parsed.data.reason, actor(request, context), "MERCHANT", context.organization.id) }; });

  const departureRoutes = async (prefix: "/api/backoffice" | "/api/merchant", scope: "INTERNAL" | "MERCHANT") => {
    const permission = scope === "INTERNAL" ? "backoffice.programs.manage" : "merchant.departures.manage" as PermissionCode;
    app.post<{ Params: { id: string } }>(`${prefix}/programs/:id/departures`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "departure-create"); const parsed = departureSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات حرکت معتبر نیست"); return reply.code(201).send({ departure: await repository.createDeparture(request.params.id, parsed.data as DepartureWriteInput, actor(request, context), scope === "MERCHANT" ? context.organization.id : undefined) }); });
    app.patch<{ Params: { id: string; departureId: string } }>(`${prefix}/programs/:id/departures/:departureId`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply) || !parseId(request.params.departureId, reply)) return; protect(request, context, "departure-update"); const parsed = updateDepartureSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تغییرات حرکت معتبر نیست"); return { departure: await repository.updateDeparture(request.params.id, request.params.departureId, parsed.data as Partial<DepartureWriteInput>, actor(request, context), scope === "MERCHANT" ? context.organization.id : undefined) }; });
    app.post<{ Params: { id: string; departureId: string } }>(`${prefix}/programs/:id/departures/:departureId/duplicate`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply) || !parseId(request.params.departureId, reply)) return; protect(request, context, "departure-duplicate"); const parsed = z.object({ startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional(), copyPackages: z.boolean().default(true) }).safeParse(request.body ?? {}); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تنظیمات کپی حرکت معتبر نیست"); return reply.code(201).send({ departure: await repository.duplicateDeparture(request.params.id, request.params.departureId, parsed.data, actor(request, context), scope === "MERCHANT" ? context.organization.id : undefined) }); });
    app.post<{ Params: { id: string } }>(`${prefix}/programs/:id/packages`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply)) return; protect(request, context, "package-create"); const parsed = packageSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "اطلاعات پکیج معتبر نیست"); return reply.code(201).send({ package: await repository.createPackage(request.params.id, parsed.data as PackageWriteInput, actor(request, context), scope === "MERCHANT" ? context.organization.id : undefined) }); });
    app.patch<{ Params: { id: string; packageId: string } }>(`${prefix}/programs/:id/packages/:packageId`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply) || !parseId(request.params.packageId, reply)) return; protect(request, context, "package-update"); const parsed = updatePackageSchema.safeParse(request.body); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "تغییرات پکیج معتبر نیست"); return { package: await repository.updatePackage(request.params.id, request.params.packageId, parsed.data as Partial<PackageWriteInput>, actor(request, context), scope === "MERCHANT" ? context.organization.id : undefined) }; });
  };
  await departureRoutes("/api/backoffice", "INTERNAL");
  await departureRoutes("/api/merchant", "MERCHANT");

  app.get("/api/backoffice/registrations", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.registrations.read"); if (!context) return; const page = pageOf(request.query); const parsed = z.object({ programId: uuid.optional(), departureId: uuid.optional(), merchantId: uuid.optional() }).safeParse(request.query); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر ثبت‌نام معتبر نیست"); const result = await repository.listRegistrations(page, parsed.data.merchantId, parsed.data.programId, parsed.data.departureId); return { registrations: result.items, pagination: pagination(page, result.total) }; });
  app.get<{ Params: { id: string } }>("/api/backoffice/registrations/:id", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.registrations.read"); if (!context || !parseId(request.params.id, reply)) return; return { registration: await repository.getRegistration(request.params.id) }; });
  app.get("/api/merchant/registrations", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.registrations.read"); if (!context) return; const page = pageOf(request.query); const parsed = z.object({ programId: uuid.optional(), departureId: uuid.optional() }).safeParse(request.query); if (!parsed.success) return errorResponse(reply, 400, "VALIDATION_ERROR", "فیلتر ثبت‌نام معتبر نیست"); const result = await repository.listRegistrations(page, context.organization.id, parsed.data.programId, parsed.data.departureId); return { registrations: result.items, pagination: pagination(page, result.total) }; });
  app.get<{ Params: { id: string } }>("/api/merchant/registrations/:id", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.registrations.read"); if (!context || !parseId(request.params.id, reply)) return; return { registration: await repository.getRegistration(request.params.id, context.organization.id) }; });

  const participantRoutes = async (prefix: "/api/backoffice" | "/api/merchant", scope: "INTERNAL" | "MERCHANT") => {
    const permission = (scope === "INTERNAL" ? "backoffice.participants.read" : "merchant.participants.read") as PermissionCode;
    app.get<{ Params: { id: string; departureId: string } }>(`${prefix}/programs/:id/departures/:departureId/participants`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply) || !parseId(request.params.departureId, reply)) return; return repository.participantList(request.params.id, request.params.departureId, scope === "MERCHANT" ? context.organization.id : undefined); });
    app.get<{ Params: { id: string; departureId: string } }>(`${prefix}/programs/:id/departures/:departureId/participants.csv`, async (request, reply) => { const context = await contextFor(request, reply, scope, permission); if (!context || !parseId(request.params.id, reply) || !parseId(request.params.departureId, reply)) return; const csv = await repository.participantCsv(request.params.id, request.params.departureId, scope === "MERCHANT" ? context.organization.id : undefined); return reply.type("text/csv; charset=utf-8").header("Content-Disposition", `attachment; filename="participants-${request.params.departureId}.csv"`).send(csv); });
  };
  await participantRoutes("/api/backoffice", "INTERNAL");
  await participantRoutes("/api/merchant", "MERCHANT");

  app.get("/api/backoffice/program-actions", async (request, reply) => { const context = await contextFor(request, reply, "INTERNAL", "backoffice.programs.read"); if (!context) return; return { queue: await repository.actionQueue("INTERNAL") }; });
  app.get("/api/merchant/program-actions", async (request, reply) => { const context = await contextFor(request, reply, "MERCHANT", "merchant.programs.read"); if (!context) return; return { queue: await repository.actionQueue("MERCHANT", context.organization.id) }; });

}
