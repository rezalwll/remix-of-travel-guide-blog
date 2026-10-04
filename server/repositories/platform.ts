import { Prisma, PrismaClient } from "@prisma/client";
import { DomainError, notFound } from "../domain/errors.js";
import { canTransitionSettlement, type SettlementStatus } from "../platform/finance.js";
import { maskEmail, maskIdentifier, maskMobile, toMerchantOrderDto } from "../platform/privacy.js";
import { reportingTimezone } from "../platform/reporting.js";
import { sanitizeProviderPayload } from "../providers/redaction.js";
import { assertVisaTransition, emptyVisaChecklist, normalizeVisaStatus, type VisaDocumentKey, type VisaDocumentState, type VisaStatus } from "../visa/domain.js";

const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
const numeric = (value: bigint | number | null | undefined) => Number(value ?? 0);

export type PlatformScope = "INTERNAL" | "MERCHANT";

export type PlatformAccessContext = {
  membershipId: string;
  user: { id: string; mobile: string; firstName: string; lastName: string; email: string | null };
  organization: { id: string; type: string; name: string; slug: string; status: string; businessType?: string | null };
  roles: string[];
  permissions: string[];
};

export type PageInput = { page: number; perPage: number };
export type RangeInput = { from: Date; to: Date };
export type OrderFilters = RangeInput & {
  serviceType?: string;
  paymentStatus?: string;
  bookingStatus?: string;
  merchantOrganizationId?: string;
  provider?: string;
  orderNumber?: string;
  trackingCode?: string;
  query?: string;
};

export type ServiceOperationFilters = RangeInput & {
  provider?: string;
  route?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  manualReview?: boolean;
};

export type AuditActor = {
  userId: string;
  organizationId: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
};

type AuditInput = AuditActor & {
  action: string;
  resourceType: string;
  resourceId?: string;
  targetOrganizationId?: string;
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: unknown;
};

const orderSelect = {
  id: true,
  orderNumber: true,
  trackingCode: true,
  guestMobile: true,
  serviceType: true,
  summary: true,
  buyer: true,
  travelers: true,
  total: true,
  currency: true,
  paymentStatus: true,
  bookingStatus: true,
  providerName: true,
  externalReference: true,
  relevantDate: true,
  merchantOrganizationId: true,
  supplierOrganizationId: true,
  createdAt: true,
  updatedAt: true,
  merchantOrganization: { select: { id: true, name: true } },
  supplierOrganization: { select: { id: true, name: true } },
} satisfies Prisma.OrderSelect;

const objectValue = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const firstText = (...values: unknown[]) => values.find((value): value is string => typeof value === "string" && value.trim().length > 0);

function operationContext(serviceType: string, snapshotValue: unknown, summaryValue: unknown, travelerCount: number) {
  const snapshot = objectValue(snapshotValue);
  const summary = objectValue(summaryValue);
  const outbound = objectValue(snapshot.outbound ?? snapshot.selection ?? snapshot.offer ?? snapshot.service);
  const route = objectValue(snapshot.route ?? outbound.route);
  const plan = objectValue(snapshot.plan ?? outbound.plan);
  const coverage = objectValue(snapshot.coverage ?? plan.coverage);
  const origin = firstText(outbound.origin, outbound.from, route.origin, snapshot.origin);
  const destination = firstText(outbound.destination, outbound.to, route.destination, snapshot.destination);
  const common = {
    title: firstText(summary.title, outbound.title, snapshot.title),
    route: origin || destination ? [origin, destination].filter(Boolean).join(" ← ") : firstText(route.title, summary.route),
    schedule: firstText(outbound.departureAt, outbound.departure, snapshot.date, snapshot.serviceDate),
    travelerCount,
  };
  if (serviceType === "flight") return { ...common, flightNumber: firstText(outbound.flightNumber, outbound.number, snapshot.flightNumber), airline: firstText(outbound.airline, snapshot.airline) };
  if (serviceType === "insurance") return { ...common, plan: firstText(plan.title, plan.name, outbound.planName, summary.title), provider: firstText(plan.provider, outbound.provider), coverage: firstText(coverage.summary, plan.coverageSummary, snapshot.coverageSummary), issuanceState: firstText(snapshot.issuanceState, outbound.issuanceState), policyReference: firstText(snapshot.policyReference, outbound.policyReference) };
  if (serviceType === "cip") return { ...common, airport: firstText(outbound.airport, snapshot.airport), package: firstText(outbound.packageName, outbound.title, summary.title), direction: firstText(outbound.direction, snapshot.direction), specialNotes: firstText(snapshot.specialNotes, snapshot.note) };
  if (serviceType === "transfer") return { ...common, vehicleType: firstText(outbound.vehicleType, snapshot.vehicleType), capacity: outbound.capacity ?? snapshot.capacity, source: firstText(snapshot.source, outbound.source) };
  return common;
}

function visaCasePayload(value: unknown) {
  const payload = objectValue(value);
  return {
    ...payload,
    checklist: objectValue(payload.checklist),
    timeline: Array.isArray(payload.timeline) ? payload.timeline.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [],
  } as Record<string, unknown> & { checklist: Record<string, unknown>; timeline: Array<Record<string, unknown>> };
}

export class PlatformRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async accessContext(userId: string, scope: PlatformScope, requestedOrganizationId?: string): Promise<PlatformAccessContext | null> {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        ...(requestedOrganizationId ? { organizationId: requestedOrganizationId } : {}),
        organization: { type: scope === "INTERNAL" ? "KIASHI_INTERNAL" : "MERCHANT", status: "ACTIVE" },
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, mobile: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, type: true, name: true, slug: true, status: true, merchantProfile: { select: { businessType: true } } } },
        roles: {
          where: { role: { scope } },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });
    if (!membership) return null;
    return {
      membershipId: membership.id,
      user: membership.user,
      organization: { id:membership.organization.id,type:membership.organization.type,name:membership.organization.name,slug:membership.organization.slug,status:membership.organization.status,businessType:membership.organization.merchantProfile?.businessType??null },
      roles: membership.roles.map((entry) => entry.role.code),
      permissions: [...new Set(membership.roles.flatMap((entry) => entry.role.permissions.map((item) => item.permission.code)))].sort(),
    };
  }

  private audit(tx: Prisma.TransactionClient, input: AuditInput) {
    return tx.auditLog.create({
      data: {
        actorUserId: input.userId,
        actorOrganizationId: input.organizationId,
        targetOrganizationId: input.targetOrganizationId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        beforeData: input.beforeData === undefined ? undefined : asJson(sanitizeProviderPayload(input.beforeData)),
        afterData: input.afterData === undefined ? undefined : asJson(sanitizeProviderPayload(input.afterData)),
        metadata: input.metadata === undefined ? undefined : asJson(sanitizeProviderPayload(input.metadata)),
        requestId: input.requestId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent?.slice(0, 500),
      },
    });
  }

  recordSystemAudit(input: { action: string; resourceType: string; requestId: string; metadata?: unknown }) {
    return this.prisma.auditLog.create({ data: { action: input.action, resourceType: input.resourceType, requestId: input.requestId, metadata: input.metadata === undefined ? undefined : asJson(sanitizeProviderPayload(input.metadata)) } });
  }

  recordOperatorAction(input:AuditActor&{action:string;resourceType:string;metadata?:unknown}){return this.prisma.auditLog.create({data:{actorUserId:input.userId,actorOrganizationId:input.organizationId,action:input.action,resourceType:input.resourceType,requestId:input.requestId,ipAddress:input.ipAddress,userAgent:input.userAgent?.slice(0,500),metadata:input.metadata===undefined?undefined:asJson(sanitizeProviderPayload(input.metadata))}});}

  async listBackofficeOrders(filters: OrderFilters, page: PageInput) {
    const where = this.orderWhere(filters);
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({ where, select: orderSelect, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.order.count({ where }),
    ]);
    return { items: items.map((item) => { const buyer=item.buyer&&typeof item.buyer==="object"&&!Array.isArray(item.buyer)?item.buyer as Record<string,unknown>:{};return { ...item, customer:{name:`${buyer.firstName??""} ${buyer.lastName??""}`.trim()||"مشتری",mobile:maskMobile(item.guestMobile)},guestMobile: maskMobile(item.guestMobile), buyer: undefined, travelers: undefined }; }), total };
  }

  async listServiceOperations(serviceType: string, filters: ServiceOperationFilters, page: PageInput) {
    const where: Prisma.OrderWhereInput = {
      serviceType,
      relevantDate: { gte: filters.from, lt: filters.to },
      providerName: filters.provider ? { contains: filters.provider, mode: "insensitive" } : undefined,
      bookingStatus: filters.manualReview ? "manual_review_required" : filters.bookingStatus,
      paymentStatus: filters.paymentStatus,
      summary: filters.route ? { path: ["title"], string_contains: filters.route } : undefined,
    };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: {
          id: true, orderNumber: true, trackingCode: true, serviceType: true, summary: true, serviceSnapshot: true,
          total: true, currency: true, paymentStatus: true, bookingStatus: true, providerName: true,
          externalReference: true, relevantDate: true, createdAt: true, travelers: true,
          merchantOrganization: { select: { id: true, name: true } },
          bookingAttempts: { select: { id: true, provider: true, providerReference: true, status: true, error: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
          refunds: { select: { id: true, status: true, amount: true, providerReference: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: [{ relevantDate: "desc" }, { createdAt: "desc" }],
        skip: (page.page - 1) * page.perPage,
        take: page.perPage,
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      items: items.map((item) => {
        const attempts = item.bookingAttempts.map((attempt) => ({ ...attempt, error: attempt.error ? String(sanitizeProviderPayload(attempt.error, { maxBytes: 512 })) : null }));
        const latestAttempt = attempts[0] ?? null;
        return {
          id: item.id,
          orderNumber: item.orderNumber,
          trackingCode: item.trackingCode,
          serviceType: item.serviceType,
          context: operationContext(item.serviceType, item.serviceSnapshot, item.summary, Array.isArray(item.travelers) ? item.travelers.length : 0),
          total: item.total,
          currency: item.currency,
          paymentStatus: item.paymentStatus,
          bookingStatus: item.bookingStatus,
          provider: item.providerName ?? latestAttempt?.provider ?? null,
          externalReference: item.externalReference ?? latestAttempt?.providerReference ?? null,
          relevantDate: item.relevantDate,
          merchant: item.merchantOrganization,
          manualReview: item.bookingStatus === "manual_review_required" || latestAttempt?.status === "UNKNOWN",
          reconciliationState: latestAttempt?.status === "UNKNOWN" ? "unresolved" : item.bookingStatus === "manual_review_required" ? "manual_review" : item.bookingStatus === "confirmed" ? "resolved" : "pending",
          latestAttempt,
          attemptCount: attempts.length,
          refund: item.refunds[0] ?? null,
          createdAt: item.createdAt,
        };
      }),
      total,
    };
  }

  getBackofficeOrder(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      select: {
        ...orderSelect,
        providerName: true,
        payments: { select: { id: true, provider: true, method: true, status: true, amount: true, walletAmount: true, onlineAmount: true, reference: true, createdAt: true, completedAt: true } },
        refunds: { select: { id: true, amount: true, reason: true, destination: true, status: true, walletAmount: true, onlineAmount: true, providerReference: true, createdAt: true, completedAt: true } },
        bookingAttempts: { select: { id: true, provider: true, providerReference: true, status: true, error: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" } },
        serviceSnapshot: true,
        pricingSnapshot: true,
        paymentSnapshot: true,
        property: { select: { id:true,slug:true,name:true,city:true,sourceType:true } },
        roomType: { select: { id:true,name:true,capacity:true,bedType:true } },
        ratePlan: { select: { id:true,title:true,mealPlan:true,refundable:true,cancellationPolicy:true } },
        travelProgram: { select: { id:true,title:true,type:true } },
        travelProgramDeparture: { select: { id:true,startDate:true,endDate:true,transportType:true } },
        travelProgramPackage: { select: { id:true,name:true,hotelName:true,roomType:true } },
      },
    });
  }

  async listPayments(filters: RangeInput, page: PageInput) {
    const where: Prisma.PaymentAttemptWhereInput = { createdAt: { gte: filters.from, lt: filters.to } };
    const [items, total] = await Promise.all([
      this.prisma.paymentAttempt.findMany({ where, select: { id: true, provider: true, method: true, status: true, amount: true, walletAmount: true, onlineAmount: true, reference: true, createdAt: true, completedAt: true, order: { select: { id: true, orderNumber: true, trackingCode: true, merchantOrganizationId: true } } }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.paymentAttempt.count({ where }),
    ]);
    return { items, total };
  }

  async listRefunds(filters: RangeInput, page: PageInput) {
    const where: Prisma.RefundRequestWhereInput = { createdAt: { gte: filters.from, lt: filters.to } };
    const [items, total] = await Promise.all([
      this.prisma.refundRequest.findMany({ where, select: { id: true, orderId: true, amount: true, reason: true, destination: true, status: true, walletAmount: true, onlineAmount: true, providerReference: true, completedAt: true, createdAt: true, updatedAt: true, order: { select: { orderNumber: true, trackingCode: true, merchantOrganizationId: true } } }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.refundRequest.count({ where }),
    ]);
    return { items, total };
  }

  async listSupport(page: PageInput, status?: string) {
    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({ where:{status},select: { id: true, subject: true, status: true,category:true,order:{select:{id:true,orderNumber:true}},organization:{select:{id:true,name:true}}, createdAt: true, updatedAt: true, user: { select: { id: true, firstName: true, lastName: true, mobile: true } }, _count: { select: { messages: true } } }, orderBy: { updatedAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.supportTicket.count({where:{status}}),
    ]);
    return { items: items.map((item) => ({ ...item, user: item.user ? { ...item.user, mobile: maskMobile(item.user.mobile) } : null })), total };
  }

  async listVisaCases(filters: { status?: string; country?: string; query?: string }, page: PageInput) {
    const queryIsUuid=Boolean(filters.query&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(filters.query));
    const where: Prisma.VisaApplicationWhereInput = {
      status: filters.status ? { equals: filters.status, mode: "insensitive" } : undefined,
      country: filters.country ? { contains: filters.country, mode: "insensitive" } : undefined,
      ...(filters.query ? { OR: [
        ...(queryIsUuid?[{ id: { equals: filters.query } }]:[]),
        { country: { contains: filters.query, mode: "insensitive" } },
        { user: { mobile: { contains: filters.query } } },
        { user: { firstName: { contains: filters.query, mode: "insensitive" } } },
        { user: { lastName: { contains: filters.query, mode: "insensitive" } } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.visaApplication.findMany({ where, include: { user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true } } }, orderBy: { updatedAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.visaApplication.count({ where }),
    ]);
    return { items: items.map((item) => { const payload=visaCasePayload(item.payload);const checklist=payload.checklist;const missingDocuments=Object.values(checklist).filter(entry=>["missing","requested"].includes(String(objectValue(entry).status))).length;return{id:item.id,country:item.country,status:normalizeVisaStatus(item.status),applicant:{id:item.user.id,name:`${item.user.firstName} ${item.user.lastName}`.trim(),mobile:maskMobile(item.user.mobile),email:maskEmail(item.user.email)},submittedAt:payload.submittedAt??null,missingDocuments,reviewerId:payload.reviewerId??null,customerNote:payload.customerNote??null,updatedAt:item.updatedAt,createdAt:item.createdAt};}), total };
  }

  async getVisaCase(id: string) {
    const visa = await this.prisma.visaApplication.findUnique({ where: { id }, include: { user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true, nationalId: true } } } });
    if (!visa) throw notFound("پرونده ویزا پیدا نشد");
    const payload=visaCasePayload(visa.payload);
    const reviewerId=typeof payload.reviewerId==="string"?payload.reviewerId:null;
    const [reviewer,audit]=await Promise.all([
      reviewerId?this.prisma.user.findUnique({where:{id:reviewerId},select:{id:true,firstName:true,lastName:true}}):null,
      this.prisma.auditLog.findMany({where:{resourceType:"VisaApplication",resourceId:id},select:{id:true,actorUserId:true,action:true,beforeData:true,afterData:true,createdAt:true},orderBy:{createdAt:"desc"},take:100}),
    ]);
    return { id:visa.id,country:visa.country,status:normalizeVisaStatus(visa.status),applicant:{id:visa.user.id,name:`${visa.user.firstName} ${visa.user.lastName}`.trim(),mobile:maskMobile(visa.user.mobile),email:maskEmail(visa.user.email),nationalId:maskIdentifier(visa.user.nationalId)},travelDates:payload.travelDates??null,purpose:payload.purpose??null,checklist:Object.keys(payload.checklist).length?payload.checklist:emptyVisaChecklist(),internalNote:payload.internalNote??null,customerNote:payload.customerNote??null,providerReference:payload.providerReference??null,reviewer:reviewer?{id:reviewer.id,name:`${reviewer.firstName} ${reviewer.lastName}`.trim()}:null,timeline:payload.timeline,audit,submittedAt:payload.submittedAt??null,createdAt:visa.createdAt,updatedAt:visa.updatedAt };
  }

  async updateVisaCase(id: string, input: { status?: VisaStatus; checklist?: Partial<Record<VisaDocumentKey, { status?: VisaDocumentState; note?: string }>>; internalNote?: string | null; customerNote?: string | null; reviewerId?: string | null; providerReference?: string | null }, actor: AuditActor) {
    return this.prisma.$transaction(async tx=>{
      const current=await tx.visaApplication.findUnique({where:{id}});if(!current)throw notFound("پرونده ویزا پیدا نشد");
      const currentStatus=normalizeVisaStatus(current.status);const nextStatus=input.status??currentStatus;assertVisaTransition(currentStatus,nextStatus);
      const payload=visaCasePayload(current.payload);const checklist={...(Object.keys(payload.checklist).length?payload.checklist:emptyVisaChecklist()),...input.checklist};
      const providerReference=input.providerReference===undefined?payload.providerReference:input.providerReference;
      if(nextStatus==="SUBMITTED_TO_PROVIDER"&&!providerReference)throw new DomainError("VISA_PROVIDER_REFERENCE_REQUIRED","برای ثبت ارسال واقعی، مرجع تأمین‌کننده الزامی است",409);
      if(input.reviewerId&&!(await tx.user.findUnique({where:{id:input.reviewerId},select:{id:true}})))throw notFound("کارشناس پرونده پیدا نشد");
      const now=new Date().toISOString();const statusChanged=nextStatus!==currentStatus;
      const timeline=[...payload.timeline,...(statusChanged?[{status:nextStatus,at:now,audience:"customer",note:input.customerNote||"وضعیت پرونده به‌روزرسانی شد"}]:[]),...(input.internalNote!==undefined?[{status:nextStatus,at:now,audience:"internal",note:input.internalNote||"یادداشت داخلی پاک شد"}]:[])];
      const nextPayload={...payload,checklist,internalNote:input.internalNote===undefined?payload.internalNote:input.internalNote,customerNote:input.customerNote===undefined?payload.customerNote:input.customerNote,reviewerId:input.reviewerId===undefined?payload.reviewerId:input.reviewerId,providerReference,...(!payload.submittedAt&&nextStatus!=="DRAFT"?{submittedAt:now}:{}),timeline};
      const updated=await tx.visaApplication.update({where:{id},data:{status:nextStatus,payload:asJson(nextPayload)}});
      await this.audit(tx,{...actor,action:statusChanged?"visa.status_changed":"visa.case_updated",resourceType:"VisaApplication",resourceId:id,beforeData:{status:currentStatus,checklist:payload.checklist,reviewerId:payload.reviewerId},afterData:{status:nextStatus,checklist,reviewerId:nextPayload.reviewerId,customerNote:nextPayload.customerNote,providerReference:Boolean(providerReference)}});
      return updated;
    });
  }

  async getSupport(id:string){const ticket=await this.prisma.supportTicket.findUnique({where:{id},include:{user:{select:{id:true,firstName:true,lastName:true,mobile:true}},order:{select:{id:true,orderNumber:true,trackingCode:true,serviceType:true}},organization:{select:{id:true,name:true}},messages:{orderBy:{createdAt:"asc"},select:{id:true,authorType:true,body:true,internal:true,createdAt:true}}}});if(!ticket)throw notFound();return{...ticket,user:ticket.user?{...ticket.user,mobile:maskMobile(ticket.user.mobile)}:null};}

  async customerLookup(query:string,actor:AuditActor){const normalized=query.trim();const users=await this.prisma.user.findMany({where:{OR:[{mobile:{contains:normalized}},{firstName:{contains:normalized,mode:"insensitive"}},{lastName:{contains:normalized,mode:"insensitive"}},{orders:{some:{OR:[{orderNumber:{contains:normalized,mode:"insensitive"}},{trackingCode:{contains:normalized,mode:"insensitive"}}]}}}]},take:20,include:{wallet:{select:{balance:true,currency:true}},orders:{orderBy:{createdAt:"desc"},take:20,select:{id:true,orderNumber:true,trackingCode:true,serviceType:true,total:true,paymentStatus:true,bookingStatus:true,relevantDate:true,createdAt:true}},refunds:{orderBy:{createdAt:"desc"},take:10,select:{id:true,orderId:true,amount:true,status:true,createdAt:true}},supportTickets:{orderBy:{updatedAt:"desc"},take:10,select:{id:true,subject:true,status:true,updatedAt:true}},visaApplications:{orderBy:{updatedAt:"desc"},take:10,select:{id:true,country:true,status:true,updatedAt:true}}}});await this.prisma.auditLog.create({data:{actorUserId:actor.userId,actorOrganizationId:actor.organizationId,action:"customer.lookup",resourceType:"User",requestId:actor.requestId,ipAddress:actor.ipAddress,userAgent:actor.userAgent?.slice(0,500),metadata:asJson({queryType:/^09\d{9}$/.test(normalized)?"mobile":"general",resultCount:users.length})}});return users.map(user=>({id:user.id,identity:{name:`${user.firstName} ${user.lastName}`.trim(),mobile:maskMobile(user.mobile),email:maskEmail(user.email),nationalId:maskIdentifier(user.nationalId)},wallet:user.wallet,orders:user.orders,refunds:user.refunds,support:user.supportTickets,visaApplications:user.visaApplications}));}

  async createMerchantSupport(organizationId:string,userId:string,input:{subject:string;body:string;category:string;orderId?:string}){if(input.orderId&&!await this.prisma.order.findFirst({where:{id:input.orderId,merchantOrganizationId:organizationId},select:{id:true}}))throw notFound("سفارش سازمان پیدا نشد");return this.prisma.supportTicket.create({data:{organizationId,orderId:input.orderId,category:input.category,subject:input.subject,messages:{create:{authorType:"merchant",authorUserId:userId,body:input.body}}},include:{messages:true}});}

  async operationsQueue(organizationId?:string){
    const start=new Date();start.setUTCHours(0,0,0,0);const end=new Date(start.getTime()+86_400_000);const orderScope=organizationId?{merchantOrganizationId:organizationId}:{};
    const[arrivals,manualReview,bookingUnknown,reconciliationIssues,refunds,support,lowInventory,visaReview,settlementReady,onboardingPending,settlementUpdates,profileTeamIssues]=await Promise.all([
      this.prisma.order.findMany({where:{...orderScope,serviceType:"hotel",relevantDate:{gte:start,lt:end},bookingStatus:{not:"confirmed"}},select:{id:true,orderNumber:true,bookingStatus:true,relevantDate:true,property:{select:{name:true}}},take:30}),
      this.prisma.order.findMany({where:{...orderScope,bookingStatus:"manual_review_required"},select:{id:true,orderNumber:true,serviceType:true,createdAt:true},take:30}),
      this.prisma.bookingAttempt.findMany({where:{status:"UNKNOWN",...(organizationId?{merchantOrganizationId:organizationId}:{})},select:{id:true,status:true,provider:true,providerReference:true,order:{select:{id:true,orderNumber:true,serviceType:true}}},take:30,orderBy:{updatedAt:"desc"}}),
      this.prisma.bookingAttempt.findMany({where:{status:{in:["UNKNOWN","FAILED"]},...(organizationId?{merchantOrganizationId:organizationId}:{})},select:{id:true,status:true,provider:true,updatedAt:true,order:{select:{id:true,orderNumber:true,serviceType:true}}},take:30,orderBy:{updatedAt:"desc"}}),
      this.prisma.refundRequest.findMany({where:{status:"requested",...(organizationId?{order:{merchantOrganizationId:organizationId}}:{})},select:{id:true,amount:true,order:{select:{orderNumber:true,serviceType:true}}},take:30}),
      this.prisma.supportTicket.findMany({where:{status:{in:["open","pending"]},...(organizationId?{organizationId}:{})},select:{id:true,subject:true,status:true,updatedAt:true},take:30}),
      this.prisma.dailyInventory.findMany({where:{date:{gte:start,lt:new Date(start.getTime()+14*86_400_000)},availableRooms:{lte:1},ratePlan:{roomType:{property:{organizationId}}}},select:{id:true,date:true,availableRooms:true,ratePlan:{select:{title:true,roomType:{select:{name:true,property:{select:{id:true,name:true}}}}}}},take:30}),
      organizationId?Promise.resolve([]):this.prisma.visaApplication.findMany({where:{status:{in:["SUBMITTED","DOCUMENTS_REQUIRED","UNDER_REVIEW","READY_FOR_SUBMISSION"]}},select:{id:true,country:true,status:true,updatedAt:true},take:30,orderBy:{updatedAt:"asc"}}),
      this.prisma.settlementBatch.findMany({where:{status:"READY",...(organizationId?{organizationId}:{})},select:{id:true,organizationId:true,payableAmount:true,status:true,organization:{select:{name:true}}},take:30}),
      organizationId?Promise.resolve([]):this.prisma.organization.findMany({where:{type:"MERCHANT",merchantProfile:{onboardingStatus:{not:"APPROVED"}}},select:{id:true,name:true,status:true,merchantProfile:{select:{onboardingStatus:true,contractStatus:true}}},take:30}),
      organizationId?this.prisma.settlementBatch.findMany({where:{organizationId,status:{in:["READY","APPROVED","PROCESSING","FAILED"]}},select:{id:true,status:true,payableAmount:true,updatedAt:true},take:30}):Promise.resolve([]),
      organizationId?this.prisma.organization.findMany({where:{id:organizationId,OR:[{contactEmail:null},{contactMobile:null},{memberships:{none:{status:"ACTIVE"}}}]},select:{id:true,name:true,contactEmail:true,contactMobile:true,_count:{select:{memberships:true}}}}):Promise.resolve([]),
    ]);
    return{todayArrivalIssues:arrivals,manualReview,providerBookingUnknown:bookingUnknown,reconciliationIssues,refundRequested:refunds,supportWaiting:support,lowAvailability:lowInventory,visaNeedsReview:visaReview,settlementReady,onboardingPending,settlementUpdates,profileTeamIssues};
  }

  async reconciliationView(range:RangeInput,page:PageInput,provider?:string,status?:string){const bookingWhere:Prisma.BookingAttemptWhereInput={createdAt:{gte:range.from,lt:range.to},provider:provider?{contains:provider,mode:"insensitive"}:undefined,status};const paymentWhere:Prisma.PaymentAttemptWhereInput={createdAt:{gte:range.from,lt:range.to},provider:provider?{contains:provider,mode:"insensitive"}:undefined};const[bookings,total,payments,providerGroups]=await Promise.all([this.prisma.bookingAttempt.findMany({where:bookingWhere,select:{id:true,provider:true,providerReference:true,status:true,error:true,createdAt:true,updatedAt:true,order:{select:{id:true,orderNumber:true,serviceType:true,bookingStatus:true,paymentStatus:true}}},orderBy:{updatedAt:"desc"},skip:(page.page-1)*page.perPage,take:page.perPage}),this.prisma.bookingAttempt.count({where:bookingWhere}),this.prisma.paymentAttempt.findMany({where:paymentWhere,select:{id:true,provider:true,status:true,reference:true,amount:true,createdAt:true,completedAt:true,order:{select:{id:true,orderNumber:true,paymentStatus:true}}},orderBy:{createdAt:"desc"},take:page.perPage}),this.prisma.bookingAttempt.groupBy({by:["provider","status"],where:{createdAt:{gte:range.from,lt:range.to}},_count:{_all:true}})]);const reliability=Object.values(providerGroups.reduce<Record<string,{provider:string;attempts:number;success:number;failure:number;unknown:number;timeout:number}>>((result,entry)=>{const item=result[entry.provider]??={provider:entry.provider,attempts:0,success:0,failure:0,unknown:0,timeout:0};item.attempts+=entry._count._all;if(entry.status==="CONFIRMED")item.success+=entry._count._all;if(entry.status==="FAILED")item.failure+=entry._count._all;if(entry.status==="UNKNOWN")item.unknown+=entry._count._all;if(entry.status==="TIMEOUT")item.timeout+=entry._count._all;return result;},{}));return{bookings:bookings.map(item=>({...item,error:item.error?String(sanitizeProviderPayload(item.error,{maxBytes:512})):null,reconciliationState:item.status==="UNKNOWN"?"unresolved":item.order?.bookingStatus==="manual_review_required"?"manual_review":["CONFIRMED","FAILED"].includes(item.status)?"resolved":"pending"})),payments,reliability,total};}

  async listMerchants(page: PageInput, status?: string, businessType?: string) {
    const where: Prisma.OrganizationWhereInput = { type: "MERCHANT", ...(status ? { status } : {}), ...(businessType ? { merchantProfile: { businessType } } : {}) };
    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({ where, select: { id: true, name: true, legalName: true, slug: true, status: true, contactEmail: true, contactMobile: true, createdAt: true, updatedAt: true, merchantProfile: { select: { merchantCode: true, businessType: true, onboardingStatus: true, contractStatus: true, settlementStatus: true } }, _count: { select: { memberships: true, merchantOrders: true } } }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.organization.count({ where }),
    ]);
    return { items: items.map((item) => ({ ...item, contactEmail: maskEmail(item.contactEmail), contactMobile: maskMobile(item.contactMobile) })), total };
  }

  async getMerchant(id: string) {
    const merchant = await this.prisma.organization.findFirst({ where: { id, type: "MERCHANT" }, select: { id: true, name: true, legalName: true, slug: true, status: true, contactEmail: true, contactMobile: true, metadata: true, createdAt: true, updatedAt: true, merchantProfile: true, memberships:{where:{status:{not:"REVOKED"}},select:{id:true,status:true,user:{select:{id:true,firstName:true,lastName:true,mobile:true}},roles:{select:{role:{select:{code:true,name:true}}}}},take:50},merchantOrders:{select:{id:true,orderNumber:true,serviceType:true,total:true,paymentStatus:true,bookingStatus:true,createdAt:true},orderBy:{createdAt:"desc"},take:10},settlements:{select:{id:true,status:true,payableAmount:true,periodStart:true,periodEnd:true},orderBy:{createdAt:"desc"},take:5},_count: { select: { memberships: true, merchantOrders: true, settlements: true } } } });
    if (!merchant) throw notFound();
    return { ...merchant,memberships:merchant.memberships.map(member=>({...member,user:{...member.user,mobile:maskMobile(member.user.mobile)},roles:member.roles.map(entry=>entry.role)})), merchantProfile: merchant.merchantProfile ? { ...merchant.merchantProfile, legalIdentifier: maskIdentifier(merchant.merchantProfile.legalIdentifier), taxIdentifier: maskIdentifier(merchant.merchantProfile.taxIdentifier) } : null };
  }

  async createMerchant(input: { name: string; legalName?: string; slug: string; contactEmail?: string; contactMobile?: string; merchantCode: string; businessType: string; legalIdentifier?: string; taxIdentifier?: string; supportPhone?: string }, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.organization.create({ data: { type: "MERCHANT", name: input.name, legalName: input.legalName, slug: input.slug, contactEmail: input.contactEmail, contactMobile: input.contactMobile, merchantProfile: { create: { merchantCode: input.merchantCode, businessType: input.businessType, legalIdentifier: input.legalIdentifier, taxIdentifier: input.taxIdentifier, supportPhone: input.supportPhone } } }, include: { merchantProfile: true } });
      await this.audit(tx, { ...actor, action: "merchant.created", resourceType: "Organization", resourceId: merchant.id, targetOrganizationId: merchant.id, afterData: { name: merchant.name, slug: merchant.slug, status: merchant.status, businessType: merchant.merchantProfile?.businessType } });
      return merchant;
    });
  }

  async updateMerchant(id: string, input: { name?: string; legalName?: string | null; status?: string; contactEmail?: string | null; contactMobile?: string | null; onboardingStatus?: string; contractStatus?: string; settlementStatus?: string }, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.organization.findFirst({ where: { id, type: "MERCHANT" }, include: { merchantProfile: true } });
      if (!current || !current.merchantProfile) throw notFound();
      const merchant = await tx.organization.update({ where: { id }, data: { name: input.name, legalName: input.legalName, status: input.status, contactEmail: input.contactEmail, contactMobile: input.contactMobile, merchantProfile: { update: { onboardingStatus: input.onboardingStatus, contractStatus: input.contractStatus, settlementStatus: input.settlementStatus } } }, include: { merchantProfile: true } });
      await this.audit(tx, { ...actor, action: "merchant.updated", resourceType: "Organization", resourceId: id, targetOrganizationId: id, beforeData: { name: current.name, status: current.status, onboardingStatus: current.merchantProfile.onboardingStatus, contractStatus: current.merchantProfile.contractStatus, settlementStatus: current.merchantProfile.settlementStatus }, afterData: { name: merchant.name, status: merchant.status, onboardingStatus: merchant.merchantProfile?.onboardingStatus, contractStatus: merchant.merchantProfile?.contractStatus, settlementStatus: merchant.merchantProfile?.settlementStatus } });
      return merchant;
    });
  }

  async listAudit(filters: RangeInput & { actorUserId?: string; action?: string; resourceType?: string }, page: PageInput) {
    const where: Prisma.AuditLogWhereInput = { createdAt: { gte: filters.from, lt: filters.to }, actorUserId: filters.actorUserId, action: filters.action, resourceType: filters.resourceType };
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, select: { id: true, actorUserId: true, actorOrganizationId: true, targetOrganizationId: true, action: true, resourceType: true, resourceId: true, beforeData: true, afterData: true, metadata: true, requestId: true, createdAt: true }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total };
  }

  async reportSummary(range: RangeInput, merchantOrganizationId?: string) {
    const orderWhere: Prisma.OrderWhereInput = { createdAt: { gte: range.from, lt: range.to }, ...(merchantOrganizationId ? { merchantOrganizationId } : {}) };
    const refundWhere: Prisma.RefundRequestWhereInput = { status: "completed", completedAt: { gte: range.from, lt: range.to }, ...(merchantOrganizationId ? { order: { merchantOrganizationId } } : {}) };
    const ledgerWhere: Prisma.MerchantLedgerEntryWhereInput = { status: "POSTED", createdAt: { gte: range.from, lt: range.to }, ...(merchantOrganizationId ? { organizationId: merchantOrganizationId } : {}) };
    const paymentWhere: Prisma.PaymentAttemptWhereInput = { createdAt: { gte: range.from, lt: range.to }, ...(merchantOrganizationId ? { order: { merchantOrganizationId } } : {}) };
    const [orders, completedOrders, gross, paymentSucceeded, paymentFailed, bookingSucceeded, bookingFailed, manualReview, refunds, refundAmount, ledgerTotals, byServiceType, byPaymentStatus, byBookingStatus] = await Promise.all([
      this.prisma.order.count({ where: orderWhere }),
      this.prisma.order.count({ where: { ...orderWhere, paymentStatus: "paid", bookingStatus: "confirmed" } }),
      this.prisma.order.aggregate({ where: { ...orderWhere, paymentStatus: "paid" }, _sum: { total: true } }),
      this.prisma.paymentAttempt.count({ where: { ...paymentWhere, status: "succeeded" } }),
      this.prisma.paymentAttempt.count({ where: { ...paymentWhere, status: { in: ["failed", "cancelled"] } } }),
      this.prisma.order.count({ where: { ...orderWhere, bookingStatus: "confirmed" } }),
      this.prisma.order.count({ where: { ...orderWhere, bookingStatus: "reservation_failed" } }),
      this.prisma.order.count({ where: { ...orderWhere, bookingStatus: "manual_review_required" } }),
      this.prisma.refundRequest.count({ where: refundWhere }),
      this.prisma.refundRequest.aggregate({ where: refundWhere, _sum: { amount: true } }),
      this.prisma.merchantLedgerEntry.groupBy({ by: ["type"], where: ledgerWhere, _sum: { amount: true } }),
      this.prisma.order.groupBy({ by: ["serviceType"], where: orderWhere, _count: { _all: true }, _sum: { total: true } }),
      this.prisma.order.groupBy({ by: ["paymentStatus"], where: orderWhere, _count: { _all: true }, _sum: { total: true } }),
      this.prisma.order.groupBy({ by: ["bookingStatus"], where: orderWhere, _count: { _all: true }, _sum: { total: true } }),
    ]);
    const ledger = Object.fromEntries(ledgerTotals.map((entry) => [entry.type, numeric(entry._sum.amount)]));
    const organizationClause = merchantOrganizationId ? Prisma.sql`AND "merchantOrganizationId" = CAST(${merchantOrganizationId} AS UUID)` : Prisma.empty;
    const series = await this.prisma.$queryRaw<Array<{ bucket: string; orders: bigint; grossAmount: bigint }>>(Prisma.sql`
      SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'Asia/Tehran'), 'YYYY-MM-DD') AS bucket,
             COUNT(*)::bigint AS orders,
             COALESCE(SUM(CASE WHEN "paymentStatus" = 'paid' THEN total ELSE 0 END), 0)::bigint AS "grossAmount"
      FROM "Order"
      WHERE "createdAt" >= ${range.from} AND "createdAt" < ${range.to} ${organizationClause}
      GROUP BY 1 ORDER BY 1 ASC
    `);
    return {
      range: { from: range.from.toISOString(), to: range.to.toISOString(), timezone: reportingTimezone },
      totals: { orders, completedOrders, grossAmount: numeric(gross._sum.total), paymentSucceeded, paymentFailed, bookingSucceeded, bookingFailed, refunds, refundAmount: numeric(refundAmount._sum.amount), manualReview, commissionAmount: ledger.COMMISSION ?? 0, merchantPayable: ledger.MERCHANT_PAYABLE ?? 0 },
      series: series.map((entry) => ({ bucket: entry.bucket, orders: numeric(entry.orders), grossAmount: numeric(entry.grossAmount) })),
      dimensions: {
        serviceType: byServiceType.map((entry) => ({ key: entry.serviceType, count: entry._count._all, amount: numeric(entry._sum.total) })),
        paymentStatus: byPaymentStatus.map((entry) => ({ key: entry.paymentStatus, count: entry._count._all, amount: numeric(entry._sum.total) })),
        bookingStatus: byBookingStatus.map((entry) => ({ key: entry.bookingStatus, count: entry._count._all, amount: numeric(entry._sum.total) })),
      },
    };
  }

  async listMerchantOrders(organizationId: string, filters: OrderFilters, page: PageInput) {
    const where = this.orderWhere({ ...filters, merchantOrganizationId: organizationId });
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({ where, select: orderSelect, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.order.count({ where }),
    ]);
    return { items: items.map(toMerchantOrderDto), total };
  }

  async getMerchantOrder(organizationId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, merchantOrganizationId: organizationId }, select: orderSelect });
    if (!order) throw notFound();
    return toMerchantOrderDto(order);
  }

  async listMerchantBookings(organizationId: string, range: RangeInput, page: PageInput) {
    const where: Prisma.BookingAttemptWhereInput = { merchantOrganizationId: organizationId, createdAt: { gte: range.from, lt: range.to } };
    const [items, total] = await Promise.all([
      this.prisma.bookingAttempt.findMany({ where, select: { id: true, orderId: true, provider: true, providerReference: true, status: true, error: true, createdAt: true, updatedAt: true, order: { select: { orderNumber: true, trackingCode: true, serviceType: true } } }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.bookingAttempt.count({ where }),
    ]);
    return { items, total };
  }

  async merchantFinanceSummary(organizationId: string, range: RangeInput) {
    const [ledger, settlements] = await Promise.all([
      this.prisma.merchantLedgerEntry.groupBy({ by: ["type", "currency"], where: { organizationId, status: "POSTED", createdAt: { gte: range.from, lt: range.to } }, _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.settlementBatch.aggregate({ where: { organizationId, createdAt: { gte: range.from, lt: range.to }, status: { notIn: ["CANCELLED", "FAILED"] } }, _sum: { grossAmount: true, commissionAmount: true, refundAmount: true, adjustmentAmount: true, payableAmount: true }, _count: { _all: true } }),
    ]);
    return { range: { from: range.from.toISOString(), to: range.to.toISOString(), timezone: reportingTimezone }, ledger: ledger.map((entry) => ({ type: entry.type, currency: entry.currency, amount: numeric(entry._sum.amount), count: entry._count._all })), settlements: { count: settlements._count._all, grossAmount: numeric(settlements._sum.grossAmount), commissionAmount: numeric(settlements._sum.commissionAmount), refundAmount: numeric(settlements._sum.refundAmount), adjustmentAmount: numeric(settlements._sum.adjustmentAmount), payableAmount: numeric(settlements._sum.payableAmount) } };
  }

  async backofficeFinanceSummary(range: RangeInput) {
    const [report,settlements,adjustments]=await Promise.all([
      this.reportSummary(range),
      this.prisma.settlementBatch.groupBy({by:["status"],where:{createdAt:{gte:range.from,lt:range.to}},_sum:{grossAmount:true,commissionAmount:true,refundAmount:true,adjustmentAmount:true,payableAmount:true},_count:{_all:true}}),
      this.prisma.merchantLedgerEntry.aggregate({where:{type:"ADJUSTMENT",status:"POSTED",createdAt:{gte:range.from,lt:range.to}},_sum:{amount:true},_count:{_all:true}}),
    ]);
    const pending=settlements.filter(entry=>!["PAID","CANCELLED","FAILED"].includes(entry.status));const completed=settlements.filter(entry=>entry.status==="PAID");
    return{range:report.range,totals:{grossSales:report.totals.grossAmount,refunds:report.totals.refundAmount,commission:report.totals.commissionAmount,merchantPayable:report.totals.merchantPayable,adjustments:numeric(adjustments._sum.amount),pendingSettlements:pending.reduce((sum,entry)=>sum+entry._count._all,0),pendingAmount:pending.reduce((sum,entry)=>sum+numeric(entry._sum.payableAmount),0),completedSettlements:completed.reduce((sum,entry)=>sum+entry._count._all,0),completedAmount:completed.reduce((sum,entry)=>sum+numeric(entry._sum.payableAmount),0)},series:report.series};
  }

  async listBackofficeSettlements(page:PageInput,status?:SettlementStatus,organizationId?:string){const where:Prisma.SettlementBatchWhereInput={status,organizationId};const[items,total]=await Promise.all([this.prisma.settlementBatch.findMany({where,select:{id:true,organizationId:true,periodStart:true,periodEnd:true,grossAmount:true,commissionAmount:true,refundAmount:true,adjustmentAmount:true,payableAmount:true,currency:true,status:true,externalReference:true,notes:true,approvedAt:true,paidAt:true,createdAt:true,organization:{select:{id:true,name:true}}},orderBy:{createdAt:"desc"},skip:(page.page-1)*page.perPage,take:page.perPage}),this.prisma.settlementBatch.count({where})]);return{items,total};}

  async listMerchantSettlements(organizationId: string, page: PageInput) {
    const [items, total] = await Promise.all([
      this.prisma.settlementBatch.findMany({ where: { organizationId }, select: { id: true, periodStart: true, periodEnd: true, grossAmount: true, commissionAmount: true, refundAmount: true, adjustmentAmount: true, payableAmount: true, currency: true, status: true, externalReference: true, notes: true, approvedAt: true, paidAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.settlementBatch.count({ where: { organizationId } }),
    ]);
    return { items, total };
  }

  async listMerchantTeam(organizationId: string, page: PageInput) {
    const where: Prisma.OrganizationMembershipWhereInput = { organizationId, status: { not: "REVOKED" } };
    const [items, total] = await Promise.all([
      this.prisma.organizationMembership.findMany({ where, select: { id: true, status: true, invitedAt: true, joinedAt: true, createdAt: true, user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true } }, roles: { select: { role: { select: { code: true, name: true } } } } }, orderBy: { createdAt: "asc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.organizationMembership.count({ where }),
    ]);
    return { items: items.map((item) => ({ ...item, user: { ...item.user, mobile: maskMobile(item.user.mobile), email: maskEmail(item.user.email) }, roles: item.roles.map((entry) => entry.role) })), total };
  }

  async updateMembershipStatus(organizationId:string,membershipId:string,status:"ACTIVE"|"SUSPENDED",actor:AuditActor){return this.prisma.$transaction(async tx=>{const membership=await tx.organizationMembership.findFirst({where:{id:membershipId,organizationId},include:{roles:{include:{role:true}}}});if(!membership)throw notFound();if(status==="SUSPENDED"&&membership.roles.some(entry=>entry.role.code==="MERCHANT_OWNER")){const otherOwner=await tx.organizationMembership.count({where:{organizationId,status:"ACTIVE",id:{not:membershipId},roles:{some:{role:{code:"MERCHANT_OWNER"}}}}});if(!otherOwner)throw new DomainError("LAST_OWNER_REQUIRED","آخرین مالک فعال سازمان را نمی‌توان غیرفعال کرد",409);}const updated=await tx.organizationMembership.update({where:{id:membershipId},data:{status}});await this.audit(tx,{...actor,action:"membership.status_changed",resourceType:"OrganizationMembership",resourceId:membershipId,targetOrganizationId:organizationId,beforeData:{status:membership.status},afterData:{status}});return updated;});}

  async getMerchantProfile(organizationId: string) {
    const organization = await this.prisma.organization.findFirst({ where: { id: organizationId, type: "MERCHANT" }, select: { id: true, name: true, legalName: true, slug: true, status: true, contactEmail: true, contactMobile: true, merchantProfile: true } });
    if (!organization || !organization.merchantProfile) throw notFound();
    return { ...organization, contactEmail: maskEmail(organization.contactEmail), contactMobile: maskMobile(organization.contactMobile), merchantProfile: { ...organization.merchantProfile, legalIdentifier: maskIdentifier(organization.merchantProfile.legalIdentifier), taxIdentifier: maskIdentifier(organization.merchantProfile.taxIdentifier) } };
  }

  async updateOwnMerchantProfile(organizationId: string, input: { name?: string; contactEmail?: string | null; contactMobile?: string | null; supportPhone?: string | null }, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.organization.findFirst({ where: { id: organizationId, type: "MERCHANT" }, include: { merchantProfile: true } });
      if (!current || !current.merchantProfile) throw notFound();
      const organization = await tx.organization.update({ where: { id: organizationId }, data: { name: input.name, contactEmail: input.contactEmail, contactMobile: input.contactMobile, merchantProfile: { update: { supportPhone: input.supportPhone } } }, include: { merchantProfile: true } });
      await this.audit(tx, { ...actor, action: "merchant.profile_updated", resourceType: "MerchantProfile", resourceId: current.merchantProfile.id, targetOrganizationId: organizationId, beforeData: { name: current.name, contactEmail: current.contactEmail, contactMobile: current.contactMobile, supportPhone: current.merchantProfile.supportPhone }, afterData: { name: organization.name, contactEmail: organization.contactEmail, contactMobile: organization.contactMobile, supportPhone: organization.merchantProfile?.supportPhone } });
      return { id: organization.id, name: organization.name, contactEmail: maskEmail(organization.contactEmail), contactMobile: maskMobile(organization.contactMobile), supportPhone: maskMobile(organization.merchantProfile?.supportPhone) };
    });
  }

  async createFinanceAdjustment(organizationId: string, input: { amount: number; currency: string; reason: string; idempotencyKey: string }, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const merchant = await tx.organization.findFirst({ where: { id: organizationId, type: "MERCHANT" }, select: { id: true } });
      if (!merchant) throw notFound();
      const entry = await tx.merchantLedgerEntry.create({ data: { organizationId, type: "ADJUSTMENT", amount: input.amount, currency: input.currency, status: "POSTED", reference: `ADJ-${organizationId}-${input.idempotencyKey}`, metadata: asJson({ reason: input.reason }) } });
      await this.audit(tx, { ...actor, action: "finance.adjustment.created", resourceType: "MerchantLedgerEntry", resourceId: entry.id, targetOrganizationId: organizationId, afterData: { amount: entry.amount, currency: entry.currency, reason: input.reason, reference: entry.reference } });
      return entry;
    });
  }

  async updateSettlementStatus(organizationId: string, settlementId: string, status: SettlementStatus, notes: string | undefined, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.settlementBatch.findFirst({ where: { id: settlementId, organizationId } });
      if (!current) throw notFound();
      if (!canTransitionSettlement(current.status as SettlementStatus, status)) throw new DomainError("INVALID_STATE_TRANSITION", "تغییر وضعیت تسویه مجاز نیست", 409);
      const settlement = await tx.settlementBatch.update({ where: { id: settlementId }, data: { status, notes, approvedAt: status === "APPROVED" ? new Date() : undefined, paidAt: status === "PAID" ? new Date() : undefined } });
      await this.audit(tx, { ...actor, action: "settlement.status_changed", resourceType: "SettlementBatch", resourceId: settlement.id, targetOrganizationId: organizationId, beforeData: { status: current.status }, afterData: { status: settlement.status, notes: settlement.notes } });
      return settlement;
    });
  }

  async overrideBooking(orderId: string, bookingStatus: string, reason: string, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: orderId }, select: { id: true, bookingStatus: true, merchantOrganizationId: true } });
      if (!current) throw notFound();
      const order = await tx.order.update({ where: { id: orderId }, data: { bookingStatus } });
      await this.audit(tx, { ...actor, action: "booking.manual_override", resourceType: "Order", resourceId: order.id, targetOrganizationId: current.merchantOrganizationId ?? undefined, beforeData: { bookingStatus: current.bookingStatus }, afterData: { bookingStatus, reason } });
      return { id: order.id, bookingStatus: order.bookingStatus };
    });
  }

  async upsertMembership(organizationId: string, input: { userId: string; status: string }, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
      if (!organization) throw notFound();
      const previous = await tx.organizationMembership.findUnique({ where: { organizationId_userId: { organizationId, userId: input.userId } } });
      const membership = await tx.organizationMembership.upsert({ where: { organizationId_userId: { organizationId, userId: input.userId } }, create: { organizationId, userId: input.userId, status: input.status, invitedAt: new Date(), joinedAt: input.status === "ACTIVE" ? new Date() : undefined }, update: { status: input.status, joinedAt: input.status === "ACTIVE" && !previous?.joinedAt ? new Date() : undefined } });
      await this.audit(tx, { ...actor, action: previous ? "membership.updated" : "membership.created", resourceType: "OrganizationMembership", resourceId: membership.id, targetOrganizationId: organizationId, beforeData: previous ? { status: previous.status } : undefined, afterData: { userId: input.userId, status: membership.status } });
      return membership;
    });
  }

  async setMembershipRoles(organizationId: string, membershipId: string, roleCodes: string[], actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.organizationMembership.findFirst({ where: { id: membershipId, organizationId }, include: { organization: true, roles: { include: { role: true } } } });
      if (!membership) throw notFound();
      const expectedScope = membership.organization.type === "KIASHI_INTERNAL" ? "INTERNAL" : "MERCHANT";
      const roles = await tx.role.findMany({ where: { code: { in: roleCodes }, scope: expectedScope } });
      if (roles.length !== new Set(roleCodes).size) throw new DomainError("VALIDATION_ERROR", "یک یا چند نقش برای این سازمان معتبر نیست", 400);
      await tx.membershipRole.deleteMany({ where: { membershipId } });
      if (roles.length) await tx.membershipRole.createMany({ data: roles.map((role) => ({ membershipId, roleId: role.id })) });
      await this.audit(tx, { ...actor, action: "membership.roles_changed", resourceType: "OrganizationMembership", resourceId: membershipId, targetOrganizationId: organizationId, beforeData: { roles: membership.roles.map((entry) => entry.role.code) }, afterData: { roles: roles.map((role) => role.code) } });
      return { membershipId, roles: roles.map((role) => role.code) };
    });
  }

  async setRolePermissions(roleId: string, permissionCodes: string[], actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({ where: { id: roleId }, include: { permissions: { include: { permission: true } } } });
      if (!role) throw notFound();
      const permissions = await tx.permission.findMany({ where: { code: { in: permissionCodes } } });
      if (permissions.length !== new Set(permissionCodes).size) throw new DomainError("VALIDATION_ERROR", "یک یا چند مجوز معتبر نیست", 400);
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissions.length) await tx.rolePermission.createMany({ data: permissions.map((permission) => ({ roleId, permissionId: permission.id })) });
      await this.audit(tx, { ...actor, action: "role.permissions_changed", resourceType: "Role", resourceId: roleId, beforeData: { permissions: role.permissions.map((entry) => entry.permission.code) }, afterData: { permissions: permissions.map((permission) => permission.code) } });
      return { roleId, permissions: permissions.map((permission) => permission.code).sort() };
    });
  }

  async updateRefundStatus(refundId: string, status: "processing" | "failed", reason: string, actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.refundRequest.findUnique({ where: { id: refundId }, include: { order: { select: { merchantOrganizationId: true } } } });
      if (!current) throw notFound();
      if (!["requested", "processing"].includes(current.status)) throw new DomainError("INVALID_STATE_TRANSITION", "وضعیت استرداد قابل تغییر نیست", 409);
      const refund = await tx.refundRequest.update({ where: { id: refundId }, data: { status, reason } });
      await this.audit(tx, { ...actor, action: "refund.admin_status_changed", resourceType: "RefundRequest", resourceId: refundId, targetOrganizationId: current.order.merchantOrganizationId ?? undefined, beforeData: { status: current.status, reason: current.reason }, afterData: { status: refund.status, reason: refund.reason } });
      return { id: refund.id, status: refund.status, updatedAt: refund.updatedAt };
    });
  }

  async updateSupportStatus(ticketId: string, status: "open" | "pending" | "resolved" | "closed", actor: AuditActor) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.supportTicket.findUnique({ where: { id: ticketId } });
      if (!current) throw notFound();
      const ticket = await tx.supportTicket.update({ where: { id: ticketId }, data: { status } });
      await this.audit(tx, { ...actor, action: "support.status_changed", resourceType: "SupportTicket", resourceId: ticketId, beforeData: { status: current.status }, afterData: { status: ticket.status } });
      return { id: ticket.id, status: ticket.status, updatedAt: ticket.updatedAt };
    });
  }

  async addSupportInternalNote(ticketId:string,note:string,actor:AuditActor){return this.prisma.$transaction(async tx=>{const current=await tx.supportTicket.findUnique({where:{id:ticketId}});if(!current)throw notFound();const message=await tx.supportMessage.create({data:{ticketId,authorType:"support",authorUserId:actor.userId,body:note,internal:true}});await this.audit(tx,{...actor,action:"support.internal_note_added",resourceType:"SupportTicket",resourceId:ticketId,targetOrganizationId:current.organizationId??undefined,afterData:{messageId:message.id}});return message;});}

  private orderWhere(filters: OrderFilters): Prisma.OrderWhereInput {
    return {
      createdAt: { gte: filters.from, lt: filters.to },
      serviceType: filters.serviceType,
      paymentStatus: filters.paymentStatus,
      bookingStatus: filters.bookingStatus,
      merchantOrganizationId: filters.merchantOrganizationId,
      providerName: filters.provider,
      orderNumber: filters.orderNumber ? { contains: filters.orderNumber, mode: "insensitive" } : undefined,
      trackingCode: filters.trackingCode ? { contains: filters.trackingCode, mode: "insensitive" } : undefined,
      ...(filters.query?{OR:[{orderNumber:{contains:filters.query,mode:"insensitive"}},{trackingCode:{contains:filters.query,mode:"insensitive"}},{guestMobile:{contains:filters.query}}]}:{}),
    };
  }
}
