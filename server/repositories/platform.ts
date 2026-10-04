import { Prisma, PrismaClient } from "@prisma/client";
import { DomainError, notFound } from "../domain/errors.js";
import { canTransitionSettlement, type SettlementStatus } from "../platform/finance.js";
import { maskEmail, maskIdentifier, maskMobile, toMerchantOrderDto } from "../platform/privacy.js";
import { reportingTimezone } from "../platform/reporting.js";
import { sanitizeProviderPayload } from "../providers/redaction.js";

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

  async listBackofficeOrders(filters: OrderFilters, page: PageInput) {
    const where = this.orderWhere(filters);
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({ where, select: orderSelect, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.order.count({ where }),
    ]);
    return { items: items.map((item) => { const buyer=item.buyer&&typeof item.buyer==="object"&&!Array.isArray(item.buyer)?item.buyer as Record<string,unknown>:{};return { ...item, customer:{name:`${buyer.firstName??""} ${buyer.lastName??""}`.trim()||"مشتری",mobile:maskMobile(item.guestMobile)},guestMobile: maskMobile(item.guestMobile), buyer: undefined, travelers: undefined }; }), total };
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

  async getSupport(id:string){const ticket=await this.prisma.supportTicket.findUnique({where:{id},include:{user:{select:{id:true,firstName:true,lastName:true,mobile:true}},order:{select:{id:true,orderNumber:true,trackingCode:true,serviceType:true}},organization:{select:{id:true,name:true}},messages:{orderBy:{createdAt:"asc"},select:{id:true,authorType:true,body:true,internal:true,createdAt:true}}}});if(!ticket)throw notFound();return{...ticket,user:ticket.user?{...ticket.user,mobile:maskMobile(ticket.user.mobile)}:null};}

  async customerLookup(query:string,actor:AuditActor){const normalized=query.trim();const users=await this.prisma.user.findMany({where:{OR:[{mobile:{contains:normalized}},{firstName:{contains:normalized,mode:"insensitive"}},{lastName:{contains:normalized,mode:"insensitive"}},{orders:{some:{OR:[{orderNumber:{contains:normalized,mode:"insensitive"}},{trackingCode:{contains:normalized,mode:"insensitive"}}]}}}]},take:20,include:{wallet:{select:{balance:true,currency:true}},orders:{orderBy:{createdAt:"desc"},take:20,select:{id:true,orderNumber:true,trackingCode:true,serviceType:true,total:true,paymentStatus:true,bookingStatus:true,relevantDate:true,createdAt:true}},refunds:{orderBy:{createdAt:"desc"},take:10,select:{id:true,orderId:true,amount:true,status:true,createdAt:true}},supportTickets:{orderBy:{updatedAt:"desc"},take:10,select:{id:true,subject:true,status:true,updatedAt:true}},visaApplications:{orderBy:{updatedAt:"desc"},take:10,select:{id:true,country:true,status:true,updatedAt:true}}}});await this.prisma.auditLog.create({data:{actorUserId:actor.userId,actorOrganizationId:actor.organizationId,action:"customer.lookup",resourceType:"User",requestId:actor.requestId,ipAddress:actor.ipAddress,userAgent:actor.userAgent?.slice(0,500),metadata:asJson({queryType:/^09\d{9}$/.test(normalized)?"mobile":"general",resultCount:users.length})}});return users.map(user=>({id:user.id,identity:{name:`${user.firstName} ${user.lastName}`.trim(),mobile:maskMobile(user.mobile),email:maskEmail(user.email),nationalId:maskIdentifier(user.nationalId)},wallet:user.wallet,orders:user.orders,refunds:user.refunds,support:user.supportTickets,visaApplications:user.visaApplications}));}

  async createMerchantSupport(organizationId:string,userId:string,input:{subject:string;body:string;category:string;orderId?:string}){if(input.orderId&&!await this.prisma.order.findFirst({where:{id:input.orderId,merchantOrganizationId:organizationId},select:{id:true}}))throw notFound("سفارش سازمان پیدا نشد");return this.prisma.supportTicket.create({data:{organizationId,orderId:input.orderId,category:input.category,subject:input.subject,messages:{create:{authorType:"merchant",authorUserId:userId,body:input.body}}},include:{messages:true}});}

  async operationsQueue(organizationId?:string){const start=new Date();start.setUTCHours(0,0,0,0);const end=new Date(start.getTime()+86_400_000);const orderScope=organizationId?{merchantOrganizationId:organizationId}:{};const[arrivals,manualReview,refunds,support,lowInventory]=await Promise.all([this.prisma.order.findMany({where:{...orderScope,serviceType:"hotel",relevantDate:{gte:start,lt:end},bookingStatus:{not:"confirmed"}},select:{id:true,orderNumber:true,bookingStatus:true,relevantDate:true,property:{select:{name:true}}},take:30}),this.prisma.order.findMany({where:{...orderScope,bookingStatus:"manual_review_required"},select:{id:true,orderNumber:true,serviceType:true,createdAt:true},take:30}),this.prisma.refundRequest.findMany({where:{status:"requested",...(organizationId?{order:{merchantOrganizationId:organizationId}}:{})},select:{id:true,amount:true,order:{select:{orderNumber:true,serviceType:true}}},take:30}),this.prisma.supportTicket.findMany({where:{status:{in:["open","pending"]},...(organizationId?{organizationId}: {})},select:{id:true,subject:true,status:true,updatedAt:true},take:30}),this.prisma.dailyInventory.findMany({where:{date:{gte:start,lt:new Date(start.getTime()+14*86_400_000)},availableRooms:{lte:1},ratePlan:{roomType:{property:{organizationId}}}},select:{id:true,date:true,availableRooms:true,ratePlan:{select:{title:true,roomType:{select:{name:true,property:{select:{id:true,name:true}}}}}}},take:30})]);return{todayArrivalIssues:arrivals,manualReview,refundRequested:refunds,supportWaiting:support,lowAvailability:lowInventory};}

  async listMerchants(page: PageInput, status?: string, businessType?: string) {
    const where: Prisma.OrganizationWhereInput = { type: "MERCHANT", ...(status ? { status } : {}), ...(businessType ? { merchantProfile: { businessType } } : {}) };
    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({ where, select: { id: true, name: true, legalName: true, slug: true, status: true, contactEmail: true, contactMobile: true, createdAt: true, updatedAt: true, merchantProfile: { select: { merchantCode: true, businessType: true, onboardingStatus: true, contractStatus: true, settlementStatus: true } }, _count: { select: { memberships: true, merchantOrders: true } } }, orderBy: { createdAt: "desc" }, skip: (page.page - 1) * page.perPage, take: page.perPage }),
      this.prisma.organization.count({ where }),
    ]);
    return { items: items.map((item) => ({ ...item, contactEmail: maskEmail(item.contactEmail), contactMobile: maskMobile(item.contactMobile) })), total };
  }

  async getMerchant(id: string) {
    const merchant = await this.prisma.organization.findFirst({ where: { id, type: "MERCHANT" }, select: { id: true, name: true, legalName: true, slug: true, status: true, contactEmail: true, contactMobile: true, metadata: true, createdAt: true, updatedAt: true, merchantProfile: true, _count: { select: { memberships: true, merchantOrders: true, settlements: true } } } });
    if (!merchant) throw notFound();
    return { ...merchant, merchantProfile: merchant.merchantProfile ? { ...merchant.merchantProfile, legalIdentifier: maskIdentifier(merchant.merchantProfile.legalIdentifier), taxIdentifier: maskIdentifier(merchant.merchantProfile.taxIdentifier) } : null };
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
