import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerPhase = 'idle' | 'running' | 'paused' | 'finished';

interface UseTimerEngineArgs {
  durationMs: number;
  /** 0 = interval bells off */
  intervalMs?: number;
  onInterval?: () => void;
  onFinish?: () => void;
}

interface TimerEngine {
  phase: TimerPhase;
  remainingMs: number;
  elapsedMs: number;
  /** 0..1 */
  progress: number;
  durationMs: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  /** Ignored unless phase === 'idle' — changing length mid-session is meaningless. */
  setDuration: (ms: number) => void;
}

const TICK_MS = 250;

/**
 * Countdown engine for the meditation timer.
 *
 * CRITICAL: the countdown is derived from a wall-clock deadline, never by
 * decrementing a counter on each tick. Browsers throttle timers in background
 * tabs to ~1Hz or worse — and this widget runs *specifically* while the tab is
 * unfocused. A decrementing counter would drift badly (a 10-minute session
 * finishing at 14 real minutes). Here the tick is only a repaint trigger, so
 * throttling costs a slightly stale display and never a wrong result.
 */
export function useTimerEngine({
  durationMs,
  intervalMs = 0,
  onInterval,
  onFinish,
}: UseTimerEngineArgs): TimerEngine {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [duration, setDurationState] = useState(durationMs);
  const [remainingMs, setRemainingMs] = useState(durationMs);

  /** Wall-clock deadline while running; null while idle/paused/finished. */
  const endAtRef = useRef<number | null>(null);
  /** How many interval bells have already fired this session. */
  const bellsFiredRef = useRef(0);
  /** Mirror of `phase` for synchronous reads — setState updaters must stay pure. */
  const phaseRef = useRef<TimerPhase>('idle');
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Keep callbacks in refs so the tick effect doesn't re-subscribe every render.
  const onIntervalRef = useRef(onInterval);
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onIntervalRef.current = onInterval; }, [onInterval]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // Owner changed the default duration in Studio (or live-sync delivered new
  // settings). Only adopt it while idle — never yank a running session.
  useEffect(() => {
    if (phaseRef.current !== 'idle') return;
    setDurationState(durationMs);
    setRemainingMs(durationMs);
  }, [durationMs]);

  const start = useCallback(() => {
    bellsFiredRef.current = 0;
    endAtRef.current = Date.now() + duration;
    setRemainingMs(duration);
    setPhase('running');
  }, [duration]);

  const pause = useCallback(() => {
    if (endAtRef.current === null) return;
    const left = Math.max(0, endAtRef.current - Date.now());
    endAtRef.current = null;
    setRemainingMs(left);
    setPhase('paused');
  }, []);

  const resume = useCallback(() => {
    endAtRef.current = Date.now() + remainingMs;
    setPhase('running');
  }, [remainingMs]);

  const reset = useCallback(() => {
    endAtRef.current = null;
    bellsFiredRef.current = 0;
    setRemainingMs(duration);
    setPhase('idle');
  }, [duration]);

  const setDuration = useCallback((ms: number) => {
    if (phaseRef.current !== 'idle') return;
    setDurationState(ms);
    setRemainingMs(ms);
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;

    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt === null) return;

      const left = Math.max(0, endAt - Date.now());
      setRemainingMs(left);

      // Interval bells. A backgrounded tab can jump past several marks at once —
      // fire ONCE for the whole jump rather than a burst of chimes on refocus.
      if (intervalMs > 0) {
        const elapsed = duration - left;
        const due = Math.floor(elapsed / intervalMs);
        // The final mark coincides with the end bell; don't double up.
        const capped = Math.min(due, Math.ceil(duration / intervalMs) - 1);
        if (capped > bellsFiredRef.current && left > 0) {
          bellsFiredRef.current = capped;
          onIntervalRef.current?.();
        }
      }

      if (left === 0) {
        endAtRef.current = null;
        setPhase('finished');
        onFinishRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [phase, duration, intervalMs]);

  const elapsedMs = Math.max(0, duration - remainingMs);

  return {
    phase,
    remainingMs,
    elapsedMs,
    progress: duration > 0 ? Math.min(1, elapsedMs / duration) : 0,
    durationMs: duration,
    start,
    pause,
    resume,
    reset,
    setDuration,
  };
}
