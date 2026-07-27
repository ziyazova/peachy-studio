import { useEffect, useRef, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { MessageSquarePlus, X, MessageSquare, Inspect, Sparkles, Palette, FlaskConical } from 'lucide-react';
import { useDevPanelsHidden } from './useDevPanelsHidden';
import { useAuth } from '@/presentation/context/AuthContext';

type Mode = 'idle' | 'picking' | 'composing' | 'list';
type Category = 'copy' | 'spacing' | 'color' | 'layout' | 'bug' | 'other';
type Status = 'pending' | 'fixed' | 'resolved';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'copy', label: 'copy', emoji: '📝' },
  { id: 'spacing', label: 'spacing', emoji: '📏' },
  { id: 'color', label: 'color', emoji: '🎨' },
  { id: 'layout', label: 'layout', emoji: '🧩' },
  { id: 'bug', label: 'bug', emoji: '🐞' },
  { id: 'other', label: 'other', emoji: '💬' },
];

interface PickedTarget {
  selector: string;
  componentChain: string[];
  dataUx: string | null;
  text: string;
  rect: { x: number; y: number; w: number; h: number };
}

interface Comment {
  id: string;
  status: Status;
  comment: string;
  categories: Category[];
  target: PickedTarget | null;
  url: string;
  viewport: { w: number; h: number } | null;
  createdAt: string;
  updatedAt: string;
  fixedAt?: string;
  resolvedAt?: string;
}

export function ClaudeFeedback() {
  const hidden = useDevPanelsHidden();
  const { devProOverride, setDevProOverride } = useAuth();
  const [mode, setMode] = useState<Mode>('idle');
  const [target, setTarget] = useState<PickedTarget | null>(null);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState<Set<Category>>(new Set());
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const hoverBoxRef = useRef<HTMLDivElement>(null);
  /* Mirror DebugOverlay's enabled state via the broadcast event so the
     "Debug inspector" row in this dev panel can show active/inactive
     and act as a real on/off toggle. */
  const [debugOn, setDebugOn] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => {
      setDebugOn(!!(e as CustomEvent<{ enabled: boolean }>).detail?.enabled);
    };
    window.addEventListener('peachy:debug-state', handler);
    return () => window.removeEventListener('peachy:debug-state', handler);
  }, []);

  const pendingCount = comments.filter((c) => c.status === 'pending').length;
  const fixedCount = comments.filter((c) => c.status === 'fixed').length;

  const toggleCategory = (c: Category) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('/__claude-feedback');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch {
      // dev server not running — silent
    }
  }, []);

  // Poll every 3s so "fixed" badge appears as soon as Claude edits comments.json
  useEffect(() => {
    fetchComments();
    const id = window.setInterval(fetchComments, 3000);
    return () => window.clearInterval(id);
  }, [fetchComments]);

  useEffect(() => {
    if (mode !== 'picking') return;

    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el || el.closest('[data-claude-feedback]')) return;
      const rect = el.getBoundingClientRect();
      if (hoverBoxRef.current) {
        hoverBoxRef.current.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
        hoverBoxRef.current.style.width = `${rect.width}px`;
        hoverBoxRef.current.style.height = `${rect.height}px`;
        hoverBoxRef.current.style.opacity = '1';
      }
    };

    const onClick = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el || el.closest('[data-claude-feedback]')) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const dataUxEl = el.closest('[data-ux]');
      setTarget({
        selector: describeElement(el),
        componentChain: getComponentChain(el),
        dataUx: dataUxEl ? dataUxEl.getAttribute('data-ux') : null,
        text: (el.innerText || '').slice(0, 120).trim(),
        rect: { x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) },
      });
      setMode('composing');
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('idle');
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [mode]);

  const send = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/__claude-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.pathname + window.location.search,
          viewport: { w: window.innerWidth, h: window.innerHeight },
          target,
          categories: Array.from(categories),
          comment: comment.trim(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const created: Comment = await res.json();
      setComments((prev) => [...prev, created]);
      setToast('Отправлено');
      setComment('');
      setCategories(new Set());
      setTarget(null);
      setMode('list');
      setTimeout(() => setToast(null), 1800);
    } catch {
      setToast('Ошибка: запусти dev-сервер');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSending(false);
    }
  };

  const patchComment = async (id: string, patch: Partial<Pick<Comment, 'comment' | 'status'>>) => {
    try {
      const res = await fetch(`/__claude-feedback?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return;
      const updated: Comment = await res.json();
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
      // resolved items disappear from the list view
      if (updated.status === 'resolved') {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      setToast('Не получилось сохранить');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`/__claude-feedback?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) return;
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setToast('Не получилось удалить');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const text = editing.text.trim();
    if (!text) return;
    await patchComment(editing.id, { comment: text });
    setEditing(null);
  };

  return (
    <div data-claude-feedback>
      {mode === 'picking' && <HoverBox ref={hoverBoxRef} />}
      {mode === 'picking' && <HintBar>Клик на элемент · Esc чтобы отменить</HintBar>}

      {mode === 'composing' && target && (
        <Backdrop onClick={() => setMode('idle')}>
          <Panel onClick={(e) => e.stopPropagation()}>
            <PanelHeader>
              <strong>Коммент для Claude</strong>
              <CloseBtn onClick={() => setMode('idle')}>×</CloseBtn>
            </PanelHeader>
            <TargetInfo>
              {target.componentChain.length > 0 ? (
                <code>{'<'}{target.componentChain.join(' ▸ ')}{'>'}</code>
              ) : (
                <code>{target.selector}</code>
              )}
              {target.dataUx && <DataUx>data-ux: {target.dataUx}</DataUx>}
              {target.text && <TargetText>&ldquo;{target.text}&rdquo;</TargetText>}
            </TargetInfo>
            <Chips>
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  type="button"
                  $active={categories.has(c.id)}
                  onClick={() => toggleCategory(c.id)}
                >
                  <span>{c.emoji}</span> {c.label}
                </Chip>
              ))}
            </Chips>
            <Textarea
              autoFocus
              placeholder="Что поправить? (укажи размер если точность важна: 12px, 2 размера, 6%)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send();
              }}
            />
            <PanelFooter>
              <Hint>⌘+Enter</Hint>
              <SendBtn onClick={send} disabled={sending || !comment.trim()}>
                {sending ? 'Отправка…' : 'Отправить'}
              </SendBtn>
            </PanelFooter>
          </Panel>
        </Backdrop>
      )}

      {mode === 'list' && (
        <Backdrop onClick={() => setMode('idle')}>
          <Panel onClick={(e) => e.stopPropagation()} $wide>
            <PanelHeader>
              <strong>Комменты ({comments.length})</strong>
              <CloseBtn onClick={() => setMode('idle')}>×</CloseBtn>
            </PanelHeader>

            {comments.length === 0 && (
              <EmptyState>
                Пока ничего. Жми 💬 чтобы оставить первый коммент.
              </EmptyState>
            )}

            <CommentList>
              {comments.map((c) => (
                <CommentRow key={c.id} $status={c.status}>
                  <RowTop>
                    <StatusBadge $status={c.status}>
                      {c.status === 'pending' && <>🟡 pending</>}
                      {c.status === 'fixed' && <>✅ fixed by Claude</>}
                    </StatusBadge>
                    <RowMeta>{formatTime(c.createdAt)}</RowMeta>
                  </RowTop>

                  {c.target && (
                    <RowTarget>
                      {c.target.componentChain.length > 0 ? (
                        <code>{c.target.componentChain.join(' ▸ ')}</code>
                      ) : (
                        <code>{c.target.selector}</code>
                      )}
                      {c.target.dataUx && <DataUxSmall>data-ux: {c.target.dataUx}</DataUxSmall>}
                    </RowTarget>
                  )}

                  {editing?.id === c.id ? (
                    <>
                      <Textarea
                        autoFocus
                        value={editing.text}
                        onChange={(e) => setEditing({ id: c.id, text: e.target.value })}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') setEditing(null);
                        }}
                      />
                      <RowActions>
                        <GhostBtn onClick={() => setEditing(null)}>Отмена</GhostBtn>
                        <PrimaryBtn onClick={saveEdit} disabled={!editing.text.trim()}>
                          Сохранить
                        </PrimaryBtn>
                      </RowActions>
                    </>
                  ) : (
                    <>
                      <RowText>{c.comment}</RowText>
                      <RowActions>
                        {c.status === 'fixed' && (
                          <PrimaryBtn
                            onClick={() => patchComment(c.id, { status: 'resolved' })}
                            title="Скрыть — Claude уже пофиксил"
                          >
                            ✓ Resolve
                          </PrimaryBtn>
                        )}
                        {c.status === 'pending' && (
                          <GhostBtn onClick={() => setEditing({ id: c.id, text: c.comment })}>
                            ✏️ Edit
                          </GhostBtn>
                        )}
                        {c.status === 'fixed' && (
                          <GhostBtn
                            onClick={() => patchComment(c.id, { status: 'pending' })}
                            title="Ещё не пофикшено — вернуть в работу"
                          >
                            ↻ Reopen
                          </GhostBtn>
                        )}
                        <GhostBtn
                          onClick={() => {
                            if (window.confirm('Удалить коммент?')) deleteComment(c.id);
                          }}
                          $danger
                        >
                          🗑 Delete
                        </GhostBtn>
                      </RowActions>
                    </>
                  )}
                </CommentRow>
              ))}
            </CommentList>
          </Panel>
        </Backdrop>
      )}

      {toast && <Toast>{toast}</Toast>}

      {!hidden && (
        <DevPanel data-debug-ui>
          {/* Single-line rows — title + optional badge, no DevSub.
              Cleaner stack now that we're up to 5 actions. Hover the
              row for full label via title attribute. */}
          <DevRow
            $active={mode === 'picking'}
            onClick={() => setMode(mode === 'picking' ? 'idle' : 'picking')}
            title={mode === 'picking' ? 'Cancel picking (esc)' : 'Pick any element to leave a comment'}
          >
            <DevIcon>{mode === 'picking' ? <X /> : <MessageSquarePlus />}</DevIcon>
            <DevTitle>{mode === 'picking' ? 'Cancel' : 'New comment'}</DevTitle>
          </DevRow>

          <DevRow
            $active={mode === 'list'}
            onClick={() => setMode(mode === 'list' ? 'idle' : 'list')}
            title={`${pendingCount} pending · ${fixedCount} fixed`}
          >
            <DevIcon><MessageSquare /></DevIcon>
            <DevTitle>
              Comments
              {(pendingCount + fixedCount) > 0 && (
                <DevBadge $green={fixedCount > 0 && pendingCount === 0}>
                  {fixedCount > 0 ? fixedCount : pendingCount}
                </DevBadge>
              )}
            </DevTitle>
          </DevRow>

          <DevRow
            $active={debugOn}
            onClick={() => window.dispatchEvent(new Event('peachy:toggle-debug'))}
            title="Toggle debug inspector (⌃D)"
          >
            <DevIcon><Inspect /></DevIcon>
            <DevTitle>Debug{debugOn ? ' · on' : ''}</DevTitle>
          </DevRow>

          <DevRow
            $active={devProOverride}
            onClick={() => setDevProOverride(!devProOverride)}
            title={devProOverride ? 'Pro override is ON — unlimited widgets, settings unlocked' : 'Toggle Pro override for testing'}
          >
            <DevIcon><Sparkles /></DevIcon>
            <DevTitle>Pro{devProOverride ? ' · on' : ''}</DevTitle>
          </DevRow>

          <DevRowLink href="/dev" title="Design system showcase (/dev)">
            <DevIcon><Palette /></DevIcon>
            <DevTitle>Design system</DevTitle>
          </DevRowLink>

          <DevRowLink href="/lab" title="Unreleased work — configure and grab embed links (/lab)">
            <DevIcon><FlaskConical /></DevIcon>
            <DevTitle>Lab</DevTitle>
          </DevRowLink>
        </DevPanel>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function describeElement(el: HTMLElement): string {
  const parts: string[] = [];
  let cur: HTMLElement | null = el;
  for (let i = 0; cur && i < 3; i++) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) part += `#${cur.id}`;
    const cls = (cur.className && typeof cur.className === 'string') ? cur.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    if (cls) part += `.${cls}`;
    parts.unshift(part);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

// Walk the React fiber tree to collect the nearest styled-component / React component names.
// This gives direct mapping to code (e.g. "Avatar > Avatars > Eyebrow") instead of autogen CSS classes.
function getComponentChain(el: HTMLElement): string[] {
  const fiberKey = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  if (!fiberKey) return [];
  let fiber: any = (el as any)[fiberKey];
  const names: string[] = [];
  const seen = new Set<string>();
  while (fiber && names.length < 4) {
    const t = fiber.type || fiber.elementType;
    if (t) {
      const name =
        (typeof t === 'string' ? null : (t.displayName || t.name)) ||
        (t.target ? `styled.${t.target}` : null);
      if (name && typeof name === 'string' && !name.startsWith('_') && !seen.has(name)) {
        if (!/^(Symbol|Anonymous|undefined)$/.test(name)) {
          names.push(name);
          seen.add(name);
        }
      }
    }
    fiber = fiber.return;
  }
  return names;
}

const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

/* ── Unified dev panel — matches BranchSwitcher visual language ── */

const slideInPanel = keyframes`
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
`;

const DevPanel = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 208px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  /* Tinted obsidian glass — slightly cooler than pure black, with a
   * very soft indigo undertone so the panel reads as part of the
   * Peachy palette rather than a generic devtool. */
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(99, 102, 241, 0.10) 0%, rgba(99, 102, 241, 0) 60%),
    rgba(18, 18, 22, 0.72);
  @supports not (backdrop-filter: blur(0)) {
    background: rgba(18, 18, 22, 0.96);
  }
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  color: #fff;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  z-index: 2147483600;
  box-shadow:
    0 24px 48px -16px rgba(0, 0, 0, 0.55),
    0 4px 12px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    inset 0 -1px 0 rgba(0, 0, 0, 0.20);
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid rgba(255, 255, 255, 0.10);
  animation: ${slideInPanel} 0.32s cubic-bezier(0.22, 1, 0.36, 1);
`;

const DevBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px 8px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

/* Plain string — no theme context. Keep literals (this is dev tooling
 * only). Spring-curve transition on every prop so toggle/hover feels
 * tactile rather than mechanical. */
const devRowBase = `
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.22s ease,
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  text-align: left;
  text-decoration: none;
  width: 100%;
  position: relative;
`;

const DevRow = styled.button<{ $active: boolean }>`
  ${devRowBase}
  /* Active = soft indigo wash + glowing edge, picking up Peachy's
   * brand accent (#6366F1). Inactive rows stay quiet — only the
   * active one carries colour, which makes the panel feel alive
   * without being noisy. */
  background: ${({ $active }) => ($active
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0.10))'
    : 'transparent')};
  border-color: ${({ $active }) => ($active ? 'rgba(129, 140, 248, 0.35)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)')};
  box-shadow: ${({ $active }) => ($active
    ? '0 0 0 1px rgba(129, 140, 248, 0.10), 0 6px 18px -8px rgba(99, 102, 241, 0.50)'
    : 'none')};

  &:hover {
    background: ${({ $active }) => ($active
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(99, 102, 241, 0.14))'
      : 'rgba(255, 255, 255, 0.06)')};
    border-color: ${({ $active }) => ($active ? 'rgba(129, 140, 248, 0.45)' : 'rgba(255, 255, 255, 0.10)')};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DevRowLink = styled.a`
  ${devRowBase}

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.10);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DevIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: currentColor;
  opacity: 0.85;
  svg {
    width: 15px;
    height: 15px;
    stroke-width: 1.75;
  }
`;

const DevText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
`;

const DevTitle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
`;

const DevSub = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.02em;
`;

const DevBadge = styled.span<{ $green: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $green }) => ($green ? '#10b981' : '#f59e0b')};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
`;

const HoverBox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  border: 2px solid #6366F1;
  background: rgba(110, 127, 242, 0.12);
  border-radius: ${({ theme }) => theme.radii.xs};
  z-index: 2147483500;
  opacity: 0;
  transition: opacity 0.1s ease;
  will-change: transform;
`;

const HintBar = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 17, 19, 0.72);
  @supports not (backdrop-filter: blur(0)) {
    background: rgba(17, 17, 19, 0.96);
  }
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  color: #fff;
  padding: 9px 18px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 13px;
  font-family: system-ui, sans-serif;
  z-index: 2147483600;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 12px 32px -8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  /* Comments panel anchors to the bottom-LEFT now that the DevPanel
   * (Feedback toolbar) lives in the bottom-right corner — keeps the
   * two surfaces from overlapping. */
  justify-content: flex-start;
  padding: 24px;
  z-index: 2147483600;
  animation: ${fadeIn} 0.15s ease;
`;

const Panel = styled.div<{ $wide?: boolean }>`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  width: ${({ $wide }) => ($wide ? '440px' : '380px')};
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  font-family: system-ui, sans-serif;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #111;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0 4px;
  &:hover { color: #111; }
`;

const TargetInfo = styled.div`
  background: #f5f5f5;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 8px 10px;
  margin-bottom: 12px;
  font-size: 12px;
  code {
    color: #6366F1;
    font-family: ui-monospace, monospace;
    word-break: break-all;
  }
`;

const TargetText = styled.div`
  color: #666;
  margin-top: 4px;
  font-style: italic;
`;

const DataUx = styled.div`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  background: #111;
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.xs};
  font-size: 11px;
  font-family: ui-monospace, monospace;
`;

const DataUxSmall = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 1px 6px;
  background: #111;
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.xs};
  font-size: 11px;
  font-family: ui-monospace, monospace;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`;

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ $active }) => ($active ? '#6366F1' : '#ddd')};
  background: ${({ $active }) => ($active ? 'rgba(110,127,242,0.12)' : '#fff')};
  color: ${({ $active }) => ($active ? '#6366F1' : '#666')};
  font-size: 12px;
  font-family: inherit;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    border-color: #6366F1;
    color: #6366F1;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: #6366F1; }
`;

const PanelFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const Hint = styled.span`
  font-size: 12px;
  color: #999;
`;

const SendBtn = styled.button`
  background: #111;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 14px;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #000; }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 160px;
  right: 24px;
  background: #111;
  color: #fff;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  font-family: system-ui, sans-serif;
  z-index: 2147483600;
  animation: ${fadeIn} 0.2s ease;
`;

const EmptyState = styled.div`
  padding: 24px 12px;
  text-align: center;
  color: #888;
  font-size: 13px;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CommentRow = styled.div<{ $status: Status }>`
  border: 1px solid ${({ $status }) => ($status === 'fixed' ? '#10b981' : '#eee')};
  background: ${({ $status }) => ($status === 'fixed' ? 'rgba(16, 185, 129, 0.05)' : '#fff')};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px 12px;
  font-size: 13px;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const StatusBadge = styled.span<{ $status: Status }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $status }) => ($status === 'fixed' ? '#10b981' : '#f59e0b')};
`;

const RowMeta = styled.span`
  font-size: 11px;
  color: #999;
`;

const RowTarget = styled.div`
  font-size: 11px;
  margin-bottom: 6px;
  code {
    color: #6366F1;
    font-family: ui-monospace, monospace;
    word-break: break-all;
  }
`;

const RowText = styled.div`
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 8px;
`;

const RowActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const GhostBtn = styled.button<{ $danger?: boolean }>`
  background: #fff;
  border: 1px solid #ddd;
  color: ${({ $danger }) => ($danger ? '#ef4444' : '#333')};
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  &:hover {
    border-color: ${({ $danger }) => ($danger ? '#ef4444' : '#6366F1')};
    color: ${({ $danger }) => ($danger ? '#ef4444' : '#6366F1')};
  }
`;

const PrimaryBtn = styled.button`
  background: #10b981;
  color: #fff;
  border: none;
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #059669; }
`;
