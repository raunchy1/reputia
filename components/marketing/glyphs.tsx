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

/** Official link: two overlapping circles. */
export function GlyphLink(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <circle cx="23" cy="36" r="17" fill={INK} />
          <circle cx="41" cy="26" r="16" fill={gold} stroke={GAP} strokeWidth="4" paintOrder="stroke" />
        </>
      )}
    </Frame>
  );
}

/** Made for Italian: the "i" of the wordmark, gold dot on an ink stem. */
export function GlyphItalian(p: GlyphProps) {
  return (
    <Frame {...p}>
      {(gold) => (
        <>
          <rect x="22" y="26" width="20" height="34" rx="10" fill={INK} />
          <circle cx="32" cy="12" r="9" fill={gold} />
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
