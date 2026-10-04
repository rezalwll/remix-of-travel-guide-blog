import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PlatformRepository, type AuditActor } from "../repositories/platform.js";

const databaseUrl = process.env.DATABASE_URL_TEST;
const integration = describe.skipIf(!databaseUrl);
const prisma = new PrismaClient({ datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined });
const repository = new PlatformRepository(prisma);

integration("platform database isolation and integrity", () => {
  const marker = randomUUID().slice(0, 8);
  const ids = {
    internal: randomUUID(),
    merchantA: randomUUID(),
    merchantB: randomUUID(),
    actor: randomUUID(),
    merchantUserA: randomUUID(),
    merchantUserB: randomUUID(),
    customer: randomUUID(),
    membershipA: randomUUID(),
    membershipB: randomUUID(),
    role: randomUUID(),
    internalRole: randomUUID(),
    orderA: randomUUID(),
    orderB: randomUUID(),
    checkoutA: randomUUID(),
    checkoutB: randomUUID(),
    settlementA: randomUUID(),
    settlementB: randomUUID(),
    ticket: randomUUID(),
    refund: randomUUID(),
  };
  const now = new Date();
  const range = { from: new Date(now.getTime() - 86_400_000), to: new Date(now.getTime() + 86_400_000) };
  const actor: AuditActor = { userId: ids.actor, organizationId: ids.internal, requestId: `integration-${marker}`, ipAddress: "127.0.0.1", userAgent: "vitest" };

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.organization.createMany({ data: [
      { id: ids.internal, type: "KIASHI_INTERNAL", name: `Internal ${marker}`, slug: `internal-${marker}` },
      { id: ids.merchantA, type: "MERCHANT", name: `Merchant A ${marker}`, slug: `merchant-a-${marker}` },
      { id: ids.merchantB, type: "MERCHANT", name: `Merchant B ${marker}`, slug: `merchant-b-${marker}` },
    ] });
    await prisma.merchantProfile.createMany({ data: [
      { organizationId: ids.merchantA, merchantCode: `A_${marker}`, businessType: "HOTEL" },
      { organizationId: ids.merchantB, merchantCode: `B_${marker}`, businessType: "TOUR_OPERATOR" },
    ] });
    await prisma.user.createMany({ data: [
      { id: ids.actor, mobile: `0900${marker.replace(/\D/g, "").padEnd(7, "0").slice(0, 7)}`, firstName: "Internal", lastName: marker },
      { id: ids.merchantUserA, mobile: `0901${marker.replace(/\D/g, "").padEnd(7, "1").slice(0, 7)}`, firstName: "Merchant A", lastName: marker },
      { id: ids.merchantUserB, mobile: `0902${marker.replace(/\D/g, "").padEnd(7, "2").slice(0, 7)}`, firstName: "Merchant B", lastName: marker },
      { id: ids.customer, mobile: `0903${marker.replace(/\D/g, "").padEnd(7, "3").slice(0, 7)}`, firstName: "Customer", lastName: marker },
    ] });
    const permission = await prisma.permission.upsert({ where: { code: "merchant.orders.read" }, update: {}, create: { code: "merchant.orders.read" } });
    const dashboard = await prisma.permission.upsert({ where: { code: "merchant.dashboard.view" }, update: {}, create: { code: "merchant.dashboard.view" } });
    await prisma.role.create({ data: { id: ids.role, code: `TEST_MERCHANT_${marker}`, name: "Test merchant", scope: "MERCHANT", permissions: { create: [{ permissionId: permission.id }, { permissionId: dashboard.id }] } } });
    await prisma.role.create({ data: { id: ids.internalRole, code: `TEST_INTERNAL_${marker}`, name: "Test internal", scope: "INTERNAL", permissions: { create: [{ permissionId: permission.id }] } } });
    await prisma.organizationMembership.createMany({ data: [
      { id: ids.membershipA, organizationId: ids.merchantA, userId: ids.merchantUserA, status: "ACTIVE", joinedAt: now },
      { id: ids.membershipB, organizationId: ids.merchantB, userId: ids.merchantUserB, status: "ACTIVE", joinedAt: now },
      { organizationId: ids.internal, userId: ids.actor, status: "ACTIVE", joinedAt: now },
    ] });
    await prisma.membershipRole.createMany({ data: [{ membershipId: ids.membershipA, roleId: ids.role }, { membershipId: ids.membershipB, roleId: ids.role }] });
    await prisma.checkoutSession.createMany({ data: [
      { id: ids.checkoutA, userId: ids.customer, serviceType: "hotel", status: "completed", service: {}, buyer: { name: "Customer", mobile: "09121234567" }, travelers: [], addOns: [], pricing: { total: 100_000 }, total: 100_000, expiresAt: range.to },
      { id: ids.checkoutB, userId: ids.customer, serviceType: "tour", status: "completed", service: {}, buyer: { name: "Customer B", mobile: "09129876543" }, travelers: [], addOns: [], pricing: { total: 200_000 }, total: 200_000, expiresAt: range.to },
    ] });
    await prisma.order.createMany({ data: [
      { id: ids.orderA, userId: ids.customer, checkoutSessionId: ids.checkoutA, merchantOrganizationId: ids.merchantA, orderNumber: `KIA-A-${marker}`, trackingCode: `TRK-A-${marker}`, serviceType: "hotel", summary: { title: "A" }, buyer: { name: "Customer", mobile: "09121234567" }, travelers: [], serviceSnapshot: {}, pricingSnapshot: {}, paymentSnapshot: {}, total: 100_000, paymentStatus: "paid", bookingStatus: "confirmed" },
      { id: ids.orderB, userId: ids.customer, checkoutSessionId: ids.checkoutB, merchantOrganizationId: ids.merchantB, orderNumber: `KIA-B-${marker}`, trackingCode: `TRK-B-${marker}`, serviceType: "tour", summary: { title: "B" }, buyer: { name: "Customer B", mobile: "09129876543" }, travelers: [], serviceSnapshot: {}, pricingSnapshot: {}, paymentSnapshot: {}, total: 200_000, paymentStatus: "paid", bookingStatus: "confirmed" },
    ] });
    await prisma.settlementBatch.createMany({ data: [
      { id: ids.settlementA, organizationId: ids.merchantA, periodStart: range.from, periodEnd: range.to, grossAmount: 100_000, commissionAmount: 10_000, payableAmount: 90_000, status: "DRAFT" },
      { id: ids.settlementB, organizationId: ids.merchantB, periodStart: range.from, periodEnd: range.to, grossAmount: 200_000, commissionAmount: 20_000, payableAmount: 180_000, status: "DRAFT" },
    ] });
    await prisma.merchantLedgerEntry.createMany({ data: [
      { organizationId: ids.merchantA, orderId: ids.orderA, type: "MERCHANT_PAYABLE", amount: 90_000, reference: `PAYABLE-A-${marker}` },
      { organizationId: ids.merchantB, orderId: ids.orderB, type: "MERCHANT_PAYABLE", amount: 180_000, reference: `PAYABLE-B-${marker}` },
    ] });
    await prisma.supportTicket.create({ data: { id: ids.ticket, userId: ids.customer, subject: `Ticket ${marker}` } });
    await prisma.refundRequest.create({ data: { id: ids.refund, orderId: ids.orderA, userId: ids.customer, amount: 10_000, onlineAmount: 10_000, reason: "test", destination: "original_payment" } });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it("derives tenant context from active membership, not the requested id", async () => {
    expect((await repository.accessContext(ids.merchantUserA, "MERCHANT", ids.merchantA))?.organization.id).toBe(ids.merchantA);
    expect(await repository.accessContext(ids.merchantUserA, "MERCHANT", ids.merchantB)).toBeNull();
    expect(await repository.accessContext(ids.customer, "MERCHANT", ids.merchantA)).toBeNull();
  });

  it("isolates list, detail, team, finance, settlement and report queries", async () => {
    const page = { page: 1, perPage: 20 };
    const orders = await repository.listMerchantOrders(ids.merchantA, range, page);
    expect(orders.items.map((order) => order.id)).toEqual([ids.orderA]);
    await expect(repository.getMerchantOrder(ids.merchantA, ids.orderB)).rejects.toMatchObject({ statusCode: 404 });
    expect((await repository.listMerchantTeam(ids.merchantA, page)).items.every((membership) => membership.id !== ids.membershipB)).toBe(true);
    expect((await repository.merchantFinanceSummary(ids.merchantA, range)).ledger).toEqual(expect.arrayContaining([expect.objectContaining({ amount: 90_000 })]));
    expect((await repository.listMerchantSettlements(ids.merchantA, page)).items.map((settlement) => settlement.id)).toEqual([ids.settlementA]);
    expect((await repository.reportSummary(range, ids.merchantA)).totals.orders).toBe(1);
  });

  it("keeps merchant support tenant-scoped and hides internal notes from the merchant view", async () => {
    await prisma.supportTicket.update({ where: { id: ids.ticket }, data: { organizationId: ids.merchantA } });
    await prisma.supportMessage.create({ data: { ticketId: ids.ticket, authorType: "merchant", authorUserId: ids.merchantUserA, body: "پیام قابل مشاهده", internal: false } });
    await repository.addSupportInternalNote(ids.ticket, "یادداشت محرمانه عملیات", actor);
    expect((await repository.listMerchantSupport(ids.merchantA, { page: 1, perPage: 20 })).items.map((item) => item.id)).toContain(ids.ticket);
    expect((await repository.listMerchantSupport(ids.merchantB, { page: 1, perPage: 20 })).items.map((item) => item.id)).not.toContain(ids.ticket);
    const merchantTicket = await repository.getMerchantSupport(ids.merchantA, ids.ticket);
    expect(merchantTicket.messages.map((message) => message.body)).toEqual(["پیام قابل مشاهده"]);
    expect(JSON.stringify(merchantTicket)).not.toContain("یادداشت محرمانه عملیات");
    await expect(repository.getMerchantSupport(ids.merchantB, ids.ticket)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("records every sensitive mutation in the immutable audit stream", async () => {
    await repository.updateOwnMerchantProfile(ids.merchantA, { name: `Merchant A updated ${marker}` }, { ...actor, organizationId: ids.merchantA, userId: ids.merchantUserA });
    const adjustment = await repository.createFinanceAdjustment(ids.merchantA, { amount: 5_000, currency: "TOMAN", reason: "integration fixture", idempotencyKey: marker }, actor);
    await repository.updateSettlementStatus(ids.merchantA, ids.settlementA, "READY", "integration fixture", actor);
    await repository.overrideBooking(ids.orderA, "manual_review_required", "integration fixture", actor);
    await repository.setMembershipRoles(ids.merchantA, ids.membershipA, [`TEST_MERCHANT_${marker}`], actor);
    await repository.setRolePermissions(ids.internalRole, ["merchant.dashboard.view"], actor);
    await repository.updateRefundStatus(ids.refund, "processing", "integration review", actor);
    await repository.updateSupportStatus(ids.ticket, "pending", actor);
    const actions = await prisma.auditLog.findMany({ where: { requestId: actor.requestId }, select: { action: true } });
    expect(actions.map((entry) => entry.action)).toEqual(expect.arrayContaining(["merchant.profile_updated", "finance.adjustment.created", "settlement.status_changed", "booking.manual_override", "membership.roles_changed", "role.permissions_changed", "refund.admin_status_changed", "support.status_changed"]));

    const audit = await prisma.auditLog.findFirstOrThrow({ where: { requestId: actor.requestId } });
    await expect(prisma.auditLog.update({ where: { id: audit.id }, data: { action: "tampered" } })).rejects.toThrow();
    await expect(prisma.auditLog.delete({ where: { id: audit.id } })).rejects.toThrow();
    await expect(prisma.merchantLedgerEntry.update({ where: { id: adjustment.id }, data: { amount: 999_999 } })).rejects.toThrow();
    await expect(prisma.merchantLedgerEntry.delete({ where: { id: adjustment.id } })).rejects.toThrow();
  });

  it("enforces unique membership and settlement state transitions", async () => {
    await expect(prisma.organizationMembership.create({ data: { organizationId: ids.merchantA, userId: ids.merchantUserA } })).rejects.toMatchObject({ code: "P2002" });
    await expect(repository.updateSettlementStatus(ids.merchantA, ids.settlementA, "PAID", undefined, actor)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("rejects changing the last active merchant owner and permits it after a second owner is active", async () => {
    const organizationId = randomUUID();
    const firstUserId = randomUUID();
    const secondUserId = randomUUID();
    const firstMembershipId = randomUUID();
    const secondMembershipId = randomUUID();
    const ownerRole = await prisma.role.upsert({ where: { code: "MERCHANT_OWNER" }, update: {}, create: { code: "MERCHANT_OWNER", name: "مالک پذیرنده", scope: "MERCHANT" } });
    await prisma.organization.create({ data: { id: organizationId, type: "MERCHANT", name: `Owner safety ${marker}`, slug: `owner-safety-${marker}` } });
    await prisma.user.createMany({ data: [
      { id: firstUserId, mobile: `0930${marker.replace(/\D/g, "").padEnd(7, "4").slice(0, 7)}`, firstName: "First", lastName: "Owner" },
      { id: secondUserId, mobile: `0931${marker.replace(/\D/g, "").padEnd(7, "5").slice(0, 7)}`, firstName: "Second", lastName: "Owner" },
    ] });
    await prisma.organizationMembership.create({ data: { id: firstMembershipId, organizationId, userId: firstUserId, status: "ACTIVE", roles: { create: { roleId: ownerRole.id } } } });

    await expect(repository.updateMembershipStatus(organizationId, firstMembershipId, "SUSPENDED", actor)).rejects.toMatchObject({ code: "LAST_OWNER_REQUIRED", statusCode: 409 });
    await expect(repository.setMembershipRoles(organizationId, firstMembershipId, [`TEST_MERCHANT_${marker}`], actor)).rejects.toMatchObject({ code: "LAST_OWNER_REQUIRED", statusCode: 409 });

    await prisma.organizationMembership.create({ data: { id: secondMembershipId, organizationId, userId: secondUserId, status: "ACTIVE", roles: { create: { roleId: ownerRole.id } } } });
    await expect(repository.setMembershipRoles(organizationId, firstMembershipId, [`TEST_MERCHANT_${marker}`], actor)).resolves.toMatchObject({ membershipId: firstMembershipId, roles: [`TEST_MERCHANT_${marker}`] });
    expect(await prisma.auditLog.count({ where: { requestId: actor.requestId, resourceId: firstMembershipId, action: "membership.roles_changed" } })).toBeGreaterThan(0);
  });
});
