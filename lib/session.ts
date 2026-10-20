import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserError } from "@/lib/errors";
import { hasRole, type Role } from "@/lib/roles";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/accedi");
  return session;
}

export type OrgContext = {
  user: { id: string; name: string; email: string };
  organization: { id: string; name: string; slug: string };
  role: string;
};

/**
 * Resolves the organization the signed-in user is acting for. The id comes from
 * the server-side session only, and membership is re-checked against the database
 * on every call, so a client can never pick another tenant.
 */
export const getOrgContext = cache(async (): Promise<OrgContext | null> => {
  const session = await getSession();
  if (!session) return null;
  const activeId = session.session.activeOrganizationId;
  const member = await db.member.findFirst({
    where: { userId: session.user.id, ...(activeId ? { organizationId: activeId } : {}) },
    orderBy: { createdAt: "asc" },
    include: { organization: { select: { id: true, name: true, slug: true } } },
  });
  if (!member) return null;
  return {
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
    organization: member.organization,
    role: member.role,
  };
});

export async function requireOrg(minRole: Role = "member"): Promise<OrgContext> {
  await requireUser();
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!hasRole(ctx.role, minRole)) throw new ForbiddenError();
  return ctx;
}

export class ForbiddenError extends UserError {
  constructor() {
    super("Non hai i permessi per questa operazione.");
  }
}
