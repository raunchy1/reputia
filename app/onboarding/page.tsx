import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BusinessForm } from "@/components/onboarding/business-form";
import { Steps } from "@/components/onboarding/steps";
import { getOrgContext, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Configura Reputia" };

export default async function OnboardingPage() {
  const session = await requireUser();
  if (await getOrgContext()) redirect("/onboarding/google");
  return (
    <>
      <Steps current={0} />
      <h1 className="display text-4xl">Ciao {session.user.name.split(" ")[0]}, iniziamo dalla tua attività</h1>
      <p className="mt-3 text-muted">Ci servono pochi dati per scrivere risposte adatte ai tuoi clienti. Potrai aggiungere altre sedi in seguito.</p>
      <BusinessForm />
    </>
  );
}
