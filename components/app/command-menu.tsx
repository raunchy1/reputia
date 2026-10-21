"use client";
import * as D from "@radix-ui/react-dialog";
import { Building2, CreditCard, Inbox, LayoutGrid, Link2, Search, Settings2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { searchReviewsAction, type CommandReview } from "@/app/app/shell-actions";
import { StatusIcon } from "@/components/app/review-status";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/cn";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

type Item = { id: string; group: string; label: string; hint?: string; href: string; icon?: typeof Inbox; review?: CommandReview };

const PAGES: Item[] = [
  { id: "p-dash", group: "Vai a", label: "Panoramica", href: "/app", icon: LayoutGrid },
  { id: "p-inbox", group: "Vai a", label: "Recensioni da gestire", href: "/app/recensioni", icon: Inbox },
  { id: "p-neg", group: "Vai a", label: "Recensioni negative", href: "/app/recensioni?stelle=negative", icon: Inbox },
  { id: "p-draft", group: "Vai a", label: "Bozze pronte", href: "/app/recensioni?stato=bozze", icon: Inbox },
  { id: "p-ai", group: "Impostazioni", label: "Assistente AI", href: "/app/impostazioni-ai", icon: Settings2 },
  { id: "p-sedi", group: "Impostazioni", label: "Sedi", href: "/app/sedi", icon: Building2 },
  { id: "p-google", group: "Impostazioni", label: "Collegamento Google", href: "/app/google", icon: Link2 },
  { id: "p-bill", group: "Impostazioni", label: "Abbonamento", href: "/app/abbonamento", icon: CreditCard },
  { id: "p-acc", group: "Impostazioni", label: "Account e team", href: "/app/account", icon: UserRound },
];

export const OPEN_COMMAND_EVENT = "reputia:command";

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState<CommandReview[]>([]);
  const [active, setActive] = useState(0);
  const [, start] = useTransition();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setReviews([]);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setReviews([]);
      return;
    }
    const t = setTimeout(() => start(async () => setReviews(await searchReviewsAction(q))), 180);
    return () => clearTimeout(t);
  }, [query]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const pages = q ? PAGES.filter((p) => p.label.toLowerCase().includes(q)) : PAGES;
    const found = reviews.map<Item>((r) => ({ id: `r-${r.id}`, group: "Recensioni", label: r.authorName, hint: r.excerpt, href: `/app/recensioni?stato=tutte&r=${r.id}`, review: r }));
    return [...found, ...pages];
  }, [query, reviews]);

  useEffect(() => setActive(0), [items.length]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item: Item) {
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active]);
    }
  }

  let lastGroup = "";
  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-ink/20 data-[state=open]:animate-fade" />
        <D.Content
          className="fixed top-[14vh] left-1/2 z-50 w-[calc(100vw-24px)] max-w-[600px] -translate-x-1/2 overflow-hidden rounded-[12px] border border-line bg-surface shadow-pop focus:outline-none data-[state=open]:animate-pop"
          onKeyDown={onKeyDown}
        >
          <D.Title className="sr-only">Cerca e vai a</D.Title>
          <D.Description className="sr-only">Cerca una recensione o una pagina. Usa le frecce per muoverti e Invio per aprire.</D.Description>
          <div className="flex items-center gap-2.5 border-b border-line px-4">
            <Search className="size-4 text-faint" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca una recensione, un cliente o una pagina…"
              className="h-12 flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-list"
              aria-activedescendant={items[active] ? `cmd-${items[active].id}` : undefined}
              aria-autocomplete="list"
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id="command-list" ref={listRef} role="listbox" aria-label="Risultati" className="max-h-[52vh] overflow-y-auto p-1.5">
            {items.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-muted">Nessun risultato per «{query}».</li>}
            {items.map((item, i) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              const Icon = item.icon;
              return (
                <li key={item.id} role="presentation">
                  {header && <p className="px-2.5 pt-2.5 pb-1 font-mono text-[11px] text-faint">{header}</p>}
                  <div
                    id={`cmd-${item.id}`}
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(item)}
                    className={cn("flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-[13px]", i === active ? "bg-subtle text-ink" : "text-ink-2")}
                  >
                    {item.review ? <StatusIcon status={item.review.status as ReviewStatus} /> : Icon ? <Icon className="size-4 text-muted" strokeWidth={1.75} aria-hidden /> : null}
                    <span className="shrink-0 font-medium">{item.label}</span>
                    {item.review && <span className="shrink-0 font-mono text-[11px] text-muted">{item.review.rating}★</span>}
                    {item.hint && <span className="truncate text-muted">{item.hint}</span>}
                    {i === active && <Kbd className="ml-auto">↵</Kbd>}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-3 border-t border-line bg-canvas px-4 py-2 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> per muoverti
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> per aprire
            </span>
          </div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
