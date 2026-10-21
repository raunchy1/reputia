import Link from "next/link";
import { StatusIcon, STATUS_META } from "@/components/app/review-status";
import { RatingMark } from "@/components/reviews/rating-mark";
import { cn } from "@/lib/cn";
import { relativeDate } from "@/lib/format";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

export type RowReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  reviewedAt: Date;
  status: ReviewStatus;
  location: { name: string };
};

/** `selected` = chosen by the user; `autoSelected` = first row shown in the desktop detail pane only. */
export function ReviewRow({ review, href, selected, autoSelected, showLocation }: { review: RowReview; href: string; selected: boolean; autoSelected?: boolean; showLocation: boolean }) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        data-review-row
        aria-current={selected ? "true" : undefined}
        aria-label={`${review.authorName}, ${review.rating} stelle, ${STATUS_META[review.status].label}`}
        className={cn(
          "group relative grid grid-cols-[14px_minmax(0,1fr)] gap-x-3 border-b border-line px-4 py-3 transition-colors duration-[120ms] focus-visible:-outline-offset-2",
          selected ? "bg-accent-soft" : autoSelected ? "hover:bg-subtle/70 lg:bg-accent-soft" : "hover:bg-subtle/70",
        )}
      >
        <StatusIcon status={review.status} className="mt-[3px]" />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn("truncate text-[13px]", review.status === "NEW" ? "font-semibold text-ink" : "font-medium text-ink-2")}>{review.authorName}</span>
            <RatingMark rating={review.rating} />
            <span className="ml-auto shrink-0 font-mono text-[11px] text-faint">{relativeDate(review.reviewedAt)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-[1.5] text-muted">{review.comment ?? <span className="italic">Solo valutazione, senza testo</span>}</p>
          {showLocation && <p className="mt-1 truncate font-mono text-[11px] text-faint">{review.location.name}</p>}
        </div>
      </Link>
    </li>
  );
}
