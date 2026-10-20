import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({ icon: Icon, title, children, action, className }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <span className="grid size-10 place-items-center rounded-[var(--radius-panel)] border border-line bg-surface text-muted shadow-card">
        <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      {children && <div className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
