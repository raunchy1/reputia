"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { ActionState } from "@/lib/actions";

export function SubmitButton({ children, pendingLabel, ...props }: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? (pendingLabel ?? "Attendi…") : children}
    </Button>
  );
}

export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  if (!state) return null;
  if (state.ok) return state.message ? <Notice tone="positive" className={className}>{state.message}</Notice> : null;
  return <Notice tone="danger" className={className}>{state.error}</Notice>;
}

export function fieldError(state: ActionState, name: string): string | undefined {
  return state && !state.ok ? state.fieldErrors?.[name] : undefined;
}

/** Generic form bound to a server action; shows the action's result above its fields. */
export function ActionForm({
  action,
  children,
  className,
  messageClassName,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  messageClassName?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      <FormMessage state={state} className={messageClassName} />
      {children}
    </form>
  );
}
