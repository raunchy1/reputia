import Link from "next/link";
import { cn } from "@/lib/cn";
import { RATING_FILTERS, STATUS_FILTERS, type RatingFilter, type StatusFilter } from "@/lib/services/reviews";

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
        <p className="mb-1 px-2 text-[11px] font-medium tracking-wide text-faint uppercase">Stato</p>
        <ul className="grid gap-px">
          {(Object.keys(STATUS_FILTERS) as StatusFilter[]).map((key) => (
            <li key={key}>
              <FilterLink href={hrefFor({ stato: key === "da-gestire" ? null : key, r: null })} active={status === key} count={counts.status[key]} emphasize={key === "da-gestire" || key === "da-approvare"}>
                {STATUS_FILTERS[key].label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 px-2 text-[11px] font-medium tracking-wide text-faint uppercase">Valutazione</p>
        <ul className="grid gap-px">
          {(Object.keys(RATING_FILTERS) as RatingFilter[]).map((key) => (
            <li key={key}>
              <FilterLink href={hrefFor({ stelle: rating === key ? null : key, r: null })} active={rating === key} count={counts.rating[key]}>
                <span className={cn("size-1.5 rounded-full", key === "negative" ? "bg-danger" : key === "neutre" ? "bg-warning" : "bg-positive")} aria-hidden />
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
        "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors duration-[120ms]",
        active ? "bg-subtle font-medium text-ink" : "text-ink-2 hover:bg-subtle/70 hover:text-ink",
      )}
    >
      {children}
      <span className={cn("ml-auto text-xs tabular-nums", emphasize && count > 0 ? "font-semibold text-accent" : "text-faint")}>{count}</span>
    </Link>
  );
}
