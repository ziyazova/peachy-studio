import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Eye, ShoppingCart, Check } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageWrapper, BackButton, Button, Card, Accordion, TemplateMockupCard, TemplateMockupImage, LandingFooter, WebpImage } from '@/presentation/components/shared';
import { fadeUp } from '@/presentation/themes/animations';
import { TEMPLATES, FAQ_ITEMS, getTemplateEtsyId } from '@/presentation/data/templates';
import { useCart } from '@/presentation/context/CartContext';
import { useAuth } from '@/presentation/context/AuthContext';
import { SubscriptionService } from '@/infrastructure/services/SubscriptionService';
import { FEATURES } from '@/config/features';

/* ── Layout ── */

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 48px 0;
  animation: ${fadeUp} 0.35s ease both;
  /* No overflow-x: hidden here — PageWrapper already clamps the page
   * to viewport width. Setting overflow-x on this Content too created
   * a second scroll-block context on desktop, which manifested as the
   * "double scrollbar" the user reported (root + inner). */

  /* Phone — catalog rhythm: top sectionPaddingY − 4. Sides gutter (20).
   * Bottom 100 to clear the sticky MobileBuyBar. */
  @media (max-width: 949px) {
    padding: calc(${({ theme }) => theme.layout.mobile.sectionPaddingY} - 4px)
      ${({ theme }) => theme.layout.mobile.gutter}
      100px;
  }

  /* Tablet sub-range (641–949) — bump horizontal padding to 48 so the
   * page has comfortable breathing room from viewport edges (mobile's
   * 20-gutter reads as too tight on a wider screen). Lower bound
   * extended from 769 → 641 so 640–768 widths share the same rhythm
   * and the carousel no longer "stops" with empty space at ~700–768. */
  @media (min-width: 641px) and (max-width: 949px) {
    padding: calc(${({ theme }) => theme.layout.mobile.sectionPaddingY} - 4px)
      48px
      100px;
  }
`;

const TwoCol = styled.div`
  display: grid;
  /* Sidebar 280 — narrowed from 320 per "сайдбар чуть уже"
   * (c_2026-04-28). Matches the lg breakpoint width so the sidebar
   * stays consistent across desktop sizes. */
  grid-template-columns: 1fr 280px;
  /* Single auto row — main column owns its TopSection + BottomSection
   * stack natively (no grid-row spanning), so when the sidebar's
   * accordions expand the grid rows don't grow and the main
   * description never shifts. Per "когда раскрываю в сайдбаре —
   * двигается основное описание" (c_2026-05-05). */
  grid-template-rows: auto;
  column-gap: 48px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    column-gap: 32px;
  }

  @media (max-width: 949px) {
    display: flex;
    flex-direction: column;
    /* 36 — uniform major-block gap on mobile (TopSection / RightCol /
     * BottomSection / Related). Per "расстояние до Template Overview
     * 36 на мобилке" (c_2026-04-28). Was 24, doubling with PagesCard's
     * 36 margin-bottom gave 60 — fixed by removing PagesCard's
     * margin-bottom and letting flex-gap own the rhythm. */
    gap: 36px;
  }
`;

/* Main column wrapper — holds TopSection + BottomSection on desktop
 * so they live in a single grid cell. On mobile it's display: contents
 * so its children become direct flex items of TwoCol and the existing
 * `order` rules continue to drive the mobile sequence (Title →
 * Sidebar → Description → Bottom). */
const MainCol = styled.div`
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  /* Row gap inside main column — matches the previous TwoCol row-gap
   * so TopSection → BottomSection rhythm stays unchanged. */
  gap: 28px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    gap: 24px;
  }

  @media (max-width: 949px) {
    display: contents;
  }
`;

const TopSection = styled.div`
  min-width: 0;
  max-width: 100%;

  @media (max-width: 949px) {
    order: 1;
  }
`;

const RightCol = styled.div`
  position: sticky;
  top: calc(57px + 32px);
  grid-column: 2;

  @media (max-width: 949px) {
    position: static;
    order: 2;
    width: 100%;
  }
`;

const BottomSection = styled.div`
  min-width: 0;
  max-width: 100%;

  @media (max-width: 949px) {
    order: 4;
  }
`;

/* DesktopOnly: display block on desktop, display: none on phone. Used
 * to keep elements visible in their original desktop layout while the
 * mobile flow renders a re-positioned copy of the same content. */
const DesktopOnly = styled.div`
  @media (max-width: 949px) {
    display: none;
  }
`;

/* MobileOnlyAt: hidden on desktop, shown on phone with a fixed flex
 * order so it lands in the right slot of the TwoCol mobile column.
 * Per c_moh79qfc "кнопки идут первее, далее описание — но только на
 * телефоне" (Description, $order=3) and c_moh79ywx "этот блок последний
 * в телефоне" (Related Templates, $order=5). */
const MobileOnlyAt = styled.div<{ $order: number }>`
  display: none;

  @media (max-width: 949px) {
    display: block;
    order: ${({ $order }) => $order};
    min-width: 0;
    max-width: 100%;
  }
`;

/* Footer rendering moved to shared <LandingFooter /> — same wrapper
 * pattern as every landing page (surfaceAlt tint + noDivider). */

/* ── Breadcrumb ── */

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 16px;
    gap: 6px;
    font-size: ${({ theme }) => theme.typography.sizes.xs};
  }
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  letter-spacing: -0.01em;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
`;

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    max-width: 140px;
  }
`;

/* ── Title area ── */

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['7xl']};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  /* Title → Description gap 8 desktop (was 12 → -4 per "подними её
   * на 4 пикселя", c_2026-04-28). Mobile lock via override below. */
  margin: 0 0 8px;

  /* Phone — 24/600/1.2. Title (product name) sits one tier above the
   * 18 sub-section headlines so the page hierarchy reads cleanly:
   * Title 24 → Section H2 18 → body 14. Per "Title планнера 24, h2
   * секций 18, body 14". */
  @media (max-width: 949px) {
    font-size: 24px;
    font-weight: ${({ theme }) => theme.typography.mobile.sectionHeadline.weight};
    line-height: 1.2;
    margin: 0 0 ${({ theme }) => theme.layout.mobile.titleToBody};
  }
`;

const Description = styled.p`
  /* Desktop bumped 14 → 16 — supporting copy under H1 was reading
   * thin against the 32 hero. Per "текст слишком мелкий на компе"
   * (c_2026-04-28). Mobile keeps 14 explicitly via override below.
   * Color was text.body — too active under the 32 H1; quietened to
   * text.tertiary (matches the mobile rhythm) per "менее активный
   * цвет тут" (c_2026-05-05). */
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  /* Description → carousel gap 24 (was 12) — needs more breath
   * before the photo. Mobile lock via override below. */
  margin: 0 0 24px;
  word-break: break-word;

  /* Phone — body 14/1.5 (sizes.base). Mobile rules locked separately
   * via /templates/:id mobile rhythm; never roll desktop bumps into
   * the mobile branch. */
  @media (max-width: 949px) {
    font-size: ${({ theme }) => theme.typography.sizes.base};
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text.tertiary};
    max-width: 100%;
    margin: 0 0 ${({ theme }) => theme.layout.mobile.bodyToCards};
  }
`;

/* ── Image carousel ── (card surface now comes from shared TemplateMockupCard) */

/* Desktop carousel wrapper — keeps the chevron-driven slideshow as-is.
 * Hidden on mobile so we can render the scroll-snap row instead.
 * Drop-shadow stripped on the inner TemplateMockupCard per "испрaвь
 * тень у фото главной карточки" (c_2026-04-28). */
const DesktopCarousel = styled.div`
  position: relative;

  & > div { box-shadow: none; }

  @media (max-width: 949px) {
    display: none;
  }
`;

/* Mobile-only horizontal scroll-snap carousel. One slide per viewport
 * width, snap-mandatory so the user always lands on a single image.
 * Tap any slide → opens the Lightbox modal at that index. Border is
 * bumped to a slightly louder line on mobile per "outline чуть ярче"
 * (c_2026-04-28). */
const MobileCarousel = styled.div`
  display: none;

  @media (max-width: 949px) {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 8px;
    margin: 0 calc(-1 * ${({ theme }) => theme.layout.mobile.gutter}) 12px;
    padding: 0 ${({ theme }) => theme.layout.mobile.gutter};
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  /* Tablet sub-range (641–949) — Content uses 48px page padding here,
   * not the 20px gutter. Drop the negative pull entirely so the carousel
   * stays within the same 48px column as the title/description/cards
   * instead of leaking to the viewport edge. Range extended to 641 so
   * 640–768 widths inherit the same alignment. */
  @media (min-width: 641px) and (max-width: 949px) {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }
`;

/* Mobile slide — wraps the shared TemplateMockupCard so the cloudy
 * gradient backdrop + drop-shadowed product image are identical to
 * the desktop hero. Image scale on mobile is bumped from 70 → 78%
 * per "вернуть как было но чуть увеличить" (c_2026-04-28) — keeps
 * the contain-fit, just larger inside the gradient frame. */
const MobileSlide = styled.button`
  flex: 0 0 100%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: zoom-in;
  display: block;

  & > div {
    border-color: rgba(43, 35, 32, 0.14);
  }

  & img {
    width: 78%;
    height: 78%;
  }
`;

/* Slide counter pill — bottom-right of the active mobile slide. Reads
 * "2 / 6" style. Sits above the image via a wrapping row position. */
const MobileSlideCounter = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.layout.mobile.gutter};
  bottom: 20px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  /* Softened — pill should sit gently on top of the photo, not punch
   * through it. Per "контейнер чуть совсем чуть менее контрастным"
   * (c_2026-04-28). */
  background: rgba(17, 17, 19, 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.92);
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.02em;
  pointer-events: none;
`;

const MobileCarouselWrap = styled.div`
  position: relative;

  @media (min-width: calc(949px + 1px)) {
    & > ${MobileSlideCounter} { display: none; }
  }
`;

/* ── Lightbox modal ── tap any image → fullscreen view, swipe between
 * gallery items, tap close (×) or backdrop to dismiss. */

const LightboxBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  /* Softer wash + lighter blur — second pass per "чуть менее
   * интенсивный blur при открытии" (c_2026-04-28). */
  background: rgba(22, 22, 26, 0.42);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lbFade 0.18s ease-out;
  @keyframes lbFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LightboxTrack = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const LightboxSlide = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const LightboxClose = styled.button`
  position: absolute;
  top: max(16px, env(safe-area-inset-top, 0px));
  right: 16px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const LightboxCounter = styled.div`
  position: absolute;
  bottom: max(20px, env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;


const CarouselLabel = styled.div`
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.tertiary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`;

const CarouselBtn = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: 12px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  color: ${({ theme }) => theme.colors.text.body};

  svg { width: 16px; height: 16px; }

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 28px;
    height: 28px;
    ${({ $side }) => $side}: 8px;
    svg { width: 14px; height: 14px; }
  }
`;

const Thumbnails = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 8px;
    margin-bottom: 24px;
  }
`;

const Thumb = styled.button<{ $active: boolean }>`
  width: 96px;
  height: 68px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.surface};
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.medium};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 64px;
    height: 46px;
  }
`;

/* ── Sections ── */

const SectionTitle = styled.h2`
  /* Desktop bumped xl (16) → 3xl (20) — proper h2 weight above the
   * 16 body so hierarchy reads. Mobile lock below pins it to 16 via
   * detailPage.titleSize. */
  font-size: ${({ theme }) => theme.typography.sizes['3xl']};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  /* margin-bottom 20 desktop — title → cards (Pages, FAQ, Related)
   * gap. When the next sibling is a body paragraph (Template Overview)
   * or a body-style list (Key Features), it pulls itself up by -8 so
   * the gap collapses to title → body 12. Per "title-cards 20,
   * title-body 12" (c_2026-04-28 desktop pass). Mobile lock via
   * detailPage tokens below. */
  margin: 0 0 20px;

  & + p {
    margin-top: -8px;
  }

  /* Mobile rhythm — every section heading on the detail page lines up
   * via theme.layout.mobile.detailPage tokens. Edit there to retune
   * the whole page in one shot. Spec: title 16/600/1.3, title→content
   * 12, section→section 36. Per c_2026-04-28. */
  @media (max-width: 949px) {
    font-size: ${({ theme }) => theme.layout.mobile.detailPage.titleSize};
    font-weight: ${({ theme }) => theme.layout.mobile.detailPage.titleWeight};
    line-height: ${({ theme }) => theme.layout.mobile.detailPage.titleLineHeight};
    margin-bottom: ${({ theme }) => theme.layout.mobile.detailPage.titleToContent};
  }
`;

const OverviewText = styled.p`
  /* Desktop bumped 14 → 16 — body copy under section H2s was reading
   * too thin in the comfortable wide column. Mobile lock below keeps
   * 14 (sizes.base). */
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.body};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  /* Desktop section gap 32 → 56 so blocks have proper breathing room
   * per "мало воздуха везде, адаптируй красиво" (c_2026-04-28
   * desktop pass). Mobile lock at sectionGap below. */
  margin: 0 0 52px;
  word-break: break-word;

  /* Mobile rhythm — body sits 12 below the title and 36 above the
   * next section's title. Per "body→cards = title→cards (12),
   * section→section 36" (c_2026-04-28).
   * line-height 1.5 (was 1.7 relaxed) — relaxed paragraph leading
   * inflated the perceived top/bottom whitespace, making the section
   * feel taller than the others. Per "паддинги сверху-снизу и расстояние
   * кажется больше — почини" (c_2026-04-28). margin-top: 0 explicit
   * so the styled p element doesn't pick up browser default top margin
   * (about 1em) on top of SectionTitle's 12 below. */
  @media (max-width: 949px) {
    /* Mobile font lock — desktop bumped to 16, mobile must stay 14. */
    font-size: ${({ theme }) => theme.typography.sizes.base};
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.layout.mobile.detailPage.sectionGap};
    line-height: 1.5;
  }
`;

/* Key Features list — clean inline list, no background. Earlier
 * gradient experiment was reverted ("ты не ту секцию раскрасил —
 * надо было Benefits"); the gradient now lives on the Benefits card
 * via <BenefitsCard> below. */
const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  /* Single-column inline list across desktop and mobile — clean text
   * with a check icon, no card chrome or fill. Per "сделай Key Features
   * везде без заливки, просто текст с галочкой в один ряд, не в два"
   * (c_2026-05-05). The previous 2-col grid + tile card recipe felt
   * busy against the simpler 1-line feature copy. */
  margin: 0 0 52px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  /* Mobile — same single-column inline list, looser breathing. Gap 14
   * gives each line elbow room without padding into card territory.
   * Per "на телефоне по приятнее сделай" (c_2026-05-05). */
  @media (max-width: 949px) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.layout.mobile.detailPage.sectionGap};
  }
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  word-break: break-word;
  /* No card chrome anywhere — just check icon + text inline. Per
   * "сделай Key Features везде без заливки, просто текст с галочкой
   * в один ряд" (c_2026-05-05). */
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;

  @media (max-width: 949px) {
    gap: 10px;
  }
`;

/* Check icon — bare indigo glyph, no circle wash. Aligned with the
 * title's first text line: title font 14 / line-height 1.35 → ~19px
 * line-box, with the cap-area sitting roughly 4-9px from the top of
 * that box. Icon is 14×14; centering its visual middle on the title's
 * cap-line center means the icon top sits ~2px below the line-box top.
 * Per "галочки выровни с зэдлайнами блока внутри". */
const FeatureBadge = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.accent};

  svg {
    width: 14px;
    height: 14px;
    stroke-width: 2.5;
  }
`;

const FeatureBody = styled.div`
  min-width: 0;
  flex: 1;
`;

/* Title + body split for each feature line. The data lives as a single
 * string with an em-dash separator ("Title — body") in templates.ts;
 * we split at render time so the bold-title / muted-body hierarchy
 * works without a data migration. Per c_moh7c3oc "избавиться от длинных
 * дефисов и оформить красивее". If a feature has no "—" the whole
 * string renders as the title (no body). */
const FeatureItemTitle = styled.span`
  display: block;
  /* Desktop bumped 14 → 16 (lg) since the card chrome was removed —
   * the feature line now needs to carry weight on its own. Per
   * "больше шрифт надо без заливки, но шрифт больше" (c_2026-05-05). */
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.45;
  letter-spacing: -0.01em;

  @media (max-width: 949px) {
    /* Mobile — 15 (base+1) reads as a comfortable inline list line.
     * Body color (slightly lighter than text.primary) keeps the page
     * H1 dominant while the feature lines stay legible. Per "на
     * телефоне по приятнее сделай" (c_2026-05-05). */
    font-size: 15px;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.text.body};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }
`;

const FeatureItemDesc = styled.span`
  display: block;
  margin-top: 4px;
  /* Desktop 13 (md) — small sub-copy under the 14 title. Mobile
   * lock bumps it to 14 via override below. */
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.5;

  @media (max-width: 949px) {
    margin-top: 2px;
    font-size: ${({ theme }) => theme.typography.sizes.base};
    line-height: 1.35;
  }
`;

/* ── Sidebar cards ── */

/* Benefits card — outlined Card on desktop, soft lavender gradient
 * panel on mobile (theme.colors.gradients.softBanner — same recipe
 * GradientBanner uses on the main landing). Padding tightened on
 * mobile so the One-time Payment / Instant Download / Lifetime Updates
 * stack reads as its own block rather than a sidebar card. Per
 * "не ту секцию раскрасил — надо было Benefits, и только у телефона". */
const BenefitsCard = styled(Card)`
  /* Desktop — 40 gap to the Pages Included block below. Bumped 36 → 40
   * per "на десктопе в сайдбаре чуть больше спеса между тремя блоками"
   * (c_2026-05-05). Internal block-to-list gap stays tight via
   * PagesGroupedHeader's own margin-bottom — the bump only widens the
   * inter-block rhythm. */
  margin-bottom: 40px;

  @media (max-width: 949px) {
    /* No fill on mobile, no padding — Benefits read as a quiet inline
     * list flush with the page gutter. Per "заливку вообще убери".
     * margin-top -8 lifts to the image (8px closer); margin-bottom 28
     * (sectionGap 36 - 8) gives Pages Included 16 less gap above (8
     * cascade + 8 reduced gap = 16 higher total per "Pages Included
     * на 12 → ещё 4 выше"). All-positive trick avoids the layout-
     * shift bug we saw with negative margin-top on PagesGroupedHeader. */
    background: transparent;
    border-color: transparent;
    padding: 0;
    margin-top: -8px;
    margin-bottom: 28px;
  }
`;

/* Pages card — soft surfaceAlt fill on desktop (matches Key Features
 * cards' light grey tone). Outline preserved. Per "блок окрасить
 * тоже в светло-серый очень" (c_2026-04-28). Mobile keeps the
 * transparent + outline look unchanged. */
const PagesCard = styled(Card)`
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border-color: ${({ theme }) => theme.colors.border.light};

  @media (max-width: 949px) {
    background: transparent;
    padding: 0 16px;
    /* margin-bottom 0 on mobile — TwoCol's flex gap (36) carries the
     * gap to BottomSection. Keeping a 36 mb here doubled the rhythm
     * to 72. Per "паддинг снизу убери, расстояние 36" (c_2026-04-28). */
    margin-bottom: 0;
  }
`;

const BenefitRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  /* Row → row gap bumped 12 → 16 per "между блоками чуть больше
   * расстояния на 4 пикселя примерно" (c_2026-05-05). */
  margin-bottom: 16px;
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.primary};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.accent};
    stroke-width: 2.5;
    flex-shrink: 0;
  }

  &:last-child { margin-bottom: 0; }

  /* Mobile — 14×14 to match FeatureBadge (Key Features). All page
   * checkmarks read identical on phone per "галочки одинаковые" (c_2026-04-28). */
  @media (max-width: 949px) {
    svg { width: 14px; height: 14px; }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const BtnGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  /* Phone — entire BtnGroup hidden. Both Buy Now and Buy on Etsy
   * moved to <MobileBuyBar> at the bottom of the page; rendering them
   * twice on mobile felt duplicative. The EtsyDisclosure copy that
   * lived inside this group on desktop is now hidden alongside on
   * phone — bar carries the action, no inline disclaimer needed.
   * Per "убираем кнопку Buy Now + Buy on Etsy спускаем к навигации". */
  @media (max-width: 949px) {
    display: none;
  }
`;

const AddedBtn = styled(Button).attrs({ $variant: 'success' as const, $size: 'lg' as const, $fullWidth: true })`
  .added-label { display: inline-flex; align-items: center; gap: 8px; }
  .remove-label { display: none; align-items: center; gap: 8px; }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.danger.strong};
    filter: none;
    .added-label { display: none; }
    .remove-label { display: inline-flex; }
  }
`;

const EtsyDisclosure = styled.p`
  margin: 10px 0 0;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
`;

const ErrorDisclosure = styled.p`
  margin: 10px 0 0;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.danger.strong};
  text-align: center;
`;

/* Pages included */

const PagesList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: pages;
`;

const PagesItem = styled.li`
  counter-increment: pages;
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.body};
  padding: 6px 0;
  display: flex;
  gap: 8px;

  &::before {
    content: counter(pages) '.';
    color: ${({ theme }) => theme.colors.text.tertiary};
    min-width: 16px;
  }

  /* Mobile keeps font 14 (sizes.base) — was 13 (sizes.md), broke
   * page-wide consistency. Padding stays tighter on mobile. */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 5px 0;
  }
`;

const ShowMoreLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: 4px 0 0;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
`;

/* Pages Included as a nested accordion — mirrors the screenshot
 * (Screenshot 2026-04-27 at 15.46.05): each section row expands into
 * its own page list. Only renders when template.pagesGrouped is set;
 * otherwise the page falls back to the flat <PagesList> above.
 *
 * Compactness: built so the same component handles both surfaces —
 * mobile (≤ md) ships the bigger 32px header rows + first section
 * auto-open, desktop ships the tighter 40px rows + all closed. The
 * difference is driven by CSS @media queries on the same instance,
 * not by a runtime prop. */
/* Header lives OUTSIDE the PagesCard now — title + subtitle render
 * as a free-standing section heading (same pattern as Template
 * Overview / Key Features above). PagesCard only carries the
 * accordion rows beneath. Per "вывести наружу как Template Overview". */
/* Sidebar variant of SectionTitle — desktop 16 (xl) so the auxiliary
 * sidebar heading sits visibly below the 20 main-column H2s. Mobile
 * keeps the 16 detailPage.titleSize from the base. Per "Pages
 * Included — 16 размер" (c_2026-04-28 desktop pass). */
const SidebarSectionTitle = styled(SectionTitle)`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`;

const PagesGroupedHeader = styled.div`
  /* Desktop 16 — header block (title + subtitle) → card gap. Tuned
   * 12 → 20 → 16 per "на 4 пикселя выше" (c_2026-04-28). Mobile keeps
   * titleToContent (12). */
  margin-bottom: 16px;

  /* Mobile — body→cards uses titleToContent. No negative margin-top
   * here — caused layout-shift when the accordion below expanded
   * ("блок поднимается наверх", c_2026-04-28). The Pages Included
   * section gets its lift from BenefitsCard's reduced mb instead. */
  @media (max-width: 949px) {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.layout.mobile.detailPage.titleToContent};
  }
`;

/* Subtitle under the "Pages Included" title — visible on every
 * viewport. Desktop bumped 12 → 13 (sizes.md) — was reading too
 * small under the H2 (16) title. margin-top 8 desktop (was 4) per
 * "расстояние между ними увеличь" (c_2026-04-28). */
const PagesGroupedSubtitle = styled.span`
  display: block;
  margin-top: 8px;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  letter-spacing: -0.01em;

  @media (max-width: 949px) {
    font-size: ${({ theme }) => theme.typography.sizes.base};
  }
`;

const PagesGroupedRow = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  /* Padding: 14/24 desktop — vertical 14 for breathing, horizontal 24
   * because the Card now uses $padding="none" (the inner elements
   * own their padding). Mobile keeps 10/0 via override below (Card
   * has 0 16 mobile padding, so rows get the 16 from card). */
  padding: 14px 24px;
  cursor: pointer;
  font-size: 14px;
  /* Mobile body weight 600, desktop 500 — matches screenshot spec
   * (compact=false on mobile bumps the row weight for touch). */
  font-weight: 500;
  /* Open section paints accent (indigo) — both row title and chevron.
   * Per "пусть при раскрытии секция уедет акцентного цвета, на тел и
   * десктоп" (c_2026-04-28). Closed sections stay text.primary. */
  color: ${({ $open, theme }) => ($open ? theme.colors.accent : theme.colors.text.primary)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  svg.chevron {
    width: 14px;
    height: 14px;
    color: ${({ $open, theme }) => ($open ? theme.colors.accent : theme.colors.text.tertiary)};
    transition: transform ${({ theme }) => theme.transitions.medium};
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  }

  @media (max-width: 949px) {
    font-weight: 600;
    /* Mobile lock — keep 10 vertical padding (touch target stays
     * compact); desktop bumped to 14 above for breath. */
    padding: 10px 0;
  }
`;

const PagesGroupedRowMeta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text.tertiary};

  /* Mobile — 12 (sizes.sm). The count meta reads as a tiny caption
   * next to the section name, sitting below the 14 page-wide body
   * size. Per "цифра и pages меньше". */
  @media (max-width: 949px) {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`;

/* Per-section panel — animated height collapse. Children fade-in via
 * fadeUp (existing landing animation, no new keyframes invented). */
const PagesGroupedPanel = styled.div<{ $h: number }>`
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.base};
  max-height: ${({ $h }) => $h}px;
`;

const PagesGroupedInner = styled.ul`
  list-style: none;
  /* Desktop — horizontal 24 matches PagesGroupedRow now that Card
   * uses $padding="none". Inner indent 12 keeps the accordion list
   * visually nested under its parent row. */
  padding: 6px 24px 14px 36px;
  margin: 0;

  @media (max-width: 949px) {
    /* Mobile — Card mobile padding (0 16) carries horizontal; only
     * indent inside. */
    padding: 6px 0 10px 12px;
  }
`;

const PagesGroupedItem = styled.li`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.body};
  padding: 6px 0;
  letter-spacing: -0.005em;
  animation: ${fadeUp} 0.2s ease both;

  /* Mobile bumps to 14 — page-wide "non-headline = 14" rule. */
  @media (max-width: 949px) {
    font-size: ${({ theme }) => theme.typography.sizes.base};
  }
`;

const PagesGroupedTotal = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
`;

/* Product description table */

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: ${({ theme }) => theme.typography.sizes.base};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  /* Mobile font kept at 14 (sizes.base) — page-wide consistency. */
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;


/* ── Related templates ── */

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  margin: ${({ theme }) => theme.spacing['8']} 0;
`;

const RelatedGrid = styled.div`
  display: flex;
  flex-direction: column;
  /* Desktop gap 16 — more air between sidebar related templates per
   * "отступы больше между ними" (c_2026-04-28). Mobile stays at the
   * compact 8 since the cards already breathe via stretch. */
  gap: 16px;

  @media (max-width: 949px) {
    gap: 8px;
  }
`;

const RelatedCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  /* Vertical padding removed per "паддинги у этих секций сверху-снизу
   * убери" (c_2026-04-28). RelatedGrid's gap (8) carries the rhythm. */
  padding: 0;
  cursor: pointer;
  position: relative;
`;

/* Fixed-width wrapper so the shared <TemplateMockupCard $size="thumb"> (aspect
   35/24) sits at exactly 140×96 in the Related rail. On mobile the
   thumb is narrowed and the inner card aspect is overridden to 5/4
   so the picture reads "чуть квадратнее" per c_2026-04-28. */
const RelatedThumbSlot = styled.div`
  /* Desktop 120 + aspect 5/4 — wider photo and closer to square per
   * "ширину фото карточек увеличь, ближе к квадрату" (c_2026-04-28).
   * Drop-shadow removed; outline border carries the edge. */
  width: 120px;
  flex-shrink: 0;

  & > div {
    aspect-ratio: 5 / 4;
    box-shadow: none;
  }

  @media (max-width: 949px) {
    width: 112px;

    /* Mobile — disable the card's hover border/shadow swap so the
     * card itself doesn't visually shift on tap. The inner image
     * keeps its 1.06 zoom via TemplateMockupImage's $hoverZoom (the
     * card's :hover still triggers the image transform). Per "пусть
     * на телефоне зумируется не карточки, а внутри контент только"
     * (c_2026-04-28). */
    & > div:hover {
      border-color: rgba(43, 35, 32, 0.06);
      box-shadow: none;
    }
  }
`;

const RelatedPreview = styled.div`
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%) scale(0.95);
  width: 320px;
  /* No fixed aspect-ratio. The frame used to be locked to 4/3 (1.333)
   * while the mockups are 2678x2106 (1.272) — with object-fit: contain
   * the picture touched one pair of edges and left slack on the other,
   * so the border sat at a different distance on every side. Letting the
   * box height follow the image and spacing it with a uniform padding
   * keeps all four margins identical for any mockup ratio, including the
   * handful that deviate (1.240 / 1.328). */
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  box-shadow: ${({ theme }) => theme.shadows.heavy};
  background: linear-gradient(180deg, #FAFAFC 0%, #F4F4FA 40%, #EEEEF8 100%);
  z-index: 20;
  opacity: 0;
  pointer-events: none;
  transition: opacity ${({ theme }) => theme.transitions.medium}, transform ${({ theme }) => theme.transitions.medium};

  ${RelatedCard}:hover & {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }

  /* Fills the padded box exactly, so the image itself sets the frame's
   * height. Roughly +29% over the previous 75%-of-a-letterboxed-4/3 box,
   * per "продукт маленький, увеличить процентов на 28-30" — and now the
   * growth costs no balance, since the padding is the only margin. */
  img {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.1));
  }

  /* Touch widths — kill the popup preview entirely. The hover-fired
   * enlargement reads as a glitch on tap, so on phone/tablet the row
   * stays static (only the navigation onClick remains). */
  @media (max-width: 949px) {
    display: none;
  }
`;

const RelatedInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RelatedTitle = styled.span`
  /* 14 (sizes.base), 400, text.body — quieter than primary so the
   * sidebar names don't compete with the main column. Per "названия
   * менее активные в Related Templates" (c_2026-04-28). */
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.normal};
  color: ${({ theme }) => theme.colors.text.body};
  letter-spacing: -0.01em;
  display: block;
  margin-bottom: 2px;
`;

const RelatedPrice = styled.span`
  /* 13 (sizes.md) + text.tertiary — quieter than RelatedTitle (14 /
   * text.body) so the price reads as supporting meta, not as a CTA.
   * Per "цену еще менее активной чем название" (c_2026-04-28). */
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

/* ── FAQ (uses shared <Accordion>; just a vertical stack) ── */

const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  /* Desktop gap 12 (was 8) — +4 between FAQ questions per
   * "тут на 4 увеличь на компе" (c_2026-04-28). Mobile lock keeps 8. */
  gap: ${({ theme }) => theme.spacing['3']};

  /* Drop the inner panel's top hairline on every viewport — the
   * answer flows directly under the question without a divider band.
   * Per "девайдер верхний убери" (c_2026-04-28 desktop pass). Mobile
   * already had this; desktop now matches. */
  & > div > div:nth-child(2) > div {
    border-top: 0;
  }

  @media (max-width: 949px) {
    /* margin-bottom 0 on mobile — TwoCol's flex gap (36) carries the
     * gap to Related Templates. Was sectionGap (36), doubled with
     * flex gap = 72. Per "паддинг снизу убери" (c_2026-04-28).
     * gap lock 8 — desktop bumped to 12, mobile stays compact. */
    gap: ${({ theme }) => theme.spacing['2']};
    margin-bottom: 0;
  }
`;

// Shared <Accordion> renders its children raw — style the FAQ answer here so
// it matches the old size/color instead of inheriting body defaults.
const FaqAnswerText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.body};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  margin: 0;
  word-break: break-word;

  /* Mobile — keep 14 (sizes.base) per page-wide consistency. The
   * earlier 6px top inset was reverted per "alignment у ответов
   * верни как было" — answers now flow at the Accordion's default
   * inner padding. */
`;

/* ── Mobile sticky buy bar ──
 * Single-row layout — price is now embedded inside the Buy Now button
 * ("Buy Now · $X") since Etsy's price is set on Etsy and can't be
 * mirrored here truthfully. Two CTAs side-by-side (Buy Now + Buy on
 * Etsy), each flex: 1 to share width evenly. Visible across the full
 * mobile range (≤ md = 768).
 * Per "цену в кнопку Buy Now засунем — на Etsy цена не контролируется". */

const MobileBuyBar = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  /* Padding 12 / 16 / 14 keeps the bar compact: two flex: 1 buttons
   * sit in a row, with breathing room top + bottom. safe-area inset
   * extra room on iPhones with home-indicator. */
  padding: 12px 16px 14px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));

  @media (max-width: 949px) {
    display: flex;
    gap: 8px;

    & > * { flex: 1; }
  }
`;

/* MobileBuyBtn replaced by shared <Button $variant="primary|success" $size="lg">. */

/* PagesAccordionGroup — single section row in the Pages Included
 * accordion. CONTROLLED component: parent owns the openIdx state so
 * only one section can be open at a time (opening section N closes
 * whatever was open before). Per "открывается одна — открываешь
 * другую — предыдущая закрывается". `isLast` drops the bottom
 * hairline so the card doesn't end with a trailing divider. */
const PagesAccordionGroup: React.FC<{
  section: string;
  pages: string[];
  open: boolean;
  onToggle: () => void;
  isLast?: boolean;
}> = ({ section, pages, open, onToggle, isLast }) => {
  const innerRef = useRef<HTMLUListElement>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (innerRef.current) setH(innerRef.current.scrollHeight);
    });
    ro.observe(innerRef.current);
    setH(innerRef.current.scrollHeight);
    return () => ro.disconnect();
  }, [open]);

  return (
    <>
      <PagesGroupedRow
        $open={open}
        onClick={onToggle}
        style={isLast ? { borderBottom: 'none' } : undefined}
      >
        <span>{section}</span>
        <PagesGroupedRowMeta>
          {pages.length} pages
          <ChevronDown className="chevron" />
        </PagesGroupedRowMeta>
      </PagesGroupedRow>
      <PagesGroupedPanel $h={open ? h : 0}>
        <PagesGroupedInner ref={innerRef}>
          {pages.map(p => (
            <PagesGroupedItem key={p}>{p}</PagesGroupedItem>
          ))}
        </PagesGroupedInner>
      </PagesGroupedPanel>
    </>
  );
};

/* ── Component ── */

export const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, removeItem, hasItem } = useCart();
  const { isRegistered } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllPages, setShowAllPages] = useState(false);
  /* Pages Included accordion — single openIdx so opening one section
   * collapses the previously open one. Starts at 0 (first section open
   * by default). Set to -1 if user wants to fully collapse the active. */
  const [openPagesIdx, setOpenPagesIdx] = useState<number>(0);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  /* Lightbox modal state — index = open slide; null = closed. */
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const template = TEMPLATES.find(t => t.id === id);

  /* Etsy id parsed from `template.etsyUrl` is the single source of truth
   * for buy flows. The `polar-checkout` Edge Function resolves it to a
   * Polar UUID server-side by matching product names. When this is null
   * (no etsyUrl) the in-site Buy button falls back to the Etsy / cart
   * paths below. */
  const etsyId = template ? getTemplateEtsyId(template) : null;

  /* Real gallery — falls back to [image] when `images` isn't populated.
   * Drives both the desktop chevron carousel and the mobile scroll-snap
   * row so both views render the same set of slides.
   *
   * Placeholder duplication: when the template has only a single image,
   * the cover can be duplicated into 3 slides so the carousel UX is visible
   * end-to-end. Per "задублируй картинку как заготовку, я потом заменю"
   * (c_2026-04-28). Now gated behind FEATURES.DUPLICATE_SINGLE_IMAGE_SLIDES,
   * which is off while templates ship a single cover — three identical
   * slides read as a bug to a visitor. When real `images` arrive they take
   * precedence and this path is skipped regardless of the flag. */
  const gallery = useMemo<string[]>(() => {
    if (!template) return [];
    if (template.images && template.images.length > 0) return template.images;
    return FEATURES.DUPLICATE_SINGLE_IMAGE_SLIDES
      ? [template.image, template.image, template.image]
      : [template.image];
  }, [template]);
  const slides = gallery.map((_, i) => i);

  const related = useMemo(() => {
    if (!template) return [];
    return TEMPLATES
      .filter(t => t.id !== template.id && t.category.some(c => template.category.includes(c)))
      .slice(0, 4);
  }, [template]);

  if (!template) {
    return (
      <PageWrapper>
        <TopNav activeLink="templates" logoSub="Templates" />
        <Content>
          <Description>Template not found.</Description>
        </Content>
      </PageWrapper>
    );
  }

  const isFree = template.price === 'Free';
  const inCart = hasItem(template.id);

  const handleAddToCart = () => {
    addItem({
      id: template.id,
      title: template.title,
      price: template.price,
      image: template.image,
    });
  };

  const handleBuyNow = async () => {
    if (!etsyId) return;
    // Guests can buy too — Polar collects the email on its checkout page,
    // the webhook records the purchase by email, and the buyer can link it
    // to an account later (AuthContext back-fills on sign-in).
    setBuyError(null);
    setBuying(true);
    try {
      await SubscriptionService.startCheckout({
        etsyId,
        successPath: `/studio?purchased=${etsyId}`,
      });
    } catch (e) {
      setBuyError(e instanceof Error ? e.message : 'Checkout failed. Please try again.');
      setBuying(false);
    }
  };

  return (
    <PageWrapper>
      <TopNav activeLink="templates" logoSub="Templates" />

      <Content>
        <BackButton label="Templates" onClick={() => navigate('/templates')} />

        <TwoCol>
          <MainCol>
          <TopSection>
            <Title>{template.title}</Title>
            {/* Description sits under the title on every device — short
                supporting copy above the Carousel. Per "текст пусть
                будет под headline'ом только короче — не спускай ниже". */}
            <Description>{template.description}</Description>

            {/* Carousel — desktop keeps the chevron-driven slideshow,
                mobile renders a horizontal scroll-snap row of all
                gallery images. Tapping a mobile slide opens the
                lightbox at that index. Per c_2026-04-28: real carousel
                + tap-to-expand + swipe between photos. */}
            <DesktopCarousel>
              <TemplateMockupCard $size="hero">
                <TemplateMockupImage
                  $size="hero"
                  $hoverZoom={false}
                  src={gallery[activeSlide] ?? template.image}
                  alt={template.title}
                  onClick={() => setLightboxIdx(activeSlide)}
                  style={{ cursor: 'zoom-in' }}
                />
                {gallery.length > 1 && (
                  <>
                    <CarouselBtn $side="left" onClick={() => setActiveSlide(i => i > 0 ? i - 1 : gallery.length - 1)}>
                      <ChevronLeft />
                    </CarouselBtn>
                    <CarouselBtn $side="right" onClick={() => setActiveSlide(i => i < gallery.length - 1 ? i + 1 : 0)}>
                      <ChevronRight />
                    </CarouselBtn>
                  </>
                )}
              </TemplateMockupCard>
            </DesktopCarousel>

            <MobileCarouselWrap>
              <MobileCarousel>
                {gallery.map((src, i) => (
                  <MobileSlide key={i} type="button" onClick={() => setLightboxIdx(i)}>
                    <TemplateMockupCard $size="hero">
                      <TemplateMockupImage $size="hero" $hoverZoom={false} src={src} alt={`${template.title} — slide ${i + 1}`} />
                    </TemplateMockupCard>
                  </MobileSlide>
                ))}
              </MobileCarousel>
              {gallery.length > 1 && (
                <MobileSlideCounter>{gallery.length} photos</MobileSlideCounter>
              )}
            </MobileCarouselWrap>

            {/* Thumbnails hidden until real images are added
            <Thumbnails>
              {slides.map(i => (
                <Thumb key={i} $active={activeSlide === i} onClick={() => setActiveSlide(i)} />
              ))}
            </Thumbnails>
            */}
          </TopSection>

          <BottomSection>
            {/* Template Overview */}
            <SectionTitle>Template Overview</SectionTitle>
            <OverviewText>{template.overview}</OverviewText>

            {/* Key Features */}
            <SectionTitle>Key Features</SectionTitle>
            <FeatureList>
              {template.features.map((f, i) => {
                /* Split feature on the em-dash / en-dash separator —
                 * REQUIRES whitespace on both sides so we don't split
                 * compound words like "All-In-One System" on the inner
                 * hyphen (regex used to be /[—–-]/ which captured the
                 * first hyphen and rendered "All" as the title).
                 * Pre-dash = title, post-dash = description. */
                const match = f.match(/^(.+?)\s+[—–]\s+(.+)$/);
                const title = match ? match[1].trim() : f;
                const desc = match ? match[2].trim() : null;
                return (
                  <FeatureItem key={i}>
                    <FeatureBadge><Check /></FeatureBadge>
                    <FeatureBody>
                      <FeatureItemTitle>{title}</FeatureItemTitle>
                      {desc && <FeatureItemDesc>{desc}</FeatureItemDesc>}
                    </FeatureBody>
                  </FeatureItem>
                );
              })}
            </FeatureList>

            {/* FAQ */}
            <SectionTitle>Frequently Asked Questions</SectionTitle>
            <FaqList>
              {FAQ_ITEMS.map((faq, i) => (
                <Accordion
                  key={i}
                  title={faq.q}
                  open={openFaq === i}
                  onToggle={(open) => setOpenFaq(open ? i : null)}
                >
                  <FaqAnswerText>{faq.a}</FaqAnswerText>
                </Accordion>
              ))}
            </FaqList>
          </BottomSection>
          </MainCol>

          {/* ── Right sidebar ── */}
          <RightCol>
            <BenefitsCard $variant="outlined" $padding="lg" $radius="lg">
              <BenefitRow><Check /> One-time Payment</BenefitRow>
              <BenefitRow><Check /> Instant Download</BenefitRow>
              <BenefitRow><Check /> Video Setup Guides</BenefitRow>
              <BenefitRow><Check /> Customization Guide</BenefitRow>
              <BenefitRow><Check /> Lifetime Updates</BenefitRow>

              <BtnGroup>
                {FEATURES.ENABLE_POLAR_CHECKOUT && etsyId && !isFree && (
                  <Button
                    $variant="primary"
                    $size="lg"
                    $fullWidth
                    onClick={handleBuyNow}
                    disabled={buying}
                  >
                    {buying ? 'Opening checkout…' : `Buy Now · ${template.price}`}
                  </Button>
                )}
                {/* Free download still uses the cart/Add-to-Cart path */}
                {isFree && FEATURES.ENABLE_LOCAL_CHECKOUT && (
                  inCart ? (
                    <AddedBtn onClick={() => removeItem(template.id)}>
                      <span className="added-label"><Check /> Added</span>
                      <span className="remove-label">Remove</span>
                    </AddedBtn>
                  ) : (
                    <Button $variant="primary" $size="lg" $fullWidth onClick={handleAddToCart}>
                      <ShoppingCart /> Get for Free
                    </Button>
                  )
                )}
                {buyError && (
                  <ErrorDisclosure>{buyError}</ErrorDisclosure>
                )}
                {template.etsyUrl && (
                  <>
                    <Button
                      as="a"
                      href={template.etsyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      /* Outline only while a primary "Buy Now" sits above it.
                         With Polar checkout off, Etsy is the single path to
                         purchase, so it takes the primary weight — the mobile
                         bar already switches the same way. */
                      $variant={FEATURES.ENABLE_POLAR_CHECKOUT && etsyId && !isFree ? 'outline' : 'primary'}
                      $size="lg"
                      $fullWidth
                    >
                      Buy on Etsy
                    </Button>
                    <EtsyDisclosure>
                      Etsy is an alternative if you prefer — prices may vary by location and their terms apply.
                    </EtsyDisclosure>
                  </>
                )}
              </BtnGroup>
            </BenefitsCard>

            {template.pagesGrouped ? (
              <>
                {/* Header lives OUTSIDE the PagesCard — same pattern
                    as Template Overview / Key Features (free-standing
                    section heading above its content). The card below
                    only carries accordion rows. */}
                <PagesGroupedHeader>
                  {/* Inline margin: 0 so the SectionTitle's default
                      bottom margin doesn't double up with the header
                      wrapper's spacing. Font-size inherits from the
                      shared SectionTitle (18 on mobile per the page
                      headlines rule, h2-tier on desktop). */}
                  <SidebarSectionTitle style={{ margin: 0 }}>Pages Included</SidebarSectionTitle>
                  <PagesGroupedSubtitle>
                    {template.pagesGrouped.reduce((n, g) => n + g.pages.length, 0)} pages across {template.pagesGrouped.length} sections
                  </PagesGroupedSubtitle>
                </PagesGroupedHeader>
                <PagesCard $variant="outlined" $padding="none" $radius="lg">
                  {template.pagesGrouped.map((g, i) => (
                    <PagesAccordionGroup
                      key={g.section}
                      section={g.section}
                      pages={g.pages}
                      open={openPagesIdx === i}
                      onToggle={() => setOpenPagesIdx(prev => (prev === i ? -1 : i))}
                      isLast={i === template.pagesGrouped!.length - 1}
                    />
                  ))}
                </PagesCard>
              </>
            ) : (
              <PagesCard $variant="outlined" $padding="none" $radius="lg">
                <SectionTitle>Pages Included</SectionTitle>
                <PagesList>
                  {(showAllPages ? template.pagesIncluded : template.pagesIncluded.slice(0, 3)).map((p, i) => (
                    <PagesItem key={i}>{p}</PagesItem>
                  ))}
                </PagesList>
                {template.pagesIncluded.length > 3 && !showAllPages && (
                  <ShowMoreLink onClick={() => setShowAllPages(true)}>
                    +{template.pagesIncluded.length - 3} more pages
                  </ShowMoreLink>
                )}
              </PagesCard>
            )}

            {/* Related Templates — desktop position (last block in the
                sticky right column). On mobile this block re-renders
                at the very bottom of the page via <MobileOnlyAt
                $order={5}> below. */}
            <DesktopOnly>
              <SectionTitle style={{ fontSize: '16px', marginTop: '52px', marginBottom: '16px' }}>Related Templates</SectionTitle>
              <RelatedGrid>
                {related.map(r => (
                  <RelatedCard key={r.id} onClick={() => navigate(`/templates/${r.id}`)}>
                    <RelatedPreview><WebpImage src={r.image} alt={r.title} loading="lazy" /></RelatedPreview>
                    <RelatedThumbSlot>
                      <TemplateMockupCard $size="thumb" $interactive>
                        <TemplateMockupImage $size="thumb" src={r.image} alt={r.title} />
                      </TemplateMockupCard>
                    </RelatedThumbSlot>
                    <RelatedInfo>
                      <RelatedTitle>{r.title}</RelatedTitle>
                      <RelatedPrice>{r.price}</RelatedPrice>
                    </RelatedInfo>
                  </RelatedCard>
                ))}
              </RelatedGrid>
            </DesktopOnly>
          </RightCol>

          {/* Mobile-only Related Templates — sits at the very end
              (order 5, after BottomSection). Per c_moh79ywx "этот блок
              последний в телефоне". */}
          <MobileOnlyAt $order={5}>
            <SectionTitle>Related Templates</SectionTitle>
            <RelatedGrid>
              {related.map(r => (
                <RelatedCard key={r.id} onClick={() => navigate(`/templates/${r.id}`)}>
                  <RelatedPreview><WebpImage src={r.image} alt={r.title} loading="lazy" /></RelatedPreview>
                  <RelatedThumbSlot>
                    <TemplateMockupCard $size="thumb" $interactive>
                      <TemplateMockupImage $size="thumb" $hoverZoom={false} src={r.image} alt={r.title} />
                    </TemplateMockupCard>
                  </RelatedThumbSlot>
                  <RelatedInfo>
                    <RelatedTitle>{r.title}</RelatedTitle>
                    <RelatedPrice>{r.price}</RelatedPrice>
                  </RelatedInfo>
                </RelatedCard>
              ))}
            </RelatedGrid>
          </MobileOnlyAt>
        </TwoCol>
      </Content>

      {/* clearStickyBar — page renders a fixed <MobileBuyBar> below, so
          the footer pushes its bottom up by ~120px on mobile. Otherwise
          the bar's glass surface clips the footer's last row at scroll
          end. Per "сейчас футер съедает, надо править". */}
      <LandingFooter
        onNavigate={(path) => navigate(path)}
        clearStickyBar
      />

      {/* Mobile sticky buy bar — single row of action CTAs. The Polar
          price embeds inside the Buy Now label ("Buy Now · $9.00")
          since the price is controlled here; Etsy's button is plain
          ("Buy on Etsy") because the Etsy listing's price is set on
          their side and may differ. The in-page <BtnGroup> hides these
          buttons on mobile so the bar is the only fulfillment surface
          on phone. */}
      {((FEATURES.ENABLE_POLAR_CHECKOUT && etsyId) || template.etsyUrl || FEATURES.ENABLE_LOCAL_CHECKOUT) && (
        <MobileBuyBar>
          {FEATURES.ENABLE_LOCAL_CHECKOUT && inCart ? (
            <Button $variant="success" $size="lg" onClick={() => removeItem(template.id)}>
              <Check /> Added
            </Button>
          ) : (
            <>
              {FEATURES.ENABLE_POLAR_CHECKOUT && etsyId && !isFree && (
                <Button $variant="primary" $size="lg" onClick={handleBuyNow} disabled={buying}>
                  {buying ? 'Opening…' : `Buy Now · ${template.price}`}
                </Button>
              )}
              {template.etsyUrl && (
                <Button
                  $variant={FEATURES.ENABLE_POLAR_CHECKOUT && etsyId && !isFree ? 'secondary' : 'primary'}
                  $size="lg"
                  as="a"
                  href={template.etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isFree ? 'Get for Free' : 'Buy on Etsy'}
                </Button>
              )}
              {/* Local-checkout fallback when neither Polar nor Etsy
                  is configured — keeps the bar useful for free items
                  and dev environments. Embeds price for Polar parity. */}
              {!etsyId && !template.etsyUrl && (
                <Button $variant="primary" $size="lg" onClick={handleAddToCart}>
                  {isFree ? 'Get for Free' : `Add to Cart · ${template.price}`}
                </Button>
              )}
            </>
          )}
        </MobileBuyBar>
      )}

      {lightboxIdx !== null && (
        <Lightbox
          images={gallery}
          startIdx={lightboxIdx}
          alt={template.title}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </PageWrapper>
  );
};

/* Lightbox — fullscreen photo viewer with native horizontal swipe via
 * scroll-snap. Opens at startIdx, lets the user swipe between gallery
 * items, closes on × button, backdrop tap, or Escape. Body scroll is
 * locked while open. */
const Lightbox: React.FC<{
  images: string[];
  startIdx: number;
  alt: string;
  onClose: () => void;
}> = ({ images, startIdx, alt, onClose }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(startIdx);

  useEffect(() => {
    /* Scroll the track to startIdx on open. instant — no animated jump
     * from slide 0. */
    const track = trackRef.current;
    if (track) {
      track.scrollTo({ left: startIdx * track.clientWidth, behavior: 'auto' });
    }
    /* Body scroll lock + Escape handler. */
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [startIdx, onClose]);

  /* Update the active index based on scroll position so the counter
   * tracks the slide the user is currently on. */
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <LightboxBackdrop onClick={onClose}>
      <LightboxClose onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close">×</LightboxClose>
      {/* Track no longer stops propagation — clicks anywhere outside
          the image (slide padding, around the image, etc) bubble up to
          the backdrop and close. The image itself swallows clicks so
          tapping the photo doesn't dismiss. Per "тыкаю за картинку —
          закрывается" (c_2026-04-28). */}
      <LightboxTrack ref={trackRef} onScroll={onScroll}>
        {images.map((src, i) => (
          <LightboxSlide key={i}>
            <img
              src={src}
              alt={`${alt} — ${i + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
          </LightboxSlide>
        ))}
      </LightboxTrack>
      {images.length > 1 && (
        <LightboxCounter>{active + 1} / {images.length}</LightboxCounter>
      )}
    </LightboxBackdrop>
  );
};
