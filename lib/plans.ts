// Display-only plan facts for marketing and billing pages. The amount actually
// charged always comes from the Stripe Price configured in STRIPE_PRICE_ID.
export const PLAN = {
  name: "Starter",
  monthlyPriceEur: Number(process.env.NEXT_PUBLIC_PLAN_PRICE_EUR ?? 19),
  trialDays: Number(process.env.NEXT_PUBLIC_TRIAL_DAYS ?? 14),
};

export function formatEur(amount: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
}
