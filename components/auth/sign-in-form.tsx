"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { safeNext } from "@/lib/safe-redirect";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    setError("");
    const { error } = await authClient.signIn.email({ email, password: String(form.get("password")) });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      setUnverifiedEmail(error.code === "EMAIL_NOT_VERIFIED" ? email : "");
      return;
    }
    router.push(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
      {params.get("reimpostata") && <Notice tone="positive">Password aggiornata. Accedi con la nuova password.</Notice>}
      {error && (
        <Notice tone="danger">
          {error}{" "}
          {unverifiedEmail && (
            <Link className="font-medium underline" href={`/verifica-email?email=${encodeURIComponent(unverifiedEmail)}`}>
              Invia di nuovo il link
            </Link>
          )}
        </Notice>
      )}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="-mt-2 text-right">
        <Link href="/password-dimenticata" className="text-sm text-muted hover:text-ink">
          Password dimenticata?
        </Link>
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Accesso in corso…" : "Accedi"}
      </Button>
    </form>
  );
}
