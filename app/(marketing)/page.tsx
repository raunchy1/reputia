import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusIcon } from "@/components/app/review-status";
import { AiMark } from "@/components/ui/ai-mark";
import { googleConfigured } from "@/lib/google/oauth";
import { formatEur, PLAN } from "@/lib/plans";
import inboxShot from "@/public/marketing/inbox.png";

const FAQ = [
  { q: "Le risposte vengono pubblicate in automatico?", a: "No. Ogni risposta resta una bozza finché non la approvi tu. La reputazione della tua attività rimane nelle tue mani." },
  {
    q: "L'intelligenza artificiale può inventare cose o promettere sconti?",
    a: "L'assistente segue regole precise: non promette sconti, rimborsi o omaggi, non inventa fatti e usa solo le informazioni che gli fornisci. Se una bozza contiene qualcosa da verificare, Reputia te lo segnala prima della pubblicazione.",
  },
  { q: "Come si collega a Google?", a: "Con l'autorizzazione ufficiale di Google: accedi con l'account che gestisce la scheda e concedi a Reputia il permesso di leggere le recensioni e pubblicare le risposte. Puoi revocarlo quando vuoi." },
  { q: "Ho più sedi. Come funziona?", a: `Ogni sede ha le sue recensioni e il suo tono di voce. Il prezzo è di ${formatEur(PLAN.monthlyPriceEur)} al mese per ogni sede.` },
  { q: "Posso far rispondere un collaboratore?", a: "Sì. I collaboratori preparano le bozze e le inviano per approvazione; tu o un amministratore decidete cosa pubblicare." },
  { q: "Posso disdire quando voglio?", a: "Sì, senza vincoli. L'abbonamento è mensile e si annulla dalla pagina Abbonamento: resta attivo fino alla fine del mese già pagato." },
];

/** The brand period: round like the logo's "punto" (the typeface's own period is square). */
function Period() {
  return (
    <>
      <span className="sr-only">.</span>
      <span className="ml-[0.04em] inline-block size-[0.15em] rounded-full bg-gold-bright align-baseline" aria-hidden />
    </>
  );
}

export default function HomePage() {
  const googleLive = googleConfigured();
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-night text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute top-[-240px] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-5 pt-20 sm:px-8 lg:pt-28">
          <p className="animate-rise font-mono text-xs text-white/50">Per ristoranti, hotel e attività locali italiane</p>
          <h1 className="mt-6 max-w-[15ch] animate-rise text-[52px] leading-[0.95] font-semibold tracking-[-0.055em] [animation-delay:60ms] sm:text-[80px] lg:text-[104px]">
            Ogni recensione merita la risposta giusta<Period />
          </h1>
          <div className="mt-10 grid animate-rise gap-8 [animation-delay:120ms] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <p className="max-w-[46ch] text-lg leading-relaxed text-white/60">
              Reputia legge le tue recensioni Google, scrive una bozza di risposta nel tono della tua attività e aspetta che sia tu a dire l&apos;ultima parola.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link href="/registrati" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-[14px] font-medium text-ink transition-colors hover:bg-white/90">
                Prova gratis per {PLAN.trialDays} giorni
              </Link>
              <Link href="/contatti" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-[14px] font-medium text-white/90 transition-colors hover:border-white/30 hover:bg-white/[0.04]">
                Prenota una demo <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
        <div className="relative mx-auto mt-16 max-w-[1280px] px-3 sm:px-8 lg:mt-20">
          <div className="animate-rise rounded-t-[16px] border border-b-0 border-white/10 bg-white/[0.03] p-1.5 pb-0 [animation-delay:180ms] sm:p-2.5 sm:pb-0">
            <div className="overflow-hidden rounded-t-[11px] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
              <Image src={inboxShot} alt="La casella di Reputia: elenco delle recensioni, filtri per stato e una bozza di risposta pronta da approvare." priority sizes="(min-width: 1280px) 1240px, 100vw" className="block h-auto w-full" />
            </div>
          </div>

        </div>
      </section>

      <p className="bg-night pt-4 pb-6 text-center font-mono text-[11px] text-white/55">Interfaccia reale di Reputia · recensioni di esempio</p>

      {/* ───────── Principles ───────── */}
      <section aria-label="Principi" className="border-b border-line bg-surface">
        <ul className="mx-auto grid max-w-[1200px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
          {["Nulla si pubblica senza di te", "API ufficiale di Google", "Pensato per l'italiano", "Disdici quando vuoi"].map((t, i) => (
            <li key={t} className={`flex items-center gap-2.5 py-5 text-[13px] text-ink-2 ${i % 2 ? "pl-5" : ""} ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""}`}>
              <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="come-funziona" className="scroll-mt-16 bg-canvas">
        <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <h2 className="max-w-[14ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[56px]">
              Dalla recensione alla risposta, in tre gesti<Period />
            </h2>
            <p className="max-w-[44ch] self-end text-[17px] leading-relaxed text-muted">
              Niente pannelli complicati. Una casella con le recensioni da gestire, una bozza scritta per te e un pulsante per pubblicarla quando ti convince.
            </p>
          </div>

          <ol className="mt-16 divide-y divide-line border-y border-line">
            <Step n="01" title="Le recensioni arrivano da sole" body="Reputia importa le recensioni della tua scheda Google e le mette in fila: prima quelle che aspettano una risposta, con quelle negative in evidenza.">
              <div className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line text-[13px]">
                {[
                  ["NEW", "Paolo G.", 2, "Porzioni piccole per il prezzo."],
                  ["NEW", "Giulia B.", 4, "Il tiramisù è da provare."],
                  ["PUBLISHED", "Davide R.", 4, "Ottimo rapporto qualità-prezzo."],
                ].map(([s, n, r, t]) => (
                  <div key={n as string} className="flex items-center gap-3 bg-surface px-4 py-3">
                    <StatusIcon status={s as "NEW"} />
                    <span className="font-medium">{n}</span>
                    <span className={`font-mono text-[11px] ${(r as number) <= 2 ? "text-danger" : "text-ink-2"}`}>{r}★</span>
                    <span className="truncate text-muted">{t}</span>
                  </div>
                ))}
              </div>
            </Step>
            <Step n="02" title="L'assistente prepara la bozza" body="Nel tono che hai scelto, con le informazioni vere della tua attività. Non promette sconti, non inventa fatti, non ammette colpe che non hai verificato.">
              <div className="rounded-[10px] border border-line bg-surface">
                <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">
                  <AiMark className="size-[6px]" /> Bozza dell&apos;assistente · Cordiale
                </div>
                <p className="px-4 py-3.5 text-[14px] leading-relaxed text-ink-2">
                  Gentile Paolo, grazie per il riscontro sulle porzioni: lo condivideremo con la cucina. Ci farebbe piacere sapere cosa avete ordinato, se vuole scriverci.
                </p>
              </div>
            </Step>
            <Step n="03" title="Tu metti il punto" body="Rileggi, ritocchi se serve e pubblichi su Google. I collaboratori possono preparare le bozze; pubblichi solo tu o chi autorizzi.">
              <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line bg-surface px-4 py-3.5">
                <span className="flex items-center gap-2 text-[13px] text-ink-2">
                  <span className="grid size-4 place-items-center rounded-[4px] bg-ink text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  Ho riletto la risposta
                </span>
                <span className="ml-auto inline-flex h-8 items-center rounded-md bg-ink px-3 text-[13px] font-medium text-white">Pubblica su Google</span>
              </div>
            </Step>
          </ol>
        </div>
      </section>

      {/* ───────── Brand idea ───────── */}
      <section className="bg-night text-white">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-24">
          <span className="block size-28 rounded-full bg-gold-bright shadow-[0_0_120px_rgb(232_176_74/0.35)] sm:size-40" aria-hidden />
          <div>
            <h2 className="max-w-[18ch] text-[36px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[52px]">Un punto d&apos;oro, dove serve la tua parola.</h2>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-white/60">
              In Reputia il punto segna ciò che aspetta te: una recensione senza risposta, una bozza scritta dall&apos;assistente, un&apos;approvazione in sospeso. Quando rispondi, il punto si chiude. Come in
              una frase ben scritta.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Google ───────── */}
      <section id="google" className="scroll-mt-16 bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-14 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="max-w-[14ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[52px]">Collegato a Google, come si deve<Period /></h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted">
              Reputia usa l&apos;API ufficiale di Google Business Profile. Autorizzi l&apos;accesso dal tuo account Google, senza condividere password, e puoi revocarlo quando vuoi.
            </p>
            {!googleLive && (
              <p className="mt-6 max-w-[46ch] border-l-2 border-gold pl-4 text-[14px] leading-relaxed text-ink-2">
                Il collegamento è in fase di approvazione da parte di Google. Nel frattempo puoi provare Reputia con recensioni di esempio, sempre indicate come tali.
              </p>
            )}
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {[
              ["Legge", "Recensioni, valutazioni e risposte già pubblicate delle sedi che colleghi."],
              ["Pubblica", "Solo le risposte che approvi tu o un amministratore, con un clic esplicito."],
              ["Non tocca", "Orari, foto e dati della scheda. Nessun accesso a email o altri servizi Google."],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-6 py-6">
                <dt className="font-mono text-[12px] text-muted">{k}</dt>
                <dd className="text-[16px] leading-relaxed text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Pricing ───────── */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <h2 className="text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[56px]">Un piano, un prezzo<Period /></h2>
              <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-muted">Tutto incluso, per ogni sede che colleghi. {PLAN.trialDays} giorni per provarlo sulle tue recensioni, senza carta.</p>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-7 shadow-card sm:p-9">
              <div className="flex items-baseline gap-3">
                <span className="text-[72px] leading-none font-semibold tracking-[-0.06em]">{formatEur(PLAN.monthlyPriceEur)}</span>
                <span className="font-mono text-[12px] leading-tight text-muted">
                  al mese per sede
                  <br />
                  IVA esclusa
                </span>
              </div>
              <ul className="mt-7 grid gap-2.5 text-[14px] text-ink-2 sm:grid-cols-2">
                {["Recensioni da Google", "Bozze con il tuo tono", "Avvisi sulle promesse", "Approvazione obbligatoria", "Team con ruoli", "Assistenza in italiano"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="size-3.5 text-ink" strokeWidth={2.5} aria-hidden /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/registrati" className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-ink text-[14px] font-medium text-white transition-colors hover:bg-ink-2">
                Inizia la prova gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section id="domande" className="scroll-mt-16 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[48px]">Domande frequenti</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="relative overflow-hidden bg-night text-white">
        <div className="pointer-events-none absolute bottom-[-280px] left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-5 py-32 text-center sm:px-8">
          <h2 className="text-[56px] leading-[0.95] font-semibold tracking-[-0.055em] sm:text-[96px]">
            Mettiamoci un punto<Period />
          </h2>
          <p className="mx-auto mt-6 max-w-[44ch] text-[17px] text-white/60">Quindici minuti su Google Meet per vedere Reputia sulle tue recensioni. Oppure inizia subito, da solo.</p>
          <div className="mt-10 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link href="/contatti" className="inline-flex h-11 items-center justify-center rounded-md bg-white px-5 text-[14px] font-medium text-ink hover:bg-white/90">
              Prenota la demo
            </Link>
            <Link href="/registrati" className="inline-flex h-11 items-center justify-center rounded-md border border-white/15 px-5 text-[14px] font-medium text-white/90 hover:border-white/30 hover:bg-white/[0.04]">
              Inizia gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({ n, title, body, children }: { n: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <li className="grid gap-8 py-12 lg:grid-cols-[80px_minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <span className="font-mono text-[13px] text-muted">{n}</span>
      <div>
        <h3 className="text-[24px] leading-tight font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-3 max-w-[42ch] text-[16px] leading-relaxed text-muted">{body}</p>
      </div>
      <div className="self-center">{children}</div>
    </li>
  );
}
