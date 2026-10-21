import { cn } from "@/lib/cn";

const STEPS = ["Benvenuto", "Attività", "Google", "Tono", "Prima risposta", "Fine"];

/** Discreet progress, Linear-style: dots plus the current step name for screen readers and sighted users. */
export function Steps({ current }: { current: number }) {
  return (
    <div className="mb-10 flex items-center justify-between gap-4">
      <ol className="flex items-center gap-1.5" aria-label="Avanzamento della configurazione">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === current ? "step" : undefined} className="flex items-center">
            <span className={cn("block h-1.5 rounded-full transition-all duration-200", i === current ? "w-5 bg-ink" : i < current ? "w-1.5 bg-ink/50" : "w-1.5 bg-line-strong")} />
            <span className="sr-only">
              {label}
              {i < current ? " (completato)" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted tabular-nums">
        Passo {current + 1} di {STEPS.length} · {STEPS[current]}
      </p>
    </div>
  );
}
