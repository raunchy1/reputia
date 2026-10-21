import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Steps } from "@/components/onboarding/steps";
import { ButtonLink } from "@/components/ui/button";
import { getOrgContext, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Benvenuto in Reputia" };

export default async function OnboardingWelcome() {
  const session = await requireUser();
  if (await getOrgContext()) redirect("/onboarding/google");
  return (
    <>
      <Steps current={0} />
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Benvenuto, {session.user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">In pochi minuti Reputia sarà pronta a preparare le risposte alle tue recensioni Google. Ecco cosa faremo:</p>
      <ol className="mt-8 divide-y divide-line border-y border-line">
        {[
          ["Descrivi la tua attività", "Nome, categoria e città: bastano per iniziare."],
          ["Collega Google o usa la simulazione", "La simulazione carica recensioni di esempio, chiaramente indicate."],
          ["Scegli il tono e prova l'assistente", "Genera la prima risposta su una delle tue recensioni."],
          ["Tu decidi sempre", "Nessuna risposta viene pubblicata senza la tua conferma."],
        ].map(([t, d], i) => (
          <li key={t} className="grid grid-cols-[32px_1fr] py-3.5">
            <span className="pt-0.5 font-mono text-[11px] text-faint">0{i + 1}</span>
            <span>
              <span className="block text-sm font-medium">{t}</span>
              <span className="text-[13px] text-muted">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <ButtonLink href="/onboarding/attivita" size="lg" className="mt-10 w-full sm:w-auto">
        Iniziamo
      </ButtonLink>
    </>
  );
}
