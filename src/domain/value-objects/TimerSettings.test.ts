import { describe, it, expect } from 'vitest';
import { TimerSettings } from './TimerSettings';

describe('TimerSettings', () => {
  it('applies meditation defaults', () => {
    const s = new TimerSettings();
    expect(s.style).toBe('bell');
    expect(s.bgPreset).toBe('sage');
    expect(s.durationMin).toBe(10);
    expect(s.intervalBellMin).toBe(0);
    expect(s.endSound).toBe('bowl');
    expect(s.breathPattern).toBe('coherent');
    expect(s.showTimeLeft).toBe(true);
    expect(s.embedWidth).toBe(360);
    expect(s.embedHeight).toBe(540);
    expect(s.theme).toBe('auto');
  });

  it('honours explicit overrides', () => {
    const s = new TimerSettings({
      style: 'breathe',
      bgPreset: 'plain',
      durationMin: 20,
      intervalBellMin: 5,
      endSound: 'temple',
      breathPattern: 'relax',
      showTimeLeft: false,
    });
    expect(s.style).toBe('breathe');
    expect(s.bgPreset).toBe('plain');
    expect(s.durationMin).toBe(20);
    expect(s.intervalBellMin).toBe(5);
    expect(s.endSound).toBe('temple');
    expect(s.breathPattern).toBe('relax');
    expect(s.showTimeLeft).toBe(false);
  });

  it('keeps falsy-but-valid values instead of falling back to defaults', () => {
    // 0 means "interval bells off" and must survive the ?? guard.
    const s = new TimerSettings({ intervalBellMin: 0, showTimeLeft: false, borderRadius: 0 });
    expect(s.intervalBellMin).toBe(0);
    expect(s.showTimeLeft).toBe(false);
    expect(s.borderRadius).toBe(0);
  });

  it('is immutable — update() returns a new instance', () => {
    const a = new TimerSettings();
    const b = a.update({ durationMin: 15 });
    expect(a.durationMin).toBe(10);
    expect(b.durationMin).toBe(15);
    expect(b).not.toBe(a);
  });

  it('round-trips through JSON', () => {
    const a = new TimerSettings({
      style: 'breathe',
      breathPattern: 'box',
      durationMin: 15,
      intervalBellMin: 5,
      bgPreset: 'sage',
    });
    const b = TimerSettings.fromJson(a.toJson());
    expect(b.style).toBe('breathe');
    expect(b.breathPattern).toBe('box');
    expect(b.durationMin).toBe(15);
    expect(b.intervalBellMin).toBe(5);
    expect(b.bgPreset).toBe('sage');
  });

  it('falls back to defaults on malformed JSON', () => {
    const s = TimerSettings.fromJson('{ not json');
    expect(s.style).toBe('bell');
    expect(s.durationMin).toBe(10);
  });
});
