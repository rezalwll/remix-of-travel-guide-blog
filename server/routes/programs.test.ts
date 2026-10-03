import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app.js";
import type { PrismaRuntimeRepository } from "../repositories/prisma-runtime.js";
import type { PlatformAccessContext, PlatformRepository } from "../repositories/platform.js";
import type { ProgramRepository } from "../repositories/programs.js";

const orgA = "10000000-0000-4000-8000-000000000001";
const orgB = "10000000-0000-4000-8000-000000000002";
const userId = "20000000-0000-4000-8000-000000000001";
const programId = "30000000-0000-4000-8000-000000000001";
const departureId = "40000000-0000-4000-8000-000000000001";
const auth = { cookie: "kiashi_session=test-session" };
const apps: Array<Awaited<ReturnType<typeof buildApp>>> = [];
afterEach(async () => Promise.all(apps.splice(0).map((app) => app.close())));

function context(permissions: string[]): PlatformAccessContext {
  return { membershipId: "50000000-0000-4000-8000-000000000001", user: { id: userId, mobile: "09120000001", firstName: "اپراتور", lastName: "نمونه", email: null }, organization: { id: orgA, type: "MERCHANT", name: "مجری نمونه", slug: "merchant-a", status: "ACTIVE" }, roles: ["MERCHANT_OPERATOR"], permissions };
}

async function setup(permissions: string[]) {
  const runtime = { userFromSession: vi.fn(async () => ({ id: userId })) } as unknown as PrismaRuntimeRepository;
  const platform = { accessContext: vi.fn(async (_user, scope, requested) => scope === "MERCHANT" && (!requested || requested === orgA) ? context(permissions) : null) } as unknown as PlatformRepository;
  const programs = {
    listPrograms: vi.fn(async () => ({ items: [], total: 0 })),
    updateProgram: vi.fn(async (id) => ({ id })),
    participantList: vi.fn(async () => ({ summary: {}, rows: [] })),
    participantCsv: vi.fn(async () => "\uFEFF\"سفارش\"\r\n"),
    publicPrograms: vi.fn(async () => []),
    publicProgram: vi.fn(async (slug) => ({ slug })),
  } as unknown as ProgramRepository;
  const app = await buildApp({ repository: runtime, platformRepository: platform, programRepository: programs, env: { NODE_ENV: "test", BACKOFFICE_ENABLED: true, MERCHANT_PORTAL_ENABLED: true, WEB_ORIGIN: "http://localhost:8080" } });
  apps.push(app);
  return { app, platform, programs };
}

describe("program API tenant isolation", () => {
  it("derives merchant program scope only from membership", async () => {
    const { app, platform, programs } = await setup(["merchant.programs.read"]);
    expect((await app.inject({ method: "GET", url: `/api/merchant/programs?organizationId=${orgB}`, headers: auth })).statusCode).toBe(200);
    expect(programs.listPrograms).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), orgA);
    expect((await app.inject({ method: "GET", url: "/api/merchant/programs", headers: { ...auth, "x-organization-id": orgB } })).statusCode).toBe(403);
    expect(platform.accessContext).toHaveBeenLastCalledWith(userId, "MERCHANT", orgB);
  });

  it("scopes edits and participant access to the authorized tenant", async () => {
    const { app, programs } = await setup(["merchant.programs.manage", "merchant.participants.read"]);
    expect((await app.inject({ method: "PATCH", url: `/api/merchant/programs/${programId}`, headers: auth, payload: { title: "تور ویرایش‌شده" } })).statusCode).toBe(200);
    expect(programs.updateProgram).toHaveBeenCalledWith(programId, expect.any(Object), expect.any(Object), orgA);
    expect((await app.inject({ method: "GET", url: `/api/merchant/programs/${programId}/departures/${departureId}/participants`, headers: auth })).statusCode).toBe(200);
    expect(programs.participantList).toHaveBeenCalledWith(programId, departureId, orgA);
    const csv = await app.inject({ method: "GET", url: `/api/merchant/programs/${programId}/departures/${departureId}/participants.csv`, headers: auth });
    expect(csv.statusCode).toBe(200);
    expect(csv.headers["content-type"]).toContain("text/csv");
    expect(programs.participantCsv).toHaveBeenCalledWith(programId, departureId, orgA);
  });

  it("keeps public catalog read-only and independent of merchant identity", async () => {
    const { app, programs } = await setup([]);
    expect((await app.inject({ method: "GET", url: "/api/catalog/programs?type=TOUR" })).statusCode).toBe(200);
    expect(programs.publicPrograms).toHaveBeenCalledWith("TOUR");
  });
});
