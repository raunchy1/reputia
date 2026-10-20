import { Inbox, LayoutGrid, Send, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/cn";

const ROWS = [
  { name: "Luca F.", rating: 2, text: "Abbiamo atteso più di 40 minuti per i secondi e nessuno ci ha avvisato del ritardo.", when: "2 h", selected: true, status: "Bozza pronta" },
  { name: "Francesca M.", rating: 5, text: "Cena splendida, il risotto ai funghi porcini era perfetto. Personale attento.", when: "ieri", status: "Da gestire" },
  { name: "Giulia B.", rating: 4, text: "Ambiente curato e piatti generosi. Il tiramisù è da provare.", when: "3 g", status: "Da gestire" },
  { name: "Davide R.", rating: 4, text: "Ottimo rapporto qualità-prezzo, carta dei vini interessante.", when: "1 sett", status: "Pubblicata" },
];

const NAV: Array<[typeof Inbox, string, boolean]> = [
  [LayoutGrid, "Panoramica", false],
  [Inbox, "Recensioni", true],
  [Sparkles, "Assistente AI", false],
];

/**
 * Faithful, static rendering of the Reputia inbox (same layout and tokens as the app),
 * filled with clearly fictional example content. Hidden from assistive tech.
 */
export function ProductPreview() {
  return (
    <div aria-hidden className="overflow-hidden rounded-[14px] border border-line bg-canvas shadow-pop">
      <div className="flex">
        <div className="hidden w-40 shrink-0 flex-col gap-0.5 p-2 text-[11px] md:flex">
          <div className="mb-3 flex items-center gap-1.5 px-1.5 py-1">
            <span className="size-4 rounded bg-ink" />
            <span className="font-semibold">Trattoria da Gino</span>
          </div>
          {NAV.map(([Icon, label, active]) => (
            <span key={label} className={cn("flex items-center gap-2 rounded px-1.5 py-1", active ? "bg-surface font-medium text-ink shadow-card ring-1 ring-line" : "text-ink-2")}>
              <Icon className={cn("size-3", active ? "text-accent" : "text-muted")} />
              {label}
              {active && <span className="ml-auto text-muted">3</span>}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 overflow-hidden border-line bg-surface md:my-2 md:mr-2 md:rounded-[8px] md:border">
          <div className="w-full shrink-0 border-r border-line sm:w-[46%]">
            <div className="border-b border-line px-3 py-2">
              <div className="h-5 rounded bg-subtle" />
            </div>
            {ROWS.map((r) => (
              <div key={r.name} className={cn("relative border-b border-line px-3 py-2.5 text-left", r.selected && "bg-accent-soft/60")}>
                {r.selected && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" />}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-semibold">{r.name}</span>
                  <span className={cn("inline-flex items-center gap-0.5 rounded px-1 text-[10px] font-semibold", r.rating <= 2 ? "bg-danger-soft text-danger" : "bg-subtle text-ink-2")}>
                    {r.rating}
                    <Star className="size-2 fill-current" strokeWidth={0} />
                  </span>
                  <span className="ml-auto text-faint">{r.when}</span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{r.text}</p>
                <p className={cn("mt-1 flex items-center gap-1 text-[10px] font-medium", r.status === "Pubblicata" ? "text-positive" : r.status === "Bozza pronta" ? "text-warning" : "text-accent")}>
                  <span className="size-1 rounded-full bg-current" />
                  {r.status}
                </p>
              </div>
            ))}
          </div>
          <div className="hidden min-w-0 flex-1 p-4 text-left sm:block">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold">Luca F.</span>
              <span className="text-faint">· 2 ore fa</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed">Abbiamo atteso più di 40 minuti per i secondi e nessuno ci ha avvisato del ritardo. Peccato, perché il cibo era buono.</p>
            <div className="mt-3 rounded-[8px] border border-line">
              <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5 text-[10px]">
                <span className="font-semibold">La tua risposta</span>
                <span className="inline-flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 font-medium text-white">
                  <Sparkles className="size-2.5" /> Rigenera
                </span>
              </div>
              <p className="px-2.5 py-2 text-[11px] leading-relaxed text-ink-2">
                Gentile Luca, la ringraziamo per il riscontro e ci dispiace che l&apos;attesa sia stata così lunga, senza un avviso da parte nostra. Siamo contenti che i piatti vi siano piaciuti: se vuole raccontarci meglio la serata, ci
                scriva o ci chiami. Gino e lo staff
              </p>
              <div className="flex justify-end border-t border-line px-2.5 py-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-ink px-2 py-0.5 text-[10px] font-medium text-white">
                  <Send className="size-2.5" /> Pubblica
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
