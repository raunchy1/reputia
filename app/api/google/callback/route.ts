import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/lib/audit";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { emailFromIdToken, exchangeCode, GOOGLE_SCOPES, verifyState } from "@/lib/google/oauth";
import { hasRole } from "@/lib/roles";
import { getOrgContext } from "@/lib/session";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const from = request.cookies.get("g_oauth_from")?.value === "onboarding" ? "/onboarding/google" : "/app/google";
  const fail = (code: string) => {
    const url = new URL(from, env.APP_URL);
    url.searchParams.set("errore", code);
    const res = NextResponse.redirect(url);
    res.cookies.delete({ name: "g_oauth_nonce", path: "/api/google" });
    return res;
  };

  if (params.get("error")) return fail("annullato");
  const code = params.get("code");
  const verified = verifyState(params.get("state") ?? "", request.cookies.get("g_oauth_nonce")?.value);
  if (!code || !verified) return fail("scaduto");

  // The flow must be finished by the same user, still admin of the same organization.
  const ctx = await getOrgContext();
  if (!ctx || ctx.organization.id !== verified.orgId || ctx.user.id !== verified.userId || !hasRole(ctx.role, "admin")) {
    return fail("sessione");
  }

  let token;
  try {
    token = await exchangeCode(code);
  } catch {
    return fail("token");
  }
  if (!token.scope.split(" ").includes(GOOGLE_SCOPES[0])) return fail("scope");
  if (!token.refresh_token) return fail("refresh");

  const accountEmail = emailFromIdToken(token.id_token);
  const existing = accountEmail
    ? await db.googleConnection.findFirst({ where: { organizationId: ctx.organization.id, provider: "GOOGLE", accountEmail } })
    : null;
  const data = {
    accessTokenEnc: encrypt(token.access_token),
    refreshTokenEnc: encrypt(token.refresh_token),
    accessTokenExpiry: new Date(Date.now() + token.expires_in * 1000),
    scope: token.scope,
    status: "ACTIVE" as const,
    lastError: null,
  };
  const connection = existing
    ? await db.googleConnection.update({ where: { id: existing.id }, data })
    : await db.googleConnection.create({
        data: { ...data, organizationId: ctx.organization.id, provider: "GOOGLE", accountEmail, connectedById: ctx.user.id },
      });
  await audit({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action: existing ? "google.reconnected" : "google.connected",
    targetType: "googleConnection",
    targetId: connection.id,
  });

  const res = NextResponse.redirect(new URL(`/app/google?collegato=${connection.id}`, env.APP_URL));
  res.cookies.delete({ name: "g_oauth_nonce", path: "/api/google" });
  res.cookies.delete({ name: "g_oauth_from", path: "/api/google" });
  return res;
}
