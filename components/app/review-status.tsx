import { cn } from "@/lib/cn";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

export const STATUS_META: Record<ReviewStatus, { label: string; dot: string; text: string }> = {
  NEW: { label: "Da gestire", dot: "bg-accent", text: "text-accent" },
  DRAFT: { label: "Bozza pronta", dot: "bg-warning", text: "text-warning" },
  APPROVED: { label: "Da approvare", dot: "bg-warning", text: "text-warning" },
  PUBLISHED: { label: "Pubblicata", dot: "bg-positive", text: "text-positive" },
  FAILED: { label: "Errore", dot: "bg-danger", text: "text-danger" },
  IGNORED: { label: "Archiviata", dot: "bg-faint", text: "text-muted" },
};

/** Quiet status: a coloured dot and a label, no filled pill (Linear-style). */
export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap", m.text, className)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}
