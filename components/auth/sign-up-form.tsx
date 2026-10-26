"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { safeNext } from "@/lib/safe-redirect";

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    if (password.length < 10) return setError("La password deve avere almeno 10 caratteri.");
    if (!form.get("terms")) return setError("Per continuare accetta i Termini e l'Informativa privacy.");
    setPending(true);
    setError("");
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")).trim(),
      email,
      password,
      callbackURL: safeNext(params.get("next"), "/onboarding"),
    });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    router.push(`/verifica-email?email=${encodeURIComponent(email)}&inviata=1`);
  }

  return (
    <form method="post" onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
      {error && <Notice tone="danger">{error}</Notice>}
      <Field label="Nome e cognome" htmlFor="name">
        <Input id="name" name="name" autoComplete="name" required maxLength={80} />
      </Field>
      <Field label="Email di lavoro" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password" hint="Almeno 10 caratteri.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
        <Checkbox name="terms" required />
        <span>
          Accetto i{" "}
          <Link href="/termini" className="text-ink underline underline-offset-2" target="_blank">
            Termini di servizio
          </Link>{" "}
          e ho letto l&apos;
          <Link href="/privacy" className="text-ink underline underline-offset-2" target="_blank">
            Informativa privacy
          </Link>
          .
        </span>
      </label>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creazione account…" : "Crea account gratuito"}
      </Button>
    </form>
  );
}
