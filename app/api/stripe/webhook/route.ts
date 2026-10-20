import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { audit } from "@/lib/audit";
import { applySubscription } from "@/lib/billing/service";
import { stripe } from "@/lib/billing/stripe";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { Prisma } from "@/lib/generated/prisma/client";

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.payment_failed",
  "invoice.paid",
]);

// Money-at-risk events: nothing to change automatically, but someone must look at them.
const ALERTS = new Set(["charge.dispute.created", "charge.refunded", "radar.early_fraud_warning.created"]);

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // The raw body is required for signature verification.
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  if (ALERTS.has(event.type)) {
    await alertOwner(event);
    return NextResponse.json({ received: true });
  }
  if (!HANDLED.has(event.type)) return NextResponse.json({ received: true });

  // Idempotency: Stripe delivers at least once. The insert fails on a duplicate id.
  try {
    await db.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
    throw error;
  }

  try {
    const subscriptionId = subscriptionIdFrom(event);
    // Always re-read the subscription from Stripe so out-of-order events converge on current state.
    if (subscriptionId) await applySubscription(await stripe().subscriptions.retrieve(subscriptionId));
  } catch (error) {
    // Let Stripe retry: forget the event so the retry is processed.
    await db.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    console.error("[stripe webhook]", event.type, error);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

function subscriptionIdFrom(event: Stripe.Event): string | null {
  const obj = event.data.object as unknown as Record<string, unknown>;
  if (event.type.startsWith("customer.subscription.")) return obj.id as string;
  if (event.type.startsWith("checkout.session.")) return typeof obj.subscription === "string" ? obj.subscription : null;
  if (event.type.startsWith("invoice.")) {
    const parent = obj.parent as { subscription_details?: { subscription?: string | { id: string } } } | null;
    const sub = parent?.subscription_details?.subscription;
    return typeof sub === "string" ? sub : (sub?.id ?? null);
  }
  return null;
}

async function alertOwner(event: Stripe.Event) {
  const obj = event.data.object as unknown as { customer?: string | null; charge?: string | null; amount?: number };
  const customerId = typeof obj.customer === "string" ? obj.customer : null;
  const sub = customerId ? await db.subscription.findUnique({ where: { stripeCustomerId: customerId } }) : null;
  console.warn("[stripe alert]", event.type, event.id, customerId);
  await audit({ organizationId: sub?.organizationId ?? null, actorUserId: null, action: `billing.alert.${event.type}`, metadata: { eventId: event.id } }).catch(() => undefined);
  const to = process.env.BILLING_ALERT_EMAIL ?? process.env.LEADS_NOTIFY_EMAIL;
  if (to) {
    await sendEmail({
      to,
      subject: `[Reputia] Stripe: ${event.type}`,
      text: `Evento ${event.type} (${event.id}) per il cliente ${customerId ?? "sconosciuto"}. Controlla la dashboard Stripe.`,
      html: `<p>Evento <strong>${event.type}</strong> (${event.id}) per il cliente ${customerId ?? "sconosciuto"}. Controlla la dashboard Stripe.</p>`,
    }).catch((error) => console.error("[stripe alert email]", error));
  }
}
