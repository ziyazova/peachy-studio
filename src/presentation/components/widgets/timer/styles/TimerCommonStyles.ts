import styled from 'styled-components';
import { GRAIN_URL } from '../backgroundPresets';

/**
 * Chrome for the timer widget.
 *
 * Per DESIGN.md rule 6, widget internals are user-customisable content and stay
 * out of the design-system migration — local styled-components are correct here.
 *
 * ONE card, not a card inside a card: the widget itself is the smoked-glass
 * surface. Two materials only — `ink` (white) for everything written, `material`
 * (solid white) for the surfaces that mean "interactive".
 */

export const TimerSurface = styled.div<{
  $radius: number;
  $showBorder: boolean;
  $borderColor: string;
  $transparent: boolean;
  $plainBg: string;
}>`
  position: relative;
  width: 100%;
  max-width: 340px;
  min-width: 200px;
  /* Tall, phone-ish. The stacked segment rows need the vertical room, and the
     reference widgets all read as a long card. */
  aspect-ratio: 2 / 3;
  /* Everything inside sizes in cqw, so the widget scales off its OWN width
     rather than the viewport — it has to look right from 200px to full width. */
  container-type: inline-size;
  border-radius: ${({ $radius }) => $radius}px;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  box-sizing: border-box;
  background: ${({ $transparent, $plainBg }) => ($transparent ? 'transparent' : $plainBg)};
  border: ${({ $showBorder, $borderColor }) =>
    ($showBorder ? `1px solid ${$borderColor}` : 'none')};
  /* Glass rim.
   *
   * Built from inset shadows rather than a border property, so it stays
   * independent of the owner's showBorder setting — and because a border sits
   * outside the radius curve while an inset shadow follows it exactly.
   *
   * Layered in the order light actually behaves on a glass edge: a bright top
   * lip where light catches, a faint rim all the way round, a dark bottom lip
   * where it falls away, then two outer shadows — one tight for contact, one
   * wide and soft for lift. */
  box-shadow: ${({ $transparent }) => ($transparent ? 'none' : [
    'inset 0 1.2px 0 rgba(255, 255, 255, 0.26)',
    'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    'inset 0 -1.2px 0 rgba(0, 0, 0, 0.22)',
    '0 3px 10px rgba(8, 20, 10, 0.22)',
    '0 20px 52px rgba(8, 20, 10, 0.34)',
  ].join(', '))};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  user-select: none;
`;

/**
 * The colour field, which also breathes.
 *
 * Inset well beyond the surface so scaling up never exposes a hard edge, and
 * `will-change` keeps it on its own compositor layer — the whole point of
 * animating `transform` rather than the gradient stops.
 */
export const BreathLayer = styled.div<{ $field: string }>`
  position: absolute;
  inset: -16%;
  background: ${({ $field }) => $field};
  transform: scale(1);
  will-change: transform;
  z-index: 0;

  @media (prefers-reduced-motion: reduce) {
    transform: scale(1) !important;
  }
`;

/** Film grain — keeps the dark field from reading as flat digital colour. */
export const GrainLayer = styled.div`
  position: absolute;
  inset: 0;
  background-image: ${GRAIN_URL};
  background-repeat: repeat;
  opacity: 0.22;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 1;
`;

/**
 * Composition.
 *
 * Not centred: on a 2:3 card the content stack is shorter than the card, so
 * centring left equal voids above and below and the whole thing read as
 * floating. Instead the clock sits high, the controls sit low, and ALL the
 * slack collects in one deliberate breath between them — which is where a
 * viewer's eye expects emptiness in a type-led layout.
 *
 * While a session runs there are only three elements left, and spreading those
 * to the far edges looks sparse rather than composed — so that state centres.
 */
export const TimerContent = styled.div<{ $spread: boolean }>`
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ $spread }) => ($spread ? 'space-between' : 'center')};
  width: 100%;
  padding: ${({ $spread }) => ($spread ? '15% 9% 11%' : '9% 9% 11%')};
  box-sizing: border-box;
`;

export const ClockBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ActionBlock = styled.div<{ $gapTop: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: ${({ $gapTop }) => $gapTop}%;
`;

export const TimeDisplay = styled.div<{ $color: string; $dim: boolean }>`
  font-size: clamp(40px, 29cqw, 92px);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 0.95;
  color: ${({ $color }) => $color};
  opacity: ${({ $dim }) => ($dim ? 0.5 : 1)};
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 14px rgba(10, 24, 12, 0.28);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
`;

export const PhaseLabel = styled.div<{ $color: string }>`
  margin-top: clamp(10px, 4.4cqw, 20px);
  font-size: clamp(9px, 3.1cqw, 12.5px);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  opacity: 0.6;
  transition: opacity 0.4s ease;
`;

/**
 * Progress only renders while a session exists. At rest it would be a dead line
 * pinned at zero — decoration pretending to be information.
 */
export const ProgressTrack = styled.div<{ $color: string }>`
  width: clamp(110px, 58cqw, 210px);
  height: clamp(5px, 1.8cqw, 8px);
  margin-top: clamp(16px, 7cqw, 30px);
  border-radius: 999px;
  background: ${({ $color }) => `${$color}2B`};
  box-shadow:
    inset 0 1px 0 rgba(0, 0, 0, 0.16),
    inset 0 0 0 1px rgba(255, 255, 255, 0.07);
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $color: string; $percent: number }>`
  width: ${({ $percent }) => Math.max(0, Math.min(100, $percent))}%;
  height: 100%;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  opacity: 0.88;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.28);
  transition: width 0.25s linear;
`;

/* ── Fields ── */

export const FieldLabel = styled.div<{ $color: string }>`
  align-self: flex-start;
  margin: 0 0 clamp(4px, 1.7cqw, 8px) clamp(3px, 1.4cqw, 6px);
  font-size: clamp(8px, 2.9cqw, 11px);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: ${({ $color }) => $color};
  opacity: 0.62;
`;

export const FieldGroup = styled.div<{ $gapTop: number; $trimPx?: number }>`
  width: 100%;
  margin-top: ${({ $gapTop, $trimPx }) =>
    ($trimPx ? `calc(${$gapTop}% - ${$trimPx}px)` : `${$gapTop}%`)};
  display: flex;
  flex-direction: column;
`;

/**
 * A translucent trough holding the options, like the reference's
 * Weekly / Monthly switch — the selected one lifts out as a frosted pill.
 */
export const SegmentTrough = styled.div`
  display: flex;
  gap: 2px;
  width: 100%;
  padding: clamp(2px, 0.9cqw, 4px);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  border: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
`;

export const Segment = styled.button<{ $active: boolean; $ink: string; $material: string }>`
  appearance: none;
  flex: 1;
  min-width: 0;
  border: none;
  /* Frosted rather than solid white — a hard white chip read as a much louder
     accent than the calm field wants. */
  background: ${({ $material, $active }) => ($active ? `${$material}C7` : 'transparent')};
  backdrop-filter: ${({ $active }) => ($active ? 'blur(10px)' : 'none')};
  color: ${({ $ink, $material, $active }) => ($active ? $ink : $material)};
  opacity: ${({ $active }) => ($active ? 1 : 0.7)};
  border-radius: 999px;
  padding: clamp(5px, 2cqw, 9px) clamp(2px, 1cqw, 6px);
  font-family: inherit;
  font-size: clamp(8px, 2.9cqw, 12px);
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 1px 4px rgba(10, 24, 12, 0.2)' : 'none')};
  transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;

  &:hover { opacity: 1; }
`;

/* ── Controls ── */

export const ControlRow = styled.div<{ $gapTop: number }>`
  display: flex;
  align-items: center;
  gap: clamp(6px, 2.4cqw, 11px);
  margin-top: ${({ $gapTop }) => ($gapTop ? `calc(${$gapTop}% + 14px)` : '0')};
`;

export const ControlButton = styled.button<{
  $ink: string;
  $material: string;
  $filled?: boolean;
}>`
  appearance: none;
  border: 1px solid ${({ $filled }) => ($filled ? 'transparent' : 'rgba(255, 255, 255, 0.26)')};
  background: ${({ $material, $filled }) => ($filled ? `${$material}D4` : 'rgba(255, 255, 255, 0.12)')};
  color: ${({ $ink, $material, $filled }) => ($filled ? $ink : $material)};
  border-radius: 999px;
  padding: clamp(8px, 3cqw, 14px) clamp(18px, 7cqw, 32px);
  font-family: inherit;
  font-size: clamp(10px, 3.6cqw, 14px);
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  backdrop-filter: blur(12px);
  box-shadow: ${({ $filled }) => ($filled
    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 2px 6px rgba(10, 24, 12, 0.18), 0 8px 22px rgba(10, 24, 12, 0.26)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.16)')};
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $filled }) => ($filled ? '0 7px 22px rgba(10, 24, 12, 0.3)' : 'none')};
    background: ${({ $material, $filled }) => ($filled ? `${$material}EC` : 'rgba(255, 255, 255, 0.2)')};
  }
  &:active { transform: translateY(0); }
`;
