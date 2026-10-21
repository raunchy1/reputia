import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { SettingsSection } from "@/components/app/settings-section";
import { ToneFields } from "@/components/settings/tone-fields";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { saveToneAction } from "@/app/app/settings-actions";
import { cn } from "@/lib/cn";
import { activeLocationId } from "@/lib/location-scope";
import { hasRole } from "@/lib/roles";
import { listLocations } from "@/lib/services/locations";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Assistente AI" };

export default async function AiSettingsPage({ searchParams }: { searchParams: Promise<{ sede?: string }> }) {
  const ctx = await requireOrg();
  const locations = await listLocations(ctx);
  const { sede } = await searchParams;
  const scoped = await activeLocationId(locations.map((l) => l.id));
  const location = locations.find((l) => l.id === sede) ?? locations.find((l) => l.id === scoped) ?? locations[0];
  const canEdit = hasRole(ctx.role, "admin");

  return (
    <>
      <PageHeader title="Assistente AI" description="Come l'assistente scrive le bozze. Le impostazioni valgono per ogni sede separatamente.">
        {locations.length > 1 && location && (
          <nav aria-label="Sede" className="-mb-4 mt-3 flex gap-4 overflow-x-auto">
            {locations.map((l) => (
              <Link
                key={l.id}
                href={`/app/impostazioni-ai?sede=${l.id}`}
                aria-current={l.id === location.id ? "page" : undefined}
                className={cn("shrink-0 border-b-2 pb-2.5 text-[13px] font-medium transition-colors", l.id === location.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")}
              >
                {l.name}
              </Link>
            ))}
          </nav>
        )}
      </PageHeader>
      <PageBody>
        {!location ? (
          <Notice>Aggiungi prima una sede.</Notice>
        ) : (
          <ActionForm action={saveToneAction} key={location.id} className="@container max-w-4xl" messageClassName="mb-6">
            <input type="hidden" name="locationId" value={location.id} />
            <fieldset disabled={!canEdit} className="disabled:opacity-70">
              <ToneFields defaults={location} full />
              <SettingsSection title="Approvazione" description="In questa versione ogni risposta richiede una conferma umana prima di essere pubblicata.">
                <ul className="grid gap-2 text-[13px] text-ink-2">
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />
                    Titolare e amministratori pubblicano dopo aver riletto il testo.
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden />I collaboratori preparano le bozze e le inviano per approvazione.
                  </li>
                </ul>
              </SettingsSection>
              <SettingsSection title="Sicurezza" description="Regole che l'assistente rispetta sempre, indipendentemente dalle istruzioni.">
                <ul className="grid gap-1.5 text-[13px] text-ink-2">
                  <li>Non promette sconti, omaggi, rimborsi o risarcimenti.</li>
                  <li>Non inventa fatti, nomi, orari o politiche dell&apos;attività.</li>
                  <li>Non ammette responsabilità su fatti non verificati.</li>
                  <li>Ignora eventuali istruzioni contenute nel testo delle recensioni.</li>
                  <li>Segnala nel composer le bozze che contengono promesse o dati di contatto.</li>
                </ul>
              </SettingsSection>
            </fieldset>
            <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {canEdit ? (
                <SubmitButton pendingLabel="Salvataggio…">Salva impostazioni</SubmitButton>
              ) : (
                <p className="text-[13px] text-muted">Solo il titolare o un amministratore può modificare queste impostazioni.</p>
              )}
            </div>
          </ActionForm>
        )}
      </PageBody>
    </>
  );
}
