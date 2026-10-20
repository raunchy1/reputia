import { Check, Clock, Eye, MessageCircleHeart, MessageSquareReply, PenLine, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { ProductPreview } from "@/components/marketing/product-preview";
import { ButtonLink } from "@/components/ui/button";
import { googleConfigured } from "@/lib/google/oauth";
import { formatEur, PLAN } from "@/lib/plans";

const CATEGORIES = ["Ristoranti", "Pizzerie", "Bar e caffè", "Hotel", "Bed & Breakfast", "Case vacanze", "Parrucchieri", "Barbieri", "Centri estetici"];

const STEPS = [
  { icon: Star, title: "Collega la scheda Google", body: "Accedi con l'account che gestisce la tua attività. Reputia importa le recensioni tramite l'API ufficiale di Google Business Profile." },
  { icon: Sparkles, title: "L'assistente scrive la bozza", body: "Una risposta su misura per ogni recensione, nel tono della tua attività: grata con chi ti loda, composta con chi è rimasto deluso." },
  { icon: PenLine, title: "Tu rileggi e pubblichi", body: "Modifichi se serve e pubblichi con un clic. Senza la tua conferma non esce nulla." },
];

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

export default function HomePage() {
  const googleLive = googleConfigured();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pt-16 pb-16 text-center sm:px-8 lg:pt-24">
          <p className="animate-rise text-[13px] font-medium text-muted">Per ristoranti, hotel e attività locali italiane</p>
          <h1 className="display mx-auto mt-5 max-w-4xl animate-rise text-[44px] leading-[1.04] text-ink sm:text-[64px] lg:text-[76px]">Ogni recensione merita la risposta giusta.</h1>
          <p className="mx-auto mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-muted">
            Reputia ti aiuta a gestire le recensioni Google e a creare risposte professionali con l&apos;intelligenza artificiale. Tu rileggi e approvi, sempre.
          </p>
          <div className="mt-9 flex animate-rise flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/registrati" size="lg">
              Prova gratis per {PLAN.trialDays} giorni
            </ButtonLink>
            <ButtonLink href="/contatti" size="lg" variant="secondary">
              Prenota una demo di 15 minuti
            </ButtonLink>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-muted">
            {["Nessuna carta di credito", "Disdici quando vuoi", "Pensato per l'Italia"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-positive" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <ProductPreview />
          <p className="mt-3 text-center text-xs text-faint">L&apos;interfaccia di Reputia, con recensioni di esempio.</p>
        </div>
      </section>

      <section aria-label="Categorie" className="mt-20 border-y border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-5 text-[13px] text-muted sm:px-8">
          <span className="font-medium text-ink-2">Pensato per</span>
          {CATEGORIES.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="come-funziona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <h2 className="display max-w-2xl text-4xl sm:text-5xl">Tre passaggi. Poi rispondere diventa un’abitudine.</h2>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-surface p-7">
              <div className="flex items-center justify-between">
                <s.icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                <span className="text-xs font-medium text-faint tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Why */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Chi legge le recensioni legge anche le tue risposte.</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Una risposta gentile a un complimento fa sentire il cliente apprezzato. Una risposta composta a una critica mostra a chi sta scegliendo che ti importa. Il difficile è trovare il tempo, e le parole giuste, ogni
              giorno.
            </p>
          </div>
          <ul className="grid gap-px self-center overflow-hidden rounded-[14px] border border-white/10 bg-white/10">
            {[
              { icon: Clock, title: "Tempo restituito", body: "Una bozza pronta in pochi secondi invece di dieci minuti a cercare le parole." },
              { icon: MessageCircleHeart, title: "Sempre il tono giusto", body: "Anche nelle giornate storte, anche davanti alla recensione più ingiusta." },
              { icon: ShieldCheck, title: "Nessuna sorpresa", body: "Regole contro promesse avventate e conferma umana su ogni pubblicazione." },
            ].map((b) => (
              <li key={b.title} className="flex gap-4 bg-ink p-5">
                <b.icon className="mt-0.5 size-5 shrink-0 text-white/60" strokeWidth={1.75} aria-hidden />
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Google integration */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="display text-4xl sm:text-[44px]">Collegato a Google, come si deve.</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">
              Reputia usa l&apos;API ufficiale di Google Business Profile. Niente password condivise, niente automatismi nascosti: autorizzi l&apos;accesso dal tuo account Google e puoi revocarlo in qualsiasi momento.
            </p>
            {!googleLive && (
              <p className="mt-5 rounded-[var(--radius-panel)] border border-line bg-surface px-4 py-3 text-[13px] text-ink-2">
                Il collegamento con Google è in fase di approvazione da parte di Google. Nel frattempo puoi provare Reputia con recensioni di esempio, chiaramente indicate.
              </p>
            )}
          </div>
          <ul className="grid gap-px overflow-hidden rounded-[14px] border border-line bg-line">
            {[
              { icon: Eye, t: "Legge le recensioni delle tue sedi", d: "Valutazioni, testi e risposte già pubblicate, aggiornati a ogni sincronizzazione." },
              { icon: MessageSquareReply, t: "Pubblica solo ciò che approvi", d: "Ogni risposta parte da un clic esplicito tuo o di un amministratore." },
              { icon: ShieldCheck, t: "Non tocca il resto della scheda", d: "Orari, foto e dati dell'attività restano come sono. Nessun accesso a email o altri servizi." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4 bg-surface p-6">
                <Icon className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
          <h2 className="display text-4xl sm:text-5xl">Un piano, un prezzo.</h2>
          <p className="mt-6 flex items-baseline justify-center gap-2">
            <span className="display text-7xl">{formatEur(PLAN.monthlyPriceEur)}</span>
            <span className="text-left text-sm leading-tight text-muted">
              al mese per sede
              <br />
              IVA esclusa
            </span>
          </p>
          <ul className="mx-auto mt-10 grid max-w-2xl gap-x-10 gap-y-3 text-left text-[15px] sm:grid-cols-2">
            {["Recensioni e sedi collegate a Google", "Bozze AI con il tuo tono di voce", "Avvisi su promesse e dati sensibili", "Pubblicazione con approvazione", "Team con ruoli", "Assistenza in italiano"].map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check className="mt-1 size-4 shrink-0 text-positive" aria-hidden /> {f}
              </li>
            ))}
          </ul>
          <ButtonLink href="/registrati" size="lg" className="mt-10">
            Inizia la prova di {PLAN.trialDays} giorni
          </ButtonLink>
          <p className="mt-3 text-[13px] text-muted">
            Dettagli nella pagina{" "}
            <Link href="/prezzi" className="text-ink underline underline-offset-4">
              Prezzi
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="domande" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-24 sm:px-8">
        <h2 className="display text-center text-4xl">Domande frequenti</h2>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-faint transition-transform duration-200 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-[14px] border border-line bg-surface px-8 py-16 text-center sm:px-16">
          <h2 className="display mx-auto max-w-2xl text-4xl sm:text-5xl">Vediamola insieme sulle tue recensioni.</h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-muted">Una videochiamata di 15 minuti su Google Meet: ti mostriamo Reputia e rispondiamo alle tue domande.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contatti" size="lg">
              Prenota la demo
            </ButtonLink>
            <ButtonLink href="/registrati" size="lg" variant="secondary">
              Oppure inizia gratis
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
