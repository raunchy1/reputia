"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function ResendVerification({ defaultEmail }: { defaultEmail: string }) {
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("pending");
    setError("");
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/onboarding" });
    if (error) {
      setError(authErrorMessage(error));
      setState("idle");
      return;
    }
    setState("sent");
  }

  return (
    <form method="post" onSubmit={onSubmit} className="mt-8 grid gap-4 border-t border-line pt-8">
      <p className="text-sm text-muted">Non è arrivata? Controlla nello spam oppure invia di nuovo il link.</p>
      {state === "sent" && <Notice tone="positive">Se l&apos;indirizzo è registrato, riceverai un nuovo link entro pochi minuti.</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={defaultEmail} required autoComplete="email" />
      </Field>
      <Button type="submit" variant="secondary" disabled={state === "pending"}>
        {state === "pending" ? "Invio…" : "Invia di nuovo il link"}
      </Button>
    </form>
  );
}
