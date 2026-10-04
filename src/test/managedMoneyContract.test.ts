import { describe, expect, it } from "vitest";
import { tours } from "@/data/experiences";
import { calculateExperienceDraftPrice, calculateHotelPrice } from "@/services/checkout";
import type { ExperienceCheckoutDraft, HotelBookingDraft } from "@/types/checkout";

describe("managed money contract", () => {
  it("keeps managed hotel amounts unchanged and labels them as Toman", () => {
    const result = calculateHotelPrice({
      hotelRatePlan: { nightlyPrice: 2_000_000 },
      hotelSearch: { checkIn: "2026-12-10", checkOut: "2026-12-13" },
      roomCount: 2,
      hotelAddOns: [],
      coupon: null,
    } as Pick<HotelBookingDraft, "hotelRatePlan" | "hotelSearch" | "roomCount" | "hotelAddOns" | "coupon">);
    expect(result).toMatchObject({ passengers: 12_000_000, total: 12_000_000, currency: "TOMAN" });
  });

  it("keeps managed program package amounts unchanged and labels them as Toman", () => {
    const offer = tours[0];
    const pack = offer.packages[0];
    const result = calculateExperienceDraftPrice({
      offer,
      departure: offer.departureOptions[0],
      package: pack,
      travelers: [{ ageCategory: "adult" }],
      addOns: [],
      coupon: null,
    } as ExperienceCheckoutDraft);
    expect(result).toMatchObject({ passengers: pack.pricePerAdult, total: pack.pricePerAdult, currency: "TOMAN" });
  });
});
