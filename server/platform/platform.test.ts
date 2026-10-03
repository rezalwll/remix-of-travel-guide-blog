import { describe, expect, it } from "vitest";
import { calculateCommission, calculateSettlement, canTransitionSettlement } from "./finance.js";
import { defaultRolePermissions, hasPermission, requirePermission } from "./permissions.js";
import { maskEmail, maskIdentifier, maskMobile, toMerchantOrderDto } from "./privacy.js";
import { reportRange, summarizeOperationalRecords } from "./reporting.js";

describe("platform permissions", () => {
  it("keeps finance and operations permissions distinct", () => {
    expect(hasPermission(defaultRolePermissions.FINANCE, "backoffice.finance.view")).toBe(true);
    expect(hasPermission(defaultRolePermissions.OPERATIONS, "backoffice.finance.view")).toBe(false);
    expect(hasPermission(defaultRolePermissions.MERCHANT_OPERATOR, "merchant.finance.view")).toBe(false);
  });

  it("fails closed when a permission is absent", () => {
    expect(() => requirePermission([], "merchant.orders.read")).toThrowError(/دسترسی/);
  });
});

describe("merchant finance", () => {
  it("calculates basis-point percentages and fixed commissions deterministically", () => {
    expect(calculateCommission(1_234_567, { calculationType: "PERCENT", value: 750 })).toBe(92_592);
    expect(calculateCommission(400_000, { calculationType: "FIXED", value: 45_000 })).toBe(45_000);
    expect(calculateCommission(20_000, { calculationType: "FIXED", value: 45_000 })).toBe(20_000);
  });

  it("calculates payable and carries a negative balance forward", () => {
    expect(calculateSettlement({ grossAmount: 1_000_000, commissionAmount: 100_000, refundAmount: 150_000, adjustmentAmount: -25_000 })).toEqual({ grossAmount: 1_000_000, commissionAmount: 100_000, refundAmount: 150_000, adjustmentAmount: -25_000, payableAmount: 725_000, carryForwardAmount: 0 });
    expect(calculateSettlement({ grossAmount: 10_000, commissionAmount: 5_000, refundAmount: 10_000, adjustmentAmount: 0 }).carryForwardAmount).toBe(-5_000);
  });

  it("only allows controlled settlement transitions", () => {
    expect(canTransitionSettlement("READY", "APPROVED")).toBe(true);
    expect(canTransitionSettlement("PAID", "DRAFT")).toBe(false);
  });
});

describe("merchant privacy", () => {
  it("masks direct identifiers", () => {
    expect(maskMobile("09121234567")).toBe("0912***4567");
    expect(maskEmail("customer@example.test")).toBe("cu***@example.test");
    expect(maskIdentifier("0012345678")).toBe("******5678");
  });

  it("builds an explicit merchant-safe order DTO", () => {
    const value = toMerchantOrderDto({ id: "o1", orderNumber: "K-1", trackingCode: "T-1", serviceType: "hotel", total: 1_000, currency: "TOMAN", paymentStatus: "paid", bookingStatus: "confirmed", createdAt: "2026-10-03T00:00:00Z", buyer: { name: "مسافر نمونه", mobile: "09121234567", email: "customer@example.test", nationalId: "0012345678", secret: "must-not-leak" } });
    expect(value.customer.mobile).toBe("0912***4567");
    expect(JSON.stringify(value)).not.toContain("must-not-leak");
  });
});

describe("reporting definitions", () => {
  it("counts only authoritative states", () => {
    expect(summarizeOperationalRecords([
      { total: 100, paymentStatus: "paid", bookingStatus: "confirmed", commissionAmount: 10, merchantPayable: 90 },
      { total: 200, paymentStatus: "failed", bookingStatus: "reservation_failed", refundAmount: 50 },
      { total: 300, paymentStatus: "paid", bookingStatus: "manual_review_required" },
    ])).toEqual({ orders: 3, completedOrders: 1, grossAmount: 400, paymentSucceeded: 2, paymentFailed: 1, bookingSucceeded: 1, bookingFailed: 1, refunds: 1, refundAmount: 50, manualReview: 1, commissionAmount: 10, merchantPayable: 90 });
  });

  it("creates bounded report presets", () => {
    const range = reportRange("7d", new Date("2026-10-03T12:00:00.000Z"));
    expect(range.from.toISOString()).toBe("2026-09-26T12:00:00.000Z");
    expect(range.timezone).toBe("Asia/Tehran");
  });
});
