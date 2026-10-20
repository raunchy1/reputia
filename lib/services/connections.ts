import "server-only";
import { decrypt, encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import type { GoogleConnection } from "@/lib/generated/prisma/client";
import { GoogleTokenError, refreshAccessToken } from "@/lib/google/oauth";
import { GoogleReviewProvider } from "@/lib/reviews/google";
import { MockReviewProvider } from "@/lib/reviews/mock";
import { ProviderAuthError, type ReviewProvider } from "@/lib/reviews/types";
import type { OrgContext } from "@/lib/session";

export function providerFor(connection: GoogleConnection, businessName: string): ReviewProvider {
  if (connection.provider === "MOCK") return new MockReviewProvider(businessName);
  return new GoogleReviewProvider(() => accessTokenFor(connection.id));
}

/** Returns a valid access token, refreshing (and persisting) it when it expires within a minute. */
async function accessTokenFor(connectionId: string): Promise<string> {
  const conn = await db.googleConnection.findUniqueOrThrow({ where: { id: connectionId } });
  if (conn.status !== "ACTIVE") throw new ProviderAuthError("Collegamento Google da riautorizzare.");
  if (conn.accessTokenEnc && conn.accessTokenExpiry && conn.accessTokenExpiry.getTime() > Date.now() + 60_000) {
    return decrypt(conn.accessTokenEnc);
  }
  if (!conn.refreshTokenEnc) throw new ProviderAuthError("Manca il token di aggiornamento Google.");
  try {
    const token = await refreshAccessToken(decrypt(conn.refreshTokenEnc));
    await db.googleConnection.update({
      where: { id: conn.id },
      data: {
        accessTokenEnc: encrypt(token.access_token),
        accessTokenExpiry: new Date(Date.now() + token.expires_in * 1000),
        ...(token.refresh_token ? { refreshTokenEnc: encrypt(token.refresh_token) } : {}),
        lastError: null,
      },
    });
    return token.access_token;
  } catch (error) {
    if (error instanceof GoogleTokenError) {
      // invalid_grant: the user revoked access or the token expired — ask them to reconnect.
      await db.googleConnection.update({ where: { id: conn.id }, data: { status: "NEEDS_RECONNECT", lastError: error.message } });
      throw new ProviderAuthError("Google ha revocato l'autorizzazione. Ricollega l'account.");
    }
    throw error;
  }
}

export async function markNeedsReconnect(connectionId: string, message: string) {
  await db.googleConnection.update({ where: { id: connectionId }, data: { status: "NEEDS_RECONNECT", lastError: message.slice(0, 500) } });
}

export async function listConnections(ctx: OrgContext) {
  return db.googleConnection.findMany({
    where: { organizationId: ctx.organization.id, status: { not: "REVOKED" } },
    orderBy: { createdAt: "asc" },
    select: { id: true, provider: true, accountEmail: true, status: true, lastError: true, createdAt: true, _count: { select: { locations: true } } },
  });
}

export async function ensureMockConnection(ctx: OrgContext) {
  const existing = await db.googleConnection.findFirst({ where: { organizationId: ctx.organization.id, provider: "MOCK", status: "ACTIVE" } });
  if (existing) return existing;
  return db.googleConnection.create({
    data: { organizationId: ctx.organization.id, provider: "MOCK", accountEmail: "simulazione@reputia.local", connectedById: ctx.user.id },
  });
}
