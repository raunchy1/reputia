"use server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { runAction, type ActionState } from "@/lib/actions";
import { clientIp } from "@/lib/audit";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { UserError } from "@/lib/errors";
import { BusinessCategory } from "@/lib/generated/prisma/enums";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome.").max(80),
  businessName: z.string().trim().min(2, "Inserisci il nome dell'attività.").max(120),
  email: z.email("Email non valida.").max(160),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(80).optional(),
  category: z.enum(BusinessCategory).optional(),
  message: z.string().trim().max(2000).optional(),
  privacy: z.literal("on", { error: "Per inviare la richiesta accetta l'informativa privacy." }),
  marketing: z.literal("on").optional(),
});

export async function submitLead(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    // Honeypot: real visitors never fill this hidden field.
    if (form.get("website")) return "Grazie! Ti ricontattiamo entro un giorno lavorativo.";
    const ip = (await clientIp()) ?? "unknown";
    const limit = await rateLimit(`lead:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`, 5, 3600);
    if (!limit.ok) throw new UserError("Hai inviato troppe richieste. Riprova più tardi o scrivici via email.");

    const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === "string" && v.trim() === "" ? undefined : v]));
    const data = schema.parse({ ...raw, email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : raw.email });
    const lead = await db.lead.create({
      data: {
        name: data.name,
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        category: data.category,
        message: data.message,
        privacyAcceptedAt: new Date(),
        marketingConsent: data.marketing === "on",
        source: "sito/contatti",
      },
    });
    const notify = process.env.LEADS_NOTIFY_EMAIL;
    if (notify) {
      await sendEmail({
        to: notify,
        subject: `Nuova richiesta demo: ${lead.businessName}`,
        text: `${lead.name} — ${lead.businessName}${lead.city ? ` (${lead.city})` : ""}\nEmail: ${lead.email}\nTelefono: ${lead.phone ?? "—"}\n\n${lead.message ?? ""}`,
        html: `<p><strong>${escape(lead.name)}</strong> — ${escape(lead.businessName)}</p><p>Email: ${escape(lead.email)}<br>Telefono: ${escape(lead.phone ?? "—")}</p><p>${escape(lead.message ?? "")}</p>`,
      }).catch((error) => console.error("[lead notify]", error));
    }
    return "Grazie! Abbiamo ricevuto la tua richiesta: ti ricontattiamo entro un giorno lavorativo per fissare la demo.";
  });
}

function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
