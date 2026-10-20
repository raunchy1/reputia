"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink/25 data-[state=open]:animate-fade" />
      <D.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-panel)] border border-line bg-surface p-5 shadow-pop focus:outline-none data-[state=open]:animate-pop",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <D.Title className="text-base font-semibold">{title}</D.Title>
          <D.Close className="-m-1 rounded-md p-1 text-faint hover:bg-subtle hover:text-ink" aria-label="Chiudi">
            <X className="size-4" />
          </D.Close>
        </div>
        {description ? <D.Description className="mt-1.5 text-[13px] leading-relaxed text-muted">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
        <div className="mt-4">{children}</div>
      </D.Content>
    </D.Portal>
  );
}
