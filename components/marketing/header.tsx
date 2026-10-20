import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const LINKS = [
  { href: "/#come-funziona", label: "Come funziona" },
  { href: "/prezzi", label: "Prezzi" },
  { href: "/#domande", label: "Domande" },
  { href: "/contatti", label: "Contatti" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Sito" className="hidden flex-1 gap-7 text-sm text-muted md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/accedi" className="hidden px-3 text-sm font-medium text-ink-soft hover:text-ink sm:block">
            Accedi
          </Link>
          <ButtonLink href="/registrati" size="sm" className="h-9 px-4">
            Prova gratis
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
