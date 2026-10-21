import Link from "next/link";
import { StatusIcon } from "@/components/app/review-status";
import { cn } from "@/lib/cn";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";
import { RATING_FILTERS, STATUS_FILTERS, type RatingFilter, type StatusFilter } from "@/lib/services/reviews";

const ICON: Record<StatusFilter, ReviewStatus | null> = {
  "da-gestire": "NEW",
  bozze: "DRAFT",
  "da-approvare": "APPROVED",
  pubblicate: "PUBLISHED",
  archiviate: "IGNORED",
  tutte: null,
};

type Counts = { status: Record<StatusFilter, number>; rating: Record<RatingFilter, number> };

export function ReviewFilters({
  counts,
  status,
  rating,
  hrefFor,
}: {
  counts: Counts;
  status: StatusFilter;
  rating?: RatingFilter;
  hrefFor: (patch: Record<string, string | null>) => string;
}) {
  return (
    <nav aria-label="Filtri recensioni" className="grid gap-5">
      <div>
        <p className="mb-1 px-2 text-xs font-medium text-faint">Stato</p>
        <ul className="grid gap-px">
          {(Object.keys(STATUS_FILTERS) as StatusFilter[]).map((key) => (
            <li key={key}>
              <FilterLink href={hrefFor({ stato: key === "da-gestire" ? null : key, r: null })} active={status === key} count={counts.status[key]} emphasize={key === "da-gestire" || key === "da-approvare"}>
                {ICON[key] ? <StatusIcon status={ICON[key]!} /> : <span className="size-3.5 shrink-0" aria-hidden />}
                {STATUS_FILTERS[key].label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 px-2 text-xs font-medium text-faint">Valutazione</p>
        <ul className="grid gap-px">
          {(Object.keys(RATING_FILTERS) as RatingFilter[]).map((key) => (
            <li key={key}>
              <FilterLink href={hrefFor({ stelle: rating === key ? null : key, r: null })} active={rating === key} count={counts.rating[key]}>
                <span className={cn("w-3.5 shrink-0 text-center font-mono text-[11px]", key === "negative" ? "text-danger" : key === "neutre" ? "text-warning" : "text-gold")} aria-hidden>
                  ★
                </span>
                {RATING_FILTERS[key].label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function FilterLink({ href, active, count, emphasize, children }: { href: string; active: boolean; count: number; emphasize?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex h-[30px] items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors duration-[120ms]",
        active ? "bg-accent-soft font-medium text-ink" : "text-ink-2 hover:bg-subtle/70 hover:text-ink",
      )}
    >
      {children}
      <span className={cn("ml-auto font-mono text-[11px]", emphasize && count > 0 ? "font-medium text-ink" : "text-faint")}>{count}</span>
    </Link>
  );
}
