const PALETTE = ["#ecebf8", "#e6f0ea", "#f6ecdc", "#f4e6e3", "#e5ebf3", "#efe9e1"];

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const bg = PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-ink-2" style={{ background: bg }} aria-hidden>
      {initials}
    </span>
  );
}
