"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** J/K move through the list, "/" focuses search. Ignored while typing. */
export function InboxKeys() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      if (e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("input[type=search]")?.focus();
        return;
      }
      if (e.key !== "j" && e.key !== "k") return;
      const rows = [...document.querySelectorAll<HTMLAnchorElement>("a[data-review-row]")];
      if (!rows.length) return;
      const current = rows.findIndex((r) => r.getAttribute("aria-current") === "true");
      const base = current === -1 ? (e.key === "j" ? -1 : rows.length) : current;
      const next = rows[Math.min(rows.length - 1, Math.max(0, base + (e.key === "j" ? 1 : -1)))];
      e.preventDefault();
      next.scrollIntoView({ block: "nearest" });
      next.focus({ preventScroll: true });
      router.push(next.getAttribute("href")!, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
  return null;
}
