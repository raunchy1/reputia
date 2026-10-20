import { ArrowRight, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/app/avatar";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Stars } from "@/components/ui/stars";
import { greeting, rating, relativeDate } from "@/lib/format";
import { listReviews, reviewStats } from "@/lib/services/reviews";
import { listLocations } from "@/lib/services/locations";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Panoramica" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ benvenuto?: string }> }) {
  const ctx = await requireOrg();
  const [stats, todo, locations, { benvenuto }] = await Promise.all([
    reviewStats(ctx),
    listReviews(ctx, { filter: "da-gestire", take: 4 }),
    listLocations(ctx),
    searchParams,
  ]);
  const unlinked = locations.filter((l) => !l.connection).length;
  const maxCount = Math.max(1, ...stats.distribution.map((d) => d.count));

  return (
    <>
      <PageHeader
        eyebrow={ctx.organization.name}
        title={`${greeting()}, ${ctx.user.name.split(" ")[0]}`}
        description={
          stats.pending > 0 ? (
            <>
              Hai <strong className="font-semibold text-ink">{stats.pending}</strong> {stats.pending === 1 ? "recensione" : "recensioni"} in attesa di risposta.
            </>
          ) : (
            "Sei in pari con tutte le recensioni. Ottimo lavoro."
          )
        }
        actions={
          stats.pending > 0 ? (
            <ButtonLink href="/app/recensioni" size="lg">
              Rispondi ora <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          ) : undefined
        }
      />

      {benvenuto && (
        <Notice tone="positive" className="mb-8">
          Tutto pronto! Apri una recensione e premi &laquo;Genera risposta&raquo;: l&apos;assistente scriverà una bozza che potrai modificare e approvare.
        </Notice>
      )}
      {unlinked > 0 && (
        <Notice tone="warning" className="mb-8">
          {unlinked === 1 ? "Una sede non è collegata" : `${unlinked} sedi non sono collegate`} a Google.{" "}
          <Link href="/app/google" className="font-medium underline underline-offset-2">
            Collega ora
          </Link>
        </Notice>
      )}

      <section aria-label="Indicatori" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Valutazione media" value={stats.total ? rating(stats.average) : "—"} suffix={stats.total ? "/ 5" : undefined}>
          {stats.total > 0 && <Stars rating={Math.round(stats.average)} className="mt-2" />}
        </Metric>
        <Metric label="Recensioni totali" value={String(stats.total)} note={`${stats.recent} negli ultimi 30 giorni`} />
        <Metric label="Da gestire" value={String(stats.pending)} note={stats.pending ? "In attesa di risposta" : "Nessuna in attesa"} highlight={stats.pending > 0} />
        <Metric label="Tasso di risposta" value={`${stats.responseRate}%`} note={`${stats.published} risposte pubblicate`} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="card p-6" aria-labelledby="todo-title">
          <div className="flex items-center justify-between">
            <h2 id="todo-title" className="font-semibold">
              Da rispondere
            </h2>
            <Link href="/app/recensioni" className="text-sm text-muted hover:text-ink">
              Vedi tutte →
            </Link>
          </div>
          {todo.length === 0 ? (
            <div className="grid place-items-center gap-2 py-12 text-center">
              <MessageSquareText className="size-8 text-line-strong" aria-hidden />
              <p className="text-sm text-muted">Nessuna recensione in attesa.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {todo.map((r) => (
                <li key={r.id}>
                  <Link href={`/app/recensioni/${r.id}`} className="group -mx-3 flex gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-paper">
                    <Avatar name={r.authorName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">{r.authorName}</span>
                        <span className="shrink-0 text-xs text-faint">{relativeDate(r.reviewedAt)}</span>
                      </div>
                      <Stars rating={r.rating} className="mt-1" />
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted">{r.comment ?? "Solo valutazione, senza testo."}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6" aria-labelledby="dist-title">
          <h2 id="dist-title" className="font-semibold">
            Distribuzione delle valutazioni
          </h2>
          <ul className="mt-5 grid gap-3">
            {stats.distribution.map((d) => (
              <li key={d.stars} className="grid grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
                <span className="text-muted tabular-nums">{d.stars} ★</span>
                <span className="h-2 overflow-hidden rounded-full bg-paper-deep">
                  <span
                    className={d.stars >= 4 ? "block h-full rounded-full bg-ink" : d.stars === 3 ? "block h-full rounded-full bg-star" : "block h-full rounded-full bg-danger/70"}
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </span>
                <span className="text-right text-muted tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-line pt-4 text-[13px] text-muted">
            {stats.aiDrafts} bozze generate dall&apos;assistente negli ultimi 30 giorni.
          </p>
        </section>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  suffix,
  note,
  highlight,
  children,
}: {
  label: string;
  value: string;
  suffix?: string;
  note?: string;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={highlight ? "card border-accent-line bg-accent-soft/50 p-5" : "card p-5"}>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="display text-[34px] leading-none tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-faint">{suffix}</span>}
      </p>
      {children}
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
    </div>
  );
}
