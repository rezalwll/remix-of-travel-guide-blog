import Fastify from "fastify";
import { providerFixtures } from "./fixtures.js";

export type StubScenario = "success" | "timeout" | "rate-limit" | "malformed" | "partial" | "duplicate" | "unknown" | "rejected";

export function buildProviderStubServer(nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv === "production") throw new Error("Provider stub server is disabled in production");
  const app = Fastify({ logger: false, forceCloseConnections: true });
  const scenario = (headers: Record<string, unknown>) => String(headers["x-stub-scenario"] ?? "success") as StubScenario;
  const simulate = async (request: { headers: Record<string, unknown> }, reply: { code(code: number): unknown; header(name: string, value: string): unknown; send(value: unknown): unknown }, success: unknown) => {
    const selected = scenario(request.headers);
    if (selected === "timeout") await new Promise((resolve) => setTimeout(resolve, 250));
    if (selected === "rate-limit") return (reply.code(429) as typeof reply).send({ error: "rate_limited" });
    if (selected === "malformed") { reply.header("content-type", "application/json"); return reply.send("{broken"); }
    if (selected === "partial") return { status: "accepted" };
    if (selected === "unknown") return { status: "unknown" };
    if (selected === "rejected") return (reply.code(422) as typeof reply).send({ error: "rejected" });
    return success;
  };
  app.post("/sms/send", (request, reply) => simulate(request, reply, providerFixtures.sms.accepted));
  app.get("/sms/status/:reference", (request, reply) => simulate(request, reply, { status: "sent" }));
  app.post("/payments", (request, reply) => simulate(request, reply, providerFixtures.payment.pending));
  app.get("/payments/:reference", (request, reply) => simulate(request, reply, providerFixtures.payment.succeeded));
  app.post("/travel/search", (request, reply) => simulate(request, reply, { items: [providerFixtures.travel.item] }));
  app.post("/travel/reserve", (request, reply) => simulate(request, reply, providerFixtures.travel.reserved));
  return app;
}
