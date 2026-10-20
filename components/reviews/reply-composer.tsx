"use client";
import { AlertTriangle, Archive, ArchiveRestore, Check, Copy, Send, Sparkles, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ReviewStatusBadge } from "@/components/app/review-status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/field";
import { archiveAction, generateAction, publishAction, requestApprovalAction, saveDraftAction } from "@/app/app/recensioni/actions";
import { LENGTH_LABELS, TONE_LABELS } from "@/lib/ai/prompt";
import { checkReply, flagLabel, MAX_REPLY_BYTES } from "@/lib/ai/safety";
import type { ActionState } from "@/lib/actions";
import { cn } from "@/lib/cn";
import type { ReplyLength, ReplyTone, ReviewStatus } from "@/lib/generated/prisma/enums";

export type ComposerProps = {
  reviewId: string;
  authorName: string;
  status: ReviewStatus;
  savedText: string;
  defaultTone: ReplyTone;
  defaultLength: ReplyLength;
  canPublish: boolean;
  connection: { simulated: boolean; active: boolean } | null;
  hadError: boolean;
  provenance: string | null;
  /** Onboarding preview: no archive link, no publish/approval actions. */
  compact?: boolean;
};

function notify(state: ActionState) {
  if (!state) return;
  if (state.ok) toast.success(state.message ?? "Fatto.");
  else toast.error(state.error);
}

export function ReplyComposer(p: ComposerProps) {
  const router = useRouter();
  const [text, setText] = useState(p.savedText);
  const [saved, setSaved] = useState(p.savedText);
  const [tone, setTone] = useState<ReplyTone>(p.defaultTone);
  const [length, setLength] = useState<ReplyLength>(p.defaultLength);
  const [generation, setGeneration] = useState(0);
  const [generating, startGenerate] = useTransition();
  const [busy, startBusy] = useTransition();
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // A different review was selected in the inbox: reset local state.
  useEffect(() => {
    setText(p.savedText);
    setSaved(p.savedText);
    setTone(p.defaultTone);
    setLength(p.defaultLength);
  }, [p.reviewId, p.savedText, p.defaultTone, p.defaultLength]);

  const flags = checkReply(text);
  const bytes = new TextEncoder().encode(text).length;
  const tooLong = bytes > MAX_REPLY_BYTES;
  const hasText = text.trim().length > 0;
  const dirty = text !== saved;
  const published = p.status === "PUBLISHED";
  const archived = p.status === "IGNORED";

  function generate() {
    startGenerate(async () => {
      const res = await generateAction(p.reviewId, tone, length);
      if (res?.ok && res.text) {
        setText(res.text);
        setSaved(res.text);
        setGeneration((g) => g + 1);
        toast.success("Bozza pronta", { description: "Rileggila e modificala prima di approvarla." });
        router.refresh();
        requestAnimationFrame(() => textareaRef.current?.focus());
      } else notify(res);
    });
  }

  function run(action: () => Promise<ActionState>, after?: () => void) {
    startBusy(async () => {
      const res = await action();
      notify(res);
      if (res?.ok) {
        after?.();
        router.refresh();
      }
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copia non riuscita: seleziona il testo e copialo manualmente.");
    }
  }

  const publishBlocked = !p.connection ? "Collega la sede a Google per pubblicare." : !p.connection.active ? "Il collegamento Google va rinnovato." : null;

  return (
    <section aria-labelledby="composer-title" className="flex flex-col rounded-[var(--radius-panel)] border border-line bg-surface shadow-card">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5">
        <h2 id="composer-title" className="text-[13px] font-semibold">
          {published ? "Risposta pubblicata" : "La tua risposta"}
        </h2>
        <ReviewStatusBadge status={p.status} />
        {p.provenance && <span className="text-xs text-faint">{p.provenance}</span>}
        {dirty && hasText && !generating && <span className="text-xs text-warning">Modifiche non salvate</span>}
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-canvas/60 px-4 py-2">
        <CompactSelect label="Tono" value={tone} onChange={(v) => setTone(v as ReplyTone)} options={TONE_LABELS} disabled={generating} />
        <CompactSelect label="Lunghezza" value={length} onChange={(v) => setLength(v as ReplyLength)} options={LENGTH_LABELS} disabled={generating} />
        <Button type="button" variant="accent" size="sm" onClick={generate} disabled={generating || busy || archived} aria-busy={generating} className="ml-auto">
          {generating ? <Spinner /> : <Sparkles aria-hidden />}
          {generating ? "Sto scrivendo…" : hasText ? "Rigenera" : "Genera risposta"}
        </Button>
      </div>

      <div className="relative">
        <label htmlFor="reply" className="sr-only">
          Testo della risposta a {p.authorName}
        </label>
        <textarea
          id="reply"
          ref={textareaRef}
          key={generation}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          readOnly={generating}
          placeholder={archived ? "Recensione archiviata." : "Premi «Genera risposta» per una bozza dell'assistente, oppure scrivi qui."}
          className={cn(
            "block min-h-44 w-full resize-y bg-transparent px-4 py-3.5 text-[15px] leading-[1.65] text-ink placeholder:text-faint focus:outline-none",
            generation > 0 && "animate-fade",
            generating && "opacity-0",
          )}
          aria-describedby="reply-meta"
        />
        {generating && (
          <div className="absolute inset-0 px-4 py-4" role="status" aria-live="polite">
            <p className="mb-3 flex items-center gap-2 text-xs font-medium text-accent">
              <Sparkles className="size-3.5" aria-hidden /> L&apos;assistente sta scrivendo una risposta per {p.authorName.split(" ")[0]}…
            </p>
            <div className="grid gap-2.5" aria-hidden>
              <span className="skeleton h-3 w-[92%]" />
              <span className="skeleton h-3 w-[86%]" />
              <span className="skeleton h-3 w-[95%]" />
              <span className="skeleton h-3 w-[60%]" />
            </div>
          </div>
        )}
      </div>

      {flags.length > 0 && !generating && (
        <div className="mx-4 mb-3 flex gap-2.5 rounded-md border border-warning/20 bg-warning-soft px-3 py-2 text-[13px] text-warning" role="status">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Controlla prima di pubblicare</p>
            <ul className="mt-0.5 list-disc pl-4">
              {flags.map((f) => (
                <li key={f}>{flagLabel(f)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {p.hadError && (
        <p className="mx-4 mb-3 rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-[13px] text-danger" role="alert">
          L&apos;ultimo tentativo di pubblicazione non è riuscito. Puoi riprovare.
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
        <span id="reply-meta" className={cn("text-xs tabular-nums", tooLong ? "text-danger" : "text-faint")}>
          {text.length} caratteri{tooLong && " · oltre il limite di Google"}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={copy} disabled={!hasText || generating} aria-label="Copia la risposta">
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? "Copiata" : "Copia"}
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={!hasText || !dirty || generating || busy} onClick={() => run(() => saveDraftAction(p.reviewId, text), () => setSaved(text))}>
            Salva bozza
          </Button>
          {p.compact ? null : p.canPublish ? (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button type="button" size="sm" disabled={!hasText || tooLong || generating || busy || !!publishBlocked}>
                  <Send aria-hidden />
                  {p.connection?.simulated ? "Pubblica (simulazione)" : published ? "Aggiorna su Google" : "Pubblica"}
                </Button>
              </DialogTrigger>
              <PublishDialog
                text={text}
                author={p.authorName}
                simulated={!!p.connection?.simulated}
                flags={flags}
                busy={busy}
                onConfirm={() => run(() => publishAction(p.reviewId, text), () => { setSaved(text); setConfirmOpen(false); })}
              />
            </Dialog>
          ) : (
            <Button type="button" size="sm" disabled={!hasText || tooLong || generating || busy || published || p.status === "APPROVED"} onClick={() => run(() => requestApprovalAction(p.reviewId, text), () => setSaved(text))}>
              <UserCheck aria-hidden />
              {p.status === "APPROVED" ? "In attesa di approvazione" : "Invia per approvazione"}
            </Button>
          )}
        </div>
      </footer>
      {!p.compact && ((publishBlocked && p.canPublish) || !published) ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-4 py-2 text-xs text-muted lg:rounded-b-[var(--radius-panel)]">
          <span>{publishBlocked && p.canPublish ? publishBlocked : "Nulla viene pubblicato senza la tua conferma."}</span>
          {!published && (
            <button type="button" className="inline-flex items-center gap-1 font-medium text-muted hover:text-ink" disabled={busy} onClick={() => run(() => archiveAction(p.reviewId, archived))}>
              {archived ? <ArchiveRestore className="size-3.5" aria-hidden /> : <Archive className="size-3.5" aria-hidden />}
              {archived ? "Ripristina" : "Archivia senza rispondere"}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function PublishDialog({ text, author, simulated, flags, busy, onConfirm }: { text: string; author: string; simulated: boolean; flags: string[]; busy: boolean; onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <DialogContent
      title={simulated ? "Pubblicare in simulazione?" : "Pubblicare la risposta su Google?"}
      description={simulated ? "In simulazione la risposta viene segnata come pubblicata solo in Reputia." : `Sarà visibile a tutti sotto la recensione di ${author}.`}
      className="max-w-lg"
    >
      <blockquote className="max-h-56 overflow-y-auto rounded-md border border-line bg-canvas px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-line text-ink-2">{text}</blockquote>
      {flags.length > 0 && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-warning">
          <AlertTriangle className="size-4" aria-hidden /> {flags.map(flagLabel).join(" · ")}
        </p>
      )}
      <label className="mt-4 flex items-start gap-2.5 text-[13px] text-ink-2">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        Ho riletto la risposta e le informazioni sono corrette.
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="secondary" size="sm">
            Annulla
          </Button>
        </DialogClose>
        <Button size="sm" disabled={!checked || busy} onClick={onConfirm} aria-busy={busy}>
          {busy ? <Spinner /> : <Send aria-hidden />}
          {busy ? "Pubblicazione…" : "Pubblica"}
        </Button>
      </div>
    </DialogContent>
  );
}

function CompactSelect({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: Record<string, string>; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-7 appearance-none rounded-md border border-line-strong bg-surface bg-[url(/chevron.svg)] bg-[length:12px] bg-[right_6px_center] bg-no-repeat pr-6 pl-2 text-xs font-medium text-ink hover:border-ink/25 focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15 disabled:opacity-50"
      >
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

function Spinner() {
  return <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />;
}
