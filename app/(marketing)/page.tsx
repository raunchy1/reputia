import { Check, Clock, MessageCircleHeart, PenLine, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { ProductPreview } from "@/components/marketing/product-preview";
import { ButtonLink } from "@/components/ui/button";
import { formatEur, PLAN } from "@/lib/plans";

const CATEGORIES = ["Ristoranti", "Pizzerie", "Bar e caffè", "Hotel", "Bed & Breakfast", "Case vacanze", "Parrucchieri", "Barbieri", "Centri estetici"];

const STEPS = [
  {
    icon: Star,
    title: "Collega la scheda Google",
    body: "Accedi con l'account che gestisce la tua attività. Reputia importa le recensioni tramite l'API ufficiale di Google Business Profile.",
  },
  {
    icon: Sparkles,
    title: "L'AI scrive la bozza",
    body: "Una risposta su misura per ogni recensione, nel tono della tua attività. Grata con chi ti loda, empatica con chi è rimasto deluso.",
  },
  {
    icon: PenLine,
    title: "Tu approvi e pubblichi",
    body: "Rileggi, ritocca se serve e pubblica con un clic. Senza la tua conferma non esce nulla.",
  },
];

const FAQ = [
  {
    q: "Le risposte vengono pubblicate in automatico?",
    a: "No. Ogni risposta è una bozza finché non la approvi tu. È una scelta precisa: la reputazione della tua attività resta nelle tue mani.",
  },
  {
    q: "L'intelligenza artificiale può inventare cose o promettere sconti?",
    a: "L'assistente ha regole rigide: non promette sconti, rimborsi o omaggi, non inventa fatti e usa solo le informazioni che gli fornisci tu. Se una bozza contiene qualcosa di sospetto, Reputia te lo segnala prima della pubblicazione.",
  },
  {
    q: "Come si collega a Google?",
    a: "Tramite l'autorizzazione ufficiale di Google: accedi con l'account che gestisce la scheda e concedi a Reputia il permesso di leggere le recensioni e pubblicare le risposte. Puoi revocarlo quando vuoi, da Reputia o dal tuo account Google.",
  },
  {
    q: "Ho più sedi. Come funziona?",
    a: `Ogni sede ha le sue recensioni e il suo tono di voce. Il prezzo è di ${formatEur(PLAN.monthlyPriceEur)} al mese per ogni sede collegata.`,
  },
  {
    q: "Posso far rispondere un collaboratore?",
    a: "Sì. I collaboratori preparano le bozze, mentre tu o un amministratore decidete cosa pubblicare.",
  },
  {
    q: "Posso disdire quando voglio?",
    a: "Sì, senza vincoli. L'abbonamento è mensile e puoi annullarlo in qualsiasi momento dalla pagina Abbonamento: resta attivo fino alla fine del mese già pagato.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-14 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-24 lg:pb-28">
          <div className="animate-rise">
            <p className="eyebrow">Per le attività locali italiane</p>
            <h1 className="display mt-5 text-[44px] leading-[1.02] sm:text-[60px] lg:text-[68px]">
              Rispondi alle recensioni Google <em className="text-accent">in pochi secondi</em>, con l&apos;intelligenza artificiale.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Reputia scrive per te risposte curate e professionali a ogni recensione. Tu le rileggi, le approvi e le pubblichi. I clienti si sentono ascoltati, tu
              risparmi ore ogni mese.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/registrati" size="lg">
                Prova gratis per {PLAN.trialDays} giorni
              </ButtonLink>
              <ButtonLink href="/contatti" size="lg" variant="secondary">
                Prenota una demo di 15 minuti
              </ButtonLink>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {["Nessuna carta di credito", "Disdici quando vuoi", "In italiano, per l'Italia"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-positive" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section aria-label="Categorie" className="border-y border-line bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-6 text-sm text-muted sm:px-8">
          <span className="font-medium text-ink-soft">Pensato per</span>
          {CATEGORIES.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </section>

      <section id="come-funziona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <p className="eyebrow">Come funziona</p>
        <h2 className="display mt-4 max-w-2xl text-4xl sm:text-5xl">Tre passaggi, poi rispondere diventa un piacere.</h2>
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative p-7">
              <span className="display absolute top-5 right-6 text-5xl text-line-strong">{i + 1}</span>
              <s.icon className="size-6 text-accent" strokeWidth={1.7} aria-hidden />
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-[#b9aef5]">Perché rispondere</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Chi legge le recensioni legge anche le tue risposte.</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Una risposta gentile a un complimento fa sentire il cliente apprezzato. Una risposta composta a una critica mostra a chi sta scegliendo che ti importa. Il
              problema è trovare il tempo, e le parole giuste, ogni giorno.
            </p>
          </div>
          <ul className="grid gap-4 self-center">
            {[
              { icon: Clock, title: "Tempo restituito", body: "Una risposta pronta in pochi secondi, invece di dieci minuti davanti al telefono a cercare le parole." },
              { icon: MessageCircleHeart, title: "Sempre il tono giusto", body: "Anche nelle giornate storte, anche davanti alla recensione più ingiusta." },
              { icon: ShieldCheck, title: "Nessuna sorpresa", body: "Regole di sicurezza contro promesse avventate e controllo umano su ogni pubblicazione." },
            ].map((b) => (
              <li key={b.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <b.icon className="mt-0.5 size-5 shrink-0 text-[#b9aef5]" strokeWidth={1.7} aria-hidden />
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="card grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="eyebrow">Prezzo</p>
            <h2 className="display mt-4 text-4xl">Un solo piano, tutto incluso.</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              Recensioni illimitate, bozze AI illimitate per uso normale, team e assistenza in italiano. {PLAN.trialDays} giorni gratis per provarlo con le tue recensioni.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="display text-6xl">{formatEur(PLAN.monthlyPriceEur)}</p>
            <p className="mt-1 text-sm text-muted">al mese per sede, IVA esclusa</p>
            <ButtonLink href="/prezzi" variant="secondary" className="mt-5">
              Vedi i dettagli
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="domande" className="mx-auto max-w-3xl scroll-mt-20 px-5 pb-24 sm:px-8">
        <p className="eyebrow text-center">Domande frequenti</p>
        <h2 className="display mt-4 text-center text-4xl">Tutto quello che ti stai chiedendo</h2>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl text-faint transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-accent px-8 py-16 text-center text-white sm:px-16">
          <h2 className="display mx-auto max-w-2xl text-4xl sm:text-5xl">Vediamola insieme sulle tue recensioni.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">Una videochiamata di 15 minuti su Google Meet: ti mostriamo Reputia sulla tua scheda e rispondiamo alle tue domande.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contatti" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 font-medium text-ink hover:bg-paper">
              Prenota la demo
            </Link>
            <Link href="/registrati" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-medium text-white hover:bg-white/10">
              Oppure inizia gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
