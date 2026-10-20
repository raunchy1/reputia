import { describe, expect, it } from "vitest";
import { computeEntitlement } from "@/lib/billing/entitlement";

const DAY = 86_400_000;
const created = new Date("2026-10-01T10:00:00Z");
const sub = (status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIALING") => ({ status, quantity: 1, currentPeriodEnd: null, cancelAtPeriodEnd: false });

describe("computeEntitlement", () => {
  it("allows writes during the in-app trial", () => {
    const e = computeEntitlement(created, null, new Date(created.getTime() + 3 * DAY), 14);
    expect(e).toMatchObject({ state: "trial", canWrite: true, daysLeft: 11 });
  });
  it("blocks writes once the trial is over without a subscription", () => {
    expect(computeEntitlement(created, null, new Date(created.getTime() + 15 * DAY), 14)).toMatchObject({ state: "expired", canWrite: false });
  });
  it("active and Stripe-trialing subscriptions can write", () => {
    const later = new Date(created.getTime() + 60 * DAY);
    expect(computeEntitlement(created, sub("ACTIVE"), later, 14).canWrite).toBe(true);
    expect(computeEntitlement(created, sub("TRIALING"), later, 14).canWrite).toBe(true);
  });
  it("past_due keeps a grace period, canceled/unpaid do not", () => {
    const later = new Date(created.getTime() + 60 * DAY);
    expect(computeEntitlement(created, sub("PAST_DUE"), later, 14)).toMatchObject({ state: "past_due", canWrite: true });
    expect(computeEntitlement(created, sub("CANCELED"), later, 14).canWrite).toBe(false);
    expect(computeEntitlement(created, sub("UNPAID"), later, 14).canWrite).toBe(false);
  });
});
