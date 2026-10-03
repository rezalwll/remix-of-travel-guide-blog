const privatePrefixes = ["/account", "/auth", "/checkout", "/orders"] as const;
const privateExactPaths = new Set([
  "/cart",
  "/track-order",
  "/flights/search",
  "/hotels/search",
  "/trains/search",
  "/buses/search",
]);

/** Routes that may contain customer, search-session, or checkout data must never be shared-cached. */
export function requiresPrivateNoStore(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (privateExactPaths.has(normalized)) return true;
  if (privatePrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) return true;

  return /^\/visa\/[^/]+\/apply$/.test(normalized);
}

export const PRIVATE_NO_STORE = "private, no-store, max-age=0";
