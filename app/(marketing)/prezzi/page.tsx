import { Check } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { formatEur, PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Prezzi", description: `Reputia costa ${formatEur(PLAN.monthlyPriceEur)} al mese per sede. Prova gratuita di ${PLAN.trialDays} giorni.` };

const INCLUDED = [
  "Importazione automatica delle recensioni Google",
  "Bozze di risposta scritte dall'AI, in italiano",
  "Tono di voce e informazioni personalizzabili per ogni sede",
  "Avvisi su promesse o dati sensibili nelle bozze",
  "Pubblicazione su Google con un clic, dopo la tua approvazione",
  "Team: collaboratori e amministratori",
  "Assistenza in italiano via email",
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-28">
      <div className="text-center">
        <p className="eyebrow">Prezzi</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">Semplice, come deve essere.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">Un piano unico, pagato mese per mese. Paghi solo per le sedi che colleghi.</p>
      </div>
      <div className="card mx-auto mt-14 grid max-w-3xl overflow-hidden md:grid-cols-[1fr_1.1fr]">
        <div className="bg-ink p-8 text-white sm:p-10">
          <p className="text-sm font-medium text-white/70">Reputia {PLAN.name}</p>
          <p className="display mt-6 text-6xl">{formatEur(PLAN.monthlyPriceEur)}</p>
          <p className="mt-2 text-sm text-white/70">al mese per sede · IVA esclusa</p>
          <ButtonLink href="/registrati" variant="secondary" size="lg" className="mt-8 w-full border-0">
            Prova gratis {PLAN.trialDays} giorni
          </ButtonLink>
          <p className="mt-3 text-center text-xs text-white/60">Nessuna carta richiesta per la prova</p>
        </div>
        <ul className="grid content-center gap-3.5 p-8 sm:p-10">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-3 text-[15px]">
              <Check className="mt-0.5 size-4.5 shrink-0 text-positive" aria-hidden /> {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-6 text-sm leading-relaxed text-muted sm:grid-cols-2">
        <p>
          <strong className="text-ink">Più sedi?</strong> Il totale si calcola sul numero di sedi attive. Aggiungi o archivia una sede e l&apos;importo si adegua in
          proporzione.
        </p>
        <p>
          <strong className="text-ink">Fatturazione.</strong> Pagamento sicuro tramite Stripe, con fattura per ogni rinnovo.
        </p>
      </div>
    </section>
  );
}
