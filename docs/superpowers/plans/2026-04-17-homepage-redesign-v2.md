# Homepage Redesign V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all home sections with editorial, premium layouts — replacing glass cards and static strips with kinetic typography, marquee, card-stack reveal, and Roman numeral layouts.

**Architecture:** Pure Astro component rewrites (no new files) using existing GSAP + ScrollTrigger setup. All animations follow the `astro:page-load` + `reducedMotion()` + `once: true` pattern already established. i18n keys already exist in es.ts/en.ts.

**Tech Stack:** Astro 5 SSG, GSAP 3 + ScrollTrigger, TypeScript i18n, CSS custom properties

---

## Conventions & shared context

**Working directory:** `C:\Users\mario\ph-sport-web`

**Design tokens (from `src/styles/global.css`):**

```css
--color-ph-black: #0d0f12
--color-ph-white: #ffffff
--color-ph-gold: #D6B25E
--color-ph-gold-muted: #a8893e
--color-ph-white-10: rgba(255,255,255,0.10)
--color-ph-white-60: rgba(255,255,255,0.60)
--color-ph-white-80: rgba(255,255,255,0.80)
--font-display: 'Sohne', 'Helvetica Neue', Helvetica, Arial, sans-serif
--font-body: 'Helvetica Neue', Helvetica, Arial, sans-serif
--radius-sm: 0.5rem
--radius-md: 1rem
--ease-ph: cubic-bezier(0.16, 1, 0.3, 1)
--ph-duration: 400ms
--ph-section-bg: transparent
--ph-glass-bg: rgba(255,255,255,0.04)
--ph-glass-backdrop: blur(16px) saturate(1.1)
--ph-glass-highlight: inset 0 1px 0 rgba(255,255,255,0.06)
--ph-section-px: clamp(1.5rem, 5vw, 6rem)
--ph-section-py: clamp(4rem, 8vw, 8rem)
--shadow-gold: 0 0 24px rgba(214,178,94,0.25)
```

All section backgrounds are transparent; the body background is `#0d0f12`.

**`.ph-section`** = `max-width: ~90rem; margin-inline: auto; padding-inline: var(--ph-section-px)`.

**`ph-divider`** = 1px gold gradient horizontal line; animated with GSAP `scaleX` from `transformOrigin: 'left center'`.

**Animation utilities** (`src/scripts/ph-text-animations.ts`):

```ts
export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function wrapWords(el: HTMLElement): HTMLElement[];   // wraps each word in .ph-clip > .ph-clip-inner
export function splitWords(el: HTMLElement): HTMLElement[];  // wraps each word in inline-block span
export function scrambleReveal(el: HTMLElement, delay?: number): void;
export function trackingReveal(el: HTMLElement, scrollTrigger?: ScrollTrigger.Vars): gsap.core.Tween;
export function counterReveal(el: HTMLElement, target: number, scrollTrigger?: ScrollTrigger.Vars): gsap.core.Tween;
```

**Standard GSAP script pattern (every section):**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const section = document.querySelector<HTMLElement>('[data-my-section]');
    if (!section || reducedMotion()) return;
    // animations here — always use gsap.set() before gsap.to(), never gsap.from() for opacity-0
  });
</script>
```

**CRITICAL ANIMATION RULE:** Never put `opacity: 0` in CSS on content elements. Always use `gsap.set(el, { opacity: 0 })` in the JS block so content is visible when JS is disabled. Use `gsap.to()` (not `gsap.from()`) after the set.

**Verification commands:**

```bash
cd C:/Users/mario/ph-sport-web && npx astro check
cd C:/Users/mario/ph-sport-web && npx astro build
```

No automated UI tests. Visual verification = `npm run dev` on port 4321. Pre-existing TS errors in `PlayersGrid.astro`, `TeamSection.astro`, `Button.astro` are known and unrelated.

---

## Task 1: Fix i18n placeholder content

**Files:**
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`

Replace the `home.about.body` placeholder in both locale files with production copy.

- [ ] Step 1: Update Spanish copy in `src/i18n/es.ts`

Replace the existing `home.about.body` string (currently `'En la página Sobre nosotros profundizamos en nuestros valores y en cómo trabajamos día a día contigo.'`) with:

```ts
    'home.about.body':
      'Somos el respaldo integral de tu carrera: negociamos contratos, gestionamos tu imagen y planificamos tu futuro financiero con la visión de quien lleva más de una década en el sector.',
```

- [ ] Step 2: Update English copy in `src/i18n/en.ts`

Replace the existing `home.about.body` string with:

```ts
    'home.about.body':
      'We are the full backbone of your career: we negotiate contracts, manage your image, and plan your financial future with the vision of a team that has been in the business for over a decade.',
```

- [ ] Step 3: Commit

```bash
git add src/i18n/es.ts src/i18n/en.ts
git commit -m "i18n(home): replace about.body placeholder with production copy"
```

---

## Task 2: Stats Strip → CSS Infinite Marquee

**Files:**
- Modify: `src/components/sections/HomeStatsStrip.astro`

Rewrite as a pure-CSS infinite horizontal marquee with two identical tracks for a seamless loop. Screen readers get a `sr-only` `<dl>`.

- [ ] Step 1: Replace the entire contents of `src/components/sections/HomeStatsStrip.astro`

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';
interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
---

<div class="stats-marquee" role="region" aria-label={t('home.stats.aria')} data-stats-strip>
  <div class="marquee-track" aria-hidden="true">
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.players.value')}</span>
      <span class="marquee-label">{t('home.stats.players.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.countries.value')}</span>
      <span class="marquee-label">{t('home.stats.countries.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.service.value')}</span>
      <span class="marquee-label">{t('home.stats.service.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item marquee-item--brand">
      <span class="marquee-value">PHSPORT</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.players.value')}</span>
      <span class="marquee-label">{t('home.stats.players.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.countries.value')}</span>
      <span class="marquee-label">{t('home.stats.countries.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.service.value')}</span>
      <span class="marquee-label">{t('home.stats.service.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item marquee-item--brand">
      <span class="marquee-value">PHSPORT</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
  </div>
  <div class="marquee-track" aria-hidden="true">
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.players.value')}</span>
      <span class="marquee-label">{t('home.stats.players.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.countries.value')}</span>
      <span class="marquee-label">{t('home.stats.countries.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.service.value')}</span>
      <span class="marquee-label">{t('home.stats.service.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item marquee-item--brand">
      <span class="marquee-value">PHSPORT</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.players.value')}</span>
      <span class="marquee-label">{t('home.stats.players.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.countries.value')}</span>
      <span class="marquee-label">{t('home.stats.countries.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item">
      <span class="marquee-value">{t('home.stats.service.value')}</span>
      <span class="marquee-label">{t('home.stats.service.label')}</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
    <span class="marquee-item marquee-item--brand">
      <span class="marquee-value">PHSPORT</span>
    </span>
    <span class="marquee-sep" aria-hidden="true">·</span>
  </div>
  <dl class="sr-only">
    <div><dt>{t('home.stats.players.label')}</dt><dd>{t('home.stats.players.value')}</dd></div>
    <div><dt>{t('home.stats.countries.label')}</dt><dd>{t('home.stats.countries.value')}</dd></div>
    <div><dt>{t('home.stats.service.label')}</dt><dd>{t('home.stats.service.value')}</dd></div>
  </dl>
</div>

<style>
  .stats-marquee {
    position: relative;
    border-top: 1px solid var(--color-ph-white-10);
    border-bottom: 1px solid var(--color-ph-white-10);
    padding-block: 1.5rem;
    background:
      radial-gradient(ellipse at 50% 100%, rgba(214, 178, 94, 0.05) 0%, transparent 60%),
      var(--ph-section-bg);
    overflow: hidden;
    display: flex;
  }

  .marquee-track {
    display: inline-flex;
    align-items: center;
    gap: 2rem;
    white-space: nowrap;
    animation: marquee-scroll 40s linear infinite;
    flex-shrink: 0;
    padding-inline: 1rem;
  }

  .stats-marquee:hover .marquee-track {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee-track { animation: none; }
  }

  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .marquee-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .marquee-value {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .marquee-item--brand .marquee-value {
    -webkit-text-stroke: 1px rgba(214, 178, 94, 0.5);
    color: transparent;
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    letter-spacing: 0.1em;
  }

  .marquee-label {
    font-family: var(--font-body);
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
  }

  .marquee-sep {
    color: rgba(214, 178, 94, 0.35);
    font-size: 1.5rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .sr-only {
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
```

Note: The marquee uses two identical tracks side by side. `@keyframes marquee-scroll` moves from `translateX(0)` to `translateX(-50%)` — at `-50%` the second track starts exactly where the first began, producing a seamless loop. `display: flex` on `.stats-marquee` places the two tracks next to each other. The `-50%` trick only works because the combined width is exactly 2× a single track.

- [ ] Step 2: Run astro check

Run: `cd C:/Users/mario/ph-sport-web && npx astro check`
Expected: 0 errors introduced by this task (pre-existing errors in `PlayersGrid.astro`, `TeamSection.astro`, `Button.astro` are known and unrelated).

- [ ] Step 3: Commit

```bash
git add src/components/sections/HomeStatsStrip.astro
git commit -m "feat(home): rewrite stats strip as CSS infinite marquee"
```

---

## Task 3: Players → Card Stack Reveal

**Files:**
- Modify: `src/components/sections/HomePlayersSection.astro`

Rewrite so all cards start stacked at center; GSAP fans them into place on scroll with a gold shimmer passing over each card as it lands.

- [ ] Step 1: Replace the entire contents of `src/components/sections/HomePlayersSection.astro`

```astro
---
import PortraitCard from '@/components/ui/PortraitCard.astro';
import Button from '@/components/ui/Button.astro';
import { formatNationalTeamAriaLabel } from '@/lib/countryLabels';
import type { PlayerDetailPayload } from '@/lib/playerDetail';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
  players: PlayerDetailPayload[];
}

const { lang, players } = Astro.props;
const t = useTranslations(lang);
const isEn = lang === 'en';
const listHref = isEn ? '/en/players/' : '/jugadores/';
const count = players.length;
---

<section id="jugadores" class="home-players-section" aria-labelledby="home-players-heading" data-home-players>
  <div class="ph-section">
    <div class="home-players-header" data-reveal-header>
      <h2 id="home-players-heading" class="home-players-eyebrow">{t('nav.players')}</h2>
      <span class="home-players-eyebrow-line" aria-hidden="true"></span>
    </div>

    {count === 0 ? (
      <p class="home-players-empty">{t('players.empty')}</p>
    ) : (
      <>
        <div class="players-stage" data-players-stage>
          {players.map((p, i) => (
            <div class="player-card-wrap" data-card-index={i}>
              <PortraitCard
                href={listHref}
                name={p.name}
                subtitle={p.subtitle}
                photoUrl={p.photoSrc}
                nationalTeamCodes={p.nationalTeamCodes}
                nationalTeamAriaLabel={formatNationalTeamAriaLabel(p.nationalTeamCodes, lang)}
              />
              <div class="card-shimmer" aria-hidden="true"></div>
            </div>
          ))}
        </div>
        <div class="home-section-cta" data-players-cta>
          <Button href={listHref} variant="primary">
            {t('home.players.cta')}
          </Button>
        </div>
      </>
    )}
  </div>
</section>

<style>
  .home-players-section {
    position: relative;
    background: var(--ph-section-bg);
    padding-block: 4rem 4.5rem;
    border-top: 1px solid var(--color-ph-white-10);
  }

  @media (min-width: 1024px) {
    .home-players-section { padding-block: 5rem 5.5rem; }
  }

  .home-players-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .home-players-eyebrow {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    white-space: nowrap;
    margin: 0;
  }

  .home-players-eyebrow-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(214, 178, 94, 0.4) 0%, transparent 100%);
  }

  /* ── Stage: the area where cards stack and fan ── */

  .players-stage {
    position: relative;
    /* Height is set by JS after measuring one card. Fallback: tall enough for stacked cards */
    min-height: 28rem;
    width: 100%;
  }

  .player-card-wrap {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(16rem, 75vw);
    /* z-index: first card on top */
  }

  .player-card-wrap[data-card-index="0"] { z-index: 3; }
  .player-card-wrap[data-card-index="1"] { z-index: 2; }
  .player-card-wrap[data-card-index="2"] { z-index: 1; }

  @media (min-width: 640px) {
    .player-card-wrap {
      width: min(20rem, 28vw);
    }
  }

  .card-shimmer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: var(--radius-md);
    background: linear-gradient(
      135deg,
      transparent 25%,
      rgba(214, 178, 94, 0.4) 50%,
      transparent 75%
    );
    background-size: 300% 300%;
    background-position: 200% 0%;
    opacity: 0;
    z-index: 10;
  }

  .home-players-empty {
    color: var(--color-ph-white-60);
    font-size: 1.0625rem;
  }

  .home-section-cta {
    margin-top: 3rem;
    display: flex;
    justify-content: center;
  }

  @media (min-width: 768px) {
    .home-section-cta { justify-content: flex-start; }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const section = document.querySelector<HTMLElement>('[data-home-players]');
    if (!section || reducedMotion()) return;

    const header = section.querySelector<HTMLElement>('[data-reveal-header]');
    if (header) {
      gsap.set(header, { opacity: 0, y: 16 });
      gsap.to(header, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power4.out',
        scrollTrigger: { trigger: header, start: 'top 85%', once: true },
      });
    }

    const stage = section.querySelector<HTMLElement>('[data-players-stage]');
    const cta   = section.querySelector<HTMLElement>('[data-players-cta]');

    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll<HTMLElement>('.player-card-wrap'));
    if (cards.length === 0) return;

    // Measure card dimensions after render
    const cardW = cards[0].offsetWidth;
    const cardH = cards[0].offsetHeight;

    // Set stage height so the section doesn't collapse
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      stage.style.minHeight = cardH * 2.5 + 'px';
    } else {
      stage.style.minHeight = cardH + 32 + 'px'; // +32 for the center card lift
    }

    // All cards start stacked at center (z-index already set via CSS attr selector)
    gsap.set(cards, { x: 0, y: 0, rotation: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: stage, start: 'top 72%', once: true },
    });

    if (isMobile) {
      // Fan vertically: cards slide down with overlap
      tl.to(cards[0], { y: 0,              duration: 1.0, ease: 'expo.out' }, 0)
        .to(cards[1], { y: cardH * 0.65,   duration: 1.0, ease: 'expo.out' }, 0.12)
        .to(cards[2], { y: cardH * 1.3,    duration: 1.0, ease: 'expo.out' }, 0.24);
    } else {
      // Fan horizontally: center card lifts, flanking cards spread
      tl.to(cards[0], { x: -(cardW + 24), rotation: -2, duration: 1.1, ease: 'expo.out' }, 0)
        .to(cards[1], { x: 0, y: -16,                   duration: 1.1, ease: 'expo.out' }, 0.12)
        .to(cards[2], { x:  (cardW + 24), rotation:  2, duration: 1.1, ease: 'expo.out' }, 0.24);
    }

    // Shimmer passes over each card as it lands
    cards.forEach((card, i) => {
      const shimmer = card.querySelector<HTMLElement>('.card-shimmer');
      if (!shimmer) return;
      tl.to(shimmer,
        {
          opacity: 0.9,
          backgroundPosition: '-50% 100%',
          duration: 0.45,
          ease: 'power2.out',
          onComplete: () => gsap.to(shimmer, { opacity: 0, duration: 0.3, delay: 0.05 }),
        },
        i * 0.12 + 0.75,
      );
    });

    if (cta) {
      gsap.set(cta, { opacity: 0, y: 20 });
      tl.to(cta, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.1);
    }
  });
</script>
```

- [ ] Step 2: Run astro check

Run: `cd C:/Users/mario/ph-sport-web && npx astro check`
Expected: 0 errors introduced by this task.

- [ ] Step 3: Commit

```bash
git add src/components/sections/HomePlayersSection.astro
git commit -m "feat(home): players section card-stack reveal with shimmer"
```

---

## Task 4: Manifesto → Fullscreen Typographic (fix opacity-0 bug)

**Files:**
- Modify: `src/components/sections/HomeManifestoSection.astro`

Key changes vs current:
1. Remove all `opacity: 0` from CSS — elements are visible without JS.
2. GSAP uses `gsap.set()` + `gsap.to()` instead of `gsap.from()`.
3. `min-height: 100dvh` (was 80vh).
4. Larger statement font: `clamp(2.5rem, 5.5vw, 4.5rem)`.
5. `PH` watermark via `::after` pseudo-element.
6. Stronger gold gradient background.

- [ ] Step 1: Replace the entire contents of `src/components/sections/HomeManifestoSection.astro`

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';
interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
---

<section
  class="manifesto-section"
  aria-labelledby="manifesto-statement"
  data-manifesto
>
  <div class="ph-section manifesto-inner">
    <div class="manifesto-lead" data-manifesto-lead>
      <p class="manifesto-eyebrow">{t('home.manifesto.eyebrow')}</p>
      <div class="ph-divider manifesto-divider"></div>
    </div>

    <p id="manifesto-statement" class="manifesto-statement" data-manifesto-statement>
      {t('home.manifesto.statement')}
    </p>

    <div
      class="manifesto-values"
      aria-label={t('home.manifesto.values.aria')}
      data-manifesto-values
    >
      <span class="manifesto-value">{t('home.manifesto.value1')}</span>
      <span class="manifesto-sep" aria-hidden="true">·</span>
      <span class="manifesto-value">{t('home.manifesto.value2')}</span>
      <span class="manifesto-sep" aria-hidden="true">·</span>
      <span class="manifesto-value">{t('home.manifesto.value3')}</span>
    </div>
  </div>
</section>

<style>
  .manifesto-section {
    position: relative;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    background:
      radial-gradient(ellipse at 0% 50%, rgba(214, 178, 94, 0.08) 0%, transparent 55%),
      radial-gradient(ellipse at 100% 50%, rgba(214, 178, 94, 0.04) 0%, transparent 50%),
      var(--ph-section-bg);
    border-top: 1px solid var(--color-ph-white-10);
    overflow: hidden;
    padding-block: 6rem;
  }

  /* Decorative "PH" watermark — right side, large outline */
  .manifesto-section::after {
    content: 'PH';
    position: absolute;
    right: -2rem;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--font-display);
    font-size: clamp(18rem, 32vw, 28rem);
    font-weight: 900;
    letter-spacing: -0.05em;
    line-height: 1;
    -webkit-text-stroke: 1px rgba(214, 178, 94, 0.05);
    color: transparent;
    user-select: none;
    pointer-events: none;
    z-index: 0;
  }

  .manifesto-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    max-width: 56rem;
  }

  .manifesto-lead {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* NO opacity:0 in CSS — JS sets it before animating */
  .manifesto-eyebrow {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    white-space: nowrap;
    margin: 0;
  }

  .manifesto-divider {
    flex: 1;
    max-width: 20rem;
  }

  /* NO opacity:0 in CSS */
  .manifesto-statement {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5.5vw, 4.5rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin: 0;
    max-width: 18ch;
  }

  /* NO opacity:0 in CSS */
  .manifesto-values {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .manifesto-value {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ph-white-60);
  }

  .manifesto-sep {
    color: rgba(214, 178, 94, 0.4);
    font-size: 0.875rem;
  }

  @media (min-width: 1024px) {
    .manifesto-section { padding-block: 8rem; }
  }

  /* Reduced motion: no watermark animation needed but keep it static */
  @media (prefers-reduced-motion: reduce) {
    .manifesto-section::after { display: none; }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const section = document.querySelector<HTMLElement>('[data-manifesto]');
    if (!section || reducedMotion()) return;

    const eyebrow   = section.querySelector<HTMLElement>('.manifesto-eyebrow');
    const divider   = section.querySelector<HTMLElement>('.manifesto-divider');
    const statement = section.querySelector<HTMLElement>('[data-manifesto-statement]');
    const values    = section.querySelector<HTMLElement>('[data-manifesto-values]');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 65%', once: true },
    });

    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 8 });
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0);
    }

    if (divider) {
      gsap.set(divider, { scaleX: 0 });
      tl.to(divider, { scaleX: 1, transformOrigin: 'left center', duration: 0.7, ease: 'expo.out' }, 0.1);
    }

    if (statement) {
      const words = wrapWords(statement);
      gsap.set(words, { yPercent: 115 });
      tl.to(words, { yPercent: 0, duration: 0.95, stagger: 0.04, ease: 'power4.out' }, 0.3);
    }

    if (values) {
      gsap.set(values, { opacity: 0, y: 12 });
      tl.to(values, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.9);
    }
  });
</script>
```

- [ ] Step 2: Run astro check

Run: `cd C:/Users/mario/ph-sport-web && npx astro check`
Expected: 0 errors introduced by this task.

- [ ] Step 3: Commit

```bash
git add src/components/sections/HomeManifestoSection.astro
git commit -m "feat(home): fullscreen typographic manifesto with PH watermark"
```

---

## Task 5: Services → Ghost Number Hover + Scroll Progress Bar

**Files:**
- Modify: `src/components/sections/HomeServicesSection.astro`

Two additions to the numbered list: (a) a top progress bar that fills on scroll, and (b) a large ghost numeral per `<li>` that fades in on hover. Keep `SectionHeader` usage.

- [ ] Step 1: Replace the entire contents of `src/components/sections/HomeServicesSection.astro`

```astro
---
import SectionHeader from '@/components/ui/SectionHeader.astro';
import Button from '@/components/ui/Button.astro';
import { getServicesItems } from '@/lib/servicesItems';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const isEn = lang === 'en';
const items = getServicesItems(lang);
const servicesHref = isEn ? '/en/services' : '/servicios';
---

<section
  id="servicios"
  class="home-services-section"
  aria-labelledby="home-services-heading"
  data-home-services
>
  <div class="services-progress" aria-hidden="true">
    <div class="services-progress-bar" data-services-bar></div>
  </div>

  <div class="ph-section">
    <SectionHeader
      label={t('nav.services')}
      title={t('home.services.title')}
      subtitle={t('home.services.subtitle')}
      id="home-services-heading"
      tag="h2"
      noBorder
    />

    <ol class="services-list" aria-label={t('nav.services')}>
      {
        items.map((item, i) => (
          <li class="services-list-item" data-service-item>
            <span class="services-list-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span class="services-list-num-ghost" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div class="services-list-body">
              <h3 class="services-list-title">{item.title}</h3>
              <p class="services-list-short">{item.short}</p>
            </div>
          </li>
        ))
      }
    </ol>

    <div class="home-section-cta">
      <Button href={servicesHref} variant="secondary">
        {t('home.services.cta')}
      </Button>
    </div>
  </div>
</section>

<style>
  .home-services-section {
    position: relative;
    padding-block: 4rem 4.5rem;
    background:
      radial-gradient(ellipse at 80% 30%, rgba(214, 178, 94, 0.04) 0%, transparent 50%),
      var(--ph-section-bg);
    border-top: 1px solid var(--color-ph-white-10);
  }

  @media (min-width: 1024px) {
    .home-services-section { padding-block: 5rem 5.5rem; }
  }

  /* ── Progress bar ── */
  .services-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--color-ph-white-10);
    overflow: hidden;
    z-index: 1;
  }

  .services-progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--color-ph-gold-muted), var(--color-ph-gold));
  }

  /* ── Lista editorial ── */
  .services-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .services-list-item {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 2rem;
    padding-block: 1.75rem;
    border-bottom: 1px solid var(--color-ph-white-10);
    overflow: hidden;
    transition: border-color var(--ph-duration) var(--ease-ph);
  }

  .services-list-item:first-child {
    border-top: 1px solid var(--color-ph-white-10);
  }

  .services-list-item:hover {
    border-bottom-color: rgba(214, 178, 94, 0.3);
  }

  .services-list-num {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: rgba(214, 178, 94, 0.18);
    letter-spacing: -0.04em;
    line-height: 1;
    flex-shrink: 0;
    width: 3.5rem;
    text-align: right;
    transition: color var(--ph-duration) var(--ease-ph);
    user-select: none;
    position: relative;
    z-index: 1;
  }

  .services-list-item:hover .services-list-num {
    color: rgba(214, 178, 94, 0.45);
  }

  /* Ghost number: large, absolute, behind the content */
  .services-list-num-ghost {
    position: absolute;
    right: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--font-display);
    font-size: clamp(5rem, 10vw, 9rem);
    font-weight: 900;
    color: rgba(214, 178, 94, 0);
    letter-spacing: -0.05em;
    line-height: 1;
    user-select: none;
    pointer-events: none;
    z-index: 0;
  }

  .services-list-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
    z-index: 1;
  }

  @media (min-width: 768px) {
    .services-list-body {
      flex-direction: row;
      align-items: baseline;
      gap: 2rem;
    }
  }

  .services-list-title {
    font-family: var(--font-display);
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    font-weight: 700;
    color: var(--color-ph-white);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0;
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    .services-list-title { min-width: 16rem; }
  }

  .services-list-short {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-ph-white-60);
  }

  .home-section-cta {
    margin-top: 2.5rem;
    display: flex;
    justify-content: flex-start;
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const section = document.getElementById('servicios');
    if (!section || reducedMotion()) return;

    // Progress bar fills as section scrolls through viewport
    const bar = section.querySelector<HTMLElement>('[data-services-bar]');
    if (bar) {
      gsap.to(bar, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.5,
        },
      });
    }

    // Stagger reveal items
    const items = section.querySelectorAll<HTMLElement>('[data-service-item]');
    gsap.set(items, { opacity: 0, x: -20 });
    gsap.to(items, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power4.out',
      scrollTrigger: { trigger: section, start: 'top 75%', once: true },
    });

    // Ghost number hover per item
    items.forEach((item) => {
      const ghost = item.querySelector<HTMLElement>('.services-list-num-ghost');
      if (!ghost) return;
      item.addEventListener('mouseenter', () => {
        gsap.to(ghost, { color: 'rgba(214,178,94,0.10)', duration: 0.4, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(ghost, { color: 'rgba(214,178,94,0)', duration: 0.3, ease: 'power2.in' });
      });
    });
  });
</script>
```

- [ ] Step 2: Run astro check

Run: `cd C:/Users/mario/ph-sport-web && npx astro check`
Expected: 0 errors introduced by this task.

- [ ] Step 3: Commit

```bash
git add src/components/sections/HomeServicesSection.astro
git commit -m "feat(home): services ghost numerals and scroll progress bar"
```

---

## Task 6: 360° Section → Roman Numeral Editorial List

**Files:**
- Modify: `src/components/sections/Home360Section.astro`

Replace the 5 glass cards with a full-width three-column editorial list using Roman numerals (no glassmorphism).

- [ ] Step 1: Replace the entire contents of `src/components/sections/Home360Section.astro`

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';
interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);

const pillars = [
  { roman: 'I',   title: t('home.360.pillar1.title'), body: t('home.360.pillar1.body') },
  { roman: 'II',  title: t('home.360.pillar2.title'), body: t('home.360.pillar2.body') },
  { roman: 'III', title: t('home.360.pillar3.title'), body: t('home.360.pillar3.body') },
  { roman: 'IV',  title: t('home.360.pillar4.title'), body: t('home.360.pillar4.body') },
  { roman: 'V',   title: t('home.360.pillar5.title'), body: t('home.360.pillar5.body') },
];
---

<section
  id="acompanamiento-360"
  class="home-360-section"
  aria-labelledby="home-360-heading"
  data-home-360
>
  <div class="ph-section">
    <div class="home-360-header" data-360-header>
      <div class="home-360-eyebrow-row">
        <p class="home-360-eyebrow">{t('home.360.label')}</p>
        <span class="home-360-eyebrow-line" aria-hidden="true"></span>
      </div>
      <h2 id="home-360-heading" class="home-360-title">{t('home.360.title')}</h2>
      <p class="home-360-subtitle">{t('home.360.subtitle')}</p>
    </div>

    <ul class="pillars-list" aria-label={t('home.360.aria')}>
      {pillars.map((p) => (
        <li class="pillar-row" data-360-pillar>
          <span class="pillar-numeral" aria-hidden="true">{p.roman}</span>
          <h3 class="pillar-title">{p.title}</h3>
          <p class="pillar-body">{p.body}</p>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .home-360-section {
    position: relative;
    padding-block: 4rem 4.5rem;
    background:
      radial-gradient(ellipse at 20% 80%, rgba(214, 178, 94, 0.05) 0%, transparent 50%),
      var(--ph-section-bg);
    border-top: 1px solid var(--color-ph-white-10);
  }

  @media (min-width: 1024px) {
    .home-360-section { padding-block: 5rem 5.5rem; }
  }

  /* ── Header ── */
  .home-360-header {
    margin-bottom: 3rem;
    max-width: 40rem;
  }

  .home-360-eyebrow-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .home-360-eyebrow {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    white-space: nowrap;
    margin: 0;
  }

  .home-360-eyebrow-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(214, 178, 94, 0.4) 0%, transparent 100%);
    max-width: 12rem;
  }

  .home-360-title {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.025em;
    line-height: 1.15;
    margin: 0 0 0.75rem;
  }

  .home-360-subtitle {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--color-ph-white-60);
  }

  /* ── Roman numeral list ── */
  .pillars-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pillar-row {
    display: grid;
    grid-template-columns: 3rem 1fr;
    grid-template-areas:
      "num title"
      "num body";
    column-gap: 1.5rem;
    row-gap: 0.5rem;
    padding-block: 1.75rem;
    border-bottom: 1px solid var(--color-ph-white-10);
    align-items: start;
    transition: border-color var(--ph-duration) var(--ease-ph);
  }

  .pillar-row:first-child {
    border-top: 1px solid var(--color-ph-white-10);
  }

  .pillar-row:hover {
    border-bottom-color: rgba(214, 178, 94, 0.25);
  }

  @media (min-width: 768px) {
    .pillar-row {
      grid-template-columns: 4rem 18rem 1fr;
      grid-template-areas: "num title body";
      column-gap: 2.5rem;
      align-items: baseline;
    }
  }

  .pillar-numeral {
    grid-area: num;
    font-family: var(--font-display);
    font-size: clamp(0.875rem, 1.5vw, 1.125rem);
    font-weight: 700;
    color: rgba(214, 178, 94, 0.45);
    letter-spacing: 0.05em;
    line-height: 1.6;
    align-self: start;
  }

  @media (min-width: 768px) {
    .pillar-numeral { align-self: baseline; }
  }

  .pillar-title {
    grid-area: title;
    font-family: var(--font-display);
    font-size: clamp(1rem, 1.75vw, 1.2rem);
    font-weight: 700;
    color: var(--color-ph-white);
    letter-spacing: -0.01em;
    line-height: 1.3;
    margin: 0;
  }

  .pillar-body {
    grid-area: body;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-ph-white-60);
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const section = document.querySelector<HTMLElement>('[data-home-360]');
    if (!section || reducedMotion()) return;

    const header = section.querySelector<HTMLElement>('[data-360-header]');
    if (header) {
      gsap.set(header, { opacity: 0, y: 16 });
      gsap.to(header, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power4.out',
        scrollTrigger: { trigger: header, start: 'top 85%', once: true },
      });
    }

    const pillars = section.querySelectorAll<HTMLElement>('[data-360-pillar]');
    if (pillars.length) {
      gsap.set(pillars, { opacity: 0, x: -24 });
      gsap.to(pillars, {
        opacity: 1,
        x: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      });
    }
  });
</script>
```

- [ ] Step 2: Run astro check

Run: `cd C:/Users/mario/ph-sport-web && npx astro check`
Expected: 0 errors introduced by this task.

- [ ] Step 3: Commit

```bash
git add src/components/sections/Home360Section.astro
git commit -m "feat(home): rewrite 360 section as Roman numeral editorial list"
```

---

## Task 7: About Section → Decorative Vertical Watermark

**Files:**
- Modify: `src/components/sections/HomeAboutSection.astro`

Add a vertical `PHSPORT` outline watermark behind the split grid. Keep existing content and animations.

- [ ] Step 1: Replace the entire contents of `src/components/sections/HomeAboutSection.astro`

```astro
---
import Button from '@/components/ui/Button.astro';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props { lang: Lang; }
const { lang } = Astro.props;
const t = useTranslations(lang);
const isEn = lang === 'en';
const aboutHref = isEn ? '/en/about' : '/sobre-nosotros';
---

<section
  id="sobre-nosotros"
  class="home-about-section"
  aria-labelledby="home-about-heading"
  data-home-about
>
  <span class="about-watermark" aria-hidden="true">PHSPORT</span>

  <div class="ph-section home-about-grid">
    <div class="home-about-left" data-about-left>
      <p class="home-about-eyebrow">{t('nav.about')}</p>
      <div class="ph-divider home-about-divider"></div>
      <h2 id="home-about-heading" class="home-about-statement">
        {t('home.about.statement')}
      </h2>
    </div>

    <div class="home-about-right" data-about-right>
      <p class="home-about-body">{t('home.about.body')}</p>
      <div class="home-about-cta">
        <Button href={aboutHref} variant="secondary">
          {t('home.about.cta')}
        </Button>
      </div>
    </div>
  </div>
</section>

<style>
  .home-about-section {
    position: relative;
    padding-block: 4rem 4.5rem;
    background: var(--ph-section-bg);
    border-top: 1px solid var(--color-ph-white-10);
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    .home-about-section { padding-block: 6rem 7rem; }
  }

  /* ── Decorative watermark ── */
  .about-watermark {
    position: absolute;
    left: -1rem;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-family: var(--font-display);
    font-size: clamp(5rem, 10vw, 9rem);
    font-weight: 900;
    letter-spacing: 0.08em;
    -webkit-text-stroke: 1px rgba(214, 178, 94, 0.1);
    color: transparent;
    user-select: none;
    pointer-events: none;
    line-height: 1;
    white-space: nowrap;
    z-index: 0;
  }

  @media (max-width: 767px) {
    .about-watermark { display: none; }
  }

  /* ── Split grid ── */
  .home-about-grid {
    display: grid;
    gap: 3rem;
    grid-template-columns: 1fr;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  @media (min-width: 768px) {
    .home-about-grid {
      grid-template-columns: 3fr 2fr;
      gap: 4rem;
    }
  }

  @media (min-width: 1024px) {
    .home-about-grid {
      grid-template-columns: 3fr 2fr;
      gap: 6rem;
    }
  }

  /* ── Left ── */
  .home-about-left {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .home-about-eyebrow {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    margin: 0;
  }

  .home-about-divider { max-width: 10rem; }

  .home-about-statement {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0;
  }

  /* ── Right ── */
  .home-about-right {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .home-about-body {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.65;
    color: var(--color-ph-white-60);
  }

  .home-about-cta { display: flex; justify-content: flex-start; }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const section = document.querySelector<HTMLElement>('[data-home-about]');
    if (!section || reducedMotion()) return;

    const left  = section.querySelector<HTMLElement>('[data-about-left]');
    const right = section.querySelector<HTMLElement>('[data-about-right]');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 75%', once: true },
    });

    if (left) {
      const statement = left.querySelector<HTMLElement>('.home-about-statement');
      if (statement) {
        const words = wrapWords(statement);
        gsap.set(words, { yPercent: 115 });
        tl.to(words, { yPercent: 0, duration: 0.85, stagger: 0.05, ease: 'power4.out' }, 0);
      }
      const eyebrow = left.querySelector<HTMLElement>('.home-about-eyebrow');
      const divider = left.querySelector<HTMLElement>('.home-about-divider');
      if (eyebrow) {
        gsap.set(eyebrow, { opacity: 0, y: 8 });
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0);
      }
      if (divider) {
        gsap.set(divider, { scaleX: 0 });
        tl.to(divider, { scaleX: 1, transformOrigin: 'left center', duration: 0.6, ease: 'expo.out' }, 0.1);
      }
    }

    if (right) {
      gsap.set(right, { opacity: 0, y: 20 });
      tl.to(right, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.25);
    }
  });
</script>
```

- [ ] Step 2: Run astro check

Run: `cd C:/Users/mario/ph-sport-web && npx astro check`
Expected: 0 errors introduced by this task.

- [ ] Step 3: Commit

```bash
git add src/components/sections/HomeAboutSection.astro
git commit -m "feat(home): about section vertical PHSPORT watermark"
```

---

## Final Verification

- [ ] Run `cd C:/Users/mario/ph-sport-web && npm run dev` and open http://localhost:4321
- [ ] Verify each section in order: marquee scrolls, cards fan out, manifesto is fullscreen, services has ghost hover, 360° shows Roman numerals, about has watermark
- [ ] Check mobile (<640px): marquee still plays, cards fan vertically
- [ ] Run `cd C:/Users/mario/ph-sport-web && npx astro build` — must succeed
