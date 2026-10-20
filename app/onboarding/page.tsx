import { CheckCircle2, MessageSquareReply, ShieldCheck, Sparkles } from "lucide-react";
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
      <ul className="mt-8 grid gap-4">
        {[
          { icon: CheckCircle2, t: "Descrivi la tua attività", d: "Nome, categoria e città: bastano per iniziare." },
          { icon: MessageSquareReply, t: "Collega Google o usa la simulazione", d: "La simulazione carica recensioni di esempio, chiaramente indicate." },
          { icon: Sparkles, t: "Scegli il tono e prova l'assistente", d: "Genera la prima risposta su una recensione vera." },
          { icon: ShieldCheck, t: "Tu decidi sempre", d: "Nessuna risposta viene pubblicata senza la tua conferma." },
        ].map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex gap-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface text-muted shadow-card">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium">{t}</span>
              <span className="text-[13px] text-muted">{d}</span>
            </span>
          </li>
        ))}
      </ul>
      <ButtonLink href="/onboarding/attivita" size="lg" className="mt-10 w-full sm:w-auto">
        Iniziamo
      </ButtonLink>
    </>
  );
}
