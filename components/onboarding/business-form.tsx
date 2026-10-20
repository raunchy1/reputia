"use client";
import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { fieldError, FormMessage, SubmitButton } from "@/components/ui/form";
import { createBusiness } from "@/app/onboarding/actions";
import { CATEGORY_LABELS } from "@/lib/categories";

export function BusinessForm() {
  const [state, action] = useActionState(createBusiness, null);
  return (
    <form action={action} className="card mt-8 grid gap-5 p-6 sm:p-8">
      <FormMessage state={state} />
      <Field label="Nome dell'attività" htmlFor="name" error={fieldError(state, "name")} hint="Come appare sulla tua scheda Google.">
        <Input id="name" name="name" required maxLength={120} placeholder="Es. Trattoria da Gino" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="category" error={fieldError(state, "category")}>
          <Select id="category" name="category" required defaultValue="">
            <option value="" disabled>
              Scegli…
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Città" htmlFor="city">
          <Input id="city" name="city" maxLength={80} placeholder="Es. Cagliari" autoComplete="address-level2" />
        </Field>
      </div>
      <SubmitButton size="lg" pendingLabel="Salvataggio…">
        Continua
      </SubmitButton>
    </form>
  );
}
