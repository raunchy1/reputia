"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, type ActionState } from "@/lib/actions";
import { UserError } from "@/lib/errors";
import { ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";
import { generateDraft, publishReply, saveDraft, setStatus } from "@/lib/services/reviews";
import { listLocations } from "@/lib/services/locations";
import { syncLocation } from "@/lib/services/sync";
import { requireOrg } from "@/lib/session";

const id = z.string().min(1).max(64);
const text = z.string().max(4096, "La risposta è troppo lunga.");

export type DraftState = (NonNullable<ActionState> & { text?: string; flags?: string[] }) | null;

export async function generateAction(_: DraftState, form: FormData): Promise<DraftState> {
  let draft: { text: string; flags: string[] } | undefined;
  const result = await runAction(async () => {
    const ctx = await requireOrg();
    const input = z
      .object({ reviewId: id, tone: z.enum(ReplyTone).optional(), length: z.enum(ReplyLength).optional() })
      .parse({ reviewId: form.get("reviewId"), tone: form.get("tone") || undefined, length: form.get("length") || undefined });
    draft = await generateDraft(ctx, input.reviewId, { tone: input.tone, length: input.length });
    revalidatePath(`/app/recensioni/${input.reviewId}`);
  });
  return { ...result, ...(draft ? { text: draft.text, flags: draft.flags } : {}) } as DraftState;
}

export async function saveDraftAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg();
    const input = z.object({ reviewId: id, text }).parse({ reviewId: form.get("reviewId"), text: form.get("text") });
    await saveDraft(ctx, input.reviewId, input.text);
    revalidatePath(`/app/recensioni/${input.reviewId}`);
    return "Bozza salvata.";
  });
}

export async function publishAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const input = z
      .object({ reviewId: id, text: text.min(1, "La risposta è vuota."), confirm: z.literal("on", { error: "Conferma di aver riletto la risposta." }) })
      .parse({ reviewId: form.get("reviewId"), text: form.get("text"), confirm: form.get("confirm") });
    const { simulated } = await publishReply(ctx, input.reviewId, input.text);
    revalidatePath("/app", "layout");
    return simulated ? "Risposta salvata come pubblicata (simulazione: non è stata inviata a Google)." : "Risposta pubblicata su Google.";
  });
}

export async function ignoreAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg();
    const reviewId = id.parse(form.get("reviewId"));
    await setStatus(ctx, reviewId, form.get("undo") ? "NEW" : "IGNORED");
    revalidatePath("/app", "layout");
  });
}

export async function syncAction(): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg();
    const locations = (await listLocations(ctx)).filter((l) => l.connection?.status === "ACTIVE" && l.externalLocationId);
    if (locations.length === 0) throw new UserError("Nessuna sede collegata da sincronizzare.");
    let created = 0;
    for (const l of locations) {
      try {
        created += (await syncLocation(ctx, l.id)).created;
      } catch (error) {
        if (error instanceof UserError) throw error;
        console.error("[sync]", error);
        throw new UserError(`Sincronizzazione di "${l.name}" non riuscita. Riprova tra qualche minuto.`);
      }
    }
    revalidatePath("/app", "layout");
    return created ? `${created} nuove recensioni importate.` : "Nessuna nuova recensione.";
  });
}
