import { NextResponse, type NextRequest } from "next/server";
import { env, isProduction } from "@/lib/env";
import { authorizationUrl, googleConfigured, signState } from "@/lib/google/oauth";
import { hasRole } from "@/lib/roles";
import { getOrgContext } from "@/lib/session";

export async function GET(request: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.redirect(new URL("/accedi", env.APP_URL));
  if (!hasRole(ctx.role, "admin")) return NextResponse.redirect(new URL("/app/google?errore=permessi", env.APP_URL));
  if (!googleConfigured()) return NextResponse.redirect(new URL("/app/google?errore=non-configurato", env.APP_URL));

  const { state, nonce } = signState(ctx.organization.id, ctx.user.id);
  const response = NextResponse.redirect(authorizationUrl(state));
  const from = request.nextUrl.searchParams.get("da") === "onboarding" ? "onboarding" : "app";
  const cookie = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, maxAge: 600, path: "/api/google" };
  response.cookies.set("g_oauth_nonce", nonce, cookie);
  response.cookies.set("g_oauth_from", from, cookie);
  return response;
}
