import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/business.manage", "openid", "email"];

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export const GOOGLE_REDIRECT_PATH = "/api/google/callback";

function redirectUri() {
  return `${env.APP_URL}${GOOGLE_REDIRECT_PATH}`;
}

function stateSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET mancante");
  return secret;
}

/** state = nonce.orgId.userId.signature — bound to the tenant and user who started the flow. */
export function signState(orgId: string, userId: string): { state: string; nonce: string } {
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${nonce}.${orgId}.${userId}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return { state: `${payload}.${sig}`, nonce };
}

export function verifyState(state: string, expectedNonce: string | undefined): { orgId: string; userId: string } | null {
  const parts = state.split(".");
  if (parts.length !== 4 || !expectedNonce) return null;
  const [nonce, orgId, userId, sig] = parts;
  const expected = createHmac("sha256", stateSecret()).update(`${nonce}.${orgId}.${userId}`).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (nonce !== expectedNonce) return null;
  return { orgId, userId };
}

export function authorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export type TokenResponse = { access_token: string; expires_in: number; refresh_token?: string; scope: string; id_token?: string };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      ...body,
    }),
  });
  const json = (await res.json()) as TokenResponse & { error?: string };
  if (!res.ok || json.error) throw new GoogleTokenError(json.error ?? `HTTP ${res.status}`);
  return json;
}

export class GoogleTokenError extends Error {}

export function exchangeCode(code: string) {
  return tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
}

export function refreshAccessToken(refreshToken: string) {
  return tokenRequest({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

/** Reads the email claim from Google's id_token (received directly from Google over TLS). */
export function emailFromIdToken(idToken: string | undefined): string | null {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8")) as { email?: string };
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export async function revokeToken(token: string) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => undefined);
}
