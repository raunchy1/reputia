import { cn } from "@/lib/cn";

/** Marks AI-written content: the brand's gold "punto", never a sparkle. */
export function AiMark({ className }: { className?: string }) {
  return <span className={cn("inline-block size-[7px] shrink-0 rounded-full bg-gold", className)} aria-hidden />;
}
