import { describe, expect, it } from "vitest";
import { assertProgramTransition, capacitySnapshot, createParticipantCsv, effectiveDepartureStatus, publicationIssues } from "./domain.js";

describe("managed travel program domain", () => {
  it("derives capacity without contradictory stored availability", () => {
    expect(capacitySnapshot({ totalCapacity: 30, heldCapacity: 3, bookedTravelers: 20, confirmedTravelers: 16, cancelledTravelers: 2 })).toEqual({ totalCapacity: 30, heldCapacity: 3, booked: 20, confirmed: 16, pending: 4, cancelled: 2, remaining: 7 });
    expect(effectiveDepartureStatus("OPEN", 3, 30)).toBe("LOW_CAPACITY");
    expect(effectiveDepartureStatus("LOW_CAPACITY", 0, 30)).toBe("FULL");
  });

  it("requires operational data before submit or publish", () => {
    const issues = publicationIssues({ title: "", description: "", origin: "", durationDays: 0, destinations: [], departures: [], packages: [], itinerary: [], cancellationPolicy: "", media: [] });
    expect(issues).toContain("DESTINATION_REQUIRED");
    expect(issues).toContain("COVER_IMAGE_REQUIRED");
    expect(issues).toContain("USABLE_DEPARTURE_REQUIRED");
  });

  it("prevents merchant self-approval", () => {
    expect(() => assertProgramTransition("SUBMITTED", "PUBLISHED", "MERCHANT")).toThrowError(/بک‌آفیس/);
    expect(() => assertProgramTransition("DRAFT", "SUBMITTED", "MERCHANT")).not.toThrow();
  });

  it("protects Persian CSV exports from formula injection", () => {
    const csv = createParticipantCsv([{ name: "=IMPORTXML(A1)", order: "KIA-1" }], [{ key: "name", label: "نام" }, { key: "order", label: "سفارش" }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=IMPORTXML(A1)");
  });
});
