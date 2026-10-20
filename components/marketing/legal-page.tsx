import type { ReactNode } from "react";
import { Notice } from "@/components/ui/notice";
import { LEGAL, legalComplete } from "@/lib/legal";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <h1 className="display text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-faint">Ultimo aggiornamento: {updated}</p>
      {!legalComplete && (
        <Notice tone="warning" className="mt-8">
          I dati identificativi del titolare sono in aggiornamento. Per qualsiasi richiesta scrivi all&apos;indirizzo indicato nella pagina Contatti.
        </Notice>
      )}
      <div className="mt-10 grid gap-5 leading-relaxed text-ink-soft [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5">
        {children}
      </div>
    </article>
  );
}

export function Controller() {
  return (
    <p>
      Titolare del trattamento: <strong>{LEGAL.company || "Reputia"}</strong>
      {LEGAL.vat && `, P.IVA ${LEGAL.vat}`}
      {LEGAL.address && `, ${LEGAL.address}`}
      {LEGAL.email && (
        <>
          , email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </>
      )}
      {LEGAL.pec && `, PEC ${LEGAL.pec}`}.
    </p>
  );
}
