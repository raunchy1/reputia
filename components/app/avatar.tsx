const PALETTE = ["#e8e2f8", "#e3efe8", "#f7e9d6", "#f3e1df", "#e1e9f3", "#efe6dc"];

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const bg = PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-ink-soft" style={{ background: bg }} aria-hidden>
      {initials}
    </span>
  );
}
