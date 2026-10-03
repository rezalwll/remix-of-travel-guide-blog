import { NextResponse, type NextRequest } from "next/server";
import { PRIVATE_NO_STORE, requiresPrivateNoStore } from "./src/seo/private-cache";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (requiresPrivateNoStore(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", PRIVATE_NO_STORE);
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/auth/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/cart",
    "/track-order",
    "/flights/search",
    "/hotels/search",
    "/trains/search",
    "/buses/search",
    "/visa/:country/apply",
  ],
};
