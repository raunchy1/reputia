"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, type ActionState } from "@/lib/actions";
import { UserError } from "@/lib/errors";
import { ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";
import { generateDraft, publishReply, requestApproval, saveDraft, setStatus } from "@/lib/services/reviews";
import { listLocations } from "@/lib/services/locations";
import { syncLocation } from "@/lib/services/sync";
import { requireOrg } from "@/lib/session";

const id = z.string().min(1).max(64);
const text = z.string().max(4096, "La risposta è troppo lunga.");

export type GenerateResult = (NonNullable<ActionState> & { text?: string; flags?: string[] }) | null;

export async function generateAction(reviewId: string, tone?: string, length?: string): Promise<GenerateResult> {
  let draft: { text: string; flags: string[] } | undefined;
  const result = await runAction(async () => {
    const ctx = await requireOrg();
    const input = z
      .object({ reviewId: id, tone: z.enum(ReplyTone).optional(), length: z.enum(ReplyLength).optional() })
      .parse({ reviewId, tone: tone || undefined, length: length || undefined });
    draft = await generateDraft(ctx, input.reviewId, { tone: input.tone, length: input.length });
    revalidatePath("/app", "layout");
  });
  return result && draft ? { ...result, text: draft.text, flags: draft.flags } : result;
}

export async function saveDraftAction(reviewId: string, value: string): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg();
    await saveDraft(ctx, id.parse(reviewId), text.parse(value));
    revalidatePath("/app", "layout");
    return "Bozza salvata.";
  });
}

export async function requestApprovalAction(reviewId: string, value: string): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg();
    await requestApproval(ctx, id.parse(reviewId), text.parse(value));
    revalidatePath("/app", "layout");
    return "Inviata al titolare per l'approvazione.";
  });
}

export async function publishAction(reviewId: string, value: string): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg("admin");
    const { simulated } = await publishReply(ctx, id.parse(reviewId), text.min(1, "La risposta è vuota.").parse(value));
    revalidatePath("/app", "layout");
    return simulated ? "Segnata come pubblicata (simulazione: non inviata a Google)." : "Risposta pubblicata su Google.";
  });
}

export async function archiveAction(reviewId: string, undo = false): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireOrg();
    await setStatus(ctx, id.parse(reviewId), undo ? "NEW" : "IGNORED");
    revalidatePath("/app", "layout");
    return undo ? "Recensione rimessa tra quelle da gestire." : "Recensione archiviata senza risposta.";
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
