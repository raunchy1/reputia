"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("pending");
    setError("");
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reimposta-password" });
    if (error) {
      setError(authErrorMessage(error));
      setState("idle");
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <Notice tone="positive" className="mt-8">
        Se esiste un account con questa email, riceverai a breve il link per reimpostare la password. Il link scade tra un&apos;ora.
      </Notice>
    );
  }

  return (
    <form method="post" onSubmit={onSubmit} className="mt-8 grid gap-5">
      {error && <Notice tone="danger">{error}</Notice>}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Button type="submit" size="lg" disabled={state === "pending"}>
        {state === "pending" ? "Invio…" : "Invia il link"}
      </Button>
    </form>
  );
}
