import React, { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Logger } from '../../infrastructure/services/Logger';
import { TimerWidget } from '../components/widgets/TimerWidget';
import { EmbedScaleWrapper } from '../components/embed/EmbedScaleWrapper';
import { WidgetUnavailable } from '../components/embed/WidgetUnavailable';
import { Widget } from '../../domain/entities/Widget';
import { TimerSettings } from '../../domain/value-objects/TimerSettings';
import { UrlCodecService } from '../../infrastructure/services/url-codec/UrlCodecService';
import { EmbedController } from './EmbedController';
import { useResolvedTheme, NOTION_DARK_BG } from '../hooks/useResolvedTheme';
import { usePublicWidgetSync } from '../hooks/usePublicWidgetSync';

const GlobalEmbedStyles = createGlobalStyle<{ $bgColor: string }>`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: ${({ $bgColor }) => $bgColor};
  }
  #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  * {
    box-sizing: border-box;
  }
  body {
    touch-action: manipulation;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
`;

const EmbedContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
`;

const LoadingState = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #8FA97C;
  font-size: 13px;
`;

const ErrorState = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #ef4444;
  text-align: center;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: #fef2f2;
  border: 1px solid #fecaca;
  max-width: 400px;
`;

export const TimerEmbedPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlSettings, setUrlSettings] = useState<TimerSettings>(new TimerSettings());

  const publicId = useMemo(() => {
    const codec = new UrlCodecService();
    return codec.extractPublicId();
  }, []);

  useEffect(() => {
    try {
      const codecService = new UrlCodecService();
      const config = codecService.extractConfigFromUrl();

      Logger.info('TimerEmbed', 'Parsing URL config', { config, publicId });

      if (config) {
        if (config.widgetType === 'timer' || !config.widgetType) {
          const s = new TimerSettings(config.settings || config);
          setUrlSettings(s);
          Logger.info('TimerEmbed', 'Loaded settings', {
            style: s.style,
            bgPreset: s.bgPreset,
            durationMin: s.durationMin,
            embedWidth: s.embedWidth,
            embedHeight: s.embedHeight,
          });
        } else {
          throw new Error('Invalid timer widget configuration');
        }
      } else {
        setUrlSettings(new TimerSettings());
      }
    } catch (err) {
      Logger.error('TimerEmbed', 'Failed to load timer widget', err);
      setError('Failed to load timer widget configuration');
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  const { liveSettings, unavailable } = usePublicWidgetSync(publicId);

  /* Live settings (from Supabase) override URL settings once the RPC returns;
     otherwise the page renders from the URL — a Supabase outage degrades to
     "frozen settings" rather than a broken iframe. A duration change arriving
     mid-session is handled inside useTimerEngine: it's only adopted while the
     timer is idle, so nobody's running session gets yanked. */
  const effectiveSettings = unavailable
    ? null
    : (liveSettings ? new TimerSettings(liveSettings) : urlSettings);
  const widget = effectiveSettings
    ? Widget.createTimer('embed-timer', effectiveSettings)
    : null;

  const notionTheme = useResolvedTheme('auto');
  const isTransparent = new URLSearchParams(window.location.search).has('nobg');
  const containerBg = isTransparent ? 'transparent' : (notionTheme === 'dark' ? NOTION_DARK_BG : '#ffffff');

  if (loading) {
    return (
      <EmbedController>
        <GlobalEmbedStyles $bgColor={containerBg} />
        <EmbedContainer>
          <EmbedScaleWrapper>
            <LoadingState>Loading timer...</LoadingState>
          </EmbedScaleWrapper>
        </EmbedContainer>
      </EmbedController>
    );
  }

  if (unavailable) {
    return (
      <EmbedController>
        <GlobalEmbedStyles $bgColor={containerBg} />
        <EmbedContainer>
          <EmbedScaleWrapper
            refWidth={urlSettings.embedWidth}
            refHeight={urlSettings.embedHeight}
          >
            <WidgetUnavailable />
          </EmbedScaleWrapper>
        </EmbedContainer>
      </EmbedController>
    );
  }

  if (error || !widget || !effectiveSettings) {
    return (
      <EmbedController>
        <GlobalEmbedStyles $bgColor={containerBg} />
        <EmbedContainer>
          <EmbedScaleWrapper>
            <ErrorState>
              <h3>Error</h3>
              <p>{error || 'Failed to load timer widget'}</p>
            </ErrorState>
          </EmbedScaleWrapper>
        </EmbedContainer>
      </EmbedController>
    );
  }

  return (
    <EmbedController>
      <GlobalEmbedStyles $bgColor={containerBg} />
      <EmbedContainer>
        <EmbedScaleWrapper
          refWidth={effectiveSettings.embedWidth}
          refHeight={effectiveSettings.embedHeight}
        >
          <TimerWidget widget={widget} transparent={isTransparent} />
        </EmbedScaleWrapper>
      </EmbedContainer>
    </EmbedController>
  );
};
