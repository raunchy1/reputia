import "server-only";
import { UserError } from "@/lib/errors";
import { generateReply } from "@/lib/ai/generate";
import { checkReply, replyTooLong } from "@/lib/ai/safety";
import { audit } from "@/lib/audit";
import { assertCanWrite } from "@/lib/billing/entitlement";
import { db } from "@/lib/db";
import type { Prisma, ReplyLength, ReplyTone, ReviewStatus } from "@/lib/generated/prisma/client";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";
import { CATEGORY_LABELS } from "@/lib/services/locations";
import { markNeedsReconnect, providerFor } from "@/lib/services/connections";
import { ProviderAuthError } from "@/lib/reviews/types";
import { hasRole } from "@/lib/roles";
import { ForbiddenError, type OrgContext } from "@/lib/session";

export const STATUS_FILTERS = {
  "da-gestire": { label: "Da gestire", where: { status: { in: ["NEW", "FAILED"] } } },
  bozze: { label: "Bozze pronte", where: { status: "DRAFT" } },
  "da-approvare": { label: "Da approvare", where: { status: "APPROVED" } },
  pubblicate: { label: "Pubblicate", where: { status: "PUBLISHED" } },
  archiviate: { label: "Archiviate", where: { status: "IGNORED" } },
  tutte: { label: "Tutte", where: {} },
} satisfies Record<string, { label: string; where: Prisma.ReviewWhereInput }>;
export type StatusFilter = keyof typeof STATUS_FILTERS;

export const RATING_FILTERS = {
  negative: { label: "1–2 stelle", where: { rating: { lte: 2 } } },
  neutre: { label: "3 stelle", where: { rating: 3 } },
  positive: { label: "4–5 stelle", where: { rating: { gte: 4 } } },
} satisfies Record<string, { label: string; where: Prisma.ReviewWhereInput }>;
export type RatingFilter = keyof typeof RATING_FILTERS;

export const SORTS = {
  recenti: { label: "Più recenti", orderBy: [{ reviewedAt: "desc" }] },
  "meno-recenti": { label: "Meno recenti", orderBy: [{ reviewedAt: "asc" }] },
  valutazione: { label: "Valutazione più bassa", orderBy: [{ rating: "asc" }, { reviewedAt: "desc" }] },
} satisfies Record<string, { label: string; orderBy: Prisma.ReviewOrderByWithRelationInput[] }>;
export type SortKey = keyof typeof SORTS;

export function pick<T extends object>(map: T, value: string | undefined, fallback: keyof T): keyof T {
  return value && Object.prototype.hasOwnProperty.call(map, value) ? (value as keyof T) : fallback;
}

export type InboxQuery = { status: StatusFilter; rating?: RatingFilter; q?: string; sort: SortKey; locationId?: string | null };

function baseWhere(ctx: OrgContext, locationId?: string | null): Prisma.ReviewWhereInput {
  return { organizationId: ctx.organization.id, location: { archivedAt: null }, ...(locationId ? { locationId } : {}) };
}

export async function listReviews(ctx: OrgContext, query: InboxQuery, take = 200) {
  const q = query.q?.trim().slice(0, 100);
  return db.review.findMany({
    where: {
      ...baseWhere(ctx, query.locationId),
      ...STATUS_FILTERS[query.status].where,
      ...(query.rating ? RATING_FILTERS[query.rating].where : {}),
      ...(q ? { OR: [{ comment: { contains: q, mode: "insensitive" } }, { authorName: { contains: q, mode: "insensitive" } }, { replyText: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: SORTS[query.sort].orderBy,
    take,
    include: { location: { select: { name: true } } },
  });
}

/** Counts per status filter and per rating bucket, for the filter rail. */
export async function inboxCounts(ctx: OrgContext, locationId?: string | null) {
  const where = baseWhere(ctx, locationId);
  const [byStatus, byRating] = await Promise.all([
    db.review.groupBy({ by: ["status"], where, _count: { _all: true } }),
    db.review.groupBy({ by: ["rating"], where, _count: { _all: true } }),
  ]);
  const s = (k: string) => byStatus.find((r) => r.status === k)?._count._all ?? 0;
  const r = (test: (n: number) => boolean) => byRating.filter((x) => test(x.rating)).reduce((a, x) => a + x._count._all, 0);
  return {
    status: {
      "da-gestire": s("NEW") + s("FAILED"),
      bozze: s("DRAFT"),
      "da-approvare": s("APPROVED"),
      pubblicate: s("PUBLISHED"),
      archiviate: s("IGNORED"),
      tutte: byStatus.reduce((a, x) => a + x._count._all, 0),
    } satisfies Record<StatusFilter, number>,
    rating: { negative: r((n) => n <= 2), neutre: r((n) => n === 3), positive: r((n) => n >= 4) } satisfies Record<RatingFilter, number>,
  };
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

export async function reviewStats(ctx: OrgContext, locationId?: string | null) {
  const where = baseWhere(ctx, locationId);
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [total, avg, pending, published, recent, byRating, aiDrafts] = await Promise.all([
    db.review.count({ where }),
    db.review.aggregate({ where, _avg: { rating: true } }),
    db.review.count({ where: { ...where, status: { in: ["NEW", "DRAFT", "APPROVED", "FAILED"] } } }),
    db.review.count({ where: { ...where, status: "PUBLISHED" } }),
    db.review.count({ where: { ...where, reviewedAt: { gte: since } } }),
    db.review.groupBy({ by: ["rating"], where, _count: { _all: true } }),
    db.replyDraft.count({ where: { organizationId: ctx.organization.id, createdAt: { gte: since }, ...(locationId ? { review: { locationId } } : {}) } }),
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
  await assertCanWrite(ctx.organization.id);

  const limit = await rateLimit(`ai:${ctx.organization.id}`, 60, 3600);
  if (!limit.ok) throw new RateLimitError();

  const tone = opts.tone ?? review.location.tone;
  const length = opts.length ?? review.location.replyLength;
  const reply = await generateReply({
    businessName: review.location.name,
    category: CATEGORY_LABELS[review.location.category],
    businessContext: review.location.businessContext,
    signature: review.location.signature,
    language: review.location.replyLanguage,
    customInstructions: review.location.customInstructions,
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

/** A collaborator hands a finished draft to the owner/admins for publication. */
export async function requestApproval(ctx: OrgContext, reviewId: string, text: string) {
  const review = await db.review.findFirst({ where: { id: reviewId, organizationId: ctx.organization.id } });
  if (!review) throw new UserError("Recensione non trovata.");
  if (review.status === "PUBLISHED") throw new UserError("La risposta è già pubblicata.");
  if (!text.trim()) throw new UserError("La risposta è vuota.");
  await db.review.update({ where: { id: review.id }, data: { replyText: text.trim(), status: "APPROVED" } });
  await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "review.reply.approval_requested", targetType: "review", targetId: review.id });
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
  await assertCanWrite(ctx.organization.id);

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

const WEEK = 7 * 86_400_000;

function mondayOf(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7;
  return new Date(x.getTime() - day * 86_400_000);
}

/** Reviews received and replies published per week, oldest first. Real data only. */
export async function weeklyActivity(ctx: OrgContext, locationId?: string | null, weeks = 12) {
  const firstWeek = new Date(mondayOf(new Date()).getTime() - (weeks - 1) * WEEK);
  const where = baseWhere(ctx, locationId);
  const [received, replied] = await Promise.all([
    db.review.findMany({ where: { ...where, reviewedAt: { gte: firstWeek } }, select: { reviewedAt: true } }),
    db.review.findMany({ where: { ...where, replyPublishedAt: { gte: firstWeek } }, select: { replyPublishedAt: true } }),
  ]);
  const buckets = Array.from({ length: weeks }, (_, i) => ({ weekStart: new Date(firstWeek.getTime() + i * WEEK), received: 0, replied: 0 }));
  const index = (d: Date) => Math.floor((mondayOf(d).getTime() - firstWeek.getTime()) / WEEK);
  for (const r of received) {
    const b = buckets[index(r.reviewedAt)];
    if (b) b.received++;
  }
  for (const r of replied) {
    const b = r.replyPublishedAt ? buckets[index(r.replyPublishedAt)] : undefined;
    if (b) b.replied++;
  }
  return buckets;
}
