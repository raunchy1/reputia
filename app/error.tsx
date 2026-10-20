"use client";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[60dvh] place-items-center px-5">
      <div className="text-center">
        <h1 className="display text-3xl">Qualcosa è andato storto</h1>
        <p className="mt-3 text-muted">Si è verificato un errore imprevisto. Riprova tra qualche istante.</p>
        <Button onClick={reset} className="mt-8">
          Riprova
        </Button>
      </div>
    </main>
  );
}
