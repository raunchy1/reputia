import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const LINKS = [
  { href: "/#come-funziona", label: "Come funziona" },
  { href: "/#google", label: "Google" },
  { href: "/prezzi", label: "Prezzi" },
  { href: "/contatti", label: "Contatti" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-night">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-10 px-5 sm:px-8">
        <Logo tone="white" />
        <nav aria-label="Sito" className="hidden flex-1 gap-7 text-[13px] text-white/60 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/accedi" className="hidden rounded-md px-3 py-1.5 text-[13px] text-white/70 transition-colors hover:text-white sm:block">
            Accedi
          </Link>
          <Link href="/registrati" className="rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-white/90">
            Prova gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
