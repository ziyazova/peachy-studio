import { WebpImage } from '@/presentation/components/shared';
import React, { useState, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Calendar, Clock, Image, Pencil, Lock, Sparkle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { PageWrapper, FilterRow, FilterChip, SectionHeader, BackButton, Button as SharedButton, GoogleIcon, Modal, ModalFooter, Tag, PlanBadge, Label, LandingFooter } from '@/presentation/components/shared';
import { fadeUp } from '@/presentation/themes/animations';
import { BigFooter } from '@/presentation/components/landing/BigFooter';
import { CTASectionWrap, CTACard, CTATitle as MainCTATitle, CTASubtitle as MainCTASubtitle } from '@/presentation/components/landing/CTASection';
import { HowItWorksSection } from '@/presentation/components/landing/HowItWorksSection';
import { PinterestGallery } from '@/presentation/components/landing/PinterestGallery';
import { useAuth } from '@/presentation/context/AuthContext';
import { LoginModal } from '@/presentation/components/auth/LoginModal';
import { useUpgradeModal } from '@/presentation/context/UpgradeModalContext';
import { useWidgetQuota } from '@/presentation/hooks/useWidgetQuota';
import { useIsCompact, useIsPhone } from '@/presentation/hooks/useIsMobile';

const PageContent = styled.div<{ $hide?: boolean }>`
  opacity: ${({ $hide }) => $hide ? 0 : 1};
  transition: opacity 0.3s ease;
  pointer-events: ${({ $hide }) => $hide ? 'none' : 'auto'};
`;

/* Name-your-widget text input inside the shared <Modal>. Theme-driven so
   it matches SettingsPage modal inputs visually. */
const NameModalInput = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  outline: none;
  box-sizing: border-box;
  transition: border-color ${({ theme }) => theme.transitions.fast}, background ${({ theme }) => theme.transitions.fast};

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }
  &:focus,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

/* ── Hero Card ── */
const HeroCard = styled.div`
  max-width: 920px;
  margin: 8px auto 0;
  padding: 16px 48px 40px;
  text-align: center;
  /* Explicit flex column + horizontal center on desktop — text-align
   * alone wasn't centering block-level children (EmailRow / divider /
   * Google button) so the whole stack drifted slightly off the
   * surfaceAlt background's center. Per "отцентруй на дектсопе по
   * заливке". */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 3;
  animation: ${fadeUp} 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;

  @media (max-width: 900px) {
    /* Mobile — fully zeroed. HeroScene already provides the gutter (20)
     * horizontally and 30/30 vertical padding around the content; an
     * extra 24 here was just stacking on top of the section's bottom
     * 30. Last user note: "убери паддинг с контента hero, там есть
     * нижний отступ". */
    margin-top: 0;
    padding: 0;
  }
`;

const HeroInner = styled.div<{ $expanding?: boolean }>`
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 64px 48px;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, rgba(237, 228, 255, 0.5) 0%, rgba(232, 237, 255, 0.45) 25%, rgba(238, 234, 255, 0.4) 50%, rgba(245, 235, 250, 0.45) 75%, rgba(255, 240, 245, 0.5) 100%);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1.5px solid rgba(200, 195, 230, 0.3);
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  transform: ${({ $expanding }) => $expanding ? 'scale(0.97)' : 'scale(1)'};
  opacity: ${({ $expanding }) => $expanding ? 0 : 1};

  &:hover {
    transform: ${({ $expanding }) => $expanding ? 'scale(0.97)' : 'none'};
    border-color: rgba(200, 195, 230, 0.45);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Mobile — flatten the windowed-glass card so the hero looks 1:1
     * with the main landing's HeroSectionV2 (where there's no inner
     * card; content sits directly on the surfaceAlt band). Content
     * then aligns visually with title/sub/CTAs ergonomic of /. */
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: none;
    padding: 0;
    border-radius: 0;
  }
`;

const HeroIcons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;

  /* Mobile — hidden so the hero is structurally 1:1 with the main
   * landing's HeroSectionV2 (which has a single Eyebrow pill, no icon
   * row). On phones the floats are hidden too, so the icon-row's only
   * job (visual lead-in) isn't needed. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const HeroIcon = styled.div<{ $delay: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.radii.md};
    svg { width: 18px !important; height: 18px !important; }
  }
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${({ $delay }) => $delay} both;

  svg { width: 22px; height: 22px; color: ${({ theme }) => theme.colors.text.body}; }
`;

const HeroTitle = styled.h1`
  font-family: 'Inter', sans-serif;
  /* Sized to match the main landing's Headline 1:1 — clamp + tracking
   * + line-height all from Headline so both hero titles read as a
   * single voice across the site. */
  font-size: clamp(44px, 6vw, 84px);
  font-weight: 600;
  color: ${({ theme }) => theme.colors.peach.deep};
  letter-spacing: -0.03em;
  margin: 0;
  line-height: 1.2;

  /* Same hand-drawn organic circle around the emphasized word as the
   * main landing Headline em on / ("yours"). Single source of intent:
   * hero-emphasized words across both landings get the same peach
   * hand-circled treatment. */
  em {
    font-style: normal;
    font-weight: 600;
    position: relative;
    display: inline-block;
    isolation: isolate;
    color: ${({ theme }) => theme.colors.peach.deep};

    /* Same geometry as main landing Headline em (with the small width
     * trim), but coloured in the brand indigo (#6366F1 / rgb 99 102
     * 241) instead of peach — "пусть виджет выделяется не оранжевым,
     * а нашим индиго". Alphas mirror the original pattern (top muted,
     * sides/bottom stronger) for the hand-drawn pen-pressure look. */
    &::before {
      content: '';
      position: absolute;
      left: -0.07em;
      right: -0.03em;
      top: 8%;
      bottom: 2%;
      /* Alphas dropped (peaks 0.78/0.85 → 0.4/0.45) so indigo reads as
       * a pen-stroke, not a marker. Single base hue (#6366F1) on all
       * sides — no darker variant. */
      border: 2.5px solid rgba(99, 102, 241, 0.4);
      border-top-width: 1.5px;
      border-right-width: 3px;
      border-bottom-width: 3px;
      border-left-width: 2px;
      border-radius: 52% 48% 50% 50% / 55% 48% 52% 45%;
      transform: rotate(-10deg) scaleX(1.05) skewX(-5deg);
      z-index: -1;
      pointer-events: none;
      border-top-color: rgba(99, 102, 241, 0.25);
      border-left-color: rgba(99, 102, 241, 0.38);
      border-bottom-color: rgba(99, 102, 241, 0.45);
    }
  }

  /* Phone — 1:1 with main-landing Headline mobile spec
   * (44/700/1.05/-0.02em + text-wrap: balance). Title now reads
   * "Widgets your Notion is missing" — short enough that 44px wraps
   * cleanly in 2 lines at 375px.
   * Bottom margin 20 carries the gap to HeroDesc; HeroDesc mobile
   * margin-top is 0 so spacing comes from one side only. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Locked to spec: 44px / weight 700 / line-height 1.05 (≈46.2px) /
     * letter-spacing -0.02em (≈-0.88px). Stays the hero voice — sized
     * for impact, not for the smaller TemplatesPage section-title look. */
    font-size: 44px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.02em;
    text-wrap: balance;
    /* Hard cap 318 on phone — matches the Hero buttons cap so title
     * doesn't stretch on 414+ phones. Centered. Manual <br /> + the
     * mobile-only TitleBreakMobile still own the line breaks; the cap
     * just prevents over-stretch on big-phone viewports. */
    max-width: 318px;
    margin: 0 auto 20px;
  }
`;

/* Mobile-only line break inside the hero title. Desktop keeps its
 * single explicit <br /> (after "your") so the title reads as
 * "Widgets your | Notion is missing" — same break style as the main
 * landing's Headline. On phone we add ONE more break (after "Notion")
 * so the title reads as 3 short lines:
 *   Widgets your | Notion | is missing
 * Last user note: "примени стиль который в главном тайтле хиро". */
const TitleBreakMobile = styled.br`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const HeroDesc = styled.p`
  margin: 22px auto 32px;
  /* Desktop sizes['2xl'] (18). Mobile reverts to sizes.xl (16) below
   * to match phone-frozen sizing. */
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.peach.muted};
  line-height: 1.65;
  max-width: 440px;
  /* Letter-spacing aligned with main-landing Sub (−0.01em). Was
   * −0.005em which read marginally looser than the rest of the site's
   * body copy. Title stays at −0.02em mobile / −0.03em desktop, so
   * the title vs body contrast (tighter title, calmer body) is
   * preserved — just calibrated to the main landing's pair. */
  letter-spacing: -0.01em;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* 16/1.5 on phone. Hard cap 318 — matches Hero buttons + title cap
     * so subtitle doesn't stretch on big-phone viewports. Centered.
     * The line-break stays where the inline <br /> puts it. */
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    line-height: 1.5;
    max-width: 318px;
    margin: 0 auto 28px;
  }
`;

/* HeroButton — replaced by shared <Button $variant="primary" $size="xl" $fullWidth> */

const EmailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  /* Desktop 364 (iterated 380 → 372 → 364, two −8 trims). Mobile
   * keeps the original 380 (phone is frozen) via the @media md
   * override below. */
  max-width: 364px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Fixed 318 cap on phone — matches the main landing's HeroSectionV2
     * CTAs cap exactly. Buttons no longer stretch with viewport width.
     * Per "уменьши на 16 пикселей и зафиксируй на мобильной — пока в Hero". */
    max-width: 318px;
    padding: 0;
  }
`;

const EmailInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 18px;
  border: 1px solid rgba(26, 22, 19, 0.14);
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.peach.deep};
  background: #fff;
  outline: none;
  /* Kill mobile Safari/Chrome tap-highlight flash + any UA focus ring
   * the user reported as "яркая фиолето-синяя outline" on tap.
   * Per c_mosnxo87 — replace it with the soft border-color shift in
   * :focus below. */
  -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.005em;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 4px 12px rgba(26, 22, 19, 0.04);
  transition: border-color ${({ theme }) => theme.transitions.medium}, box-shadow ${({ theme }) => theme.transitions.medium};

  &::placeholder {
    color: ${({ theme }) => theme.colors.peach.hint};
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: rgba(26, 22, 19, 0.32);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 4px 14px rgba(26, 22, 19, 0.08);
  }
`;

const AuthDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  /* Aligned with EmailRow: desktop 364, mobile 334. */
  max-width: 364px;
  margin: 20px auto;
  color: ${({ theme }) => theme.colors.peach.hint};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.02em;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Fixed 318 cap to match EmailRow + main landing CTAs on phone. */
    max-width: 318px;
    padding: 0;
    /* Vertical margin trimmed 20 → 10 (each side) so the "or" rule
     * sits closer to the buttons above and below it. */
    margin: 10px auto;
  }

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(26, 22, 19, 0.08);
  }
`;

const CodeError = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.danger.soft};
  text-align: center;
  margin-top: 8px;
  font-weight: 500;
  letter-spacing: -0.01em;
`;

const AuthLoginHint = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  letter-spacing: -0.005em;
  /* Was 4 — bumped to 8 so the link sits clear of the Google CTA above
     (parent already has gap:8, total spacing reads ~16). */
  margin-top: 8px;
`;


/* ── Floating Widgets ── */
const float1 = keyframes`
  0%   { transform: translateX(0px) rotate(-5deg); }
  50%  { transform: translateX(8px) rotate(-2deg); }
  100% { transform: translateX(0px) rotate(-5deg); }
`;
const float2 = keyframes`
  0%   { transform: translateX(0px) rotate(6deg); }
  50%  { transform: translateX(-10px) rotate(3deg); }
  100% { transform: translateX(0px) rotate(6deg); }
`;
const float3 = keyframes`
  0%   { transform: translateX(5px) rotate(-4deg); }
  50%  { transform: translateX(-5px) rotate(-7deg); }
  100% { transform: translateX(5px) rotate(-4deg); }
`;
const float4 = keyframes`
  0%   { transform: translateX(-4px) rotate(5deg); }
  50%  { transform: translateX(6px) rotate(8deg); }
  100% { transform: translateX(-4px) rotate(5deg); }
`;

/* ──────────────────────────────────────────────────────────────
   Те же token'ы вертикального ритма что и на главном лендинге.
   Одно место на всю страницу.
   ────────────────────────────────────────────────────────────── */
const SECTION_Y = {
  flush: '0',
  sm: '48px',
  md: '80px',
  lg: '120px',
  gap: '70px', // 70 + 70 = 140px между соседями
} as const;

const Section = styled.section<{
  $size?: keyof typeof SECTION_Y;
  $tint?: boolean;
  $bleedTop?: boolean;
  $bleedBottom?: boolean;
  /* Desktop-only bleed — mobile keeps its sectionPaddingY rhythm. Mirrors
   * the main landing's Section flag so CTA → Footer can flow seamlessly
   * on desktop while mobile retains 36+36=72 gap. */
  $bleedTopDesktop?: boolean;
  $bleedBottomDesktop?: boolean;
}>`
  padding-top: ${({ $size = 'md', $bleedTop, $bleedTopDesktop }) =>
    ($bleedTop || $bleedTopDesktop) ? '0' : SECTION_Y[$size]};
  padding-bottom: ${({ $size = 'md', $bleedBottom, $bleedBottomDesktop }) =>
    ($bleedBottom || $bleedBottomDesktop) ? '0' : SECTION_Y[$size]};
  ${({ $tint, theme }) => $tint && `background: ${theme.colors.background.surfaceAlt};`}

  /* Mobile — same uniform 72-gap rhythm as the main landing
   * (theme.layout.mobile.sectionPaddingY = 36). 36 + 36 = 72 between
   * any two adjacent sections. Desktop-only bleed flags do NOT collapse
   * mobile padding here — only $bleedTop/$bleedBottom (universal) do. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-top: ${({ $size = 'md', $bleedTop, theme }) =>
      $bleedTop ? '0' : $size === 'flush' ? '0' : theme.layout.mobile.sectionPaddingY};
    padding-bottom: ${({ $size = 'md', $bleedBottom, theme }) =>
      $bleedBottom ? '0' : $size === 'flush' ? '0' : theme.layout.mobile.sectionPaddingY};
  }
`;

/* Заливка hero — тот же surfaceAlt что и на /?hero=v2 */
const Hero = styled.div`
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
`;

const HeroScene = styled.div`
  position: relative;
  max-width: 1200px;
  /* Locked to exactly 728 (was min-height: 728 — content kept pushing
   * the tinted box past it). With a fixed height the surfaceAlt band
   * is a 728-tall slab; any content that exceeds (rare on desktop)
   * overflows visibly into the white below.
   * Last user note: "высота залитой зоны 728". */
  height: 728px;
  margin: 0 auto;
  padding: 88px 48px 54px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Mobile — section grows with content + 30 top / 30 bottom. The
     * desktop height: 728 must be unset (otherwise mobile would inherit
     * a 728-tall slab); min-height: 0 + height: auto give the natural
     * intrinsic height. Horizontal gutter token (20).
     * Last user note: "размером контента плюс сверху и снизу по 30 пикселей". */
    height: auto;
    min-height: 0;
    /* 52 top / 48 bottom. Mobile hero locked to 545 on both pages per
     * "высоту хиро ещё больше — 545 у обоих". Bottom 48 matches the main
     * landing's HeroSectionV2 mobile bottom-padding so Hero → first-section
     * headline gap is uniform across pages: 48 (this padding) + 36 (next
     * Section's mobile sectionPaddingY) = 84 of whitespace. Top is 52
     * because /widgets hero content is taller than the main hero by ~26,
     * so it needs less top padding to land on the same 545 total height.
     * Horizontal gutter token (20). */
    padding: 52px ${({ theme }) => theme.layout.mobile.gutter} 48px;
  }

  /* Tablet + narrow/mid desktop (769–1339) — flex-center HeroCard at a
   * fixed 660 height. From ≥1340 default 728 + padding-anchored layout.
   * No align-items: collapses HeroCard's width otherwise. */
  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: 1339px) {
    height: 660px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px;
  }

  /* No-widgets range (769–1029) — match the main landing's HeroSectionV2
   * height: min-height 480 with symmetric vertical padding so both
   * heroes occupy the same vertical slot when widgets are hidden. From
   * 1030+ widgets reappear and the 660-tall slab from the rule above
   * applies. Per "по высоте выровни с главным хиро" + "виджеты с 1030". */
  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: auto;
    min-height: 480px;
    padding: 36px 20px 36px;
  }

  @media (min-width: calc(${({ theme }) => theme.breakpoints.tablet} + 1px))
    and (max-width: 1099px) {
    height: auto;
    min-height: 480px;
    padding: 36px 48px 36px;
  }

  /* Narrow tablet (769–900) — taller fill band + symmetric 36 padding.
   * Per "высоту хиро увеличь когда размер страницы 769–900". Bumped
   * min-height 480 → 580 so the surfaceAlt slab reads more confidently
   * at these tablet widths. */
  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: 900px) {
    min-height: 610px;
    padding: 36px 20px 36px;
  }
`;

const FloatingWidget = styled.div<{ $left?: string; $right?: string; $top: string; $delay: string; $anim: number }>`
  position: absolute;
  ${({ $left }) => $left && `left: ${$left};`}
  ${({ $right }) => $right && `right: ${$right};`}
  top: ${({ $top }) => $top};
  width: 180px;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
  border: none;
  background: transparent;
  z-index: 2;
  pointer-events: auto;
  cursor: pointer;
  transition: filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);

  img {
    width: 100%;
    display: block;
    filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.08)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.04));
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover {
    animation-play-state: paused;
    z-index: 4;
  }
  &:hover img {
    transform: scale(1.06);
    filter: drop-shadow(0 32px 56px rgba(0, 0, 0, 0.12)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.06));
  }

  animation: ${({ $anim }) => $anim === 1 ? float1 : $anim === 2 ? float2 : $anim === 3 ? float3 : float4}
    ${({ $anim }) => $anim === 1 ? '7.3s' : $anim === 2 ? '10.7s' : $anim === 3 ? '9.1s' : '8.6s'}
    ease-in-out infinite both;
  animation-delay: ${({ $delay }) => $delay};
  will-change: transform;

  /* Phone + tablet + narrow desktop (≤1099) — hide floating widgets.
   * From 1100+ widgets reappear on /widgets. Per "только у страницы с
   * виджетами хиро виджеты с 1100". */
  @media (max-width: 1099px) {
    display: none;
  }

  /* Tablet + narrow/mid desktop (769–1339) — fixed-size override.
   * Cards 200px wide, 24px from viewport edge, bottom widgets compressed
   * to top: 280. From ≥1340 the original inline widths + negative
   * offsets read correctly. NOTE: superseded by the ≤1240 hide above
   * within its overlap; only 1241–1339 actually shows the override. */
  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: 1339px) {
    width: 200px !important;
    ${({ $left }) => $left && `left: 24px;`}
    ${({ $right }) => $right && `right: 24px;`}
    ${({ $top }) => {
      const num = parseInt($top, 10);
      return num > 200 ? `top: 280px;` : '';
    }}
  }

  /* Narrow tablet (769–840) — push slightly closer to the viewport edge
   * (8 vs 24) and shrink ~5% (200 → 190) so the cards sit further from
   * the centered headline at narrow widths. */
  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: 840px) {
    width: 182px !important;
    ${({ $left }) => $left && `left: 8px;`}
    ${({ $right }) => $right && `right: 8px;`}
  }

  /* Wide tablet / narrow desktop (1020–1339) — bump ~7% (200 → 215) so
   * the cards have more visual presence at these wider viewports
   * without yet being at full desktop size. */
  @media (min-width: 1020px) and (max-width: 1339px) {
    width: 215px !important;
  }

  /* 1100–1339 — drop all four widgets 10px lower so they don't crowd
   * the headline at this newly-shown range. Per "с 1100 до 1340 виджеты
   * нижние и верхние на 10 пикселей ниже". 1340+ keeps the original
   * positions untouched. */
  @media (min-width: 1100px) and (max-width: 1339px) {
    ${({ $top }) => {
      const num = parseInt($top, 10);
      return num > 200 ? `top: 300px;` : `top: ${num + 10}px;`;
    }}
  }
`;

/* ── Widget Gallery (horizontal scroll) ── */
const WidgetGallerySection = styled.section`
  padding: 0;
  position: relative;
`;

const WidgetGalleryHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Gutter token (20) — same as main landing. padding-bottom 24
     * owns the chips → cards gap (was 0 — chips touched the grid).
     * Per "фильтры в Explore widgets не имеют расстояния от карточек"
     * (c_2026-04-29). */
    padding: 0 ${({ theme }) => theme.layout.mobile.gutter} 24px;
    /* Title → filter chips: 24 (was titleToCards 28, −4 per request).
     * Local override — token left untouched so other sections that use
     * titleToCards keep their rhythm. */
    gap: 24px;
    /* Center title row to match all other landing sections on mobile. */
    text-align: center;
  }
`;

const WidgetGalleryTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WidgetGalleryTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes['8xl']};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.03em;
  margin: 0;

  /* Mobile — sectionHeadline tokens (24/600/1) — same recipe as every
   * landing section on phone (HowItWorks/Testimonials/CTA/etc). */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionHeadline.size};
    font-weight: ${({ theme }) => theme.typography.mobile.sectionHeadline.weight};
    line-height: ${({ theme }) => theme.typography.mobile.sectionHeadline.lineHeight};
  }

  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 32px;
  }
`;

const WidgetGalleryFilterRow = styled(FilterRow)`
  margin-bottom: 0;

  /* Phone — hide the entire filter row. Mobile users get a clean
   * horizontal-scroll preview of widgets instead of a full filter
   * UI. They can register / log in to use real filters. Mirrors the
   * Top templates section on / per "сделать как Top Templates,
   * фильтры скрываются, при растяжении появляются" (c_2026-04-29). */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

/* WidgetGalleryBtn — replaced by shared <Button $variant="primary" $size="md"> */

/* Wide-phone / tablet (481-768) — Try for free sits next to the
 * "Explore widgets" headline since the FilterRow is hidden in that
 * range. Mirrors HeaderExploreSlot on / Top Templates. */
const HeaderTryForFreeSlot = styled.div`
  display: none;

  @media (min-width: calc(${({ theme }) => theme.breakpoints.sm} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    align-items: center;
  }
`;

/* Landing-only horizontal-scroll gallery for /widgets logged-out
 * mobile. Desktop matches WidgetGalleryGrid (3-col grid, padding
 * 20/48/24). On phone the cards switch to a marquee-style scroll
 * mirroring the Top templates section on /. Filters are hidden on
 * mobile; they reappear when the viewport widens past md. Per "сделать
 * такую же как Top Templates, ТОЛЬКО ТЕЛЕФОН" (c_2026-04-29). */
const LandingMobileGallery = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 48px 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: row;
    grid-template-columns: none;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scroll-padding-left: ${({ theme }) => theme.layout.mobile.gutter};
    padding: 0 ${({ theme }) => theme.layout.mobile.gutter} 0;
    gap: ${({ theme }) => theme.layout.mobile.cardGap};

    &::-webkit-scrollbar { display: none; }
    scrollbar-width: none;
  }
`;

/* Landing card variant — extends WidgetGalleryCardWrap (which carries
 * the surfaceAlt fill + shadow on mobile) with the marquee-card sizing
 * (75vw + flex-shrink + scroll-snap-align). */
const LandingMobileGalleryCard = styled.div<{ $i?: number }>`
  background: #fff;
  border: 1.5px solid ${({ theme }) => theme.colors.border.hairline};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hairlineHover};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    box-shadow: ${({ theme }) => theme.shadows.mobileCard};
    flex-shrink: 0;
    scroll-snap-align: start;

    &:hover {
      transform: none;
      box-shadow: ${({ theme }) => theme.shadows.mobileCard};
    }
  }

  /* Progressive card widths so the visible-card count grows smoothly
   * with the viewport — 1.25 → 1.55 → 2 → ~3 across the mobile/tablet
   * range. Replaces the previous two-step 75vw / 240px rule which jumped
   * from 1.25 cards at 620 straight to 2.5 at 641. Per "с 620 видеть
   * больше полутора, дальше при скейле больше и больше пока не три".
   * Each rule overrides the wider-bracket one above thanks to source order.
   */

  /* Tablet wide (721-768) — ~3 cards fit in the marquee. */
  @media (min-width: 721px) and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 33vw;
  }

  /* Tablet narrow (621-720) — ~2 cards visible. */
  @media (min-width: 621px) and (max-width: 720px) {
    width: 45vw;
  }

  /* Phone wide (481-620) — ~1.55 cards visible (1 full + ~half peek)
   * so the user sees clearly that more cards exist on the right. */
  @media (min-width: 481px) and (max-width: 620px) {
    width: 60vw;
  }

  /* Phone narrow (≤480) — 75vw with ~25% peek of the next card. Same
   * recipe as TemplateCardWrap mobile-tier. */
  @media (max-width: 480px) {
    width: 75vw;
  }

  /* Tag (calendar/clock/board) — bigger pill in the horizontal scroll
   * mode (≤md). Default Tag mobile (10/2-8) reads thin against the
   * larger card preview. Per "лейблы calendar/clock больше когда в
   * горизонтальном скролле" (c_2026-04-29). */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    ${Tag} {
      padding: 5px 12px;
      font-size: ${({ theme }) => theme.typography.sizes.sm};
    }
  }

  /* Tablet-tier (641-768) — 3-card horizontal scroll, narrower 240
   * cards. Tag scales down accordingly. Per "когда три в горизонтале
   * надо меньше лейбл" (c_2026-04-29). */
  @media (min-width: calc(${({ theme }) => theme.breakpoints.mobile} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    ${Tag} {
      padding: 3px 10px;
      font-size: ${({ theme }) => theme.typography.sizes.xs};
    }
  }
`;

/* Top-of-image badge row inside a gallery card. Tag (calendar/clock/
 * board) sits on the left, optional Pro pill on the right. Flex with
 * align-items: center so labels of different heights share a vertical
 * center line (Pro xs is shorter than the mobile-overridden Tag).
 * pointer-events: none lets clicks fall through to the underlying
 * card. Per "Pro выровни с лейблом календарь по середине" (c_2026-04-28). */
const CardBadgeRow = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  pointer-events: none;
`;

/* Logged-in /widgets header — mirrors /templates Header/Title/Subtitle
 * 1-to-1 on mobile so the catalog feels like the same page family on
 * phone. Desktop values frozen — copies the inline-styled originals
 * verbatim. Per "хочу чтобы /widgets logged-in была адаптирована один
 * в один как /templates, на компе не трогать" (c_2026-04-28). */
const LoggedInHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 48px 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: calc(${({ theme }) => theme.layout.mobile.sectionPaddingY} - 4px)
      ${({ theme }) => theme.layout.mobile.gutter}
      24px;
  }
`;

const LoggedInTitle = styled.h1`
  font-size: 40px;
  font-weight: 600;
  color: #1F1F1F;
  letter-spacing: -0.03em;
  margin: 0 0 10px;

  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 32px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionHeadline.size};
    font-weight: ${({ theme }) => theme.typography.mobile.sectionHeadline.weight};
    line-height: ${({ theme }) => theme.typography.mobile.sectionHeadline.lineHeight};
    margin: 0 0 ${({ theme }) => theme.layout.mobile.titleToBody};
  }
`;

const LoggedInSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0 0 40px;
  letter-spacing: -0.01em;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionBody.size};
    line-height: ${({ theme }) => theme.typography.mobile.sectionBody.lineHeight};
    margin: 0 0 24px;
  }
`;

const WidgetGalleryGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  /* Desktop — no bottom padding; the wrapping Section owns the gap
   * to the next block. Trailing 24px here was double-counting and
   * read as "лишний padding снизу у компа версии у галереи"
   * (c_mosnpqmz). */
  padding: 20px 48px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Tablet (>600, ≤md) — 2-col grid. */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 20px;
    padding: 0 ${({ theme }) => theme.layout.mobile.gutter}
      calc(${({ theme }) => theme.layout.mobile.sectionPaddingY} * 2);
    align-items: start;
  }

  /* Phone (≤499) — single-column grid. Breakpoint dropped from 600 to
   * 499 to mirror /studio's WidgetGrid: 500–680 stays 2-col so the
   * gallery matches the saved-widgets section's tablet rhythm. Per
   * "сделаем такую же логику, оставим лейблы". */
  @media (max-width: 499px) {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 20px;
  }
`;

const widgetCardAppear = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const WidgetGalleryCardWrap = styled.div<{ $i?: number }>`
  background: #fff;
  border: 1.5px solid ${({ theme }) => theme.colors.border.hairline};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.medium};
  animation: ${widgetCardAppear} 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${({ $i }) => 0.05 + ($i || 0) * 0.04}s both;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hairlineHover};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  /* Mobile — single-column grid card (was 75vw swipe-card). Per
   * "хочу один в один как /templates" (c_2026-04-28). Surface still
   * gets the surfaceAlt + mobileCard shadow treatment so it reads
   * like the catalog cards. Hover-scale disabled — on phone hover
   * triggers on tap and the pulse reads as "the card was pressed". */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    box-shadow: ${({ theme }) => theme.shadows.mobileCard};
    width: 100%;

    &:hover {
      transform: none;
      box-shadow: ${({ theme }) => theme.shadows.mobileCard};
    }
  }

  /* Tag (calendar/clock/board) sizing:
   *  - ≤499 (1-кол): sm 12, padding 5/12 (default mobile rule below)
   *  - 500-620 (2-кол narrow): xs 11, padding 3/10 — cards are tight in
   *    this range so labels need to shrink to match, otherwise the tag
   *    eats the image's top-left corner. Per "с 500 до 620 лейбл меньше"
   *    (c_2026-05-04).
   *  - 769-1100 (3-кол compact): xs 11, padding 3/10 — narrower cards,
   *    Tag should be more compact.
   *  - >1100: default Tag (no override). */
  @media (min-width: 500px) and (max-width: 620px) {
    ${Tag} {
      padding: 3px 10px;
      font-size: ${({ theme }) => theme.typography.sizes.xs};
    }
    ${CardBadgeRow} > span:nth-child(2) {
      padding: 0 7px;
      font-size: 9px;
      height: 16px;
    }
  }

  @media (min-width: 769px) and (max-width: 1100px) {
    ${Tag} {
      padding: 3px 10px;
      font-size: ${({ theme }) => theme.typography.sizes.xs};
    }
    /* Pro pill (Label[$variant="pro"]) — visually balance with the
     * smaller Tag at this range. Tighter padding/font. */
    ${CardBadgeRow} > span:nth-child(2) {
      padding: 0 7px;
      font-size: 9px;
      height: 16px;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    ${Tag} {
      padding: 5px 12px;
      font-size: ${({ theme }) => theme.typography.sizes.sm};
    }
  }

  /* 1-в-ряд (≤600) — Tag drops to sm (12) with 4/11 padding. Earlier
   * iteration scaled UP at this width per "чуть больше когда один в
   * ряд", but the bigger label stole attention from the card content;
   * latest ask: "лейблы все такие календарь часы и тд которые в
   * карточках когда один в ряд надо меньше" (c_2026-04-29). At
   * full-width the tag should read as a quiet category marker. */
  @media (max-width: 600px) {
    ${Tag} {
      padding: 4px 11px;
      font-size: ${({ theme }) => theme.typography.sizes.sm};
    }
  }
`;

const WidgetGalleryMeta = styled.div`
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);

  /* Compact card layout (≤1100, >600) — 3-col-narrow & 2-col cards
   * both stack title on top with a full-width button below.
   * Smaller button (height 30, padding 0/12, font sm 12) per "размер
   * кнопки когда 2 и 3 в ряд тоже меньше" (c_2026-04-28).
   * gap 12 (was 8) — more breathing between title text and the button
   * below per "у compact отступ от кнопки до текста чуть больше"
   * (c_2026-04-29). */
  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 10px 10px 10px;

    & > button {
      width: 100%;
      justify-content: center;
      height: 30px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: ${({ theme }) => theme.typography.sizes.sm};
    }
  }

  /* Phone (≤499) — 1-col grid → title and button on the same row.
   * Customize variant swap to "primary" (black) is done in JSX via
   * useIsMobile, so no color overrides here — only size. */
  @media (max-width: 499px) {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;

    & > div:first-child {
      flex: 1;
      min-width: 0;
    }

    & > button {
      width: auto;
      flex-shrink: 0;
      /* Slightly compact button on phone — height 32 (sm token),
       * tight padding so each button hugs its label. No min-width
       * — Customize/Upgrade can vary in width. Per "кнопки чуть
       * меньше, не одного размера если текст разный" (c_2026-04-28). */
      height: 32px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: ${({ theme }) => theme.typography.sizes.md};
      justify-content: center;
    }
  }

  /* Previously: a 640–768 override flipped the meta back to a row layout
   * inside this range, but inside the logged-out marquee (LandingMobileGallery)
   * the cards are narrow at 640+ and the row layout cramped the title
   * against the button. The column layout from the ≤1100 rule now applies
   * uninterrupted from 500 to 1100, so the card meta layout no longer
   * shifts when crossing 640 — only when crossing 1100 (column → default
   * row). Per "лейаут карточки не должен меняться при 640, пусть остаётся
   * до 770+". */
`;

const WidgetGalleryCardTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.01em;

  /* Mobile — cardBody tokens (14/400/1.5). Was cardHeadline (16/600), but
   * widget tile titles read as a label sitting under the thumbnail (like
   * "Top templates" card titles), not as a headline → smaller, lighter.
   * Last user note: "названия виджетов в карточках size 14". */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.cardBody.size};
    font-weight: ${({ theme }) => theme.typography.mobile.cardBody.weight};
    line-height: ${({ theme }) => theme.typography.mobile.cardBody.lineHeight};
    /* One-line title on phone — long names ("Typewriter Calendar")
     * were wrapping to two lines and pushing the row taller. Pro
     * pill already moves into CardBadgeRow above the image on
     * mobile, so the title doesn't compete with it for inline space.
     * Per c_mosns9m5. */
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
`;

/* ── Mobile Pricing block ──────────────────────────────────────────────
 * On phone, the desktop two-column "Free / Pro" grid is replaced with a
 * single Pro hero card + a comparison table below. Layout copied from
 * /widgets mobile spec screenshot Screenshot 2026-04-27 at 01.56.16:
 *   PricingGrid (Free + Pro) hidden on mobile via DesktopOnlyPricingGrid.
 *   MobilePricing renders <ProHeroCard> and <ComparisonTable> stacked.
 * Desktop is untouched. */
const DesktopOnlyPricingGrid = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const MobilePricing = styled.div`
  display: none;
  flex-direction: column;
  gap: 16px;
  /* 358 cap: ProHeroCard inside has padding 18 20, so the inner CTA
   * (ProCtaButton, width 100%) lands at 358 − 40 = 318 — same width
   * as every other locked CTA on the phone landing.
   * Per "примени настройки ограничения ко всем кнопкам на мобиле". */
  max-width: 358px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const ProHeroCard = styled.div`
  /* Gradient softened per c_mogfr7e9 ("чуть тусклее"): mixed against
   * the page surface so it reads as a hint of lavender rather than a
   * solid block. Stops moved closer in hue too. */
  background: linear-gradient(150deg, #F6F4FF 0%, #F1EFFC 100%);
  border-radius: ${({ theme }) => theme.radii.xl};
  /* Hairline outline — same recipe as the CTA card and HowItWorks
   * mobile cards so all hero-tier surfaces share one edge treatment. */
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* Padding aligned with ComparisonHeader (18 20) so PRO/POPULAR row
   * sits at the same vertical inset as "WHAT YOU GET" header on the
   * card below — same horizontal rhythm too (20). Bottom kept at 24
   * for breathing room above the CTA + hint stack.
   * Comment c_moh4qeq0: "про и popular выровни чуть выше — падinги
   * у карточек одинаковые должны быть". */
  padding: 18px 20px 24px;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ProEyebrowRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
`;

const ProEyebrow = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
`;

const ProPriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
`;

const ProPrice = styled.span`
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 32px;
  }
`;

const ProPriceUnit = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ProCtaButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.text.primary};
  color: #fff;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transitions.medium};

  &:hover { opacity: 0.92; }
`;

const ProHintLine = styled.p`
  margin: 12px 0 0;
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  letter-spacing: -0.005em;
`;

const ComparisonCard = styled.div`
  background: #fff;
  /* Same hairline as ProHeroCard / CTA / HowItWorks mobile cards so the
   * pricing block reads as one family. Was border.light which was a
   * touch heavier than the new mobile card treatment. */
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
`;

const ComparisonHeader = styled.div`
  /* Neutral header — body color (darker than tertiary) for stronger
   * presence as the table lead-in. Was tertiary which read as faded.
   * Background uses the same lavender Pro-column wash so the eyebrow
   * row reads as Pro-tier accent. Iteration history: started
   * transparent, bumped to surfaceAlt (c_moslcrno "закрасить тоже"),
   * then bumped to Pro lavender (c_mosmy0em "залить как Pro, только
   * фон, не текст"). */
  padding: 18px 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.body};
  background: rgba(99, 102, 241, 0.06);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th, td {
    padding: 16px 12px;
    text-align: center;
    font-size: 14px;
    line-height: 1.35;
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  th:first-child, td:first-child {
    text-align: left;
    padding-left: 20px;
    font-weight: 600;
    /* Feature column carries the surfaceAlt (footer) wash — swapped
     * with FREE per c_mosp6oc3 "фри столбик без заливки, а вот фича
     * как заливка футера, поменяй местами". The row labels group
     * visually under the wash; FREE stays transparent. */
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
  }

  /* Free column — transparent now (was surfaceAlt). Pro keeps its
   * lavender wash so it remains the recommended-tier lead. */
  th:nth-child(2), td:nth-child(2) {
    background: transparent;
  }

  /* Pro column gets the soft lavender wash so it reads as the
   * recommended tier, mirroring the screenshot. */
  th:last-child, td:last-child {
    background: rgba(99, 102, 241, 0.06);
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
  }

  /* Column header eyebrow style (FREE / PRO). */
  thead th {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.tertiary};
    border-top: 0;
  }

  /* PRO header: extra-bold (800) so the recommended tier stands out
   * vs FREE's 700. Per c_moh5f5pr "тут жирный текст надо". */
  thead th:last-child {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 800;
  }

  /* Free column body cells — muted tone. */
  tbody td:nth-child(2) {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  /* Check / cross icon size. */
  svg {
    width: 16px;
    height: 16px;
    vertical-align: middle;
  }

  /* Mobile — tighter type + explicit column widths so the FEATURE
   * column gets enough room for words like "Customization" /
   * "Exclusive styles" without overflowing the table edge. Per
   * c_mosno8cp "это не вмещается в телефон, выходит за границы". */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    th, td {
      font-size: 12.5px;
      padding: 14px 8px;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    th:first-child, td:first-child {
      width: 44%;
      padding-left: 14px;
    }

    th:nth-child(2), td:nth-child(2) {
      width: 28%;
    }

    th:last-child, td:last-child {
      width: 28%;
    }

    thead th {
      font-size: 10px;
    }
  }
`;

/* CustomizeBtn — use shared <Button $variant="secondary" $size="sm"> directly. */

/* Overlay badge — glass white + accent text. Sits on card thumbnails.
   Matches the unified badge system defined in /dev → Labels & Badges. */
const GalleryProBadgeSlot = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
`;

const GalleryCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background: linear-gradient(150deg, rgba(237,228,255,0.45) 0%, rgba(232,237,255,0.35) 30%, rgba(245,235,250,0.3) 60%, rgba(255,240,245,0.4) 100%);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(200, 195, 230, 0.2);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    border-radius: ${({ theme }) => theme.radii.lg};
  }
  position: relative;
  aspect-ratio: 4 / 3;

  &:hover img {
    opacity: 1;
  }
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  opacity: 1;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
`;

const GallerySection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 48px 80px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 48px 24px 48px;
  }
`;

/* ── Features ── */
const FeaturesSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 48px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { padding: 48px 24px; }
`;

const FeatureRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { grid-template-columns: 1fr; gap: 16px; }
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.sizes['4xl']};
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.02em;
`;

const FeatureDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0;
  line-height: 1.5;
`;

/* ── Pricing — exported so the UpgradeModal renders the same Free/Pro
   cards 1:1 (single source of truth). The local PricingSection wrapper
   stays page-only since the modal centers cards in its own layout. ── */
const PricingSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  /* Desktop vertical padding (80/160) absorbed here so the wrapping
   * <Section $size="flush"> stays out of the way and mobile can use
   * sectionPaddingY without inline-style leakage. */
  padding: 80px 48px 160px;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.layout.mobile.sectionPaddingY} ${({ theme }) => theme.layout.mobile.gutter};
  }
`;

const PricingTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes['8xl']};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.03em;
  margin: 0 0 8px;

  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 32px;
  }

  /* Mobile — sectionHeadline tokens (24/600/1). */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionHeadline.size};
    font-weight: ${({ theme }) => theme.typography.mobile.sectionHeadline.weight};
    line-height: ${({ theme }) => theme.typography.mobile.sectionHeadline.lineHeight};
    margin: 0;
  }
`;

const PricingSubtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.peach.muted};
  margin: 8px 0 40px;
  letter-spacing: -0.01em;

  /* Mobile — sectionBody tokens (15/400/1.5). titleToBody (8) above,
   * bodyToCards (20) below — matches the rest of the landing. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionBody.size};
    font-weight: ${({ theme }) => theme.typography.mobile.sectionBody.weight};
    line-height: ${({ theme }) => theme.typography.mobile.sectionBody.lineHeight};
    margin: ${({ theme }) => theme.layout.mobile.titleToBody} 0 ${({ theme }) => theme.layout.mobile.bodyToCards};
  }
`;

export const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 680px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { grid-template-columns: 1fr; max-width: 360px; }
`;

export const PricingCard = styled.div<{ $highlighted?: boolean }>`
  background: ${({ $highlighted }) => $highlighted ? 'linear-gradient(150deg, #F8F6FF 0%, #F0F4FF 50%, #FFF6F8 100%)' : '#fff'};
  color: inherit;
  border: 1px solid ${({ $highlighted, theme }) => $highlighted ? 'rgba(130, 120, 200, 0.2)' : theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 28px 36px;
  text-align: left;
  position: relative;
  display: flex;
  flex-direction: column;
  ${({ $highlighted }) => $highlighted && 'box-shadow: 0 6px 32px rgba(100, 80, 200, 0.08);'}

  /* Mobile — softer card chrome inside the UpgradeModal so it reads
   * as one cohesive sheet instead of a card-on-card. Padding tighter
   * (28/36 → 22/22), border lighter, shadow off (the modal already
   * carries the elevation). Per c_moslj3of "более гармоничную модалку
   * для телефона". */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 22px;
    border-color: ${({ $highlighted }) => $highlighted ? 'rgba(130, 120, 200, 0.18)' : 'rgba(0, 0, 0, 0.06)'};
    box-shadow: none;
  }
`;

export const PricingPlanRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
`;

export const PricingPlan = styled.div<{ $highlighted?: boolean }>`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $highlighted, theme }) =>
    $highlighted ? theme.colors.accent : theme.colors.text.tertiary};
`;

export const PricingPriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 24px;
`;

export const PricingPrice = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes['7xl']};
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PricingPeriod = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const PricingFeatures = styled.ul<{ $highlighted?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.primary};

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  li svg {
    width: 16px;
    height: 16px;
    color: ${({ $highlighted, theme }) => $highlighted ? theme.colors.accent : theme.colors.text.muted};
    flex-shrink: 0;
  }
`;

/* PricingBtn — replaced by shared <Button $variant="primary|outline" $size="lg" $fullWidth> */

/* Bottom CTA: imports CTASectionWrap / CTACard / CTATitle / CTASubtitle
 * from landing/CTASection so this page's tail-CTA is the SAME component
 * the main landing renders for "Your Notion is waiting" — only the inner
 * content (title text, subtitle copy, action area) differs. No locally
 * forked styled-component for the gradient card anymore. */

/* Override only inside the imported CTACard on mobile: EmailRow must stop
 * being capped at 380 / horizontally centered (the Hero rule), and gain
 * 20px of air above to match CTAButtonRow's mobile spacing in the main
 * landing's CTASection. */
const BottomCTACard = styled(CTACard)`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    & > ${EmailRow} {
      /* 318 cap to match every other CTA / email row across the phone
       * landing — buttons no longer stretch on 414+ phones.
       * Per "примени настройки ограничения ко всем кнопкам на мобиле". */
      max-width: 318px;
      margin: 20px auto 0;
    }
  }
`;

type WidgetCategory = 'all' | 'calendar' | 'clock' | 'boards' | 'buttons';

const GALLERY_FILTERS: { key: WidgetCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'clock', label: 'Clocks' },
  { key: 'boards', label: 'Boards' },
];

const FEATURED_ITEMS: { image: string; title: string }[] = [
  { image: '/gallery-calendar-typewriter.png', title: 'Typewriter Calendar' },
  { image: '/gallery-clock-flower.png', title: 'Flower Clock' },
  { image: '/gallery-camera.png', title: 'Camera Widget' },
];

const GALLERY_ITEMS: { image: string; title: string; category: WidgetCategory; type: string; style: string; pro?: boolean }[] = [
  { image: '/gallery-calendar-classic.png', title: 'Classic Calendar', category: 'calendar', type: 'calendar', style: 'classic' },
  { image: '/gallery-calendar-collage.png', title: 'Collage Calendar', category: 'calendar', type: 'calendar', style: 'collage' },
  { image: '/gallery-calendar-typewriter.png', title: 'Typewriter Calendar', category: 'calendar', type: 'calendar', style: 'typewriter', pro: true },
  { image: '/gallery-clock-flower.png', title: 'Flower Clock', category: 'clock', type: 'clock', style: 'flower', pro: true },
  { image: '/gallery-clock-flip.png', title: 'Flip Clock', category: 'clock', type: 'clock', style: 'classic' },
  { image: '/gallery-camera.png', title: 'Camera', category: 'boards', type: 'board', style: 'grid' },
];

export const WidgetStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [expanding, setExpanding] = useState(false);
  const [activeFilter, setActiveFilter] = useState<WidgetCategory>('all');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [galleryScrolled, setGalleryScrolled] = useState(false);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const { loginWithCode, login, loginWithGoogle, isLoggedIn } = useAuth();
  /* Compact layout flag (≤1100) — drives:
   *   - Customize variant: primary (black) at ≤1100, secondary (grey)
   *     at >1100.
   *   - Pro badge position: top-right inside the image (opposite the
   *     category Tag) at ≤1100, beside the title at >1100. */
  const isCompact = useIsCompact();
  /* Narrow phone (≤480) — Customize on /widgets landing paints
   * primary (black) per "до 480 кастомайз батоны будут темными"
   * (c_2026-04-29). */
  const isPhone = useIsPhone();
  const { open: openUpgrade } = useUpgradeModal();
  const quota = useWidgetQuota();
  const [nameModal, setNameModal] = useState<{ title: string; category: string; type: string; style: string } | null>(null);
  const [widgetName, setWidgetName] = useState('');

  // Anonymous Customize → LoginModal first; we keep the picked item so we
  // can resume into the name-your-widget step right after auth succeeds.
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingCustomize, setPendingCustomize] = useState<{ title: string; category: string; type: string; style: string } | null>(null);

  const startCustomize = (item: { title: string; category: string; type: string; style: string }) => {
    if (isLoggedIn) {
      setNameModal(item);
      setWidgetName(item.title);
    } else {
      setPendingCustomize(item);
      setLoginModalOpen(true);
    }
  };

  const handleLaunch = useCallback(() => {
    setExpanding(true);
    /* "Launch" from /widgets goes to the dashboard — there's no widget
       in editor state at this point, so /studio would just bounce back
       via the dashboard guard. Timeout dropped 450 → 250ms so the
       anonymous view fades out faster — was leaving a noticeable
       "stuck on /widgets" flash before /dashboard mounted. Per
       c_moshdlmr "оказываюсь на этой же странице на полсекунды
       потом в дашборде, флоу почистить". */
    /* replace: true so back-button from /dashboard doesn't bounce
     * back into the /widgets-anonymous→login loop. */
    setTimeout(() => navigate('/dashboard', { replace: true }), 250);
  }, [navigate]);

  // If already logged in, show "Go to Studio" instead of auto-redirect

  const handleCodeEntry = useCallback(() => {
    setCodeError('');
    const trimmed = codeInput.trim();
    if (!trimmed) {
      setCodeError('Please enter your email to continue.');
      return;
    }
    // Secret beta access code still works for internal testing.
    if (trimmed.toUpperCase() === 'PEACHY2026' && loginWithCode(trimmed)) {
      handleLaunch();
      return;
    }
    // Otherwise treat input as an email and send the user to signup with it prefilled.
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (isEmail) {
      navigate('/login', { state: { email: trimmed, signup: true } });
      return;
    }
    setCodeError("That doesn't look like an email address. Please check and try again.");
  }, [codeInput, loginWithCode, handleLaunch, navigate]);

  // Logged-in view — clean gallery matching /templates layout.
  // While `expanding` is true (handleLaunch fired) we deliberately
  // keep rendering the anonymous tree so the fade-out animation runs
  // on the same content the user already sees, instead of swapping
  // to the logged-in gallery for ~250ms before /dashboard mounts.
  // Per c_moshdlmr "оказываюсь на этой же странице на полсекунды".
  if (isLoggedIn && !expanding) {
    return (
      <PageWrapper>
        <TopNav activeLink="studio" logoSub="Widgets" />
        {/* Header owns the chips → cards gap (24px bottom padding) so it
            matches /templates and stays consistent regardless of mobile. */}
        <LoggedInHeader>
          <BackButton onClick={() => navigate(-1 as any)} label="Back" />
          {/* Headline swaps the leading word as the filter changes — same
              pattern /templates uses, but only the qualifier shifts here:
              "Notion" → category ("Calendar", "Clock", "Board"), while
              "Widgets" stays anchored. */}
          <LoggedInTitle>
            {activeFilter === 'all' ? 'Notion' :
             activeFilter === 'calendar' ? 'Calendar' :
             activeFilter === 'clock' ? 'Clock' :
             activeFilter === 'boards' ? 'Board' :
             activeFilter === 'buttons' ? 'Button' : 'Notion'} Widgets
          </LoggedInTitle>
          <LoggedInSubtitle>Browse styles, customize and embed in your Notion workspace</LoggedInSubtitle>
          <FilterRow>
            {GALLERY_FILTERS.map(f => (
              <FilterChip key={f.key} $active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)}>
                {f.label}
              </FilterChip>
            ))}
          </FilterRow>
        </LoggedInHeader>
        <WidgetGalleryGrid style={{ paddingTop: 0 }}>
          {(activeFilter === 'all' ? GALLERY_ITEMS.slice(0, 6) : GALLERY_ITEMS.filter(item => item.category === activeFilter)).map((item, i) => (
            <WidgetGalleryCardWrap key={`${activeFilter}-${i}`} $i={i}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative', background: '#FAFAF9' }}>
                <CardBadgeRow>
                  <Tag>{item.category === 'calendar' ? 'calendar' : item.category === 'clock' ? 'clock' : 'board'}</Tag>
                  {isCompact && item.pro && (
                    <Label $variant="pro" $size="xs">Pro</Label>
                  )}
                </CardBadgeRow>
                <GalleryImage src={item.image} alt={item.title} />
              </div>
              <WidgetGalleryMeta>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <WidgetGalleryCardTitle>{item.title}</WidgetGalleryCardTitle>
                  {!isCompact && item.pro && <Label $variant="pro" $size="xs">Pro</Label>}
                </div>
                {(item.pro && !quota.isPro) || quota.atLimit ? (
                  <SharedButton $variant="upgrade" $size="sm" onClick={openUpgrade}><Sparkle /> Upgrade</SharedButton>
                ) : (
                  /* Variant tied to LAYOUT, not just compact mode:
                   * - Phone (≤480, isPhone) — meta is row, button is small
                   *   AND next to the title → "primary" (black) reads as
                   *   the dominant action.
                   * - 500-1099 — meta drops button below the title (column,
                   *   full-width). Black would be too heavy for a stacked
                   *   block; "secondary" lets the title stay the anchor.
                   * - ≥1100 — default secondary (frozen by user request).
                   * Per "не делай чёрной когда кнопка спускается вниз,
                   * только когда маленькая и напротив имени". */
                  <SharedButton $variant={isPhone ? 'primary' : 'secondary'} $size="sm" onClick={() => startCustomize({ title: item.title, category: item.category, type: item.type, style: item.style })}><Pencil /> Customize</SharedButton>
                )}
              </WidgetGalleryMeta>
            </WidgetGalleryCardWrap>
          ))}
        </WidgetGalleryGrid>
        <LandingFooter onNavigate={(path) => navigate(path)} />

        {/* Name Modal — uses shared <Modal> so it matches the Delete confirmation dialog. */}
        <Modal
          open={!!nameModal}
          onClose={() => setNameModal(null)}
          eyebrow={nameModal ? `New ${nameModal.category}` : undefined}
          title="Name your widget"
          size="sm"
          hideClose
        >
          <NameModalInput
            autoFocus
            value={widgetName}
            onChange={e => setWidgetName(e.target.value)}
            placeholder="Classic Calendar"
            onKeyDown={e => {
              if (e.key === 'Enter' && widgetName.trim() && nameModal) {
                const data = { name: widgetName, type: nameModal.type, style: nameModal.style };
                setNameModal(null);
                navigate('/studio', { state: { newWidget: data } });
              }
            }}
          />
          <ModalFooter>
            <SharedButton type="button" $variant="outline" $size="lg" onClick={() => setNameModal(null)}>
              Cancel
            </SharedButton>
            <SharedButton
              type="button"
              $variant="primary"
              $size="lg"
              onClick={() => {
                if (widgetName.trim() && nameModal) {
                  const data = { name: widgetName, type: nameModal.type, style: nameModal.style };
                  setNameModal(null);
                  navigate('/studio', { state: { newWidget: data } });
                }
              }}
            >
              Create &amp; Edit
            </SharedButton>
          </ModalFooter>
        </Modal>

        {/* Upgrade Modal */}
      </PageWrapper>
    );
  }

  // Non-logged-in view — full landing
  return (
    <PageWrapper>
      <TopNav activeLink="studio" />

      {/* Hero with floating widgets — фон #FAFAFA как на /?hero=v2 */}
      <Hero>
      <HeroScene>
        {/* Floating widget PNGs with transparent bg */}
        <FloatingWidget $left="-104px" $top="64px" $delay="0s" $anim={1} data-float data-speed="1.2" style={{ width: 256 }}>
          <WebpImage src="/float-typewriter.png" alt="Typewriter Calendar" loading="lazy" />
        </FloatingWidget>
        <FloatingWidget $right="-94px" $top="74px" $delay="-3.4s" $anim={2} data-float data-speed="0.8" style={{ width: 296 }}>
          <WebpImage src="/float-collage.png" alt="Collage Calendar" loading="lazy" />
        </FloatingWidget>
        <FloatingWidget $left="-44px" $top="380px" $delay="-5.8s" $anim={3} data-float data-speed="1.5" style={{ width: 307 }}>
          <WebpImage src="/float-clock.png" alt="Flower Clock" loading="lazy" />
        </FloatingWidget>
        <FloatingWidget $right="-46px" $top="396px" $delay="-2.1s" $anim={4} data-float data-speed="1" style={{ width: 279 }}>
          <WebpImage src="/float-camera.png" alt="Camera Widget" loading="lazy" />
        </FloatingWidget>

        <HeroCard>
            <HeroTitle>
              Widgets your<br />{' '}notion<TitleBreakMobile />{' '}is missing
            </HeroTitle>
            <HeroDesc>Customizable, aesthetic, ready in seconds.<br />Pick a widget. Make it yours. Paste into Notion.</HeroDesc>
            {isLoggedIn ? (
              <EmailRow>
                <SharedButton $variant="primary" $size="xl" $fullWidth onClick={handleLaunch}>
                  Open Studio <ArrowRight />
                </SharedButton>
              </EmailRow>
            ) : (
              <>
                <EmailRow>
                  <EmailInput
                    type="email"
                    placeholder="Enter your email"
                    value={codeInput}
                    onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCodeEntry(); } }}
                  />
                  <SharedButton $variant="primary" $size="xl" $fullWidth onClick={(e) => { e.stopPropagation(); handleCodeEntry(); }}>
                    Try for free <ArrowRight />
                  </SharedButton>
                </EmailRow>
                {codeError && <CodeError>{codeError}</CodeError>}
                <AuthDivider>or</AuthDivider>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 280, margin: '0 auto' }}>
                  <SharedButton $variant="secondary" $size="lg" onClick={() => loginWithGoogle()} style={{ width: '100%' }}>
                    <GoogleIcon />
                    Continue with Google
                  </SharedButton>
                  <AuthLoginHint>
                    Already have an account?{' '}
                    <SharedButton type="button" $variant="link" $size="sm" onClick={() => navigate('/login')}>
                      Log in
                    </SharedButton>
                  </AuthLoginHint>
                </div>
              </>
            )}
        </HeroCard>
      </HeroScene>
      </Hero>

      <PageContent $hide={expanding}>

      {/* Widget Gallery — horizontal scroll like Top Templates.
          $size dropped md → sm on desktop bottom only via $bleedBottomDesktop:
          NO, simpler — switch to "sm" so the gap to the next section
          (HowItWorks $size="gap" → 70 top) is 48+70=118 instead of 80+70=150.
          Per c_mosmuoy4 "на десктопе чуть меньше отступ снизу". */}
      <Section $size="sm">
      <WidgetGallerySection>
        <WidgetGalleryHeader>
          <WidgetGalleryTitleRow>
            <WidgetGalleryTitle>
              {activeFilter === 'all' ? 'Explore widgets' : GALLERY_FILTERS.find(f => f.key === activeFilter)?.label || 'Widgets'}
            </WidgetGalleryTitle>
            <HeaderTryForFreeSlot>
              <SharedButton $variant="primary" $size="md" onClick={isLoggedIn ? handleLaunch : () => setLoginModalOpen(true)}>
                {isLoggedIn ? 'Open Studio' : 'Try for free'} <ArrowRight />
              </SharedButton>
            </HeaderTryForFreeSlot>
          </WidgetGalleryTitleRow>
          <WidgetGalleryFilterRow>
            {GALLERY_FILTERS.map(f => (
              <FilterChip key={f.key} $active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)}>
                {/* Landing (logged-out) only — "All" reads as "Featured"
                 * since the grid shows a curated 6-card preview (max 2
                 * rows). The filter key stays 'all' so the slice/filter
                 * logic continues to work. Per "заменить All на Featured
                 * только в этом случае" (c_2026-04-29). */}
                {f.key === 'all' ? 'Featured' : f.label}
              </FilterChip>
            ))}
            <SharedButton $variant="primary" $size="md" onClick={isLoggedIn ? handleLaunch : () => navigate('/login')} style={{ marginLeft: 'auto' }}>
              {isLoggedIn ? 'Open Studio' : 'Try for free'} <ArrowRight />
            </SharedButton>
          </WidgetGalleryFilterRow>
        </WidgetGalleryHeader>
        <LandingMobileGallery>
          {(activeFilter === 'all' ? GALLERY_ITEMS.slice(0, 6) : GALLERY_ITEMS.filter(item => item.category === activeFilter)).map((item, i) => (
            <LandingMobileGalleryCard key={`${activeFilter}-${i}`} $i={i}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative', background: '#FAFAF9' }}>
                <Tag style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>{item.category === 'calendar' ? 'calendar' : item.category === 'clock' ? 'clock' : 'board'}</Tag>
                <GalleryImage src={item.image} alt={item.title} />
              </div>
              <WidgetGalleryMeta>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <WidgetGalleryCardTitle>{item.title}</WidgetGalleryCardTitle>
                  {item.pro && <Label $variant="pro" $size="xs">Pro</Label>}
                </div>
                {/* Not-logged-in users see Customize on pro widgets too — the
                     upgrade wall only appears once they have an account. The
                     PRO badge sets the expectation without blocking try-outs.
                     Variant flips to primary (black) on narrow phone so the
                     CTA reads as the dominant action when the card layout
                     is single-column. */}
                <SharedButton $variant={isPhone ? 'primary' : 'secondary'} $size="sm" onClick={() => startCustomize({ title: item.title, category: item.category, type: item.type, style: item.style })}><Pencil /> Customize</SharedButton>
              </WidgetGalleryMeta>
            </LandingMobileGalleryCard>
          ))}
        </LandingMobileGallery>
        {/* Mobile "Try for free" CTA under the marquee was removed per
            comment c_mogfqr0m ("убери кнопку тут ток") — Hero's primary
            CTA + the Pricing CTA already provide enough conversion
            anchors on phone. WidgetGalleryMobileCtaRow styled-component
            kept defined as dead code in case the row is reinstated. */}
      </WidgetGallerySection>
      </Section>

      {/* Show How it works, Pricing, CTA only for non-logged-in users */}
      {!isLoggedIn && (
        <>
          <Section $size="gap">
            <HowItWorksSection showTitle={true} variant="widgets" />
          </Section>

          <Section $size="flush">
          <PricingSection>
            <PricingTitle>Start free, upgrade anytime</PricingTitle>
            <PricingSubtitle>3 free widgets. Unlimited for $4/mo.</PricingSubtitle>
            <DesktopOnlyPricingGrid>
              <PricingGrid>
                <PricingCard>
                  <PricingPlanRow>
                    <PricingPlan>Free</PricingPlan>
                  </PricingPlanRow>
                  <PricingPriceRow>
                    <PricingPrice>$0</PricingPrice>
                    <PricingPeriod>forever</PricingPeriod>
                  </PricingPriceRow>
                  <PricingFeatures>
                    <li><Check /> Up to 3 widgets</li>
                    <li><Check /> Calendar &amp; Clock only</li>
                    <li><Check /> Basic colors &amp; layout</li>
                    <li><Check /> Embed in Notion</li>
                  </PricingFeatures>
                  <SharedButton $variant="outline" $size="lg" $fullWidth onClick={handleLaunch} style={{ marginTop: 24 }}>Get started</SharedButton>
                </PricingCard>
                <PricingCard $highlighted>
                  <PricingPlanRow>
                    <PricingPlan $highlighted>Pro</PricingPlan>
                    <PlanBadge $pro $size="xs">Popular</PlanBadge>
                  </PricingPlanRow>
                  <PricingPriceRow>
                    <PricingPrice>$4</PricingPrice>
                    <PricingPeriod>monthly</PricingPeriod>
                  </PricingPriceRow>
                  <PricingFeatures $highlighted>
                    <li><Check /> Unlimited widgets</li>
                    <li><Check /> All widget types</li>
                    <li><Check /> Full customization</li>
                    <li><Check /> Exclusive widget styles</li>
                  </PricingFeatures>
                  <SharedButton $variant="primary" $size="lg" $fullWidth onClick={handleLaunch} style={{ marginTop: 24 }}>Get Pro</SharedButton>
                </PricingCard>
              </PricingGrid>
            </DesktopOnlyPricingGrid>

            {/* Mobile-only layout per spec screenshot 2026-04-27 at 01.56.16:
                ProHeroCard with PRO eyebrow + POPULAR pill + $4 monthly +
                full-width black "Start Pro — $4/mo" button + "Or stay on
                Free forever" hint. ComparisonTable below maps Free → Pro
                feature parity. Desktop sees nothing of this. */}
            <MobilePricing>
              <ProHeroCard>
                <ProEyebrowRow>
                  <ProEyebrow>Pro</ProEyebrow>
                  <PlanBadge $pro $size="xs">Popular</PlanBadge>
                </ProEyebrowRow>
                <ProPriceRow>
                  <ProPrice>$4</ProPrice>
                  <ProPriceUnit>monthly</ProPriceUnit>
                </ProPriceRow>
                <ProCtaButton onClick={handleLaunch}>Start Pro — $4/mo</ProCtaButton>
              </ProHeroCard>
              <ComparisonCard>
                <ComparisonHeader>What you get</ComparisonHeader>
                <ComparisonTable>
                  <thead>
                    <tr>
                      {/* First header cell labels the row axis. Empty
                          cell read as a visual hole on phone — c_mogfty51
                          ("добавь в первую ячейку что-нибудь чтобы
                          выровнять"). "Feature" anchors the comparison. */}
                      <th>Feature</th>
                      <th>Free</th>
                      <th>Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Widgets</td>
                      <td>Up to 3</td>
                      <td>Unlimited</td>
                    </tr>
                    <tr>
                      <td>Widget types</td>
                      <td>Calendar, Clock</td>
                      <td>All types</td>
                    </tr>
                    <tr>
                      <td>Customization</td>
                      <td>Basic</td>
                      <td>Full</td>
                    </tr>
                    <tr>
                      <td>Exclusive styles</td>
                      <td>—</td>
                      <td><Check /></td>
                    </tr>
                    <tr>
                      <td>Notion embed</td>
                      <td><Check /></td>
                      <td><Check /></td>
                    </tr>
                    <tr>
                      <td>Priority support</td>
                      <td>—</td>
                      <td><Check /></td>
                    </tr>
                  </tbody>
                </ComparisonTable>
              </ComparisonCard>
            </MobilePricing>
          </PricingSection>
          </Section>

          {/* Bottom CTA — uses the EXACT components the main landing's
              "Your Notion is waiting" CTA renders (CTASectionWrap +
              CTACard + CTATitle + CTASubtitle from landing/CTASection),
              with the page-specific email-form swapped in for the inner
              action area. One styled-component family for both surfaces. */}
          <Section $size="gap" $bleedTopDesktop $bleedBottomDesktop>
            <CTASectionWrap data-ux="Ready to build CTA">
              <BottomCTACard>
                <MainCTATitle>Ready to build?</MainCTATitle>
                <MainCTASubtitle>Sign up and start creating widgets for your Notion.</MainCTASubtitle>
                <EmailRow>
                  <EmailInput
                    type="email"
                    placeholder="Enter your email"
                  />
                  <SharedButton $variant="primary" $size="xl" $fullWidth onClick={() => navigate('/login')}>
                    Get started <ArrowRight />
                  </SharedButton>
                </EmailRow>
              </BottomCTACard>
            </CTASectionWrap>
          </Section>
        </>
      )}

      <Section $size="gap" $tint $bleedTopDesktop $bleedBottom>
        <BigFooter onNavigate={(path) => navigate(path)} noDivider />
      </Section>
      </PageContent>

      {/* Login gate — anonymous users hitting Customize land here first.
          On success we resume their pending pick into the name step so
          the click never "dies". */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => { setLoginModalOpen(false); setPendingCustomize(null); }}
        onAuthenticated={() => {
          if (pendingCustomize) {
            setNameModal(pendingCustomize);
            setWidgetName(pendingCustomize.title);
            setPendingCustomize(null);
            return;
          }
          /* No pendingCustomize → user opened LoginModal from the
             generic "Try for free" CTA. Send them straight to the
             dashboard so /widgets doesn't briefly flip to the
             logged-in gallery. Per c_moshdlmr "флоу почистить". */
          handleLaunch();
        }}
      />

      {/* Name Modal — also needed in the anonymous tree so Customize on a
          gallery card opens the naming step before we hand off to /studio. */}
      <Modal
        open={!!nameModal}
        onClose={() => setNameModal(null)}
        eyebrow={nameModal ? `New ${nameModal.category}` : undefined}
        title="Name your widget"
        size="sm"
        hideClose
      >
        <NameModalInput
          autoFocus
          value={widgetName}
          onChange={e => setWidgetName(e.target.value)}
          placeholder="Classic Calendar"
          onKeyDown={e => {
            if (e.key === 'Enter' && widgetName.trim() && nameModal) {
              const data = { name: widgetName, type: nameModal.type, style: nameModal.style };
              setNameModal(null);
              navigate('/studio', { state: { newWidget: data } });
            }
          }}
        />
        <ModalFooter>
          <SharedButton type="button" $variant="outline" $size="lg" onClick={() => setNameModal(null)}>
            Cancel
          </SharedButton>
          <SharedButton
            type="button"
            $variant="primary"
            $size="lg"
            onClick={() => {
              if (widgetName.trim() && nameModal) {
                const data = { name: widgetName, type: nameModal.type, style: nameModal.style };
                setNameModal(null);
                navigate('/studio', { state: { newWidget: data } });
              }
            }}
          >
            Create &amp; Edit
          </SharedButton>
        </ModalFooter>
      </Modal>
    </PageWrapper>
  );
};
