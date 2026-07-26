export type TimerStyle = 'bell' | 'breathe';
export type TimerBgPreset = 'sage' | 'plain';
export type TimerEndSound = 'bowl' | 'temple' | 'crystal' | 'none';
export type TimerBreathPattern = 'coherent' | 'box' | 'relax';

/**
 * Configuration for the meditation timer widget.
 *
 * Holds only what the OWNER picks in Studio and what travels in the embed URL.
 * The running/paused countdown state is per-viewer runtime state and lives in
 * `useTimerEngine` — never here, never in the URL.
 *
 * `durationMin` is the DEFAULT session length; the in-widget preset chips
 * override it at runtime without writing back to settings.
 */
export class TimerSettings {
  public readonly primaryColor: string;
  public readonly backgroundColor: string;
  public readonly accentColor: string;
  public readonly borderRadius: number;
  public readonly showBorder: boolean;
  public readonly embedWidth: number;
  public readonly embedHeight: number;
  public readonly theme: 'auto' | 'light' | 'dark';

  public readonly style: TimerStyle;
  public readonly bgPreset: TimerBgPreset;
  public readonly durationMin: number;
  public readonly intervalBellMin: number;
  public readonly endSound: TimerEndSound;
  public readonly breathPattern: TimerBreathPattern;
  public readonly showTimeLeft: boolean;

  constructor(settings: Partial<TimerSettings> = {}) {
    this.primaryColor = settings.primaryColor || '#667EEA';
    this.backgroundColor = settings.backgroundColor || '#ffffff';
    this.accentColor = settings.accentColor || '#f1f5f9';
    /* Larger than the 12 other widgets default to: the glass panel inside sits
       at ~34px, and a tighter outer corner reads as inverted. */
    this.borderRadius = settings.borderRadius ?? 28;
    this.showBorder = settings.showBorder ?? false;
    this.embedWidth = settings.embedWidth ?? 360;
    /* Portrait, phone-ish. A square card left the controls cramped against the
       time once the bell picker and progress bar arrived. */
    this.embedHeight = settings.embedHeight ?? 540;
    this.theme = settings.theme || 'auto';

    this.style = settings.style || 'bell';
    this.bgPreset = settings.bgPreset || 'sage';
    this.durationMin = settings.durationMin ?? 10;
    this.intervalBellMin = settings.intervalBellMin ?? 0;
    this.endSound = settings.endSound || 'bowl';
    this.breathPattern = settings.breathPattern || 'coherent';
    this.showTimeLeft = settings.showTimeLeft ?? true;
  }

  public static fromJson(json: string): TimerSettings {
    try {
      const data = JSON.parse(json);
      return new TimerSettings(data);
    } catch {
      return new TimerSettings();
    }
  }

  public toJson(): string {
    return JSON.stringify({
      primaryColor: this.primaryColor,
      backgroundColor: this.backgroundColor,
      accentColor: this.accentColor,
      borderRadius: this.borderRadius,
      showBorder: this.showBorder,
      embedWidth: this.embedWidth,
      embedHeight: this.embedHeight,
      theme: this.theme,
      style: this.style,
      bgPreset: this.bgPreset,
      durationMin: this.durationMin,
      intervalBellMin: this.intervalBellMin,
      endSound: this.endSound,
      breathPattern: this.breathPattern,
      showTimeLeft: this.showTimeLeft,
    });
  }

  public update(changes: Partial<TimerSettings>): TimerSettings {
    return new TimerSettings({
      primaryColor: changes.primaryColor ?? this.primaryColor,
      backgroundColor: changes.backgroundColor ?? this.backgroundColor,
      accentColor: changes.accentColor ?? this.accentColor,
      borderRadius: changes.borderRadius ?? this.borderRadius,
      showBorder: changes.showBorder ?? this.showBorder,
      embedWidth: changes.embedWidth ?? this.embedWidth,
      embedHeight: changes.embedHeight ?? this.embedHeight,
      theme: changes.theme ?? this.theme,
      style: changes.style ?? this.style,
      bgPreset: changes.bgPreset ?? this.bgPreset,
      durationMin: changes.durationMin ?? this.durationMin,
      intervalBellMin: changes.intervalBellMin ?? this.intervalBellMin,
      endSound: changes.endSound ?? this.endSound,
      breathPattern: changes.breathPattern ?? this.breathPattern,
      showTimeLeft: changes.showTimeLeft ?? this.showTimeLeft,
    });
  }
}
