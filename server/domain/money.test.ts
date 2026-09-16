import { describe, expect, it } from "vitest";
import { fromGatewayRial, MONEY_CURRENCY, toGatewayRial } from "./money.js";

describe("canonical money", () => {
  it("uses integer TOMAN internally and converts only at gateway boundary", () => {
    expect(MONEY_CURRENCY).toBe("TOMAN");
    expect(toGatewayRial(4_250_000)).toBe(42_500_000);
    expect(fromGatewayRial(42_500_000)).toBe(4_250_000);
  });
});
