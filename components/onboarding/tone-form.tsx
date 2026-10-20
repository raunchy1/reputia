"use client";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/ui/form";
import { ToneFields, type ToneDefaults } from "@/components/settings/tone-fields";
import { saveTone } from "@/app/onboarding/actions";

export function OnboardingToneForm({ defaults }: { defaults: ToneDefaults }) {
  const [state, action] = useActionState(saveTone, null);
  return (
    <form action={action} className="@container mt-8">
      <FormMessage state={state} className="mb-4" />
      <ToneFields defaults={defaults} />
      <SubmitButton size="lg" pendingLabel="Salvataggio…" className="mt-6">
        Continua
      </SubmitButton>
    </form>
  );
}
