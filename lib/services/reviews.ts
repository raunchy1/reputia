import "server-only";
import { UserError } from "@/lib/errors";
import { generateReply } from "@/lib/ai/generate";
import { checkReply, replyTooLong } from "@/lib/ai/safety";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import type { Prisma, ReplyLength, ReplyTone, ReviewStatus } from "@/lib/generated/prisma/client";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";
import { CATEGORY_LABELS } from "@/lib/services/locations";
import { markNeedsReconnect, providerFor } from "@/lib/services/connections";
import { ProviderAuthError } from "@/lib/reviews/types";
import { hasRole } from "@/lib/roles";
import { ForbiddenError, type OrgContext } from "@/lib/session";

export type InboxFilter = "da-gestire" | "bozze" | "pubblicate" | "negative" | "tutte";

const FILTERS: Record<InboxFilter, Prisma.ReviewWhereInput> = {
  "da-gestire": { status: { in: ["NEW", "DRAFT", "APPROVED", "FAILED"] } },
  bozze: { status: { in: ["DRAFT", "APPROVED"] } },
  pubblicate: { status: "PUBLISHED" },
  negative: { rating: { lte: 2 } },
  tutte: {},
};

export function isInboxFilter(value: string | undefined): value is InboxFilter {
  return Boolean(value && value in FILTERS);
}

export async function listReviews(ctx: OrgContext, opts: { filter: InboxFilter; locationId?: string; take?: number }) {
  return db.review.findMany({
    where: {
      organizationId: ctx.organization.id,
      location: { archivedAt: null },
      ...(opts.locationId ? { locationId: opts.locationId } : {}),
      ...FILTERS[opts.filter],
    },
    orderBy: { reviewedAt: "desc" },
    take: opts.take ?? 100,
    include: { location: { select: { name: true } } },
  });
}

export async function getReview(ctx: OrgContext, reviewId: string) {
  return db.review.findFirst({
    where: { id: reviewId, organizationId: ctx.organization.id },
    include: {
      location: { include: { connection: { select: { provider: true, status: true } } } },
      drafts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

export async function reviewStats(ctx: OrgContext) {
  const where = { organizationId: ctx.organization.id, location: { archivedAt: null } };
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [total, avg, pending, published, recent, byRating, aiDrafts] = await Promise.all([
    db.review.count({ where }),
    db.review.aggregate({ where, _avg: { rating: true } }),
    db.review.count({ where: { ...where, status: { in: ["NEW", "DRAFT", "APPROVED", "FAILED"] } } }),
    db.review.count({ where: { ...where, status: "PUBLISHED" } }),
    db.review.count({ where: { ...where, reviewedAt: { gte: since } } }),
    db.review.groupBy({ by: ["rating"], where, _count: { _all: true } }),
    db.replyDraft.count({ where: { organizationId: ctx.organization.id, createdAt: { gte: since } } }),
  ]);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: byRating.find((r) => r.rating === stars)?._count._all ?? 0 }));
  return {
    total,
    average: avg._avg.rating ?? 0,
    pending,
    published,
    recent,
    distribution,
    aiDrafts,
    responseRate: total ? Math.round((published / total) * 100) : 0,
  };
}

export async function generateDraft(ctx: OrgContext, reviewId: string, opts: { tone?: ReplyTone; length?: ReplyLength }) {
  const review = await db.review.findFirst({
    where: { id: reviewId, organizationId: ctx.organization.id },
    include: { location: true },
  });
  if (!review) throw new UserError("Recensione non trovata.");

  const limit = await rateLimit(`ai:${ctx.organization.id}`, 60, 3600);
  if (!limit.ok) throw new RateLimitError();

  const tone = opts.tone ?? review.location.tone;
  const length = opts.length ?? review.location.replyLength;
  const reply = await generateReply({
    businessName: review.location.name,
    category: CATEGORY_LABELS[review.location.category],
    businessContext: review.location.businessContext,
    signature: review.location.signature,
    tone,
    length,
    review: { authorName: review.authorName, rating: review.rating, comment: review.comment },
  });

  const [draft] = await db.$transaction([
    db.replyDraft.create({
      data: {
        organizationId: ctx.organization.id,
        reviewId: review.id,
        text: reply.text,
        tone,
        length,
        provider: reply.provider,
        model: reply.model,
        inputTokens: reply.inputTokens,
        outputTokens: reply.outputTokens,
        costMicros: reply.costMicros,
        flags: reply.flags,
        createdById: ctx.user.id,
      },
    }),
    db.review.update({
      where: { id: review.id },
      data: { replyText: reply.text, ...(review.status === "PUBLISHED" ? {} : { status: "DRAFT" }) },
    }),
  ]);
  return draft;
}

export async function saveDraft(ctx: OrgContext, reviewId: string, text: string) {
  const review = await db.review.findFirst({ where: { id: reviewId, organizationId: ctx.organization.id } });
  if (!review) throw new UserError("Recensione non trovata.");
  await db.review.update({
    where: { id: review.id },
    data: { replyText: text, ...(review.status === "PUBLISHED" ? {} : { status: "DRAFT" }) },
  });
}

export async function setStatus(ctx: OrgContext, reviewId: string, status: Extract<ReviewStatus, "IGNORED" | "NEW">) {
  const res = await db.review.updateMany({
    where: { id: reviewId, organizationId: ctx.organization.id, status: { not: "PUBLISHED" } },
    data: { status },
  });
  if (res.count === 0) throw new UserError("Recensione non trovata o già pubblicata.");
}

/**
 * Publishes the reply on Google. This is the only path that writes to Google and it
 * always follows an explicit click by an admin on the exact text being sent.
 */
export async function publishReply(ctx: OrgContext, reviewId: string, text: string) {
  if (!hasRole(ctx.role, "admin")) throw new ForbiddenError();
  const clean = text.trim();
  if (!clean) throw new UserError("La risposta è vuota.");
  if (replyTooLong(clean)) throw new UserError("La risposta supera il limite di Google (4096 byte).");

  const review = await db.review.findFirst({
    where: { id: reviewId, organizationId: ctx.organization.id },
    include: { location: { include: { connection: true } } },
  });
  if (!review) throw new UserError("Recensione non trovata.");
  const connection = review.location.connection;
  if (!connection || !review.location.externalLocationId) throw new UserError("La sede non è collegata a Google.");

  const limit = await rateLimit(`publish:${ctx.organization.id}`, 30, 3600);
  if (!limit.ok) throw new RateLimitError();

  const provider = providerFor(connection, review.location.name);
  try {
    await provider.publishReply(review.location.externalLocationId, review.externalId, clean);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    if (error instanceof ProviderAuthError) await markNeedsReconnect(connection.id, message);
    await db.review.update({ where: { id: review.id }, data: { status: "FAILED", lastError: message.slice(0, 500), replyText: clean } });
    await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "review.reply.failed", targetType: "review", targetId: review.id, metadata: { message } });
    throw new UserError("Google non ha accettato la risposta. Riprova più tardi.");
  }

  const wasPublished = review.status === "PUBLISHED";
  await db.review.update({
    where: { id: review.id },
    data: { status: "PUBLISHED", replyText: clean, replyPublishedAt: new Date(), publishedById: ctx.user.id, lastError: null },
  });
  await audit({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action: wasPublished ? "review.reply.updated" : "review.reply.published",
    targetType: "review",
    targetId: review.id,
    metadata: { provider: connection.provider, flags: checkReply(clean), length: clean.length },
  });
  return { simulated: connection.provider === "MOCK" };
}
