import Link from "next/link";
import { Sidebar } from "@/components/app/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { getEntitlement } from "@/lib/billing/entitlement";
import { db } from "@/lib/db";
import { activeLocationId, sidebarCollapsed } from "@/lib/location-scope";
import { isRole, ROLE_LABELS } from "@/lib/roles";
import { requireOrg } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();
  const locations = await db.location.findMany({
    where: { organizationId: ctx.organization.id, archivedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  const activeId = await activeLocationId(locations.map((l) => l.id));
  const [pending, mock, entitlement, collapsed] = await Promise.all([
    db.review.count({
      where: { organizationId: ctx.organization.id, status: { in: ["NEW", "FAILED", "APPROVED"] }, location: { archivedAt: null }, ...(activeId ? { locationId: activeId } : {}) },
    }),
    db.googleConnection.count({ where: { organizationId: ctx.organization.id, provider: "MOCK", status: "ACTIVE", locations: { some: {} } } }),
    getEntitlement(ctx.organization.id),
    sidebarCollapsed(),
  ]);

  const plan =
    entitlement.state === "trial"
      ? { label: `Prova gratuita · ${entitlement.daysLeft} ${entitlement.daysLeft === 1 ? "giorno" : "giorni"}`, tone: entitlement.daysLeft <= 3 ? ("warning" as const) : ("neutral" as const) }
      : entitlement.state === "expired"
        ? { label: "Prova terminata · attiva il piano", tone: "danger" as const }
        : entitlement.state === "past_due"
          ? { label: "Pagamento non riuscito", tone: "danger" as const }
          : null;

  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar
        organization={ctx.organization.name}
        user={{ name: ctx.user.name, email: ctx.user.email, role: isRole(ctx.role) ? ROLE_LABELS[ctx.role] : ctx.role }}
        locations={locations}
        activeLocationId={activeId}
        pendingCount={pending}
        plan={plan}
        collapsed={collapsed}
      />
      <div className="min-w-0 flex-1 lg:py-2 lg:pr-2">
        <div className="flex min-h-[calc(100dvh-48px)] flex-col bg-surface lg:min-h-[calc(100dvh-16px)] lg:rounded-[var(--radius-panel)] lg:border lg:border-line lg:shadow-card">
          {mock > 0 && (
            <div className="flex items-center justify-center gap-2 border-b border-warning/15 bg-warning-soft px-4 py-1.5 text-center text-xs text-warning lg:rounded-t-[var(--radius-panel)]">
              <span className="size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
              <span>
                <strong className="font-semibold">Simulazione:</strong> recensioni di esempio, nulla viene pubblicato su Google.{" "}
                <Link href="/app/google" className="font-medium underline underline-offset-2">
                  Collega Google
                </Link>
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
