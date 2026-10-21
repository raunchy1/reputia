"use client";
import { ArrowDownUp, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { cn } from "@/lib/cn";

const SORTS: Array<[string, string]> = [
  ["recenti", "Più recenti"],
  ["meno-recenti", "Meno recenti"],
  ["valutazione", "Valutazione più bassa"],
];

export function InboxToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();
  const sort = params.get("ordine") ?? "recenti";

  function push(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    next.delete("r");
    start(() => router.replace(`${pathname}?${next}`, { scroll: false }));
  }

  // Only react to an actual change of the query; mounting (twice under StrictMode) must not
  // rewrite the URL, or the selected review (?r=) would be dropped.
  const urlQ = params.get("q") ?? "";
  useEffect(() => {
    if (q.trim() === urlQ) return;
    const t = setTimeout(() => push({ q: q.trim() || null }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex items-center gap-2 border-b border-line px-3 py-2">
      <label className="relative flex-1">
        <span className="sr-only">Cerca nelle recensioni</span>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca per nome o testo…"
          className="h-8 w-full rounded-md border border-transparent bg-subtle pr-7 pl-8 text-[13px] placeholder:text-faint focus:border-accent focus:bg-surface focus:outline-none focus:ring-3 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-faint hover:text-ink" aria-label="Cancella ricerca">
            <X className="size-3.5" />
          </button>
        )}
      </label>
      <Menu>
        <MenuTrigger className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-ink-2 hover:bg-subtle data-[state=open]:bg-subtle" aria-label="Ordina">
          <ArrowDownUp className="size-3.5 text-muted" aria-hidden />
          <span className="hidden sm:inline">{SORTS.find(([k]) => k === sort)?.[1]}</span>
        </MenuTrigger>
        <MenuContent align="end" className="min-w-48">
          {SORTS.map(([k, label]) => (
            <MenuItem key={k} onSelect={() => push({ ordine: k === "recenti" ? null : k })} className={cn(k === sort && "font-medium text-ink")}>
              {label}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
      <span className={cn("sr-only", pending && "not-sr-only text-xs text-faint")} aria-live="polite">
        {pending ? "Aggiorno…" : `${total} risultati`}
      </span>
    </div>
  );
}
