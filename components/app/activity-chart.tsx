"use client";
import { useState } from "react";

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
  const W = 640;
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
        <span className="ml-auto h-4 text-ink-2 tabular-nums" aria-live="polite">
          {active && `Settimana del ${fmt.format(new Date(active.weekStart))}: ${active.received} ricevute · ${active.replied} risposte`}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Recensioni ricevute e risposte pubblicate per settimana, ultime 12 settimane">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={pad.l - 6} y={y(t) + 3.5} textAnchor="end" className="fill-faint text-[10px] tabular-nums">
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
              {(i % 3 === 0 || i === data.length - 1) && (
                <text x={pad.l + i * band + band / 2} y={H - 6} textAnchor="middle" className="fill-faint text-[10px]">
                  {fmt.format(new Date(d.weekStart))}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Attività settimanale</caption>
        <thead>
          <tr>
            <th>Settimana</th>
            <th>Recensioni ricevute</th>
            <th>Risposte pubblicate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.weekStart}>
              <td>{fmt.format(new Date(d.weekStart))}</td>
              <td>{d.received}</td>
              <td>{d.replied}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
