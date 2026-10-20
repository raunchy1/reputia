"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function PasswordForm() {
  const [state, setState] = useState<{ ok?: boolean; error?: string; pending?: boolean }>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newPassword = String(form.get("newPassword"));
    if (newPassword.length < 10) return setState({ error: "La nuova password deve avere almeno 10 caratteri." });
    setState({ pending: true });
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("currentPassword")),
      newPassword,
      revokeOtherSessions: true,
    });
    if (error) return setState({ error: error.code === "INVALID_PASSWORD" ? "La password attuale non è corretta." : authErrorMessage(error) });
    formEl.reset();
    setState({ ok: true });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="positive">Password aggiornata. Gli altri dispositivi sono stati disconnessi.</Notice>}
      <Field label="Password attuale" htmlFor="currentPassword">
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nuova password" htmlFor="newPassword" hint="Almeno 10 caratteri.">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Button type="submit" variant="secondary" disabled={state.pending} className="justify-self-start">
        {state.pending ? "Aggiornamento…" : "Cambia password"}
      </Button>
    </form>
  );
}
