import React, { useCallback, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { TimerSettings, TimerEndSound } from '../../../../domain/value-objects/TimerSettings';
import { getContrastColor } from '../../../themes/colors';
import { useTimerEngine } from '../../../hooks/useTimerEngine';
import { getTimerBackground } from './backgroundPresets';
import { BELL_CHOICES, useBell } from './useBell';
import { SEGMENT_LABEL, useBreathPhase } from './useBreathPhase';
import {
  ActionBlock,
  BreathLayer,
  ClockBlock,
  ControlButton,
  ControlRow,
  FieldGroup,
  FieldLabel,
  GrainLayer,
  PhaseLabel,
  ProgressFill,
  ProgressTrack,
  Segment,
  SegmentTrough,
  TimeDisplay,
  TimerContent,
  TimerSurface,
} from './styles/TimerCommonStyles';

const DURATION_PRESETS = [5, 10, 15, 20];
const MIN_PER_MS = 60_000;

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface TimerShellProps {
  settings: TimerSettings;
  /** `breathe` follows a pattern and names each phase; `bell` just keeps a calm ambience. */
  guided: boolean;
  transparent?: boolean;
}

export const TimerShell: React.FC<TimerShellProps> = ({ settings, guided, transparent = false }) => {
  const bg = getTimerBackground(settings.bgPreset);
  const isPlain = settings.bgPreset === 'plain' || transparent;

  /* Two materials, both declared by the preset (see backgroundPresets). Only the
     plain background falls back to automatic contrast, since there the owner
     picks an arbitrary hex we can't have an opinion about in advance. */
  const ink = isPlain ? getContrastColor(settings.backgroundColor) : bg.ink;
  const material = isPlain ? getContrastColor(settings.backgroundColor) : bg.material;
  const onMaterial = isPlain ? settings.backgroundColor : bg.onMaterial;

  const bell = useBell();

  /* The owner's choice is the default; tapping a bowl overrides it for this
     viewer's session only, exactly like the duration segments. Never written back. */
  const [sound, setSound] = useState<TimerEndSound>(settings.endSound);

  const handleFinish = useCallback(() => bell.ring(sound, 1), [bell, sound]);
  const handleInterval = useCallback(() => bell.ring(sound, 0.45), [bell, sound]);

  const engine = useTimerEngine({
    durationMs: settings.durationMin * MIN_PER_MS,
    intervalMs: settings.intervalBellMin * MIN_PER_MS,
    onFinish: handleFinish,
    onInterval: handleInterval,
  });

  const { surfaceRef, segment } = useBreathPhase(
    engine.phase === 'running',
    guided ? settings.breathPattern : null,
  );

  const handleStart = useCallback(() => {
    /* The click is the user gesture that unlocks audio — see useBell.prime.
       The opening strike rides on that same gesture, and is softer than the
       closing one: it marks a beginning rather than calling you back. */
    if (settings.startBell) bell.preview(sound, 0.7);
    else bell.prime();
    engine.start();
  }, [bell, engine, settings.startBell, sound]);

  /* Resuming is not a beginning — no strike, just make sure audio stays open. */
  const handleResume = useCallback(() => {
    bell.prime();
    engine.resume();
  }, [bell, engine]);

  const handlePickBell = useCallback((next: TimerEndSound) => {
    setSound(next);
    /* Tapping a bowl is a gesture, so it can both unlock audio and preview.
       Silent has nothing to play, but still prime — the viewer may switch back
       to a bowl later, and by then the gesture is gone. */
    if (next === 'none') bell.prime();
    else bell.preview(next);
  }, [bell]);

  const label = useMemo(() => {
    if (engine.phase === 'finished') return 'complete';
    if (engine.phase === 'paused') return 'paused';
    if (engine.phase === 'running') return guided ? SEGMENT_LABEL[segment] : 'session';
    return guided ? 'breathe' : 'meditation';
  }, [engine.phase, guided, segment]);

  const activeMinutes = Math.round(engine.durationMs / MIN_PER_MS);
  const isIdle = engine.phase === 'idle';

  return (
    <TimerSurface
      $radius={settings.borderRadius}
      $showBorder={settings.showBorder}
      $borderColor={`${material}3D`}
      $transparent={transparent}
      $plainBg={settings.backgroundColor}
    >
      {isPlain ? null : (
        <>
          <BreathLayer ref={surfaceRef} $field={bg.field} />
          <GrainLayer />
        </>
      )}

      <TimerContent $spread={isIdle}>
        <ClockBlock>
          {settings.showTimeLeft ? (
            <TimeDisplay $color={ink} $dim={engine.phase === 'paused'}>
              {formatTime(engine.remainingMs)}
            </TimeDisplay>
          ) : null}

          <PhaseLabel $color={ink}>{label}</PhaseLabel>

          {isIdle ? null : (
            <ProgressTrack $color={ink}>
              <ProgressFill $color={ink} $percent={engine.progress * 100} />
            </ProgressTrack>
          )}

        </ClockBlock>

        <ActionBlock $gapTop={isIdle ? 0 : 11}>
          {isIdle ? (
            <>
              <FieldGroup $gapTop={0}>
                <FieldLabel $color={ink}>Time</FieldLabel>
                <SegmentTrough>
                  {DURATION_PRESETS.map(min => (
                    <Segment
                      key={min}
                      type="button"
                      $active={min === activeMinutes}
                      $ink={onMaterial}
                      $material={material}
                      onClick={() => engine.setDuration(min * MIN_PER_MS)}
                    >
                      {min}m
                    </Segment>
                  ))}
                </SegmentTrough>
              </FieldGroup>

              <FieldGroup $gapTop={12} $trimPx={4}>
                <FieldLabel $color={ink}>Bowl</FieldLabel>
                <SegmentTrough>
                  {BELL_CHOICES.map(({ value, label: bellLabel }) => (
                    <Segment
                      key={value}
                      type="button"
                      $active={value === sound}
                      $ink={onMaterial}
                      $material={material}
                      onClick={() => handlePickBell(value)}
                    >
                      {bellLabel}
                    </Segment>
                  ))}
                </SegmentTrough>
              </FieldGroup>
            </>
          ) : null}

          <ControlRow $gapTop={isIdle ? 13 : 0}>
            {isIdle ? (
              <ControlButton type="button" $ink={onMaterial} $material={material} $filled onClick={handleStart}>
                <Play size={14} fill="currentColor" strokeWidth={3} strokeLinejoin="round" />
                Begin
              </ControlButton>
            ) : null}

            {engine.phase === 'running' ? (
              <ControlButton type="button" $ink={onMaterial} $material={material} $filled onClick={engine.pause}>
                <Pause size={14} fill="currentColor" strokeWidth={3} strokeLinejoin="round" />
                Pause
              </ControlButton>
            ) : null}

            {engine.phase === 'paused' ? (
              <>
                <ControlButton type="button" $ink={onMaterial} $material={material} onClick={engine.reset}>
                  <RotateCcw size={14} strokeWidth={2} />
                  Reset
                </ControlButton>
                <ControlButton type="button" $ink={onMaterial} $material={material} $filled onClick={handleResume}>
                  <Play size={14} fill="currentColor" strokeWidth={3} strokeLinejoin="round" />
                  Resume
                </ControlButton>
              </>
            ) : null}

            {engine.phase === 'finished' ? (
              <ControlButton type="button" $ink={onMaterial} $material={material} $filled onClick={engine.reset}>
                <RotateCcw size={14} strokeWidth={2} />
                Again
              </ControlButton>
            ) : null}
          </ControlRow>
        </ActionBlock>
      </TimerContent>
    </TimerSurface>
  );
};
