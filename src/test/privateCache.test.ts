import { describe, expect, it } from "vitest";
import { PRIVATE_NO_STORE, requiresPrivateNoStore } from "@/seo/private-cache";

describe("private route cache policy", () => {
  it.each([
    "/account",
    "/account/orders/123",
    "/auth/login",
    "/checkout/review",
    "/orders/KIA-123",
    "/backoffice/orders",
    "/merchant/finance",
    "/cart",
    "/track-order",
    "/flights/search",
    "/hotels/search/",
    "/trains/search",
    "/buses/search",
    "/visa/turkey/apply",
  ])("marks %s as private and no-store", (path) => {
    expect(requiresPrivateNoStore(path)).toBe(true);
  });

  it.each(["/", "/accounting", "/hotels", "/visa/turkey", "/blog/checkout-guide"])(
    "does not disable public caching for %s",
    (path) => {
      expect(requiresPrivateNoStore(path)).toBe(false);
    },
  );

  it("uses a private no-store response policy", () => {
    expect(PRIVATE_NO_STORE).toBe("private, no-store, max-age=0");
  });
});
