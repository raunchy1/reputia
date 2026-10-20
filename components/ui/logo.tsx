import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-ink" />
      <path d="M10 22V10h6.2c2.9 0 4.8 1.7 4.8 4.2 0 1.9-1.1 3.3-2.8 3.9L22 22h-3.3l-3-3.6H13V22z" className="fill-white" />
      <circle cx="23.5" cy="9" r="2.5" className="fill-accent" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.03em] text-ink", className)}>
      <LogoMark />
      Reputia
    </Link>
  );
}
