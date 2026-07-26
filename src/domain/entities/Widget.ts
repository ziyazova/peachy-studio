// Domain Entity
export class Widget {
  public constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly settings: any
  ) { }

  // Factory methods for different widget types
  static createCalendar(id: string, settings: any): Widget {
    return new Widget(id, 'calendar', settings);
  }

  static createClock(id: string, settings: any): Widget {
    return new Widget(id, 'clock', settings);
  }

  static createBoard(id: string, settings: any): Widget {
    return new Widget(id, 'board', settings);
  }

  static createTimer(id: string, settings: any): Widget {
    return new Widget(id, 'timer', settings);
  }

  updateSettings(newSettings: Record<string, any>): Widget {
    const mergedSettings = { ...this.settings, ...newSettings };
    return new Widget(this.id, this.type, mergedSettings);
  }

  getEmbedConfig(): Record<string, any> {
    return {
      widgetType: this.type,
      settings: this.settings,
    };
  }

  // Validation
  isValid(): boolean {
    return !!(this.id && this.type && this.settings);
  }

  // Serialization for URL embedding
  toEmbedData(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      settings: this.settings
    };
  }

  static fromEmbedData(data: Record<string, any>): Widget {
    return new Widget(data.id, data.type, data.settings);
  }
} 