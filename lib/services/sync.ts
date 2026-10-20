import "server-only";
import { UserError } from "@/lib/errors";
import { db } from "@/lib/db";
import { markNeedsReconnect, providerFor } from "@/lib/services/connections";
import { ProviderAuthError } from "@/lib/reviews/types";
import type { OrgContext } from "@/lib/session";

const MAX_PAGES = 20;

/**
 * Pulls reviews for one location. Pages newest-first and stops once a page holds
 * only reviews already synced and unchanged, so routine syncs are incremental.
 */
export async function syncLocation(ctx: OrgContext, locationId: string): Promise<{ created: number; updated: number }> {
  const location = await db.location.findFirst({
    where: { id: locationId, organizationId: ctx.organization.id, archivedAt: null },
    include: { connection: true },
  });
  if (!location?.connection || !location.externalLocationId) throw new UserError("Questa sede non è collegata a Google.");
  const provider = providerFor(location.connection, location.name);
  const source = location.connection.provider === "MOCK" ? "MOCK" : "GOOGLE";

  let created = 0;
  let updated = 0;
  let pageToken: string | undefined;
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await provider.listReviews(location.externalLocationId, pageToken);
      let changedOnPage = 0;
      for (const r of result.reviews) {
        const existing = await db.review.findUnique({ where: { locationId_externalId: { locationId: location.id, externalId: r.externalId } } });
        const remote = {
          authorName: r.authorName,
          authorPhotoUrl: r.authorPhotoUrl ?? null,
          rating: r.rating,
          comment: r.comment ?? null,
          reviewedAt: r.reviewedAt,
        };
        if (!existing) {
          await db.review.create({
            data: {
              ...remote,
              organizationId: ctx.organization.id,
              locationId: location.id,
              source,
              externalId: r.externalId,
              status: r.reply ? "PUBLISHED" : "NEW",
              replyText: r.reply?.text ?? null,
              replyPublishedAt: r.reply?.updatedAt ?? null,
            },
          });
          created++;
          changedOnPage++;
          continue;
        }
        const replyChanged = r.reply && r.reply.text !== existing.replyText;
        const reviewChanged = existing.rating !== r.rating || existing.comment !== remote.comment;
        if (replyChanged || reviewChanged) {
          await db.review.update({
            where: { id: existing.id },
            data: {
              ...remote,
              syncedAt: new Date(),
              // A reply written directly on Google wins over a local, unpublished draft.
              ...(replyChanged ? { replyText: r.reply!.text, replyPublishedAt: r.reply!.updatedAt, status: "PUBLISHED" as const } : {}),
              // An edited review that we had answered goes back to the inbox for a second look.
              ...(reviewChanged && !replyChanged && existing.status === "PUBLISHED" ? { status: "NEW" as const } : {}),
            },
          });
          updated++;
          changedOnPage++;
        }
      }
      pageToken = result.nextPageToken;
      if (!pageToken || changedOnPage === 0) break;
    }
  } catch (error) {
    if (error instanceof ProviderAuthError) await markNeedsReconnect(location.connection.id, error.message);
    throw error;
  }

  await db.location.update({ where: { id: location.id }, data: { lastSyncedAt: new Date() } });
  return { created, updated };
}
