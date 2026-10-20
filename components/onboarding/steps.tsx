import { cn } from "@/lib/cn";

const STEPS = ["La tua attività", "Google", "Tono di voce"];

export function Steps({ current }: { current: number }) {
  return (
    <ol className="mb-10 flex items-center gap-2" aria-label="Avanzamento configurazione">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 flex-col gap-2" aria-current={i === current ? "step" : undefined}>
          <span className={cn("h-1 rounded-full transition-colors", i <= current ? "bg-ink" : "bg-line")} />
          <span className={cn("text-xs font-medium", i === current ? "text-ink" : "text-faint")}>
            {i + 1}. {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
