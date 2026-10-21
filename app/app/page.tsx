import { ArrowRight, Inbox, Link2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityChart } from "@/components/app/activity-chart";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { ReviewStatusBadge } from "@/components/app/review-status";
import { RatingMark } from "@/components/reviews/rating-mark";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Stars } from "@/components/ui/stars";
import { db } from "@/lib/db";
import { greeting, rating, relativeDate } from "@/lib/format";
import { activeLocationId } from "@/lib/location-scope";
import { inboxCounts, listReviews, reviewStats, weeklyActivity } from "@/lib/services/reviews";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Panoramica" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ benvenuto?: string }> }) {
  const ctx = await requireOrg();
  const locations = await db.location.findMany({
    where: { organizationId: ctx.organization.id, archivedAt: null },
    select: { id: true, name: true, connectionId: true, lastSyncedAt: true, connection: { select: { provider: true } } },
  });
  const locationId = await activeLocationId(locations.map((l) => l.id));
  const scope = locationId ? locations.filter((l) => l.id === locationId) : locations;
  const [stats, counts, recent, weeks, { benvenuto }] = await Promise.all([
    reviewStats(ctx, locationId),
    inboxCounts(ctx, locationId),
    listReviews(ctx, { status: "tutte", sort: "recenti", locationId }, 6),
    weeklyActivity(ctx, locationId),
    searchParams,
  ]);
  const unlinked = scope.filter((l) => !l.connectionId);
  const negativePending = await db.review.count({
    where: { organizationId: ctx.organization.id, location: { archivedAt: null }, ...(locationId ? { locationId } : {}), status: { in: ["NEW", "FAILED"] }, rating: { lte: 2 } },
  });
  const lastSync = scope.map((l) => l.lastSyncedAt).filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];
  const simulated = scope.some((l) => l.connection?.provider === "MOCK");
  const toHandle = counts.status["da-gestire"];

  return (
    <>
      <PageHeader
        title="Panoramica"
        description={`${greeting()}, ${ctx.user.name.split(" ")[0]} · ${locationId ? scope[0]?.name : locations.length > 1 ? "Tutte le sedi" : (locations[0]?.name ?? ctx.organization.name)}`}
        actions={
          <ButtonLink href="/app/recensioni" variant="secondary">
            <Inbox aria-hidden /> Apri la casella
          </ButtonLink>
        }
      />
      <PageBody>
        {benvenuto && (
          <p className="mb-6 rounded-[var(--radius-panel)] border border-positive/20 bg-positive-soft px-4 py-3 text-[13px] text-positive" role="status">
            Configurazione completata. Le tue recensioni sono nella casella: apri la prima e premi «Genera risposta».
          </p>
        )}

        {/* Next action */}
        {unlinked.length > 0 ? (
          <NextAction icon={Link2} title={`${unlinked.length === 1 ? "Una sede non è collegata" : `${unlinked.length} sedi non sono collegate`} a Google`} body="Collegala per importare le recensioni e rispondere da Reputia." href="/app/google" cta="Collega" />
        ) : toHandle > 0 ? (
          <NextAction
            icon={Inbox}
            title={`${toHandle} ${toHandle === 1 ? "recensione da gestire" : "recensioni da gestire"}`}
            body={negativePending > 0 ? `${negativePending} ${negativePending === 1 ? "è negativa" : "sono negative"}: conviene rispondere per prime.` : "L'assistente può preparare le bozze in pochi secondi."}
            href={negativePending > 0 ? "/app/recensioni?stelle=negative" : "/app/recensioni"}
            cta="Rispondi"
            emphasis
          />
        ) : (
          <NextAction icon={Inbox} title="Sei in pari con le recensioni" body="Ti avviseremo qui quando ne arriveranno di nuove." href="/app/recensioni?stato=tutte" cta="Vedi tutte" />
        )}

        {/* Metric strip */}
        <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-[var(--radius-panel)] border border-line lg:grid-cols-4">
          <Metric label="Valutazione media" value={stats.total ? rating(stats.average) : "—"} unit={stats.total ? "su 5" : undefined}>
            {stats.total > 0 && <Stars rating={Math.round(stats.average)} />}
          </Metric>
          <Metric label="Recensioni" value={String(stats.total)} note={`${stats.recent} negli ultimi 30 giorni`} />
          <Metric label="Da gestire" value={String(toHandle)} note={counts.status["da-approvare"] ? `${counts.status["da-approvare"]} in attesa di approvazione` : "In attesa di risposta"} />
          <Metric label="Tasso di risposta" value={`${stats.responseRate}%`} note={stats.published === 1 ? "1 risposta pubblicata" : `${stats.published} risposte pubblicate`} />
        </dl>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="panel p-5" aria-labelledby="activity-title">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="activity-title" className="text-sm font-semibold">
                Attività delle ultime 12 settimane
              </h2>
              <p className="text-xs text-faint">
                {simulated ? "Dati della simulazione" : "Dati da Google"}
                {lastSync && ` · aggiornato ${relativeDate(lastSync)}`}
              </p>
            </div>
            <ActivityChart data={weeks.map((w) => ({ ...w, weekStart: w.weekStart.toISOString() }))} />
          </section>

          <section className="panel flex flex-col" aria-labelledby="recent-title">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 id="recent-title" className="text-sm font-semibold">
                Ultime recensioni
              </h2>
              <Link href="/app/recensioni?stato=tutte" className="text-xs font-medium text-muted hover:text-ink">
                Vedi tutte
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState icon={Inbox} title="Ancora nessuna recensione">
                Collega Google o usa la simulazione per importarle.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link href={`/app/recensioni?stato=tutte&r=${r.id}`} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-subtle/70">
                      <RatingMark rating={r.rating} className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium">{r.authorName}</span>
                          <span className="ml-auto shrink-0 text-xs text-faint">{relativeDate(r.reviewedAt)}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">{r.comment ?? "Solo valutazione"}</p>
                        <ReviewStatusBadge status={r.status} className="mt-1" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </PageBody>
    </>
  );
}

function NextAction({ icon: Icon, title, body, href, cta, emphasis }: { icon: typeof Inbox; title: string; body: string; href: string; cta: string; emphasis?: boolean }) {
  return (
    <div className={emphasis ? "flex flex-wrap items-center gap-4 rounded-[var(--radius-panel)] border border-accent-line bg-accent-soft/50 px-5 py-4" : "flex flex-wrap items-center gap-4 rounded-[var(--radius-panel)] border border-line bg-canvas px-5 py-4"}>
      <span className={emphasis ? "grid size-9 place-items-center rounded-md bg-accent text-white" : "grid size-9 place-items-center rounded-md border border-line bg-surface text-muted"}>
        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[13px] text-muted">{body}</p>
      </div>
      <ButtonLink href={href} variant={emphasis ? "accent" : "secondary"}>
        {cta} <ArrowRight aria-hidden />
      </ButtonLink>
    </div>
  );
}

function Metric({ label, value, unit, note, children }: { label: string; value: string; unit?: string; note?: string; children?: React.ReactNode }) {
  return (
    <div className="border-line px-5 py-4 [&:not(:last-child)]:border-r max-lg:[&:nth-child(2)]:border-r-0 max-lg:[&:nth-child(-n+2)]:border-b">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[28px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{value}</span>
        {unit && <span className="text-xs text-faint">{unit}</span>}
      </dd>
      {children && <dd className="mt-1.5">{children}</dd>}
      {note && <dd className="mt-1.5 text-xs text-muted">{note}</dd>}
    </div>
  );
}
