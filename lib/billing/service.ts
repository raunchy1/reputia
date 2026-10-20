import "server-only";
import type Stripe from "stripe";
import { audit } from "@/lib/audit";
import { automaticTaxEnabled, priceId, stripe, stripeConfigured } from "@/lib/billing/stripe";
import { getEntitlement } from "@/lib/billing/entitlement";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { UserError } from "@/lib/errors";
import type { SubscriptionStatus } from "@/lib/generated/prisma/enums";
import { activeLocationCount } from "@/lib/services/locations";
import type { OrgContext } from "@/lib/session";

const STATUS: Record<string, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "INCOMPLETE_EXPIRED",
  unpaid: "UNPAID",
  paused: "PAUSED",
};

async function ensureCustomer(ctx: OrgContext): Promise<string> {
  const existing = await db.subscription.findUnique({ where: { organizationId: ctx.organization.id } });
  if (existing) return existing.stripeCustomerId;
  const customer = await stripe().customers.create(
    {
      name: ctx.organization.name,
      email: ctx.user.email,
      preferred_locales: ["it"],
      metadata: { organizationId: ctx.organization.id },
    },
    { idempotencyKey: `customer-${ctx.organization.id}` },
  );
  await db.subscription.create({ data: { organizationId: ctx.organization.id, stripeCustomerId: customer.id } });
  return customer.id;
}

export async function createCheckout(ctx: OrgContext): Promise<string> {
  if (!stripeConfigured()) throw new UserError("I pagamenti non sono ancora attivi. Contattaci per attivare l'abbonamento.");
  const entitlement = await getEntitlement(ctx.organization.id);
  if (entitlement.state === "active" || entitlement.state === "past_due") throw new UserError("L'abbonamento è già attivo. Gestiscilo dal portale clienti.");

  const customer = await ensureCustomer(ctx);
  const quantity = Math.max(1, await activeLocationCount(ctx.organization.id));
  // Remaining in-app trial days carry over, so subscribing early never shortens the trial.
  // Stripe requires trial_end to be at least 48 hours in the future.
  const keepTrial = entitlement.state === "trial" && entitlement.trialEndsAt.getTime() - Date.now() > 49 * 3600_000;

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: ctx.organization.id,
    line_items: [{ price: priceId(), quantity }],
    subscription_data: {
      metadata: { organizationId: ctx.organization.id },
      ...(keepTrial ? { trial_end: Math.floor(entitlement.trialEndsAt.getTime() / 1000) } : {}),
    },
    automatic_tax: { enabled: automaticTaxEnabled() },
    integration_identifier: "reputia-starter-qmvhtzrk",
    tax_id_collection: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    billing_address_collection: "required",
    locale: "it",
    allow_promotion_codes: false,
    success_url: `${env.APP_URL}/app/abbonamento?esito=ok`,
    cancel_url: `${env.APP_URL}/app/abbonamento?esito=annullato`,
  });
  await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "billing.checkout.started", metadata: { quantity } });
  if (!session.url) throw new UserError("Impossibile avviare il pagamento. Riprova.");
  return session.url;
}

export async function createPortal(ctx: OrgContext): Promise<string> {
  const sub = await db.subscription.findUnique({ where: { organizationId: ctx.organization.id } });
  if (!sub) throw new UserError("Nessun abbonamento da gestire.");
  const session = await stripe().billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url: `${env.APP_URL}/app/abbonamento`, locale: "it" });
  return session.url;
}

/** Mirrors a Stripe subscription into our table. Called from the webhook only. */
export async function applySubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const row = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
  const organizationId = row?.organizationId ?? subscription.metadata.organizationId;
  if (!organizationId) {
    console.warn("[stripe] subscription without organization", subscription.id);
    return;
  }
  const item = subscription.items.data[0];
  const data = {
    stripeSubscriptionId: subscription.id,
    stripePriceId: item?.price.id ?? null,
    status: STATUS[subscription.status] ?? "INCOMPLETE",
    quantity: item?.quantity ?? 1,
    trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
  await db.subscription.upsert({
    where: { organizationId },
    create: { organizationId, stripeCustomerId: customerId, ...data },
    update: data,
  });
  await audit({ organizationId, actorUserId: null, action: "billing.subscription.updated", metadata: { status: data.status, quantity: data.quantity } });
}

/** Keeps the billed quantity equal to the number of active locations (prorated). Best effort. */
export async function syncQuantity(organizationId: string) {
  if (!stripeConfigured()) return;
  const sub = await db.subscription.findUnique({ where: { organizationId } });
  if (!sub?.stripeSubscriptionId || !["ACTIVE", "TRIALING", "PAST_DUE"].includes(sub.status)) return;
  const quantity = Math.max(1, await activeLocationCount(organizationId));
  if (quantity === sub.quantity) return;
  try {
    const subscription = await stripe().subscriptions.retrieve(sub.stripeSubscriptionId);
    const item = subscription.items.data[0];
    if (!item) return;
    await stripe().subscriptionItems.update(item.id, { quantity, proration_behavior: "create_prorations" });
    await db.subscription.update({ where: { id: sub.id }, data: { quantity } });
  } catch (error) {
    console.error("[stripe] quantity sync failed", error);
  }
}
