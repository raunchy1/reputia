import type { ReactNode } from "react";

/** Top bar of the content panel: title on the left, actions on the right. */
export function PageHeader({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="border-b border-line px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl leading-7 font-semibold tracking-[-0.01em]">{title}</h1>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

export function PageBody({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <div className={narrow ? "mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8" : "w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}>{children}</div>;
}
