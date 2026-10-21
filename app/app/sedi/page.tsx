import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { archiveLocationAction, createLocationAction } from "@/app/app/settings-actions";
import { CATEGORY_LABELS } from "@/lib/categories";
import { relativeDate } from "@/lib/format";
import { formatEur, PLAN } from "@/lib/plans";
import { hasRole } from "@/lib/roles";
import { listLocations } from "@/lib/services/locations";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Sedi" };

export default async function LocationsPage() {
  const ctx = await requireOrg();
  const locations = await listLocations(ctx);
  const canEdit = hasRole(ctx.role, "admin");

  return (
    <>
      <PageHeader
        title="Sedi"
        description={`Ogni sede ha la sua scheda Google, le sue recensioni e il suo tono di voce. Il piano costa ${formatEur(PLAN.monthlyPriceEur)} al mese per sede.`}
      />
      <PageBody>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ul className="panel grid content-start divide-y divide-line">
          {locations.map((l) => (
            <li key={l.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-canvas text-muted">
                <MapPin className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{l.name}</p>
                <p className="text-xs text-muted">
                  {CATEGORY_LABELS[l.category]}
                  {l.city && ` · ${l.city}`} · {l._count.reviews} recensioni
                  {l.lastSyncedAt && ` · sincronizzata ${relativeDate(l.lastSyncedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!l.connection ? (
                  <Link href="/app/google" className="text-sm font-medium text-accent hover:underline">
                    Collega a Google
                  </Link>
                ) : l.connection.provider === "MOCK" ? (
                  <Badge tone="gold">Simulazione</Badge>
                ) : l.connection.status === "ACTIVE" ? (
                  <Badge tone="positive">Google collegato</Badge>
                ) : (
                  <Badge tone="danger">Da ricollegare</Badge>
                )}
                {canEdit && locations.length > 1 && (
                  <ActionForm action={archiveLocationAction} className="flex items-center" messageClassName="hidden">
                    <input type="hidden" name="locationId" value={l.id} />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                      Archivia
                    </SubmitButton>
                  </ActionForm>
                )}
              </div>
            </li>
          ))}
        </ul>
        {canEdit && (
          <ActionForm action={createLocationAction} className="panel grid content-start gap-4 p-5">
            <h2 className="text-sm font-semibold">Aggiungi una sede</h2>
            <Field label="Nome" htmlFor="name">
              <Input id="name" name="name" required maxLength={120} placeholder="Es. Trattoria da Gino — Centro" />
            </Field>
            <Field label="Categoria" htmlFor="category">
              <Select id="category" name="category" required defaultValue="">
                <option value="" disabled>
                  Scegli…
                </option>
                {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Città" htmlFor="city">
              <Input id="city" name="city" maxLength={80} />
            </Field>
            <SubmitButton pendingLabel="Aggiunta…">Aggiungi sede</SubmitButton>
            <p className="text-xs text-muted">Se hai un abbonamento attivo, l&apos;importo si aggiorna in proporzione dal prossimo rinnovo.</p>
          </ActionForm>
        )}
      </div>
      </PageBody>
    </>
  );
}
