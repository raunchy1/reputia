import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Password dimenticata" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="display text-4xl">Password dimenticata?</h1>
      <p className="mt-2 text-muted">Inserisci la tua email: ti invieremo un link per sceglierne una nuova.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-sm text-muted">
        <Link href="/accedi" className="font-medium text-ink hover:underline">
          ← Torna all&apos;accesso
        </Link>
      </p>
    </>
  );
}
