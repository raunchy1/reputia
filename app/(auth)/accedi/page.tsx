import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Accedi" };

export default function SignInPage() {
  return (
    <>
      <h1 className="display text-4xl">Bentornato</h1>
      <p className="mt-2 text-muted">Accedi per gestire le recensioni della tua attività.</p>
      <Suspense>
        <SignInForm />
      </Suspense>
      <p className="mt-8 text-sm text-muted">
        Non hai un account?{" "}
        <Link href="/registrati" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          Prova gratis Reputia
        </Link>
      </p>
    </>
  );
}
