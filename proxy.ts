import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic redirect only: the cookie's presence is not trusted for authorization.
// Every page and action re-validates the session server-side (lib/session.ts).
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/accedi", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*", "/onboarding/:path*", "/onboarding"] };
