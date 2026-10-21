import { ArrowRight, Check, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusIcon } from "@/components/app/review-status";
import { AiMark } from "@/components/ui/ai-mark";
import { GlyphApprove, GlyphArrive, GlyphClose, GlyphDraft, GlyphFree, GlyphGoogle, GlyphItalyFlag, GlyphPublish, GlyphRead, GlyphUntouched } from "@/components/marketing/glyphs";
import { googleConfigured } from "@/lib/google/oauth";
import { formatEur, PLAN } from "@/lib/plans";
import inboxShot from "@/public/marketing/inbox.png";

const FAQ = [
  {
    q: "Devo essere bravo con il computer?",
    a: "No. Se sai usare WhatsApp o Gmail, sai usare Reputia. Ci sono tre cose: una lista di recensioni, un testo da leggere e un pulsante da premere. Il resto lo fa Reputia.",
  },
  { q: "Funziona anche dal telefono?", a: "Sì. Reputia si apre dal browser del telefono, del tablet o del computer, senza installare niente. Puoi rispondere a una recensione anche dal bancone, tra un cliente e l'altro." },
  { q: "Le risposte vengono pubblicate in automatico?", a: "No, mai. Ogni risposta resta una bozza finché non la leggi e premi «Pubblica su Google». La reputazione della tua attività rimane nelle tue mani." },
  {
    q: "Reputia può cancellare le recensioni negative?",
    a: "No, e diffida di chi te lo promette: le recensioni le gestisce solo Google. Quello che puoi fare, e che conta davvero, è rispondere bene. Chi legge una critica seguita da una risposta calma e gentile vede un titolare che ascolta, non un problema.",
  },
  {
    q: "Le risposte sembrano scritte da un robot?",
    a: "Ogni bozza parte da quella recensione precisa: se il cliente parla del tiramisù, la risposta parla del tiramisù. L'assistente scrive come scriverebbe un titolare, senza emoji e senza hashtag, nel tono che scegli tu. E prima di pubblicare la rileggi sempre, quindi puoi cambiare ogni parola.",
  },
  {
    q: "L'intelligenza artificiale può inventare cose o promettere sconti?",
    a: "L'assistente segue regole precise: non promette sconti, rimborsi o omaggi, non inventa fatti e usa solo le informazioni che gli fornisci. Se una bozza contiene qualcosa da verificare, Reputia te lo segnala prima della pubblicazione.",
  },
  { q: "Come si collega a Google?", a: "Con l'autorizzazione ufficiale di Google: accedi con l'account che gestisce la scheda e concedi a Reputia il permesso di leggere le recensioni e pubblicare le risposte. Puoi revocarlo quando vuoi." },
  { q: "Ho più sedi. Come funziona?", a: `Ogni sede ha le sue recensioni e il suo tono di voce. Il prezzo è di ${formatEur(PLAN.monthlyPriceEur)} al mese per ogni sede.` },
  { q: "Posso far rispondere un collaboratore?", a: "Sì. I collaboratori preparano le bozze e le inviano per approvazione; tu o un amministratore decidete cosa pubblicare." },
  { q: "Posso disdire quando voglio?", a: "Sì, senza vincoli. L'abbonamento è mensile e si annulla dalla pagina Abbonamento: resta attivo fino alla fine del mese già pagato." },
  {
    q: "Cosa succede quando finisce la prova gratuita?",
    a: `Niente di automatico. Durante la prova non ti chiediamo la carta, quindi nessuno ti addebita nulla. Se vuoi continuare, scegli l'abbonamento e inserisci la carta; se non fai niente, Reputia smette di scrivere e pubblicare risposte e le tue recensioni restano dove sono, su Google.`,
  },
];

const WHY = [
  {
    t: "I clienti leggono anche le risposte",
    d: "Prima di scegliere dove mangiare, dormire o comprare, tante persone aprono Google e leggono le recensioni. Sotto ogni recensione c'è la tua risposta, oppure un silenzio. Una risposta gentile dice a chi legge: qui c'è qualcuno che ascolta.",
  },
  {
    t: "Una critica senza risposta resta lì da sola",
    d: "Se qualcuno scrive «abbiamo aspettato un'ora» e nessuno risponde, chi legge sente solo quella versione. Una risposta calma, che si scusa per il disagio e invita a parlarne, racconta anche la tua parte. Senza litigare.",
  },
  {
    t: "Dire grazie è facile, ma va fatto",
    d: "Anche chi lascia cinque stelle è contento di ricevere un grazie personale. È il modo più semplice per farsi ricordare e invitare le persone a tornare. Il difficile è trovare il tempo di farlo per tutti: è qui che entra Reputia.",
  },
];

const DOES = [
  "Raccoglie in una sola lista le recensioni Google di tutte le tue sedi",
  "Scrive per ogni recensione una risposta pronta, nel tuo tono",
  "Ti avvisa se una bozza promette sconti o rimborsi, o contiene un numero di telefono",
  "Pubblica la risposta su Google, ma solo quando lo decidi tu",
  "Ti permette di farti aiutare da un collaboratore, con permessi diversi",
];

const DOES_NOT = [
  "Non pubblica niente da solo. Mai.",
  "Non cancella e non nasconde le recensioni negative: nessuno può farlo al posto di Google",
  "Non scrive recensioni finte e non ne compra",
  "Non tocca orari, foto o altri dati della tua scheda Google",
  "Non ti lega con un contratto: disdici quando vuoi",
];

const FOR_WHO = [
  ["Ristoranti, pizzerie e bar", "Arrivano tante recensioni e il tempo tra un servizio e l'altro è poco. Con le bozze già pronte, rispondere diventa questione di minuti, non di serate."],
  ["Hotel, B&B e case vacanza", "Gli ospiti arrivano da tutto il mondo. Reputia può rispondere in italiano oppure nella lingua in cui il cliente ha scritto: inglese, tedesco, francese o spagnolo."],
  ["Negozi, artigiani e servizi", "Parrucchieri, palestre, officine, studi: ogni recensione è una persona che ti conosce. Scegli il tono elegante o diretto e rileggi tutto con calma prima di pubblicare."],
  ["Chi ha più di una sede", "Ogni sede ha le sue recensioni, il suo tono e le sue informazioni. Un solo accesso, una sola fattura, e passi da una sede all'altra con un clic."],
] as const;

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
          <p className="animate-rise font-mono text-xs text-white/50">Per ristoranti, hotel, B&amp;B, negozi e studi: chiunque abbia una scheda su Google</p>
          <h1 className="mt-6 max-w-[15ch] animate-rise text-[52px] leading-[0.95] font-semibold tracking-[-0.055em] [animation-delay:60ms] sm:text-[80px] lg:text-[104px]">
            Ogni recensione merita la risposta giusta<Period />
          </h1>
          <div className="mt-10 grid animate-rise gap-8 [animation-delay:120ms] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <p className="max-w-[52ch] text-lg leading-relaxed text-white/65">
              Reputia ti aiuta a rispondere alle recensioni che i clienti lasciano su Google. Le raccoglie in un unico posto, scrive per te una risposta gentile e
              ben fatta, e la pubblica solo quando tu dici «va bene». Tu non devi più cercare le parole: leggi, decidi, fatto.
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
          {(
            [
              [GlyphApprove, "Nulla si pubblica senza di te"],
              [GlyphGoogle, "API ufficiale di Google"],
              [GlyphItalyFlag, "Pensato per l'italiano"],
              [GlyphFree, "Disdici quando vuoi"],
            ] as const
          ).map(([Glyph, t], i) => (
            <li key={t} className={`flex items-center gap-3 py-5 text-[13px] text-ink-2 ${i % 2 ? "pl-5" : ""} ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""}`}>
              <Glyph className="size-7" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── In plain words ───────── */}
      <section id="cos-e" className="scroll-mt-16 bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <h2 className="max-w-[13ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[56px]">
              Cos&apos;è Reputia, spiegato semplice<Period />
            </h2>
            <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-muted">Immagina un assistente seduto accanto a te, che conosce la tua attività e scrive molto bene.</p>
          </div>
          <div className="space-y-6 text-[18px] leading-[1.7] text-ink-2">
            <p>
              Quando un cliente lascia una recensione su Google, per esempio <em>«Pizza buonissima!»</em> oppure <em>«Abbiamo aspettato un&apos;ora»</em>, tutti quelli che cercano la tua
              attività la possono leggere. E possono leggere anche la tua risposta, o accorgersi che non hai risposto.
            </p>
            <p>
              Rispondere a tutti richiede tempo. E trovare le parole giuste per una critica non è facile, soprattutto a fine giornata, quando sei stanco. Così molte recensioni restano senza
              risposta.
            </p>
            <p>
              Reputia fa la parte faticosa al posto tuo. Ti mostra le recensioni nuove, prepara una risposta già scritta e te la propone. Tu la leggi, se vuoi cambi una parola, e premi{" "}
              <strong className="font-semibold text-ink">Pubblica</strong>. La risposta compare su Google, sotto la recensione, come risposta del titolare.
            </p>
            <p className="border-l-2 border-gold pl-5 text-ink">Tutto qui. Niente da installare, niente da imparare: una lista, un testo, un pulsante.</p>
          </div>
        </div>
      </section>

      {/* ───────── Why it matters ───────── */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8">
          <h2 className="max-w-[18ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[52px]">Perché rispondere alle recensioni<Period /></h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.t} className="bg-surface p-7 sm:p-8">
                <h3 className="text-[20px] leading-snug font-semibold tracking-[-0.025em]">{w.t}</h3>
                <p className="mt-4 text-[15.5px] leading-[1.7] text-muted">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="come-funziona" className="scroll-mt-16 bg-canvas [--glyph-gap:var(--color-canvas)]">
        <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <h2 className="max-w-[14ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[56px]">
              Dalla recensione alla risposta, in tre gesti<Period />
            </h2>
            <p className="max-w-[46ch] self-end text-[17px] leading-relaxed text-muted">
              Niente pannelli complicati. Ecco cosa succede, passo per passo, dal momento in cui un cliente scrive una recensione a quando la tua risposta compare su Google.
            </p>
          </div>

          <ol className="mt-16 divide-y divide-line border-y border-line">
            <Step glyph={<GlyphArrive className="size-14" />} title="Le recensioni arrivano da sole"
              body="Colleghi la tua scheda Google una volta sola, con il tuo account, come quando accedi a Gmail. Da quel momento premi «Sincronizza» e Reputia porta dentro le recensioni nuove, in una lista ordinata."
              points={["Vedi subito quali aspettano ancora una risposta", "Le recensioni da 1 o 2 stelle si trovano con un clic", "Se hai più sedi, ognuna ha la sua lista"]}
            >
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
            <Step glyph={<GlyphDraft className="size-14" />} title="L'assistente prepara la bozza"
              body="Apri una recensione e premi «Genera risposta». In pochi secondi l'assistente scrive una risposta che parla di quello che il cliente ha detto davvero: se ha lodato il tiramisù, ringrazia per il tiramisù; se si è lamentato dell'attesa, risponde sull'attesa."
              points={[
                "Scegli il tono: cordiale, caloroso, elegante o diretto",
                "Scegli la lunghezza: breve, media o dettagliata",
                "Gli racconti tu la tua attività: piatti, servizi, regole della casa",
                "Non promette sconti, non inventa fatti, non ammette colpe",
              ]}
            >
              <div className="rounded-[10px] border border-line bg-surface">
                <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">
                  <AiMark className="size-[6px]" /> Bozza dell&apos;assistente · Cordiale
                </div>
                <p className="px-4 py-3.5 text-[14px] leading-relaxed text-ink-2">
                  Gentile Paolo, grazie per il riscontro sulle porzioni: lo condivideremo con la cucina. Ci farebbe piacere sapere cosa avete ordinato, se vuole scriverci.
                </p>
              </div>
            </Step>
            <Step glyph={<GlyphClose className="size-14" />} title="Tu metti il punto"
              body="La bozza non va da nessuna parte finché non la approvi. La leggi, la cambi come vuoi, perché è un normale testo, e quando ti convince premi «Pubblica su Google». La risposta va su Google, sotto la recensione."
              points={[
                "Se la bozza contiene promesse o numeri di telefono, Reputia te lo segnala prima",
                "Un collaboratore può preparare le bozze, ma pubblica solo chi autorizzi tu",
                "Niente parte mai in automatico",
              ]}
            >
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

      {/* ───────── Does / does not ───────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <h2 className="max-w-[14ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[52px]">Cosa fa, e cosa non fa<Period /></h2>
            <p className="max-w-[46ch] self-end text-[17px] leading-relaxed text-muted">
              Meglio dirlo chiaro fin da subito, così sai esattamente cosa stai comprando. Nessuna promessa magica: un aiuto concreto per una cosa che va fatta bene.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="font-mono text-[12px] text-muted">Reputia fa</h3>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {DOES.map((d) => (
                  <li key={d} className="flex gap-3.5 py-4 text-[16px] leading-relaxed text-ink">
                    <span className="mt-[3px] grid size-5 shrink-0 place-items-center rounded-full bg-ink text-white">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[12px] text-muted">Reputia non fa</h3>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {DOES_NOT.map((d) => (
                  <li key={d} className="flex gap-3.5 py-4 text-[16px] leading-relaxed text-ink">
                    <span className="mt-[3px] grid size-5 shrink-0 place-items-center rounded-full border border-line-strong text-muted">
                      <Minus className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── For who ───────── */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8">
          <h2 className="max-w-[16ch] text-[40px] leading-[1] font-semibold tracking-[-0.045em] sm:text-[52px]">Per chi è pensato<Period /></h2>
          <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-muted">
            Per chiunque abbia una scheda su Google e riceva recensioni dai clienti. Non serve essere grandi: basta avere clienti che parlano di te.
          </p>
          <dl className="mt-14 grid gap-x-16 md:grid-cols-2">
            {FOR_WHO.map(([k, v]) => (
              <div key={k} className="border-t border-line py-7">
                <dt className="flex items-center gap-3 text-[19px] font-semibold tracking-[-0.02em]">
                  <span className="size-2 rounded-full bg-gold" aria-hidden />
                  {k}
                </dt>
                <dd className="mt-3 text-[15.5px] leading-[1.7] text-muted">{v}</dd>
              </div>
            ))}
          </dl>
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
              Reputia usa il collegamento ufficiale di Google (si chiama API di Google Business Profile), lo stesso che Google mette a disposizione dei programmi autorizzati. Non ci dai la
              tua password: accedi a Google come fai sempre e premi «Consenti». Se un giorno cambi idea, togli il permesso dal tuo account Google e Reputia non vede più nulla.
            </p>
            {!googleLive && (
              <p className="mt-6 max-w-[46ch] border-l-2 border-gold pl-4 text-[14px] leading-relaxed text-ink-2">
                Il collegamento è in fase di approvazione da parte di Google. Nel frattempo puoi provare Reputia con recensioni di esempio, sempre indicate come tali.
              </p>
            )}
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {(
              [
                [GlyphRead, "Legge", "Recensioni, valutazioni e risposte già pubblicate delle sedi che colleghi."],
                [GlyphPublish, "Pubblica", "Solo le risposte che approvi tu o un amministratore, con un clic esplicito."],
                [GlyphUntouched, "Non tocca", "Orari, foto e dati della scheda. Nessun accesso a email o altri servizi Google."],
              ] as const
            ).map(([Glyph, k, v]) => (
              <div key={k} className="grid grid-cols-[44px_1fr] gap-5 py-6 sm:gap-6">
                <Glyph className="size-11" />
                <div>
                  <dt className="text-[17px] font-semibold tracking-[-0.02em]">{k}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-muted">{v}</dd>
                </div>
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
              <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-muted">
                Paghi {formatEur(PLAN.monthlyPriceEur)} al mese per ogni sede che colleghi, con tutto incluso. Se hai un locale paghi {formatEur(PLAN.monthlyPriceEur)}; se ne hai
                due, {formatEur(PLAN.monthlyPriceEur * 2)}. Non ci sono pacchetti da scegliere né costi nascosti.
              </p>
              <p className="mt-4 max-w-[42ch] text-[17px] leading-relaxed text-muted">
                I primi {PLAN.trialDays} giorni sono gratis e non serve la carta. La inserisci solo se decidi di continuare; se non fai niente, non paghi niente.
              </p>
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

function Step({ glyph, title, body, points, children }: { glyph: React.ReactNode; title: string; body: string; points: string[]; children: React.ReactNode }) {
  return (
    <li className="grid gap-8 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <div>
        {glyph}
        <h3 className="mt-6 text-[24px] leading-tight font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-3 max-w-[46ch] text-[16px] leading-[1.7] text-muted">{body}</p>
        <ul className="mt-5 space-y-2">
          {points.map((pt) => (
            <li key={pt} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink-2">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {pt}
            </li>
          ))}
        </ul>
      </div>
      <div className="self-center">{children}</div>
    </li>
  );
}
