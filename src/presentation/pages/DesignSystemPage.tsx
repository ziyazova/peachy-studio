import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import {
  Button,
  FilterChip,
  FilterRow,
  Segment,
  SegmentGroup,
  AccountPill,
  AccountDropdown,
  PeachAvatar,
  PillChevron,
  DropdownUserRow,
  DropdownUserText,
  DropdownName,
  DropdownEmail,
  DropdownDivider,
  DropdownSpacer,
  DropdownMenuGroup,
  ProPlanRow,
  ProPlanLabel,
  ProManageLink,
  UpgradeInner,
  UpgradePrice,
  Tag,
  PlanBadge,
  PopularPill,
  Footer,
  TemplateMockupCard,
  TemplateMockupImage,
  Switch,
  ToggleTabs,
  ToggleRow,
  ToggleLabel,
  Input,
  FormField,
  PlanUsageCard,
  CopyButton,
  Modal,
  ModalFooter,
  GradientBanner,
  BannerBody,
  BannerText,
  UpgradeModal,
} from '../components/shared';
import {
  BannerIcon, BannerTitle, BannerActions,
  ToastShell, ToastIconBubble, ToastMessage,
  ConsentBannerWrap, ConsentBannerIcon, ConsentBannerMessage, ConsentBannerPrivacyLink, ConsentBannerActions,
  InfoBanner, InfoBannerIcon, InfoBannerBody, InfoBannerTitle, InfoBannerSub,
} from '../components/shared';
import {
  EmailVerificationBar,
  EmailVerificationIcon,
  EmailVerificationBody,
  EmailVerificationTitle,
  EmailVerificationSub,
  EmailVerificationActions,
  EmailVerificationResendBtn,
  EmailVerificationCloseBtn,
} from '../components/shared/EmailVerificationBanner';
import {
  Plus, Trash2, Copy, ArrowRight,
  Settings, Sparkles,
  LogOut, Home, Mail, Lock, Eye, EyeOff, Check,
  Cookie, X, Clock, BadgePercent, Link2, BadgeCheck,
  Palette, Pencil, ShieldCheck,
  Calendar as CalIcon, Image as ImgIcon, FileText, LayoutGrid,
  Wand2, Type, LayoutDashboard,
} from 'lucide-react';
import {
  buttonVariantTokens,
  buttonSizeTokens,
  ButtonVariant,
  ButtonSize,
} from '../themes/buttonTokens';
import { filterChipSize } from '../themes/filterChipTokens';
import { TopNav } from '../components/layout/TopNav';
import { BigFooter } from '../components/landing/BigFooter';

/* ═══ Mirror imports ═══
 * These are the REAL prod components, rendered in the showcase so that
 * editing any of them in the source file updates both prod and this page.
 * No local re-implementations — single source of truth. */
import {
  EmptyBox, EmptyCircle, EmptyTitle, EmptyHint,
  CreateCard, CreateIconWrap, CreateCardText, CreateCardTitle, CreateCardHint,
  BigCard, BigCardPreview, BigCardLabel, BigCardBottom, BigCardName, BigCardActions,
} from '../components/dashboard/DashboardViews';
import {
  MobileArtboard, MobileDotGrid,
  MobileSectionTabs, MobileSectionTab,
  WidgetCard, WidgetPreviewWrap, WidgetBottom, WidgetName, WidgetActions,
  /* Shared styled-tokens — edit them in StudioPage.tsx and the DS shows
     the change live (single source of truth, not a copy). Aliased because
     `BannerTitle` already imports from shared GradientBanner above. */
  BannerSurface,
  BannerTitle as DashBannerTitle,
  BannerSub as DashBannerSub,
  BannerCta as DashBannerCta,
} from './StudioPage';
import { PurchaseCard, PurchaseImg } from '@/presentation/components/dashboard/PurchaseList';
import { LoginModal } from '../components/auth/LoginModal';
import { ColorPicker } from '../components/ui/ColorPicker';
import {
  widgetColors, backgroundColors, accentColors,
} from '../themes/colors';

/**
 * DesignSystemPage — live showcase rendered straight from tokens.
 *
 * Reads `buttonTokens.ts` + `filterChipTokens.ts` directly. Changing a token
 * updates both this page AND every real use-site in the app — so this page is
 * a trustworthy preview of what users will see.
 *
 * Route: `/dev` (dev-only, `/dev/v2` is kept as an alias for old bookmarks).
 * See App.tsx.
 */

const ALL_VARIANTS: ButtonVariant[] = Object.keys(buttonVariantTokens) as ButtonVariant[];
const ALL_SIZES: ButtonSize[] = Object.keys(buttonSizeTokens) as ButtonSize[];

/* Mirror of `theme.typography.sizes` used by the Typography showcase.
   Kept here so the DS reads the same order as the token file. */
const TYPOGRAPHY_SIZES: Record<string, string> = {
  '2xs': '10px',
  xs: '11px',
  sm: '12px',
  md: '13px',
  base: '14px',
  lg: '15px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '20px',
  '4xl': '22px',
  '5xl': '26px',
  '6xl': '28px',
  '7xl': '32px',
  '8xl': '40px',
};

/* What each size is actually used for in the app — sourced from the
   inline comments in `theme.ts`. */
const TYPOGRAPHY_USAGE: Record<string, string> = {
  '2xs': 'CardBadge · MobileSectionTab',
  xs: 'PlanBadge xs · Tag',
  sm: 'captions · muted labels',
  md: 'small body · buttons · filter chips',
  base: 'default body · CTA label',
  lg: 'emphasised body · SectionTitle sm',
  xl: 'link text · navbar items',
  '2xl': 'section headlines',
  '3xl': 'SectionTitle',
  '4xl': 'large section',
  '5xl': 'mobile page title',
  '6xl': 'welcome h1',
  '7xl': 'hero · page title',
  '8xl': 'landing hero',
};

/* Mirror of `theme.typography.letterSpacing`. */
const TYPOGRAPHY_LETTER_SPACING: Array<{
  name: string;
  value: string;
  usage: string;
}> = [
  { name: 'widest', value: '0.06em', usage: 'UPPERCASE pills · micro-tabs' },
  { name: 'normal', value: '0', usage: 'default · captions · muted labels' },
  { name: 'loose', value: '-0.005em', usage: 'small headlines · SectionTitle' },
  { name: 'tight', value: '-0.01em', usage: 'body emphasis · inline links' },
  { name: 'tighter', value: '-0.02em', usage: 'H2 · large section titles' },
  { name: 'tightest', value: '-0.03em', usage: 'hero · page title · H1' },
];

/* App typography presets — one common system used across Dashboard,
   Studio, Shop, Sidebar, Settings. Source: `studioTypography.ts`.
   `usedIn` lists all zones each preset applies to — some overlap
   (same preset serves multiple zones), some are zone-specific. */
type AppTextSpec = {
  name: string;
  variant: 'pageTitle' | 'subtitle' | 'sectionTitle' | 'cardTitle' | 'cardTitleSm' | 'body' | 'caption';
  usedIn: string[];
  size: keyof typeof TYPOGRAPHY_SIZES;
  weight: 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight: 'tight' | 'snug' | 'normal' | 'relaxed';
  letterSpacing: 'widest' | 'normal' | 'loose' | 'tight' | 'tighter' | 'tightest';
  sample: string;
};

const WEIGHT_VALUES = { normal: 400, medium: 500, semibold: 600, bold: 700 } as const;
const LINE_HEIGHT_VALUES = { tight: 1.2, snug: 1.3, normal: 1.5, relaxed: 1.6 } as const;
const LETTER_SPACING_VALUES = {
  widest: '0.06em',
  normal: '0',
  loose: '-0.005em',
  tight: '-0.01em',
  tighter: '-0.02em',
  tightest: '-0.03em',
} as const;

const LANDING_TEXT_STYLES: Array<{
  name: string;
  variant: string;
  helper: 'textStyle' | 'Text';
  size: keyof typeof TYPOGRAPHY_SIZES;
  weight: 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight: 'tight' | 'snug' | 'normal' | 'relaxed';
  letterSpacing: 'widest' | 'normal' | 'loose' | 'tight' | 'tighter' | 'tightest';
  sample: string;
  uppercase?: boolean;
  usedIn: string[];
}> = [
  {
    name: 'H1 · Page title',
    variant: 'h1',
    helper: 'textStyle',
    size: '7xl',
    weight: 'semibold',
    lineHeight: 'tight',
    letterSpacing: 'tightest',
    sample: 'Welcome back to Peachy',
    usedIn: ['LoginPage', 'Auth pages'],
  },
  {
    name: 'H2 · Section',
    variant: 'h2',
    helper: 'textStyle',
    size: '4xl',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tighter',
    sample: 'Choose your plan',
    usedIn: ['TemplateDetail', 'FAQ'],
  },
  {
    name: 'H3 · Card title',
    variant: 'h3',
    helper: 'textStyle',
    size: '2xl',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tight',
    sample: 'Calendar Collage',
    usedIn: ['Feature card', 'Testimonial title'],
  },
  {
    name: 'Subtitle',
    variant: 'subtitle',
    helper: 'textStyle',
    size: 'xl',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'tight',
    sample: 'Notion planners, trackers & productivity systems',
    usedIn: ['TemplatesPage', 'TemplateDetail hero'],
  },
  {
    name: 'Body',
    variant: 'body',
    helper: 'textStyle',
    size: 'base',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'loose',
    sample: 'Customize every pixel, save, and embed — takes under a minute.',
    usedIn: ['Landing paragraph', 'FAQ answer'],
  },
  {
    name: 'Button',
    variant: 'button',
    helper: 'textStyle',
    size: 'base',
    weight: 'semibold',
    lineHeight: 'tight',
    letterSpacing: 'loose',
    sample: 'Get started',
    usedIn: ['Shared <Button>'],
  },
  {
    name: 'Caption',
    variant: 'caption',
    helper: 'textStyle',
    size: 'sm',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    sample: 'No credit card required',
    usedIn: ['BigFooter copyright', 'Form helpers'],
  },
];

const STUDIO_TEXT_STYLES: AppTextSpec[] = [
  {
    name: 'Page title',
    variant: 'pageTitle',
    usedIn: ['Studio (Welcome)', 'Settings', 'Shop'],
    size: '6xl',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tightest',
    sample: 'Welcome back',
  },
  {
    name: 'Subtitle',
    variant: 'subtitle',
    usedIn: ['Studio (WelcomeSub)', 'Templates page', 'TemplateDetail'],
    size: 'xl',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'tight',
    sample: 'Manage your widgets and templates',
  },
  {
    name: 'Section title',
    variant: 'sectionTitle',
    usedIn: ['Studio', 'Settings'],
    size: '2xl',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tighter',
    sample: 'Your widgets',
  },
  {
    name: 'Card title',
    variant: 'cardTitle',
    usedIn: ['Dashboard', 'Shop'],
    size: 'base',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tight',
    sample: 'Weekly Planner',
  },
  {
    name: 'Card title · sm',
    variant: 'cardTitleSm',
    usedIn: ['Studio (WidgetCard)', 'DashboardViews'],
    size: 'md',
    weight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tight',
    sample: 'Modern Grid',
  },
  {
    name: 'Body',
    variant: 'body',
    usedIn: ['Modals (delete confirm)', 'Studio helper text'],
    size: 'base',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'loose',
    sample: 'Are you sure you want to delete this widget?',
  },
  {
    name: 'Caption',
    variant: 'caption',
    usedIn: ['Dashboard meta', 'Purchase row dates'],
    size: 'sm',
    weight: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    sample: 'Mar 22, 2026 · #PY-1042',
  },
];

export const DesignSystemPage: React.FC = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState<string>('all');
  const [showRawTokens, setShowRawTokens] = useState<boolean>(false);

  /* Live modal demos — each key opens the matching <Modal> instance below. */
  type ModalKey =
    | null
    | 'deleteWidget'
    | 'nameWidget'
    | 'deleteAccount'
    | 'changePassword'
    | 'resetPassword'
    | 'upgrade'
    | 'limitReached'
    | 'login'
    | 'signup';
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const closeModal = () => setOpenModal(null);

  /* Local form state for demo modals. */
  const [demoWidgetName, setDemoWidgetName] = useState('');
  const [demoDeleteConfirm, setDemoDeleteConfirm] = useState('');
  const [demoResetEmail, setDemoResetEmail] = useState('');
  const [demoResetSent, setDemoResetSent] = useState(false);
  const [demoPwSuccess, setDemoPwSuccess] = useState(false);

  /* Color picker showcase — drives the live <ColorPicker> demos so the DS
     mirrors the real Customize panel 1:1. */
  const [demoPrimary, setDemoPrimary] = useState<string>(widgetColors[1]);
  const [demoBackground, setDemoBackground] = useState<string>(backgroundColors[0]);
  const [demoAccent, setDemoAccent] = useState<string>(accentColors[1]);

  return (
    <Page>
      <Hero>
        <Pill>Live preview · Token-driven</Pill>
        <H1>Design system</H1>
        <Lead>
          Every element below is rendered straight from the token files.
          Edit a token → this page and every use-site update together.
        </Lead>
      </Hero>

      {/* Anchor TOC — sticky pill bar that jumps between the 6 mega-blocks
          (Foundations · Elements · Studio · Dashboard · Overlays · Chrome). */}
      <AnchorBar>
        <AnchorLink href="#foundations">01 Foundations</AnchorLink>
        <AnchorLink href="#elements">02 Elements</AnchorLink>
        <AnchorLink href="#studio">03 Widget Studio</AnchorLink>
        <AnchorLink href="#dashboard">04 Dashboard</AnchorLink>
        <AnchorLink href="#overlays">05 Overlays</AnchorLink>
        <AnchorLink href="#chrome">06 Site chrome</AnchorLink>
      </AnchorBar>

      <MegaTitle id="foundations" data-num="01 — Foundations">Tokens &amp; primitives</MegaTitle>

      {/* ─────── Typography ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Typography</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Type scale, fonts, and weights — all driven by <code>theme.typography.*</code>.
            Use the token name (e.g. <code>theme.typography.sizes.base</code>) instead
            of raw <code>px</code> values so a global bump stays one line.
          </div></MetaInfo>
        </SectionHeader>

        <SubTitle>Fonts</SubTitle>
        <FontFamilyRow>
          <FontFamilyTile>
            <FontFamilyName>primary</FontFamilyName>
            <FontFamilyStack>Inter · system fallback</FontFamilyStack>
            <FontFamilySample $mono={false}>
              The quick brown fox jumps over the lazy dog · 1234567890
            </FontFamilySample>
          </FontFamilyTile>
        </FontFamilyRow>

        <SubTitle style={{ marginTop: 40 }}>App / Studio</SubTitle>
        <CleanTypeList>
          {STUDIO_TEXT_STYLES.map((s) => (
            <CleanTypeRow key={s.name}>
              <CleanTypeName>{s.name}</CleanTypeName>
              <CleanTypeSample
                style={{
                  fontSize: TYPOGRAPHY_SIZES[s.size],
                  fontWeight: WEIGHT_VALUES[s.weight],
                  lineHeight: LINE_HEIGHT_VALUES[s.lineHeight],
                  letterSpacing: LETTER_SPACING_VALUES[s.letterSpacing],
                }}
              >
                {s.sample}
              </CleanTypeSample>
            </CleanTypeRow>
          ))}
        </CleanTypeList>

        <SubTitle style={{ marginTop: 40 }}>Landing / marketing</SubTitle>
        <CleanTypeList>
          {LANDING_TEXT_STYLES.map((s) => (
            <CleanTypeRow key={s.name}>
              <CleanTypeName>{s.name}</CleanTypeName>
              <CleanTypeSample
                style={{
                  fontSize: TYPOGRAPHY_SIZES[s.size],
                  fontWeight: WEIGHT_VALUES[s.weight],
                  lineHeight: LINE_HEIGHT_VALUES[s.lineHeight],
                  letterSpacing: LETTER_SPACING_VALUES[s.letterSpacing],
                  textTransform: s.uppercase ? 'uppercase' : 'none',
                }}
              >
                {s.sample}
              </CleanTypeSample>
            </CleanTypeRow>
          ))}
        </CleanTypeList>

        <RawTokensToggle
          type="button"
          onClick={() => setShowRawTokens((v) => !v)}
          aria-expanded={showRawTokens}
        >
          {showRawTokens ? '▴ Hide raw tokens' : '▾ Show raw tokens'}
          <RawTokensHint>
            {showRawTokens ? 'sizes · weights · letterSpacing' : 'for edge cases when presets don\'t fit'}
          </RawTokensHint>
        </RawTokensToggle>

        {showRawTokens && (
          <>
        <SubTitle style={{ marginTop: 24 }}>Size scale</SubTitle>
        <TypeScaleTable>
          {(Object.entries(TYPOGRAPHY_SIZES) as [string, string][]).map(([name, px]) => (
            <TypeScaleRow key={name}>
              <TypeScaleName title={`theme.typography.sizes.${name}`}>
                sizes.{name}
              </TypeScaleName>
              <TypeScaleValue>{px}</TypeScaleValue>
              <TypeScaleSample style={{ fontSize: px }}>
                The quick brown fox
              </TypeScaleSample>
              <TypeScaleUsage>{TYPOGRAPHY_USAGE[name] ?? ''}</TypeScaleUsage>
            </TypeScaleRow>
          ))}
        </TypeScaleTable>

        <SubTitle style={{ marginTop: 32 }}>Weights</SubTitle>
        <WeightRow>
          {([
            { name: 'normal', weight: 400 },
            { name: 'medium', weight: 500 },
            { name: 'semibold', weight: 600 },
            { name: 'bold', weight: 700 },
          ] as const).map((w) => (
            <WeightTile key={w.name} title={`theme.typography.weights.${w.name}`}>
              <WeightSample style={{ fontWeight: w.weight }}>Ag</WeightSample>
              <WeightName>weights.{w.name}</WeightName>
              <WeightValue>{w.weight}</WeightValue>
            </WeightTile>
          ))}
        </WeightRow>

        <SubTitle style={{ marginTop: 32 }}>Letter spacing</SubTitle>
        <LetterSpacingRow>
          {TYPOGRAPHY_LETTER_SPACING.map((ls) => (
            <LetterSpacingTile key={ls.name} title={`theme.typography.letterSpacing.${ls.name}`}>
              <LetterSpacingHeader>
                <LetterSpacingName>letterSpacing.{ls.name}</LetterSpacingName>
                <LetterSpacingValue>{ls.value}</LetterSpacingValue>
              </LetterSpacingHeader>
              <LetterSpacingSample
                style={{
                  letterSpacing: ls.value,
                  textTransform: ls.name === 'widest' ? 'uppercase' : 'none',
                }}
              >
                {ls.name === 'widest' ? 'Popular' : 'Typography'}
              </LetterSpacingSample>
              <LetterSpacingUsage>{ls.usage}</LetterSpacingUsage>
            </LetterSpacingTile>
          ))}
        </LetterSpacingRow>
          </>
        )}
      </Section>

      {/* ─────── Colors · gradients · glass ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Colors · gradients · glass</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Every swatch below comes straight from <code>theme.ts</code>.
            Edit a token → the whole app updates. Hex is shown so you can
            eyeball; semantic name is what you reach for in code.
          </div></MetaInfo>
        </SectionHeader>

        <SubTitle>Brand · accent</SubTitle>
        <SwatchGrid>
          <Swatch $bg="#6366F1"><SwName>accent</SwName><SwHex>#6366F1</SwHex></Swatch>
          <Swatch $bg="#4F46E5"><SwName>brand.indigoDark</SwName><SwHex>#4F46E5</SwHex></Swatch>
        </SwatchGrid>

        <SubTitle style={{ marginTop: 24 }}>Text</SubTitle>
        <SwatchGrid>
          <Swatch $bg="#1F1F1F"><SwName>text.primary</SwName><SwHex>#1F1F1F</SwHex></Swatch>
          <Swatch $bg="#555555"><SwName>text.body</SwName><SwHex>#555555</SwHex></Swatch>
          <Swatch $bg="#777777"><SwName>text.hint</SwName><SwHex>#777777</SwHex></Swatch>
          <Swatch $bg="#8E8E93"><SwName>text.tertiary</SwName><SwHex>#8E8E93</SwHex></Swatch>
          <Swatch $bg="#C7C7CC"><SwName>text.muted</SwName><SwHex>#C7C7CC</SwHex></Swatch>
          <Swatch $bg="#FFFFFF" $light><SwName>text.inverse</SwName><SwHex>#FFFFFF</SwHex></Swatch>
        </SwatchGrid>

        <SubTitle style={{ marginTop: 24 }}>Background · surface</SubTitle>
        <SwatchGrid>
          <Swatch $bg="#FFFFFF" $light><SwName>background.elevated</SwName><SwHex>#FFFFFF</SwHex></Swatch>
          <Swatch $bg="#FAFAFA" $light><SwName>background.surfaceAlt</SwName><SwHex>#FAFAFA</SwHex></Swatch>
          <Swatch $bg="#F5F5F5" $light><SwName>background.surfaceMuted</SwName><SwHex>#F5F5F5</SwHex></Swatch>
          <Swatch $bg="#F2F2F7" $light><SwName>background.surface</SwName><SwHex>#F2F2F7</SwHex></Swatch>
        </SwatchGrid>

        <SubTitle style={{ marginTop: 24 }}>Semantic · status</SubTitle>
        <SwatchGrid>
          <Swatch $bg="#3384F4"><SwName>state.active</SwName><SwHex>#3384F4</SwHex></Swatch>
          <Swatch $bg="#22C55E"><SwName>success.base</SwName><SwHex>#22C55E</SwHex></Swatch>
          <Swatch $bg="#16A34A"><SwName>success.fg</SwName><SwHex>#16A34A</SwHex></Swatch>
          <Swatch $bg="#15803D"><SwName>success.dark</SwName><SwHex>#15803D</SwHex></Swatch>
          <Swatch $bg="#92400E"><SwName>warning.text</SwName><SwHex>#92400E</SwHex></Swatch>
          <Swatch $bg="#F49B8B"><SwName>danger.soft</SwName><SwHex>#F49B8B</SwHex></Swatch>
          <Swatch $bg="#DC2828"><SwName>danger.strong</SwName><SwHex>#DC2828</SwHex></Swatch>
        </SwatchGrid>

        <SubTitle>Peach · warm palette</SubTitle>
        <SwatchGrid>
          <Swatch $bg="#2B2320"><SwName>peach.deep</SwName><SwHex>#2B2320</SwHex></Swatch>
          <Swatch $bg="#9B9790"><SwName>peach.muted</SwName><SwHex>#9B9790</SwHex></Swatch>
          <Swatch $bg="#B5B1A9"><SwName>peach.hint</SwName><SwHex>#B5B1A9</SwHex></Swatch>
        </SwatchGrid>

        <SubTitle style={{ marginTop: 24 }}>Gradients</SubTitle>
        <GradientGrid>
          <GradSwatch $bg="linear-gradient(135deg, #6366F1, #818CF8)"><SwNameLight>gradients.indigo</SwNameLight></GradSwatch>
          <GradSwatch $bg="linear-gradient(135deg, #3384F4, #5BA0F7)"><SwNameLight>gradients.blue</SwNameLight></GradSwatch>
          <GradSwatch $bg="linear-gradient(135deg, rgba(237,228,255,0.6) 0%, rgba(232,237,255,0.5) 40%, rgba(245,235,250,0.55) 100%), #FFF"><SwNameDark>gradients.softBanner</SwNameDark></GradSwatch>
          <GradSwatch $bg="linear-gradient(150deg, rgba(237, 228, 255, 0.7) 0%, rgba(232, 237, 255, 0.65) 25%, rgba(238, 234, 255, 0.6) 50%, rgba(245, 235, 250, 0.65) 75%, rgba(255, 240, 245, 0.7) 100%), #FFF"><SwNameDark>gradients.softBannerLarge</SwNameDark></GradSwatch>
          <GradSwatch $bg="linear-gradient(135deg, #FFD4BE 0%, #FDB8AE 45%, #F8A2B0 100%)"><SwNameLight>gradients.avatarPeach</SwNameLight></GradSwatch>
        </GradientGrid>

        <SubTitle>Glass surface</SubTitle>
        <GlassCheckerboard>
          <GlassSwatch $bg="rgba(255, 255, 255, 0.94)"><SwNameDark>background.glassBright</SwNameDark><SwHexDark>rgba(255,255,255,.94) + blur</SwHexDark></GlassSwatch>
        </GlassCheckerboard>
      </Section>

      {/* ─────── Radii ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Radii</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Corner-rounding scale. All multiples of 4, except <code>full</code>
            (for pills / avatars). One edit in <code>theme.radii</code>
            rounds the whole site to match. Source: <code>theme.ts</code>.
          </div></MetaInfo>
        </SectionHeader>
        <RadiiGrid>
          <RadiusTile $r="4px"><RadiusName>xs</RadiusName><RadiusPx>4</RadiusPx></RadiusTile>
          <RadiusTile $r="8px"><RadiusName>sm</RadiusName><RadiusPx>8</RadiusPx></RadiusTile>
          <RadiusTile $r="12px"><RadiusName>md</RadiusName><RadiusPx>12</RadiusPx></RadiusTile>
          <RadiusTile $r="16px"><RadiusName>lg</RadiusName><RadiusPx>16</RadiusPx></RadiusTile>
          <RadiusTile $r="20px"><RadiusName>xl</RadiusName><RadiusPx>20</RadiusPx></RadiusTile>
          <RadiusTile $r="24px"><RadiusName>2xl</RadiusName><RadiusPx>24</RadiusPx></RadiusTile>
          <RadiusTile $r="28px"><RadiusName>3xl</RadiusName><RadiusPx>28</RadiusPx></RadiusTile>
          <RadiusTile $r="9999px"><RadiusName>full</RadiusName><RadiusPx>pill</RadiusPx></RadiusTile>
        </RadiiGrid>
      </Section>

      {/* ─────── Shadows ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Shadows</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Elevation scale. From hairline to modal overlay.
            Edit <code>theme.shadows.*</code> to restyle every shadow on the site.
          </div></MetaInfo>
        </SectionHeader>
        <ShadowGrid>
          <ShadowTile $s="0 0.5px 1px rgba(0, 0, 0, 0.04), 0 0 0 0.5px rgba(0, 0, 0, 0.03)"><ShadowName>form</ShadowName></ShadowTile>
          <ShadowTile $s="0 1px 2px rgba(0, 0, 0, 0.02)"><ShadowName>cardFlat</ShadowName></ShadowTile>
          <ShadowTile $s="0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 0.5px rgba(0, 0, 0, 0.02)"><ShadowName>subtle</ShadowName></ShadowTile>
          <ShadowTile $s="0 2px 12px rgba(0, 0, 0, 0.03)"><ShadowName>card</ShadowName></ShadowTile>
          <ShadowTile $s="0 4px 20px rgba(0, 0, 0, 0.05)"><ShadowName>cardHover</ShadowName></ShadowTile>
          <ShadowTile $s="0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)"><ShadowName>popover</ShadowName></ShadowTile>
          <ShadowTile $s="0 8px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)"><ShadowName>floating</ShadowName></ShadowTile>
          <ShadowTile $s="0 16px 48px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.04)"><ShadowName>heavy</ShadowName></ShadowTile>
          <ShadowTile $s="0 32px 80px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)"><ShadowName>modal</ShadowName></ShadowTile>
          <ShadowTile $s="0 -8px 40px rgba(0, 0, 0, 0.1)"><ShadowName>sheet</ShadowName></ShadowTile>
          <ShadowTile $s="0 0 0 3px rgba(51, 132, 244, 0.1)"><ShadowName>focusBlue</ShadowName></ShadowTile>
          <ShadowTile $s="0 1px 4px rgba(99, 102, 241, 0.25)"><ShadowName>accentShadow.sm</ShadowName></ShadowTile>
          <ShadowTile $s="0 2px 8px rgba(51, 132, 244, 0.3)"><ShadowName>blueShadow.md</ShadowName></ShadowTile>
        </ShadowGrid>
      </Section>

      {/* ─────── Transitions ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Transitions</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Motion timings. Hover a tile to see its curve — each box
            nudges + colour-shifts with the named transition. Keep timings
            consistent: pick the closest preset instead of writing custom.
          </div></MetaInfo>
        </SectionHeader>
        <TransitionGrid>
          <TransitionTile $t="0.15s ease"><TransitionName>fast</TransitionName><TransitionHint>0.15s</TransitionHint></TransitionTile>
          <TransitionTile $t="0.2s ease"><TransitionName>medium</TransitionName><TransitionHint>0.2s</TransitionHint></TransitionTile>
          <TransitionTile $t="0.25s ease"><TransitionName>base</TransitionName><TransitionHint>0.25s</TransitionHint></TransitionTile>
          <TransitionTile $t="0.28s cubic-bezier(0.22, 1, 0.36, 1)"><TransitionName>spring</TransitionName><TransitionHint>0.28s spring</TransitionHint></TransitionTile>
        </TransitionGrid>
      </Section>

      {/* ─────── Surfaces, panels & composition ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Surfaces, panels &amp; composition</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Floating + inline surfaces that sit on top of the page — cookie
            consent, email verification, soft upsell banners, toast. All
            token-driven; edit <code>theme.colors.*</code> or per-component
            tokens to restyle site-wide.
          </div></MetaInfo>
        </SectionHeader>
        <SurfaceCard>
          <VariantLabel>Cookie consent — floating, slide-up (from <code>ConsentBanner.tsx</code>)</VariantLabel>
          {/* Rendered inline for preview — the real banner uses position:fixed
              and auto-hides via localStorage once accepted. Styled bits
              imported directly from ConsentBanner.tsx — 1-to-1 mirror. */}
          <ConsentBannerWrap role="dialog" aria-label="Cookie consent preview" style={{ position: 'static', transform: 'none', left: 'auto', bottom: 'auto', animation: 'none' }}>
            <ConsentBannerIcon><Cookie /></ConsentBannerIcon>
            <ConsentBannerMessage>
              We use cookies to keep you signed in and save your preferences. By continuing,
              you agree to our <ConsentBannerPrivacyLink to="/privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</ConsentBannerPrivacyLink>.
            </ConsentBannerMessage>
            <ConsentBannerActions>
              <Button $variant="primary" $size="sm">Accept</Button>
            </ConsentBannerActions>
          </ConsentBannerWrap>

          <VariantLabel style={{ marginTop: 28 }}>Email verification — amber card (<code>EmailVerificationBanner.tsx</code>)</VariantLabel>
          <EmailVerificationBar role="status">
            <EmailVerificationIcon><ShieldCheck /></EmailVerificationIcon>
            <EmailVerificationBody>
              <EmailVerificationTitle>Verify your email</EmailVerificationTitle>
              <EmailVerificationSub>Needed to save widgets and publish embeds.</EmailVerificationSub>
            </EmailVerificationBody>
            <EmailVerificationActions>
              <EmailVerificationResendBtn type="button">Resend link</EmailVerificationResendBtn>
              <EmailVerificationCloseBtn type="button" aria-label="Dismiss">
                <X />
              </EmailVerificationCloseBtn>
            </EmailVerificationActions>
          </EmailVerificationBar>

          <VariantLabel style={{ marginTop: 28 }}>
            Subtle · indigo — primary upsell row
          </VariantLabel>
          <GradientBanner $tone="indigo">
            <BannerIcon $tone="indigo" $emphasis="subtle"><Sparkles /></BannerIcon>
            <BannerBody>
              <BannerTitle>Go unlimited with Peachy Pro</BannerTitle>
              <BannerText>You've reached the free limit · 3 of 3 used</BannerText>
            </BannerBody>
            <BannerActions>
              <Button $variant="ghost" $size="sm">Later</Button>
              <Button $variant="accent" $size="sm"><Sparkles /> Upgrade</Button>
            </BannerActions>
          </GradientBanner>

          <VariantLabel style={{ marginTop: 24 }}>
            Info rows — neutral white card, colored icon only ·{' '}
            <code>InfoBanner.tsx</code>
          </VariantLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoBanner>
              <InfoBannerIcon $tone="blue"><Link2 /></InfoBannerIcon>
              <InfoBannerBody>
                <InfoBannerTitle>Embed code copied</InfoBannerTitle>
                <InfoBannerSub>Paste into Notion with /embed</InfoBannerSub>
              </InfoBannerBody>
            </InfoBanner>
            <InfoBanner>
              <InfoBannerIcon $tone="sage"><Check /></InfoBannerIcon>
              <InfoBannerBody>
                <InfoBannerTitle>Widget saved</InfoBannerTitle>
                <InfoBannerSub>Synced to your account</InfoBannerSub>
              </InfoBannerBody>
            </InfoBanner>
            <InfoBanner>
              <InfoBannerIcon $tone="mute"><Clock /></InfoBannerIcon>
              <InfoBannerBody>
                <InfoBannerTitle>Heads up, Notion caches for ~5 min</InfoBannerTitle>
                <InfoBannerSub>Changes may take a moment to appear in your page</InfoBannerSub>
              </InfoBannerBody>
            </InfoBanner>
          </div>

          <VariantLabel style={{ marginTop: 28 }}>Toast — transient success pill (used in Studio on copy)</VariantLabel>
          {/* Rendered inline for preview — the real toast uses position:fixed. */}
          <ToastShell $tone="success" style={{ position: 'static', transform: 'none', left: 'auto', bottom: 'auto' }}>
            <ToastIconBubble $tone="success"><Check /></ToastIconBubble>
            <ToastMessage>Embed URL copied</ToastMessage>
          </ToastShell>
        </SurfaceCard>
      </Section>

      <MegaTitle id="elements" data-num="02 — Elements">Atoms — buttons, chips, forms, badges</MegaTitle>

      {/* ─────── Buttons ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Buttons · variants</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            {ALL_VARIANTS.length} variants at <code>md</code> · <code>buttonTokens.ts</code>.
          </div></MetaInfo>
        </SectionHeader>

        <VariantGallery>
          {ALL_VARIANTS.map((v) => (
            <VariantTile key={v}>
              <Button $variant={v} $size="md">{v === 'link' ? 'link' : 'Button'}</Button>
              <VariantName>{v}</VariantName>
            </VariantTile>
          ))}
        </VariantGallery>
      </Section>

      {/* ─────── Sizes ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Sizes</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            {ALL_SIZES.length} sizes · primary variant shown · <code>buttonSizeTokens</code>.
          </div></MetaInfo>
        </SectionHeader>
        <SizeRow>
          {ALL_SIZES.map((s) => (
            <SizeCol key={s}>
              <Button $variant="primary" $size={s}>Button</Button>
              <SizeCaption>
                <b>{s}</b> · {buttonSizeTokens[s].height}
              </SizeCaption>
            </SizeCol>
          ))}
        </SizeRow>
      </Section>

      {/* ─────── Options ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Options</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">Icons · icon-only · disabled.</div></MetaInfo>
        </SectionHeader>
        <Row>
          <Button $variant="primary" $size="md"><Plus /> Create</Button>
          <Button $variant="outline" $size="md">Continue <ArrowRight /></Button>
          <CopyButton value="https://1calendar-widget.vercel.app/embed/calendar?c=DEMO" $size="md" />
          <Button $variant="danger" $size="md" $iconOnly aria-label="Delete"><Trash2 /></Button>
          <Button $variant="primary" $size="md" disabled>disabled</Button>
        </Row>
      </Section>

      {/* ─────── Filter chips ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Filter chips</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Selectable pills — {filterChipSize.height} tall · <code>filterChipTokens.ts</code>.
          </div></MetaInfo>
        </SectionHeader>
        <FilterRow>
          {['all', 'planners', 'student', 'wellness', 'finance', 'focus'].map((c) => (
            <FilterChip
              key={`rect-${c}`}
              $active={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </FilterChip>
          ))}
        </FilterRow>
      </Section>

      {/* ─────── Labels & badges ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Labels &amp; badges</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Production-used chips. <code>Tag</code> default — outline pill on
            card art (lowercase). <code>Tag $accent</code> — translucent
            indigo fill on Studio saved widgets. <code>PlanBadge</code> —
            gradient pill for Pro / Free / Popular ($size xs vs sm). Token
            source: <code>labelTokens.ts</code>.
          </div></MetaInfo>
        </SectionHeader>

        <CleanTypeList>
          <CleanTypeRow style={{ alignItems: 'center' }}>
            <CleanTypeName>Tag</CleanTypeName>
            <Row>
              <Tag>calendar</Tag>
              <Tag>clock</Tag>
              <Tag>board</Tag>
            </Row>
          </CleanTypeRow>
          <CleanTypeRow style={{ alignItems: 'center' }}>
            <CleanTypeName>Tag · accent</CleanTypeName>
            <Row>
              <Tag $accent>calendar</Tag>
              <Tag $accent>clock</Tag>
              <Tag $accent>board</Tag>
            </Row>
          </CleanTypeRow>
          <CleanTypeRow style={{ alignItems: 'center' }}>
            <CleanTypeName>PlanBadge · xs</CleanTypeName>
            <Row>
              <PlanBadge $pro $size="xs">Pro</PlanBadge>
              <PlanBadge $size="xs">Free</PlanBadge>
              <PlanBadge $pro $size="xs">Popular</PlanBadge>
            </Row>
          </CleanTypeRow>
          <CleanTypeRow style={{ alignItems: 'center' }}>
            <CleanTypeName>PlanBadge · sm</CleanTypeName>
            <Row>
              <PlanBadge $pro>Pro</PlanBadge>
              <PlanBadge>Free</PlanBadge>
              <PlanBadge $pro>Popular</PlanBadge>
            </Row>
          </CleanTypeRow>
        </CleanTypeList>
      </Section>

      <MegaTitle id="studio" data-num="03 — Widget Studio">Composites — editor surfaces</MegaTitle>

      {/* ─────── Form controls ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Widget Studio · form controls</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Switch · ToggleTabs · Input — used in CustomizationPanel ·{' '}
            <code>toggleTokens.ts</code> · <code>inputTokens.ts</code>.
          </div></MetaInfo>
        </SectionHeader>

        <SurfaceCard>
          <FormControlsDemo />
        </SurfaceCard>
      </Section>

      {/* ─────── Mobile tab bar ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Widget Studio · mobile tab bar</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            The 4-tab bar that sits at the bottom of Studio on mobile (≤768px):{' '}
            <strong>Style · Content · Color · Layout</strong>. Icon + 11px
            semibold label · 48px tall · rounded 12px · active gets{' '}
            <code>state.activeWash</code> + <code>state.active</code> colour.
            Disabled tabs use <code>text.muted</code>. Sits under the{' '}
            <code>MobileArtboard</code> (gradient + dot grid). See{' '}
            <code>MobileSectionTabs</code> in <code>StudioPage.tsx</code>.
          </div></MetaInfo>
        </SectionHeader>
        {/* Bare mirror — no SurfaceCard chrome. Phone-viewport sizing is the
            only DS-specific style; everything else (MobileArtboard gradient
            + margin + border + dot grid overlay, MobileSectionTabs bottom bar
            + tab look) comes straight from StudioPage.tsx. */}
        <div style={{ maxWidth: 360, height: 320, display: 'flex', flexDirection: 'column', background: theme.colors.background.elevated, borderRadius: theme.radii.lg }}>
          <MobileArtboard>
            <MobileDotGrid />
            <img
              src="/gallery-calendar-classic.png"
              alt="Widget preview"
              style={{ position: 'relative', zIndex: 1, width: '70%', height: 'auto', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
            />
          </MobileArtboard>
          <MobileSectionTabs>
            <MobileSectionTab $active={false} type="button"><Wand2 />Style</MobileSectionTab>
            <MobileSectionTab $active={true} type="button"><Type />Content</MobileSectionTab>
            <MobileSectionTab $active={false} type="button"><Palette />Color</MobileSectionTab>
            <MobileSectionTab $active={false} $disabled type="button"><LayoutDashboard />Layout</MobileSectionTab>
          </MobileSectionTabs>
        </div>
        <SectionMeta style={{ marginTop: 12 }}>
          Icons: <code>Wand2</code> · <code>Type</code> · <code>Palette</code> · <code>LayoutDashboard</code> (lucide).
          Active = icon + label flip to <code>accent</code> only — no background card highlight.
          Disabled (Layout above) = muted text + 0.5 opacity.
        </SectionMeta>
      </Section>

      <MegaTitle id="dashboard" data-num="04 — Dashboard">Composites — banner, plan, account, purchases</MegaTitle>

      {/* ─────── Segmented tabs ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Dashboard · segmented tabs</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Tab-switch · active = paper tile on neutral · <code>segmentTokens.ts</code>.
          </div></MetaInfo>
        </SectionHeader>

        <SurfaceCard>
          <SegmentDemo />
        </SurfaceCard>
      </Section>

      {/* ─────── Dashboard account menu ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Dashboard · account menu</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Top-nav pill + dropdown (free / pro states) · <code>AccountMenu.tsx</code>.
          </div></MetaInfo>
        </SectionHeader>

        <SurfaceCard>
          <VariantLabel>Trigger pill — idle &amp; opened</VariantLabel>
          <Row style={{ gap: 24, marginBottom: 16 }}>
            <AccountPill $open={false} type="button">
              <PeachAvatar $size={30} $fontSize={11}>GU</PeachAvatar>
              Dashboard
              <PillChevron $open={false} />
            </AccountPill>
            <AccountPill $open={true} type="button">
              <PeachAvatar $size={30} $fontSize={11}>GU</PeachAvatar>
              Dashboard
              <PillChevron $open={true} />
            </AccountPill>
          </Row>

          <VariantLabel style={{ marginTop: 24 }}>Dropdown — free plan · Upgrade CTA</VariantLabel>
          <Row style={{ gap: 32, flexWrap: 'wrap' }}>
            <AccountDropdown style={{ position: 'static', animation: 'none' }}>
              <DropdownUserRow>
                <PeachAvatar $size={40} $fontSize={14}>GU</PeachAvatar>
                <DropdownUserText>
                  <DropdownName>Guest User</DropdownName>
                  <DropdownEmail>guest@peachy.studio</DropdownEmail>
                </DropdownUserText>
              </DropdownUserRow>
              <DropdownDivider />
              <Button $variant="accent" $size="xl" $fullWidth style={{ justifyContent: 'space-between', padding: '0 16px' }}>
                <UpgradeInner>
                  <Sparkles fill="currentColor" strokeWidth={1.5} />
                  Upgrade to Pro
                </UpgradeInner>
                <UpgradePrice>$4/mo</UpgradePrice>
              </Button>
              <DropdownSpacer />
              <DropdownMenuGroup>
                <Button $variant="ghost" $size="md" $fullWidth style={{ justifyContent: 'flex-start', gap: 12 }}>
                  <Home /> Dashboard
                </Button>
                <Button $variant="ghost" $size="md" $fullWidth style={{ justifyContent: 'flex-start', gap: 12 }}>
                  <Settings /> Settings
                </Button>
              </DropdownMenuGroup>
              <DropdownDivider />
              <Button $variant="ghostDanger" $size="md" $fullWidth style={{ justifyContent: 'flex-start', gap: 12 }}>
                <LogOut /> Log out
              </Button>
            </AccountDropdown>

            <AccountDropdown style={{ position: 'static', animation: 'none' }}>
              <DropdownUserRow>
                <PeachAvatar $size={40} $fontSize={14}>GU</PeachAvatar>
                <DropdownUserText>
                  <DropdownName>Guest User</DropdownName>
                  <DropdownEmail>guest@peachy.studio</DropdownEmail>
                </DropdownUserText>
              </DropdownUserRow>
              <DropdownDivider />
              <ProPlanRow>
                <ProPlanLabel>
                  <Sparkles fill="currentColor" strokeWidth={1.5} />
                  Pro plan
                </ProPlanLabel>
                <ProManageLink onClick={(e) => e.preventDefault()}>Manage</ProManageLink>
              </ProPlanRow>
              <DropdownSpacer />
              <DropdownMenuGroup>
                <Button $variant="ghost" $size="md" $fullWidth style={{ justifyContent: 'flex-start', gap: 12 }}>
                  <Home /> Dashboard
                </Button>
                <Button $variant="ghost" $size="md" $fullWidth style={{ justifyContent: 'flex-start', gap: 12 }}>
                  <Settings /> Settings
                </Button>
              </DropdownMenuGroup>
              <DropdownDivider />
              <Button $variant="ghostDanger" $size="md" $fullWidth style={{ justifyContent: 'flex-start', gap: 12 }}>
                <LogOut /> Log out
              </Button>
            </AccountDropdown>
          </Row>
        </SurfaceCard>
      </Section>

      {/* ─────── Plan usage card ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Dashboard · plan usage card</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Usage ring + Upgrade/Manage — Studio header + widgets row ·{' '}
            <code>PlanUsageCard.tsx</code>.
          </div></MetaInfo>
        </SectionHeader>

        <SurfaceCard>
          <VariantLabel>Free · wide · under limit (ring fills, tone — success.fg)</VariantLabel>
          <Row>
            <PlanUsageCard mode="free" $size="wide" used={2} limit={3} onUpgrade={() => {}} />
          </Row>

          <VariantLabel style={{ marginTop: 20 }}>Free · wide · at limit (ring fills, tone — danger.soft)</VariantLabel>
          <Row>
            <PlanUsageCard mode="free" $size="wide" used={3} limit={3} onUpgrade={() => {}} />
          </Row>

          <VariantLabel style={{ marginTop: 20 }}>Free · compact · under limit</VariantLabel>
          <Row>
            <PlanUsageCard mode="free" $size="compact" used={2} limit={3} onUpgrade={() => {}} />
          </Row>

          <VariantLabel style={{ marginTop: 20 }}>Free · compact · at limit</VariantLabel>
          <Row>
            <PlanUsageCard mode="free" $size="compact" used={3} limit={3} onUpgrade={() => {}} />
          </Row>

          <VariantLabel style={{ marginTop: 20 }}>Pro · wide (active plan)</VariantLabel>
          <Row>
            <PlanUsageCard mode="pro" $size="wide" onManage={() => {}} />
          </Row>

          <VariantLabel style={{ marginTop: 20 }}>Pro · compact</VariantLabel>
          <Row>
            <PlanUsageCard mode="pro" $size="compact" onManage={() => {}} />
          </Row>
        </SurfaceCard>
      </Section>

      {/* ─────── Studio dashboard composites ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Dashboard · banner + purchase row</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            These render via the same styled-tokens used on <code>/studio</code>
            ({' '}<code>BannerSurface · BannerTitle · BannerSub · BannerCta</code>{' '}
            and <code>PurchaseCard · PurchaseImg</code> from{' '}
            <code>StudioPage.tsx</code>). Edit the source there → both Studio
            and this showcase update together.
          </div></MetaInfo>
        </SectionHeader>

        <SurfaceCard>
          <VariantLabel>Banner — &quot;Create new widget&quot; (widgets tab top)</VariantLabel>
          <BannerSurface>
            <div>
              <DashBannerTitle>Create new widget</DashBannerTitle>
              <DashBannerSub>Browse styles, customize and embed in Notion</DashBannerSub>
            </div>
            <DashBannerCta>
              <Plus /> Browse widgets
            </DashBannerCta>
          </BannerSurface>

          <VariantLabel style={{ marginTop: 24 }}>Purchase row — &quot;Weekly Planner&quot; (purchases tab list item)</VariantLabel>
          <PurchaseCard>
            <PurchaseImg>
              <img src="/template-main.png" alt="Weekly Planner" />
            </PurchaseImg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text.primary }}>
                Weekly Planner
              </div>
              <div style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 2 }}>
                #PY-1042 · Mar 22, 2026
              </div>
            </div>
            <PlanBadge>Free</PlanBadge>
            <Button $variant="secondary" $size="sm">Download</Button>
          </PurchaseCard>
        </SurfaceCard>
      </Section>

      <MegaTitle id="overlays" data-num="05 — Overlays">Modals · upgrade · login · sheet</MegaTitle>

      {/* ─────── Modals — live demos (1-to-1 with production) ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Modals</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            Every dialog that ships on the site — click to open the real modal.
            All use the shared <code>&lt;Modal&gt;</code> shell with identical spacing,
            radii, and button patterns. Forms live inside, close on ESC / backdrop click.
          </div></MetaInfo>
        </SectionHeader>
        <SurfaceCard>
          <Row>
            <Button $variant="outline" $size="md" onClick={() => setOpenModal('deleteWidget')}>
              <Trash2 /> Delete widget
            </Button>
            <Button $variant="outline" $size="md" onClick={() => { setDemoWidgetName(''); setOpenModal('nameWidget'); }}>
              <Plus /> Name your widget
            </Button>
            <Button $variant="outline" $size="md" onClick={() => { setDemoPwSuccess(false); setOpenModal('changePassword'); }}>
              <Lock /> Change password
            </Button>
            <Button $variant="outline" $size="md" onClick={() => { setDemoResetSent(false); setDemoResetEmail(''); setOpenModal('resetPassword'); }}>
              <Mail /> Reset password
            </Button>
            <Button $variant="outline" $size="md" onClick={() => { setDemoDeleteConfirm(''); setOpenModal('deleteAccount'); }}>
              <Trash2 /> Delete account
            </Button>
            <Button $variant="accent" $size="md" onClick={() => setOpenModal('upgrade')}>
              <Sparkles /> Upgrade to Pro
            </Button>
            <Button $variant="outline" $size="md" onClick={() => setOpenModal('limitReached')}>
              <Sparkles /> Limit reached
            </Button>
            <Button $variant="outline" $size="md" onClick={() => setOpenModal('login')}>
              <LogOut style={{ transform: 'rotate(180deg)' }} /> Log in
            </Button>
            <Button $variant="outline" $size="md" onClick={() => setOpenModal('signup')}>
              <Plus /> Sign up
            </Button>
          </Row>
        </SurfaceCard>
      </Section>

      {/* ─────── Modal instances — rendered once at page level ─────── */}

      {/* 1. Delete widget — StudioPage */}
      <Modal
        open={openModal === 'deleteWidget'}
        onClose={closeModal}
        eyebrow="Delete widget"
        eyebrowTone="danger"
        title='Delete "Content calendar"?'
        size="sm"
        hideClose
      >
        <ModalBodyText>
          The embed URL will stop working immediately. This can&apos;t be undone.
        </ModalBodyText>
        <ModalFooter>
          <Button type="button" $variant="outline" $size="lg" onClick={closeModal}>Cancel</Button>
          <Button type="button" $variant="dangerStrong" $size="lg" onClick={closeModal}>Delete</Button>
        </ModalFooter>
      </Modal>

      {/* 2. Name your widget — WidgetStudioPage */}
      <Modal
        open={openModal === 'nameWidget'}
        onClose={closeModal}
        eyebrow="New calendar"
        title="Name your widget"
        size="sm"
        hideClose
      >
        <ModalTextInput
          autoFocus
          value={demoWidgetName}
          onChange={(e) => setDemoWidgetName(e.target.value)}
          placeholder="Classic Calendar"
        />
        <ModalFooter>
          <Button type="button" $variant="outline" $size="lg" onClick={closeModal}>Cancel</Button>
          <Button type="button" $variant="primary" $size="lg" onClick={closeModal}>Create &amp; Edit</Button>
        </ModalFooter>
      </Modal>

      {/* 3. Change password — SettingsPage (shows success state on "save") */}
      <Modal
        open={openModal === 'changePassword'}
        onClose={closeModal}
        eyebrow="Account security"
        title={demoPwSuccess ? 'Password updated' : 'Change password'}
        size="sm"
        hideClose
      >
        {demoPwSuccess ? (
          <>
            <ModalBodyText>
              You can use your new password the next time you sign in with email.
              Other devices where you were signed in have been logged out.
            </ModalBodyText>
            <Button $variant="primary" $size="lg" $fullWidth onClick={closeModal}>Done</Button>
          </>
        ) : (
          <>
            <ModalBodyText>Choose a strong password you haven&apos;t used before.</ModalBodyText>
            <ModalInputRow>
              <ModalTextInput type="password" placeholder="Current password" />
            </ModalInputRow>
            <ModalInputRow>
              <ModalTextInput type="password" placeholder="New password" />
            </ModalInputRow>
            <ModalInputRow>
              <ModalTextInput type="password" placeholder="Confirm new password" />
            </ModalInputRow>
            <ModalFooter>
              <Button type="button" $variant="outline" $size="lg" onClick={closeModal}>Cancel</Button>
              <Button type="button" $variant="primary" $size="lg" onClick={() => setDemoPwSuccess(true)}>Save password</Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* 4. Reset password — LoginPage (inline helper instead of banner) */}
      <Modal
        open={openModal === 'resetPassword'}
        onClose={closeModal}
        eyebrow="Account recovery"
        title={demoResetSent ? 'Check your email' : 'Reset your password'}
        size="sm"
        hideClose
      >
        {demoResetSent ? (
          <>
            <ModalBodyText>
              If an account exists for <strong>{demoResetEmail || 'you@peachy.studio'}</strong>, we sent a password reset link.
              Click the link in the email to set a new password.
            </ModalBodyText>
            <ModalFooter>
              <Button $variant="primary" $size="lg" $fullWidth onClick={closeModal}>Done</Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalTextInput
              type="email"
              placeholder="you@peachy.studio"
              value={demoResetEmail}
              onChange={(e) => setDemoResetEmail(e.target.value)}
              autoFocus
            />
            <ModalHint>
              Signed up with Google? Use{' '}
              <Button type="button" $variant="link" $size="sm" onClick={closeModal}>Continue with Google</Button>{' '}
              on the login page.
            </ModalHint>
            <ModalFooter>
              <Button type="button" $variant="outline" $size="lg" onClick={closeModal}>Cancel</Button>
              <Button type="button" $variant="primary" $size="lg" onClick={() => setDemoResetSent(true)}>Send reset link</Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* 5. Delete account — SettingsPage (type-to-confirm) */}
      <Modal
        open={openModal === 'deleteAccount'}
        onClose={closeModal}
        eyebrow="Danger zone"
        eyebrowTone="danger"
        title="Delete account?"
        size="sm"
        hideClose
      >
        <ModalBodyText>
          We&apos;ll permanently remove your profile and all saved widgets.
          You can always sign up again later with the same email.
          To confirm, please type <strong>delete</strong> below.
        </ModalBodyText>
        <ModalTextInput
          type="text"
          autoFocus
          value={demoDeleteConfirm}
          onChange={(e) => setDemoDeleteConfirm(e.target.value)}
          placeholder='Type "delete" to confirm'
        />
        <ModalFooter>
          <Button type="button" $variant="outline" $size="lg" onClick={closeModal}>Cancel</Button>
          <Button
            type="button"
            $variant="dangerStrong"
            $size="lg"
            disabled={demoDeleteConfirm.trim().toLowerCase() !== 'delete'}
            onClick={closeModal}
          >
            Delete forever
          </Button>
        </ModalFooter>
      </Modal>

      {/* 6. Upgrade to Pro — real shared <UpgradeModal>. Edits there
          propagate live here so DS and prod stay 1:1. */}
      <UpgradeModal open={openModal === 'upgrade'} onClose={closeModal} />

      {/* 7. Limit reached — compact upsell. Fires when a Free user hits
          the widget cap (3) and taps "Customize" / "+ New widget". One
          tap → onUpgrade jumps to the full pricing modal. Mirrors the
          small-modal recipe (eyebrow + title + body + dual footer). */}
      <Modal
        open={openModal === 'limitReached'}
        onClose={closeModal}
        eyebrow="Free plan"
        title="You've hit your widget limit"
        size="sm"
        hideClose
      >
        <ModalBodyText>
          Free includes <strong>3 widgets</strong>. Upgrade to Pro for unlimited
          widgets, all styles, and full customization.
        </ModalBodyText>
        <ModalFooter>
          <Button type="button" $variant="outline" $size="lg" onClick={closeModal}>
            Maybe later
          </Button>
          <Button
            type="button"
            $variant="accent"
            $size="lg"
            onClick={() => setOpenModal('upgrade')}
          >
            <Sparkles /> Upgrade to Pro
          </Button>
        </ModalFooter>
      </Modal>

      {/* 8. Login — real shared <LoginModal>. Same surface that fires
          when a logged-out user taps "Customize" on a widget card. On
          mobile it auto-renders as a BottomSheet (handled inside). */}
      <LoginModal open={openModal === 'login'} onClose={closeModal} />

      {/* 9. Sign up — same shared <LoginModal> with the Sign Up tab
          pre-selected. Single source of truth for both flows. */}
      <LoginModal
        open={openModal === 'signup'}
        onClose={closeModal}
        initialSignUp
      />

      <MegaTitle id="chrome" data-num="06 — Site chrome">TopNav &amp; footers</MegaTitle>

      {/* ─────── Layout: Site chrome ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Top navigation</SectionTitle>
          <MetaInfo><summary>Info</summary><div className="meta-body">
            <code>components/layout/TopNav.tsx</code> auto-renders on every
            page. Fully interactive — dropdowns, mobile menu, cart all work
            as in prod.
          </div></MetaInfo>
        </SectionHeader>

        <div style={{ position: 'relative', height: 96, border: `1px solid rgba(0, 0, 0, 0.05)`, borderRadius: 12 }}>
          <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(0)' }}>
            <TopNav activeLink="studio" logoSub="Studio" />
          </div>
        </div>
      </Section>

      {/* Product cards are not showcased here: they auto-render from
          `src/presentation/data/templates.ts` via the shared
          `TemplateMockupCard` primitive. To add a new product, add one
          entry to that file — it appears on landing, /templates,
          Related rail, and the detail carousel with zero extra work. */}

      {/* ─────── How to edit ─────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>How to change anything</SectionTitle>
        </SectionHeader>

        <Tip>
          <TipKey>Change a button color / gradient / shadow</TipKey>
          <TipVal>
            <code>src/presentation/themes/buttonTokens.ts</code> → find the variant (e.g.
            <code> accent</code>) → edit <code>base.bg</code>, <code>hover.bg</code>,
            <code> active.bg</code>. Save. App updates instantly.
          </TipVal>
        </Tip>
        <Tip>
          <TipKey>Resize all buttons of a size</TipKey>
          <TipVal>
            <code>buttonSizeTokens.md.height</code> — bump the px value. All{' '}
            <code>$size="md"</code> buttons site-wide follow.
          </TipVal>
        </Tip>
        <Tip>
          <TipKey>Add a new variant</TipKey>
          <TipVal>
            1. Add its name to <code>ButtonVariant</code> type.
            2. Add an entry in <code>buttonVariantTokens</code>.
            3. (optional) Add to <code>emphasisVariants</code> if it's a filled CTA.
            No CSS to write in Button.tsx.
          </TipVal>
        </Tip>
        <Tip>
          <TipKey>Recolor active filter chips</TipKey>
          <TipVal>
            <code>filterChipTokens.active.bg</code> + <code>.fg</code>. Hover:
            <code> activeHover</code>.
          </TipVal>
        </Tip>
      </Section>
    </Page>
  );
};

/* ── size-usage legend — where each size actually lives in the app ── */
function sizeUsage(s: ButtonSize): string {
  const m: Record<ButtonSize, string> = {
    sm: 'cards · filters · inline',
    md: 'toolbars · modals',
    lg: 'primary forms · cards',
    xl: 'hero · auth · full-width',
  };
  return m[s];
}

/* ── variant blurbs ── */
function variantBlurb(v: ButtonVariant): string {
  const blurbs: Record<ButtonVariant, string> = {
    primary: 'Default dark CTA · carved depth',
    accent: 'Indigo gradient · Pro/Upgrade',
    upgrade: 'Outlined indigo · inline upgrade',
    slate: 'Slate-warm neutral · editorial CTA (replaces blue)',
    secondary: 'Notion paper · neutral CTA',
    outline: 'Transparent + border',
    ghost: 'Minimal · nav / menu / inline',
    ghostDanger: 'Borderless destructive · menu log out',
    danger: 'Muted wine · reversible destructive',
    dangerStrong: 'Saturated red · irreversible',
    success: 'Emerald · confirm / saved',
    successSoft: 'Soft sage · reversible confirm (Copied)',
    link: 'Underline on hover',
  };
  return blurbs[v] || '';
}

const FormControlsDemo: React.FC = () => {
  const [dayGrid, setDayGrid] = useState(true);
  const [weekStart, setWeekStart] = useState<'monday' | 'sunday'>('monday');
  const [urlText, setUrlText] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [embedWidth, setEmbedWidth] = useState(420);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 290 }}>
      <VariantLabel>Switch — on/off toggle (single source of truth — edit here)</VariantLabel>
      {/* Mirror of CustomizationPanel structure (Section eyebrow + FormGroup
          padding) so the Switch renders 1:1 with how it looks in /studio. */}
      <SwitchPreviewSection>
        <SwitchPreviewTitle>Calendar</SwitchPreviewTitle>
        <ToggleRow>
          <ToggleLabel>Day grid</ToggleLabel>
          <Switch checked={dayGrid} onChange={setDayGrid} aria-label="Day grid" />
        </ToggleRow>
      </SwitchPreviewSection>

      <VariantLabel style={{ marginTop: 12 }}>ToggleTabs — 2-choice sliding</VariantLabel>
      <ToggleRow as="div">
        <ToggleLabel>Week start</ToggleLabel>
        <ToggleTabs<'monday' | 'sunday'>
          value={weekStart}
          options={['monday', 'sunday']}
          labels={['Mon', 'Sun']}
          onChange={setWeekStart}
        />
      </ToggleRow>

      <VariantLabel style={{ marginTop: 12 }}>Input — panel text field (34px)</VariantLabel>
      <Input
        type="text"
        placeholder="https://..."
        value={urlText}
        onChange={(e) => setUrlText(e.target.value)}
      />

      <VariantLabel style={{ marginTop: 20 }}>FormField — 5 states (44px)</VariantLabel>
      <FormField
        label="Email"
        hint="Optional"
        helper="We'll never share your email."
        icon={<Mail />}
        placeholder="you@peachy.studio"
      />
      <FormField
        label="Password"
        icon={<Lock />}
        type={showPw ? 'text' : 'password'}
        defaultValue="supersecret"
        trailing={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'inline-flex' }}
          >
            {showPw ? <EyeOff /> : <Eye />}
          </button>
        }
      />
      <FormField
        label="Email"
        state="error"
        icon={<Mail />}
        defaultValue="not-an-email"
        helper="Please enter a valid email address."
      />
      <FormField
        label="Email"
        state="success"
        icon={<Mail />}
        defaultValue="hello@peachy.studio"
        helper="Email verified."
        trailing={<Check />}
      />
      <FormField
        label="Email"
        disabled
        icon={<Lock />}
        defaultValue="locked@peachy.studio"
        helper="Managed by SSO — contact admin to change."
      />

      <VariantLabel style={{ marginTop: 20 }}>Native Select — used in CustomizationPanel + sort dropdowns</VariantLabel>
      <DemoSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="alpha">A → Z</option>
      </DemoSelect>

      <VariantLabel style={{ marginTop: 20 }}>Divider — section separator (via <code>DropdownDivider</code> or hairline rule)</VariantLabel>
      <DemoDivider />

    </div>
  );
};

const SegmentDemo: React.FC = () => {
  const [tab, setTab] = useState<'widgets' | 'templates'>('widgets');
  return (
    <SegmentGroup>
      <Segment $active={tab === 'widgets'} onClick={() => setTab('widgets')}>Widgets</Segment>
      <Segment $active={tab === 'templates'} onClick={() => setTab('templates')}>Templates</Segment>
    </SegmentGroup>
  );
};

/* ─────── Layout ─────── */

const Page = styled.div`
  /* Apple-style page surface: pure white with a barely-there top wash —
     the eye reads it as flat but the gradient keeps the hero from
     feeling sterile. */
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%, rgba(99, 102, 241, 0.04) 0%, transparent 60%),
    ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100vh;
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  padding: 96px 48px 160px;

  @media (max-width: 900px) {
    padding: 56px 20px 96px;
  }
`;

const Hero = styled.header`
  max-width: 1100px;
  margin: 0 auto 96px;
  text-align: center;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 32px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.18);
  }

  code {
    font-family: inherit;
    background: transparent;
    padding: 0;
  }
`;

const H1 = styled.h1`
  /* Fluid display — caps at 72px on huge screens, scales down to 40 on
     phones. Semibold for clarity, no gradient text — clean primary
     color reads better than the soft fade. */
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 600;
  letter-spacing: -0.04em;
  margin: 0 auto 20px;
  line-height: 1.05;
  max-width: 14ch;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Lead = styled.p`
  font-size: 18px;
  line-height: 1.55;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text.body};
  max-width: 560px;
  margin: 0 auto;
  letter-spacing: -0.005em;

  code {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    padding: 1px 6px;
    border-radius: ${({ theme }) => theme.radii.sm};
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Section = styled.section`
  max-width: 1100px;
  /* Tightened from 80 → 48px so adjacent showcase blocks read as part
     of the same mega-section instead of floating apart. */
  margin: 0 auto 48px;
`;

/* ── Mega-block organisation ──────────────────────────────────────────
   The DS now lives in 6 mega-blocks: Foundations · Elements · Studio ·
   Dashboard · Overlays · Chrome. Each block opens with <MegaTitle>; an
   anchor TOC bar at the top jumps between them. */

const AnchorBar = styled.div`
  position: sticky;
  top: 16px;
  z-index: 50;
  width: fit-content;
  max-width: calc(100% - 32px);
  margin: 0 auto 80px;
  padding: 6px;
  /* Frosted-glass pill bar — refined Apple-like look. Smaller padding,
     subtle shadow, contained width that hugs its content. */
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`;

const AnchorLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.body};
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: background ${({ theme }) => theme.transitions.fast},
              color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:active {
    background: rgba(0, 0, 0, 0.08);
  }
`;

const MegaTitle = styled.h2`
  scroll-margin-top: 96px;
  max-width: 1100px;
  /* Apple-style mega-block break: generous whitespace above (the gap IS
     the divider — no border). The eyebrow ("01 / Foundations") sits on
     its own line above as muted small text, no pill chrome. */
  margin: 120px auto 24px;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  &:first-of-type {
    margin-top: 24px;
  }

  &::before {
    content: attr(data-num);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: none;
  }
`;

const SectionHeader = styled.div`
  /* 16px instead of 24 — title sits closer to its showcase content.
     Verbose meta now lives behind the closed <MetaInfo> pill so the
     header's overall vertical footprint is much smaller. */
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h2`
  /* Apple-style sub-section title: bigger, sentence-case, semibold —
     reads as a real heading, not a label. Replaces the all-caps
     micro-eyebrow with a proper h2-feeling tier under MegaTitle. */
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.2;
`;

/* ── Typography showcase ──
   Reads live from theme.typography so a token change updates the page
   without editing this file. */
const FontFamilyRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
`;

const FontFamilyTile = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const FontFamilyName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0;
`;

const FontFamilyStack = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 4px 0 16px;
`;

const FontFamilySample = styled.div<{ $mono: boolean }>`
  font-family: ${({ $mono, theme }) =>
    $mono ? theme.typography.fonts.mono : theme.typography.fonts.primary};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
  letter-spacing: ${({ $mono }) => ($mono ? '0' : '-0.01em')};
`;

const TypeScaleTable = styled.div`
  display: flex;
  flex-direction: column;
`;

const TypeScaleRow = styled.div`
  display: grid;
  grid-template-columns: 72px 72px minmax(0, 1fr) 260px;
  align-items: baseline;
  gap: 20px;
  padding: 14px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  &:first-child {
    border-top: none;
  }

  @media (max-width: 860px) {
    grid-template-columns: 64px 64px minmax(0, 1fr);
    & > :nth-child(4) { display: none; }
  }
`;

const TypeScaleName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.body};
`;

const TypeScaleValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const TypeScaleSample = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.15;
  letter-spacing: -0.01em;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const TypeScaleUsage = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
`;

/* ── Clean type list — Apple-style: just a small grey label and the
   actual sample, separated by a hairline. No pills, code samples or
   "used in" chrome — let the typography speak for itself. */
const CleanTypeList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CleanTypeRow = styled.div`
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 32px;
  align-items: baseline;
  padding: 20px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child { border-bottom: none; }
`;

const CleanTypeName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.tertiary};
  letter-spacing: 0;
`;

const CleanTypeSample = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  /* Inline style on each instance carries size/weight/lh/tracking from
     the recipe — we just provide the base reset. */
`;

/* ── Text style recipes (legacy verbose tiles, kept for back-compat) ── */
const TextStyleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextStyleTile = styled.div`
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 28px;
  align-items: center;
  padding: 18px 20px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const TextStyleMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const TextStyleName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.005em;
`;

const TextStyleUsageHint = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.body};

  code {
    font-family: ${({ theme }) => theme.typography.fonts.mono};
    font-size: 11px;
    background: ${({ theme }) => theme.colors.background.elevated};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    padding: 3px 8px;
    border-radius: ${({ theme }) => theme.radii.sm};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  span {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const TextStyleCode = styled.div`
  margin-top: 6px;
  display: inline-block;
  padding: 4px 10px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.primary};
  width: fit-content;
`;

const TextStyleSpec = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
`;

const SpecPill = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const TextStyleZones = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
`;

const TextStyleZonesLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-right: 4px;
`;

const TextStyleZonePill = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.body};
  letter-spacing: 0.02em;
`;

/* ── Modal demo helpers ── */
const ModalBodyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.body};
  line-height: 1.5;
  margin: 0 0 16px;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`;

const ModalInputRow = styled.div`
  margin-bottom: 12px;
`;

/* Mirror of the production `NameModalInput` in WidgetStudioPage.tsx.
   Keep these two in sync — same 46px height, same focus ring. */
const ModalTextInput = styled.input`
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
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const ModalHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.body};
  line-height: 1.5;
  margin: 12px 0 0;
`;

/* ── Color swatches (palette / gradients / glass showcase) ── */
const SwatchGrid = styled.div`
  display: grid;
  /* Horizontal swatch layout (color tile + name/hex on the right) needs
     more horizontal room — minmax 220px fits 4-5 per row at 1100px and
     stops the long token names ("background.surfaceMuted") from getting
     clipped. */
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
`;

const Swatch = styled.div<{ $bg: string; $light?: boolean }>`
  /* Horizontal Apple-style swatch: rounded color tile on the left,
     name + hex stacked to its right. More compact and reads like a
     real palette token (color square anchors the row, text sits
     beside it instead of stacked beneath). */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 60px;
  padding: 10px 14px 10px 68px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  transition: border-color ${({ theme }) => theme.transitions.fast},
              transform ${({ theme }) => theme.transitions.fast};

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: ${({ $bg }) => $bg};
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

const SwName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SwHex = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 10px;
  margin-top: 2px;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

/* Light/Dark variants kept as aliases — text sits on a white strip now,
   so colour overrides aren't needed but call sites still reference them. */
const SwNameLight = styled(SwName)``;
const SwNameDark = styled(SwName)``;
const SwHexDark = styled(SwHex)``;

const GradientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const GradSwatch = styled.div<{ $bg: string }>`
  /* Same two-part layout as Swatch — gradient band + white strip. */
  position: relative;
  padding: 80px 14px 12px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: ${({ $bg }) => $bg};
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }
`;

/* Checkered bg so semi-transparent glass is visibly transparent. Capped
   at the same 220px-row width as Swatch so a single GlassSwatch doesn't
   stretch across the whole Section. */
const GlassCheckerboard = styled.div`
  display: inline-block;
  max-width: 280px;
  padding: 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.background.surfaceAlt};
  background-image:
    linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(236, 72, 153, 0.12) 50%, rgba(255, 214, 196, 0.14) 100%),
    repeating-conic-gradient(rgba(0,0,0,0.04) 0% 25%, transparent 0% 50%);
  background-size: cover, 24px 24px;
`;

const GlassSwatch = styled.div<{ $bg: string }>`
  /* Horizontal glass swatch matching the Swatch pattern: blurred 44×44
     tile on the left (showing the checkerboard through), name + hex
     stacked beside. The translucency reads instantly because the
     coloured grid behind shows through the blur. */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 60px;
  padding: 10px 14px 10px 68px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: ${({ $bg }) => $bg};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
`;

/* ── Surfaces & panels previews ── */
/* ── Form elements — additional primitives ── */
const DemoSelect = styled.select`
  height: 40px;
  padding: 0 36px 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238E8E93' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const DemoRange = styled.input`
  flex: 1;
  max-width: 220px;
  height: 4px;
  appearance: none;
  background: ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.full};
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.colors.accentShadow.sm};
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border: none;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
  }
`;

const DemoDivider = styled.hr`
  height: 1px;
  border: none;
  background: ${({ theme }) => theme.colors.border.light};
  margin: 4px 0;
`;

const MissingList = styled.ul`
  margin: 0;
  padding: 10px 14px;
  list-style: disc;
  padding-left: 28px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px dashed ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.body};
  line-height: 1.5;

  li + li { margin-top: 6px; }

  code {
    font-family: ${({ theme }) => theme.typography.fonts.mono};
    font-size: 11px;
    background: ${({ theme }) => theme.colors.background.elevated};
    padding: 1px 5px;
    border-radius: ${({ theme }) => theme.radii.xs};
  }
`;

/* NOTE: Widget card / Empty state / Shortcut / Mobile tab bar showcases
 * import their styled-components directly from prod (DashboardViews.tsx +
 * StudioPage.tsx) — see the top-of-file "Mirror imports" block. No local
 * re-implementations here. Edit the source files to change the look. */

/* ── Transitions showcase ── */
const TransitionGrid = styled.div`
  display: grid;
  /* 4 transitions render compact at 160px min — fits all in one row. */
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const TransitionTile = styled.div<{ $t: string }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.05));
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: ${({ $t }) => `transform ${$t}, background ${$t}, box-shadow ${$t}`};

  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(236, 72, 153, 0.10));
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`;

const TransitionName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TransitionHint = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 2px;
`;

/* ── Shadows showcase ── */
const ShadowGrid = styled.div`
  display: grid;
  /* 150px min fits 6-7 tiles per row vs 5 with 180. Gap trimmed for
     tighter rhythm. */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 4px;
`;

const ShadowTile = styled.div<{ $s: string }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100px;
  padding: 14px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ $s }) => $s};
`;

const ShadowName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ShadowHint = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 2px;
`;

/* ── Radii showcase ── */
const RadiiGrid = styled.div`
  display: grid;
  /* Match Swatch grid sizing — horizontal tiles need ~220px each,
     fits 4-5 per row at 1100px. */
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
`;

const RadiusTile = styled.div<{ $r: string }>`
  /* Vertical radius tile — needs more shape area than the 44×44 swatch
     pattern allows. At small sizes, every radius >12px looks fully
     round. Here the shape gets a 110×72 preview where 4 → 28 read as
     visibly different curves; pill ($r=9999) still maxes out the
     ellipse but that's expected. Name + size sit on a tight strip
     below. */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 14px 14px 12px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::before {
    content: '';
    width: 100%;
    height: 72px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(236, 72, 153, 0.12));
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: ${({ $r }) => $r};
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

const RadiusName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RadiusPx = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 2px;
`;

const UpgradeBullet = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: ${({ theme }) => theme.typography.sizes.base};
  color: ${({ theme }) => theme.colors.text.body};

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.success};
    flex-shrink: 0;
  }
`;

const RawTokensToggle = styled.button`
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 28px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px dashed ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.body};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast}, border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.surfaceMuted};
    border-color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const RawTokensHint = styled.span`
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
`;

const TextStyleSample = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 0;
  overflow-wrap: anywhere;
`;

const WeightRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const WeightTile = styled.div`
  padding: 18px 16px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
`;

const WeightSample = styled.div`
  font-size: 40px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.02em;
  margin-bottom: 10px;
`;

const WeightName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.body};
`;

const WeightValue = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 2px;
`;

const LineHeightRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const LineHeightTile = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const LineHeightName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.body};
  margin-bottom: 10px;
`;

const LineHeightSample = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.01em;
`;

const LetterSpacingRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
`;

const LetterSpacingTile = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LetterSpacingHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const LetterSpacingName = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.body};
`;

const LetterSpacingValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const LetterSpacingSample = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
`;

const LetterSpacingUsage = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
`;

/* Sub-section label inside a Section — e.g. "BigFooter — primary",
   "Footer — minimal", size-preset names for Template mockup cards. */
const SubTitle = styled.h3`
  /* Apple-style sub-category heading: a real h3 (18px / 600 / -0.01em),
     not an all-caps micro-eyebrow. Gets a hairline divider above so
     adjacent sub-blocks (Fonts → App / Studio → Landing → ...) read as
     distinct categories rather than blurring together. */
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 40px 0 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  &:first-of-type {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

/* ── Template mockup documentation rows ──
   Each row is "what / where / props / code" on the left, visual preview
   on the right. Collapses vertically on narrow viewports. */
const MockupRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(200px, 440px);
  gap: 28px;
  align-items: start;
  padding: 20px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const MockupMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const MockupName = styled.h3`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.01em;
`;

const MockupWhere = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.body};
  line-height: 1.5;

  code {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    padding: 1px 5px;
    border-radius: ${({ theme }) => theme.radii.xs};
    font-size: 12px;
  }
`;

const MockupProps = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  letter-spacing: 0;
`;

const MockupCode = styled.pre`
  margin: 4px 0 0;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: pre;
  overflow-x: auto;
`;

const MockupPreview = styled.div`
  width: 100%;
  justify-self: end;

  @media (max-width: 860px) {
    justify-self: start;
  }
`;

const SectionMeta = styled.div`
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.body};
  max-width: 640px;

  code {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    padding: 1px 5px;
    border-radius: ${({ theme }) => theme.radii.xs};
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

/* MetaInfo — collapsible "info" panel that replaces verbose SectionMeta
   blocks inside SectionHeader. Closed by default — click "ⓘ Info ⌄" to
   expand the technical description. Uses native <details>/<summary> so
   no JS state needed. Inline SectionMetas (outside SectionHeader) keep
   their original styled.div form and stay always visible. */
const MetaInfo = styled.details`
  margin-top: 8px;
  max-width: 720px;

  > summary {
    cursor: pointer;
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.border.hairline};
    border-radius: ${({ theme }) => theme.radii.full};
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.tertiary};
    background: ${({ theme }) => theme.colors.background.elevated};
    user-select: none;
    transition: background ${({ theme }) => theme.transitions.fast},
                color ${({ theme }) => theme.transitions.fast},
                border-color ${({ theme }) => theme.transitions.fast};

    &::-webkit-details-marker { display: none; }

    &::before {
      content: 'ⓘ';
      font-size: 11px;
      opacity: 0.7;
    }

    &::after {
      content: '⌄';
      font-size: 12px;
      opacity: 0.6;
      transition: transform ${({ theme }) => theme.transitions.fast};
    }

    &:hover {
      background: ${({ theme }) => theme.colors.background.surfaceAlt};
      color: ${({ theme }) => theme.colors.text.body};
      border-color: ${({ theme }) => theme.colors.border.light};
    }
  }

  &[open] > summary {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    color: ${({ theme }) => theme.colors.text.body};
  }

  &[open] > summary::after {
    transform: rotate(180deg);
  }

  > div.meta-body {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.text.body};
    max-width: 640px;
  }

  code {
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    padding: 1px 5px;
    border-radius: ${({ theme }) => theme.radii.xs};
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

/* Surface card — used to group related demos (Options, Sizes, each Pattern).
   Gives every block a clean, bounded shape so the page stops feeling like a
   loose stream of rows. */
const SurfaceCard = styled.div`
  /* Apple-style refined surface: subtle shadow instead of hairline
     border, larger radius, off-white background. Reads as a soft
     elevation lift rather than a boxed cell. */
  padding: 32px;
  background: #FBFBFC;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02), 0 0 0 0.5px rgba(0, 0, 0, 0.02);

  @media (max-width: 900px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

/* Mirror of `Section` + `SectionTitle` from CustomizationPanel.tsx so the
   Switch demo above renders pixel-identical to how it looks in /studio.
   When CustomizationPanel changes, mirror those tweaks here too. */
const SwitchPreviewSection = styled.div`
  padding: 16px 0 0;
`;

const SwitchPreviewTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: -0.01em;
  margin: 0 0 18px 0;
`;

/* Mirror of CustomizationPanel's color-row layout (Section + FormGroup +
   Label) so the ColorPicker showcase below renders identically to /studio.
   Width matches real panel (~290px desktop). */
const ColorPickerPreviewSection = styled.div`
  max-width: 290px;
  padding-top: 16px;
`;

const ColorPickerFormGroup = styled.div`
  & + & {
    margin-top: 16px;
  }
`;

const ColorPickerLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  letter-spacing: -0.01em;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { font-size: 13px; }
`;

const VariantLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0 0 10px;

  code {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    letter-spacing: 0;
    text-transform: none;
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    padding: 1px 5px;
    border-radius: ${({ theme }) => theme.radii.xs};
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
  }
`;

/* ── Variant gallery (clean grid of one-per-variant buttons) ── */

const VariantGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
`;

const VariantTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 22px 20px 18px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  transition: border-color ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast}, transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.medium};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transform: translateY(-1px);
  }
`;

const VariantTileMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const VariantName = styled.div`
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const VariantMeta = styled.div`
  font-size: 11px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

/* ── Size row (all 4 sizes across one baseline) ── */

const SizeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 32px 40px;
`;

const SizeCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
`;

const SizeCaption = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text.tertiary};

  b {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  small {
    font-size: 11px;
  }
`;

/* ── Tips ── */

const Tip = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  padding: 18px 22px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};

  & + & { margin-top: 10px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const TipKey = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.01em;
`;

const TipVal = styled.div`
  font-size: 13px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.text.body};

  code {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    background: ${({ theme }) => theme.colors.background.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    padding: 1px 5px;
    border-radius: ${({ theme }) => theme.radii.xs};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;
