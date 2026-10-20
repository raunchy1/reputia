"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword.length < 10) return setError("La password deve avere almeno 10 caratteri.");
    if (newPassword !== form.get("confirm")) return setError("Le due password non coincidono.");
    setPending(true);
    setError("");
    const { error } = await authClient.resetPassword({ newPassword, token });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    router.push("/accedi?reimpostata=1");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5">
      {error && <Notice tone="danger">{error}</Notice>}
      <Field label="Nuova password" htmlFor="password" hint="Almeno 10 caratteri.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Ripeti la password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Salvataggio…" : "Salva la nuova password"}
      </Button>
    </form>
  );
}
