"use client";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "font-sans flex w-[356px] max-w-[calc(100vw-32px)] items-start gap-2.5 rounded-[var(--radius-panel)] border border-line bg-surface px-3.5 py-3 text-[13px] text-ink shadow-pop",
          title: "font-medium",
          description: "mt-0.5 text-muted",
          success: "[&_[data-icon]]:text-positive",
          error: "[&_[data-icon]]:text-danger",
        },
      }}
    />
  );
}
