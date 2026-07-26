import { Logger } from '../Logger';

// Компактный кодек для минимальных URL
export class CompactUrlCodec {
  // Карта сокращений для экономии байтов
  private static readonly FIELD_MAP = {
    // Общие поля (1 символ)
    primaryColor: 'p',
    backgroundColor: 'b',
    accentColor: 'a',
    opacity: 'o',
    borderRadius: 'r',
    showBorder: 's',
    style: 't',

    // Calendar специфичные (c+символ)
    defaultView: 'cv',
    showWeekends: 'cw',
    weekStart: 'cs',

    // Clock специфичные (k+символ)
    showSeconds: 'ks',
    format24h: 'kf',
    showDate: 'kd',
    fontSize: 'kz',
    clockFrame: 'kc',

    // Embed size
    embedWidth: 'ew',
    embedHeight: 'eh',

    // Theme
    theme: 'tm',

    // Board специфичные (bi, bl, bc, bg)
    imageUrls: 'bi',
    layout: 'bl',
    columns: 'bc',
    gap: 'bg',

    // Timer специфичные (m+символ). NB: new string values must be 2+ chars —
    // decode() expands single letters through a table shared by all fields.
    durationMin: 'md',
    intervalBellMin: 'mi',
    endSound: 'ms',
    breathPattern: 'mp',
    showTimeLeft: 'mt',
    bgPreset: 'mb',

    // Weather специфичные (w+символ)
    temperatureUnit: 'wu',
    showFeelsLike: 'wf',
    showHumidity: 'wh',
    location: 'wl',
  } as const;

  // Обратная карта для декодирования
  private static readonly REVERSE_MAP = Object.fromEntries(
    Object.entries(CompactUrlCodec.FIELD_MAP).map(([k, v]) => [v, k])
  );

  // Дефолтные значения - не включаем в URL если они равны дефолту
  private static readonly DEFAULTS: Record<string, any> = {
    primaryColor: '#667EEA',
    backgroundColor: '#ffffff',
    accentColor: '#f1f5f9',
    opacity: 1,
    borderRadius: 12,
    showBorder: true,

    // Calendar
    defaultView: 'month',
    showWeekends: true,
    weekStart: 'monday',
    // Note: `style` has no default here — it differs per widget type
    // (calendar: 'modern-grid', clock: 'modern'), so it's always encoded

    // Clock
    showSeconds: true,
    format24h: true,
    showDate: true,
    fontSize: 'medium',

    // Weather
    temperatureUnit: 'celsius',
    showFeelsLike: true,
    showHumidity: true,
    location: 'New York',

    // Board
    layout: 'grid',
    columns: 2,
    gap: 8,

    // Timer
    durationMin: 10,
    intervalBellMin: 0,
    endSound: 'bowl',
    breathPattern: 'coherent',
    showTimeLeft: true,
    bgPreset: 'sage',

    // Embed size (calendar defaults; clock overrides at decode)
    embedWidth: 420,
    embedHeight: 380,

    // Theme
    theme: 'auto',
  };

  /** Per-type embed box, used when the URL didn't encode one explicitly. */
  private static readonly EMBED_SIZE_DEFAULTS: Record<string, { width: number; height: number }> = {
    calendar: { width: 420, height: 380 },
    clock: { width: 360, height: 360 },
    board: { width: 420, height: 420 },
    timer: { width: 360, height: 540 },
  };

  // Цвета из палитры кодируем индексами (0-9, a-f для 16 цветов)
  private static readonly COLOR_PALETTE = [
    '#667EEA', '#764BA2', '#F093FB', '#F8BBD9', '#4FACFE',
    '#43E97B', '#FA709A', '#FEE140', '#A8E6CF', '#FFB199',
    '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#1E293B', '#0F172A'
  ];

  static encode(widgetType: string, settings: Record<string, any>): string {
    const compact: Record<string, any> = {};

    // Добавляем тип виджета одним символом
    const typeMap: Record<string, string> = { calendar: 'c', clock: 'k', weather: 'w', board: 'b', timer: 'm' };
    compact._ = typeMap[widgetType] || widgetType;

    // Обрабатываем каждое поле
    for (const [key, value] of Object.entries(settings)) {
      const shortKey = this.FIELD_MAP[key as keyof typeof this.FIELD_MAP];
      if (!shortKey) continue;

      // Пропускаем дефолтные значения
      if (this.DEFAULTS[key] === value) continue;

      // Массивы (например imageUrls) — кодируем как JSON
      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        compact[shortKey] = JSON.stringify(value);
        continue;
      }

      // Специальная обработка цветов
      if (key.includes('Color')) {
        const colorIndex = this.COLOR_PALETTE.indexOf(value);
        if (colorIndex !== -1) {
          compact[shortKey] = colorIndex.toString(16); // hex: 0-f
          continue;
        }
        // Если цвет не из палитры, храним как есть но без #
        compact[shortKey] = value.replace('#', '');
        continue;
      }

      // Булевы значения как 0/1
      if (typeof value === 'boolean') {
        compact[shortKey] = value ? '1' : '0';
        continue;
      }

      // Числа
      if (typeof value === 'number') {
        compact[shortKey] = value.toString();
        continue;
      }

      // Строки - сокращаем где возможно
      if (typeof value === 'string') {
        const stringShortcuts: Record<string, string> = {
          // Styles
          'detailed': 'd', 'compact': 'c', 'week': 'w',
          'digital': 'd', 'analog': 'a', 'world': 'w',
          'current': 'c', 'forecast': 'f', 'minimal': 'm',
          // Sizes
          'small': 's', 'medium': 'm', 'large': 'l',
          // Views
          'month': 'm', 'day': 'd',
          // Units
          'celsius': 'c', 'fahrenheit': 'f',
          // Theme
          'auto': 'A', 'light': 'L', 'dark': 'D',
        };

        compact[shortKey] = stringShortcuts[value] || value;
        continue;
      }

      compact[shortKey] = value;
    }

    // Сериализуем в минимальный JSON и кодируем в base64
    const json = JSON.stringify(compact);
    return btoa(json).replace(/[=]/g, ''); // Убираем padding символы
  }

  static decode(encoded: string): { widgetType: string; settings: Record<string, any> } | null {
    try {
      // Восстанавливаем padding если нужно
      const padded = encoded + '=='.slice(0, (4 - encoded.length % 4) % 4);
      const json = atob(padded);
      const compact = JSON.parse(json);

      // Восстанавливаем тип виджета
      const typeReverseMap: Record<string, string> = { c: 'calendar', k: 'clock', w: 'weather', b: 'board', m: 'timer' };
      const widgetType = typeReverseMap[compact._] || compact._;
      delete compact._;

      const settings: Record<string, any> = { ...this.DEFAULTS };

      /* DEFAULTS carries the CALENDAR embed box (420x380), so a widget that
         never encoded its own size would decode at calendar proportions —
         a square timer would then be scaled inside a 420x380 reference and
         render visibly off-centre. Apply the type's own default instead
         whenever the payload didn't carry 'ew'/'eh'. */
      const sizeDefault = this.EMBED_SIZE_DEFAULTS[widgetType];
      if (sizeDefault) {
        if (!('ew' in compact)) settings.embedWidth = sizeDefault.width;
        if (!('eh' in compact)) settings.embedHeight = sizeDefault.height;
      }

      // Восстанавливаем поля
      for (const [shortKey, value] of Object.entries(compact)) {
        const longKey = this.REVERSE_MAP[shortKey];
        if (!longKey) continue;

        // Восстанавливаем массивы (например imageUrls)
        if (typeof value === 'string' && value.startsWith('[')) {
          try {
            settings[longKey] = JSON.parse(value);
            continue;
          } catch { /* fall through */ }
        }

        // Восстанавливаем цвета
        if (longKey.includes('Color')) {
          if (typeof value === 'string' && value.length === 1) {
            // Это индекс из палитры
            const colorIndex = parseInt(value, 16);
            if (colorIndex < this.COLOR_PALETTE.length) {
              settings[longKey] = this.COLOR_PALETTE[colorIndex];
              continue;
            }
          }
          // Это hex цвет без #
          settings[longKey] = '#' + value;
          continue;
        }

        // Восстанавливаем булевы
        if (value === '1') {
          settings[longKey] = true;
          continue;
        }
        if (value === '0') {
          settings[longKey] = false;
          continue;
        }

        // Восстанавливаем числа
        if (!isNaN(Number(value))) {
          settings[longKey] = Number(value);
          continue;
        }

        // Восстанавливаем строки из сокращений
        if (typeof value === 'string') {
          const stringExpansions: Record<string, string> = {
            // Styles
            'd': longKey.includes('style') ? 'detailed' : longKey.includes('format') ? 'digital' : 'day',
            'c': longKey.includes('style') ? 'compact' : longKey.includes('format') ? 'current' : 'celsius',
            'w': longKey.includes('style') ? 'week' : 'world',
            'a': 'analog', 'f': longKey.includes('Unit') ? 'fahrenheit' : 'forecast',
            'm': longKey.includes('Size') ? 'medium' : longKey.includes('style') ? 'minimal' : 'month',
            // Sizes
            's': 'small', 'l': 'large',
            // Theme
            'A': 'auto', 'L': 'light', 'D': 'dark',
          };

          settings[longKey] = stringExpansions[value] || value;
          continue;
        }

        settings[longKey] = value;
      }

      return { widgetType, settings };
    } catch (error) {
      Logger.error('CompactUrlCodec', 'Failed to decode compact URL', error);
      return null;
    }
  }

  // Создает супер короткую ссылку. publicId (если передан) добавляется
  // отдельным URL-параметром &i=, чтобы embed-страница могла прочитать его
  // без декодирования base64.
  static createCompactEmbedUrl(
    baseUrl: string,
    widgetType: string,
    settings: Record<string, any>,
    publicId?: string | null
  ): string {
    const encoded = this.encode(widgetType, settings);
    const route = `/embed/${widgetType}`;
    const idSuffix = publicId ? `&i=${encodeURIComponent(publicId)}` : '';
    return `${baseUrl}${route}?c=${encoded}${idSuffix}`;
  }

  // Извлекает настройки из компактного URL
  static extractFromCompactUrl(url?: string): { widgetType: string; settings: Record<string, any> } | null {
    try {
      const urlObj = new URL(url || window.location.href);
      const compactParam = urlObj.searchParams.get('c'); // 'c' вместо 'config'

      if (!compactParam) {
        return null;
      }

      return this.decode(compactParam);
    } catch (error) {
      return null;
    }
  }

  // Извлекает publicId из &i=. Возвращает null если параметра нет (значит,
  // это legacy URL без привязки к Supabase — рендерим только из ?c=).
  static extractPublicId(url?: string): string | null {
    try {
      const urlObj = new URL(url || window.location.href);
      return urlObj.searchParams.get('i');
    } catch {
      return null;
    }
  }
} 