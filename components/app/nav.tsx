"use client";
import { Building2, CreditCard, Inbox, LayoutGrid, Link2, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/app", label: "Panoramica", icon: LayoutGrid, exact: true },
  { href: "/app/recensioni", label: "Recensioni", icon: Inbox },
  { href: "/app/impostazioni-ai", label: "Assistente AI", icon: Sparkles },
  { href: "/app/sedi", label: "Sedi", icon: Building2 },
  { href: "/app/google", label: "Google", icon: Link2 },
  { href: "/app/abbonamento", label: "Abbonamento", icon: CreditCard },
  { href: "/app/account", label: "Account", icon: UserRound },
];

export function AppNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigazione principale" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-surface text-ink shadow-card" : "text-muted hover:bg-paper-deep hover:text-ink",
            )}
          >
            <Icon className={cn("size-4", active ? "text-accent" : "text-faint")} strokeWidth={1.8} aria-hidden />
            {label}
            {href === "/app/recensioni" && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-1.5 py-px text-[11px] font-semibold text-white tabular-nums">{pendingCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
