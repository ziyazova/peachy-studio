import { Widget } from '../../domain/entities/Widget';
import { WidgetRepository } from '../../domain/repositories/WidgetRepository';
import { CalendarSettings } from '../../domain/value-objects/CalendarSettings';
import { ClockSettings } from '../../domain/value-objects/ClockSettings';
import { BoardSettings } from '../../domain/value-objects/BoardSettings';
import { TimerSettings } from '../../domain/value-objects/TimerSettings';
import { UrlCodecService } from '../services/url-codec/UrlCodecService';
import { Logger } from '../services/Logger';

// Infrastructure implementation of Widget Repository
export class WidgetRepositoryImpl implements WidgetRepository {
  private widgets: Map<string, Widget> = new Map();
  private urlCodec: UrlCodecService;

  constructor() {
    this.urlCodec = new UrlCodecService();
  }

  async save(widget: Widget): Promise<void> {
    this.widgets.set(widget.id, widget);
  }

  async findById(id: string): Promise<Widget | null> {
    return this.widgets.get(id) || null;
  }

  async findAll(): Promise<Widget[]> {
    return Array.from(this.widgets.values());
  }

  async delete(id: string): Promise<void> {
    this.widgets.delete(id);
  }

  // Использует новый компактный кодек для максимально коротких URL.
  // publicId опционален: добавляется в URL как &i= только если виджет
  // сохранён в Supabase. Эмбед-страница использует его для подтягивания
  // свежих настроек (live-update + soft-delete-aware).
  saveToUrl(widget: Widget, publicId?: string | null): string {
    const rawBase = import.meta.env.VITE_EMBED_BASE_URL || window.location.origin;
    // Strip whitespace (Vercel env-var pastes can carry trailing \n) + trailing slash.
    // Without this, a stray \n breaks Notion's "embed link" paste even though the
    // <input> visually hides it.
    const baseUrl = rawBase.replace(/\s+/g, '').replace(/\/+$/, '');
    return this.urlCodec.createSuperCompactUrl(baseUrl, widget.type, widget.settings, publicId);
  }

  loadFromUrl(url: string): Widget | null {
    const config = this.urlCodec.extractConfigFromUrl(url);

    if (!config) {
      return null;
    }

    try {
      const settings = config.settings || config;
      const widgetType = config.widgetType || this.inferTypeFromUrl(url);

      switch (widgetType) {
        case 'calendar':
          return Widget.createCalendar('url-calendar', new CalendarSettings(settings));
        case 'clock':
          return Widget.createClock('url-clock', new ClockSettings(settings));
        case 'board':
          return Widget.createBoard('url-board', new BoardSettings(settings));
        case 'timer':
          return Widget.createTimer('url-timer', new TimerSettings(settings));
        default:
          return null;
      }
    } catch (error) {
      Logger.error('WidgetRepository', 'Failed to create widget from URL config', error);
      return null;
    }
  }

  // Legacy методы для совместимости
  encodeConfig(config: Record<string, any>): string {
    if (config.widgetType) {
      return this.urlCodec.encodeCompact(config.widgetType, config.settings || config);
    }
    return this.urlCodec.encode(config);
  }

  decodeConfig(encoded: string): Record<string, any> | null {
    // Пробуем сначала компактный формат
    const compactResult = this.urlCodec.decodeCompact(encoded);
    if (compactResult) {
      return {
        widgetType: compactResult.widgetType,
        settings: compactResult.settings
      };
    }

    // Fallback на старый формат
    return this.urlCodec.decode(encoded);
  }

  private inferTypeFromUrl(url: string): string {
    if (url.includes('/embed/calendar')) return 'calendar';
    if (url.includes('/embed/clock')) return 'clock';
    if (url.includes('/embed/board')) return 'board';
    if (url.includes('/embed/timer')) return 'timer';
    return 'calendar'; // default
  }
} 