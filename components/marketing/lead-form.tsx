"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { fieldError, FormMessage, SubmitButton } from "@/components/ui/form";
import { submitLead } from "@/app/(marketing)/contatti/actions";
import { CATEGORY_LABELS } from "@/lib/categories";

export function LeadForm() {
  const [state, action] = useActionState(submitLead, null);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome e cognome" htmlFor="name" error={fieldError(state, "name")}>
          <Input id="name" name="name" required autoComplete="name" maxLength={80} />
        </Field>
        <Field label="Attività" htmlFor="businessName" error={fieldError(state, "businessName")}>
          <Input id="businessName" name="businessName" required autoComplete="organization" maxLength={120} />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldError(state, "email")}>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Telefono (facoltativo)" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} />
        </Field>
        <Field label="Città" htmlFor="city">
          <Input id="city" name="city" autoComplete="address-level2" maxLength={80} />
        </Field>
        <Field label="Tipo di attività" htmlFor="category">
          <Select id="category" name="category" defaultValue="">
            <option value="">—</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Messaggio (facoltativo)" htmlFor="message" hint="Ad esempio: quando preferisci essere ricontattato.">
        <Textarea id="message" name="message" rows={4} maxLength={2000} />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Sito web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
        <Checkbox name="privacy" required />
        <span>
          Ho letto l&apos;
          <Link href="/privacy" className="text-ink underline underline-offset-2" target="_blank">
            informativa privacy
          </Link>{" "}
          e acconsento al trattamento dei miei dati per essere ricontattato in merito a questa richiesta.
          {fieldError(state, "privacy") && <span className="block text-danger">{fieldError(state, "privacy")}</span>}
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
        <Checkbox name="marketing" />
        <span>Facoltativo: desidero ricevere occasionalmente novità e consigli su Reputia via email. Posso disiscrivermi in ogni momento.</span>
      </label>
      <SubmitButton size="lg" pendingLabel="Invio…" className="justify-self-start">
        Richiedi la demo
      </SubmitButton>
    </form>
  );
}
