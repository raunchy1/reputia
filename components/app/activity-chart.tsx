"use client";
import { useEffect, useRef, useState } from "react";

export type WeekPoint = { weekStart: string; received: number; replied: number };

const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });

function niceMax(n: number) {
  if (n <= 4) return 4;
  const step = n <= 10 ? 2 : n <= 25 ? 5 : n <= 50 ? 10 : 25;
  return Math.ceil(n / step) * step;
}

/** Grouped weekly columns. Series colours validated with the dataviz checker; identity also via legend + table. */
export function ActivityChart({ data }: { data: WeekPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  // Draw at the real container width so axis text stays legible on phones instead of shrinking with the SVG.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 180;
  const pad = { l: 28, r: 8, t: 12, b: 24 };
  const max = niceMax(Math.max(...data.map((d) => Math.max(d.received, d.replied)), 0));
  const band = (W - pad.l - pad.r) / data.length;
  const bar = Math.min(12, (band - 10) / 2);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const base = y(0);
  const ticks = [0, max / 2, max];

  const col = (x: number, v: number, color: string) => {
    if (v === 0) return null;
    const top = y(v);
    const h = base - top;
    const r = Math.min(3, h);
    return <path d={`M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + bar - r} Q${x + bar},${top} ${x + bar},${top + r} V${base} Z`} fill={color} />;
  };

  const active = hover !== null ? data[hover] : null;

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-chart-received" aria-hidden /> Recensioni ricevute
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-chart-replied" aria-hidden /> Risposte pubblicate
        </span>
        <span className="ml-auto h-4 font-mono text-[11px] text-ink-2" aria-live="polite">
          {active && `${fmt.format(new Date(active.weekStart))} · ${active.received} ricevute · ${active.replied} risposte`}
        </span>
        <button type="button" onClick={() => setAsTable((t) => !t)} className="rounded px-1.5 py-0.5 font-mono text-[11px] text-muted hover:bg-subtle hover:text-ink" aria-pressed={asTable}>
          {asTable ? "Grafico" : "Tabella"}
        </button>
      </figcaption>
      <div ref={box} hidden={asTable}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full" role="img" aria-label="Recensioni ricevute e risposte pubblicate per settimana, ultime 12 settimane">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={pad.l - 6} y={y(t) + 3.5} textAnchor="end" className="fill-faint text-[11px] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x0 = pad.l + i * band + (band - (bar * 2 + 2)) / 2;
          return (
            <g key={d.weekStart} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + i * band} y={pad.t} width={band} height={H - pad.t - pad.b} fill={hover === i ? "var(--color-subtle)" : "transparent"} />
              {col(x0, d.received, "var(--color-chart-received)")}
              {col(x0 + bar + 2, d.replied, "var(--color-chart-replied)")}
              {(i % (W < 480 ? 4 : 3) === 0 || i === data.length - 1) && (
                <text x={pad.l + i * band + band / 2} y={H - 6} textAnchor="middle" className="fill-faint text-[11px]">
                  {fmt.format(new Date(d.weekStart))}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      </div>
      <table className={asTable ? "w-full font-mono text-[12px]" : "sr-only"}>
        <caption className="sr-only">Attività settimanale</caption>
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-1.5 font-medium">Settimana</th>
            <th className="py-1.5 text-right font-medium">Ricevute</th>
            <th className="py-1.5 text-right font-medium">Risposte</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.weekStart} className="border-b border-line last:border-0">
              <td className="py-1.5 text-ink-2">{fmt.format(new Date(d.weekStart))}</td>
              <td className="py-1.5 text-right">{d.received}</td>
              <td className="py-1.5 text-right">{d.replied}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
