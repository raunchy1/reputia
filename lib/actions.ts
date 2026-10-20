import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { UserError } from "@/lib/errors";

export type ActionState = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> } | null;

/** Runs a server action body and converts failures into a state the form can render. */
export async function runAction(fn: () => Promise<string | void>): Promise<ActionState> {
  try {
    const message = await fn();
    return { ok: true, message: message ?? undefined };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
      return { ok: false, error: "Controlla i campi evidenziati.", fieldErrors };
    }
    if (error instanceof UserError) return { ok: false, error: error.message };
    console.error("[action]", error);
    return { ok: false, error: "Si è verificato un errore imprevisto. Riprova tra poco." };
  }
}
