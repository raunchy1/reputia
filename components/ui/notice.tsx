import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "positive" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "border-accent-line bg-accent-soft/60 text-ink-soft",
  positive: "border-positive/20 bg-positive-soft text-positive",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
};

export function Notice({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", tones[tone], className)}>
      {children}
    </div>
  );
}
