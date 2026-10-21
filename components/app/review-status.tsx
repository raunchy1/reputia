import { cn } from "@/lib/cn";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

export const STATUS_META: Record<ReviewStatus, { label: string; text: string }> = {
  NEW: { label: "Da gestire", text: "text-ink" },
  DRAFT: { label: "Bozza pronta", text: "text-gold-ink" },
  APPROVED: { label: "Da approvare", text: "text-ink-2" },
  PUBLISHED: { label: "Pubblicata", text: "text-positive" },
  FAILED: { label: "Errore", text: "text-danger" },
  IGNORED: { label: "Archiviata", text: "text-muted" },
};

/**
 * Progress glyphs drawn for Reputia (Linear-style): the ring fills as a review moves
 * towards publication; the gold dot ("il punto") marks what still needs your word.
 */
export function StatusIcon({ status, className }: { status: ReviewStatus; className?: string }) {
  const c = cn("size-3.5 shrink-0", className);
  switch (status) {
    case "NEW":
      return (
        <svg viewBox="0 0 14 14" className={c} aria-hidden>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="var(--color-ink-2)" strokeWidth="1.5" />
          <circle cx="7" cy="7" r="2.25" fill="var(--color-gold)" />
        </svg>
      );
    case "DRAFT":
      return (
        <svg viewBox="0 0 14 14" className={c} aria-hidden>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="var(--color-gold)" />
        </svg>
      );
    case "APPROVED":
      return (
        <svg viewBox="0 0 14 14" className={c} aria-hidden>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="var(--color-ink-2)" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 1 1-3.5 3.5H7z" fill="var(--color-ink-2)" />
        </svg>
      );
    case "PUBLISHED":
      return (
        <svg viewBox="0 0 14 14" className={c} aria-hidden>
          <circle cx="7" cy="7" r="6.5" fill="var(--color-positive)" />
          <path d="M4.4 7.2 6.2 9l3.4-3.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "FAILED":
      return (
        <svg viewBox="0 0 14 14" className={c} aria-hidden>
          <circle cx="7" cy="7" r="6.5" fill="var(--color-danger)" />
          <path d="M7 4v3.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="7" cy="10" r="0.95" fill="#fff" />
        </svg>
      );
    case "IGNORED":
      return (
        <svg viewBox="0 0 14 14" className={c} aria-hidden>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="var(--color-faint)" strokeWidth="1.5" strokeDasharray="2.2 2" />
        </svg>
      );
  }
}

export function ReviewStatusBadge({ status, className, iconOnly }: { status: ReviewStatus; className?: string; iconOnly?: boolean }) {
  const m = STATUS_META[status];
  if (iconOnly)
    return (
      <span className={className} title={m.label}>
        <StatusIcon status={status} />
        <span className="sr-only">{m.label}</span>
      </span>
    );
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap", m.text, className)}>
      <StatusIcon status={status} />
      {m.label}
    </span>
  );
}
