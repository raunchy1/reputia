import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PasswordForm } from "@/components/settings/password-form";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { inviteMemberAction, removeMemberAction, renameOrganizationAction, updateProfileAction } from "@/app/app/settings-actions";
import { db } from "@/lib/db";
import { longDate } from "@/lib/format";
import { hasRole, isRole, ROLE_LABELS } from "@/lib/roles";
import { requireOrg } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const ctx = await requireOrg();
  const [members, invitations] = await Promise.all([
    db.member.findMany({ where: { organizationId: ctx.organization.id }, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" } }),
    db.invitation.findMany({ where: { organizationId: ctx.organization.id, status: "pending", expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } }),
  ]);
  const isAdmin = hasRole(ctx.role, "admin");

  return (
    <>
      <PageHeader eyebrow="Account" title="Account e team" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card grid content-start gap-5 p-6" aria-labelledby="profile-title">
          <h2 id="profile-title" className="font-semibold">
            Il tuo profilo
          </h2>
          <ActionForm action={updateProfileAction} className="grid gap-4">
            <Field label="Nome" htmlFor="name">
              <Input id="name" name="name" defaultValue={ctx.user.name} required maxLength={80} autoComplete="name" />
            </Field>
            <Field label="Email" htmlFor="email" hint="Per cambiare email scrivi all'assistenza.">
              <Input id="email" value={ctx.user.email} disabled readOnly />
            </Field>
            <SubmitButton variant="secondary" className="justify-self-start">
              Salva
            </SubmitButton>
          </ActionForm>
        </section>

        <section className="card grid content-start gap-5 p-6" aria-labelledby="password-title">
          <h2 id="password-title" className="font-semibold">
            Password
          </h2>
          <PasswordForm />
        </section>

        <section className="card grid content-start gap-5 p-6" aria-labelledby="org-title">
          <h2 id="org-title" className="font-semibold">
            Attività
          </h2>
          <ActionForm action={renameOrganizationAction} className="grid gap-4">
            <Field label="Nome dell'organizzazione" htmlFor="orgName" hint="Compare nelle email di invito e nelle fatture.">
              <Input id="orgName" name="name" defaultValue={ctx.organization.name} disabled={ctx.role !== "owner"} required maxLength={120} />
            </Field>
            {ctx.role === "owner" && (
              <SubmitButton variant="secondary" className="justify-self-start">
                Salva
              </SubmitButton>
            )}
          </ActionForm>
        </section>

        <section className="card grid content-start gap-5 p-6" aria-labelledby="team-title">
          <h2 id="team-title" className="font-semibold">
            Team
          </h2>
          <ul className="divide-y divide-line">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.user.name}</p>
                  <p className="truncate text-xs text-muted">{m.user.email}</p>
                </div>
                <Badge>{isRole(m.role) ? ROLE_LABELS[m.role] : m.role}</Badge>
                {isAdmin && m.role !== "owner" && m.userId !== ctx.user.id && (
                  <ActionForm action={removeMemberAction} messageClassName="hidden">
                    <input type="hidden" name="memberId" value={m.id} />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                      Rimuovi
                    </SubmitButton>
                  </ActionForm>
                )}
              </li>
            ))}
            {invitations.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{i.email}</p>
                  <p className="text-xs text-muted">Invito in attesa · scade il {longDate(i.expiresAt)}</p>
                </div>
                <Badge tone="accent">Invitato</Badge>
              </li>
            ))}
          </ul>
          {isAdmin && (
            <ActionForm action={inviteMemberAction} className="grid gap-3 border-t border-line pt-5">
              <p className="text-sm font-medium">Invita un collaboratore</p>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                <label htmlFor="inviteEmail" className="sr-only">
                  Email
                </label>
                <Input id="inviteEmail" name="email" type="email" required placeholder="nome@esempio.it" />
                <label htmlFor="inviteRole" className="sr-only">
                  Ruolo
                </label>
                <Select id="inviteRole" name="role" defaultValue="member">
                  <option value="member">Collaboratore</option>
                  <option value="admin">Amministratore</option>
                </Select>
              </div>
              <p className="text-xs text-muted">I collaboratori preparano le bozze; gli amministratori possono anche pubblicarle e gestire le impostazioni.</p>
              <SubmitButton variant="secondary" className="justify-self-start" pendingLabel="Invio…">
                Invia invito
              </SubmitButton>
            </ActionForm>
          )}
        </section>
      </div>
    </>
  );
}
