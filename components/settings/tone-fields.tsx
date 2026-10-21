import { SettingsSection } from "@/components/app/settings-section";
import { Input, Select, Textarea } from "@/components/ui/field";
import { LANGUAGE_LABELS, LENGTH_LABELS, TONE_LABELS } from "@/lib/ai/prompt";
import type { ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";

const TONE_SAMPLES: Record<ReplyTone, string> = {
  CORDIALE: "Grazie per averci scelto, siamo lieti che la cena sia stata di suo gradimento.",
  CALOROSO: "Che bello leggerti! Ci fa davvero piacere che ti sia trovato bene da noi.",
  ELEGANTE: "La ringraziamo per le gentili parole: è un piacere sapere che la serata l'abbia soddisfatta.",
  DIRETTO: "Grazie della recensione. A presto!",
};

export type ToneDefaults = {
  tone: ReplyTone;
  replyLength: ReplyLength;
  businessContext: string;
  signature: string;
  replyLanguage?: string;
  customInstructions?: string;
};

/** Shared by onboarding (compact) and AI settings (full, with language and instructions). */
export function ToneFields({ defaults, full = false }: { defaults: ToneDefaults; full?: boolean }) {
  return (
    <>
      <SettingsSection title="La tua attività" description="Solo fatti veri: specialità, servizi, come contattarvi. L'assistente usa queste informazioni e non inventa nulla oltre.">
        <label htmlFor="businessContext" className="sr-only">
          Descrizione dell&apos;attività
        </label>
        <Textarea
          id="businessContext"
          name="businessContext"
          rows={4}
          maxLength={1500}
          defaultValue={defaults.businessContext}
          placeholder="Es. Cucina sarda tradizionale, pasta fatta in casa ogni mattina. Prenotazioni al telefono o su WhatsApp."
        />
      </SettingsSection>

      <SettingsSection title="Tono di voce" description="Come parli ai tuoi clienti. Puoi cambiarlo anche per una singola risposta.">
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">Tono di voce</legend>
          {(Object.keys(TONE_LABELS) as ReplyTone[]).map((tone) => (
            <label
              key={tone}
              className="cursor-pointer rounded-[var(--radius-panel)] border border-line-strong bg-surface p-3.5 transition-[border-color,box-shadow] duration-[120ms] hover:border-ink/25 has-checked:border-accent has-checked:ring-3 has-checked:ring-accent/15 has-focus-visible:ring-3 has-focus-visible:ring-accent/30"
            >
              <input type="radio" name="tone" value={tone} defaultChecked={defaults.tone === tone} className="sr-only" />
              <span className="block text-[13px] font-semibold">{TONE_LABELS[tone]}</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-muted">&ldquo;{TONE_SAMPLES[tone]}&rdquo;</span>
            </label>
          ))}
        </fieldset>
      </SettingsSection>

      <SettingsSection title="Lunghezza" description="Le risposte brevi funzionano bene per le recensioni positive; per quelle negative serve qualche parola in più.">
        <fieldset className="inline-flex rounded-md border border-line-strong bg-subtle p-0.5">
          <legend className="sr-only">Lunghezza delle risposte</legend>
          {(Object.keys(LENGTH_LABELS) as ReplyLength[]).map((len) => (
            <label key={len} className="cursor-pointer rounded-[5px] px-3.5 py-1 text-[13px] text-muted transition-colors has-checked:bg-surface has-checked:font-medium has-checked:text-ink has-checked:shadow-card has-focus-visible:ring-2 has-focus-visible:ring-accent">
              <input type="radio" name="replyLength" value={len} defaultChecked={defaults.replyLength === len} className="sr-only" />
              {LENGTH_LABELS[len]}
            </label>
          ))}
        </fieldset>
      </SettingsSection>

      {full && (
        <>
          <SettingsSection title="Lingua delle risposte" description="Con «Lingua della recensione» l'assistente risponde ai turisti nella loro lingua.">
            <label htmlFor="replyLanguage" className="sr-only">
              Lingua delle risposte
            </label>
            <Select id="replyLanguage" name="replyLanguage" defaultValue={defaults.replyLanguage ?? "it"} className="max-w-xs">
              {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </SettingsSection>
          <SettingsSection title="Istruzioni personalizzate" description="Preferenze di stile, per esempio «dai sempre del Lei» o «non usare punti esclamativi». Non possono superare le regole di sicurezza.">
            <label htmlFor="customInstructions" className="sr-only">
              Istruzioni personalizzate
            </label>
            <Textarea id="customInstructions" name="customInstructions" rows={3} maxLength={600} defaultValue={defaults.customInstructions ?? ""} placeholder="Es. Chiama i clienti per nome. Evita i punti esclamativi." />
          </SettingsSection>
        </>
      )}

      <SettingsSection title="Firma" description="Facoltativa. Compare in fondo a ogni risposta.">
        <label htmlFor="signature" className="sr-only">
          Firma
        </label>
        <Input id="signature" name="signature" maxLength={120} defaultValue={defaults.signature} placeholder="Es. Gino e lo staff della Trattoria" className="max-w-sm" />
      </SettingsSection>
    </>
  );
}
