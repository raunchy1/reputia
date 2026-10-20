import { Check } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Steps } from "@/components/onboarding/steps";
import { ButtonLink } from "@/components/ui/button";
import { TONE_LABELS } from "@/lib/ai/prompt";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "Tutto pronto" };

export default async function OnboardingDone() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/attivita");
  const location = await db.location.findFirst({
    where: { organizationId: ctx.organization.id, archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: { connection: { select: { provider: true } }, _count: { select: { reviews: true } } },
  });
  const rows = [
    ["Attività", location?.name ?? ctx.organization.name],
    ["Recensioni", location?.connection ? `${location._count.reviews} importate${location.connection.provider === "MOCK" ? " (simulazione)" : " da Google"}` : "Nessun collegamento ancora"],
    ["Tono", location ? TONE_LABELS[location.tone] : "—"],
    ["Pubblicazione", "Sempre con la tua conferma"],
  ];
  return (
    <>
      <Steps current={5} />
      <span className="grid size-10 place-items-center rounded-full bg-positive-soft text-positive">
        <Check className="size-5" aria-hidden />
      </span>
      <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.02em]">Tutto pronto</h1>
      <p className="mt-2 text-[15px] text-muted">Reputia è configurata. Puoi modificare tutto in qualsiasi momento dalle impostazioni.</p>
      <dl className="mt-8 divide-y divide-line rounded-[var(--radius-panel)] border border-line bg-surface">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[13px]">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <ButtonLink href="/app/recensioni" size="lg" className="mt-8">
        Vai alle recensioni
      </ButtonLink>
    </>
  );
}
