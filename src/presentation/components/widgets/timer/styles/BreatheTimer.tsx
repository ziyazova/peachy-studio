import React from 'react';
import { TimerSettings } from '../../../../../domain/value-objects/TimerSettings';
import { TimerShell } from '../TimerShell';

interface BreatheTimerProps {
  settings: TimerSettings;
  transparent?: boolean;
}

/**
 * PARKED — see TimerWidget. Reachable by URL, not offered in the UI.
 *
 * Guided breathing pacer. Same surface as BellTimer, but the breath follows the
 * chosen pattern (coherent / box / relax) and each phase is named.
 */
export const BreatheTimer: React.FC<BreatheTimerProps> = ({ settings, transparent }) => (
  <TimerShell settings={settings} guided transparent={transparent} />
);
