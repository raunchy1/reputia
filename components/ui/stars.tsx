import { cn } from "@/lib/cn";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={rating === 1 ? "1 stella su 5" : `${rating} stelle su 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={cn("size-3.5", n <= rating ? "fill-star" : "fill-line-strong")} aria-hidden>
          <path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" />
        </svg>
      ))}
    </span>
  );
}
