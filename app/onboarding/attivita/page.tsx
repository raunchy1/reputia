import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BusinessForm } from "@/components/onboarding/business-form";
import { Steps } from "@/components/onboarding/steps";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "La tua attività" };

export default async function OnboardingBusiness() {
  if (await getOrgContext()) redirect("/onboarding/google");
  return (
    <>
      <Steps current={1} />
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">La tua attività</h1>
      <p className="mt-2 text-[15px] text-muted">Potrai aggiungere altre sedi in seguito.</p>
      <BusinessForm />
    </>
  );
}
