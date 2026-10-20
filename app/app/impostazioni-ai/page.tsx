import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { ToneFields } from "@/components/settings/tone-fields";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { saveToneAction } from "@/app/app/settings-actions";
import { cn } from "@/lib/cn";
import { hasRole } from "@/lib/roles";
import { listLocations } from "@/lib/services/locations";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Assistente AI" };

export default async function AiSettingsPage({ searchParams }: { searchParams: Promise<{ sede?: string }> }) {
  const ctx = await requireOrg();
  const locations = await listLocations(ctx);
  const { sede } = await searchParams;
  const location = locations.find((l) => l.id === sede) ?? locations[0];
  const canEdit = hasRole(ctx.role, "admin");

  return (
    <>
      <PageHeader eyebrow="Assistente AI" title="La voce della tua attività" description="Decidi come l'assistente scrive le bozze. Le regole valgono per ogni sede separatamente." />
      {!location ? (
        <Notice>Aggiungi prima una sede.</Notice>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {locations.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {locations.map((l) => (
                  <Link
                    key={l.id}
                    href={`/app/impostazioni-ai?sede=${l.id}`}
                    className={cn("rounded-full px-3.5 py-1.5 text-sm", l.id === location.id ? "bg-ink text-white" : "text-muted hover:bg-paper-deep")}
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            )}
            <ActionForm action={saveToneAction} className="card grid gap-7 p-6 sm:p-8" key={location.id}>
              <input type="hidden" name="locationId" value={location.id} />
              <fieldset disabled={!canEdit} className="grid gap-7 disabled:opacity-70">
                <ToneFields defaults={location} />
              </fieldset>
              {canEdit ? (
                <SubmitButton className="justify-self-start" pendingLabel="Salvataggio…">
                  Salva impostazioni
                </SubmitButton>
              ) : (
                <p className="text-sm text-muted">Solo il titolare o un amministratore può modificare queste impostazioni.</p>
              )}
            </ActionForm>
          </div>
          <aside className="grid content-start gap-4">
            <div className="card p-5">
              <h2 className="text-sm font-semibold">Cosa l&apos;assistente non farà mai</h2>
              <ul className="mt-3 grid gap-2 text-[13px] leading-relaxed text-muted">
                <li>Promettere sconti, omaggi o rimborsi.</li>
                <li>Inventare fatti, nomi o politiche della tua attività.</li>
                <li>Ammettere responsabilità su fatti non verificati.</li>
                <li>Pubblicare senza la tua approvazione.</li>
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="text-sm font-semibold">Recensioni negative</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Le bozze per le recensioni da 1-2 stelle sono empatiche e invitano il cliente a contattarti in privato. Rileggile sempre con attenzione.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
