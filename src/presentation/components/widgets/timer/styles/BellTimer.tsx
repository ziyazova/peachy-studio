import React from 'react';
import { TimerSettings } from '../../../../../domain/value-objects/TimerSettings';
import { TimerShell } from '../TimerShell';

interface BellTimerProps {
  settings: TimerSettings;
  transparent?: boolean;
  fill?: boolean;
}

/**
 * Plain meditation countdown. The surface keeps a slow, unguided 4-in / 4-out
 * ambience — alive, but not asking anyone to breathe along with it.
 */
export const BellTimer: React.FC<BellTimerProps> = ({ settings, transparent, fill }) => (
  <TimerShell settings={settings} guided={false} transparent={transparent} fill={fill} />
);
