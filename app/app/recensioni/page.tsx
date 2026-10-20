import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/app/avatar";
import { PageHeader } from "@/components/app/page-header";
import { ReviewStatusBadge } from "@/components/app/review-status";
import { SyncButton } from "@/components/reviews/sync-button";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/cn";
import { relativeDate } from "@/lib/format";
import { listLocations } from "@/lib/services/locations";
import { isInboxFilter, listReviews, type InboxFilter } from "@/lib/services/reviews";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Recensioni" };

const TABS: Array<{ value: InboxFilter; label: string }> = [
  { value: "da-gestire", label: "Da gestire" },
  { value: "bozze", label: "Bozze" },
  { value: "negative", label: "Negative" },
  { value: "pubblicate", label: "Pubblicate" },
  { value: "tutte", label: "Tutte" },
];

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ filtro?: string; sede?: string }> }) {
  const ctx = await requireOrg();
  const params = await searchParams;
  const filter: InboxFilter = isInboxFilter(params.filtro) ? params.filtro : "da-gestire";
  const locations = await listLocations(ctx);
  const locationId = locations.some((l) => l.id === params.sede) ? params.sede : undefined;
  const reviews = await listReviews(ctx, { filter, locationId });

  const href = (next: { filtro?: string; sede?: string }) => {
    const q = new URLSearchParams({ filtro: next.filtro ?? filter });
    const sede = next.sede === undefined ? locationId : next.sede;
    if (sede) q.set("sede", sede);
    return `/app/recensioni?${q}`;
  };

  return (
    <>
      <PageHeader eyebrow="Recensioni" title="La tua casella" description="Le recensioni Google delle tue sedi, dalla più recente." actions={<SyncButton />} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filtra recensioni" className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={href({ filtro: t.value })}
              aria-current={filter === t.value ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                filter === t.value ? "bg-ink text-white" : "text-muted hover:bg-paper-deep hover:text-ink",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        {locations.length > 1 && (
          <div className="flex flex-wrap gap-1 text-sm">
            <Link href={href({ sede: "" })} className={cn("rounded-full px-3 py-1", !locationId ? "bg-surface shadow-card" : "text-muted")}>
              Tutte le sedi
            </Link>
            {locations.map((l) => (
              <Link key={l.id} href={href({ sede: l.id })} className={cn("rounded-full px-3 py-1", locationId === l.id ? "bg-surface shadow-card" : "text-muted")}>
                {l.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="card grid place-items-center gap-3 px-6 py-20 text-center">
          <Inbox className="size-10 text-line-strong" strokeWidth={1.5} aria-hidden />
          <p className="font-medium">Nessuna recensione qui</p>
          <p className="max-w-sm text-sm text-muted">
            {filter === "da-gestire" ? "Hai risposto a tutto. Le nuove recensioni compariranno qui dopo la sincronizzazione." : "Prova a cambiare filtro."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <Link
                href={`/app/recensioni/${r.id}`}
                className="card group flex gap-4 p-5 transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-pop"
              >
                <Avatar name={r.authorName} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium">{r.authorName}</span>
                    <Stars rating={r.rating} />
                    <span className="text-xs text-faint">
                      {relativeDate(r.reviewedAt)}
                      {locations.length > 1 && ` · ${r.location.name}`}
                    </span>
                    <span className="ml-auto">
                      <ReviewStatusBadge status={r.status} />
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-soft">
                    {r.comment ?? <span className="text-muted italic">Solo valutazione, senza testo.</span>}
                  </p>
                  {r.replyText && r.status !== "NEW" && (
                    <p className="mt-2 line-clamp-1 border-l-2 border-accent-line pl-3 text-sm text-muted">{r.replyText}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
