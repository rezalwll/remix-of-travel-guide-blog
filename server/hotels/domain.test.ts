import { describe, expect, it } from "vitest";
import { assertManualInventoryAllowed, assertPropertyPublicationTransition, dateRange, inventoryPrice, maskGuestMobile, stayDates } from "./domain.js";

describe("hotel operations domain", () => {
  it("prevents manual supplier inventory overrides", () => { expect(() => assertManualInventoryAllowed("SUPPLIER")).toThrow(/تأمین‌کننده/); expect(() => assertManualInventoryAllowed("DIRECT")).not.toThrow(); });
  it("builds bounded weekday ranges", () => { expect(dateRange(new Date("2026-10-01"), new Date("2026-10-07"), [1, 4])).toHaveLength(2); expect(() => dateRange(new Date("2026-01-01"), new Date("2028-01-01"))).toThrow(); });
  it("derives truthful daily price and closed state", () => { expect(inventoryPrice(100, { priceOverride: 120, closed: false, availableRooms: 2 })).toBe(120); expect(inventoryPrice(100, { priceOverride: null, closed: true, availableRooms: 2 })).toBeNull(); });
  it("masks guest mobile and excludes checkout date", () => { expect(maskGuestMobile("09121234567")).toBe("0912***4567"); expect(stayDates(new Date("2026-10-01"), new Date("2026-10-03"))).toHaveLength(2); });
  it("controls property publication on the server", () => { expect(() => assertPropertyPublicationTransition("DRAFT", "PUBLISHED", "INTERNAL")).toThrow(); expect(() => assertPropertyPublicationTransition("SUBMITTED", "PUBLISHED", "INTERNAL")).not.toThrow(); expect(() => assertPropertyPublicationTransition("SUBMITTED", "PUBLISHED", "MERCHANT")).toThrow(/بک‌آفیس/); });
});
