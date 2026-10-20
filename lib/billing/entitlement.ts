import "server-only";
import { db } from "@/lib/db";
import { UserError } from "@/lib/errors";
import type { SubscriptionStatus } from "@/lib/generated/prisma/enums";
import { PLAN } from "@/lib/plans";

export type Entitlement = {
  state: "trial" | "active" | "past_due" | "expired";
  canWrite: boolean;
  trialEndsAt: Date;
  daysLeft: number;
  subscription: { status: SubscriptionStatus; quantity: number; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean } | null;
};

const DAY = 86_400_000;

export function computeEntitlement(
  organizationCreatedAt: Date,
  subscription: Entitlement["subscription"],
  now = new Date(),
  trialDays = PLAN.trialDays,
): Entitlement {
  const trialEndsAt = new Date(organizationCreatedAt.getTime() + trialDays * DAY);
  const daysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / DAY));
  const status = subscription?.status;
  if (status === "ACTIVE" || status === "TRIALING") return { state: "active", canWrite: true, trialEndsAt, daysLeft, subscription };
  // Stripe retries failed payments for a while: keep the account usable and show a warning.
  if (status === "PAST_DUE") return { state: "past_due", canWrite: true, trialEndsAt, daysLeft, subscription };
  if (now < trialEndsAt) return { state: "trial", canWrite: true, trialEndsAt, daysLeft, subscription };
  return { state: "expired", canWrite: false, trialEndsAt, daysLeft: 0, subscription };
}

export async function getEntitlement(organizationId: string): Promise<Entitlement> {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { createdAt: true, subscription: { select: { status: true, quantity: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } } },
  });
  return computeEntitlement(org.createdAt, org.subscription);
}

export async function assertCanWrite(organizationId: string) {
  const entitlement = await getEntitlement(organizationId);
  if (!entitlement.canWrite) {
    throw new UserError("Il periodo di prova è terminato. Attiva l'abbonamento dalla pagina Abbonamento per continuare a rispondere.");
  }
}
