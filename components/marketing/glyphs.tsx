import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Reputia spot glyphs: two flat shapes, one in ink and one gold circle (always a circle: it is "il punto").
 * Where they overlap, the front shape is cut out of the back one by a ring of the background colour,
 * set with `--glyph-gap` on any ancestor (defaults to the surface white).
 */
type GlyphProps = { className?: string };

const INK = "var(--color-ink)";
const GAP = "var(--glyph-gap, var(--color-surface))";

function Frame({ className, children }: GlyphProps & { children: (gold: string) => React.ReactNode }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={cn("size-12 shrink-0", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3c25f" />
          <stop offset="1" stopColor="#c27c0e" />
        </linearGradient>
      </defs>
      {children(`url(#${id})`)}
    </svg>
  );
}

/** Reviews arrive: the dot settles into the bowl. */
export function GlyphArrive(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <circle cx="32" cy="23" r="17" fill={gold} />
          <path d="M5 34a27 27 0 0 0 54 0Z" fill={INK} stroke={GAP} strokeWidth="4" paintOrder="stroke" />
        </>
      )}
    </Frame>
  );
}

/** The assistant drafts: lines of text, the gold dot marks what it wrote. */
export function GlyphDraft(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <rect x="6" y="12" width="46" height="11" rx="5.5" fill={INK} />
          <rect x="6" y="31" width="30" height="11" rx="5.5" fill={INK} />
          <circle cx="44" cy="44" r="12" fill={gold} stroke={GAP} strokeWidth="4" paintOrder="stroke" />
        </>
      )}
    </Frame>
  );
}

/** You close it: the dot completes the circle. */
export function GlyphClose(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <path d="M30 49A19 19 0 1 1 49 30" stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <circle cx="47" cy="47" r="9" fill={gold} />
        </>
      )}
    </Frame>
  );
}

/** Reads: an eye with a gold pupil. */
export function GlyphRead(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <path d="M4 32Q32 2 60 32Q32 62 4 32Z" fill={INK} />
          <circle cx="32" cy="32" r="11" fill={gold} stroke={GAP} strokeWidth="4" paintOrder="stroke" />
        </>
      )}
    </Frame>
  );
}

/** Publishes: a wedge leaving the dot, up and out. */
export function GlyphPublish(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <path d="M10 6h48v48Z" fill={INK} />
          <circle cx="24" cy="40" r="18" fill={gold} stroke={GAP} strokeWidth="4" paintOrder="stroke" />
        </>
      )}
    </Frame>
  );
}

/** Doesn't touch: the dot sits beside the block, never on it. */
export function GlyphUntouched(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <rect x="6" y="6" width="34" height="34" rx="7" fill={INK} />
          <circle cx="48" cy="48" r="10" fill={gold} />
        </>
      )}
    </Frame>
  );
}

/** Nothing goes out without you: the dot held inside the frame. */
export function GlyphApprove(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <rect x="6" y="6" width="52" height="52" rx="14" fill={INK} />
          <circle cx="32" cy="32" r="12" fill={gold} />
        </>
      )}
    </Frame>
  );
}



/** Leave whenever: half the shape stays, the dot is free to go. */
export function GlyphFree(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <path d="M30 6a26 26 0 0 0 0 52Z" fill={INK} />
          <circle cx="47" cy="32" r="11" fill={gold} />
        </>
      )}
    </Frame>
  );
}

/** Google's "G" mark, official colours, to name the integration. */
export function GlyphGoogle({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("size-12 shrink-0", className)}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** Italian flag, round like the brand dot. */
export function GlyphItalyFlag({ className }: GlyphProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("size-12 shrink-0", className)}>
      <clipPath id={id}>
        <circle cx="24" cy="24" r="23" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="16" height="48" fill="#009246" />
        <rect x="16" width="16" height="48" fill="#ffffff" />
        <rect x="32" width="16" height="48" fill="#CE2B37" />
      </g>
      <circle cx="24" cy="24" r="22.5" fill="none" stroke="var(--color-line-strong)" />
    </svg>
  );
}
