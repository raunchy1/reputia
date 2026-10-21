import { cn } from "@/lib/cn";

/** "2★" in mono. Low ratings are tinted, never shouted. */
export function RatingMark({ rating, className }: { rating: number; className?: string }) {
  const tone = rating <= 2 ? "text-danger" : rating === 3 ? "text-warning" : "text-ink-2";
  return (
    <span className={cn("inline-flex items-baseline gap-px font-mono text-[11.5px] font-medium", tone, className)} aria-label={rating === 1 ? "1 stella su 5" : `${rating} stelle su 5`}>
      {rating}
      <span className={rating >= 4 ? "text-gold" : undefined} aria-hidden>
        ★
      </span>
    </span>
  );
}
