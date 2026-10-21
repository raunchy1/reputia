import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { LEGAL, PRODUCT_OF } from "@/lib/legal";

export function MarketingFooter() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 pt-20 pb-10 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Wordmark tone="white" className="h-7" />
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-white/50">Le risposte alle recensioni Google, scritte con cura e approvate da te.</p>
          {PRODUCT_OF.name && (
            <p className="mt-4 text-[13px] text-white/50">
              Un prodotto{" "}
              {PRODUCT_OF.url ? (
                <a href={PRODUCT_OF.url} className="text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/60">
                  {PRODUCT_OF.name}
                </a>
              ) : (
                <span className="text-white/80">{PRODUCT_OF.name}</span>
              )}
            </p>
          )}
        </div>
        <nav aria-label="Prodotto" className="grid content-start gap-2.5 text-[13px]">
          <p className="mb-1 font-mono text-[11px] text-white/55">Prodotto</p>
          <Link href="/#come-funziona" className="text-white/70 hover:text-white">Come funziona</Link>
          <Link href="/prezzi" className="text-white/70 hover:text-white">Prezzi</Link>
          <Link href="/contatti" className="text-white/70 hover:text-white">Prenota una demo</Link>
          <Link href="/accedi" className="text-white/70 hover:text-white">Accedi</Link>
        </nav>
        <nav aria-label="Note legali" className="grid content-start gap-2.5 text-[13px]">
          <p className="mb-1 font-mono text-[11px] text-white/55">Note legali</p>
          <Link href="/privacy" className="text-white/70 hover:text-white">Informativa privacy</Link>
          <Link href="/cookie" className="text-white/70 hover:text-white">Cookie policy</Link>
          <Link href="/termini" className="text-white/70 hover:text-white">Termini di servizio</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-[1200px] border-t border-white/[0.08] px-5 py-6 sm:px-8">
        <p className="font-mono text-[11px] leading-relaxed text-white/55">
          © {new Date().getFullYear()} {LEGAL.company || "Reputia"}
          {LEGAL.vat && ` · P.IVA ${LEGAL.vat}`}
          {LEGAL.address && ` · ${LEGAL.address}`} · Google e Google Business Profile sono marchi di Google LLC; Reputia non è affiliato a Google.
        </p>
      </div>
    </footer>
  );
}
