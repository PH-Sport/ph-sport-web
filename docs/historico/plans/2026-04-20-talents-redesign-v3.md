# Talents Page Redesign (V3 — Phase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `/jugadores/` and `/en/players/` pages (sections/PlayersGrid.astro) with a new V3 design: editorial hero, sticky controls bar (search + sort only), 2→3→5 responsive grid of non-clickable visual cards that match the home talents aesthetic.

**Architecture:** Build one new self-contained section component (`TalentsSection.astro`) that owns hero, controls, and grid. Pages become thin wrappers. No client-side modal on this page — cards are purely visual (hover bracket + underline + lift). Client-side search and sort only; default order = `data/jugadores.json` insertion order. `PortraitCard`, `player-modal.ts/css`, and `buildModalPayloadsForLang` stay intact because `TeamSection.astro` still depends on them; only PlayersGrid-specific helpers get deleted.

**Tech Stack:** Astro 5 SSG, scoped component styles, TypeScript strict i18n (`TranslationKey = keyof typeof es`), CSS custom properties (`--color-ph-gold`, `--color-ph-white`, `--font-display`, `--ph-section-px`), `prefers-reduced-motion` handling.

**Scope decisions (confirmed with user):**
- Cards are visual-only: NO click, NO modal, NO link to detail pages. Only hover effect (corner bracket + underline + translateY).
- Default sort preserves JSON order (Juan Cruz → Pedro Lima → Dani Requena → …). A-Z and Z-A sort options are client-side only.
- Page shows **players only** (no coaches, no tab switcher). Coaches stay reachable at `/jugadores/<slug>/` via direct URL but drop from the listing grid.
- `/jugadores/<slug>/` and `/en/players/<slug>/` detail pages remain untouched (not reachable from grid for now).
- Home talents cards become non-clickable too, for consistency.

---

## File Structure

**New files:**
- `src/components/sections/TalentsSection.astro` — hero + controls + grid + script, owns all page-specific layout.

**Modified files:**
- `src/i18n/es.ts` — add `talents.*` keys; drop `players.subsection.*`, `players.tabs.aria`, `players.sort.*` (only PlayersGrid/PlayersSortRow use them).
- `src/i18n/en.ts` — mirror the same delta.
- `src/pages/jugadores/index.astro` — swap `<PlayersGrid>` for `<TalentsSection>` and pass pre-built player payloads.
- `src/pages/en/players/index.astro` — same.
- `src/components/sections/HomePlayersSection.astro` — replace `<a class="home-players__card">` with `<div class="home-players__card">`, drop `href` and focus-visible styles, preserve hover animations.

**Deleted files:**
- `src/components/sections/PlayersGrid.astro`
- `src/components/ui/PlayersSortRow.astro`
- `src/components/ui/PlayersViewDropdown.astro`

**Preserved (do NOT touch):**
- `src/components/ui/PortraitCard.astro` — still used by `TeamSection.astro`.
- `src/scripts/player-modal.ts`, `src/styles/player-modal.css` — still used by `TeamSection.astro`.
- `src/lib/playerDetail.ts` — keep `buildModalPayloadsForLang` and `ModalPayload` (TeamSection depends on them).
- `src/lib/sortRoster.ts` — still useful (not used by new grid but may be used elsewhere); leave alone.
- `src/pages/jugadores/[slug].astro`, `src/pages/en/players/[slug].astro` — detail routes keep working.

---

## Reference design tokens

Use these CSS custom properties throughout:

```css
--color-ph-black       /* page bg */
--color-ph-bg-2        /* card/placeholder bg */
--color-ph-white       /* primary text */
--color-ph-ink-soft    /* secondary text (#b5b7bb) */
--color-ph-gold        /* accent (#d6b25e) */
--color-ph-line        /* hairline borders (rgba 255/255/255/0.12) */
--color-ph-line-strong /* stronger hairline (rgba 255/255/255/0.24) */
--font-display         /* Inter Tight for titles */
--font-mono            /* JetBrains Mono for eyebrows/meta */
--font-sans            /* Helvetica Neue for CTAs */
--ph-section-px        /* clamp(20px, 4vw, 48px) */
```

Mirror conventions from `HomePlayersSection.astro`: gold eyebrow with a leading hairline (`::before { width: 28px; height: 1px; }`), italic gold accent in the title, gradient overlay bottom-up on cards, absolute-positioned meta.

---

## Task 1: i18n refresh — add talents keys, drop PlayersGrid-only keys

**Files:**
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: Add new `talents.*` block in `src/i18n/es.ts`**

Add this block immediately below the `// --- Jugadores ---` block (after line `'players.detail.bioEmpty': …`):

```ts
  // --- Talentos (página V3) ---
  'talents.eyebrow': '— Talentos',
  'talents.title': 'El ',
  'talents.titleAccent': 'roster',
  'talents.lead': 'Futbolistas profesionales con proyección internacional. Cada carrera, un proyecto distinto.',
  'talents.search.placeholder': 'Buscar por nombre…',
  'talents.search.label': 'Buscar jugadores',
  'talents.search.clear': 'Limpiar búsqueda',
  'talents.sort.label': 'Orden',
  'talents.sort.default': 'Predeterminado',
  'talents.sort.az': 'A-Z',
  'talents.sort.za': 'Z-A',
  'talents.empty.filter': 'No hay resultados para tu búsqueda.',
  'talents.reset': 'Limpiar filtros',
```

- [ ] **Step 2: Remove PlayersGrid-only keys from `src/i18n/es.ts`**

Delete these exact lines (they are only referenced by `PlayersGrid.astro` and `PlayersSortRow.astro`, both slated for deletion in Task 5):

```ts
  'players.subsection.players': 'Jugadores',
  'players.subsection.coaches': 'Entrenadores',
  'players.tabs.aria': 'Elegir entre jugadores y entrenadores',
  'players.sort.label': 'Orden',
  'players.sort.aria': 'Elegir orden de la lista',
  'players.sort.option.default': 'Predeterminado',
  'players.sort.option.az': 'A-Z',
  'players.sort.option.za': 'Z-A',
```

Keep `players.title`, `players.subtitle`, `players.club.none`, `players.back`, `players.empty`, `players.detail.bioEmpty` (still used by `[slug].astro`, HomePlayersSection, and playerDetail.ts).

- [ ] **Step 3: Mirror in `src/i18n/en.ts` — add talents block**

```ts
  // --- Talents (page V3) ---
  'talents.eyebrow': '— Talents',
  'talents.title': 'The ',
  'talents.titleAccent': 'roster',
  'talents.lead': 'Elite footballers with international projection. Each career, a distinct project.',
  'talents.search.placeholder': 'Search by name…',
  'talents.search.label': 'Search players',
  'talents.search.clear': 'Clear search',
  'talents.sort.label': 'Sort',
  'talents.sort.default': 'Default',
  'talents.sort.az': 'A-Z',
  'talents.sort.za': 'Z-A',
  'talents.empty.filter': 'No results for your search.',
  'talents.reset': 'Clear filters',
```

- [ ] **Step 4: Remove the same 8 keys from `src/i18n/en.ts`**

Delete the EN counterparts of the keys removed in Step 2 (same key names; translated values).

- [ ] **Step 5: Verify i18n type parity**

Run: `npx astro check`
Expected: zero new errors from i18n (en.ts `Record<TranslationKey, string>` still satisfied because both files added and removed the same keys).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/es.ts src/i18n/en.ts
git commit -m "feat(i18n): add talents.* keys, drop PlayersGrid-only keys"
```

---

## Task 2: Home talents cards non-clickable

**Files:**
- Modify: `src/components/sections/HomePlayersSection.astro`

- [ ] **Step 1: Swap anchor for div and drop href/focus-visible**

In `src/components/sections/HomePlayersSection.astro`, replace the card anchor markup (lines ~32-46):

From:
```astro
<li class={`home-players__item home-players__item--${idx + 1}`}>
  <a class="home-players__card" href={player.paths[lang]}>
    <div class="home-players__photo">
      <img src={player.photoSrc} alt={player.name} loading="lazy" decoding="async" />
    </div>
    <span class="home-players__corner" aria-hidden="true"></span>
    <div class="home-players__meta">
      <span class="home-players__idx">{String(idx + 1).padStart(2, '0')}</span>
      <span class="home-players__name">{player.name}</span>
      <span class="home-players__club">{player.subtitle}</span>
    </div>
    <span class="home-players__underline" aria-hidden="true"></span>
  </a>
</li>
```

To:
```astro
<li class={`home-players__item home-players__item--${idx + 1}`}>
  <div class="home-players__card">
    <div class="home-players__photo">
      <img src={player.photoSrc} alt={player.name} loading="lazy" decoding="async" />
    </div>
    <span class="home-players__corner" aria-hidden="true"></span>
    <div class="home-players__meta">
      <span class="home-players__idx">{String(idx + 1).padStart(2, '0')}</span>
      <span class="home-players__name">{player.name}</span>
      <span class="home-players__club">{player.subtitle}</span>
    </div>
    <span class="home-players__underline" aria-hidden="true"></span>
  </div>
</li>
```

- [ ] **Step 2: Drop focus-visible styles inside `<style>`**

Remove this block from the style section (now unreachable without anchor):

```css
.home-players__card:focus-visible {
  outline: 2px solid var(--color-ph-gold, #d6b25e);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Keep hover styles untouched**

Verify these hover rules still exist exactly as written (they apply equally to `<div class="home-players__card">`):

```css
.home-players__card:hover { transform: translateY(-3px); }
.home-players__card:hover .home-players__name { color: var(--color-ph-gold, #d6b25e); }
.home-players__card:hover .home-players__corner { opacity: 1; }
.home-players__card:hover .home-players__underline { transform: scaleX(1); }
```

- [ ] **Step 4: Visual check — home page loads, hover still animates, cards are inert to click**

Run: `npx astro check`
Expected: no new errors (`player.paths[lang]` reference removed so no regression).

Open `http://localhost:4321/` and verify:
- Three cards render.
- Hover shows corner bracket + gold underline + slight lift.
- Clicking a card does nothing (no navigation).
- Text selection still works on names.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HomePlayersSection.astro
git commit -m "feat(home): make talents cards non-clickable (hover-only visuals)"
```

---

## Task 3: Build `TalentsSection.astro`

**Files:**
- Create: `src/components/sections/TalentsSection.astro`

This component owns the full talents page body: hero header, sticky controls bar, grid, empty-filter state, and the vanilla JS script for client-side search + sort. Receives `lang` and a pre-built `players: PlayerDetailPayload[]` array (already in `data/jugadores.json` insertion order).

- [ ] **Step 1: Create the component with full markup + styles + script**

Write the full file:

```astro
---
import type { PlayerDetailPayload } from '@/lib/playerDetail';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
  players: PlayerDetailPayload[];
}

const { lang, players } = Astro.props;
const t = useTranslations(lang);
---

<section class="talents" aria-labelledby="talents-title">
  <header class="talents__head">
    <span class="talents__eyebrow">{t('talents.eyebrow')}</span>
    <h1 class="talents__title" id="talents-title">
      {t('talents.title')}<em>{t('talents.titleAccent')}</em>.
    </h1>
    <p class="talents__lead">{t('talents.lead')}</p>
  </header>

  <div class="talents__controls" data-talents-controls>
    <label class="talents__search">
      <span class="visually-hidden">{t('talents.search.label')}</span>
      <svg class="talents__search-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="m20 20-3.5-3.5"></path>
      </svg>
      <input
        type="search"
        class="talents__search-input"
        placeholder={t('talents.search.placeholder')}
        aria-label={t('talents.search.label')}
        autocomplete="off"
        data-talents-search
      />
      <button
        type="button"
        class="talents__search-clear"
        aria-label={t('talents.search.clear')}
        data-talents-clear
        hidden
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="m6 6 12 12M18 6 6 18"></path>
        </svg>
      </button>
    </label>

    <label class="talents__sort">
      <span class="talents__sort-label">{t('talents.sort.label')}</span>
      <select class="talents__sort-select" data-talents-sort>
        <option value="default">{t('talents.sort.default')}</option>
        <option value="az">{t('talents.sort.az')}</option>
        <option value="za">{t('talents.sort.za')}</option>
      </select>
      <svg class="talents__sort-arrow" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </label>
  </div>

  <ul class="talents__grid" role="list" data-talents-grid>
    {players.map((player, idx) => (
      <li
        class="talents__item"
        data-talent-card
        data-name={player.name}
        data-index={idx}
      >
        <div class="talents__card">
          <div class="talents__photo">
            <img src={player.photoSrc} alt={player.name} loading="lazy" decoding="async" width="480" height="640" />
          </div>
          <span class="talents__corner" aria-hidden="true"></span>
          <div class="talents__meta">
            <span class="talents__name">{player.name}</span>
            <span class="talents__club">{player.subtitle}</span>
          </div>
          <span class="talents__underline" aria-hidden="true"></span>
        </div>
      </li>
    ))}
  </ul>

  <p class="talents__empty" data-talents-empty hidden>
    {t('talents.empty.filter')}
    <button type="button" class="talents__reset" data-talents-reset>
      {t('talents.reset')}
    </button>
  </p>
</section>

<style>
  .talents {
    padding: clamp(96px, 14vw, 160px) var(--ph-section-px, clamp(20px, 4vw, 48px)) clamp(80px, 12vw, 140px);
    background: var(--color-ph-black, #0d0f12);
    color: var(--color-ph-white, #ffffff);
  }

  /* Hero header */
  .talents__head { max-width: 840px; margin-bottom: clamp(32px, 5vw, 56px); }

  .talents__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold, #d6b25e);
  }
  .talents__eyebrow::before {
    content: "";
    width: 28px;
    height: 1px;
    background: var(--color-ph-gold, #d6b25e);
  }

  .talents__title {
    font-family: var(--font-display, 'Inter Tight', sans-serif);
    font-weight: 500;
    font-size: clamp(44px, 8vw, 112px);
    letter-spacing: -0.03em;
    line-height: 0.98;
    margin: 18px 0 0;
    text-wrap: balance;
  }
  .talents__title em {
    color: var(--color-ph-gold, #d6b25e);
    font-style: italic;
    font-weight: 400;
  }

  .talents__lead {
    margin: 22px 0 0;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 16px;
    line-height: 1.65;
    max-width: 560px;
  }

  /* Sticky controls bar */
  .talents__controls {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 0;
    margin-bottom: clamp(24px, 4vw, 40px);
    background: var(--color-ph-black, #0d0f12);
    border-bottom: 1px solid var(--color-ph-line, rgba(255, 255, 255, 0.12));
  }

  .talents__search {
    position: relative;
    flex: 1 1 280px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid var(--color-ph-line-strong, rgba(255, 255, 255, 0.24));
    border-radius: 100px;
    transition: border-color 0.2s;
  }
  .talents__search:focus-within {
    border-color: var(--color-ph-gold, #d6b25e);
  }
  .talents__search-icon {
    flex: 0 0 auto;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }
  .talents__search-input {
    flex: 1 1 auto;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-ph-white, #ffffff);
    font-family: var(--font-sans, 'Helvetica Neue', sans-serif);
    font-size: 14px;
    min-width: 0;
  }
  .talents__search-input::placeholder {
    color: var(--color-ph-ink-soft, #b5b7bb);
  }
  /* Hide native clear/search decorations (we render our own) */
  .talents__search-input::-webkit-search-decoration,
  .talents__search-input::-webkit-search-cancel-button,
  .talents__search-input::-webkit-search-results-button,
  .talents__search-input::-webkit-search-results-decoration {
    appearance: none;
  }
  .talents__search-clear {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--color-ph-ink-soft, #b5b7bb);
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }
  .talents__search-clear:hover {
    color: var(--color-ph-white, #ffffff);
    background: rgba(255, 255, 255, 0.06);
  }

  .talents__sort {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 40px 12px 16px;
    border: 1px solid var(--color-ph-line-strong, rgba(255, 255, 255, 0.24));
    border-radius: 100px;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .talents__sort:focus-within { border-color: var(--color-ph-gold, #d6b25e); }
  .talents__sort-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }
  .talents__sort-select {
    appearance: none;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-ph-white, #ffffff);
    font-family: var(--font-sans, 'Helvetica Neue', sans-serif);
    font-size: 14px;
    padding-right: 4px;
    cursor: pointer;
  }
  .talents__sort-select option {
    background: var(--color-ph-bg-2, #15171b);
    color: var(--color-ph-white, #ffffff);
  }
  .talents__sort-arrow {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }

  /* Grid: 2 → 3 → 5 columns */
  .talents__grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(10px, 1.5vw, 16px);
  }
  @media (min-width: 720px) {
    .talents__grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  }
  @media (min-width: 1200px) {
    .talents__grid { grid-template-columns: repeat(5, 1fr); gap: 18px; }
  }

  .talents__item { margin: 0; }
  .talents__item[hidden] { display: none; }

  .talents__card {
    position: relative;
    display: block;
    overflow: hidden;
    background: var(--color-ph-bg-2, #15171b);
    border: 1px solid var(--color-ph-line, rgba(255, 255, 255, 0.12));
    transition: transform 0.35s cubic-bezier(.7, 0, .2, 1);
  }
  .talents__photo { position: relative; aspect-ratio: 3 / 4; }
  .talents__photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .talents__corner {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 22px;
    height: 22px;
    border-top: 1px solid var(--color-ph-gold, #d6b25e);
    border-right: 1px solid var(--color-ph-gold, #d6b25e);
    opacity: 0;
    transition: opacity 0.35s;
    pointer-events: none;
  }

  .talents__meta {
    position: absolute;
    inset: 0;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 4px;
    background: linear-gradient(
      to top,
      rgba(13, 15, 18, 0.95) 0%,
      rgba(13, 15, 18, 0.35) 45%,
      rgba(13, 15, 18, 0) 70%
    );
    pointer-events: none;
  }
  .talents__name {
    font-family: var(--font-display, 'Inter Tight', sans-serif);
    font-weight: 500;
    font-size: clamp(15px, 1.3vw, 18px);
    letter-spacing: -0.01em;
    line-height: 1.15;
    color: var(--color-ph-white, #ffffff);
    transition: color 0.3s;
  }
  .talents__club {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--color-ph-ink-soft, #b5b7bb);
    text-transform: uppercase;
  }

  .talents__underline {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 14px;
    height: 1px;
    background: var(--color-ph-gold, #d6b25e);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(.7, 0, .2, 1);
    pointer-events: none;
  }

  @media (hover: hover) and (pointer: fine) {
    .talents__card:hover { transform: translateY(-3px); }
    .talents__card:hover .talents__name { color: var(--color-ph-gold, #d6b25e); }
    .talents__card:hover .talents__corner { opacity: 1; }
    .talents__card:hover .talents__underline { transform: scaleX(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .talents__card,
    .talents__name,
    .talents__corner,
    .talents__underline { transition: none; }
    .talents__card:hover { transform: none; }
  }

  /* Empty filter state */
  .talents__empty {
    margin: clamp(40px, 6vw, 64px) 0 0;
    padding: 32px 24px;
    text-align: center;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 15px;
    line-height: 1.6;
    border: 1px dashed var(--color-ph-line, rgba(255, 255, 255, 0.12));
  }
  .talents__reset {
    margin-left: 12px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--color-ph-line-strong, rgba(255, 255, 255, 0.24));
    border-radius: 100px;
    color: var(--color-ph-white, #ffffff);
    font-family: var(--font-sans, 'Helvetica Neue', sans-serif);
    font-size: 12px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .talents__reset:hover {
    border-color: var(--color-ph-gold, #d6b25e);
    color: var(--color-ph-gold, #d6b25e);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>

<script>
  type SortMode = 'default' | 'az' | 'za';

  function normalize(s: string): string {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

  function initTalents(): void {
    const controls = document.querySelector<HTMLElement>('[data-talents-controls]');
    const grid = document.querySelector<HTMLUListElement>('[data-talents-grid]');
    const empty = document.querySelector<HTMLElement>('[data-talents-empty]');
    if (!controls || !grid || !empty) return;

    const search = controls.querySelector<HTMLInputElement>('[data-talents-search]');
    const clearBtn = controls.querySelector<HTMLButtonElement>('[data-talents-clear]');
    const sort = controls.querySelector<HTMLSelectElement>('[data-talents-sort]');
    const reset = empty.querySelector<HTMLButtonElement>('[data-talents-reset]');
    if (!search || !clearBtn || !sort || !reset) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-talent-card]'));

    function applySort(mode: SortMode): void {
      const sorted = [...cards].sort((a, b) => {
        if (mode === 'default') {
          return Number(a.dataset.index) - Number(b.dataset.index);
        }
        const cmp = (a.dataset.name ?? '').localeCompare(b.dataset.name ?? '', undefined, { sensitivity: 'base' });
        return mode === 'az' ? cmp : -cmp;
      });
      for (const card of sorted) grid.appendChild(card);
    }

    function applyFilter(query: string): void {
      const norm = normalize(query.trim());
      let visible = 0;
      for (const card of cards) {
        const name = card.dataset.name ?? '';
        const match = !norm || normalize(name).includes(norm);
        card.hidden = !match;
        if (match) visible++;
      }
      empty.hidden = visible > 0;
    }

    function syncClearBtn(): void {
      clearBtn.hidden = search!.value.length === 0;
    }

    search.addEventListener('input', () => {
      syncClearBtn();
      applyFilter(search.value);
    });

    clearBtn.addEventListener('click', () => {
      search.value = '';
      syncClearBtn();
      applyFilter('');
      search.focus();
    });

    sort.addEventListener('change', () => {
      const mode = sort.value as SortMode;
      applySort(mode === 'az' || mode === 'za' ? mode : 'default');
    });

    reset.addEventListener('click', () => {
      search.value = '';
      sort.value = 'default';
      syncClearBtn();
      applyFilter('');
      applySort('default');
      search.focus();
    });

    syncClearBtn();
  }

  document.addEventListener('astro:page-load', initTalents);
</script>
```

- [ ] **Step 2: Run astro check**

Run: `npx astro check`
Expected: no new errors introduced by this component. Pre-existing errors in out-of-scope files (Button, HomeInstagramSection) remain.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/TalentsSection.astro
git commit -m "feat(talents): add TalentsSection — hero + sticky controls + 2/3/5 grid"
```

---

## Task 4: Wire `/jugadores/` + `/en/players/` with TalentsSection

**Files:**
- Modify: `src/pages/jugadores/index.astro`
- Modify: `src/pages/en/players/index.astro`

Both pages become thin wrappers that build the `players` payload (players only, JSON insertion order) and pass it to `<TalentsSection>`.

- [ ] **Step 1: Rewrite `src/pages/jugadores/index.astro`**

Full contents:

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import TalentsSection from '@/components/sections/TalentsSection.astro';
import { useTranslations, type Lang } from '@/i18n/utils';
import { SITE_URL } from '@/lib/constants';
import { buildPlayerDetailPayloadsForLang, getAllRosterEntries } from '@/lib/playerDetail';

const lang: Lang = 'es';
const t = useTranslations(lang);

const rosterPlayers = getAllRosterEntries().filter((e) => e.role === 'player');
const payloads = await buildPlayerDetailPayloadsForLang(lang);
const players = rosterPlayers.map((e) => payloads[e.slug]).filter(Boolean);
---

<BaseLayout
  title={`${t('players.title')} — ${t('site.name')}`}
  description={t('site.description')}
  lang={lang}
  canonical={`${SITE_URL}/jugadores/`}
>
  <TalentsSection lang={lang} players={players} />
</BaseLayout>
```

- [ ] **Step 2: Rewrite `src/pages/en/players/index.astro`**

Full contents:

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import TalentsSection from '@/components/sections/TalentsSection.astro';
import { useTranslations, type Lang } from '@/i18n/utils';
import { SITE_URL } from '@/lib/constants';
import { buildPlayerDetailPayloadsForLang, getAllRosterEntries } from '@/lib/playerDetail';

const lang: Lang = 'en';
const t = useTranslations(lang);

const rosterPlayers = getAllRosterEntries().filter((e) => e.role === 'player');
const payloads = await buildPlayerDetailPayloadsForLang(lang);
const players = rosterPlayers.map((e) => payloads[e.slug]).filter(Boolean);
---

<BaseLayout
  title={`${t('players.title')} — ${t('site.name')}`}
  description={t('site.description')}
  lang={lang}
  canonical={`${SITE_URL}/en/players/`}
>
  <TalentsSection lang={lang} players={players} />
</BaseLayout>
```

- [ ] **Step 3: Run astro check**

Run: `npx astro check`
Expected: no new errors. (PlayersGrid errors remain until Task 5 deletes the file.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/jugadores/index.astro src/pages/en/players/index.astro
git commit -m "feat(talents): wire /jugadores and /en/players pages with TalentsSection"
```

---

## Task 5: Delete obsolete files

**Files:**
- Delete: `src/components/sections/PlayersGrid.astro`
- Delete: `src/components/ui/PlayersSortRow.astro`
- Delete: `src/components/ui/PlayersViewDropdown.astro`

- [ ] **Step 1: Confirm no lingering references**

Run:
```bash
rg -l "PlayersGrid|PlayersSortRow|PlayersViewDropdown" src
```
Expected output: only the three files about to be deleted. No other matches.

If any other file references these (e.g., an import you forgot to update), STOP and fix that file first.

- [ ] **Step 2: Delete the three files**

```bash
git rm src/components/sections/PlayersGrid.astro src/components/ui/PlayersSortRow.astro src/components/ui/PlayersViewDropdown.astro
```

- [ ] **Step 3: Run astro check**

Run: `npx astro check`
Expected: the pre-existing PlayersGrid TS errors (`window.setTimeout` return type, `section` null checks) are gone because the file no longer exists. Zero new errors.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(talents): remove obsolete PlayersGrid, PlayersSortRow, PlayersViewDropdown"
```

---

## Task 6: Verify build + smoke test

**Files:** none modified — verification only.

- [ ] **Step 1: Clean build**

Run: `npx astro build`
Expected: `242` pages built (or same count as main), no errors. Build completes in ~20s.

- [ ] **Step 2: Final type check**

Run: `npx astro check`
Expected: zero errors introduced by this phase. Document any remaining pre-existing errors (they should only be in `TeamSection.astro`, `Button.astro`, `HomeInstagramSection.astro`).

- [ ] **Step 3: Smoke test in browser (dev server at `http://localhost:4321/`)**

Verify each:
- `/jugadores/` renders hero + controls + grid of players (no coaches).
- Default order matches JSON: Juan Cruz → Pedro Lima → Dani Requena → rest.
- Sort "A-Z" reorders alphabetically; "Z-A" reverses; "Predeterminado" restores JSON order.
- Search box filters live as you type (accent-insensitive).
- Clear button (×) appears when search has text; clicking it restores all cards.
- Empty state appears when search has no matches; "Limpiar filtros" button restores everything.
- Cards are NOT clickable — hover shows corner + underline + lift; click does nothing.
- Controls bar sticks to viewport top as you scroll.
- `/en/players/` renders the same with English copy.
- Responsive: 2 columns mobile, 3 columns tablet (≥720px), 5 columns desktop (≥1200px).
- `/jugadores/<slug>/` detail pages still load via direct URL.

- [ ] **Step 4: Accessibility spot-check**

- Tab navigation reaches search input and sort select (skipping inert cards).
- Screen reader announces controls via labels; cards announce name + club via meta text.
- `prefers-reduced-motion` disables lift/underline transitions (test via DevTools rendering panel).

- [ ] **Step 5: No commit needed (verification-only)** — if any issue is found, fix it and commit the fix.

---

## Self-Review Notes

**Spec coverage:**
- ✅ New hero + controls + grid (Task 3)
- ✅ Search + sort only, no view switcher (Task 3 — no tabs component)
- ✅ 2→3→5 responsive grid (Task 3 — media queries at 720px and 1200px)
- ✅ Cards visual-only, hover-only (Task 3 — `<div>` not `<a>`, no data-slug click handler)
- ✅ Default order = JSON insertion order (Task 4 — `rosterPlayers` comes from `getAllRosterEntries()` which preserves `jugadoresData.map` order)
- ✅ A-Z and Z-A options (Task 3 — `<select>` with three modes)
- ✅ Home talents cards non-clickable (Task 2)
- ✅ Modal infrastructure preserved for TeamSection (PortraitCard/player-modal/buildModalPayloadsForLang untouched)
- ✅ /jugadores/<slug>/ detail pages preserved (not modified in any task)

**Type consistency:**
- `SortMode` defined in TalentsSection script as `'default' | 'az' | 'za'`; matches select option values.
- `PlayerDetailPayload` imported consistently; `subtitle` (club or "Sin club"), `name`, `photoSrc` used everywhere.
- i18n keys all prefixed `talents.*` in new code; `players.*` keys kept only where still referenced.

**Placeholder scan:** none — all code blocks complete.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-20-talents-redesign-v3.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
