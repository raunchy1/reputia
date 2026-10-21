import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Steps } from "@/components/onboarding/steps";
import { OnboardingToneForm } from "@/components/onboarding/tone-form";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "Tono di voce" };

export default async function OnboardingTonePage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/attivita");
  const location = await db.location.findFirst({ where: { organizationId: ctx.organization.id, archivedAt: null }, orderBy: { createdAt: "asc" } });
  if (!location) redirect("/onboarding/attivita");
  return (
    <>
      <Steps current={3} />
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Come parli ai tuoi clienti?</h1>
      <p className="mt-2 text-[15px] text-muted">L&apos;assistente scriverà le bozze con questo stile. Potrai cambiarlo quando vuoi.</p>
      <OnboardingToneForm defaults={location} />
    </>
  );
}
