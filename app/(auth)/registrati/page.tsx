import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Crea il tuo account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="display text-4xl">Inizia con Reputia</h1>
      <p className="mt-2 text-muted">{PLAN.trialDays} giorni di prova gratuita. Nessuna carta di credito richiesta.</p>
      <Suspense>
        <SignUpForm />
      </Suspense>
      <p className="mt-8 text-sm text-muted">
        Hai già un account?{" "}
        <Link href="/accedi" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          Accedi
        </Link>
      </p>
    </>
  );
}
