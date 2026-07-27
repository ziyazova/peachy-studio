import React from 'react';
import { Widget } from '../../../domain/entities/Widget';
import { TimerSettings } from '../../../domain/value-objects/TimerSettings';
import { BellTimer } from './timer/styles/BellTimer';
import { BreatheTimer } from './timer/styles/BreatheTimer';

/**
 * NOTE: the `breathe` style is PARKED (owner's call, Jul 2026). It still works
 * if a URL asks for it, but it isn't offered anywhere in the UI and isn't being
 * developed further — the guided pacing didn't feel right and needs a rethink.
 * `bell` is the shipping style.
 */
interface TimerWidgetProps {
  widget: Widget;
  transparent?: boolean;
  fill?: boolean;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ widget, transparent, fill }) => {
  const settings = widget.settings as TimerSettings;

  switch (settings.style) {
    case 'breathe':
      return <BreatheTimer settings={settings} transparent={transparent} fill={fill} />;
    case 'bell':
    default:
      return <BellTimer settings={settings} transparent={transparent} fill={fill} />;
  }
};
