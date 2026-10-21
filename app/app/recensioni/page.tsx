import { Inbox, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InboxKeys } from "@/components/reviews/inbox-keys";
import { InboxToolbar } from "@/components/reviews/inbox-toolbar";
import { ReviewDetail } from "@/components/reviews/review-detail";
import { ReviewFilters } from "@/components/reviews/review-filters";
import { ReviewRow } from "@/components/reviews/review-row";
import { SyncButton } from "@/components/reviews/sync-button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import { activeLocationId } from "@/lib/location-scope";
import { hasRole } from "@/lib/roles";
import { getReview, inboxCounts, listReviews, pick, RATING_FILTERS, SORTS, STATUS_FILTERS, type RatingFilter } from "@/lib/services/reviews";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Recensioni" };

type Params = { stato?: string; stelle?: string; q?: string; ordine?: string; r?: string };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const ctx = await requireOrg();
  const params = await searchParams;
  const locations = await db.location.findMany({ where: { organizationId: ctx.organization.id, archivedAt: null }, select: { id: true } });
  const locationId = await activeLocationId(locations.map((l) => l.id));

  const status = pick(STATUS_FILTERS, params.stato, "da-gestire");
  const rating = params.stelle ? (pick(RATING_FILTERS, params.stelle, "negative") as RatingFilter) : undefined;
  const sort = pick(SORTS, params.ordine, "recenti");
  const q = params.q?.slice(0, 100);

  const [reviews, counts] = await Promise.all([listReviews(ctx, { status, rating, q, sort, locationId }), inboxCounts(ctx, locationId)]);
  const selectedId = params.r ?? null;
  const selected = selectedId ? await getReview(ctx, selectedId) : reviews[0] ? await getReview(ctx, reviews[0].id) : null;
  if (selectedId && !selected) notFound();

  const hrefFor = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    const merged: Record<string, string | undefined | null> = { stato: params.stato, stelle: params.stelle, q: params.q, ordine: params.ordine, r: params.r, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/app/recensioni?${s}` : "/app/recensioni";
  };
  const showLocation = locations.length > 1 && !locationId;
  const detailOpenOnMobile = Boolean(selectedId);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-18px)] lg:flex-row">
      <InboxKeys />
      {/* Filters rail */}
      <aside className={cn("shrink-0 border-line lg:w-56 lg:border-r", detailOpenOnMobile && "hidden lg:block")}>
        <div className="flex h-12 items-center justify-between border-b border-line px-4">
          <h1 className="text-[14px] font-semibold">Recensioni</h1>
          <SyncButton compact />
        </div>
        <div className="hidden p-2 lg:block">
          <ReviewFilters counts={counts} status={status} rating={rating} hrefFor={hrefFor} />
        </div>
        {/* Mobile: horizontal status chips */}
        <nav aria-label="Filtri" className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 lg:hidden">
          {(Object.keys(STATUS_FILTERS) as Array<keyof typeof STATUS_FILTERS>).map((k) => (
            <Link
              key={k}
              href={hrefFor({ stato: k === "da-gestire" ? null : k, r: null })}
              scroll={false}
              aria-current={status === k ? "true" : undefined}
              className={cn("shrink-0 rounded-md px-2.5 py-1 text-[13px]", status === k ? "bg-accent-soft font-medium text-ink" : "text-ink-2 hover:bg-subtle")}
            >
              {STATUS_FILTERS[k].label} <span className="font-mono text-[11px] text-muted">{counts.status[k]}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* List */}
      <section aria-label="Elenco recensioni" className={cn("flex min-h-0 flex-col border-line lg:w-[380px] lg:shrink-0 lg:border-r", detailOpenOnMobile && "hidden lg:flex")}>
        <Suspense>
          <InboxToolbar total={reviews.length} />
        </Suspense>
        {reviews.length === 0 ? (
          q ? (
            <EmptyState icon={SearchX} title="Nessun risultato">
              Nessuna recensione contiene «{q}» con questi filtri.
            </EmptyState>
          ) : (
            <EmptyState icon={Inbox} title={status === "da-gestire" ? "Sei in pari" : "Nessuna recensione"}>
              {status === "da-gestire" ? "Non ci sono recensioni in attesa di risposta. Quelle nuove compariranno qui." : "Nessuna recensione corrisponde a questo filtro."}
            </EmptyState>
          )
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {reviews.map((r) => (
              <ReviewRow key={r.id} review={r} href={hrefFor({ r: r.id })} selected={selectedId === r.id} autoSelected={!selectedId && selected?.id === r.id} showLocation={showLocation} />
            ))}
          </ul>
        )}
      </section>

      {/* Detail */}
      <section aria-label="Dettaglio recensione" className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto", !detailOpenOnMobile && "hidden lg:block")}>
        {selected ? (
          <ReviewDetail key={selected.id} review={selected} canPublish={hasRole(ctx.role, "admin")} backHref={hrefFor({ r: null })} />
        ) : (
          <EmptyState icon={Inbox} title="Seleziona una recensione" className="h-full">
            Scegli una recensione dall&apos;elenco per leggerla e preparare la risposta.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
