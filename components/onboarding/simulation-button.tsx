"use client";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/ui/form";
import { connectSimulation } from "@/app/onboarding/actions";

export function SimulationButton({ label = "Usa i dati di esempio" }: { label?: string }) {
  const [state, action] = useActionState(connectSimulation, null);
  return (
    <form action={action} className="mt-4 grid gap-3 justify-items-start">
      <FormMessage state={state} />
      <SubmitButton variant="secondary" pendingLabel="Caricamento recensioni…">
        {label}
      </SubmitButton>
    </form>
  );
}
