import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Steps } from "@/components/onboarding/steps";
import { OnboardingToneForm } from "@/components/onboarding/tone-form";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "Tono di voce" };

export default async function OnboardingTonePage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const location = await db.location.findFirst({ where: { organizationId: ctx.organization.id, archivedAt: null }, orderBy: { createdAt: "asc" } });
  if (!location) redirect("/onboarding");
  return (
    <>
      <Steps current={2} />
      <h1 className="display text-4xl">Come parli ai tuoi clienti?</h1>
      <p className="mt-3 text-muted">L&apos;assistente scriverà le bozze con questo stile. Potrai sempre modificarle prima di pubblicarle.</p>
      <OnboardingToneForm defaults={location} />
    </>
  );
}
