import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LEGAL, PRODUCT_OF } from "@/lib/legal";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-paper-deep/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Risposte alle recensioni Google per le attività italiane, scritte con l&apos;AI e approvate da te.</p>
          {PRODUCT_OF.name && (
            <p className="mt-3 text-sm text-muted">
              Un prodotto{" "}
              {PRODUCT_OF.url ? (
                <a href={PRODUCT_OF.url} className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {PRODUCT_OF.name}
                </a>
              ) : (
                <span className="font-medium text-ink">{PRODUCT_OF.name}</span>
              )}
            </p>
          )}
        </div>
        <nav aria-label="Prodotto" className="grid content-start gap-2.5 text-sm">
          <p className="mb-1 font-semibold">Prodotto</p>
          <Link href="/#come-funziona" className="text-muted hover:text-ink">Come funziona</Link>
          <Link href="/prezzi" className="text-muted hover:text-ink">Prezzi</Link>
          <Link href="/contatti" className="text-muted hover:text-ink">Prenota una demo</Link>
          <Link href="/accedi" className="text-muted hover:text-ink">Accedi</Link>
        </nav>
        <nav aria-label="Note legali" className="grid content-start gap-2.5 text-sm">
          <p className="mb-1 font-semibold">Note legali</p>
          <Link href="/privacy" className="text-muted hover:text-ink">Informativa privacy</Link>
          <Link href="/cookie" className="text-muted hover:text-ink">Cookie policy</Link>
          <Link href="/termini" className="text-muted hover:text-ink">Termini di servizio</Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-faint sm:px-8">
          © {new Date().getFullYear()} {LEGAL.company || "Reputia"}
          {LEGAL.vat && ` · P.IVA ${LEGAL.vat}`}
          {LEGAL.address && ` · ${LEGAL.address}`}. Google e Google Business Profile sono marchi di Google LLC; Reputia non è affiliato a Google.
        </p>
      </div>
    </footer>
  );
}
