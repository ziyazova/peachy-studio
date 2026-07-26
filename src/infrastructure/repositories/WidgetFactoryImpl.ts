import { Widget } from '../../domain/entities/Widget';
import { WidgetFactory } from '../../domain/repositories/WidgetRepository';
import { CalendarSettings } from '../../domain/value-objects/CalendarSettings';
import { ClockSettings } from '../../domain/value-objects/ClockSettings';
import { BoardSettings } from '../../domain/value-objects/BoardSettings';
import { TimerSettings } from '../../domain/value-objects/TimerSettings';
import { Logger } from '../services/Logger';

export class WidgetFactoryImpl implements WidgetFactory {
  createWidget(type: string, settings?: Record<string, any>): Widget {
    switch (type) {
      case 'calendar':
        return Widget.createCalendar(
          this.generateId(),
          new CalendarSettings(settings)
        );
      case 'clock':
        return Widget.createClock(
          this.generateId(),
          new ClockSettings(settings)
        );
      case 'board':
        return Widget.createBoard(
          this.generateId(),
          new BoardSettings(settings)
        );
      case 'timer':
        return Widget.createTimer(
          this.generateId(),
          new TimerSettings(settings)
        );
      default:
        throw new Error(`Unsupported widget type: ${type}`);
    }
  }

  getDefaultSettings(type: string): Record<string, any> {
    switch (type) {
      case 'calendar':
        return {
          primaryColor: '#667EEA',
          backgroundColor: '#FFFFFF',
          accentColor: '#F1F5F9',
          defaultView: 'month',
          showWeekends: true,
          borderRadius: 12,
          showBorder: true,
          style: 'modern-grid',
        };
      case 'clock':
        return {
          primaryColor: '#667EEA',
          backgroundColor: '#FFFFFF',
          accentColor: '#F1F5F9',
          showSeconds: true,
          format24h: true,
          borderRadius: 12,
          showBorder: true,
          showDate: true,
          fontSize: 'medium',
          style: 'modern',
        };
      case 'board':
        return {
          primaryColor: '#667EEA',
          backgroundColor: '#FFFFFF',
          accentColor: '#F1F5F9',
          borderRadius: 12,
          showBorder: true,
          imageUrls: [],
          layout: 'grid',
          columns: 2,
          gap: 8,
        };
      case 'timer':
        return {
          primaryColor: '#667EEA',
          backgroundColor: '#FFFFFF',
          accentColor: '#F1F5F9',
          borderRadius: 12,
          showBorder: false,
          style: 'bell',
          bgPreset: 'sage',
          durationMin: 10,
          intervalBellMin: 0,
          endSound: 'bowl',
          breathPattern: 'coherent',
          showTimeLeft: true,
        };
      default:
        return {};
    }
  }

  getSupportedTypes(): string[] {
    return ['calendar', 'clock', 'board', 'timer'];
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  // Static method for creating widget from embed config
  static createFromEmbedConfig(config: Record<string, any>): Widget | null {
    try {
      const factory = new WidgetFactoryImpl();
      return factory.createWidget(config.widgetType, config.settings);
    } catch (error) {
      Logger.error('WidgetFactory', 'Failed to create widget from embed config', error);
      return null;
    }
  }
} 