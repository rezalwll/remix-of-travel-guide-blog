import { describe, expect, it } from "vitest";
import { assertVisaTransition, emptyVisaChecklist, publicVisaPayload } from "./domain.js";

describe("visa case domain", () => {
  it("allows truthful forward transitions and rejects skipped provider submission", () => {
    expect(() => assertVisaTransition("draft", "SUBMITTED")).not.toThrow();
    expect(() => assertVisaTransition("UNDER_REVIEW", "READY_FOR_SUBMISSION")).not.toThrow();
    expect(() => assertVisaTransition("READY_FOR_SUBMISSION", "DECISION_RECEIVED")).toThrowError(/مجاز نیست/);
    expect(() => assertVisaTransition("COMPLETED", "UNDER_REVIEW")).toThrowError(/مجاز نیست/);
  });

  it("creates every required document slot and removes internal customer fields", () => {
    expect(Object.keys(emptyVisaChecklist())).toHaveLength(6);
    const payload = publicVisaPayload({ internalNote: "secret", reviewerId: "internal", customerNote: "مدرک عکس لازم است", timeline: [{ audience: "internal", note: "secret" }, { audience: "customer", note: "public" }] });
    expect(payload).not.toHaveProperty("internalNote");
    expect(payload).not.toHaveProperty("reviewerId");
    expect(payload.timeline).toHaveLength(1);
  });
});
