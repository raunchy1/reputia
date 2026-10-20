import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

const MAP: Record<ReviewStatus, { label: string; tone: "neutral" | "accent" | "positive" | "warning" | "danger" }> = {
  NEW: { label: "Da rispondere", tone: "accent" },
  DRAFT: { label: "Bozza", tone: "warning" },
  APPROVED: { label: "Approvata", tone: "warning" },
  PUBLISHED: { label: "Pubblicata", tone: "positive" },
  FAILED: { label: "Errore di pubblicazione", tone: "danger" },
  IGNORED: { label: "Ignorata", tone: "neutral" },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const { label, tone } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}
