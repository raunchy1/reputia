import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "positive" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-paper-deep text-ink-soft",
  accent: "bg-accent-soft text-accent",
  positive: "bg-positive-soft text-positive",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
