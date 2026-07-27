import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Widget } from '../../domain/entities/Widget';
import {
  TimerSettings,
  TimerBgPreset,
  TimerEndSound,
} from '../../domain/value-objects/TimerSettings';
import { WidgetRepositoryImpl } from '../../infrastructure/repositories/WidgetRepositoryImpl';
import { TimerWidget } from '../components/widgets/TimerWidget';
import { TIMER_BACKGROUNDS } from '../components/widgets/timer/backgroundPresets';
import { BELL_CHOICES } from '../components/widgets/timer/useBell';
import { Button, CopyButton, FilterChip, FilterRow, Input, Switch } from '../components/shared';

/**
 * Lab — unreleased work.
 *
 * Widgets that exist in the build but are deliberately not surfaced anywhere a
 * user can reach them. This page is the ONLY place in the product that links to
 * them, and it is itself unlinked from the site chrome.
 *
 * Deliberately NOT part of `/dev`: that page documents the shipped design
 * system, and mixing "this is what we have" with "this isn't out yet" makes
 * both harder to trust.
 *
 * Each entry is one configurable widget, not a list of hard-coded example URLs
 * — the settings below drive a live preview and produce the embed link through
 * the same repository the real Studio uses, so the URL here is byte-identical
 * to one a customer would get.
 */

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[6]};
  font-family: ${({ theme }) => theme.typography.fonts.primary};
`;

const Inner = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Kicker = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Title = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.sizes['4xl']};
  font-weight: 600;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Caveat = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[10]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.background.surfaceMuted};
  border-left: 3px solid ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.body};
  max-width: 720px;
`;

const Entry = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 340px) 1fr;
  gap: ${({ theme }) => theme.spacing[10]};
  align-items: start;
  padding: ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;

const PreviewPane = styled.div`
  display: flex;
  justify-content: center;
`;

const EntryTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EntryNote = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.body};
`;

const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const FieldLabel = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FieldValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-variant-numeric: tabular-nums;
`;

const Range = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.brand.indigoDark};
  cursor: pointer;
`;

/* The label text must be ONE flex item — an inline <code> inside it would
   otherwise become a sibling of the text and get spread apart by
   space-between. Hence the <span> wrapper at every call site. */
const SwitchRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
`;

const UrlBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing[6]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const UrlText = styled.code`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.body};
  word-break: break-all;
`;

const UrlActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
  flex-wrap: wrap;
`;

const INTERVAL_OPTIONS = [0, 3, 5, 10];

/* A pin PAGE is text/html — an <img> can never render it. Only the CDN image
   URL behind the pin works, which is what "Copy image address" yields. */
const PIN_PAGE = /pinterest\.[a-z.]+\/pin\//i;

const Hint = styled.p<{ $warn?: boolean }>`
  margin: ${({ theme }) => theme.spacing[2]} 0 0;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  line-height: 1.5;
  color: ${({ theme, $warn }) => ($warn ? theme.colors.danger.soft : theme.colors.text.tertiary)};
`;

export const LabPage: React.FC = () => {
  const [durationMin, setDurationMin] = useState(10);
  const [intervalBellMin, setIntervalBellMin] = useState(0);
  const [endSound, setEndSound] = useState<TimerEndSound>('bowl');
  const [bgPreset, setBgPreset] = useState<TimerBgPreset>('sage');
  const [showTimeLeft, setShowTimeLeft] = useState(true);
  const [startBell, setStartBell] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [glassBlur, setGlassBlur] = useState(16);

  const settings = useMemo(
    () => new TimerSettings({
      durationMin, intervalBellMin, endSound, bgPreset, showTimeLeft, startBell,
      bgImageUrl: bgImageUrl.trim(), glassBlur,
    }),
    [durationMin, intervalBellMin, endSound, bgPreset, showTimeLeft, startBell, bgImageUrl, glassBlur],
  );

  /* Built through the same repository the Studio uses, so this link is
     byte-identical to one a customer would be given — including the base-URL
     whitespace guard that keeps Notion's paste from breaking. */
  const url = useMemo(() => {
    const repo = new WidgetRepositoryImpl();
    const base = repo.saveToUrl(Widget.createTimer('lab-timer', settings));
    return transparent ? `${base}${base.includes('?') ? '&' : '?'}nobg` : base;
  }, [settings, transparent]);

  /* Remounting on preset change restarts the widget's own runtime state, so the
     preview always reflects the settings rather than a half-finished session. */
  const previewKey = `${bgPreset}-${showTimeLeft}-${transparent}-${startBell}-${bgImageUrl}`;

  return (
    <Page>
      <Inner>
        <Kicker>Internal</Kicker>
        <Title>Lab</Title>
        <Caveat>
          <strong>Unlisted, not private.</strong> Embed routes cannot be
          auth-gated — Notion loads them anonymously inside a sandboxed iframe
          with no session, so any gate would break every embed including your
          own. Everything here is reachable by anyone holding the URL. What
          &ldquo;hidden&rdquo; buys us is that nothing in the product links to
          it: no Studio wiring, no gallery card, no style picker entry. This
          page is itself unlinked from the site chrome.
        </Caveat>

        <Entry>
          <PreviewPane>
            <TimerWidget
              key={previewKey}
              widget={Widget.createTimer('lab-timer', settings)}
              transparent={transparent}
            />
          </PreviewPane>

          <div>
            <EntryTitle>Meditation timer</EntryTitle>
            <EntryNote>
              Built and deployed; no Studio wiring yet. The <code>breathe</code>{' '}
              style is parked and not offered here. Full notes in{' '}
              <code>TIMER_WIDGET_PLAN.md</code>.
            </EntryNote>

            <Field>
              <FieldLabel>
                Duration
                <FieldValue>{durationMin} min</FieldValue>
              </FieldLabel>
              <Range
                type="range"
                min={1}
                max={60}
                step={1}
                value={durationMin}
                onChange={e => setDurationMin(Number(e.target.value))}
              />
            </Field>

            <Field>
              <FieldLabel>Interval bell</FieldLabel>
              <FilterRow>
                {INTERVAL_OPTIONS.map(min => (
                  <FilterChip
                    key={min}
                    type="button"
                    $active={min === intervalBellMin}
                    onClick={() => setIntervalBellMin(min)}
                  >
                    {min === 0 ? 'Off' : `every ${min}m`}
                  </FilterChip>
                ))}
              </FilterRow>
            </Field>

            <Field>
              <FieldLabel>Bowl</FieldLabel>
              <FilterRow>
                {BELL_CHOICES.map(({ value, label }) => (
                  <FilterChip
                    key={value}
                    type="button"
                    $active={value === endSound}
                    onClick={() => setEndSound(value)}
                  >
                    {label}
                  </FilterChip>
                ))}
              </FilterRow>
            </Field>

            <Field>
              <FieldLabel>Background photo</FieldLabel>
              <Input
                type="url"
                placeholder="https://… direct link to an image"
                value={bgImageUrl}
                onChange={e => setBgImageUrl(e.target.value)}
              />
              {PIN_PAGE.test(bgImageUrl) ? (
                <Hint $warn>
                  That is a Pinterest <em>page</em>, not an image — it returns HTML, so
                  nothing will render. Open the pin, right-click the picture and choose
                  &ldquo;Copy image address&rdquo; to get an <code>i.pinimg.com/…</code> link.
                </Hint>
              ) : (
                <Hint>
                  Must be a direct link to the image file. Some hosts refuse hotlinking —
                  if nothing appears, the widget quietly falls back to the gradient.
                </Hint>
              )}
            </Field>

            {bgImageUrl.trim() ? (
              <Field>
                <FieldLabel>
                  Frost over photo
                  <FieldValue>{glassBlur} px</FieldValue>
                </FieldLabel>
                <Range
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={glassBlur}
                  onChange={e => setGlassBlur(Number(e.target.value))}
                />
              </Field>
            ) : null}

            <Field>
              <FieldLabel>Gradient (used when no photo)</FieldLabel>
              <FilterRow>
                {(Object.keys(TIMER_BACKGROUNDS) as TimerBgPreset[]).map(preset => (
                  <FilterChip
                    key={preset}
                    type="button"
                    $active={preset === bgPreset}
                    onClick={() => setBgPreset(preset)}
                  >
                    {TIMER_BACKGROUNDS[preset].label}
                  </FilterChip>
                ))}
              </FilterRow>
            </Field>

            <SwitchRow>
              <span>Opening bell</span>
              <Switch
                checked={startBell}
                onChange={setStartBell}
                aria-label="Ring once when the session starts"
              />
            </SwitchRow>

            <SwitchRow>
              <span>Show remaining time</span>
              <Switch
                checked={showTimeLeft}
                onChange={setShowTimeLeft}
                aria-label="Show remaining time"
              />
            </SwitchRow>

            <SwitchRow>
              <span>
                Transparent background (<code>?nobg</code>)
              </span>
              <Switch
                checked={transparent}
                onChange={setTransparent}
                aria-label="Transparent background"
              />
            </SwitchRow>

            <UrlBox>
              <UrlText>{url}</UrlText>
              <UrlActions>
                <CopyButton value={url} label="Copy embed link" $iconOnly={false} />
                <Button
                  as="a"
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  $variant="outline"
                  $size="sm"
                >
                  Open
                </Button>
              </UrlActions>
            </UrlBox>
          </div>
        </Entry>
      </Inner>
    </Page>
  );
};
