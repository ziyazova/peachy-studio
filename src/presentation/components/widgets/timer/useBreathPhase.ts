import { useEffect, useRef, useState } from 'react';
import type { TimerBreathPattern } from '../../../../domain/value-objects/TimerSettings';

export type BreathSegmentName = 'in' | 'hold' | 'out' | 'rest';

interface BreathSegment {
  name: BreathSegmentName;
  ms: number;
}

export const BREATH_PATTERNS: Record<TimerBreathPattern, BreathSegment[]> = {
  /* 5 in / 5 out — the calm default, ~6 breaths per minute. */
  coherent: [
    { name: 'in', ms: 5000 },
    { name: 'out', ms: 5000 },
  ],
  /* Box breathing, 4-4-4-4. */
  box: [
    { name: 'in', ms: 4000 },
    { name: 'hold', ms: 4000 },
    { name: 'out', ms: 4000 },
    { name: 'rest', ms: 4000 },
  ],
  /* 4-7-8, the "relaxing breath". Named `relax`, NOT `478` — the URL decoder
     turns numeric-looking strings into numbers. */
  relax: [
    { name: 'in', ms: 4000 },
    { name: 'hold', ms: 7000 },
    { name: 'out', ms: 8000 },
  ],
};

/* The bell style's ambience: a slow, even 4-in / 4-out that isn't asking anyone
   to follow it — it just keeps the surface alive. */
const AMBIENT: BreathSegment[] = [
  { name: 'in', ms: 4000 },
  { name: 'out', ms: 4000 },
];

export const SEGMENT_LABEL: Record<BreathSegmentName, string> = {
  in: 'breathe in',
  hold: 'hold',
  out: 'breathe out',
  rest: 'rest',
};

const MAX_SCALE = 1.07;

/** Cosine ease — no linear corners, which is what makes it read as breath. */
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

function scaleFor(name: BreathSegmentName, t: number): number {
  switch (name) {
    case 'in': return 1 + (MAX_SCALE - 1) * ease(t);
    case 'hold': return MAX_SCALE;
    case 'out': return MAX_SCALE - (MAX_SCALE - 1) * ease(t);
    case 'rest': return 1;
  }
}

/**
 * Drives the breathing surface.
 *
 * Two deliberate choices:
 *
 * 1. **Wall-clock derived, not accumulated.** Every frame recomputes its
 *    position from `Date.now()`. When a backgrounded tab throttles rAF to a
 *    crawl, refocusing snaps straight back to the correct phase instead of
 *    drifting out of sync with the label.
 *
 * 2. **The transform is written straight to the DOM node**, not through React
 *    state. Pushing a new scale through `setState` 60×/second would re-render
 *    the widget — and make styled-components regenerate its classes — every
 *    frame. React state changes only when the *segment* changes, a handful of
 *    times per cycle, which is all the label needs.
 */
export function useBreathPhase(active: boolean, pattern: TimerBreathPattern | null) {
  // Both branches are module constants, so this reference is stable per pattern.
  const segments = pattern ? BREATH_PATTERNS[pattern] : AMBIENT;
  const cycleMs = segments.reduce((sum, s) => sum + s.ms, 0);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const [segment, setSegment] = useState<BreathSegmentName>('in');

  const anchorRef = useRef(0);
  const frameRef = useRef<number>();
  const lastSegmentRef = useRef<BreathSegmentName>('in');

  useEffect(() => {
    const node = surfaceRef.current;

    if (!active) {
      if (node) node.style.transform = 'scale(1)';
      lastSegmentRef.current = 'in';
      setSegment('in');
      return;
    }

    /* Anchoring to the moment breathing (re)starts means a session always opens
       on an inhale, rather than dropping the user mid-exhale. */
    anchorRef.current = Date.now();

    const frame = () => {
      const pos = (Date.now() - anchorRef.current) % cycleMs;

      let acc = 0;
      let current = segments[0];
      let within = 0;
      for (const seg of segments) {
        if (pos < acc + seg.ms) {
          current = seg;
          within = (pos - acc) / seg.ms;
          break;
        }
        acc += seg.ms;
      }

      const el = surfaceRef.current;
      if (el) el.style.transform = `scale(${scaleFor(current.name, within).toFixed(4)})`;

      if (current.name !== lastSegmentRef.current) {
        lastSegmentRef.current = current.name;
        setSegment(current.name);
      }

      frameRef.current = requestAnimationFrame(frame);
    };

    frameRef.current = requestAnimationFrame(frame);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [active, cycleMs, segments]);

  return { surfaceRef, segment };
}
