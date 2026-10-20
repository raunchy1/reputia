import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Compact rating: "2 ★". Low ratings get a restrained red tint so they stand out without alarming. */
export function RatingMark({ rating, className }: { rating: number; className?: string }) {
  const tone = rating <= 2 ? "bg-danger-soft text-danger" : rating === 3 ? "bg-warning-soft text-warning" : "bg-subtle text-ink-2";
  return (
    <span className={cn("inline-flex h-5 items-center gap-0.5 rounded-[5px] px-1.5 text-xs font-semibold tabular-nums", tone, className)} aria-label={rating === 1 ? "1 stella su 5" : `${rating} stelle su 5`}>
      {rating}
      <Star className="size-3 fill-current" strokeWidth={0} aria-hidden />
    </span>
  );
}
