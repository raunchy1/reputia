import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/app/avatar";
import { ReviewStatusBadge } from "@/components/app/review-status";
import { ReplyEditor } from "@/components/reviews/reply-editor";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { Stars } from "@/components/ui/stars";
import { sentimentFor } from "@/lib/ai/prompt";
import { longDate, relativeDate } from "@/lib/format";
import { hasRole } from "@/lib/roles";
import { getReview } from "@/lib/services/reviews";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Recensione" };

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireOrg();
  const { id } = await params;
  const review = await getReview(ctx, id);
  if (!review) notFound();

  const sentiment = sentimentFor(review.rating);
  const connection = review.location.connection;
  const lastDraft = review.drafts[0];

  return (
    <>
      <Link href="/app/recensioni" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Tutte le recensioni
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <article className="card p-6 sm:p-7 lg:sticky lg:top-8" aria-labelledby="review-author">
          <div className="flex items-start gap-3">
            <Avatar name={review.authorName} />
            <div className="min-w-0 flex-1">
              <h1 id="review-author" className="font-semibold">
                {review.authorName}
              </h1>
              <p className="text-xs text-faint" title={longDate(review.reviewedAt)}>
                {relativeDate(review.reviewedAt)} · {review.location.name}
              </p>
            </div>
            <ReviewStatusBadge status={review.status} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Stars rating={review.rating} className="[&_svg]:size-5" />
            <Badge tone={sentiment === "positiva" ? "positive" : sentiment === "neutra" ? "warning" : "danger"}>Recensione {sentiment}</Badge>
          </div>
          <p className="mt-4 text-[17px] leading-relaxed whitespace-pre-line text-ink-soft">
            {review.comment ?? <span className="text-muted italic">Il cliente ha lasciato solo la valutazione.</span>}
          </p>
          {review.status === "PUBLISHED" && review.replyPublishedAt && (
            <div className="mt-6 rounded-xl bg-paper p-4">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Risposta pubblicata · {relativeDate(review.replyPublishedAt)}</p>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{review.replyText}</p>
            </div>
          )}
          {sentiment === "negativa" && review.status !== "PUBLISHED" && (
            <Notice tone="warning" className="mt-6">
              Recensione negativa: rileggi con attenzione. Evita di confermare fatti che non hai verificato e invita il cliente a contattarti in privato.
            </Notice>
          )}
        </article>

        <ReplyEditor
          reviewId={review.id}
          status={review.status}
          initialText={review.replyText ?? ""}
          initialFlags={lastDraft && lastDraft.text === review.replyText ? lastDraft.flags : []}
          defaultTone={review.location.tone}
          defaultLength={review.location.replyLength}
          canPublish={hasRole(ctx.role, "admin")}
          connection={connection ? { simulated: connection.provider === "MOCK", active: connection.status === "ACTIVE" } : null}
          lastError={review.status === "FAILED" ? review.lastError : null}
          draftsCount={review.drafts.length}
        />
      </div>
    </>
  );
}
