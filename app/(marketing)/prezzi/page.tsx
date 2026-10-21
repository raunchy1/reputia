import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { formatEur, PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Prezzi", description: `Reputia costa ${formatEur(PLAN.monthlyPriceEur)} al mese per sede. Prova gratuita di ${PLAN.trialDays} giorni, senza carta.` };

const INCLUDED = [
  ["Le recensioni Google in un solo posto", "Tutte le recensioni della sede arrivano in una lista ordinata, con quelle senza risposta in cima."],
  ["Una bozza pronta per ogni recensione", "L'assistente scrive una risposta che parla di quello che il cliente ha detto, in italiano o nella sua lingua."],
  ["Il tuo tono di voce", "Cordiale, caloroso, elegante o diretto; breve, media o dettagliata. E le informazioni sulla tua attività che vuoi far usare."],
  ["Avvisi prima di pubblicare", "Se una bozza promette sconti o rimborsi, ammette colpe o contiene un numero di telefono, Reputia te lo segnala."],
  ["Pubblicazione su Google con un clic", "Solo dopo che hai letto e approvato. Niente parte mai in automatico."],
  ["Lavoro di squadra", "Inviti collaboratori che preparano le bozze; pubblica solo chi autorizzi tu."],
  ["Assistenza in italiano", "Scrivi via email e ti risponde una persona, in italiano."],
] as const;

const EXAMPLES = [1, 2, 3, 5];

const TRIAL = [
  ["Oggi", "Ti registri con email e password. Non ti chiediamo la carta."],
  [`Per ${PLAN.trialDays} giorni`, "Usi Reputia per davvero: colleghi la scheda, generi bozze, pubblichi risposte. Tutto funziona, senza limiti di funzioni."],
  ["Alla fine della prova", "Decidi tu. Se ti è utile, scegli l'abbonamento e inserisci la carta. Se non fai niente, Reputia si ferma e non paghi niente."],
] as const;

const FAQ = [
  ["Ci sono costi di attivazione o di installazione?", "No. Paghi solo l'abbonamento mensile per le sedi collegate. Non c'è niente da installare e niente da configurare a pagamento."],
  ["Il prezzo cambia se ricevo tante recensioni?", "No. Il prezzo dipende solo da quante sedi colleghi, non da quante recensioni ricevi o da quante risposte pubblichi."],
  ["Cosa vuol dire «per sede»?", "Una sede è un'attività con la sua scheda su Google: un ristorante, un hotel, un negozio. Se hai due pizzerie in due vie diverse, con due schede Google, sono due sedi."],
  ["Come si paga?", "Con carta, tramite Stripe, uno dei sistemi di pagamento più usati al mondo. Reputia non vede né conserva i dati della tua carta."],
  ["Il prezzo è IVA inclusa?", `No: ${formatEur(PLAN.monthlyPriceEur)} è il prezzo IVA esclusa. L'eventuale IVA viene aggiunta al momento del pagamento.`],
  ["Come disdico?", "Dalla pagina Abbonamento, dentro Reputia, con un clic. Non serve scrivere, telefonare o mandare raccomandate. L'abbonamento resta attivo fino alla fine del mese già pagato, poi si ferma."],
] as const;

function Period() {
  return (
    <>
      <span className="sr-only">.</span>
      <span className="ml-[0.04em] inline-block size-[0.15em] rounded-full bg-gold align-baseline" aria-hidden />
    </>
  );
}

export default function PricingPage() {
  const price = PLAN.monthlyPriceEur;
  return (
    <>
      {/* ───────── Intro + card ───────── */}
      <section className="bg-canvas">
        <div className="mx-auto grid max-w-[1200px] gap-14 px-5 pt-20 pb-24 sm:px-8 lg:grid-cols-[1fr_1fr] lg:pt-28">
          <div>
            <p className="font-mono text-xs text-muted">Prezzi</p>
            <h1 className="mt-5 max-w-[12ch] text-[48px] leading-[0.98] font-semibold tracking-[-0.05em] sm:text-[72px]">
              Un prezzo semplice, spiegato bene<Period />
            </h1>
            <div className="mt-8 max-w-[46ch] space-y-5 text-[17px] leading-[1.7] text-muted">
              <p>
                Reputia ha un solo piano, con tutto dentro. Costa <strong className="font-semibold text-ink">{formatEur(price)} al mese per ogni sede</strong> che colleghi. Non ci sono
                versioni base o pro, pacchetti da confrontare o funzioni che si sbloccano pagando di più.
              </p>
              <p>
                Puoi provarlo gratis per {PLAN.trialDays} giorni sulle tue vere recensioni, senza inserire la carta. Se non ti convince, non fai niente e non paghi niente.
              </p>
            </div>
          </div>

          <div className="self-start rounded-[16px] border border-line bg-surface p-7 shadow-card sm:p-9">
            <div className="flex items-baseline gap-3">
              <span className="text-[80px] leading-none font-semibold tracking-[-0.06em]">{formatEur(price)}</span>
              <span className="font-mono text-[12px] leading-tight text-muted">
                al mese per sede
                <br />
                IVA esclusa
              </span>
            </div>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {INCLUDED.map(([t, d]) => (
                <li key={t} className="flex gap-3.5 py-3.5">
                  <span className="mt-[3px] grid size-5 shrink-0 place-items-center rounded-full bg-ink text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{t}</p>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-ink text-[15px] font-medium text-white transition-colors hover:bg-ink-2">
              Prova gratis per {PLAN.trialDays} giorni
            </Link>
            <p className="mt-3 text-center text-[12.5px] text-muted">Nessuna carta richiesta per la prova</p>
          </div>
        </div>
      </section>

      {/* ───────── Examples ───────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="max-w-[14ch] text-[36px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[48px]">Quanto pagherai, con un esempio<Period /></h2>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-[1.7] text-muted">
              Il conto è facile: prendi il numero delle tue sedi e lo moltiplichi per {formatEur(price)}. Se a metà mese aggiungi o archivi una sede, l&apos;importo si adegua in
              proporzione, senza penali.
            </p>
          </div>
          <table className="w-full self-center text-left">
            <caption className="sr-only">Prezzo mensile in base al numero di sedi</caption>
            <thead>
              <tr className="border-b border-line-strong font-mono text-[12px] text-muted">
                <th scope="col" className="pb-3 font-normal">Sedi collegate</th>
                <th scope="col" className="pb-3 text-right font-normal">Al mese, IVA esclusa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {EXAMPLES.map((n) => (
                <tr key={n}>
                  <td className="py-4 text-[16px] text-ink">
                    {n} {n === 1 ? "sede" : "sedi"}
                    {n === 1 && <span className="ml-2 text-[13px] text-muted">un ristorante, un hotel, un negozio</span>}
                  </td>
                  <td className="py-4 text-right text-[20px] font-semibold tracking-[-0.02em] tabular-nums">{formatEur(price * n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────── Trial ───────── */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
          <h2 className="max-w-[18ch] text-[36px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[48px]">Come funziona la prova gratuita<Period /></h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-3">
            {TRIAL.map(([k, v]) => (
              <li key={k} className="bg-surface p-7 sm:p-8">
                <p className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.02em]">
                  <span className="size-2 rounded-full bg-gold" aria-hidden />
                  {k}
                </p>
                <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">{v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="text-[36px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[44px]">Domande sul prezzo</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="bg-night text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[16ch] text-[40px] leading-[1] font-semibold tracking-[-0.05em] sm:text-[56px]">
              Provalo sulle tue recensioni<span className="sr-only">.</span>
              <span className="ml-[0.04em] inline-block size-[0.15em] rounded-full bg-gold-bright align-baseline" aria-hidden />
            </h2>
            <p className="mt-5 max-w-[46ch] text-[17px] text-white/60">{PLAN.trialDays} giorni gratis, senza carta. Oppure prenota quindici minuti e te lo mostriamo noi.</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link href="/registrati" className="inline-flex h-11 items-center justify-center rounded-md bg-white px-5 text-[14px] font-medium text-ink hover:bg-white/90">
              Inizia gratis
            </Link>
            <Link href="/contatti" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-[14px] font-medium text-white/90 hover:border-white/30 hover:bg-white/[0.04]">
              Prenota una demo <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
