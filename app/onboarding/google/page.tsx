import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SimulationButton } from "@/components/onboarding/simulation-button";
import { Steps } from "@/components/onboarding/steps";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { db } from "@/lib/db";
import { googleErrorMessage } from "@/lib/google/errors";
import { googleConfigured } from "@/lib/google/oauth";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "Collega Google" };

export default async function OnboardingGooglePage({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/attivita");
  const linked = await db.location.count({ where: { organizationId: ctx.organization.id, connectionId: { not: null } } });
  const { errore } = await searchParams;
  const google = googleConfigured();
  return (
    <>
      <Steps current={2} />
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Collega le tue recensioni</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">Reputia legge le recensioni della tua scheda Google e pubblica le risposte solo quando le approvi tu.</p>
      {errore && (
        <Notice tone="danger" className="mt-6">
          {googleErrorMessage(errore)}
        </Notice>
      )}
      <div className="mt-8 grid gap-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Google Business Profile</p>
            {!google && <Badge>Non ancora disponibile</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {google ? "Accedi con l'account Google che gestisce la scheda della tua attività." : "L'accesso all'API di Google è in fase di approvazione. Appena attivo potrai collegarti da Impostazioni › Google."}
          </p>
          {google && (
            <a href="/api/google/connect?da=onboarding" className={buttonClass("primary", "md", "mt-4")}>
              Collega con Google
            </a>
          )}
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Simulazione</p>
            <Badge tone="gold">Dati di esempio</Badge>
          </div>
          <p className="mt-1 text-[13px] text-muted">12 recensioni realistiche per provare l&apos;assistente. Le risposte «pubblicate» restano in Reputia e non arrivano su Google.</p>
          <SimulationButton />
        </div>
      </div>
      {linked > 0 && (
        <Link href="/onboarding/tono" className="mt-8 inline-flex items-center gap-1 text-[13px] font-medium text-ink hover:underline">
          Ho già collegato una sede, continua <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </>
  );
}
