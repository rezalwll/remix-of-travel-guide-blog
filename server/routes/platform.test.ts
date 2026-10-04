import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app.js";
import type { PrismaRuntimeRepository } from "../repositories/prisma-runtime.js";
import type { PlatformAccessContext } from "../repositories/platform.js";
import type { PlatformRepository } from "../repositories/platform.js";

const orgA = "10000000-0000-4000-8000-000000000001";
const orgB = "10000000-0000-4000-8000-000000000002";
const userId = "20000000-0000-4000-8000-000000000001";

const baseContext = (permissions: string[], organizationId = orgA, scope: "INTERNAL" | "MERCHANT" = "MERCHANT"): PlatformAccessContext => ({
  membershipId: "30000000-0000-4000-8000-000000000001",
  user: { id: userId, mobile: "09120000001", firstName: "کاربر", lastName: "نمونه", email: "demo@example.test" },
  organization: { id: organizationId, type: scope === "INTERNAL" ? "KIASHI_INTERNAL" : "MERCHANT", name: "سازمان نمونه", slug: "demo", status: "ACTIVE" },
  roles: [scope === "INTERNAL" ? "OPERATIONS" : "MERCHANT_OWNER"],
  permissions,
});

function mocks(access: (user: string, scope: "INTERNAL" | "MERCHANT", requested?: string) => PlatformAccessContext | null) {
  const runtime = { userFromSession: vi.fn(async () => ({ id: userId })) } as unknown as PrismaRuntimeRepository;
  const platform = {
    accessContext: vi.fn(async (user: string, scope: "INTERNAL" | "MERCHANT", requested?: string) => access(user, scope, requested)),
    listMerchantOrders: vi.fn(async () => ({ items: [], total: 0 })),
    listServiceOperations: vi.fn(async () => ({ items: [], total: 0 })),
    getMerchantOrder: vi.fn(async (_organizationId, id) => ({ id })),
    listMerchantBookings: vi.fn(async () => ({ items: [], total: 0 })),
    merchantFinanceSummary: vi.fn(async () => ({ ledger: [], settlements: {} })),
    listMerchantSettlements: vi.fn(async () => ({ items: [], total: 0 })),
    listMerchantTeam: vi.fn(async () => ({ items: [], total: 0 })),
    getMerchantProfile: vi.fn(async () => ({ id: orgA })),
    updateOwnMerchantProfile: vi.fn(async (organizationId, input) => ({ id: organizationId, ...input })),
    setMembershipRoles: vi.fn(async (organizationId, membershipId, roles) => ({ organizationId, membershipId, roles })),
    reportSummary: vi.fn(async () => ({ totals: { orders: 0 }, series: [] })),
    listMerchants: vi.fn(async () => ({ items: [], total: 0 })),
    createMerchant: vi.fn(async (input, actor) => ({ id: orgB, ...input, auditActor: actor.userId })),
  } as unknown as PlatformRepository;
  return { runtime, platform };
}

const apps: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => { await Promise.all(apps.splice(0).map((app) => app.close())); });

async function appWith(runtime: PrismaRuntimeRepository, platform: PlatformRepository, enabled = true) {
  const app = await buildApp({ repository: runtime, platformRepository: platform, env: { NODE_ENV: "test", BACKOFFICE_ENABLED: enabled, MERCHANT_PORTAL_ENABLED: enabled, WEB_ORIGIN: "http://localhost:8080" } });
  apps.push(app);
  return app;
}

const auth = { cookie: "kiashi_session=test-session" };

describe("platform API authorization", () => {
  it("returns 401 without identity and 403 for a customer without membership", async () => {
    const { runtime, platform } = mocks(() => null);
    const app = await appWith(runtime, platform);
    expect((await app.inject({ method: "GET", url: "/api/backoffice/me" })).statusCode).toBe(401);
    expect((await app.inject({ method: "GET", url: "/api/merchant/me", headers: auth })).statusCode).toBe(403);
  });

  it("fails closed when a production-facing panel flag is disabled", async () => {
    const { runtime, platform } = mocks(() => baseContext(["backoffice.dashboard.view"], orgA, "INTERNAL"));
    const app = await appWith(runtime, platform, false);
    expect((await app.inject({ method: "GET", url: "/api/backoffice/me", headers: auth })).statusCode).toBe(404);
    expect(platform.accessContext).not.toHaveBeenCalled();
  });

  it("enforces merchant tenant selection through DB membership and hides another tenant", async () => {
    const { runtime, platform } = mocks((_user, scope, requested) => scope === "MERCHANT" && (!requested || requested === orgA) ? baseContext(["merchant.dashboard.view", "merchant.orders.read"]) : null);
    const app = await appWith(runtime, platform);
    const own = await app.inject({ method: "GET", url: "/api/merchant/orders", headers: { ...auth, "x-organization-id": orgA } });
    expect(own.statusCode).toBe(200);
    expect(platform.listMerchantOrders).toHaveBeenCalledWith(orgA, expect.any(Object), expect.any(Object));
    vi.mocked(platform.listMerchantOrders).mockClear();
    const other = await app.inject({ method: "GET", url: "/api/merchant/orders", headers: { ...auth, "x-organization-id": orgB } });
    expect(other.statusCode).toBe(403);
    expect(platform.listMerchantOrders).not.toHaveBeenCalled();
  });

  it("never accepts a tenant id from the resource URL for merchant detail", async () => {
    const { runtime, platform } = mocks(() => baseContext(["merchant.orders.read"]));
    const app = await appWith(runtime, platform);
    const orderId = "40000000-0000-4000-8000-000000000001";
    expect((await app.inject({ method: "GET", url: `/api/merchant/orders/${orderId}`, headers: auth })).statusCode).toBe(200);
    expect(platform.getMerchantOrder).toHaveBeenCalledWith(orgA, orderId);
  });

  it("scopes every merchant data surface to the authorized organization", async () => {
    const permissions = ["merchant.dashboard.view", "merchant.orders.read", "merchant.bookings.read", "merchant.finance.view", "merchant.settlements.read", "merchant.team.read"];
    const { runtime, platform } = mocks((_user, scope, requested) => scope === "MERCHANT" && (!requested || requested === orgA) ? baseContext(permissions) : null);
    const app = await appWith(runtime, platform);
    const cases = [
      ["/api/merchant/dashboard/summary", "reportSummary"],
      ["/api/merchant/bookings", "listMerchantBookings"],
      ["/api/merchant/finance/summary", "merchantFinanceSummary"],
      ["/api/merchant/settlements", "listMerchantSettlements"],
      ["/api/merchant/team", "listMerchantTeam"],
      ["/api/merchant/profile", "getMerchantProfile"],
    ] as const;
    for (const [url, method] of cases) {
      const response = await app.inject({ method: "GET", url, headers: { ...auth, "x-organization-id": orgA } });
      expect(response.statusCode).toBe(200);
      expect(platform[method]).toHaveBeenCalled();
      expect(vi.mocked(platform[method]).mock.calls[0]).toContain(orgA);
      vi.mocked(platform[method]).mockClear();
      const denied = await app.inject({ method: "GET", url, headers: { ...auth, "x-organization-id": orgB } });
      expect(denied.statusCode).toBe(403);
      expect(platform[method]).not.toHaveBeenCalled();
    }
  });

  it("separates finance, operations, and team permissions", async () => {
    const finance = mocks(() => baseContext(["merchant.dashboard.view", "merchant.finance.view", "merchant.settlements.read"]));
    const financeApp = await appWith(finance.runtime, finance.platform);
    expect((await financeApp.inject({ method: "GET", url: "/api/merchant/finance/summary", headers: auth })).statusCode).toBe(200);
    expect((await financeApp.inject({ method: "GET", url: "/api/merchant/team", headers: auth })).statusCode).toBe(403);

    const operator = mocks(() => baseContext(["merchant.dashboard.view", "merchant.orders.read", "merchant.bookings.read"]));
    const operatorApp = await appWith(operator.runtime, operator.platform);
    expect((await operatorApp.inject({ method: "GET", url: "/api/merchant/orders", headers: auth })).statusCode).toBe(200);
    expect((await operatorApp.inject({ method: "GET", url: "/api/merchant/finance/summary", headers: auth })).statusCode).toBe(403);
  });

  it("scopes merchant profile and team mutations to the authorized tenant", async () => {
    const permissions = ["merchant.dashboard.view", "merchant.profile.manage", "merchant.team.manage"];
    const { runtime, platform } = mocks((_user, scope, requested) => scope === "MERCHANT" && (!requested || requested === orgA) ? baseContext(permissions) : null);
    const app = await appWith(runtime, platform);
    const profile = await app.inject({ method: "PATCH", url: "/api/merchant/profile", headers: { ...auth, origin: "http://localhost:8080" }, payload: { name: "نام تازه نمونه" } });
    expect(profile.statusCode).toBe(200);
    expect(platform.updateOwnMerchantProfile).toHaveBeenCalledWith(orgA, expect.objectContaining({ name: "نام تازه نمونه" }), expect.objectContaining({ userId }));
    const membershipId = "30000000-0000-4000-8000-000000000099";
    const roles = await app.inject({ method: "PUT", url: `/api/merchant/team/${membershipId}/roles`, headers: { ...auth, origin: "http://localhost:8080" }, payload: { roles: ["MERCHANT_OPERATOR"] } });
    expect(roles.statusCode).toBe(200);
    expect(platform.setMembershipRoles).toHaveBeenCalledWith(orgA, membershipId, ["MERCHANT_OPERATOR"], expect.objectContaining({ userId }));
    vi.mocked(platform.updateOwnMerchantProfile).mockClear();
    expect((await app.inject({ method: "PATCH", url: "/api/merchant/profile", headers: { ...auth, "x-organization-id": orgB }, payload: { name: "غیرمجاز" } })).statusCode).toBe(403);
    expect(platform.updateOwnMerchantProfile).not.toHaveBeenCalled();
  });

  it("keeps merchant users out of internal APIs", async () => {
    const { runtime, platform } = mocks((_user, scope) => scope === "MERCHANT" ? baseContext(["merchant.dashboard.view"]) : null);
    const app = await appWith(runtime, platform);
    expect((await app.inject({ method: "GET", url: "/api/backoffice/merchants", headers: auth })).statusCode).toBe(403);
  });

  it("protects all provider-driven service operation views with internal order access", async () => {
    const { runtime, platform } = mocks((_user, scope) => scope === "INTERNAL" ? baseContext(["backoffice.orders.read"], orgA, "INTERNAL") : null);
    const app = await appWith(runtime, platform);
    for (const service of ["flight", "train", "bus", "insurance", "cip", "transfer"]) {
      const response = await app.inject({ method: "GET", url: `/api/backoffice/operations/${service}?preset=7d`, headers: auth });
      expect(response.statusCode).toBe(200);
      expect(platform.listServiceOperations).toHaveBeenLastCalledWith(service, expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }), expect.any(Object));
    }
    expect((await app.inject({ method: "GET", url: "/api/backoffice/operations/manual-flight", headers: auth })).statusCode).toBe(400);
  });

  it("denies provider operations without order read permission", async () => {
    const { runtime, platform } = mocks((_user, scope) => scope === "INTERNAL" ? baseContext(["backoffice.dashboard.view"], orgA, "INTERNAL") : null);
    const app = await appWith(runtime, platform);
    expect((await app.inject({ method: "GET", url: "/api/backoffice/operations/flight", headers: auth })).statusCode).toBe(403);
    expect(platform.listServiceOperations).not.toHaveBeenCalled();
  });

  it("allows internal reads but denies role management without its permission", async () => {
    const { runtime, platform } = mocks((_user, scope) => scope === "INTERNAL" ? baseContext(["backoffice.dashboard.view", "backoffice.merchants.read"], orgA, "INTERNAL") : null);
    const app = await appWith(runtime, platform);
    expect((await app.inject({ method: "GET", url: "/api/backoffice/merchants", headers: auth })).statusCode).toBe(200);
    const denied = await app.inject({ method: "PUT", url: `/api/backoffice/merchants/${orgB}/memberships`, headers: auth, payload: { userId, status: "ACTIVE" } });
    expect(denied.statusCode).toBe(403);
  });

  it("rejects cross-site mutations before writing and adds private cache headers", async () => {
    const { runtime, platform } = mocks((_user, scope) => scope === "INTERNAL" ? baseContext(["backoffice.dashboard.view", "backoffice.merchants.manage"], orgA, "INTERNAL") : null);
    const app = await appWith(runtime, platform);
    const payload = { name: "هتل نمایشی", slug: "demo-hotel", merchantCode: "DEMO_HOTEL", businessType: "HOTEL" };
    const denied = await app.inject({ method: "POST", url: "/api/backoffice/merchants", headers: { ...auth, origin: "https://attacker.test", "sec-fetch-site": "cross-site" }, payload });
    expect(denied.statusCode).toBe(403);
    expect(platform.createMerchant).not.toHaveBeenCalled();
    const allowed = await app.inject({ method: "POST", url: "/api/backoffice/merchants", headers: { ...auth, origin: "http://localhost:8080", "sec-fetch-site": "same-origin" }, payload });
    expect(allowed.statusCode).toBe(201);
    expect(allowed.headers["cache-control"]).toContain("no-store");
    expect(platform.createMerchant).toHaveBeenCalledWith(expect.objectContaining({ slug: "demo-hotel" }), expect.objectContaining({ userId }));
  });
});
