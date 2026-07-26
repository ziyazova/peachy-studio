import { describe, it, expect } from 'vitest';
import { CompactUrlCodec } from '../infrastructure/services/url-codec/CompactUrlCodec';
import { TimerSettings } from '../domain/value-objects/TimerSettings';

/**
 * Guards the two ways the compact codec silently corrupts new string settings:
 *
 *  1. `decode()` runs `Number(value)` before consulting string expansions, so a
 *     numeric-looking value like '478' would come back as the NUMBER 478. This
 *     is why the 4-7-8 breathing pattern is named `relax`.
 *  2. Single-letter values are remapped through a table shared by every field
 *     ('m' → 'month'/'medium', 's' → 'small', 'D' → 'dark', …), so every timer
 *     value must be at least two characters.
 */
describe('[SMOKE] timer URL codec', () => {
  it('round-trips a timer through encode → decode', () => {
    const settings = new TimerSettings({
      style: 'breathe',
      bgPreset: 'sage',
      durationMin: 15,
      intervalBellMin: 5,
      endSound: 'temple',
      breathPattern: 'relax',
      showTimeLeft: false,
    });

    const encoded = CompactUrlCodec.encode('timer', JSON.parse(settings.toJson()));
    const decoded = CompactUrlCodec.decode(encoded);

    console.log('[SMOKE] encoded timer URL length:', encoded.length);

    expect(decoded).not.toBeNull();
    expect(decoded!.widgetType).toBe('timer');

    const back = new TimerSettings(decoded!.settings);
    expect(back.style).toBe('breathe');
    expect(back.durationMin).toBe(15);
    expect(back.intervalBellMin).toBe(5);
    expect(back.endSound).toBe('temple');
    expect(back.showTimeLeft).toBe(false);
  });

  it('keeps breathPattern a string — "relax" must not become a number', () => {
    const encoded = CompactUrlCodec.encode('timer', { style: 'breathe', breathPattern: 'relax' });
    const decoded = CompactUrlCodec.decode(encoded);
    expect(typeof decoded!.settings.breathPattern).toBe('string');
    expect(decoded!.settings.breathPattern).toBe('relax');
  });

  it('keeps bgPreset intact through the single-letter expansion table', () => {
    const encoded = CompactUrlCodec.encode('timer', { style: 'bell', bgPreset: 'plain' });
    const decoded = CompactUrlCodec.decode(encoded);
    expect(decoded!.settings.bgPreset).toBe('plain');
  });

  it('returns durationMin as a number', () => {
    const encoded = CompactUrlCodec.encode('timer', { style: 'bell', durationMin: 20 });
    const decoded = CompactUrlCodec.decode(encoded);
    expect(typeof decoded!.settings.durationMin).toBe('number');
    expect(decoded!.settings.durationMin).toBe(20);
  });

  it('omits defaults from the URL to keep it short', () => {
    const bare = CompactUrlCodec.encode('timer', { style: 'bell', durationMin: 10 });
    const custom = CompactUrlCodec.encode('timer', { style: 'bell', durationMin: 45 });
    console.log('[SMOKE] default-duration length:', bare.length, 'custom-duration length:', custom.length);
    expect(bare.length).toBeLessThan(custom.length);
  });
});
