import type { TimerBgPreset } from '../../../../domain/value-objects/TimerSettings';

/**
 * Background presets for the meditation timer.
 *
 * A multi-layer gradient doesn't fit the single-hex `backgroundColor` every
 * other widget uses, and storing raw stops in the URL would both bloat it and
 * let the owner build ugly combinations. So the URL carries a short preset name
 * and the actual layers live here — same trick as `clockFrame` on the flower
 * clock. Adding a preset = one entry in this map. No migration, no codec change.
 */
export interface TimerBackground {
  label: string;
  /** Full CSS `background` stack: glow layer(s) over a base gradient. */
  field: string;
  /** Representative mid-tone — what the field reads as at a glance. */
  core: string;
  /** Everything written on the field and on the glass. */
  ink: string;
  /** The one solid surface meaning "interactive" — active chip, primary button. */
  material: string;
  /** Label colour once it sits ON the material. */
  onMaterial: string;
}

/**
 * Film grain.
 *
 * Generated with SVG `feTurbulence` rather than shipped as a texture: no asset
 * to fetch into Notion's sandboxed iframe, and it scales to any size. It also
 * gives `backdrop-filter` something real to blur — frosted glass over a
 * perfectly smooth gradient reads as a flat translucent rectangle, because
 * blurring a smooth gradient returns the same gradient.
 */
export const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const TIMER_BACKGROUNDS: Record<TimerBgPreset, TimerBackground> = {
  /* Forest — deep green field with a warm sage bloom in the top-left corner,
     matching the owner's reference. Two radial layers over a diagonal base:
     the wide one lifts the whole upper-left quadrant, the tight one is the
     actual light source. */
  sage: {
    label: 'Forest',
    core: '#2E5230',
    ink: '#FFFFFF',
    material: '#FFFFFF',
    onMaterial: '#25431F',
    field: [
      /* NB: these positions are in BreathLayer coordinates, and that layer is
         inset -16% on every side so the breathing scale never exposes an edge.
         The visible card therefore spans roughly 12%..88% of this box — a bloom
         written at 0% 0% would sit entirely off-screen. Hence the offsets. */
      /* Corner light. Deliberately low-contrast: the card should read as one
         dark smoked surface that happens to be lit, not as a gradient. */
      'radial-gradient(ellipse 52% 38% at 8% 5%, rgba(208, 224, 172, 0.52) 0%, rgba(166, 192, 130, 0.28) 34%, rgba(112, 146, 92, 0.1) 58%, rgba(80, 112, 68, 0) 82%)',
      /* Weight in the opposite corner so the light reads as directional. */
      'radial-gradient(ellipse 72% 56% at 90% 94%, rgba(8, 20, 11, 0.48) 0%, rgba(12, 26, 15, 0.2) 44%, rgba(16, 32, 19, 0) 76%)',
      'linear-gradient(152deg, #396539 0%, #2E5230 38%, #244228 70%, #19321E 100%)',
    ].join(', '),
  },
  plain: {
    label: 'Plain',
    core: '#FFFFFF',
    ink: '#1F1F1F',
    material: '#1F1F1F',
    onMaterial: '#FFFFFF',
    field: '',
  },
};

export function getTimerBackground(preset: TimerBgPreset): TimerBackground {
  return TIMER_BACKGROUNDS[preset] || TIMER_BACKGROUNDS.sage;
}
