"use client";
import * as D from "@radix-ui/react-dialog";
import {
  Building2,
  Check,
  ChevronsUpDown,
  CreditCard,
  Inbox,
  LayoutGrid,
  Link2,
  LogOut,
  Menu as MenuIcon,
  PanelLeft,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectLocation } from "@/app/app/shell-actions";
import { LogoMark } from "@/components/ui/logo";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/app", label: "Panoramica", icon: LayoutGrid, exact: true },
  { href: "/app/recensioni", label: "Recensioni", icon: Inbox, badge: true },
  { href: "/app/impostazioni-ai", label: "Assistente AI", icon: Sparkles },
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
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-canvas/90 px-3 backdrop-blur lg:hidden">
        <D.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <D.Trigger className="grid size-8 place-items-center rounded-md text-ink-2 hover:bg-subtle" aria-label="Apri il menu">
            <MenuIcon className="size-[18px]" />
          </D.Trigger>
          <D.Portal>
            <D.Overlay className="fixed inset-0 z-40 bg-ink/25 data-[state=open]:animate-fade" />
            <D.Content className="fixed inset-y-0 left-0 z-50 w-[272px] border-r border-line bg-canvas p-2 shadow-pop data-[state=open]:animate-fade focus:outline-none">
              <D.Title className="sr-only">Menu</D.Title>
              <D.Description className="sr-only">Navigazione di Reputia</D.Description>
              <SidebarBody {...props} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </D.Content>
          </D.Portal>
        </D.Root>
        <LogoMark className="size-6" />
        <span className="truncate text-sm font-semibold">{props.organization}</span>
      </header>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col p-2 transition-[width] duration-200 ease-[var(--ease-out-soft)] lg:flex",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
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
      <div className={cn("flex items-center gap-1", collapsed ? "flex-col" : "")}>
        <LocationSwitcher {...p} collapsed={collapsed} />
        {onToggle && (
          <Tooltip label={collapsed ? "Espandi" : "Comprimi"}>
            <button
              type="button"
              onClick={onToggle}
              className="grid size-8 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-subtle hover:text-ink"
              aria-label={collapsed ? "Espandi la barra laterale" : "Comprimi la barra laterale"}
              aria-expanded={!collapsed}
            >
              <PanelLeft className="size-4" strokeWidth={1.75} />
            </button>
          </Tooltip>
        )}
      </div>

      <nav aria-label="Principale" className="mt-4 grid gap-0.5">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} active={item.exact ? pathname === item.href : pathname.startsWith(item.href)} collapsed={collapsed} count={item.badge ? p.pendingCount : 0} onNavigate={onNavigate} />
        ))}
      </nav>
      <p className={cn("mt-6 mb-1 px-2.5 text-[11px] font-medium tracking-wide text-faint uppercase", collapsed && "sr-only")}>Impostazioni</p>
      <nav aria-label="Impostazioni" className={cn("grid gap-0.5", collapsed && "mt-4 border-t border-line pt-4")}>
        {SETTINGS.map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto grid gap-2">
        {p.plan && !collapsed && (
          <Link
            href="/app/abbonamento"
            onClick={onNavigate}
            className={cn(
              "rounded-[var(--radius-panel)] border px-2.5 py-2 text-xs transition-colors",
              p.plan.tone === "danger" ? "border-danger/20 bg-danger-soft text-danger" : p.plan.tone === "warning" ? "border-warning/20 bg-warning-soft text-warning" : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
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
        "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-[120ms]",
        active ? "bg-surface text-ink shadow-card ring-1 ring-line" : "text-ink-2 hover:bg-subtle hover:text-ink",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted")} strokeWidth={1.75} aria-hidden />
      {!collapsed && <span className="truncate">{label}</span>}
      {count > 0 &&
        (collapsed ? (
          <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-accent" aria-hidden />
        ) : (
          <span className="ml-auto text-xs font-medium text-muted tabular-nums">{count}</span>
        ))}
    </Link>
  );
  return collapsed ? <Tooltip label={label}>{link}</Tooltip> : link;
}

function LocationSwitcher({ organization, locations, activeLocationId, collapsed }: SidebarProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const active = locations.find((l) => l.id === activeLocationId);
  const choose = (id: string | null) =>
    start(async () => {
      await selectLocation(id);
      router.refresh();
    });

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-subtle data-[state=open]:bg-subtle",
          collapsed && "flex-none",
          pending && "opacity-60",
        )}
        aria-label="Cambia sede"
      >
        <LogoMark className="size-6 shrink-0" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-tight font-semibold">{organization}</span>
              <span className="block truncate text-xs leading-tight text-muted">{active ? active.name : locations.length > 1 ? "Tutte le sedi" : (locations[0]?.name ?? "Nessuna sede")}</span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-faint" aria-hidden />
          </>
        )}
      </MenuTrigger>
      <MenuContent className="w-60">
        <MenuLabel>Sede</MenuLabel>
        {locations.length > 1 && (
          <MenuItem onSelect={() => choose(null)}>
            <Building2 />
            <span className="flex-1">Tutte le sedi</span>
            {!active && <Check className="!text-accent" />}
          </MenuItem>
        )}
        {locations.map((l) => (
          <MenuItem key={l.id} onSelect={() => choose(l.id)}>
            <span className="grid size-4 place-items-center text-[10px] font-semibold text-muted">{l.name[0]}</span>
            <span className="flex-1 truncate">{l.name}</span>
            {(active?.id === l.id || (!active && locations.length === 1)) && <Check className="!text-accent" />}
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
      <MenuTrigger className={cn("flex items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-subtle data-[state=open]:bg-subtle", collapsed && "justify-center")} aria-label="Menu utente">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">{initials}</span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-tight font-medium">{user.name}</span>
            <span className="block truncate text-xs leading-tight text-muted">{user.role}</span>
          </span>
        )}
      </MenuTrigger>
      <MenuContent side="top" className="w-56">
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
