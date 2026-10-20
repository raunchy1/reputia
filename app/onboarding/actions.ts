"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { runAction, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BusinessCategory, ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";
import { UserError } from "@/lib/errors";
import { ensureMockConnection } from "@/lib/services/connections";
import { linkLocation, updateLocation } from "@/lib/services/locations";
import { syncLocation } from "@/lib/services/sync";
import { getOrgContext, requireOrg, requireUser } from "@/lib/session";

const businessSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il nome dell'attività.").max(120),
  category: z.enum(BusinessCategory, { error: "Scegli una categoria." }),
  city: z.string().trim().max(80).optional(),
});

function slugify(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "attivita"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createBusiness(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await runAction(async () => {
    const session = await requireUser();
    if (await getOrgContext()) throw new UserError("Hai già creato la tua attività.");
    const data = businessSchema.parse({ name: form.get("name"), category: form.get("category"), city: form.get("city") || undefined });
    const org = await auth.api.createOrganization({ body: { name: data.name, slug: slugify(data.name) }, headers: await headers() });
    if (!org) throw new UserError("Impossibile creare l'organizzazione.");
    const location = await db.location.create({ data: { organizationId: org.id, name: data.name, category: data.category, city: data.city } });
    await audit({ organizationId: org.id, actorUserId: session.user.id, action: "organization.created", targetType: "location", targetId: location.id });
  });
  if (result?.ok) redirect("/onboarding/google");
  return result;
}

export async function connectSimulation(): Promise<ActionState> {
  const result = await runAction(async () => {
    const ctx = await requireOrg("admin");
    const location = await db.location.findFirst({ where: { organizationId: ctx.organization.id, archivedAt: null }, orderBy: { createdAt: "asc" } });
    if (!location) throw new UserError("Crea prima la tua attività.");
    const connection = await ensureMockConnection(ctx);
    await linkLocation(ctx, location.id, connection.id, `mock/locations/${location.id}`);
    await syncLocation(ctx, location.id);
  });
  if (result?.ok) redirect("/onboarding/tono");
  return result;
}

const toneSchema = z.object({
  tone: z.enum(ReplyTone),
  replyLength: z.enum(ReplyLength),
  businessContext: z.string().trim().max(1500).default(""),
  signature: z.string().trim().max(120).default(""),
});

export async function saveTone(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await runAction(async () => {
    const ctx = await requireOrg("admin");
    const data = toneSchema.parse(Object.fromEntries(form));
    const locations = await db.location.findMany({ where: { organizationId: ctx.organization.id, archivedAt: null }, select: { id: true } });
    for (const l of locations) await updateLocation(ctx, l.id, data);
  });
  if (result?.ok) redirect("/app?benvenuto=1");
  return result;
}
