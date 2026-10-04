import { Prisma, PrismaClient } from "@prisma/client";
import { DomainError, notFound } from "../domain/errors.js";
import { sanitizeProviderPayload } from "../providers/redaction.js";
import {
  assertProgramTransition,
  assertPublishable,
  capacitySnapshot,
  createParticipantCsv,
  effectiveDepartureStatus,
  maskParticipantMobile,
  type DepartureSaleStatus,
  type ProgramType,
  type PublicationStatus,
} from "../programs/domain.js";
import type { AuditActor, PageInput } from "./platform.js";

const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
const activeBookingStatuses = new Set(["confirmed", "paid_booking_pending", "manual_review_required", "compensation_pending"]);
const cancelledBookingStatuses = new Set(["refunded", "reservation_failed", "cancelled"]);

export type ProgramFilters = {
  type?: ProgramType;
  publicationStatus?: PublicationStatus;
  merchantId?: string;
  destination?: string;
  search?: string;
  upcoming?: boolean;
  lowCapacity?: boolean;
};

export type DestinationInput = { city: string; country: string; label: string; sortOrder?: number };
export type ItineraryInput = { dayNumber: number; title: string; description: string; accommodation?: string; meals?: string; transportNote?: string; activityNote?: string; sortOrder?: number };
export type ContentInput = { kind: "INCLUDED_SERVICE" | "EXCLUDED_SERVICE" | "REQUIRED_DOCUMENT" | "TRAVELER_NOTE" | "PILGRIMAGE_NOTE" | "ACCOMMODATION_SPLIT"; title: string; detail?: string; sortOrder?: number };
export type MediaInput = { url: string; altText: string; isCover?: boolean; sortOrder?: number };
export type ProgramWriteInput = {
  type?: ProgramType;
  slug?: string;
  title?: string;
  shortDescription?: string | null;
  description?: string;
  origin?: string;
  durationDays?: number;
  durationNights?: number;
  sourceType?: "DIRECT" | "DEMO";
  featured?: boolean;
  futureSalePolicy?: boolean;
  visaNote?: string | null;
  cancellationPolicy?: string;
  guideNote?: string | null;
  destinations?: DestinationInput[];
  itinerary?: ItineraryInput[];
  contentItems?: ContentInput[];
  media?: MediaInput[];
};
export type DepartureWriteInput = { startDate: Date; endDate: Date; transportType: string; transportDetails?: string | null; totalCapacity: number; heldCapacity?: number; saleStatus?: DepartureSaleStatus; salesStartAt?: Date | null; salesEndAt?: Date | null; notes?: string | null };
export type PackageWriteInput = { departureId?: string | null; name: string; hotelName?: string | null; hotelStars?: number | null; roomType?: string | null; mealPlan?: string | null; transport?: string | null; adultPrice: number; childPrice: number; infantPrice?: number; singleSupplement?: number; capacity?: number | null; status?: "ACTIVE" | "INACTIVE"; metadata?: Record<string, unknown> };

function travelerCount(value: unknown) {
  return Array.isArray(value) ? Math.max(1, value.length) : 1;
}

function buyerRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function orderCapacity(orders: Array<{ travelers: unknown; paymentStatus: string; bookingStatus: string }>) {
  let bookedTravelers = 0;
  let confirmedTravelers = 0;
  let cancelledTravelers = 0;
  for (const order of orders) {
    const count = travelerCount(order.travelers);
    if (order.paymentStatus === "paid" && activeBookingStatuses.has(order.bookingStatus)) {
      bookedTravelers += count;
      if (order.bookingStatus === "confirmed") confirmedTravelers += count;
    } else if (cancelledBookingStatuses.has(order.bookingStatus) || order.paymentStatus === "refunded") cancelledTravelers += count;
  }
  return { bookedTravelers, confirmedTravelers, cancelledTravelers };
}

const programInclude = {
  organization: { select: { id: true, name: true, slug: true } },
  destinations: { orderBy: { sortOrder: "asc" as const } },
  departures: {
    orderBy: { startDate: "asc" as const },
    include: {
      packages: { orderBy: { createdAt: "asc" as const } },
      orders: { select: { id: true, travelers: true, paymentStatus: true, bookingStatus: true, total: true } },
    },
  },
  packages: { where: { departureId: null }, orderBy: { createdAt: "asc" as const } },
  itinerary: { orderBy: [{ sortOrder: "asc" as const }, { dayNumber: "asc" as const }] },
  contentItems: { orderBy: [{ kind: "asc" as const }, { sortOrder: "asc" as const }] },
  media: { orderBy: [{ isCover: "desc" as const }, { sortOrder: "asc" as const }] },
  moderationEvents: { orderBy: { createdAt: "desc" as const }, take: 20 },
} satisfies Prisma.TravelProgramInclude;

type LoadedProgram = Prisma.TravelProgramGetPayload<{ include: typeof programInclude }>;

function presentProgram(program: LoadedProgram) {
  const departures = program.departures.map((departure) => {
    const counts = orderCapacity(departure.orders);
    const capacity = capacitySnapshot({ totalCapacity: departure.totalCapacity, heldCapacity: departure.heldCapacity, ...counts });
    return { ...departure, orders: undefined, capacity, effectiveSaleStatus: effectiveDepartureStatus(departure.saleStatus as DepartureSaleStatus, capacity.remaining, capacity.totalCapacity) };
  });
  const registrationCount = new Set(program.departures.flatMap((departure) => departure.orders.map((order) => order.id))).size;
  const remainingCapacity = departures.reduce((sum, departure) => sum + departure.capacity.remaining, 0);
  const startingPrice = [...program.packages, ...program.departures.flatMap((departure) => departure.packages)].filter((pack) => pack.status === "ACTIVE").reduce<number | null>((minimum, pack) => minimum === null ? pack.adultPrice : Math.min(minimum, pack.adultPrice), null);
  return { ...program, departures, registrationCount, remainingCapacity, startingPrice };
}

export class ProgramRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private audit(tx: Prisma.TransactionClient, actor: AuditActor, input: { action: string; resourceType: string; resourceId?: string; targetOrganizationId?: string; beforeData?: unknown; afterData?: unknown }) {
    return tx.auditLog.create({ data: { actorUserId: actor.userId, actorOrganizationId: actor.organizationId, targetOrganizationId: input.targetOrganizationId, action: input.action, resourceType: input.resourceType, resourceId: input.resourceId, beforeData: input.beforeData === undefined ? undefined : asJson(sanitizeProviderPayload(input.beforeData)), afterData: input.afterData === undefined ? undefined : asJson(sanitizeProviderPayload(input.afterData)), requestId: actor.requestId, ipAddress: actor.ipAddress, userAgent: actor.userAgent?.slice(0, 500) } });
  }

  async listPrograms(filters: ProgramFilters, page: PageInput, organizationId?: string) {
    const where: Prisma.TravelProgramWhereInput = {
      organizationId: organizationId ?? filters.merchantId,
      type: filters.type,
      publicationStatus: filters.publicationStatus,
      ...(filters.destination ? { destinations: { some: { OR: [{ city: { contains: filters.destination, mode: "insensitive" } }, { label: { contains: filters.destination, mode: "insensitive" } }] } } } : {}),
      ...(filters.search ? { OR: [{ title: { contains: filters.search, mode: "insensitive" } }, { slug: { contains: filters.search, mode: "insensitive" } }] } : {}),
      ...(filters.upcoming ? { departures: { some: { startDate: { gte: new Date() }, saleStatus: { notIn: ["CANCELLED", "DEPARTED"] } } } } : {}),
    };
    const raw = await this.prisma.travelProgram.findMany({ where, include: programInclude, orderBy: { updatedAt: "desc" }, take: filters.lowCapacity ? 500 : page.perPage, skip: filters.lowCapacity ? 0 : (page.page - 1) * page.perPage });
    let items = raw.map(presentProgram);
    if (filters.lowCapacity) items = items.filter((item) => item.departures.some((departure) => departure.effectiveSaleStatus === "LOW_CAPACITY")).slice((page.page - 1) * page.perPage, page.page * page.perPage);
    const total = filters.lowCapacity ? items.length : await this.prisma.travelProgram.count({ where });
    return { items, total };
  }

  async getProgram(id: string, organizationId?: string) {
    const program = await this.prisma.travelProgram.findFirst({ where: { id, organizationId }, include: programInclude });
    if (!program) throw notFound("برنامه پیدا نشد");
    return presentProgram(program);
  }

  async createProgram(organizationId: string, input: Required<Pick<ProgramWriteInput, "type" | "slug" | "title">> & ProgramWriteInput, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.organization.findFirst({ where: { id: organizationId, type: "MERCHANT", status: "ACTIVE", merchantProfile: { businessType: "TOUR_OPERATOR" } }, select: { id: true } });
      if (!merchant) throw new DomainError("PROGRAM_MERCHANT_REQUIRED", "مجری تور فعال برای این برنامه پیدا نشد", 409);
      const program = await tx.travelProgram.create({ data: { organizationId, type: input.type, slug: input.slug, title: input.title, shortDescription: input.shortDescription, description: input.description ?? "", origin: input.origin ?? "", durationDays: input.durationDays ?? 1, durationNights: input.durationNights ?? 0, sourceType: input.sourceType ?? "DIRECT", featured: input.featured ?? false, futureSalePolicy: input.futureSalePolicy ?? false, visaNote: input.visaNote, cancellationPolicy: input.cancellationPolicy ?? "", guideNote: input.guideNote, destinations: input.destinations?.length ? { create: input.destinations } : undefined, itinerary: input.itinerary?.length ? { create: input.itinerary } : undefined, contentItems: input.contentItems?.length ? { create: input.contentItems } : undefined, media: input.media?.length ? { create: input.media } : undefined }, include: programInclude });
      await this.audit(tx, actor, { action: "program.created", resourceType: "TravelProgram", resourceId: program.id, targetOrganizationId: organizationId, afterData: { type: program.type, slug: program.slug, title: program.title } });
      return presentProgram(program);
    });
  }

  async updateProgram(id: string, input: ProgramWriteInput, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.travelProgram.findFirst({ where: { id, organizationId }, include: programInclude });
      if (!current) throw notFound("برنامه پیدا نشد");
      if (current.publicationStatus === "ARCHIVED") throw new DomainError("PROGRAM_ARCHIVED", "برنامه بایگانی‌شده قابل ویرایش نیست", 409);
      if (input.media && input.media.filter((item) => item.isCover).length > 1) throw new DomainError("VALIDATION_ERROR", "فقط یک تصویر کاور مجاز است", 400);
      if (input.destinations) { await tx.travelProgramDestination.deleteMany({ where: { programId: id } }); if (input.destinations.length) await tx.travelProgramDestination.createMany({ data: input.destinations.map((item) => ({ ...item, programId: id })) }); }
      if (input.itinerary) { await tx.travelProgramItineraryDay.deleteMany({ where: { programId: id } }); if (input.itinerary.length) await tx.travelProgramItineraryDay.createMany({ data: input.itinerary.map((item) => ({ ...item, programId: id })) }); }
      if (input.contentItems) { await tx.travelProgramContentItem.deleteMany({ where: { programId: id } }); if (input.contentItems.length) await tx.travelProgramContentItem.createMany({ data: input.contentItems.map((item) => ({ ...item, programId: id })) }); }
      if (input.media) { await tx.travelProgramMedia.deleteMany({ where: { programId: id } }); if (input.media.length) await tx.travelProgramMedia.createMany({ data: input.media.map((item) => ({ ...item, programId: id })) }); }
      const updated = await tx.travelProgram.update({ where: { id }, data: { type: input.type, slug: input.slug, title: input.title, shortDescription: input.shortDescription, description: input.description, origin: input.origin, durationDays: input.durationDays, durationNights: input.durationNights, sourceType: input.sourceType, featured: input.featured, futureSalePolicy: input.futureSalePolicy, visaNote: input.visaNote, cancellationPolicy: input.cancellationPolicy, guideNote: input.guideNote }, include: programInclude });
      await this.audit(tx, actor, { action: "program.updated", resourceType: "TravelProgram", resourceId: id, targetOrganizationId: current.organizationId, beforeData: { title: current.title, publicationStatus: current.publicationStatus }, afterData: { title: updated.title, publicationStatus: updated.publicationStatus } });
      return presentProgram(updated);
    });
  }

  async duplicateProgram(id: string, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.travelProgram.findFirst({ where: { id, organizationId }, include: programInclude });
      if (!current) throw notFound("برنامه پیدا نشد");
      const suffix = Date.now().toString(36);
      const duplicate = await tx.travelProgram.create({ data: { organizationId: current.organizationId, type: current.type, slug: `${current.slug}-copy-${suffix}`, title: `${current.title} (کپی)`, shortDescription: current.shortDescription, description: current.description, origin: current.origin, durationDays: current.durationDays, durationNights: current.durationNights, sourceType: current.sourceType, status: "ACTIVE", publicationStatus: "DRAFT", featured: false, futureSalePolicy: current.futureSalePolicy, visaNote: current.visaNote, cancellationPolicy: current.cancellationPolicy, guideNote: current.guideNote, destinations: { create: current.destinations.map(({ city, country, label, sortOrder }) => ({ city, country, label, sortOrder })) }, itinerary: { create: current.itinerary.map(({ dayNumber, title, description, accommodation, meals, transportNote, activityNote, sortOrder }) => ({ dayNumber, title, description, accommodation, meals, transportNote, activityNote, sortOrder })) }, contentItems: { create: current.contentItems.map(({ kind, title, detail, sortOrder }) => ({ kind, title, detail, sortOrder })) }, media: { create: current.media.map(({ url, altText, isCover, sortOrder }) => ({ url, altText, isCover, sortOrder })) }, packages: { create: current.packages.filter((pack) => !pack.departureId).map(({ name, hotelName, hotelStars, roomType, mealPlan, transport, adultPrice, childPrice, infantPrice, singleSupplement, capacity, status, metadata }) => ({ name, hotelName, hotelStars, roomType, mealPlan, transport, adultPrice, childPrice, infantPrice, singleSupplement, capacity, status, metadata: metadata === null ? undefined : asJson(metadata) })) } }, include: programInclude });
      await this.audit(tx, actor, { action: "program.duplicated", resourceType: "TravelProgram", resourceId: duplicate.id, targetOrganizationId: current.organizationId, afterData: { sourceProgramId: current.id, copiedDepartures: false, copiedRegistrations: false } });
      return presentProgram(duplicate);
    });
  }

  async transitionProgram(id: string, toStatus: PublicationStatus, reason: string | undefined, actor: AuditActor, scope: "MERCHANT" | "INTERNAL", organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.travelProgram.findFirst({ where: { id, organizationId }, include: programInclude });
      if (!current) throw notFound("برنامه پیدا نشد");
      assertProgramTransition(current.publicationStatus as PublicationStatus, toStatus, scope);
      if (["SUBMITTED", "PUBLISHED"].includes(toStatus)) assertPublishable(current);
      if (["NEEDS_CHANGES", "REJECTED"].includes(toStatus) && !reason?.trim()) throw new DomainError("REASON_REQUIRED", "دلیل این تصمیم الزامی است", 400);
      const now = new Date();
      const program = await tx.travelProgram.update({ where: { id }, data: { publicationStatus: toStatus, status: toStatus === "ARCHIVED" ? "ARCHIVED" : toStatus === "PAUSED" ? "PAUSED" : "ACTIVE", submittedAt: toStatus === "SUBMITTED" ? now : undefined, publishedAt: toStatus === "PUBLISHED" ? now : undefined, archivedAt: toStatus === "ARCHIVED" ? now : undefined }, include: programInclude });
      await tx.travelProgramModerationEvent.create({ data: { programId: id, actorUserId: actor.userId, actorOrganizationId: actor.organizationId, action: `PROGRAM_${toStatus}`, fromStatus: current.publicationStatus, toStatus, reason } });
      await this.audit(tx, actor, { action: `program.${toStatus.toLowerCase()}`, resourceType: "TravelProgram", resourceId: id, targetOrganizationId: current.organizationId, beforeData: { publicationStatus: current.publicationStatus }, afterData: { publicationStatus: toStatus, reason } });
      return presentProgram(program);
    });
  }

  async createDeparture(programId: string, input: DepartureWriteInput, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const program = await tx.travelProgram.findFirst({ where: { id: programId, organizationId }, select: { id: true, organizationId: true, publicationStatus: true } });
      if (!program) throw notFound("برنامه پیدا نشد");
      const departure = await tx.travelProgramDeparture.create({ data: { programId, ...input, heldCapacity: input.heldCapacity ?? 0, saleStatus: input.saleStatus ?? "DRAFT" } });
      await this.audit(tx, actor, { action: "departure.created", resourceType: "TravelProgramDeparture", resourceId: departure.id, targetOrganizationId: program.organizationId, afterData: { programId, startDate: departure.startDate, totalCapacity: departure.totalCapacity, saleStatus: departure.saleStatus } });
      return departure;
    });
  }

  async updateDeparture(programId: string, departureId: string, input: Partial<DepartureWriteInput>, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.travelProgramDeparture.findFirst({ where: { id: departureId, programId, program: { organizationId } }, include: { program: { select: { organizationId: true } }, orders: { select: { travelers: true, paymentStatus: true, bookingStatus: true } } } });
      if (!current) throw notFound("تاریخ حرکت پیدا نشد");
      const counts = orderCapacity(current.orders);
      const capacity = capacitySnapshot({ totalCapacity: input.totalCapacity ?? current.totalCapacity, heldCapacity: input.heldCapacity ?? current.heldCapacity, ...counts });
      if (capacity.remaining < 0 || capacity.totalCapacity < capacity.booked + capacity.heldCapacity) throw new DomainError("CAPACITY_CONFLICT", "ظرفیت جدید کمتر از رزرو و نگهداشت فعلی است", 409);
      if (current.saleStatus === "CANCELLED" && input.saleStatus && input.saleStatus !== "CANCELLED") throw new DomainError("INVALID_STATE_TRANSITION", "حرکت لغوشده قابل بازگشایی نیست", 409);
      const departure = await tx.travelProgramDeparture.update({ where: { id: departureId }, data: input });
      await this.audit(tx, actor, { action: input.saleStatus === "CANCELLED" ? "departure.cancelled" : "departure.updated", resourceType: "TravelProgramDeparture", resourceId: departureId, targetOrganizationId: current.program.organizationId, beforeData: { totalCapacity: current.totalCapacity, heldCapacity: current.heldCapacity, saleStatus: current.saleStatus }, afterData: { totalCapacity: departure.totalCapacity, heldCapacity: departure.heldCapacity, saleStatus: departure.saleStatus } });
      return { ...departure, capacity };
    });
  }

  async duplicateDeparture(programId: string, departureId: string, input: { startDate?: Date; endDate?: Date; copyPackages?: boolean }, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.travelProgramDeparture.findFirst({ where: { id: departureId, programId, program: { organizationId } }, include: { program: { select: { organizationId: true } }, packages: true } });
      if (!current) throw notFound("تاریخ حرکت پیدا نشد");
      const duration = current.endDate.getTime() - current.startDate.getTime();
      const startDate = input.startDate ?? new Date(current.startDate.getTime() + 7 * 86_400_000);
      const endDate = input.endDate ?? new Date(startDate.getTime() + duration);
      const duplicate = await tx.travelProgramDeparture.create({ data: { programId, startDate, endDate, transportType: current.transportType, transportDetails: current.transportDetails, totalCapacity: current.totalCapacity, heldCapacity: 0, saleStatus: "DRAFT", salesStartAt: current.salesStartAt, salesEndAt: current.salesEndAt, notes: current.notes, packages: input.copyPackages === false ? undefined : { create: current.packages.map(({ name, hotelName, hotelStars, roomType, mealPlan, transport, adultPrice, childPrice, infantPrice, singleSupplement, capacity, status, metadata }) => ({ program: { connect: { id: programId } }, name, hotelName, hotelStars, roomType, mealPlan, transport, adultPrice, childPrice, infantPrice, singleSupplement, capacity, status, metadata: metadata === null ? undefined : asJson(metadata) })) } }, include: { packages: true } });
      await this.audit(tx, actor, { action: "departure.duplicated", resourceType: "TravelProgramDeparture", resourceId: duplicate.id, targetOrganizationId: current.program.organizationId, afterData: { sourceDepartureId: current.id, copiedPackages: input.copyPackages !== false, copiedRegistrations: false } });
      return duplicate;
    });
  }

  async createPackage(programId: string, input: PackageWriteInput, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const program = await tx.travelProgram.findFirst({ where: { id: programId, organizationId }, select: { id: true, organizationId: true } });
      if (!program) throw notFound("برنامه پیدا نشد");
      if (input.departureId && !await tx.travelProgramDeparture.findFirst({ where: { id: input.departureId, programId }, select: { id: true } })) throw new DomainError("VALIDATION_ERROR", "تاریخ حرکت متعلق به این برنامه نیست", 400);
      const pack = await tx.travelProgramPackage.create({ data: { programId, ...input, metadata: input.metadata ? asJson(input.metadata) : undefined } });
      await this.audit(tx, actor, { action: "package.created", resourceType: "TravelProgramPackage", resourceId: pack.id, targetOrganizationId: program.organizationId, afterData: { programId, departureId: pack.departureId, adultPrice: pack.adultPrice } });
      return pack;
    });
  }

  async updatePackage(programId: string, packageId: string, input: Partial<PackageWriteInput>, actor: AuditActor, organizationId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.travelProgramPackage.findFirst({ where: { id: packageId, programId, program: { organizationId } }, include: { program: { select: { organizationId: true } } } });
      if (!current) throw notFound("پکیج پیدا نشد");
      if (input.departureId && !await tx.travelProgramDeparture.findFirst({ where: { id: input.departureId, programId }, select: { id: true } })) throw new DomainError("VALIDATION_ERROR", "تاریخ حرکت متعلق به این برنامه نیست", 400);
      const pack = await tx.travelProgramPackage.update({ where: { id: packageId }, data: { ...input, metadata: input.metadata ? asJson(input.metadata) : undefined } });
      await this.audit(tx, actor, { action: "package.updated", resourceType: "TravelProgramPackage", resourceId: pack.id, targetOrganizationId: current.program.organizationId, beforeData: { adultPrice: current.adultPrice, status: current.status }, afterData: { adultPrice: pack.adultPrice, status: pack.status } });
      return pack;
    });
  }

  async listRegistrations(page: PageInput, organizationId?: string, programId?: string, departureId?: string) {
    const where: Prisma.OrderWhereInput = { serviceType: { in: ["tour", "ziyarat"] }, travelProgramId: programId, travelProgramDepartureId: departureId, ...(organizationId ? { travelProgram: { organizationId } } : {}) };
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({ where, include: { travelProgram: { select: { id: true, title: true, type: true } }, travelProgramDeparture: { select: { id: true, startDate: true, endDate: true } }, travelProgramPackage: { select: { id: true, name: true, hotelName: true, roomType: true } } }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.order.count({ where }),
    ]);
    return { items: orders.map((order) => { const buyer = buyerRecord(order.buyer); return { id: order.id, orderNumber: order.orderNumber, trackingCode: order.trackingCode, program: order.travelProgram, departure: order.travelProgramDeparture, package: order.travelProgramPackage, buyer: { name: `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim(), mobile: maskParticipantMobile(buyer.mobile ?? order.guestMobile) }, travelerCount: travelerCount(order.travelers), paymentStatus: order.paymentStatus, bookingStatus: order.bookingStatus, total: order.total, currency: order.currency, createdAt: order.createdAt }; }), total };
  }

  async getRegistration(id: string, organizationId?: string) {
    const order = await this.prisma.order.findFirst({ where: { id, serviceType: { in: ["tour", "ziyarat"] }, ...(organizationId ? { travelProgram: { organizationId } } : {}) }, include: { travelProgram: true, travelProgramDeparture: true, travelProgramPackage: true, payments: { orderBy: { createdAt: "desc" } }, bookingAttempts: { orderBy: { createdAt: "desc" } }, registrationNotes: { include: { actorUser: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } } } });
    if (!order) throw notFound("ثبت‌نام پیدا نشد");
    const buyer = buyerRecord(order.buyer);
    const travelers = Array.isArray(order.travelers) ? order.travelers : [];
    return { ...order, buyer: { name: `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim(), mobile: maskParticipantMobile(buyer.mobile ?? order.guestMobile), email: typeof buyer.email === "string" ? buyer.email.replace(/^(.{2}).*(@.*)$/, "$1***$2") : "" }, travelers: travelers.map((traveler) => { const record = buyerRecord(traveler); return { ...record, mobile: maskParticipantMobile(record.mobile), nationalId: record.nationalId ? "***" : undefined, passportNumber: record.passportNumber ? "***" : undefined }; }) };
  }

  async participantList(programId: string, departureId: string, organizationId?: string) {
    const departure = await this.prisma.travelProgramDeparture.findFirst({ where: { id: departureId, programId, program: { organizationId } }, include: { program: { select: { id: true, title: true, organizationId: true } }, orders: { include: { travelProgramPackage: { select: { name: true, roomType: true } } }, orderBy: { createdAt: "asc" } } } });
    if (!departure) throw notFound("تاریخ حرکت پیدا نشد");
    const counts = orderCapacity(departure.orders);
    const summary = capacitySnapshot({ totalCapacity: departure.totalCapacity, heldCapacity: departure.heldCapacity, ...counts });
    const rows = departure.orders.flatMap((order) => {
      const buyer = buyerRecord(order.buyer);
      const travelers = Array.isArray(order.travelers) && order.travelers.length ? order.travelers : [{ firstName: buyer.firstName, lastName: buyer.lastName, ageCategory: "adult" }];
      return travelers.map((value, index) => { const traveler = buyerRecord(value); return { orderNumber: order.orderNumber, leadTraveler: `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim(), traveler: `${traveler.firstName ?? traveler.firstNameFa ?? ""} ${traveler.lastName ?? traveler.lastNameFa ?? ""}`.trim(), ageCategory: traveler.ageCategory ?? traveler.type ?? "adult", mobile: maskParticipantMobile(index === 0 ? buyer.mobile ?? order.guestMobile : traveler.mobile), package: order.travelProgramPackage?.name ?? "-", roomType: order.travelProgramPackage?.roomType ?? "-", paymentStatus: order.paymentStatus, bookingStatus: order.bookingStatus }; });
    });
    return { program: departure.program, departure: { id: departure.id, startDate: departure.startDate, endDate: departure.endDate, saleStatus: departure.saleStatus }, summary, rows };
  }

  async participantCsv(programId: string, departureId: string, organizationId?: string) {
    const result = await this.participantList(programId, departureId, organizationId);
    return createParticipantCsv(result.rows, [{ key: "orderNumber", label: "سفارش" }, { key: "leadTraveler", label: "سرپرست" }, { key: "traveler", label: "مسافر" }, { key: "ageCategory", label: "رده سنی" }, { key: "mobile", label: "موبایل" }, { key: "package", label: "پکیج" }, { key: "roomType", label: "نوع اتاق" }, { key: "paymentStatus", label: "پرداخت" }, { key: "bookingStatus", label: "رزرو" }]);
  }

  async publicPrograms(type?: ProgramType) {
    const programs = await this.prisma.travelProgram.findMany({ where: { type, status: "ACTIVE", publicationStatus: "PUBLISHED" }, include: programInclude, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }] });
    return programs.map(presentProgram).filter((program) => program.departures.some((departure) => ["OPEN", "LOW_CAPACITY"].includes(departure.effectiveSaleStatus) && departure.capacity.remaining > 0));
  }

  async publicProgram(slug: string) {
    const program = await this.prisma.travelProgram.findFirst({ where: { slug, status: "ACTIVE", publicationStatus: "PUBLISHED" }, include: programInclude });
    if (!program) throw notFound("برنامه پیدا نشد");
    const presented = presentProgram(program);
    if (!presented.departures.some((departure) => ["OPEN", "LOW_CAPACITY"].includes(departure.effectiveSaleStatus) && departure.capacity.remaining > 0)) throw notFound("برنامه برای فروش در دسترس نیست");
    return presented;
  }

  async actionQueue(scope: "INTERNAL" | "MERCHANT", organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    const [submitted, needsChanges, programs] = await Promise.all([
      this.prisma.travelProgram.findMany({ where: { ...where, publicationStatus: "SUBMITTED" }, select: { id: true, title: true, type: true, updatedAt: true }, orderBy: { updatedAt: "asc" }, take: 20 }),
      this.prisma.travelProgram.findMany({ where: { ...where, publicationStatus: "NEEDS_CHANGES" }, select: { id: true, title: true, type: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 20 }),
      this.prisma.travelProgram.findMany({ where, include: { departures: { include: { orders: { select: { travelers: true, paymentStatus: true, bookingStatus: true } } } } }, take: 100 }),
    ]);
    const lowCapacity = programs.flatMap((program) => program.departures.map((departure) => { const capacity = capacitySnapshot({ totalCapacity: departure.totalCapacity, heldCapacity: departure.heldCapacity, ...orderCapacity(departure.orders) }); return { programId: program.id, programTitle: program.title, departureId: departure.id, startDate: departure.startDate, remaining: capacity.remaining, status: effectiveDepartureStatus(departure.saleStatus as DepartureSaleStatus, capacity.remaining, capacity.totalCapacity) }; })).filter((item) => item.status === "LOW_CAPACITY");
    const problemBookings = scope === "INTERNAL" ? await this.prisma.order.findMany({ where: { serviceType: { in: ["tour", "ziyarat"] }, bookingStatus: "manual_review_required" }, select: { id: true, orderNumber: true, travelProgramId: true, createdAt: true }, orderBy: { createdAt: "asc" }, take: 20 }) : await this.prisma.order.findMany({ where: { serviceType: { in: ["tour", "ziyarat"] }, bookingStatus: "manual_review_required", travelProgram: { organizationId } }, select: { id: true, orderNumber: true, travelProgramId: true, createdAt: true }, orderBy: { createdAt: "asc" }, take: 20 });
    return { submitted: scope === "INTERNAL" ? submitted : [], needsChanges: scope === "MERCHANT" ? needsChanges : [], lowCapacity, problemBookings };
  }
}
