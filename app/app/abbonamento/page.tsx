import { Check } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { checkoutAction, portalAction } from "@/app/app/abbonamento/actions";
import { getEntitlement } from "@/lib/billing/entitlement";
import { stripeConfigured } from "@/lib/billing/stripe";
import { longDate } from "@/lib/format";
import { formatEur, PLAN } from "@/lib/plans";
import { activeLocationCount } from "@/lib/services/locations";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Abbonamento" };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ esito?: string }> }) {
  const ctx = await requireOrg();
  const [entitlement, locations, { esito }] = await Promise.all([getEntitlement(ctx.organization.id), activeLocationCount(ctx.organization.id), searchParams]);
  const isOwner = ctx.role === "owner";
  const quantity = entitlement.subscription?.quantity ?? Math.max(1, locations);
  const total = PLAN.monthlyPriceEur * quantity;
  const hasSubscription = entitlement.state === "active" || entitlement.state === "past_due";

  return (
    <>
      <PageHeader eyebrow="Abbonamento" title="Piano e fatturazione" />
      {esito === "ok" && (
        <Notice tone="positive" className="mb-6">
          Grazie! Il pagamento è stato registrato. L&apos;attivazione può richiedere qualche secondo: se lo stato non è aggiornato, ricarica la pagina.
        </Notice>
      )}
      {esito === "annullato" && (
        <Notice className="mb-6">Pagamento annullato. Nessun addebito è stato effettuato.</Notice>
      )}
      {entitlement.state === "past_due" && (
        <Notice tone="danger" className="mb-6">
          L&apos;ultimo pagamento non è andato a buon fine. Aggiorna il metodo di pagamento dal portale per evitare la sospensione.
        </Notice>
      )}
      {entitlement.state === "expired" && (
        <Notice tone="warning" className="mb-6">
          Il periodo di prova è terminato. Le tue recensioni restano consultabili, ma per generare e pubblicare risposte serve l&apos;abbonamento.
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="card p-6 sm:p-8" aria-labelledby="plan-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="plan-title" className="text-sm text-muted">
                Il tuo piano
              </h2>
              <p className="display mt-1 text-3xl">Reputia {PLAN.name}</p>
            </div>
            <Badge tone={entitlement.state === "active" ? "positive" : entitlement.state === "trial" ? "accent" : "danger"}>
              {entitlement.state === "active"
                ? entitlement.subscription?.cancelAtPeriodEnd
                  ? "In scadenza"
                  : "Attivo"
                : entitlement.state === "trial"
                  ? `Prova · ${entitlement.daysLeft} ${entitlement.daysLeft === 1 ? "giorno" : "giorni"}`
                  : entitlement.state === "past_due"
                    ? "Pagamento non riuscito"
                    : "Prova terminata"}
            </Badge>
          </div>
          <dl className="mt-8 grid gap-4 border-t border-line pt-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Sedi</dt>
              <dd className="mt-1 font-medium">
                {quantity} × {formatEur(PLAN.monthlyPriceEur)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Totale mensile</dt>
              <dd className="mt-1 font-medium">{formatEur(total)} + IVA</dd>
            </div>
            {entitlement.state === "trial" && (
              <div>
                <dt className="text-muted">Fine della prova</dt>
                <dd className="mt-1 font-medium">{longDate(entitlement.trialEndsAt)}</dd>
              </div>
            )}
            {hasSubscription && entitlement.subscription?.currentPeriodEnd && (
              <div>
                <dt className="text-muted">{entitlement.subscription.cancelAtPeriodEnd ? "Termina il" : "Prossimo rinnovo"}</dt>
                <dd className="mt-1 font-medium">{longDate(entitlement.subscription.currentPeriodEnd)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-8">
            {!isOwner ? (
              <p className="text-sm text-muted">Solo il titolare può gestire l&apos;abbonamento.</p>
            ) : !stripeConfigured() ? (
              <Notice tone="warning">I pagamenti online non sono ancora attivi. Contattaci per attivare l&apos;abbonamento.</Notice>
            ) : hasSubscription ? (
              <ActionForm action={portalAction} className="grid justify-items-start gap-3">
                <SubmitButton pendingLabel="Apertura…">Gestisci pagamento e fatture</SubmitButton>
                <p className="text-xs text-muted">Metodo di pagamento, dati di fatturazione, fatture e disdetta, nel portale sicuro di Stripe.</p>
              </ActionForm>
            ) : (
              <ActionForm action={checkoutAction} className="grid justify-items-start gap-3">
                <SubmitButton size="lg" pendingLabel="Apertura del pagamento…">
                  Attiva l&apos;abbonamento
                </SubmitButton>
                <p className="text-xs text-muted">
                  {entitlement.state === "trial" ? "Non ti addebitiamo nulla prima della fine della prova. " : ""}Pagamento sicuro con Stripe. Disdici quando vuoi.
                </p>
              </ActionForm>
            )}
          </div>
        </section>
        <aside className="card p-6 sm:p-8">
          <h2 className="font-semibold">Cosa è incluso</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            {["Recensioni e sedi collegate a Google", "Bozze AI con il tuo tono di voce", "Pubblicazione con approvazione", "Team con ruoli", "Assistenza in italiano"].map((i) => (
              <li key={i} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden /> {i}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
