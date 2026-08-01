import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import {
  canAccessPathWithPayload,
  getSessionPayloadFromRequest,
  isAuthApiPath,
  isAuthenticatedPublicPath,
  isHealthApiPath,
} from "@/lib/identity/middleware-auth";
import { isAuthPublicPath } from "@/lib/auth/routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAuthApiPath(pathname) || isHealthApiPath(pathname)) {
    const response = NextResponse.next();
    applySecurityHeaders(response.headers);
    return response;
  }

  const payload = await getSessionPayloadFromRequest(request);
  const isAuthenticated = payload !== null;
  const isPublicRoute = isAuthPublicPath(pathname);
  const isUnauthorizedPage = pathname === "/unauthorized";

  let response: NextResponse;

  if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL("/brief", request.url));
  } else if ((pathname === "/" || pathname === "/advisor") && isAuthenticated) {
    response = NextResponse.redirect(new URL("/brief", request.url));
  } else if (isUnauthorizedPage) {
    response = NextResponse.next();
  } else if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    response = NextResponse.redirect(loginUrl);
  } else if (isAuthenticated && payload && !isAuthenticatedPublicPath(pathname)) {
    if (!canAccessPathWithPayload(pathname, payload)) {
      response = NextResponse.redirect(new URL("/forbidden", request.url));
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  applySecurityHeaders(response.headers);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
