import { Field, Input, Textarea } from "@/components/ui/field";
import { LENGTH_LABELS, TONE_LABELS } from "@/lib/ai/prompt";
import type { ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/cn";

const TONE_SAMPLES: Record<ReplyTone, string> = {
  CORDIALE: "Grazie per averci scelto, siamo lieti che la cena sia stata di suo gradimento.",
  CALOROSO: "Che bello leggerti! Ci fa davvero piacere che ti sia trovato bene da noi.",
  ELEGANTE: "La ringraziamo per le gentili parole: è un piacere sapere che la serata l'abbia soddisfatta.",
  DIRETTO: "Grazie della recensione. A presto!",
};

export function ToneFields({
  defaults,
}: {
  defaults: { tone: ReplyTone; replyLength: ReplyLength; businessContext: string; signature: string };
}) {
  return (
    <>
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-[13px] font-medium text-ink-soft">Tono di voce</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(TONE_LABELS) as ReplyTone[]).map((tone) => (
            <label
              key={tone}
              className="group relative cursor-pointer rounded-2xl border border-line-strong bg-surface p-4 transition hover:border-ink/30 has-checked:border-accent has-checked:ring-4 has-checked:ring-accent/10"
            >
              <input type="radio" name="tone" value={tone} defaultChecked={defaults.tone === tone} className="sr-only" />
              <span className="block text-sm font-semibold">{TONE_LABELS[tone]}</span>
              <span className="mt-1.5 block text-[13px] leading-relaxed text-muted italic">&ldquo;{TONE_SAMPLES[tone]}&rdquo;</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-ink-soft">Lunghezza delle risposte</legend>
        <div className="inline-flex rounded-xl border border-line-strong bg-paper p-1">
          {(Object.keys(LENGTH_LABELS) as ReplyLength[]).map((len) => (
            <label key={len} className={cn("cursor-pointer rounded-lg px-4 py-1.5 text-sm text-muted transition has-checked:bg-surface has-checked:text-ink has-checked:shadow-card")}>
              <input type="radio" name="replyLength" value={len} defaultChecked={defaults.replyLength === len} className="sr-only" />
              {LENGTH_LABELS[len]}
            </label>
          ))}
        </div>
      </fieldset>
      <Field
        label="Cosa deve sapere l'assistente sulla tua attività"
        htmlFor="businessContext"
        hint="Solo fatti veri: specialità, servizi, orari, come contattarvi. L'AI non inventa nulla oltre a questo."
      >
        <Textarea
          id="businessContext"
          name="businessContext"
          rows={4}
          maxLength={1500}
          defaultValue={defaults.businessContext}
          placeholder="Es. Cucina sarda tradizionale, pasta fatta in casa ogni mattina. Prenotazioni al telefono o su WhatsApp."
        />
      </Field>
      <Field label="Firma (facoltativa)" htmlFor="signature" hint="Comparirà alla fine di ogni risposta.">
        <Input id="signature" name="signature" maxLength={120} defaultValue={defaults.signature} placeholder="Es. Gino e lo staff della Trattoria" />
      </Field>
    </>
  );
}
