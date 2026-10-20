import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { disconnectAction, enableSimulationAction, linkLocationAction } from "@/app/app/settings-actions";
import { db } from "@/lib/db";
import { googleErrorMessage } from "@/lib/google/errors";
import { googleConfigured } from "@/lib/google/oauth";
import { hasRole } from "@/lib/roles";
import { listConnections, providerFor } from "@/lib/services/connections";
import { listLocations } from "@/lib/services/locations";
import type { ProviderLocation } from "@/lib/reviews/types";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Collegamento Google" };

export default async function GooglePage({ searchParams }: { searchParams: Promise<{ errore?: string; collegato?: string }> }) {
  const ctx = await requireOrg();
  const canEdit = hasRole(ctx.role, "admin");
  const [connections, locations, params] = await Promise.all([listConnections(ctx), listLocations(ctx), searchParams]);
  const unlinked = locations.filter((l) => !l.connection);

  // Fetch the Google locations each live connection can manage, so unlinked sedi can be matched.
  const available: Array<{ connectionId: string; email: string | null; locations: ProviderLocation[]; error?: string }> = [];
  if (canEdit && unlinked.length > 0) {
    for (const c of connections.filter((c) => c.provider === "GOOGLE" && c.status === "ACTIVE")) {
      const full = await db.googleConnection.findUniqueOrThrow({ where: { id: c.id } });
      try {
        available.push({ connectionId: c.id, email: c.accountEmail, locations: await providerFor(full, ctx.organization.name).listLocations() });
      } catch {
        available.push({ connectionId: c.id, email: c.accountEmail, locations: [], error: "Impossibile leggere le schede di questo account." });
      }
    }
  }
  const options = available.flatMap((a) => a.locations.map((l) => ({ value: `${a.connectionId}|${l.externalId}`, label: `${l.name}${l.address ? ` — ${l.address}` : ""}`, email: a.email })));

  return (
    <>
      <PageHeader
        eyebrow="Google"
        title="Collegamento Google"
        description="Reputia usa l'API ufficiale di Google Business Profile. Leggiamo le recensioni e pubblichiamo solo le risposte che approvi."
        actions={
          canEdit && googleConfigured() ? (
            <a href="/api/google/connect" className={buttonClass("primary")}>
              {connections.some((c) => c.provider === "GOOGLE") ? "Collega un altro account" : "Collega Google"}
            </a>
          ) : undefined
        }
      />
      {params.errore && (
        <Notice tone="danger" className="mb-6">
          {googleErrorMessage(params.errore)}
        </Notice>
      )}
      {params.collegato && (
        <Notice tone="positive" className="mb-6">
          Account Google collegato. Ora abbina le tue sedi alle schede Google qui sotto.
        </Notice>
      )}
      {!googleConfigured() && (
        <Notice tone="warning" className="mb-6">
          L&apos;integrazione con Google Business Profile richiede l&apos;approvazione dell&apos;accesso API da parte di Google ed è in attivazione. Nel frattempo puoi usare la
          simulazione con recensioni di esempio.
        </Notice>
      )}

      <section className="card divide-y divide-line" aria-label="Account collegati">
        {connections.length === 0 && <p className="p-6 text-sm text-muted">Nessun account collegato.</p>}
        {connections.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{c.provider === "MOCK" ? "Simulazione (dati di esempio)" : c.accountEmail ?? "Account Google"}</p>
              <p className="text-sm text-muted">
                {c._count.locations} {c._count.locations === 1 ? "sede collegata" : "sedi collegate"}
              </p>
              {c.status === "NEEDS_RECONNECT" && <p className="mt-1 text-sm text-danger">Google ha revocato l&apos;accesso: ricollega l&apos;account.</p>}
            </div>
            <Badge tone={c.provider === "MOCK" ? "warning" : c.status === "ACTIVE" ? "positive" : "danger"}>
              {c.provider === "MOCK" ? "Simulazione" : c.status === "ACTIVE" ? "Attivo" : "Da ricollegare"}
            </Badge>
            {canEdit && (
              <div className="flex gap-2">
                {c.provider === "GOOGLE" && c.status === "NEEDS_RECONNECT" && googleConfigured() && (
                  <a href="/api/google/connect" className={buttonClass("secondary", "sm")}>
                    Ricollega
                  </a>
                )}
                <ActionForm action={disconnectAction} messageClassName="hidden">
                  <input type="hidden" name="connectionId" value={c.id} />
                  <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                    Scollega
                  </SubmitButton>
                </ActionForm>
              </div>
            )}
          </div>
        ))}
      </section>

      {canEdit && unlinked.length > 0 && (
        <section className="mt-8" aria-labelledby="link-title">
          <h2 id="link-title" className="mb-3 font-semibold">
            Sedi da collegare
          </h2>
          <ul className="grid gap-3">
            {unlinked.map((l) => (
              <li key={l.id} className="card grid gap-4 p-5">
                <p className="font-medium">{l.name}</p>
                {options.length > 0 && (
                  <ActionForm action={linkLocationAction} className="flex flex-col gap-3 sm:flex-row">
                    <input type="hidden" name="locationId" value={l.id} />
                    <label htmlFor={`target-${l.id}`} className="sr-only">
                      Scheda Google
                    </label>
                    <Select id={`target-${l.id}`} name="target" required defaultValue="" className="sm:flex-1">
                      <option value="" disabled>
                        Scegli la scheda Google…
                      </option>
                      {options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                    <SubmitButton pendingLabel="Collegamento…">Collega e importa</SubmitButton>
                  </ActionForm>
                )}
                {available.map((a) => a.error && <p key={a.connectionId} className="text-sm text-danger">{a.email}: {a.error}</p>)}
                <ActionForm action={enableSimulationAction} className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  <input type="hidden" name="locationId" value={l.id} />
                  <span>{options.length > 0 ? "Oppure prova prima con" : "Prova con"} dati di esempio:</span>
                  <SubmitButton variant="secondary" size="sm" pendingLabel="Caricamento…">
                    Usa la simulazione
                  </SubmitButton>
                </ActionForm>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
