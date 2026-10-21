import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Mercury-style row: explanation left, control right. Needs an ancestor with the `@container` class. */
export function SettingsSection({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("grid gap-4 border-b border-line py-6 first:pt-0 last:border-b-0 @3xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)] @3xl:gap-10", className)}>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <div className="mt-1 text-[13px] leading-relaxed text-muted">{description}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
