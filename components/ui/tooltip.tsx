"use client";
import * as T from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export const TooltipProvider = T.Provider;

export function Tooltip({ label, children, side = "right" }: { label: string; children: ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <T.Root delayDuration={250}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={8} className="z-50 rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-pop data-[state=delayed-open]:animate-fade">
          {label}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
