import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SimulationButton } from "@/components/onboarding/simulation-button";
import { Steps } from "@/components/onboarding/steps";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { db } from "@/lib/db";
import { googleErrorMessage } from "@/lib/google/errors";
import { googleConfigured } from "@/lib/google/oauth";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "Collega Google" };

export default async function OnboardingGooglePage({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const linked = await db.location.count({ where: { organizationId: ctx.organization.id, connectionId: { not: null } } });
  const { errore } = await searchParams;
  const google = googleConfigured();
  return (
    <>
      <Steps current={1} />
      <h1 className="display text-4xl">Collega il tuo profilo Google</h1>
      <p className="mt-3 text-muted">
        Reputia legge le recensioni della tua scheda Google e pubblica le risposte solo quando le approvi tu. Non pubblichiamo mai nulla in automatico.
      </p>
      {errore && (
        <Notice tone="danger" className="mt-6">
          {googleErrorMessage(errore)}
        </Notice>
      )}
      <div className="mt-8 grid gap-4">
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <GoogleGlyph />
            <div className="flex-1">
              <h2 className="font-semibold">Google Business Profile</h2>
              <p className="mt-1 text-sm text-muted">Accedi con l&apos;account Google che gestisce la scheda della tua attività.</p>
              {google ? (
                <a href="/api/google/connect?da=onboarding" className={buttonClass("primary", "md", "mt-4")}>
                  Collega con Google
                </a>
              ) : (
                <p className="mt-3 text-sm text-warning">Il collegamento con Google non è ancora attivo su questo server. Puoi iniziare con la simulazione.</p>
              )}
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold">Prova con dati di esempio</h2>
          <p className="mt-1 text-sm text-muted">
            Carichiamo 12 recensioni realistiche per provare l&apos;assistente. Le risposte &laquo;pubblicate&raquo; restano in Reputia e non arrivano su Google.
          </p>
          <SimulationButton />
        </div>
      </div>
      {linked > 0 && (
        <Link href="/onboarding/tono" className="mt-8 inline-block text-sm font-medium text-ink hover:underline">
          Ho già collegato una sede, continua →
        </Link>
      )}
    </>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-8 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.1H2A11 11 0 0 0 1 12c0 1.8.4 3.5 1.2 4.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7.1L5.7 10c.9-2.7 3.4-4.6 6.3-4.6z" />
    </svg>
  );
}
