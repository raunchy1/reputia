"use client";
import * as D from "@radix-ui/react-dialog";
import { Building2, Check, ChevronDown, CreditCard, Inbox, LayoutGrid, Link2, LogOut, Menu as MenuIcon, PanelLeft, Search, Settings2, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectLocation } from "@/app/app/shell-actions";
import { OPEN_COMMAND_EVENT } from "@/components/app/command-menu";
import { Kbd } from "@/components/ui/kbd";
import { LogoTile } from "@/components/ui/logo";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/app", label: "Panoramica", icon: LayoutGrid, exact: true },
  { href: "/app/recensioni", label: "Recensioni", icon: Inbox, badge: true },
  { href: "/app/impostazioni-ai", label: "Assistente", icon: Settings2 },
];
const SETTINGS = [
  { href: "/app/sedi", label: "Sedi", icon: Building2 },
  { href: "/app/google", label: "Google", icon: Link2 },
  { href: "/app/abbonamento", label: "Abbonamento", icon: CreditCard },
  { href: "/app/account", label: "Account e team", icon: UserRound },
];

export type SidebarProps = {
  organization: string;
  user: { name: string; email: string; role: string };
  locations: Array<{ id: string; name: string }>;
  activeLocationId: string | null;
  pendingCount: number;
  plan: { label: string; tone: "neutral" | "warning" | "danger" } | null;
  collapsed: boolean;
};

export function Sidebar(props: SidebarProps) {
  const [collapsed, setCollapsed] = useState(props.collapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `reputia_sidebar=${next ? "collapsed" : "expanded"};path=/;max-age=31536000;samesite=lax`;
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-canvas/90 px-3 backdrop-blur lg:hidden">
        <D.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <D.Trigger className="grid size-8 place-items-center rounded-md text-ink-2 hover:bg-subtle" aria-label="Apri il menu">
            <MenuIcon className="size-[18px]" />
          </D.Trigger>
          <D.Portal>
            <D.Overlay className="fixed inset-0 z-40 bg-ink/20 data-[state=open]:animate-fade" />
            <D.Content className="fixed inset-y-0 left-0 z-50 w-[272px] border-r border-line bg-canvas p-2 shadow-pop focus:outline-none data-[state=open]:animate-fade">
              <D.Title className="sr-only">Menu</D.Title>
              <D.Description className="sr-only">Navigazione di Reputia</D.Description>
              <SidebarBody {...props} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </D.Content>
          </D.Portal>
        </D.Root>
        <LogoTile className="size-6" />
        <span className="truncate text-[13px] font-semibold">{props.organization}</span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))}
          className="ml-auto grid size-8 place-items-center rounded-md text-ink-2 hover:bg-subtle"
          aria-label="Cerca"
        >
          <Search className="size-4" />
        </button>
      </header>

      <aside
        className={cn("sticky top-0 hidden h-dvh shrink-0 flex-col px-2 py-2.5 transition-[width] duration-200 ease-[var(--ease-out-soft)] lg:flex", collapsed ? "w-[56px]" : "w-[236px]")}
        aria-label="Barra laterale"
      >
        <SidebarBody {...props} collapsed={collapsed} onToggle={toggle} />
      </aside>
    </TooltipProvider>
  );
}

function SidebarBody({ collapsed, onToggle, onNavigate, ...p }: SidebarProps & { onToggle?: () => void; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-0.5", collapsed && "flex-col gap-1.5")}>
        <Workspace {...p} collapsed={collapsed} />
        {onToggle && (
          <Tooltip label={collapsed ? "Espandi" : "Comprimi"}>
            <button
              type="button"
              onClick={onToggle}
              className="grid size-7 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-subtle hover:text-ink"
              aria-label={collapsed ? "Espandi la barra laterale" : "Comprimi la barra laterale"}
              aria-expanded={!collapsed}
            >
              <PanelLeft className="size-[15px]" strokeWidth={1.75} />
            </button>
          </Tooltip>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
        }}
        className={cn(
          "mt-3 flex h-[30px] items-center gap-2.5 rounded-md border border-line bg-surface px-2.5 text-[13px] text-muted shadow-card transition-colors hover:border-line-strong hover:text-ink",
          collapsed && "justify-center px-0",
        )}
        aria-label="Cerca (Ctrl+K)"
      >
        <Search className="size-[14px] shrink-0" strokeWidth={1.75} aria-hidden />
        {!collapsed && (
          <>
            Cerca
            <span className="ml-auto flex gap-0.5">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </>
        )}
      </button>

      <nav aria-label="Principale" className="mt-4 grid gap-px">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} active={item.exact ? pathname === item.href : pathname.startsWith(item.href)} collapsed={collapsed} count={item.badge ? p.pendingCount : 0} onNavigate={onNavigate} />
        ))}
      </nav>
      {collapsed ? <div className="my-3 h-px bg-line" /> : <p className="mt-5 mb-1 px-2.5 text-xs font-medium text-faint">Impostazioni</p>}
      <nav aria-label="Impostazioni" className="grid gap-px">
        {SETTINGS.map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto grid gap-1.5">
        {p.plan && !collapsed && (
          <Link
            href="/app/abbonamento"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-subtle",
              p.plan.tone === "danger" ? "text-danger" : p.plan.tone === "warning" ? "text-warning" : "text-muted",
            )}
          >
            <span className={cn("size-1.5 rounded-full", p.plan.tone === "danger" ? "bg-danger" : "bg-gold")} aria-hidden />
            {p.plan.label}
          </Link>
        )}
        <UserMenu {...p} collapsed={collapsed} />
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  count = 0,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Inbox;
  active: boolean;
  collapsed: boolean;
  count?: number;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? (count ? `${label}, ${count} da gestire` : label) : undefined}
      className={cn(
        "relative flex h-[30px] items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors duration-[120ms]",
        active ? "bg-accent-soft font-medium text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className={cn("size-[15px] shrink-0", active ? "text-ink" : "text-muted")} strokeWidth={1.75} aria-hidden />
      {!collapsed && <span className="truncate">{label}</span>}
      {count > 0 &&
        (collapsed ? (
          <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-gold" aria-hidden />
        ) : (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden />
            {count}
          </span>
        ))}
    </Link>
  );
  return collapsed ? <Tooltip label={label}>{link}</Tooltip> : link;
}

function Workspace({ organization, locations, activeLocationId, collapsed }: SidebarProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const active = locations.find((l) => l.id === activeLocationId);
  const choose = (id: string | null) =>
    start(async () => {
      await selectLocation(id);
      router.refresh();
    });
  const subtitle = active ? active.name : locations.length > 1 ? `Tutte le sedi · ${locations.length}` : null;

  return (
    <Menu>
      <MenuTrigger
        className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-subtle data-[state=open]:bg-subtle", collapsed && "flex-none p-1", pending && "opacity-60")}
        aria-label="Organizzazione e sede"
      >
        <LogoTile className="size-[22px] rounded-[6px]" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-tight font-semibold">{organization}</span>
              {subtitle && <span className="block truncate text-[11px] leading-tight text-muted">{subtitle}</span>}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-faint" aria-hidden />
          </>
        )}
      </MenuTrigger>
      <MenuContent className="w-64">
        <MenuLabel>Sede</MenuLabel>
        {locations.length > 1 && (
          <MenuItem onSelect={() => choose(null)}>
            <Building2 />
            <span className="flex-1">Tutte le sedi</span>
            {!active && <Check className="!text-ink" />}
          </MenuItem>
        )}
        {locations.map((l) => (
          <MenuItem key={l.id} onSelect={() => choose(l.id)}>
            <span className="grid size-4 place-items-center rounded bg-subtle text-[9px] font-semibold text-ink-2">{l.name[0]}</span>
            <span className="flex-1 truncate">{l.name}</span>
            {(active?.id === l.id || (!active && locations.length === 1)) && <Check className="!text-ink" />}
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem asChild>
          <Link href="/app/sedi">
            <Building2 /> Gestisci sedi
          </Link>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

function UserMenu({ user, collapsed }: SidebarProps) {
  const router = useRouter();
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <Menu>
      <MenuTrigger className={cn("flex items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-subtle data-[state=open]:bg-subtle", collapsed && "justify-center")} aria-label="Menu utente">
        <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-subtle text-[10px] font-semibold text-ink-2 ring-1 ring-line-strong">{initials}</span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-tight font-medium">{user.name}</span>
            <span className="block truncate text-[11px] leading-tight text-muted">{user.role}</span>
          </span>
        )}
      </MenuTrigger>
      <MenuContent side="top" className="w-60">
        <MenuLabel>{user.email}</MenuLabel>
        <MenuItem asChild>
          <Link href="/app/account">
            <UserRound /> Account e team
          </Link>
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onSelect={async () => {
            await authClient.signOut();
            router.push("/accedi");
            router.refresh();
          }}
        >
          <LogOut /> Esci
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
