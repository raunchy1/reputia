import type { Metadata } from "next";
import { ResendVerification } from "@/components/auth/resend-verification";

export const metadata: Metadata = { title: "Conferma la tua email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; inviata?: string; error?: string }> }) {
  const { email = "", inviata, error } = await searchParams;
  return (
    <>
      <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </div>
      <h1 className="display text-4xl">Controlla la tua email</h1>
      {error ? (
        <p className="mt-3 text-danger">Il link di conferma non è valido o è scaduto. Richiedine uno nuovo qui sotto.</p>
      ) : (
        <p className="mt-3 leading-relaxed text-muted">
          {inviata ? "Ti abbiamo inviato" : "Ti serve"} un link di conferma{email && <> a <strong className="font-medium text-ink">{email}</strong></>}. Aprilo per attivare l&apos;account: ci vuole un attimo.
        </p>
      )}
      <ResendVerification defaultEmail={email} />
    </>
  );
}
