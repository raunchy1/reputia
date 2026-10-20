import { Sparkles } from "lucide-react";
import { Stars } from "@/components/ui/stars";

/** Static illustration of the review editor, built in HTML so it stays crisp and accessible. */
export function ProductPreview() {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-[radial-gradient(70%_60%_at_60%_30%,rgb(90_72_208/0.16),transparent_70%)]" />
      <div className="card overflow-hidden shadow-pop">
        <div className="flex items-center gap-1.5 border-b border-line bg-paper/70 px-4 py-3">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-3 text-xs text-faint">Recensioni · Trattoria da Gino</span>
        </div>
        <div className="grid gap-4 p-5 sm:p-6">
          <div className="rounded-2xl border border-line p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Luca F.</span>
              <Stars rating={2} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Abbiamo atteso più di 40 minuti per i secondi e nessuno ci ha avvisato del ritardo. Peccato, perché il cibo era buono.
            </p>
          </div>
          <div className="rounded-2xl border border-accent-line bg-accent-soft/50 p-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
              <Sparkles className="size-3.5" /> Bozza dell&apos;assistente
            </span>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Gentile Luca, la ringraziamo per il riscontro e ci dispiace che l&apos;attesa sia stata così lunga, senza un avviso da parte nostra. Siamo contenti che i piatti vi siano piaciuti. Se vuole
              raccontarci meglio la serata, ci scriva o ci chiami: ci farebbe piacere. Gino e lo staff
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-faint">Rileggi, modifica, approva.</span>
            <span className="inline-flex h-9 items-center rounded-xl bg-ink px-4 text-sm font-medium whitespace-nowrap text-white">Pubblica su Google</span>
          </div>
        </div>
      </div>
      <div className="card absolute -bottom-6 -left-4 hidden w-52 rotate-[-3deg] p-4 sm:block lg:-left-10">
        <p className="text-xs text-muted">Valutazione media</p>
        <p className="display mt-1 text-3xl">4,7</p>
        <Stars rating={5} className="mt-1" />
      </div>
    </div>
  );
}
