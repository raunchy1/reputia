import Link from "next/link";
import { AppNav } from "@/components/app/nav";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Logo } from "@/components/ui/logo";
import { db } from "@/lib/db";
import { ROLE_LABELS, isRole } from "@/lib/roles";
import { requireOrg } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();
  const [pending, mock] = await Promise.all([
    db.review.count({ where: { organizationId: ctx.organization.id, status: { in: ["NEW", "FAILED"] }, location: { archivedAt: null } } }),
    db.googleConnection.count({ where: { organizationId: ctx.organization.id, provider: "MOCK", status: "ACTIVE", locations: { some: {} } } }),
  ]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-20 border-b border-line bg-paper/90 px-4 pt-4 pb-3 backdrop-blur lg:h-dvh lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <div className="flex items-center justify-between lg:block">
          <Logo href="/app" className="lg:px-2" />
          <div className="lg:hidden">
            <SignOutButton />
          </div>
        </div>
        <div className="mt-4 lg:mt-8">
          <AppNav pendingCount={pending} />
        </div>
        <div className="mt-auto hidden lg:absolute lg:inset-x-4 lg:bottom-6 lg:block">
          <div className="rounded-xl border border-line bg-surface/70 p-3">
            <p className="truncate text-sm font-medium">{ctx.organization.name}</p>
            <p className="truncate text-xs text-muted">
              {ctx.user.name} · {isRole(ctx.role) ? ROLE_LABELS[ctx.role] : ctx.role}
            </p>
            <div className="mt-2 -ml-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        {mock > 0 && (
          <div className="border-b border-warning/20 bg-warning-soft px-5 py-2.5 text-center text-[13px] text-warning">
            <strong className="font-semibold">Modalità simulazione:</strong> stai usando recensioni di esempio. Le risposte non vengono pubblicate su Google.{" "}
            <Link href="/app/google" className="font-medium underline underline-offset-2">
              Collega Google
            </Link>
          </div>
        )}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
