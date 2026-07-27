# Meditation Timer widget — implementation plan

> New widget **type** `timer` with two **styles**: `bell` (countdown) and
> `breathe` (breathing pacer). Fourth widget type after `calendar` / `clock` /
> `board`.
>
> Status: **BUILT — `bell` style shipping, `breathe` parked.** On `design-experiment`.
>
> What exists: domain + codec + engine + audio + the widget + `/embed/timer`,
> plus an internal `/lab` page that configures it and emits the embed link.
> What does NOT exist yet: any Studio wiring. Users cannot create one. See §8.

---

## 0. Why this one is different

Every existing widget is a **pure render of settings**. Calendar draws a month,
clock draws `new Date()`, board draws image URLs. Nothing has internal state that
outlives a render.

A timer does. It has a **runtime state machine** (idle → running → paused →
finished) that is *not* part of `TimerSettings` and *never* travels in the URL.
This is the one genuinely new architectural idea in this feature. Everything else
follows the `board` trail.

Consequence for the split:

- `TimerSettings` = **configuration** the owner picks in Studio (default duration,
  background, sound). Encoded in the URL. Shared by everyone who sees the embed.
- Runtime state = **per-viewer, per-session**, lives in a React hook, dies on
  reload. Two people on the same Notion page run independent timers.

The duration presets (§2) sit exactly on this seam: `durationMin` is the *default*
from settings; picking a different chip in the embed changes **runtime only** and
does not write back anywhere.

---

## 1. Decisions locked

| Question | Decision | Why |
|---|---|---|
| One type or two? | One type `timer`, two styles | Matches how `clock` holds 3 styles. Two gallery cards, one settings object, one embed route. |
| Style values | `bell`, `breathe` | Short, no collision with existing style names. |
| Visual language | **Apple, light theme.** Soft radial-gradient background that breathes; time set in Inter | Owner-chosen. See §2. |
| Background | **Swappable presets**, not a raw hex | Owner supplied a sage-green gradient reference; more variations coming. |
| Codec type letter | `m` | `c` `k` `w` `b` taken by calendar/clock/weather/board. `m` = meditation. |
| Codec field prefix | `m` + letter | `c*` `k*` `b*` `w*` all taken. |
| Default style | `bell` | The plainer, more universally useful one. |
| Autostart | `false`, not configurable in v1 | A Notion page with 6 embeds must not start 6 timers on load. |
| Session stats / streaks | **Out of scope for v1** | Needs storage; `localStorage` is unreliable in Notion's sandboxed iframe (§7). |
| Background music / ambient | **Out of scope for v1** | Megabytes over an iframe, autoplay-restricted, and most people already have their own audio going. Bell only. |
| Pro gating | Deferred — ship both styles free | One SQL migration later, no frontend deploy. §9. |

### v1 feature set (owner-selected)

- ✅ Duration presets **5 / 10 / 15 / 20** inside the widget
- ✅ Interval bells (quiet chime every N minutes)
- ✅ Pause / reset controls
- ✅ Transparent background mode (`?nobg`)

---

## 2. Visual specification (as built)

The design went through ~10 rounds with the owner. Final state:

**Card.** One card, not a card inside a card — the widget itself is the smoked
surface. Portrait 2:3, 340px max width, 28px radius, default embed box 360×540.

**Field.** A dark green gradient generated entirely in CSS — no image. Four
layers: a pale bloom just past the top-left corner, its wide spill across the
upper quadrant, weight in the opposite corner, and a diagonal base. Plus film
grain from SVG `feTurbulence`.

> **Gotcha, already paid for once:** those gradient positions are in
> `BreathLayer` coordinates, and that layer is inset **-16%** on every side so
> the breathing scale never exposes an edge. The visible card spans roughly
> 12%..88% of that box, so a bloom written at `0% 0%` renders entirely
> off-screen. The first attempt looked flat for exactly this reason.

**Glass rim.** Built from inset shadows, never `border` — it stays independent
of the owner's `showBorder` setting, and a border sits outside the radius curve
while an inset shadow follows it exactly. Layered the way light behaves on a
glass edge: bright top lip, faint rim, dark bottom lip, then two outer shadows.

**Two materials, no third tone.** `ink` (white) for everything written,
`material` (white at ~78% with a blur behind it) for the surfaces that mean
"interactive" — the active segment and the primary button. Solid white read as
far too loud against the calm field.

**Composition.** Not centred. On a 2:3 card the content stack is shorter than
the card, so centring left equal voids top and bottom and the whole thing read
as floating. The clock sits high, the controls sit low, and all the slack
collects in one deliberate breath between them. The running state, which has
only three elements, does centre — spreading three things to the far edges
looks sparse rather than composed.

**Layout numbers** the owner tuned by eye: `MEDITATION` at 12.5px with a doubled
gap under the clock; the Time and Bowl groups lifted 14px; Bowl pulled 4px
closer to Time. The lift is applied by *growing the gap above the button*, since
the action block is bottom-anchored — moving the block itself would drag the
button down with it.

**Progress bar** renders only while a session exists. At rest it was a dead line
pinned at zero: decoration pretending to be information.

### Parked

The `breathe` style (guided breathing pacer) is **parked** at the owner's
request. The code works and responds to a URL asking for it, but it is not
offered anywhere in the UI and is not being developed. `bell` is the shipping
style. The breathing *surface* is still live — it drives the ambient motion
behind the bell style too.

## 3. `TimerSettings` — the value object

`src/domain/value-objects/TimerSettings.ts`, modelled on `ClockSettings`:
readonly fields, defaults in constructor, `fromJson` / `toJson` / `update`.

### Shared fields (every widget type has these)

| Field | Type | Default |
|---|---|---|
| `primaryColor` | string | `#667EEA` |
| `backgroundColor` | string | `#ffffff` |
| `accentColor` | string | `#f1f5f9` |
| `borderRadius` | number | `28` |
| `showBorder` | boolean | `false` |
| `embedWidth` | number | `360` |
| `embedHeight` | number | `540` |
| `theme` | `auto \| light \| dark` | `auto` |

### Timer-specific fields

| Field | Type | Default | Applies to |
|---|---|---|---|
| `style` | `bell \| breathe` | `bell` | both |
| `bgPreset` | `sage \| plain \| …` | `sage` | both |
| `durationMin` | number | `10` | both |
| `intervalBellMin` | number (`0` = off) | `0` | `bell` |
| `endSound` | `bowl \| temple \| crystal \| none` | `bowl` | both |
| `breathPattern` | `coherent \| box \| relax` | `coherent` | `breathe` |
| `showTimeLeft` | boolean | `true` | both |

Breathing patterns:

- `coherent` — 5s in / 5s out (calm default)
- `box` — 4 / 4 / 4 / 4 (in, hold, out, hold)
- `relax` — 4 in / 7 hold / 8 out

> **Naming trap:** the pattern is `relax`, **not `478`.** See §4 — the decoder
> would silently turn the string `'478'` into the number `478`.

`durationMin` is the **default**. The in-widget preset chips override it at
runtime without touching settings.

---

## 4. URL codec — `CompactUrlCodec.ts`

Three edits, plus three traps that fail silently if ignored.

**a. Type letter** — both maps:

```ts
const typeMap        = { calendar: 'c', clock: 'k', weather: 'w', board: 'b', timer: 'm' };
const typeReverseMap = { c: 'calendar', k: 'clock', w: 'weather', b: 'board', m: 'timer' };
```

**b. `FIELD_MAP`** — all `m*` keys are currently free:

```ts
// Timer специфичные (m+символ)
durationMin:     'md',
intervalBellMin: 'mi',
endSound:        'ms',
breathPattern:   'mp',
showTimeLeft:    'mt',
bgPreset:        'mb',
```

**c. `DEFAULTS`** — `durationMin: 10`, `intervalBellMin: 0`, `endSound: 'bowl'`,
`breathPattern: 'coherent'`, `showTimeLeft: true`, `bgPreset: 'sage'`.
(`style` deliberately has no entry — it differs per type and must always encode.)

### ⚠️ Trap 1 — numeric-looking strings get eaten

`decode()` runs `if (!isNaN(Number(value))) settings[longKey] = Number(value)`
**before** it consults string expansions. Any setting whose value is a numeric
string returns as a number. Hence `relax`, not `478`.

### ⚠️ Trap 2 — single-letter values are remapped globally

`decode()` shares one `stringExpansions` table across all fields: `'d'` `'c'`
`'w'` `'a'` `'f'` `'m'` `'s'` `'l'` `'A'` `'L'` `'D'` all expand to something.
Every new timer string value must be **2+ characters** and must not be added to
`stringShortcuts`. `bowl` / `chime` / `none` / `box` / `coherent` / `relax` /
`sage` / `plain` are all safe.

### ⚠️ Trap 3 — decode injects calendar embed defaults

`decode()` seeds `settings` with the entire `DEFAULTS` object, which carries
`embedWidth: 420, embedHeight: 380` (calendar values). A decoded timer therefore
arrives at 420×380 unless size was explicitly encoded. **`TimerEmbedPage` must not
rely on the `TimerSettings` constructor defaults for size.** Check what
`ClockEmbedPage` actually does about this first — clock has the identical problem
and its behaviour is the precedent to copy.

**Test:** extend `CompactUrlCodec.test.ts` with a timer round-trip asserting
`breathPattern` stays the string `'relax'`, `bgPreset` stays `'sage'`, and
`durationMin` returns as a number.

---

## 5. The timing engine

`src/presentation/hooks/useTimerEngine.ts` — the heart of the feature, and the
part most likely to be got wrong.

### Non-negotiable: never count down by decrementing

Browsers throttle `setInterval` in background tabs to ~1/second or worse — and a
meditation timer runs *specifically* while the tab is unfocused. A counter doing
`remaining -= 1` per tick drifts badly: a 10-minute session finishing at 14 real
minutes.

**Derive everything from timestamps:**

```ts
// start / resume
endAt = Date.now() + remainingMs

// every tick (250ms is plenty)
remainingMs = Math.max(0, endAt - Date.now())

// pause
remainingMs = endAt - Date.now()   // freeze, drop endAt
```

The tick becomes a *repaint trigger*, not the source of truth. Throttling then
costs a slightly stale display, never a wrong result.

### API

```ts
type Phase = 'idle' | 'running' | 'paused' | 'finished';

useTimerEngine({ durationMs, intervalMs, onInterval, onFinish }) => {
  phase, remainingMs, elapsedMs, progress /* 0..1 */,
  start, pause, resume, reset, setDuration
}
```

`setDuration` backs the preset chips. Allowed only while `phase === 'idle'` —
changing duration mid-session is meaningless and the UI should hide the chips
once running.

### Breathing phase, same principle

The `breathe` style derives its phase from `elapsedMs % cycleMs` — a pure function
of elapsed time, self-correcting after throttling instead of accumulating error.

```
coherent: [in 5s, out 5s]                    cycle 10s
box:      [in 4s, hold 4s, out 4s, hold 4s]  cycle 16s
relax:    [in 4s, hold 7s, out 8s]           cycle 19s
```

The background `scale()` must be driven by this same elapsed value — **not** by an
independent CSS keyframe animation, or the visual and the phase label drift apart
after a background stint.

### Interval bells

Fire at each `k * intervalMs` crossing, derived from `elapsedMs`. Guard against
double-firing and against a backgrounded tab that jumps past several marks at once
— on a large time jump, fire **once**, not five times.

### Tests

Plain logic, testable with Vitest fake timers: start/pause/resume arithmetic,
interval bells at the right marks, finish firing exactly once, `setDuration`
rejected while running. Plus `src/test/timer-smoke.test.ts` per the project's
`[SMOKE]` convention — simulate a large `Date.now()` jump and assert remaining
time is still correct and only one bell fired.

---

## 6. Audio — zero licensing

`src/presentation/components/widgets/timer/useBell.ts`.

**Synthesise the bell with the Web Audio API. Ship no audio file.** Two or three
detuned sine oscillators plus a long exponential decay envelope make a credible
singing bowl in ~30 lines.

This settles the licensing question outright: we *generate* the sound, so there is
no author, no licence, no attribution, no asset to fetch over the network into a
sandboxed iframe. (If sampled audio is ever wanted, CC0-without-attribution lives
on Pixabay Sounds and on Freesound filtered to CC0 — but there is no reason to
take on the weight.)

**Create `AudioContext` lazily, inside the Start click handler.** That click is the
user gesture satisfying autoplay policy. A context created at module load or on
mount starts `suspended` and the first bell is silent.

**Degrade silently.** Wrap creation in try/catch; if audio is unavailable the timer
still works and still shows its visual completion. `endSound: 'none'` takes the
same path.

> **Open risk — verify on a real Notion embed, do not assume.** Notion embeds via
> iframely with its own sandbox flags, and `App.tsx` already documents a case where
> that sandbox broke `localStorage` badly enough to crash the React tree. Audio may
> or may not survive it. **The visual completion bloom is the primary signal; sound
> is enhancement** — so a negative result costs one setting, not the feature.
>
> Verification: build → deploy to the production domain → paste `/embed/timer?c=…`
> into a real Notion page → run a 10-second session.

---

## 7. Embed page

`src/presentation/pages/TimerEmbedPage.tsx` — copy `ClockEmbedPage.tsx` structure
verbatim; it is the reference implementation:

`UrlCodecService.extractConfigFromUrl()` → `new TimerSettings(…)` →
`extractPublicId()` → `usePublicWidgetSync(publicId)` → live settings override URL
settings → `Widget.createTimer(…)` → `<EmbedScaleWrapper refWidth refHeight>` →
`<TimerWidget>`. Same `GlobalEmbedStyles`, same `WidgetUnavailable` branch on
delete/pause, same `?nobg` handling, same `useResolvedTheme`.

**Route registration — `App.tsx`:**

```tsx
// inside the isEmbedRoute early-return block
<Route path="/embed/timer" element={<TimerEmbedPage />} />
```

**No `localStorage`.** Third-party storage is partitioned and in Safari can throw
outright inside an iframe — precisely why the embed subtree skips the Auth and
Cart providers. Any future "sessions completed" counter needs another mechanism.

**Live-sync interaction:** if the owner edits the widget while a viewer's timer
runs, `usePublicWidgetSync` swaps in new settings mid-session. A duration change
must **not** yank a running timer. Rule: apply a new `durationMs` only when
`phase === 'idle'`; cosmetic changes (background preset, colours, radius) apply
immediately.

---

## 8. Full file checklist

Derived by walking every occurrence of `'board'` — this is the complete surface.

### Domain / infrastructure

| File | Change |
|---|---|
| `domain/value-objects/TimerSettings.ts` | **new** |
| `domain/value-objects/TimerSettings.test.ts` | **new** — defaults, overrides, immutability, JSON round-trip |
| `domain/entities/Widget.ts` | `static createTimer(id, settings)` |
| `domain/entities/Widget.test.ts` | cover the new factory method |
| `infrastructure/repositories/WidgetFactoryImpl.ts` | `case 'timer'` in `createWidget` + `getDefaultSettings`; add to `getSupportedTypes()` |
| `infrastructure/repositories/WidgetRepositoryImpl.ts` | type case (~L63) + `url.includes('/embed/timer')` (~L99) |
| `infrastructure/services/url-codec/CompactUrlCodec.ts` | §4 |
| `infrastructure/services/url-codec/CompactUrlCodec.test.ts` | timer round-trip |

### Widget itself

| File | Change |
|---|---|
| `presentation/hooks/useTimerEngine.ts` | **new** — §5 |
| `presentation/hooks/useTimerEngine.test.ts` | **new** |
| `presentation/components/widgets/TimerWidget.tsx` | **new** — style switch, mirrors `ClockWidget` |
| `presentation/components/widgets/timer/styles/BellTimer.tsx` | **new** |
| `presentation/components/widgets/timer/styles/BreatheTimer.tsx` | **new** |
| `presentation/components/widgets/timer/styles/TimerCommonStyles.ts` | **new** — breathing surface + shared chrome, mirrors `ClockCommonStyles.ts` |
| `presentation/components/widgets/timer/backgroundPresets.ts` | **new** — the preset → gradient map (§2.2) |
| `presentation/components/widgets/timer/useBell.ts` | **new** — §6 |
| `presentation/pages/TimerEmbedPage.tsx` | **new** — §7 |
| `App.tsx` | route in the embed block |

### Studio / dashboard wiring

| File | Change |
|---|---|
| `components/ui/widgetConfig.ts` | `TIMER_STYLES` (Bell / Breathe + lucide icons) + branches in `getWidgetStyleConfig` |
| `components/layout/WidgetDisplay.tsx` | `case 'timer'` (~L106) |
| `components/ui/sidebar/StylePickerPanel.tsx` | `case 'timer'` in `renderPreview` (~L385) |
| `components/ui/forms/CustomizationPanel.tsx` | `isTimer` flag; Timer section — background preset swatches, default duration, interval bell, sound, breath pattern; `getWidgetInfo` style lookup (~L638) |
| `components/dashboard/DashboardViews.tsx` | preview `if (type === 'timer')` (~L162); `WidgetFilter` + `FILTERS`; `ALL_EXPLORE_WIDGETS` + `ExploreFilter` + `EXPLORE_FILTERS`; `CREATE_TYPES` card (~L625); `if (type === 'timer')` (~L773) |
| `pages/StudioPage.tsx` | preview (~L997); `SavedFilter` (~L1122); board-vs-other branches (~L1414, ~L1664); saved-filter chips (~L1905); `Tag $kind` (~L1969) |
| `components/shared/Badges.tsx` | add `timer` to `tagKindTints` + the `$kind` union |
| `components/layout/LayoutCheck.tsx` | widen the three `'calendar' \| 'clock' \| 'board'` unions (~L430–458) |
| `pages/WidgetStudioPage.tsx` | gallery entry + the two `Tag` ternaries (~L1739, ~L1927) |

**Category tint for the new type** (`Badges.tsx` + `CREATE_TYPES`): calendar is
sage, clock blue, board peach. Sage is taken by the calendar tag — and now also by
the default background preset — so the timer tint should go elsewhere. Muted
lavender proposed, translucent like the others. Confirm against the live dashboard.

### Not needed

- **DB migration** — `widgets.type` and `style` are free-form `text`. The free-tier
  3-widget RLS cap already applies to any type.
- **New shared components** — Studio-side composes from existing `Button`, `Card`,
  `Accordion`, `Modal`.

---

## 9. Optional Pro gating

If `breathe` should be Pro-only it is one migration and **no frontend deploy** —
`is_pro_style` is a SQL function:

```sql
create or replace function public.is_pro_style(style text) returns boolean ...
  -- current list: 'typewriter', 'flower'  →  add 'breathe'
```

Applied with `npx supabase db push`. **Never via the Dashboard SQL Editor** — that
is what caused the May 2026 "studio can't save widgets" outage.

Deferred: ship both free, gate later if the styles prove popular.

---

## 10. Commit sequence

One concern per commit, each independently reviewable. Branch `feat-timer-widget`
off `design-experiment`.

1. `feat(timer): TimerSettings value object + tests`
2. `feat(timer): url codec support for timer type + round-trip test`
3. `feat(timer): domain entity + factory wiring`
4. `feat(timer): useTimerEngine hook + timestamp-based tests`
5. `feat(timer): breathing gradient surface + background presets`
6. `feat(timer): Bell style widget`
7. `feat(timer): Breathe style widget`
8. `feat(timer): bell audio via Web Audio, graceful degradation`
9. `feat(timer): /embed/timer page + route`
10. `feat(timer): studio wiring — style picker, customization panel, previews`
11. `feat(timer): dashboard + gallery wiring`
12. `docs(claude.md): document the timer widget`

Steps 1–4 are pure logic with no visual dependency — they can land before a single
pixel is settled. Run `npm run check` (lint + typecheck + test) before each.

---

## 11. Open questions for the owner

1. **The remaining background variations.** One (sage) received; the plan assumes
   more. Send them and each becomes one entry in `backgroundPresets.ts`.
2. **Source file for the sage reference** — so the gradient stops can be sampled
   exactly rather than eyeballed (§2.2).
3. **`nobg` behaviour** (§2.4) — gradient fully dropped, or kept very faint?
4. ~~**Bell character**~~ — resolved: three voices ship (Bowl 174 Hz, Temple 261 Hz, Crystal 660 Hz), each with its own inharmonic partial set. Selectable in-widget, and tapping one previews it.
5. **`durationMin` upper bound** — cap at 60? 90? Affects custom-input validation.
6. **Timer category tint** in the dashboard — lavender proposed, needs a look.
7. **Pro gating** (§9) — decide before launch, not before coding.
