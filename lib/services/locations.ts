import "server-only";
import { UserError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import type { BusinessCategory, ReplyLength, ReplyTone } from "@/lib/generated/prisma/client";
import type { OrgContext } from "@/lib/session";
export { CATEGORY_LABELS } from "@/lib/categories";

export async function listLocations(ctx: OrgContext) {
  return db.location.findMany({
    where: { organizationId: ctx.organization.id, archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: { connection: { select: { provider: true, status: true, accountEmail: true } }, _count: { select: { reviews: true } } },
  });
}

export async function getLocation(ctx: OrgContext, id: string) {
  return db.location.findFirst({ where: { id, organizationId: ctx.organization.id, archivedAt: null } });
}

export async function createLocation(ctx: OrgContext, data: { name: string; category: BusinessCategory; city?: string }) {
  const location = await db.location.create({ data: { ...data, organizationId: ctx.organization.id } });
  await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "location.created", targetType: "location", targetId: location.id });
  return location;
}

export async function updateLocation(
  ctx: OrgContext,
  id: string,
  data: Partial<{ name: string; category: BusinessCategory; city: string; tone: ReplyTone; replyLength: ReplyLength; businessContext: string; signature: string; replyLanguage: string; customInstructions: string }>,
) {
  const res = await db.location.updateMany({ where: { id, organizationId: ctx.organization.id, archivedAt: null }, data });
  if (res.count === 0) throw new UserError("Sede non trovata.");
}

export async function linkLocation(ctx: OrgContext, id: string, connectionId: string, externalLocationId: string) {
  const connection = await db.googleConnection.findFirst({ where: { id: connectionId, organizationId: ctx.organization.id, status: "ACTIVE" } });
  if (!connection) throw new UserError("Collegamento non trovato.");
  const clash = await db.location.findFirst({ where: { organizationId: ctx.organization.id, externalLocationId, NOT: { id } } });
  if (clash) throw new UserError(`Questa scheda Google è già collegata alla sede "${clash.name}".`);
  const res = await db.location.updateMany({ where: { id, organizationId: ctx.organization.id }, data: { connectionId, externalLocationId } });
  if (res.count === 0) throw new UserError("Sede non trovata.");
  await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "location.linked", targetType: "location", targetId: id, metadata: { provider: connection.provider } });
}

export async function archiveLocation(ctx: OrgContext, id: string) {
  const res = await db.location.updateMany({ where: { id, organizationId: ctx.organization.id, archivedAt: null }, data: { archivedAt: new Date() } });
  if (res.count === 0) throw new UserError("Sede non trovata.");
  await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "location.archived", targetType: "location", targetId: id });
}

export async function activeLocationCount(organizationId: string) {
  return db.location.count({ where: { organizationId, archivedAt: null } });
}
