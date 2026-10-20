import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Notice } from "@/components/ui/notice";
import { emailDeliveryAvailable } from "@/lib/env";
import { PLAN } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Crea il tuo account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="display text-4xl">Inizia con Reputia</h1>
      <p className="mt-2 text-muted">{PLAN.trialDays} giorni di prova gratuita. Nessuna carta di credito richiesta.</p>
      {emailDeliveryAvailable ? (
        <Suspense>
          <SignUpForm />
        </Suspense>
      ) : (
        <Notice tone="warning" className="mt-8">
          Le nuove registrazioni sono momentaneamente sospese. Scrivici dalla pagina Contatti e ti attiveremo l&apos;accesso.
        </Notice>
      )}
      <p className="mt-8 text-sm text-muted">
        Hai già un account?{" "}
        <Link href="/accedi" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          Accedi
        </Link>
      </p>
    </>
  );
}
