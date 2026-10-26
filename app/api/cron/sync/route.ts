import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { UserError } from "@/lib/errors";
import { syncLocationById } from "@/lib/services/sync";

export const runtime = "nodejs";

const CONCURRENCY = 3;
type SyncResult = { locationId: string; created: number; updated: number; error?: string };

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("x-cron-secret");
  if (!secret || !supplied) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  const expected = Buffer.from(secret);
  const given = Buffer.from(supplied);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const locations = await db.location.findMany({
    where: { archivedAt: null, connection: { provider: "GOOGLE", status: "ACTIVE" } },
    select: { id: true, organizationId: true },
  });
  const results: SyncResult[] = new Array(locations.length);
  let next = 0;
  // Ogni worker prende la prossima sede; un errore non interrompe le altre sync.
  async function worker() {
    while (next < locations.length) {
      const index = next++;
      const location = locations[index];
      try {
        const counts = await syncLocationById(location.organizationId, location.id);
        results[index] = { locationId: location.id, ...counts };
      } catch (error) {
        results[index] = {
          locationId: location.id,
          created: 0,
          updated: 0,
          error: error instanceof UserError ? error.message : "Sincronizzazione non riuscita. Riprova più tardi.",
        };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, locations.length) }, () => worker()));
  const failed = results.filter((result) => result.error !== undefined).length;
  return NextResponse.json({ synced: results.length - failed, failed, results });
}
