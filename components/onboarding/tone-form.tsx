"use client";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/ui/form";
import { ToneFields } from "@/components/settings/tone-fields";
import { saveTone } from "@/app/onboarding/actions";
import type { ReplyLength, ReplyTone } from "@/lib/generated/prisma/enums";

export function OnboardingToneForm({ defaults }: { defaults: { tone: ReplyTone; replyLength: ReplyLength; businessContext: string; signature: string } }) {
  const [state, action] = useActionState(saveTone, null);
  return (
    <form action={action} className="card mt-8 grid gap-7 p-6 sm:p-8">
      <FormMessage state={state} />
      <ToneFields defaults={defaults} />
      <SubmitButton size="lg" pendingLabel="Salvataggio…">
        Vai alla dashboard
      </SubmitButton>
    </form>
  );
}
