import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { UserError } from "@/lib/errors";

/**
 * Fixed-window limiter stored in Postgres (shares Better Auth's rateLimit table,
 * keys prefixed with "app:"). Atomic via a single upsert, so it holds across
 * concurrent requests and multiple app instances.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<{ ok: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "rateLimit" (id, key, count, "lastRequest")
    VALUES (${randomUUID()}, ${`app:${key}`}, 1, ${BigInt(now)})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN "rateLimit"."lastRequest" < ${BigInt(windowStart)} THEN 1 ELSE "rateLimit".count + 1 END,
      "lastRequest" = CASE WHEN "rateLimit"."lastRequest" < ${BigInt(windowStart)} THEN ${BigInt(now)} ELSE "rateLimit"."lastRequest" END
    RETURNING count`;
  const count = Number(rows[0]?.count ?? max + 1);
  return { ok: count <= max, remaining: Math.max(0, max - count) };
}

export class RateLimitError extends UserError {
  constructor() {
    super("Troppe richieste. Riprova tra qualche minuto.");
  }
}
