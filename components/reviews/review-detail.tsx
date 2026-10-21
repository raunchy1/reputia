import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { ReplyComposer } from "@/components/reviews/reply-composer";
import { Stars } from "@/components/ui/stars";
import { sentimentFor } from "@/lib/ai/prompt";
import { longDate, relativeDate } from "@/lib/format";
import type { getReview } from "@/lib/services/reviews";

type Review = NonNullable<Awaited<ReturnType<typeof getReview>>>;

export function ReviewDetail({ review, canPublish, backHref }: { review: Review; canPublish: boolean; backHref: string }) {
  const sentiment = sentimentFor(review.rating);
  const lastDraft = review.drafts[0];
  const connection = review.location.connection;
  const provenance = lastDraft && lastDraft.text === review.replyText ? `Bozza AI · ${relativeDate(lastDraft.createdAt)}` : review.replyText && review.status !== "PUBLISHED" ? "Testo modificato a mano" : null;

  return (
    <article className="animate-fade" aria-labelledby="review-author">
      <div className="sticky top-0 z-10 flex h-11 items-center gap-2 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Link href={backHref} className="-ml-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-medium text-ink-2 hover:bg-subtle">
          <ArrowLeft className="size-4" aria-hidden /> Recensioni
        </Link>
        <h1 className="sr-only">Recensione di {review.authorName}</h1>
      </div>
      <div className="mx-auto grid max-w-2xl gap-5 px-4 py-6 sm:px-6 lg:py-8">
        <header className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="review-author" className="text-lg font-semibold tracking-[-0.015em]">
              {review.authorName}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-muted">
              <time dateTime={review.reviewedAt.toISOString()} title={longDate(review.reviewedAt)}>
                {relativeDate(review.reviewedAt)}
              </time>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {review.location.name}
              </span>
              {review.source === "MOCK" && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 text-ink-2"><span className="size-1.5 rounded-full bg-gold" aria-hidden />Simulazione</span>
                </>
              )}
            </p>
          </div>
        </header>

        <div>
          <div className="flex items-center gap-2.5">
            <Stars rating={review.rating} className="[&_svg]:size-4" />
            {sentiment === "negativa" && <span className="text-xs font-medium text-danger">Recensione negativa</span>}
          </div>
          <p className="mt-3 max-w-[64ch] text-[17px] leading-[1.6] tracking-[-0.01em] whitespace-pre-line text-ink">
            {review.comment ?? <span className="text-muted italic">Il cliente ha lasciato solo la valutazione, senza testo.</span>}
          </p>
          {sentiment === "negativa" && review.status !== "PUBLISHED" && (
            <p className="mt-4 border-l-2 border-danger/40 pl-3 text-[13px] leading-relaxed text-muted">
              Rispondi con calma: ringrazia, evita di confermare fatti che non hai verificato e invita il cliente a contattarti in privato.
            </p>
          )}
        </div>

        {review.status === "PUBLISHED" && review.replyPublishedAt && (
          <div className="rounded-[var(--radius-panel)] border border-line bg-canvas px-4 py-3">
            <p className="font-mono text-[11px] text-positive">Risposta pubblica · {relativeDate(review.replyPublishedAt)}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-line text-ink-2">{review.replyText}</p>
          </div>
        )}

        <ReplyComposer
          reviewId={review.id}
          authorName={review.authorName}
          status={review.status}
          savedText={review.replyText ?? ""}
          defaultTone={review.location.tone}
          defaultLength={review.location.replyLength}
          canPublish={canPublish}
          connection={connection ? { simulated: connection.provider === "MOCK", active: connection.status === "ACTIVE" } : null}
          hadError={review.status === "FAILED"}
          provenance={provenance}
        />
      </div>
    </article>
  );
}
