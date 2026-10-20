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
