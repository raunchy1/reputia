import Link from "next/link";
import { Avatar } from "@/components/app/avatar";
import { ReviewStatusBadge } from "@/components/app/review-status";
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

export function ReviewRow({ review, href, selected, showLocation }: { review: RowReview; href: string; selected: boolean; showLocation: boolean }) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "relative flex gap-3 border-b border-line px-4 py-3 transition-colors duration-[120ms] focus-visible:-outline-offset-2",
          selected ? "bg-accent-soft/60" : "hover:bg-subtle/70",
        )}
      >
        {selected && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" aria-hidden />}
        <Avatar name={review.authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold">{review.authorName}</span>
            <RatingMark rating={review.rating} />
            <span className="ml-auto shrink-0 text-xs text-faint">{relativeDate(review.reviewedAt)}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45] text-muted">{review.comment ?? <span className="italic">Solo valutazione, senza testo</span>}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <ReviewStatusBadge status={review.status} />
            {showLocation && <span className="truncate text-xs text-faint">· {review.location.name}</span>}
          </div>
        </div>
      </Link>
    </li>
  );
}
