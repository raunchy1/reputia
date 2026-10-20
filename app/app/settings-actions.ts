"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { UserError } from "@/lib/errors";
import { BusinessCategory, ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";
import { revokeToken } from "@/lib/google/oauth";
import { ensureMockConnection } from "@/lib/services/connections";
import { archiveLocation, createLocation, linkLocation, updateLocation } from "@/lib/services/locations";
import { syncLocation } from "@/lib/services/sync";
import { requireOrg } from "@/lib/session";

const id = z.string().min(1).max(64);

export async function saveToneAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const data = z
      .object({
        locationId: id,
        tone: z.enum(ReplyTone),
        replyLength: z.enum(ReplyLength),
        businessContext: z.string().trim().max(1500).default(""),
        signature: z.string().trim().max(120).default(""),
      })
      .parse(Object.fromEntries(form));
    const { locationId, ...settings } = data;
    await updateLocation(ctx, locationId, settings);
    revalidatePath("/app/impostazioni-ai");
    return "Impostazioni salvate. Le prossime bozze useranno questo stile.";
  });
}

export async function createLocationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const data = z
      .object({
        name: z.string().trim().min(2, "Inserisci il nome della sede.").max(120),
        category: z.enum(BusinessCategory, { error: "Scegli una categoria." }),
        city: z.string().trim().max(80).optional(),
      })
      .parse({ name: form.get("name"), category: form.get("category"), city: form.get("city") || undefined });
    await createLocation(ctx, data);
    revalidatePath("/app", "layout");
    return `Sede "${data.name}" aggiunta. Collegala a Google per importare le recensioni.`;
  });
}

export async function archiveLocationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    await archiveLocation(ctx, id.parse(form.get("locationId")));
    revalidatePath("/app", "layout");
    return "Sede archiviata.";
  });
}

export async function linkLocationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const input = z
      .object({ locationId: id, target: z.string().min(3).max(300) })
      .parse({ locationId: form.get("locationId"), target: form.get("target") });
    const [connectionId, ...rest] = input.target.split("|");
    await linkLocation(ctx, input.locationId, connectionId, rest.join("|"));
    try {
      await syncLocation(ctx, input.locationId);
    } catch (error) {
      if (error instanceof UserError) throw error;
      console.error("[link sync]", error);
      throw new UserError("Sede collegata, ma l'importazione delle recensioni non è riuscita. Riprova con «Sincronizza».");
    }
    revalidatePath("/app", "layout");
    return "Sede collegata e recensioni importate.";
  });
}

export async function enableSimulationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const locationId = id.parse(form.get("locationId"));
    const connection = await ensureMockConnection(ctx);
    await linkLocation(ctx, locationId, connection.id, `mock/locations/${locationId}`);
    await syncLocation(ctx, locationId);
    revalidatePath("/app", "layout");
    return "Simulazione attivata con recensioni di esempio.";
  });
}

export async function disconnectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const connectionId = id.parse(form.get("connectionId"));
    const conn = await db.googleConnection.findFirst({ where: { id: connectionId, organizationId: ctx.organization.id } });
    if (!conn) throw new UserError("Collegamento non trovato.");
    if (conn.refreshTokenEnc) await revokeToken(decrypt(conn.refreshTokenEnc));
    await db.$transaction([
      db.location.updateMany({ where: { connectionId: conn.id, organizationId: ctx.organization.id }, data: { connectionId: null, externalLocationId: null } }),
      db.googleConnection.update({ where: { id: conn.id }, data: { status: "REVOKED", accessTokenEnc: null, refreshTokenEnc: null } }),
    ]);
    await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "google.disconnected", targetType: "googleConnection", targetId: conn.id });
    revalidatePath("/app", "layout");
    return "Collegamento rimosso. Le recensioni già importate restano visibili.";
  });
}

export async function updateProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    await requireOrg();
    const name = z.string().trim().min(2, "Inserisci il tuo nome.").max(80).parse(form.get("name"));
    await auth.api.updateUser({ body: { name }, headers: await headers() });
    revalidatePath("/app", "layout");
    return "Profilo aggiornato.";
  });
}

export async function renameOrganizationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("owner");
    const name = z.string().trim().min(2, "Inserisci un nome.").max(120).parse(form.get("name"));
    await db.organization.update({ where: { id: ctx.organization.id }, data: { name } });
    await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "organization.renamed" });
    revalidatePath("/app", "layout");
    return "Nome aggiornato.";
  });
}

export async function inviteMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const input = z
      .object({ email: z.email("Email non valida."), role: z.enum(["member", "admin"]) })
      .parse({ email: String(form.get("email") ?? "").trim().toLowerCase(), role: form.get("role") });
    try {
      await auth.api.createInvitation({ body: { email: input.email, role: input.role, organizationId: ctx.organization.id }, headers: await headers() });
    } catch (error) {
      console.error("[invite]", error);
      throw new UserError("Invito non inviato: la persona potrebbe essere già nel team o avere un invito in sospeso.");
    }
    await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "member.invited", metadata: { role: input.role } });
    revalidatePath("/app/account");
    return `Invito inviato a ${input.email}.`;
  });
}

export async function removeMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const memberId = id.parse(form.get("memberId"));
    const member = await db.member.findFirst({ where: { id: memberId, organizationId: ctx.organization.id } });
    if (!member) throw new UserError("Membro non trovato.");
    if (member.role === "owner") throw new UserError("Il titolare non può essere rimosso.");
    if (member.userId === ctx.user.id) throw new UserError("Non puoi rimuovere te stesso.");
    await db.member.delete({ where: { id: member.id } });
    await audit({ organizationId: ctx.organization.id, actorUserId: ctx.user.id, action: "member.removed", targetType: "member", targetId: member.id });
    revalidatePath("/app/account");
    return "Membro rimosso.";
  });
}
