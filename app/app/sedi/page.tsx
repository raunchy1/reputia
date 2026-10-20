import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
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
        eyebrow="Sedi"
        title="Le tue sedi"
        description={`Ogni sede ha la sua scheda Google, le sue recensioni e il suo tono di voce. Il piano costa ${formatEur(PLAN.monthlyPriceEur)} al mese per sede.`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="grid content-start gap-3">
          {locations.map((l) => (
            <li key={l.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-paper-deep text-ink-soft">
                <MapPin className="size-5" strokeWidth={1.7} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.name}</p>
                <p className="text-sm text-muted">
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
                  <Badge tone="warning">Simulazione</Badge>
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
          <ActionForm action={createLocationAction} className="card grid content-start gap-4 p-6">
            <h2 className="font-semibold">Aggiungi una sede</h2>
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
    </>
  );
}
