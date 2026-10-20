import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Nuova password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  if (!token || error) {
    return (
      <>
        <h1 className="display text-4xl">Link non valido</h1>
        <p className="mt-3 text-muted">Il link per reimpostare la password è scaduto o è già stato usato.</p>
        <Link href="/password-dimenticata" className="mt-6 font-medium text-accent hover:underline">
          Richiedi un nuovo link →
        </Link>
      </>
    );
  }
  return (
    <>
      <h1 className="display text-4xl">Scegli una nuova password</h1>
      <p className="mt-2 text-muted">Per sicurezza verrai disconnesso da tutti gli altri dispositivi.</p>
      <ResetPasswordForm token={token} />
    </>
  );
}
