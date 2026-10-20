"use client";
import { RefreshCw } from "lucide-react";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/ui/form";
import { syncAction } from "@/app/app/recensioni/actions";

export function SyncButton() {
  const [state, action] = useActionState(syncAction, null);
  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <SubmitButton variant="secondary" pendingLabel="Sincronizzazione…">
        <RefreshCw className="size-4" aria-hidden /> Sincronizza
      </SubmitButton>
      <FormMessage state={state} className="text-xs" />
    </form>
  );
}
