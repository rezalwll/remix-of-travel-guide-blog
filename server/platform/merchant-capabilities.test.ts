import { describe, expect, it } from "vitest";
import {
  capabilitiesForBusinessType,
  capabilityForPermission,
  hasMerchantCapability,
  requireMerchantPermissionCapability,
} from "./merchant-capabilities.js";

describe("merchant business capabilities", () => {
  it("separates hotel inventory from tour program management", () => {
    expect(hasMerchantCapability("HOTEL", "MANAGE_HOTELS")).toBe(true);
    expect(hasMerchantCapability("HOTEL", "MANAGE_PROGRAMS")).toBe(false);
    expect(hasMerchantCapability("TOUR_OPERATOR", "MANAGE_PROGRAMS")).toBe(true);
    expect(hasMerchantCapability("TOUR_OPERATOR", "MANAGE_HOTELS")).toBe(false);
  });

  it("does not grant speculative inventory capabilities to travel agencies", () => {
    expect(capabilitiesForBusinessType("TRAVEL_AGENCY")).toEqual([
      "VIEW_PROVIDER_ORDERS",
      "MANAGE_TEAM",
      "VIEW_FINANCE",
    ]);
    expect(capabilitiesForBusinessType("UNKNOWN")).toEqual([]);
  });

  it("maps permissions to the central policy and fails closed", () => {
    expect(capabilityForPermission("merchant.inventory.manage")).toBe("MANAGE_HOTELS");
    expect(capabilityForPermission("merchant.registrations.read")).toBe("VIEW_PROGRAM_REGISTRATIONS");
    expect(() => requireMerchantPermissionCapability("HOTEL", "merchant.programs.manage")).toThrowError(/نوع کسب‌وکار/);
    expect(() => requireMerchantPermissionCapability("TOUR_OPERATOR", "merchant.programs.manage")).not.toThrow();
  });
});
