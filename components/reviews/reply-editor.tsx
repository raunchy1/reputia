"use client";
import { AlertTriangle, Send, Sparkles } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Select, Textarea } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { generateAction, ignoreAction, publishAction, saveDraftAction, type DraftState } from "@/app/app/recensioni/actions";
import { LENGTH_LABELS, TONE_LABELS } from "@/lib/ai/prompt";
import { checkReply, flagLabel, MAX_REPLY_BYTES } from "@/lib/ai/safety";
import type { ActionState } from "@/lib/actions";
import type { ReplyLength, ReplyTone, ReviewStatus } from "@/lib/generated/prisma/enums";

type Props = {
  reviewId: string;
  status: ReviewStatus;
  initialText: string;
  initialFlags: string[];
  defaultTone: ReplyTone;
  defaultLength: ReplyLength;
  canPublish: boolean;
  connection: { simulated: boolean; active: boolean } | null;
  lastError: string | null;
  draftsCount: number;
};

export function ReplyEditor(props: Props) {
  const [text, setText] = useState(props.initialText);
  const [genState, generate, generating] = useActionState<DraftState, FormData>(generateAction, null);
  const [saveState, save] = useActionState(saveDraftAction, null);
  const [publishState, publish] = useActionState(publishAction, null);
  const [ignoreState, ignore] = useActionState(ignoreAction, null);

  useEffect(() => {
    if (genState?.ok && genState.text) setText(genState.text);
  }, [genState]);

  const flags = checkReply(text);
  const bytes = new TextEncoder().encode(text).length;
  const published = props.status === "PUBLISHED";
  const hasDraft = text.trim().length > 0;

  return (
    <section className="card overflow-hidden" aria-labelledby="editor-title">
      <div className="border-b border-line bg-paper/60 px-6 py-4 sm:px-7">
        <h2 id="editor-title" className="font-semibold">
          {published ? "Modifica la risposta pubblicata" : "La tua risposta"}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">L&apos;assistente propone, tu decidi. Nulla viene pubblicato senza la tua conferma.</p>
      </div>

      <div className="grid gap-5 p-6 sm:p-7">
        <form action={generate} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="reviewId" value={props.reviewId} />
          <label className="grid gap-1 text-[13px] font-medium text-ink-soft">
            Tono
            <Select name="tone" defaultValue={props.defaultTone} className="h-10 w-auto text-sm">
              {(Object.keys(TONE_LABELS) as ReplyTone[]).map((t) => (
                <option key={t} value={t}>
                  {TONE_LABELS[t]}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1 text-[13px] font-medium text-ink-soft">
            Lunghezza
            <Select name="length" defaultValue={props.defaultLength} className="h-10 w-auto text-sm">
              {(Object.keys(LENGTH_LABELS) as ReplyLength[]).map((l) => (
                <option key={l} value={l}>
                  {LENGTH_LABELS[l]}
                </option>
              ))}
            </Select>
          </label>
          <Button type="submit" variant="accent" disabled={generating} aria-busy={generating} className="ml-auto">
            <Sparkles className="size-4" aria-hidden />
            {generating ? "Sto scrivendo…" : hasDraft ? "Rigenera" : "Genera risposta"}
          </Button>
        </form>
        {genState && !genState.ok && <FormMessage state={genState} />}

        <div className="relative">
          <label htmlFor="reply" className="sr-only">
            Testo della risposta
          </label>
          <Textarea
            id="reply"
            rows={9}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Premi «Genera risposta» oppure scrivi qui la tua risposta."
            className={generating ? "animate-pulse opacity-60" : undefined}
            aria-describedby="reply-meta"
          />
          <p id="reply-meta" className={bytes > MAX_REPLY_BYTES ? "mt-1.5 text-right text-xs text-danger" : "mt-1.5 text-right text-xs text-faint"}>
            {text.length} caratteri{bytes > MAX_REPLY_BYTES && " · oltre il limite di Google"}
          </p>
        </div>

        {flags.length > 0 && (
          <Notice tone="warning">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" aria-hidden /> Controlla prima di pubblicare
            </span>
            <ul className="mt-1 list-disc pl-6">
              {flags.map((f) => (
                <li key={f}>{flagLabel(f)}</li>
              ))}
            </ul>
          </Notice>
        )}
        {props.lastError && <Notice tone="danger">L&apos;ultimo tentativo di pubblicazione non è andato a buon fine. Puoi riprovare.</Notice>}

        <div className="flex flex-wrap items-center gap-3">
          <form action={save}>
            <input type="hidden" name="reviewId" value={props.reviewId} />
            <input type="hidden" name="text" value={text} />
            <SubmitButton variant="secondary" disabled={!hasDraft} pendingLabel="Salvataggio…">
              Salva bozza
            </SubmitButton>
          </form>
          {!published && (
            <form action={ignore} className="ml-auto">
              <input type="hidden" name="reviewId" value={props.reviewId} />
              {props.status === "IGNORED" && <input type="hidden" name="undo" value="1" />}
              <SubmitButton variant="ghost" size="sm">
                {props.status === "IGNORED" ? "Rimetti tra le da gestire" : "Non rispondere"}
              </SubmitButton>
            </form>
          )}
        </div>
        <FormMessage state={saveState} />
        <FormMessage state={ignoreState} />

        <PublishBox {...props} text={text} hasDraft={hasDraft} publish={publish} publishState={publishState} />
        {props.draftsCount > 0 && <p className="text-xs text-faint">{props.draftsCount} bozze generate per questa recensione.</p>}
      </div>
    </section>
  );
}

function PublishBox({
  reviewId,
  text,
  hasDraft,
  canPublish,
  connection,
  status,
  publish,
  publishState,
}: Props & { text: string; hasDraft: boolean; publish: (form: FormData) => void; publishState: ActionState }) {
  if (!connection) return <Notice tone="warning">Collega questa sede a Google per poter pubblicare le risposte.</Notice>;
  if (!connection.active) return <Notice tone="danger">Il collegamento con Google va rinnovato prima di pubblicare.</Notice>;
  if (!canPublish) return <Notice>Solo il titolare o un amministratore può pubblicare. Salva la bozza: la troveranno pronta.</Notice>;

  return (
    <form action={publish} className="grid gap-3 rounded-2xl border border-line bg-paper/70 p-4">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input type="hidden" name="text" value={text} />
      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <Checkbox name="confirm" required />
        <span>Ho riletto la risposta e confermo che le informazioni sono corrette.</span>
      </label>
      <SubmitButton disabled={!hasDraft} pendingLabel="Pubblicazione…" className="justify-self-start">
        <Send className="size-4" aria-hidden />
        {connection.simulated ? "Pubblica (simulazione)" : status === "PUBLISHED" ? "Aggiorna su Google" : "Pubblica su Google"}
      </SubmitButton>
      <FormMessage state={publishState} />
    </form>
  );
}
