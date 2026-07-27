import { useCallback, useEffect, useRef } from 'react';
import { Logger } from '../../../../infrastructure/services/Logger';
import type { TimerEndSound } from '../../../../domain/value-objects/TimerSettings';

/**
 * Meditation bells, synthesised with the Web Audio API.
 *
 * We GENERATE every tone rather than ship audio files. That means: no licence,
 * no attribution, no assets to fetch over the network into Notion's sandboxed
 * iframe, and nothing to go stale.
 *
 * Real bells are *inharmonic* — their overtones sit at non-integer ratios of the
 * fundamental. That's the whole difference between "a bell" and "a synth beep",
 * so each voice below carries its own measured-ish ratio set rather than a
 * generic harmonic stack.
 */

interface Partial {
  ratio: number;
  gain: number;
  /** Hz offset against a twin oscillator, producing the slow shimmer of a struck bell. */
  detune?: number;
}

interface Voice {
  label: string;
  freq: number;
  decay: number;
  partials: Partial[];
}

export const BELL_VOICES: Record<Exclude<TimerEndSound, 'none'>, Voice> = {
  /* Deep Tibetan singing bowl. Low fundamental, very long tail, strong
     inharmonic second partial — the one that gives a bowl its "wobble". */
  bowl: {
    label: 'Bowl',
    freq: 174,
    decay: 7.5,
    partials: [
      { ratio: 1, gain: 0.5, detune: 0.7 },
      { ratio: 2.71, gain: 0.24, detune: 1.2 },
      { ratio: 5.18, gain: 0.11 },
      { ratio: 8.6, gain: 0.05 },
    ],
  },
  /* Temple bell. Mid fundamental, dense overtones, moderate decay — rounder and
     more "struck metal" than the bowl. */
  temple: {
    label: 'Temple',
    freq: 261,
    decay: 5.2,
    partials: [
      { ratio: 1, gain: 0.44, detune: 0.5 },
      { ratio: 2.0, gain: 0.26 },
      { ratio: 3.01, gain: 0.19, detune: 1.6 },
      { ratio: 4.97, gain: 0.1 },
      { ratio: 6.8, gain: 0.05 },
    ],
  },
  /* Crystal chime. High, clean, short — a light punctuation rather than a
     resonance you sit inside. Good for interval bells. */
  crystal: {
    label: 'Crystal',
    freq: 660,
    decay: 2.6,
    partials: [
      { ratio: 1, gain: 0.34, detune: 0.4 },
      { ratio: 2.76, gain: 0.14 },
      { ratio: 5.4, gain: 0.05 },
    ],
  },
};

export const BELL_ORDER: Exclude<TimerEndSound, 'none'>[] = ['bowl', 'temple', 'crystal'];

/** Everything the viewer can pick, muting included. */
export const BELL_CHOICES: { value: TimerEndSound; label: string }[] = [
  ...BELL_ORDER.map(v => ({ value: v as TimerEndSound, label: BELL_VOICES[v].label })),
  { value: 'none', label: 'Silent' },
];

type AudioCtor = typeof AudioContext;

function getAudioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  return window.AudioContext
    || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext
    || null;
}

export function useBell() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => () => {
    ctxRef.current?.close().catch(() => { /* already gone */ });
    ctxRef.current = null;
  }, []);

  /**
   * Open (and unlock) the audio context.
   *
   * MUST be called from a real user gesture — the Start click, or tapping a bell
   * to preview it. The end-of-session bell fires from a timer callback, which is
   * NOT a gesture, so a context created lazily at ring time would stay
   * `suspended` and the very bell this feature exists for would be silent.
   */
  const prime = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const Ctor = getAudioCtor();
        if (!Ctor) {
          Logger.warn('TimerBell', 'Web Audio unavailable — running silent');
          return;
        }
        ctxRef.current = new Ctor();
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume().catch(() => { /* best effort */ });
      }
    } catch (err) {
      Logger.warn('TimerBell', 'Could not open audio context', err);
    }
  }, []);

  const ring = useCallback((sound: TimerEndSound, intensity: number = 1) => {
    if (sound === 'none') return;

    try {
      const ctx = ctxRef.current;
      // Not primed (no gesture yet, or audio unavailable) — stay silent.
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => { /* best effort */ });

      const voice = BELL_VOICES[sound];
      if (!voice) return;

      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.34 * intensity, now + 0.010);
      master.gain.exponentialRampToValueAtTime(0.0001, now + voice.decay);
      master.connect(ctx.destination);

      voice.partials.forEach(({ ratio, gain, detune }) => {
        // Higher partials die first, like a real bell.
        const partialDecay = voice.decay / Math.max(1, ratio * 0.55);

        const voices = detune ? [-detune / 2, detune / 2] : [0];
        voices.forEach(offset => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(voice.freq * ratio + offset, now);
          g.gain.setValueAtTime(gain / voices.length, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + partialDecay);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + partialDecay + 0.1);
        });
      });
    } catch (err) {
      Logger.warn('TimerBell', 'Bell failed, continuing silently', err);
    }
  }, []);

  /**
   * Ring from inside a click — primes and strikes in one gesture.
   *
   * Used both for previewing a bowl and for the opening strike, which is why it
   * must go through `prime` first: on a cold context `ring` alone would find
   * nothing to play into.
   */
  const preview = useCallback((sound: TimerEndSound, intensity: number = 0.85) => {
    prime();
    ring(sound, intensity);
  }, [prime, ring]);

  return { prime, ring, preview };
}
