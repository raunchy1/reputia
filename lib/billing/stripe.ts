import "server-only";
import Stripe from "stripe";
import { UserError } from "@/lib/errors";

let client: Stripe | undefined;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

/**
 * Live keys are refused unless STRIPE_ALLOW_LIVE=true, so real charges can only be
 * switched on by an explicit, deliberate configuration change. Prefer a restricted
 * key (rk_) limited to Customers, Checkout, Billing Portal and Subscriptions.
 */
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new UserError("I pagamenti non sono ancora attivi.");
  if (/^(sk|rk)_live_/.test(key) && process.env.STRIPE_ALLOW_LIVE !== "true") {
    throw new Error("Chiave Stripe live rifiutata: imposta STRIPE_ALLOW_LIVE=true solo dopo l'approvazione del titolare.");
  }
  client ??= new Stripe(key, { maxNetworkRetries: 2 });
  return client;
}

export function priceId(): string {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new UserError("I pagamenti non sono ancora attivi.");
  return id;
}

/**
 * Stripe Tax only collects VAT where the account has an active registration, and
 * silently collects nothing otherwise. Enable only after the Italian registration
 * shows "Collecting" in Dashboard → Tax → Registrations.
 */
export function automaticTaxEnabled(): boolean {
  return process.env.STRIPE_AUTOMATIC_TAX === "true";
}
