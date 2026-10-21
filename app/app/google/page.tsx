import { CheckCircle2, CircleSlash, Eye, MessageSquareReply, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { SettingsSection } from "@/components/app/settings-section";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { disconnectAction, enableSimulationAction, linkLocationAction } from "@/app/app/settings-actions";
import { db } from "@/lib/db";
import { relativeDate } from "@/lib/format";
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
  const configured = googleConfigured();
  const unlinked = locations.filter((l) => !l.connection);
  const google = connections.filter((c) => c.provider === "GOOGLE");
  const mock = connections.find((c) => c.provider === "MOCK");

  // Google locations each live connection can manage, used to match the unlinked ones.
  const available: Array<{ connectionId: string; email: string | null; locations: ProviderLocation[]; error?: string }> = [];
  if (canEdit && unlinked.length > 0) {
    for (const c of google.filter((c) => c.status === "ACTIVE")) {
      const full = await db.googleConnection.findUniqueOrThrow({ where: { id: c.id } });
      try {
        available.push({ connectionId: c.id, email: c.accountEmail, locations: await providerFor(full, ctx.organization.name).listLocations() });
      } catch {
        available.push({ connectionId: c.id, email: c.accountEmail, locations: [], error: "Impossibile leggere le schede di questo account." });
      }
    }
  }
  const options = available.flatMap((a) => a.locations.map((l) => ({ value: `${a.connectionId}|${l.externalId}`, label: `${l.name}${l.address ? ` — ${l.address}` : ""}` })));

  const state = google.some((c) => c.status === "ACTIVE")
    ? "connected"
    : google.some((c) => c.status === "NEEDS_RECONNECT")
      ? "reconnect"
      : !configured
        ? "unavailable"
        : "disconnected";

  return (
    <>
      <PageHeader title="Google" description="Collegamento con Google Business Profile tramite l'API ufficiale." />
      <PageBody>
        <div className="@container max-w-4xl">
          {params.errore && (
            <Notice tone="danger" className="mb-6">
              {googleErrorMessage(params.errore)}
            </Notice>
          )}
          {params.collegato && (
            <Notice tone="positive" className="mb-6">
              Account Google collegato. Ora abbina le tue sedi alle schede qui sotto.
            </Notice>
          )}

          {/* Status */}
          <div className="panel mb-8 flex flex-wrap items-center gap-4 p-5">
            <GoogleGlyph />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">Google Business Profile</p>
                {state === "connected" && <Badge tone="positive">Collegato</Badge>}
                {state === "reconnect" && <Badge tone="danger">Da ricollegare</Badge>}
                {state === "unavailable" && <Badge>Non ancora disponibile</Badge>}
                {state === "disconnected" && <Badge>Non collegato</Badge>}
                {mock && <Badge tone="gold">Simulazione attiva</Badge>}
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {state === "connected" && `Account: ${google.filter((c) => c.status === "ACTIVE").map((c) => c.accountEmail ?? "Google").join(", ")}`}
                {state === "reconnect" && "Google ha revocato l'autorizzazione: ricollega l'account per continuare a sincronizzare."}
                {state === "unavailable" && "L'accesso all'API di Google è in fase di approvazione. Nel frattempo puoi provare Reputia con la simulazione."}
                {state === "disconnected" && "Collega l'account Google che gestisce la scheda della tua attività."}
              </p>
            </div>
            {canEdit && configured && state !== "connected" && (
              <a href="/api/google/connect" className={buttonClass("primary")}>
                {state === "reconnect" ? "Ricollega Google" : "Collega Google"}
              </a>
            )}
            {canEdit && configured && state === "connected" && (
              <a href="/api/google/connect" className={buttonClass("secondary")}>
                Collega un altro account
              </a>
            )}
          </div>

          <SettingsSection title="Cosa può fare Reputia" description="Chiediamo solo il permesso di gestire la scheda dell'attività. Puoi revocarlo in qualsiasi momento.">
            <ul className="grid gap-3 text-[13px]">
              <Permission icon={Eye} title="Leggere le recensioni" body="Importa recensioni, valutazioni e risposte già pubblicate delle sedi che colleghi." />
              <Permission icon={MessageSquareReply} title="Pubblicare risposte, solo con la tua conferma" body="Nessuna risposta parte senza un clic esplicito del titolare o di un amministratore." />
              <Permission icon={CircleSlash} title="Nient'altro" body="Non modifichiamo orari, foto o dati della scheda e non leggiamo email o altri servizi Google." />
            </ul>
          </SettingsSection>

          <SettingsSection title="Sedi" description="Ogni sede di Reputia corrisponde a una scheda Google.">
            <ul className="divide-y divide-line rounded-[var(--radius-panel)] border border-line">
              {locations.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{l.name}</p>
                    <p className="text-xs text-muted">
                      {l.connection
                        ? l.lastSyncedAt
                          ? `Sincronizzata ${relativeDate(l.lastSyncedAt)}`
                          : "Mai sincronizzata"
                        : "Non collegata"}
                    </p>
                  </div>
                  {!l.connection ? (
                    <Badge>Non collegata</Badge>
                  ) : l.connection.provider === "MOCK" ? (
                    <Badge tone="gold">Simulazione</Badge>
                  ) : l.connection.status === "ACTIVE" ? (
                    <Badge tone="positive">
                      <CheckCircle2 className="size-3" aria-hidden /> Collegata
                    </Badge>
                  ) : (
                    <Badge tone="danger">Da ricollegare</Badge>
                  )}
                </li>
              ))}
            </ul>
            {canEdit &&
              unlinked.map((l) => (
                <div key={l.id} className="mt-4 rounded-[var(--radius-panel)] border border-dashed border-line-strong p-4">
                  <p className="text-[13px] font-medium">Collega «{l.name}»</p>
                  {options.length > 0 && (
                    <ActionForm action={linkLocationAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
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
                  {available.map((a) => a.error && <p key={a.connectionId} className="mt-2 text-[13px] text-danger">{a.email}: {a.error}</p>)}
                  <ActionForm action={enableSimulationAction} className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-muted">
                    <input type="hidden" name="locationId" value={l.id} />
                    <span>{options.length > 0 ? "Oppure prova prima con" : "Prova con"} 12 recensioni di esempio:</span>
                    <SubmitButton variant="secondary" size="sm" pendingLabel="Caricamento…">
                      Usa la simulazione
                    </SubmitButton>
                  </ActionForm>
                </div>
              ))}
          </SettingsSection>

          {canEdit && connections.length > 0 && (
            <SettingsSection title="Account collegati" description="Scollegando un account le recensioni già importate restano visibili; Reputia smette di sincronizzarle.">
              <ul className="divide-y divide-line rounded-[var(--radius-panel)] border border-line">
                {connections.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">{c.provider === "MOCK" ? "Simulazione (dati di esempio)" : (c.accountEmail ?? "Account Google")}</p>
                      <p className="text-xs text-muted">
                        {c._count.locations} {c._count.locations === 1 ? "sede" : "sedi"} · collegato {relativeDate(c.createdAt)}
                      </p>
                    </div>
                    {c.provider === "GOOGLE" && c.status === "NEEDS_RECONNECT" && configured && (
                      <a href="/api/google/connect" className={buttonClass("secondary", "sm")}>
                        <RefreshCw aria-hidden /> Ricollega
                      </a>
                    )}
                    <ActionForm action={disconnectAction} messageClassName="hidden">
                      <input type="hidden" name="connectionId" value={c.id} />
                      <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                        Scollega
                      </SubmitButton>
                    </ActionForm>
                  </li>
                ))}
              </ul>
            </SettingsSection>
          )}
        </div>
      </PageBody>
    </>
  );
}

function Permission({ icon: Icon, title, body }: { icon: typeof Eye; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line bg-canvas text-muted">
        <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      </span>
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="text-muted">{body}</span>
      </span>
    </li>
  );
}

function GoogleGlyph() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] border border-line bg-surface">
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2z" />
        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.1H2A11 11 0 0 0 1 12c0 1.8.4 3.5 1.2 4.9z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7.1L5.7 10c.9-2.7 3.4-4.6 6.3-4.6z" />
      </svg>
    </span>
  );
}

