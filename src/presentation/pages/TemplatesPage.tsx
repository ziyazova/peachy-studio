import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { PageWrapper, BackButton, FilterRow, FilterChip, TemplateMockupCard, TemplateMockupImage, LandingFooter } from '@/presentation/components/shared';
import { fadeUp } from '@/presentation/themes/animations';
import { TEMPLATES, CATEGORIES, type Category } from '@/presentation/data/templates';


/* ── Header ── */
const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  /* 24px bottom padding owns the chips → cards gap so it stays consistent
     whether or not the conditional <SubRow> renders below the chips. */
  padding: 48px 48px 24px;
  animation: ${fadeUp} 0.25s ease both;

  /* Phone — gutter 20 horizontal, top 32 (sectionPaddingY 36 − 4),
   * bottom 24. Top trimmed by 4 so the BackButton lifts 4px upward
   * without moving the Title — the freed 4 reappears as extra gap
   * between Back and Title (BackButton's margin-bottom carries it).
   * Per "Back подними на 4 пикселя, остальное не трогай, пусть
   * отступ увеличится". Bottom 24 owns the chips → cards gap. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: calc(${({ theme }) => theme.layout.mobile.sectionPaddingY} - 4px)
      ${({ theme }) => theme.layout.mobile.gutter}
      24px;
  }
`;


const PageTitle = styled.h1`
  font-size: 40px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  margin: 0 0 10px;

  @media (min-width: calc(${({ theme }) => theme.breakpoints.md} + 1px))
    and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 32px;
  }

  /* Phone — sectionHeadline tokens (24/600/1). Margin-bottom = titleToBody
   * (8) — Title → Subtitle rhythm matches every landing section that has
   * a subtitle. Per "расстояние от title до body как на лендинге". */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionHeadline.size};
    font-weight: ${({ theme }) => theme.typography.mobile.sectionHeadline.weight};
    line-height: ${({ theme }) => theme.typography.mobile.sectionHeadline.lineHeight};
    margin: 0 0 ${({ theme }) => theme.layout.mobile.titleToBody};
  }
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  /* 40px gap between subtitle and the FilterRow chips below. */
  margin: 0 0 40px;
  letter-spacing: -0.01em;

  /* Phone — sectionBody tokens (15/400/1.5). Margin-bottom 24 — matches
   * the chips → first-card gap below so Subtitle → chips → cards reads
   * as a uniform 24-rhythm on /templates. Hardcoded (not bodyToCards
   * 20) per "от lead до чипов тоже больше — 24". */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.sectionBody.size};
    line-height: ${({ theme }) => theme.typography.mobile.sectionBody.lineHeight};
    margin: 0 0 24px;
  }
`;

/* ── Search ── */
const SearchWrap = styled.div`
  position: relative;
  margin-bottom: 16px;
  max-width: 360px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  svg { width: 15px; height: 15px; }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 14px 0 40px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.surface};
  outline: none;
  transition: all ${({ theme }) => theme.transitions.medium};
  letter-spacing: -0.01em;

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.border.medium};
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;


const SubRow = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const SubChip = styled.button<{ $active: boolean }>`
  height: 28px;
  padding: 0 14px;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.state.activeWash : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.state.active : theme.colors.text.tertiary};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ $active, theme }) => $active ? theme.typography.weights.medium : theme.typography.weights.normal};
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ $active, theme }) => $active ? theme.colors.state.active : theme.colors.text.primary};
    background: ${({ $active, theme }) => $active ? theme.colors.state.activeWash : 'rgba(0, 0, 0, 0.02)'};
  }
`;

/* ── Grid ── */
const Grid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  /* Top padding is 0 — the Header's bottom padding owns the chips → cards
     gap so it stays consistent regardless of the optional <SubRow>. */
  padding: 0 48px 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 20px;
  }

  /* Phone (≤ md = 768) — single column. Per "сделай чтобы растягивалась
   * по странице на ширину — на телефонной версии": cards fill the
   * whole content column on every phone size, photos no longer feel
   * small in a 2-col split. Tablet 2-col is dropped at this breakpoint
   * (was a half-step compromise). gutter 20 sides, sectionPaddingY × 2
   * = 72 bottom for footer rhythm. align-items: start keeps cells at
   * intrinsic height so the column doesn't stretch tall ones. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.layout.mobile.gutter}
      calc(${({ theme }) => theme.layout.mobile.sectionPaddingY} * 2);
    grid-template-columns: 1fr;
    gap: 20px;
    align-items: start;
  }
`;

const TemplateCardWrap = styled.div`
  cursor: pointer;
  animation: ${fadeUp} 0.25s ease both;
  /* Defensive: cell never overflows its grid track. Without min-width:0
   * the inner ellipsizing CardTitle could push the wrap wider than 1fr
   * on some Safari builds, which made the right-side page gutter look
   * smaller than the left. Per "отступ справа от страницы кривой —
   * меньше". */
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

/* Spacing wrapper around <TemplateMockupCard> — mirrors the main landing's
 * TemplateCardSlot (12px bottom margin) so the gap between card image and
 * meta is identical: 12 (this) + 6 (CardMeta padding-top) = 18 desktop,
 * 12 (this) + 0 (mobile CardMeta) = 12 mobile. Same recipe on both
 * surfaces; edit both together. */
const CardSlot = styled.div`
  margin-bottom: 12px;
`;


/* Card meta on /templates is intentionally identical to the main
 * landing's "Top templates" card meta (TemplateCardMeta / Title / Price
 * in landing/TemplatesGallery.tsx). Same cards on both surfaces — same
 * text size, same padding, same color logic. Edit both together if a
 * value changes. The only /templates-specific difference is the $free →
 * success coloring on the price, which signals free templates in the
 * catalog (the marquee on / doesn't include free items). */
const CardMeta = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 6px;

  /* Phone — switch from baseline to center alignment. With title and
   * price at different sizes (14 vs 13) baseline produced visually
   * uneven row heights between adjacent cards in 2-col, contributing
   * to the "left/right rows don't line up" issue. center is stable. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: center;
    gap: 8px;
    padding: 0 4px;
  }
`;

const CardTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.01em;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  /* 2-col phone range (sm < vw ≤ md): title 14/500. Weight came down
   * from 600 → 500 per "текст менее жирный надо" — 600 read too heavy
   * in the narrow 2-col column. Same weight as desktop now. */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.mobile.cardBody.size};
    font-weight: 500;
    line-height: ${({ theme }) => theme.typography.mobile.cardBody.lineHeight};
  }

  /* 1-col phone range (vw ≤ sm): title restores to cardBody weight (400)
   * — single full-width card uses the lighter weight to match section
   * body copy. */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-weight: ${({ theme }) => theme.typography.mobile.cardBody.weight};
  }
`;

const Price = styled.span<{ $free: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ $free, theme }) => $free ? theme.colors.success.base : theme.colors.text.body};
  letter-spacing: -0.01em;
  line-height: 1.3;
  flex-shrink: 0;

  /* 2-col phone: 13/500 per spec "Цена: 13px / 500". Slightly tighter
   * than title (14/600) so price reads as secondary in the row. Color
   * recedes to text.tertiary (Apple-style price treatment). */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: 500;
    line-height: ${({ theme }) => theme.typography.mobile.cardBody.lineHeight};
    color: ${({ $free, theme }) => $free ? theme.colors.success.base : theme.colors.text.tertiary};
  }

  /* 1-col phone: restores to cardBody (14/400) like the rest of body
   * copy on the wider single-column card. */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.mobile.cardBody.size};
    font-weight: ${({ theme }) => theme.typography.mobile.cardBody.weight};
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.sizes.base};
`;

/* Footer rendering moved to shared <LandingFooter /> — same wrapper
 * pattern as every landing page (surfaceAlt tint + noDivider). */


export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (catParam) {
      const match = CATEGORIES.find(c => c.key === catParam || c.label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === catParam);
      if (match) setActiveCategory(match.key);
    }
  }, [catParam]);

  const filtered = TEMPLATES.filter(t => {
    if (activeCategory !== 'all' && !t.category.includes(activeCategory)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCatConfig = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <PageWrapper>
      <TopNav activeLink="templates" logoSub="Templates" />

      <Header>
        {/* Fixed destination, not navigate(-1): browser history sent the
            visitor back to whichever template they had opened before landing
            here, so Back looped between the grid and a detail page instead of
            leaving the section. /templates is top-level, so its Back goes home
            — the same fixed-target pattern the detail page already uses. */}
        <BackButton onClick={() => navigate('/')} label="Back" />
        <PageTitle>{activeCatConfig?.title || 'Templates'}</PageTitle>
        <PageSubtitle>{activeCatConfig?.subtitle || ''}</PageSubtitle>
        {/* TODO: unhide search when ready
        <SearchWrap>
          <SearchIcon><Search /></SearchIcon>
          <SearchInput
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        */}
        <FilterRow>
          {CATEGORIES.map(cat => (
            <FilterChip
              key={cat.key}
              $active={activeCategory === cat.key}
              onClick={() => { setActiveCategory(cat.key); setActiveSub(null); }}
            >
              {cat.label}
            </FilterChip>
          ))}
        </FilterRow>
        {activeCatConfig && activeCatConfig.subs.length > 0 && (
          <SubRow>
            <SubChip $active={activeSub === null} onClick={() => setActiveSub(null)}>All</SubChip>
            {activeCatConfig.subs.map(sub => (
              <SubChip
                key={sub.key}
                $active={activeSub === sub.key}
                onClick={() => setActiveSub(activeSub === sub.key ? null : sub.key)}
              >
                {sub.label}
              </SubChip>
            ))}
          </SubRow>
        )}
      </Header>

      <Grid>
        {filtered.length === 0 ? (
          <EmptyState>No templates in this category yet</EmptyState>
        ) : (
          filtered.map((template, i) => (
            <TemplateCardWrap key={template.id} style={{ animationDelay: `${i * 0.04}s` }} onClick={() => navigate(`/templates/${template.id}`)}>
              <CardSlot>
                <TemplateMockupCard $size="grid" $interactive>
                  <TemplateMockupImage $size="grid" src={template.image} alt={template.title} />
                </TemplateMockupCard>
              </CardSlot>
              <CardMeta>
                <CardTitle>{template.title}</CardTitle>
                <Price $free={template.price === 'Free'}>{template.price}</Price>
              </CardMeta>
            </TemplateCardWrap>
          ))
        )}
      </Grid>

      <LandingFooter onNavigate={(path) => navigate(path)} />
    </PageWrapper>
  );
};
