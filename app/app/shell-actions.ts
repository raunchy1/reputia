"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { LOCATION_COOKIE } from "@/lib/location-scope";
import { requireOrg } from "@/lib/session";

export async function selectLocation(locationId: string | null) {
  const ctx = await requireOrg();
  const store = await cookies();
  if (!locationId) {
    store.delete(LOCATION_COOKIE);
  } else {
    const id = z.string().max(64).parse(locationId);
    const owned = await db.location.count({ where: { id, organizationId: ctx.organization.id, archivedAt: null } });
    if (!owned) return;
    store.set(LOCATION_COOKIE, id, { path: "/app", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath("/app", "layout");
}

export type CommandReview = { id: string; authorName: string; rating: number; excerpt: string; status: string };

/** Review search for the command menu, scoped to the caller's organization. */
export async function searchReviewsAction(query: string): Promise<CommandReview[]> {
  const ctx = await requireOrg();
  const q = z.string().trim().max(80).parse(query);
  if (q.length < 2) return [];
  const rows = await db.review.findMany({
    where: {
      organizationId: ctx.organization.id,
      location: { archivedAt: null },
      OR: [{ authorName: { contains: q, mode: "insensitive" } }, { comment: { contains: q, mode: "insensitive" } }],
    },
    orderBy: { reviewedAt: "desc" },
    take: 8,
    select: { id: true, authorName: true, rating: true, comment: true, status: true },
  });
  return rows.map((r) => ({ id: r.id, authorName: r.authorName, rating: r.rating, excerpt: (r.comment ?? "Solo valutazione").slice(0, 90), status: r.status }));
}
