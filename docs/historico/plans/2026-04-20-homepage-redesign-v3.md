# Homepage Redesign V3 — Phase 1 (Home) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Home (`/` and `/en/`) with the Claude Design layout — new hero claim, 3-card talents mini-grid, 6-pilar services accordion, editorial about block with 3 stats + values, and a visual contact stub — while preserving the LogoReveal entry animation, the hero video, the roster data pipeline, and the existing navbar/footer contracts.

**Architecture:** Astro 5 SSG, scoped component styles, CSS-only interactions (no GSAP for hero content — LogoReveal GSAP is untouched). Reuse design tokens from `src/styles/global.css` (`--color-ph-black`, `--color-ph-gold: #d6b25e`, etc.). i18n through parallel `src/i18n/es.ts` + `src/i18n/en.ts` flat keys. Each Home section is a self-contained `.astro` component with its own `<style>` block.

**Tech Stack:** Astro 5, TypeScript, React islands (LogoReveal only), GSAP (LogoReveal only), CSS custom properties, flat i18n dict.

**Scope boundaries:**
- IN: Home hero, home talents mini-grid, home services accordion, home about block, home contact stub, wiring in `pages/index.astro` + `pages/en/index.astro`, i18n for all the above, removal of obsolete Home sections.
- OUT (future phases): Services page, About page + /equipo/ fusion, Talents page 5-col grid, footer restyle, Orbit3D removal.

**Preservation invariants:**
- `LogoReveal.tsx` untouched (island GSAP entry animation).
- `REVEAL_CHROME_CLASS`, `ph:logo-revealed` event, `sessionStorage['ph-logo-revealed']` orchestration intact.
- Hero content must be visible by default (no GSAP fade-in). LogoReveal overlays on top; when it dismisses, hero shows.
- Header/Footer components untouched in Phase 1 (footer restyle is Phase 5).
- Player data pipeline (`buildPlayerDetailPayloadsForLang`, `getAllRosterEntries`) untouched.

---

## File Structure

**Create:**
- `src/components/sections/HomeContactSection.astro` — 2-column visual stub: left eyebrow + headline + copy + email, right form fields (name / email / role / message + submit). No backend, CSS-only.

**Modify:**
- `src/i18n/es.ts` — remove obsolete keys, add new hero/players/services/about/contact keys.
- `src/i18n/en.ts` — mirror es.ts with drafted EN translations.
- `src/lib/servicesItems.ts` — replace 5 items with 6 pilares (press, performance, media, familyOffice, psychology, actionPlan). Expand icon union if needed (reuse existing icons for Phase 1).
- `src/components/sections/HeroSection.astro` (home variant only) — elevate tagline to big claim with italic gold accent, remove home-variant GSAP, add vertical bottom-right scroll cue, ensure `min-height: 100svh` on mobile.
- `src/components/sections/HomePlayersSection.astro` — rewrite layout: 3 cards desktop / 2 visible on mobile (3rd hidden via CSS), 3:4 portrait + bottom gradient overlay + corner bracket on hover, numeric index (01/02/03), roster name + club.
- `src/components/sections/HomeServicesSection.astro` — rewrite as CSS accordion (6 rows, numbers 01–06, click to expand body via `.open` class + max-height transition).
- `src/components/sections/HomeAboutSection.astro` — rewrite: centered editorial block, 3 stats row (21 INTEGRANTES · 6 PAÍSES · ACOMPAÑAMIENTO 360º), values line (EXCELENCIA · CERCANÍA · RIGOR), CTA to `/sobre-nosotros/`.
- `src/pages/index.astro` — remove `HomeStatsStrip`, `HomeManifestoSection`, `Home360Section` imports and usage; add `HomeContactSection`.
- `src/pages/en/index.astro` — same as above (EN mirror).

**Delete:**
- `src/components/sections/HomeStatsStrip.astro`
- `src/components/sections/HomeManifestoSection.astro`
- `src/components/sections/Home360Section.astro`

**Untouched (Phase 1):** `HeroSection` (non-home variants), `Header.astro`, `Footer.astro`, `LogoReveal.tsx`, `PlayersGrid.astro`, `PortraitCard.astro`, `ServicesOrbit3D.astro`, `TeamSection.astro`, `AboutSection.astro`, `player-modal.css`, `instagramHomeFeed.ts`, `HomeInstagramSection.astro` (already unimported — leave as-is for Phase 5 cleanup).

---

## Conventions

- **Commits:** conventional commits in Spanish or English, short scope `home` or `i18n`. One commit per task.
- **Verification per task:** `npx astro check` must pass (no new TS errors). After all tasks: `npx astro build` + manual `npm run dev` smoke test.
- **Style:** CSS scoped in each `.astro`. Use design tokens, not hardcoded hex. Use `clamp()` for fluid typography. Import fonts only if not already loaded globally (Inter Tight is already in `global.css`).
- **Accessibility:** `<details>`/`<summary>` or button+aria-expanded for accordion. Scroll cue has `aria-hidden="true"`. Stats row `aria-label`. Form fields have labels (visually hidden if needed).

---

## Task 1: Update i18n (es.ts + en.ts)

**Files:**
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: Remove obsolete Home keys from `src/i18n/es.ts`**

Delete these blocks (between lines ~45–76 in current file):

```ts
// --- Home: Stats Strip ---  (entire block, keys: home.stats.*)
// --- Home: Manifesto ---    (entire block, keys: home.manifesto.*)
// --- Home: 360° ---         (entire block, keys: home.360.*)
```

Also delete these individual Home keys (content moves or is replaced):
- `home.services.title`, `home.services.subtitle`, `home.services.cta`
- `home.about.title`, `home.about.subtitle`, `home.about.lead`, `home.about.body`, `home.about.cta`, `home.about.statement`
- `home.instagram.title`, `home.instagram.postAria` (HomeInstagramSection is unimported; remove keys)
- `hero.cta.primary`, `hero.cta.secondary` (home hero no longer has CTAs per new design — scroll cue only)

Keep: `home.players.cta`, `hero.claim`, `hero.tagline`.

- [ ] **Step 2: Add new keys to `src/i18n/es.ts`**

Add in logical order (after existing `hero.*` block):

```ts
  // --- Hero (redesign V3) ---
  'hero.claim.lead': 'Now. Next.',
  'hero.claim.accent': 'Forever Football.',
  'hero.scroll.label': 'Scroll',

  // --- Home: Talentos (mini-sección) ---
  'home.players.eyebrow': '02 · Talentos',
  'home.players.title': 'El roster.',
  'home.players.titleAccent': 'roster',
  'home.players.lead': 'Futbolistas profesionales con proyección internacional. Cada carrera, un proyecto distinto.',

  // --- Home: Servicios (acordeón) ---
  'home.services.eyebrow': '03 · Servicios',
  'home.services.title': 'Representamos con propósito.',
  'home.services.lead': 'Seis pilares que sostienen la carrera del jugador. Explora cada área.',
  'home.services.cta': 'Ver todos los servicios',

  // --- Home: Sobre nosotros (bloque editorial) ---
  'home.about.eyebrow': '04 · Sobre PHSPORT',
  'home.about.title': 'Las marcas suman,',
  'home.about.titleAccent': 'pero las personas marcan.',
  'home.about.body': 'Somos una agencia de representación especializada en fútbol. Gestionamos presente, futuro y legado de cada jugador con cercanía, rigor y excelencia.',
  'home.about.cta': 'Conócenos',
  'home.about.stats.aria': 'Cifras PHSPORT',
  'home.about.stats.team.value': '21',
  'home.about.stats.team.label': 'Integrantes',
  'home.about.stats.countries.value': '6',
  'home.about.stats.countries.label': 'Países',
  'home.about.stats.service.value': '360º',
  'home.about.stats.service.label': 'Acompañamiento',
  'home.about.values.aria': 'Valores PHSPORT',
  'home.about.values.v1': 'Excelencia',
  'home.about.values.v2': 'Cercanía',
  'home.about.values.v3': 'Rigor',

  // --- Home: Contacto ---
  'home.contact.eyebrow': '05 · Contacto',
  'home.contact.title': 'Hablemos.',
  'home.contact.lead': 'Si representas a un jugador, a un club o a una marca, escríbenos. Respondemos en menos de 48 horas.',
  'home.contact.email': 'info@phsport.es',
  'home.contact.emailLabel': 'Email directo',
  'home.contact.form.name': 'Nombre',
  'home.contact.form.email': 'Email',
  'home.contact.form.role': 'Rol',
  'home.contact.form.role.player': 'Jugador',
  'home.contact.form.role.club': 'Club',
  'home.contact.form.role.brand': 'Marca / Patrocinador',
  'home.contact.form.role.other': 'Otro',
  'home.contact.form.message': 'Mensaje',
  'home.contact.form.submit': 'Enviar',
```

Also update:

```ts
  'footer.email': 'info@phsport.es',
```

- [ ] **Step 3: Mirror changes in `src/i18n/en.ts`**

Apply the same removals. Then add EN translations:

```ts
  // --- Hero (redesign V3) ---
  'hero.claim.lead': 'Now. Next.',
  'hero.claim.accent': 'Forever Football.',
  'hero.scroll.label': 'Scroll',

  // --- Home: Talents (mini section) ---
  'home.players.eyebrow': '02 · Talent',
  'home.players.title': 'The roster.',
  'home.players.titleAccent': 'roster',
  'home.players.lead': 'Professional footballers with international projection. Each career, its own project.',

  // --- Home: Services (accordion) ---
  'home.services.eyebrow': '03 · Services',
  'home.services.title': 'Representation with purpose.',
  'home.services.lead': 'Six pillars behind every player\u2019s career. Explore each area.',
  'home.services.cta': 'See all services',

  // --- Home: About (editorial block) ---
  'home.about.eyebrow': '04 · About PHSPORT',
  'home.about.title': 'Brands add up,',
  'home.about.titleAccent': 'but people make the difference.',
  'home.about.body': 'We are a football-only representation agency. We manage the present, future and legacy of every player with closeness, rigour and excellence.',
  'home.about.cta': 'Get to know us',
  'home.about.stats.aria': 'PHSPORT figures',
  'home.about.stats.team.value': '21',
  'home.about.stats.team.label': 'Team members',
  'home.about.stats.countries.value': '6',
  'home.about.stats.countries.label': 'Countries',
  'home.about.stats.service.value': '360º',
  'home.about.stats.service.label': 'Support',
  'home.about.values.aria': 'PHSPORT values',
  'home.about.values.v1': 'Excellence',
  'home.about.values.v2': 'Closeness',
  'home.about.values.v3': 'Rigour',

  // --- Home: Contact ---
  'home.contact.eyebrow': '05 · Contact',
  'home.contact.title': 'Let\u2019s talk.',
  'home.contact.lead': 'Whether you represent a player, a club, or a brand, drop us a line. We reply within 48 hours.',
  'home.contact.email': 'info@phsport.es',
  'home.contact.emailLabel': 'Direct email',
  'home.contact.form.name': 'Name',
  'home.contact.form.email': 'Email',
  'home.contact.form.role': 'Role',
  'home.contact.form.role.player': 'Player',
  'home.contact.form.role.club': 'Club',
  'home.contact.form.role.brand': 'Brand / Sponsor',
  'home.contact.form.role.other': 'Other',
  'home.contact.form.message': 'Message',
  'home.contact.form.submit': 'Send',
```

Also update:

```ts
  'footer.email': 'info@phsport.es',
```

- [ ] **Step 4: Verify**

Run: `npx astro check`
Expected: no new errors about missing translation keys. (Existing unrelated warnings OK.)

If `useTranslations` is strict-typed from `es.ts`, the deleted keys will produce errors only in components that still reference them — those components get deleted/rewritten in later tasks, so this task may need to be committed together with Task 8/9. If errors appear here, skip to Task 8/9 before committing, then come back and verify.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/es.ts src/i18n/en.ts
git commit -m "i18n(home): refresh keys for V3 redesign (hero claim, talents, services, about, contact)"
```

---

## Task 2: Update `servicesItems.ts` with 6 pilares

**Files:**
- Modify: `src/lib/servicesItems.ts`

Context: the new 6 pilares are Prensa, Rendimiento, Media, Family Office, Psicólogo, Plan de Acción. For Phase 1, reuse existing icon union (`'users' | 'route' | 'scale' | 'megaphone' | 'globe'`). Map: Prensa → `megaphone`, Rendimiento → `route`, Media → `globe`, Family Office → `scale`, Psicólogo → `users`, Plan de Acción → `route`. If the duplicate icon bothers, add `'target'` or `'chart'` to the union in Phase 2.

- [ ] **Step 1: Read current `src/lib/servicesItems.ts`** to confirm shape.

- [ ] **Step 2: Replace items array**

```ts
import type { TranslationKey } from '@/i18n/es';

export type ServiceItem = {
  icon: 'users' | 'route' | 'scale' | 'megaphone' | 'globe';
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  shortKey: TranslationKey;
};

export const servicesItems: ServiceItem[] = [
  { icon: 'megaphone', titleKey: 'services.items.press.title',        bodyKey: 'services.items.press.body',        shortKey: 'services.items.press.short' },
  { icon: 'route',     titleKey: 'services.items.performance.title',  bodyKey: 'services.items.performance.body',  shortKey: 'services.items.performance.short' },
  { icon: 'globe',     titleKey: 'services.items.media.title',        bodyKey: 'services.items.media.body',        shortKey: 'services.items.media.short' },
  { icon: 'scale',     titleKey: 'services.items.familyOffice.title', bodyKey: 'services.items.familyOffice.body', shortKey: 'services.items.familyOffice.short' },
  { icon: 'users',     titleKey: 'services.items.psychology.title',   bodyKey: 'services.items.psychology.body',   shortKey: 'services.items.psychology.short' },
  { icon: 'route',     titleKey: 'services.items.actionPlan.title',   bodyKey: 'services.items.actionPlan.body',   shortKey: 'services.items.actionPlan.short' },
];
```

(If the current file uses literal strings instead of keys, mirror whatever pattern exists — but the above is the canonical shape; adapt at implementation time.)

- [ ] **Step 3: Add service item i18n keys**

In `src/i18n/es.ts` — replace existing `services.items.*` block with:

```ts
  'services.items.press.title': 'Prensa',
  'services.items.press.body': 'Imagen pública, relación con medios y posicionamiento estratégico del jugador en cada etapa.',
  'services.items.press.short': 'Imagen, medios y posicionamiento',

  'services.items.performance.title': 'Rendimiento',
  'services.items.performance.body': 'Análisis físico, seguimiento continuo y optimización del rendimiento deportivo.',
  'services.items.performance.short': 'Análisis y optimización física',

  'services.items.media.title': 'Media',
  'services.items.media.body': 'Estrategia digital, creación de contenido y gestión de redes sociales para construir la marca personal.',
  'services.items.media.short': 'Contenido, redes y marca personal',

  'services.items.familyOffice.title': 'Family Office',
  'services.items.familyOffice.body': 'Gestión patrimonial, planificación fiscal y estructura financiera para el jugador y su familia.',
  'services.items.familyOffice.short': 'Patrimonio, fiscalidad y estructura',

  'services.items.psychology.title': 'Psicólogo',
  'services.items.psychology.body': 'Preparación mental, gestión de la presión y acompañamiento competitivo durante toda la temporada.',
  'services.items.psychology.short': 'Preparación mental y gestión de presión',

  'services.items.actionPlan.title': 'Plan de Acción',
  'services.items.actionPlan.body': 'Plan de carrera a corto, medio y largo plazo, con hitos claros y decisiones tomadas con criterio.',
  'services.items.actionPlan.short': 'Carrera con hitos y criterio',
```

Remove the old `services.items.representation.*`, `services.items.career.*`, `services.items.legal.*`, `services.items.image.*`, `services.items.scouting.*` keys.

Update `services.subtitle` to:

```ts
  'services.subtitle': 'Seis pilares para acompañar la carrera del futbolista: prensa, rendimiento, media, family office, psicología y plan de acción.',
```

Mirror in `src/i18n/en.ts`:

```ts
  'services.items.press.title': 'Press',
  'services.items.press.body': 'Public image, media relations and strategic positioning of the player at every stage.',
  'services.items.press.short': 'Image, media and positioning',

  'services.items.performance.title': 'Performance',
  'services.items.performance.body': 'Physical analysis, continuous monitoring and optimisation of athletic performance.',
  'services.items.performance.short': 'Physical analysis and optimisation',

  'services.items.media.title': 'Media',
  'services.items.media.body': 'Digital strategy, content creation and social media management to build the personal brand.',
  'services.items.media.short': 'Content, socials and personal brand',

  'services.items.familyOffice.title': 'Family Office',
  'services.items.familyOffice.body': 'Wealth management, tax planning and financial structure for the player and their family.',
  'services.items.familyOffice.short': 'Wealth, tax and structure',

  'services.items.psychology.title': 'Sport Psychology',
  'services.items.psychology.body': 'Mental preparation, pressure management and competitive support throughout the season.',
  'services.items.psychology.short': 'Mental prep and pressure management',

  'services.items.actionPlan.title': 'Action Plan',
  'services.items.actionPlan.body': 'Short, medium and long-term career plan with clear milestones and decisions taken with judgment.',
  'services.items.actionPlan.short': 'Career milestones, with judgment',
```

```ts
  'services.subtitle': 'Six pillars backing the footballer\u2019s career: press, performance, media, family office, psychology and action plan.',
```

- [ ] **Step 4: Verify**

Run: `npx astro check`
Expected: clean run. If `ServicesOrbit3D.astro` still references the old keys, those errors are expected (Orbit3D is deleted in Phase 2 — leave as-is for now OR add a temporary fallback). If errors block, add the legacy keys back as empty strings until Phase 2.

- [ ] **Step 5: Commit**

```bash
git add src/lib/servicesItems.ts src/i18n/es.ts src/i18n/en.ts
git commit -m "feat(services): replace 5 items with 6 pilares (prensa, rendimiento, media, family office, psicólogo, plan de acción)"
```

---

## Task 3: Rewrite `HeroSection.astro` home variant

**Files:**
- Modify: `src/components/sections/HeroSection.astro`

Goal: the home variant becomes a fullscreen hero (`100svh`) with video background, big claim anchored bottom-left ("Now. Next." + italic gold "Forever Football."), vertical scroll cue bottom-right. No CTA buttons. No GSAP for content (LogoReveal GSAP stays untouched in its own island). Non-home variants (page heroes) remain unchanged.

- [ ] **Step 1: Locate home-variant branch in current `HeroSection.astro`**

Open the file and find `variant === 'home'`. Isolate its JSX + its `<style>` rules.

- [ ] **Step 2: Replace home-variant markup**

```astro
{variant === 'home' && (
  <section class="hero hero--home" id={sectionId} aria-label={t('site.name')}>
    <video
      class="hero__video"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/media/hero-poster.jpg"
    >
      <source src="/media/hero.mp4" type="video/mp4" />
    </video>
    <div class="hero__overlay" aria-hidden="true"></div>

    <div class="hero__content">
      <h1 class="hero__claim">
        <span class="hero__claim-lead">{t('hero.claim.lead')}</span>
        <span class="hero__claim-accent">{t('hero.claim.accent')}</span>
      </h1>
    </div>

    <a class="hero__scroll" href="#talentos" aria-label={t('hero.scroll.label')}>
      <span class="hero__scroll-label">{t('hero.scroll.label')}</span>
      <span class="hero__scroll-line" aria-hidden="true"></span>
    </a>
  </section>
)}
```

(Confirm video `src` and `poster` paths match what `HeroSection.astro` currently uses — do NOT change the video asset.)

- [ ] **Step 3: Replace home-variant styles**

```css
.hero--home {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--color-ph-black);
  color: var(--color-ph-white);
}

.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(13,15,18,0.55) 0%, rgba(13,15,18,0) 30%, rgba(13,15,18,0) 55%, rgba(13,15,18,0.85) 100%),
    linear-gradient(90deg, rgba(13,15,18,0.35) 0%, rgba(13,15,18,0) 55%);
}

.hero__content {
  position: absolute;
  left: var(--edge, clamp(20px, 4vw, 48px));
  bottom: clamp(72px, 10vw, 140px);
  right: var(--edge, clamp(20px, 4vw, 48px));
  z-index: 2;
  max-width: 980px;
}

.hero__claim {
  font-family: var(--font-display, 'Inter Tight', sans-serif);
  font-weight: 500;
  font-size: clamp(44px, 8.5vw, 132px);
  letter-spacing: -0.03em;
  line-height: 0.96;
  margin: 0;
  text-wrap: balance;
}

.hero__claim-lead { display: block; color: var(--color-ph-white); }
.hero__claim-accent {
  display: block;
  color: var(--color-ph-gold);
  font-style: italic;
  font-weight: 400;
}

.hero__scroll {
  position: absolute;
  right: calc(var(--edge, 24px));
  bottom: clamp(24px, 4vw, 48px);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-ph-white);
  opacity: 0.7;
  transition: opacity 0.2s, color 0.2s;
}

.hero__scroll:hover { opacity: 1; color: var(--color-ph-gold); }

.hero__scroll-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero__scroll-line {
  width: 1px;
  height: 56px;
  background: currentColor;
  position: relative;
  overflow: hidden;
}
.hero__scroll-line::after {
  content: "";
  position: absolute;
  top: -100%;
  left: 0;
  width: 1px;
  height: 60%;
  background: var(--color-ph-gold);
  animation: scrollCue 2.4s cubic-bezier(.7,0,.2,1) infinite;
}

@keyframes scrollCue {
  0% { transform: translateY(0); }
  100% { transform: translateY(260%); }
}

@media (prefers-reduced-motion: reduce) {
  .hero__scroll-line::after { animation: none; }
}

@media (max-width: 720px) {
  .hero__content { bottom: clamp(96px, 18vh, 160px); }
}
```

- [ ] **Step 4: Remove home-variant GSAP code**

In the `<script>` block of `HeroSection.astro`, find any code guarded by `variant === 'home'` (or the home-specific GSAP animation block tied to `ph:logo-revealed` for hero CONTENT). Delete those blocks. LogoReveal's own script and the event dispatch stay (they live in `LogoReveal.tsx`, not here). If the script block becomes empty, delete it entirely.

**Keep** any listener that, on `ph:logo-revealed`, toggles a class on `<body>` or the header — that's Header-side. The hero itself shouldn't need any JS in V3.

- [ ] **Step 5: Verify**

```
npx astro check
npm run dev
```

Open `http://localhost:4321/` and verify:
- Logo reveal plays, then hero is visible underneath.
- Claim reads "Now. Next." on top line, "Forever Football." in italic gold on second line.
- Video covers full viewport; on mobile (DevTools 375×812) no horizontal letterboxing.
- Scroll cue visible bottom-right, vertical text, animated line.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/HeroSection.astro
git commit -m "feat(home): redesign hero — big claim, vertical scroll cue, 100svh mobile"
```

---

## Task 4: Rewrite `HomePlayersSection.astro` (3/2 responsive portrait grid)

**Files:**
- Modify: `src/components/sections/HomePlayersSection.astro`

Goal: inline card markup (do NOT reuse PortraitCard — design differs). 3 cards on desktop, 2 visible on mobile (3rd hidden via `display:none`). 3:4 aspect ratio. Bottom-anchored gradient overlay with index `01/02/03`, player name, club. Hover: gold top-right corner bracket fades in, gold underline draws from left, card translates up 3px, name turns gold.

- [ ] **Step 1: Replace component contents**

```astro
---
import type { PlayerDetailPayload } from '@/lib/playerDetail';
import { useTranslations } from '@/i18n/utils';

interface Props {
  lang: 'es' | 'en';
  players: PlayerDetailPayload[];
}

const { lang, players } = Astro.props;
const t = useTranslations(lang);

const topThree = players.slice(0, 3);
const rosterHref = lang === 'en' ? '/en/jugadores/' : '/jugadores/';
---

<section class="home-players" id="talentos" aria-labelledby="home-players-title">
  <header class="home-players__head">
    <span class="home-players__eyebrow">{t('home.players.eyebrow')}</span>
    <h2 class="home-players__title" id="home-players-title">
      {t('home.players.title').replace(t('home.players.titleAccent'), '')}
      <em>{t('home.players.titleAccent')}</em>.
    </h2>
    <p class="home-players__lead">{t('home.players.lead')}</p>
  </header>

  <ul class="home-players__grid" role="list">
    {topThree.map((player, idx) => {
      const href = lang === 'en'
        ? `/en/jugadores/${player.slug}/`
        : `/jugadores/${player.slug}/`;
      const photo = player.portraitUrl ?? player.heroUrl ?? null;
      const club = player.clubName ?? t('players.club.none');
      return (
        <li class={`home-players__item home-players__item--${idx + 1}`}>
          <a class="home-players__card" href={href}>
            <div class="home-players__photo">
              {photo ? (
                <img src={photo} alt={player.name} loading="lazy" decoding="async" />
              ) : (
                <div class="home-players__ph" aria-hidden="true">[ FOTO 3:4 ]</div>
              )}
            </div>
            <span class="home-players__corner" aria-hidden="true"></span>
            <div class="home-players__meta">
              <span class="home-players__idx">{String(idx + 1).padStart(2, '0')}</span>
              <span class="home-players__name">{player.name}</span>
              <span class="home-players__club">{club}</span>
            </div>
            <span class="home-players__underline" aria-hidden="true"></span>
          </a>
        </li>
      );
    })}
  </ul>

  <div class="home-players__cta-wrap">
    <a class="home-players__cta" href={rosterHref}>
      {t('home.players.cta')}
      <span class="home-players__arrow" aria-hidden="true">→</span>
    </a>
  </div>
</section>

<style>
  .home-players {
    padding: clamp(56px, 8vw, 120px) var(--edge, clamp(20px, 4vw, 48px));
    background: var(--color-ph-black);
    color: var(--color-ph-white);
  }

  .home-players__head { max-width: 720px; margin-bottom: clamp(32px, 5vw, 64px); }

  .home-players__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
  }
  .home-players__eyebrow::before {
    content: "";
    width: 28px;
    height: 1px;
    background: var(--color-ph-gold);
  }

  .home-players__title {
    font-family: var(--font-display, 'Inter Tight', sans-serif);
    font-weight: 500;
    font-size: clamp(36px, 6vw, 72px);
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin: 14px 0 0;
  }
  .home-players__title em {
    color: var(--color-ph-gold);
    font-style: italic;
    font-weight: 400;
  }

  .home-players__lead {
    margin: 18px 0 0;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 15px;
    line-height: 1.6;
    max-width: 520px;
  }

  .home-players__grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(10px, 1.5vw, 20px);
  }

  .home-players__item { margin: 0; }

  .home-players__card {
    position: relative;
    display: block;
    overflow: hidden;
    background: var(--color-ph-bg-2, #15171b);
    border: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
    transition: transform 0.35s cubic-bezier(.7,0,.2,1);
  }

  .home-players__photo { position: relative; aspect-ratio: 3/4; }
  .home-players__photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .home-players__ph {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--color-ph-ink-faint, #6f7278);
    background:
      repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 10px),
      var(--color-ph-bg-2, #15171b);
  }

  .home-players__corner {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 22px;
    height: 22px;
    border-top: 1px solid var(--color-ph-gold);
    border-right: 1px solid var(--color-ph-gold);
    opacity: 0;
    transition: opacity 0.35s;
  }

  .home-players__meta {
    position: absolute;
    inset: 0;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(
      to top,
      rgba(13,15,18,0.95) 0%,
      rgba(13,15,18,0.35) 40%,
      rgba(13,15,18,0) 65%
    );
    gap: 6px;
  }

  .home-players__idx {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--color-ph-gold);
  }
  .home-players__name {
    font-family: var(--font-display, 'Inter Tight', sans-serif);
    font-weight: 500;
    font-size: clamp(16px, 1.6vw, 22px);
    letter-spacing: -0.01em;
    line-height: 1.15;
    color: var(--color-ph-white);
    transition: color 0.3s;
  }
  .home-players__club {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--color-ph-ink-soft, #b5b7bb);
    text-transform: uppercase;
  }

  .home-players__underline {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 16px;
    height: 1px;
    background: var(--color-ph-gold);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(.7,0,.2,1);
  }

  .home-players__card:hover {
    transform: translateY(-3px);
  }
  .home-players__card:hover .home-players__name { color: var(--color-ph-gold); }
  .home-players__card:hover .home-players__corner { opacity: 1; }
  .home-players__card:hover .home-players__underline { transform: scaleX(1); }

  .home-players__cta-wrap {
    margin-top: clamp(24px, 4vw, 48px);
    display: flex;
    justify-content: flex-end;
  }

  .home-players__cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    border: 1px solid var(--color-ph-line-strong, rgba(255,255,255,0.24));
    border-radius: 100px;
    font-family: var(--font-sans, sans-serif);
    font-size: 13px;
    letter-spacing: 0.01em;
    color: var(--color-ph-white);
    transition: border-color 0.2s, color 0.2s;
  }
  .home-players__cta:hover {
    border-color: var(--color-ph-gold);
    color: var(--color-ph-gold);
  }
  .home-players__cta:hover .home-players__arrow {
    transform: translateX(4px);
  }
  .home-players__arrow { transition: transform 0.2s; }

  @media (max-width: 720px) {
    .home-players__grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .home-players__item--3 { display: none; }
    .home-players__name { font-size: 15px; }
    .home-players__meta { padding: 14px; }
  }
</style>
```

**Note:** The title-accent pattern (`.replace()`) is fragile if the string doesn't contain the accent verbatim. Prefer splitting server-side. If `{t('home.players.title')}` = "El roster." and accent = "roster", then render:

```astro
<h2 ...>El <em>roster</em>.</h2>
```

If in Spanish the title literally is "El " + `<em>roster</em>` + ".", hardcode that structure and use the accent key only for the em span. Same pattern in EN: "The " + `<em>roster</em>` + ".". Simpler and robust:

```astro
<h2 class="home-players__title" id="home-players-title">
  {lang === 'es' ? 'El ' : 'The '}<em>{t('home.players.titleAccent')}</em>.
</h2>
```

Adopt this simpler pattern. If you need full i18n purity, add `home.players.titleBefore` and `home.players.titleAfter` keys instead.

- [ ] **Step 2: Verify**

```
npx astro check
npm run dev
```

- At desktop width, 3 cards across.
- At 719px width (DevTools), only 2 cards visible.
- Hover shows corner bracket + underline + lift.
- Names come from real roster; slugs link to detail pages.
- Photos render or placeholder shows.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomePlayersSection.astro
git commit -m "feat(home): redesign talents mini-section — 3:4 portraits, 3/2 responsive, corner bracket hover"
```

---

## Task 5: Rewrite `HomeServicesSection.astro` as accordion

**Files:**
- Modify: `src/components/sections/HomeServicesSection.astro`

Goal: 6 pilares as a CSS accordion. Each row shows number (01–06), title, plus-icon. Click expands the body (short description) with a max-height transition. CSS-only via `<details>`/`<summary>` OR button + `aria-expanded` + `<script>` toggle. Prefer `<details>` for accessibility + zero JS.

- [ ] **Step 1: Replace component**

```astro
---
import { useTranslations } from '@/i18n/utils';
import { servicesItems } from '@/lib/servicesItems';

interface Props { lang: 'es' | 'en'; }
const { lang } = Astro.props;
const t = useTranslations(lang);

const servicesHref = lang === 'en' ? '/en/servicios/' : '/servicios/';
---

<section class="home-services" id="servicios" aria-labelledby="home-services-title">
  <header class="home-services__head">
    <span class="home-services__eyebrow">{t('home.services.eyebrow')}</span>
    <h2 class="home-services__title" id="home-services-title">
      {t('home.services.title')}
    </h2>
    <p class="home-services__lead">{t('home.services.lead')}</p>
  </header>

  <ol class="home-services__list" role="list">
    {servicesItems.map((item, idx) => (
      <li class="home-services__item">
        <details class="home-services__row" name="home-services">
          <summary class="home-services__summary">
            <span class="home-services__num">{String(idx + 1).padStart(2, '0')}</span>
            <span class="home-services__name">{t(item.titleKey)}</span>
            <span class="home-services__plus" aria-hidden="true">
              <span></span><span></span>
            </span>
          </summary>
          <div class="home-services__body">
            <p>{t(item.bodyKey)}</p>
          </div>
        </details>
      </li>
    ))}
  </ol>

  <div class="home-services__cta-wrap">
    <a class="home-services__cta" href={servicesHref}>
      {t('home.services.cta')}
      <span class="home-services__arrow" aria-hidden="true">→</span>
    </a>
  </div>
</section>

<style>
  .home-services {
    padding: clamp(56px, 8vw, 120px) var(--edge, clamp(20px, 4vw, 48px));
    background: var(--color-ph-bg-2, #15171b);
    color: var(--color-ph-white);
  }

  .home-services__head { max-width: 720px; margin-bottom: clamp(32px, 5vw, 56px); }

  .home-services__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
  }
  .home-services__eyebrow::before {
    content: "";
    width: 28px;
    height: 1px;
    background: var(--color-ph-gold);
  }

  .home-services__title {
    font-family: var(--font-display, sans-serif);
    font-weight: 500;
    font-size: clamp(32px, 5vw, 60px);
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin: 14px 0 0;
  }

  .home-services__lead {
    margin: 18px 0 0;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 15px;
    line-height: 1.6;
  }

  .home-services__list {
    list-style: none;
    padding: 0;
    margin: clamp(32px, 5vw, 56px) 0 0;
    border-top: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
  }

  .home-services__item { border-bottom: 1px solid var(--color-ph-line, rgba(255,255,255,0.12)); }

  .home-services__row { width: 100%; }
  .home-services__row > summary { list-style: none; cursor: pointer; }
  .home-services__row > summary::-webkit-details-marker { display: none; }

  .home-services__summary {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: clamp(16px, 2.5vw, 32px);
    padding: clamp(20px, 3vw, 32px) 0;
    transition: color 0.3s;
  }
  .home-services__row:hover .home-services__summary { color: var(--color-ph-gold); }

  .home-services__num {
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--color-ph-gold);
  }

  .home-services__name {
    font-family: var(--font-display, sans-serif);
    font-weight: 500;
    font-size: clamp(22px, 3vw, 36px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .home-services__plus {
    position: relative;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  .home-services__plus span {
    position: absolute;
    top: 50%;
    left: 0;
    width: 20px;
    height: 1px;
    background: currentColor;
    transform: translateY(-50%);
    transition: transform 0.3s;
  }
  .home-services__plus span:last-child {
    transform: translateY(-50%) rotate(90deg);
  }
  .home-services__row[open] .home-services__plus span:last-child {
    transform: translateY(-50%) rotate(0deg);
  }

  .home-services__body {
    padding: 0 0 clamp(20px, 3vw, 32px);
    max-width: 640px;
  }
  .home-services__body p {
    margin: 0;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 15px;
    line-height: 1.6;
  }

  .home-services__cta-wrap {
    margin-top: clamp(32px, 5vw, 56px);
    display: flex;
    justify-content: flex-end;
  }

  .home-services__cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    background: var(--color-ph-gold);
    color: var(--color-ph-black);
    border-radius: 100px;
    font-family: var(--font-sans, sans-serif);
    font-size: 13px;
    font-weight: 500;
    transition: background 0.2s;
  }
  .home-services__cta:hover { background: var(--color-ph-gold-soft, #e6c682); }
  .home-services__cta:hover .home-services__arrow { transform: translateX(4px); }
  .home-services__arrow { transition: transform 0.2s; }

  @media (max-width: 720px) {
    .home-services__summary { grid-template-columns: auto 1fr auto; gap: 14px; }
    .home-services__name { font-size: 20px; }
  }
</style>
```

**Note on `<details name="...">`:** the `name` attribute on `<details>` creates an exclusive accordion group (only one open at a time). Supported in modern Chromium/Firefox/Safari. Acceptable fallback: all closed initially, multiple can be open — degrades gracefully.

- [ ] **Step 2: Verify**

```
npx astro check
npm run dev
```

- 6 rows render with 01–06 numbers.
- Clicking a row expands it; opening another closes the previous.
- Plus rotates to minus when open.
- Responsive: readable on mobile.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeServicesSection.astro
git commit -m "feat(home): redesign services as 6-row CSS accordion"
```

---

## Task 6: Rewrite `HomeAboutSection.astro` (editorial block + stats + values)

**Files:**
- Modify: `src/components/sections/HomeAboutSection.astro`

Goal: centered editorial block with eyebrow, 2-line title (second line italic gold accent), body copy, CTA button to `/sobre-nosotros/`. Below: a 3-stat row (21 / 6 / 360º) with hairline separators. Below: values pipe-separated line (EXCELENCIA · CERCANÍA · RIGOR).

- [ ] **Step 1: Replace component**

```astro
---
import { useTranslations } from '@/i18n/utils';

interface Props { lang: 'es' | 'en'; }
const { lang } = Astro.props;
const t = useTranslations(lang);

const aboutHref = lang === 'en' ? '/en/sobre-nosotros/' : '/sobre-nosotros/';
---

<section class="home-about" id="sobre-nosotros" aria-labelledby="home-about-title">
  <div class="home-about__inner">
    <span class="home-about__eyebrow">{t('home.about.eyebrow')}</span>
    <h2 class="home-about__title" id="home-about-title">
      <span>{t('home.about.title')}</span>
      <em>{t('home.about.titleAccent')}</em>
    </h2>
    <p class="home-about__body">{t('home.about.body')}</p>
    <a class="home-about__cta" href={aboutHref}>
      {t('home.about.cta')}
      <span class="home-about__arrow" aria-hidden="true">→</span>
    </a>

    <dl class="home-about__stats" aria-label={t('home.about.stats.aria')}>
      <div class="home-about__stat">
        <dt class="home-about__stat-value">{t('home.about.stats.team.value')}</dt>
        <dd class="home-about__stat-label">{t('home.about.stats.team.label')}</dd>
      </div>
      <div class="home-about__stat">
        <dt class="home-about__stat-value">{t('home.about.stats.countries.value')}</dt>
        <dd class="home-about__stat-label">{t('home.about.stats.countries.label')}</dd>
      </div>
      <div class="home-about__stat">
        <dt class="home-about__stat-value">{t('home.about.stats.service.value')}</dt>
        <dd class="home-about__stat-label">{t('home.about.stats.service.label')}</dd>
      </div>
    </dl>

    <ul class="home-about__values" aria-label={t('home.about.values.aria')} role="list">
      <li>{t('home.about.values.v1')}</li>
      <li aria-hidden="true" class="home-about__values-sep">·</li>
      <li>{t('home.about.values.v2')}</li>
      <li aria-hidden="true" class="home-about__values-sep">·</li>
      <li>{t('home.about.values.v3')}</li>
    </ul>
  </div>
</section>

<style>
  .home-about {
    padding: clamp(80px, 12vw, 160px) var(--edge, clamp(20px, 4vw, 48px));
    background: var(--color-ph-black);
    color: var(--color-ph-white);
    border-top: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
  }

  .home-about__inner {
    max-width: 880px;
    margin: 0 auto;
    text-align: center;
  }

  .home-about__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
  }
  .home-about__eyebrow::before,
  .home-about__eyebrow::after {
    content: "";
    width: 28px;
    height: 1px;
    background: var(--color-ph-gold);
  }

  .home-about__title {
    font-family: var(--font-display, sans-serif);
    font-weight: 500;
    font-size: clamp(32px, 5.5vw, 72px);
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin: 18px 0 0;
  }
  .home-about__title span { display: block; }
  .home-about__title em {
    display: block;
    color: var(--color-ph-gold);
    font-style: italic;
    font-weight: 400;
  }

  .home-about__body {
    margin: 24px auto 0;
    max-width: 640px;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 16px;
    line-height: 1.65;
  }

  .home-about__cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: clamp(24px, 4vw, 40px);
    padding: 14px 22px;
    border: 1px solid var(--color-ph-line-strong, rgba(255,255,255,0.24));
    border-radius: 100px;
    font-family: var(--font-sans, sans-serif);
    font-size: 13px;
    color: var(--color-ph-white);
    transition: border-color 0.2s, color 0.2s;
  }
  .home-about__cta:hover {
    border-color: var(--color-ph-gold);
    color: var(--color-ph-gold);
  }
  .home-about__cta:hover .home-about__arrow { transform: translateX(4px); }
  .home-about__arrow { transition: transform 0.2s; }

  .home-about__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin: clamp(56px, 8vw, 96px) 0 0;
    border-top: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
    border-bottom: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
  }

  .home-about__stat {
    margin: 0;
    padding: clamp(24px, 3vw, 40px) 8px;
    border-right: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
  }
  .home-about__stat:last-child { border-right: none; }

  .home-about__stat-value {
    font-family: var(--font-display, sans-serif);
    font-weight: 500;
    font-size: clamp(36px, 5vw, 64px);
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--color-ph-gold);
    margin: 0;
  }
  .home-about__stat-label {
    margin: 8px 0 0;
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }

  .home-about__values {
    list-style: none;
    padding: 0;
    margin: clamp(32px, 5vw, 48px) 0 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }
  .home-about__values-sep { color: var(--color-ph-gold); }

  @media (max-width: 560px) {
    .home-about__stats { grid-template-columns: 1fr; }
    .home-about__stat { border-right: none; border-bottom: 1px solid var(--color-ph-line, rgba(255,255,255,0.12)); }
    .home-about__stat:last-child { border-bottom: none; }
  }
</style>
```

- [ ] **Step 2: Verify**

```
npx astro check
npm run dev
```

- Title renders on two lines, second in italic gold.
- 3 stats in a row with vertical dividers (desktop) / stacked (mobile).
- Values line renders with gold dot separators.
- CTA links to `/sobre-nosotros/` (or `/en/sobre-nosotros/`).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeAboutSection.astro
git commit -m "feat(home): redesign about block — editorial layout, 3 stats, values line"
```

---

## Task 7: Create `HomeContactSection.astro` (visual stub)

**Files:**
- Create: `src/components/sections/HomeContactSection.astro`

Goal: 2-column layout. Left: eyebrow + title + lead + direct email link. Right: form (name, email, role select, message textarea, submit button). No backend. `action="#"` + `onsubmit="event.preventDefault()"` for now.

- [ ] **Step 1: Write file**

```astro
---
import { useTranslations } from '@/i18n/utils';

interface Props { lang: 'es' | 'en'; }
const { lang } = Astro.props;
const t = useTranslations(lang);
---

<section class="home-contact" id="contacto" aria-labelledby="home-contact-title">
  <div class="home-contact__grid">
    <header class="home-contact__head">
      <span class="home-contact__eyebrow">{t('home.contact.eyebrow')}</span>
      <h2 class="home-contact__title" id="home-contact-title">{t('home.contact.title')}</h2>
      <p class="home-contact__lead">{t('home.contact.lead')}</p>
      <div class="home-contact__email">
        <span class="home-contact__email-label">{t('home.contact.emailLabel')}</span>
        <a href={`mailto:${t('home.contact.email')}`}>{t('home.contact.email')}</a>
      </div>
    </header>

    <form class="home-contact__form" action="#" onsubmit="event.preventDefault();">
      <label class="home-contact__field">
        <span>{t('home.contact.form.name')}</span>
        <input type="text" name="name" autocomplete="name" required />
      </label>
      <label class="home-contact__field">
        <span>{t('home.contact.form.email')}</span>
        <input type="email" name="email" autocomplete="email" required />
      </label>
      <label class="home-contact__field">
        <span>{t('home.contact.form.role')}</span>
        <select name="role" required>
          <option value="">—</option>
          <option value="player">{t('home.contact.form.role.player')}</option>
          <option value="club">{t('home.contact.form.role.club')}</option>
          <option value="brand">{t('home.contact.form.role.brand')}</option>
          <option value="other">{t('home.contact.form.role.other')}</option>
        </select>
      </label>
      <label class="home-contact__field home-contact__field--full">
        <span>{t('home.contact.form.message')}</span>
        <textarea name="message" rows="4" required></textarea>
      </label>
      <button type="submit" class="home-contact__submit">
        {t('home.contact.form.submit')}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  </div>
</section>

<style>
  .home-contact {
    padding: clamp(80px, 10vw, 140px) var(--edge, clamp(20px, 4vw, 48px));
    background: var(--color-ph-bg-2, #15171b);
    color: var(--color-ph-white);
    border-top: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
  }

  .home-contact__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(40px, 6vw, 96px);
    max-width: 1200px;
    margin: 0 auto;
  }

  .home-contact__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
  }
  .home-contact__eyebrow::before {
    content: ""; width: 28px; height: 1px; background: var(--color-ph-gold);
  }

  .home-contact__title {
    font-family: var(--font-display, sans-serif);
    font-weight: 500;
    font-size: clamp(36px, 6vw, 72px);
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin: 14px 0 0;
  }

  .home-contact__lead {
    margin: 18px 0 0;
    color: var(--color-ph-ink-soft, #b5b7bb);
    font-size: 15px;
    line-height: 1.65;
    max-width: 440px;
  }

  .home-contact__email {
    margin-top: clamp(24px, 4vw, 40px);
    padding-top: 24px;
    border-top: 1px solid var(--color-ph-line, rgba(255,255,255,0.12));
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .home-contact__email-label {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }
  .home-contact__email a {
    font-family: var(--font-display, sans-serif);
    font-size: clamp(20px, 2.4vw, 28px);
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--color-ph-white);
    transition: color 0.2s;
  }
  .home-contact__email a:hover { color: var(--color-ph-gold); }

  .home-contact__form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-content: start;
  }

  .home-contact__field { display: flex; flex-direction: column; gap: 8px; }
  .home-contact__field--full { grid-column: 1 / -1; }

  .home-contact__field span {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-ink-soft, #b5b7bb);
  }

  .home-contact__field input,
  .home-contact__field select,
  .home-contact__field textarea {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--color-ph-line-strong, rgba(255,255,255,0.24));
    color: var(--color-ph-white);
    font: inherit;
    font-size: 15px;
    padding: 10px 0;
    outline: none;
    transition: border-color 0.2s;
    border-radius: 0;
  }
  .home-contact__field textarea { resize: vertical; font-family: inherit; }
  .home-contact__field select { appearance: none; cursor: pointer; }
  .home-contact__field select option { color: var(--color-ph-black); }

  .home-contact__field input:focus,
  .home-contact__field select:focus,
  .home-contact__field textarea:focus {
    border-color: var(--color-ph-gold);
  }

  .home-contact__submit {
    grid-column: 1 / -1;
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    background: var(--color-ph-gold);
    color: var(--color-ph-black);
    border: none;
    border-radius: 100px;
    font-family: var(--font-sans, sans-serif);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.2s;
  }
  .home-contact__submit:hover { background: var(--color-ph-gold-soft, #e6c682); }

  @media (max-width: 900px) {
    .home-contact__grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .home-contact__form { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: Verify**

File created. Full wiring/verification happens in Task 8.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeContactSection.astro
git commit -m "feat(home): add contact section visual stub (no backend)"
```

---

## Task 8: Wire up `pages/index.astro` + `pages/en/index.astro`

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Update `src/pages/index.astro`**

Replace imports and body:

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import LogoReveal from '@/components/islands/LogoReveal.tsx';
import HeroSection from '@/components/sections/HeroSection.astro';
import HomePlayersSection from '@/components/sections/HomePlayersSection.astro';
import HomeServicesSection from '@/components/sections/HomeServicesSection.astro';
import HomeAboutSection from '@/components/sections/HomeAboutSection.astro';
import HomeContactSection from '@/components/sections/HomeContactSection.astro';
import { useTranslations, getLangFromUrl } from '@/i18n/utils';
import { SITE_URL } from '@/lib/constants';
import { buildPlayerDetailPayloadsForLang, getAllRosterEntries } from '@/lib/playerDetail';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

const rosterPlayers = getAllRosterEntries().filter((e) => e.role === 'player');
const topSlugs = rosterPlayers.slice(0, 3).map((e) => e.slug);
const payloads = await buildPlayerDetailPayloadsForLang(lang);
const homePlayers = topSlugs.map((slug) => payloads[slug]).filter(Boolean);
---

<BaseLayout
  title={`${t('site.name')} — ${t('site.tagline')}`}
  description={t('site.description')}
  lang={lang}
  canonical={`${SITE_URL}/`}
  hasHero
>
  <LogoReveal client:load />
  <HeroSection lang={lang} variant="home" sectionId="inicio" />
  <HomePlayersSection lang={lang} players={homePlayers} />
  <HomeServicesSection lang={lang} />
  <HomeAboutSection lang={lang} />
  <HomeContactSection lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Apply same changes to `src/pages/en/index.astro`**

Read the file first, then mirror the imports and section list (keeping whatever lang wiring it has — likely `const lang = 'en' as const`). Remove the same three sections, add `HomeContactSection`.

- [ ] **Step 3: Verify**

```
npx astro check
npm run dev
```

Open `/` and `/en/`:
- LogoReveal plays.
- Hero → Talents → Services → About → Contact renders in order.
- No console errors.
- Both locales show translated strings.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(home): wire V3 sections in pages, drop stats/manifesto/360"
```

---

## Task 9: Delete obsolete Home sections

**Files:**
- Delete: `src/components/sections/HomeStatsStrip.astro`
- Delete: `src/components/sections/HomeManifestoSection.astro`
- Delete: `src/components/sections/Home360Section.astro`

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -R "HomeStatsStrip\|HomeManifestoSection\|Home360Section" src/`
Expected: no output.

- [ ] **Step 2: Delete files**

```bash
rm src/components/sections/HomeStatsStrip.astro
rm src/components/sections/HomeManifestoSection.astro
rm src/components/sections/Home360Section.astro
```

- [ ] **Step 3: Verify**

```
npx astro check
npx astro build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/sections/
git commit -m "chore(home): remove obsolete Stats/Manifesto/360 sections"
```

---

## Task 10: Final verification + manual smoke test

**Files:** none modified.

- [ ] **Step 1: Full type check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 2: Production build**

Run: `npx astro build`
Expected: clean build, no warnings about missing keys or broken imports.

- [ ] **Step 3: Dev server manual smoke test**

Run: `npm run dev`, then in browser:

- `/` (ES)
  - [ ] LogoReveal plays, hero appears underneath.
  - [ ] Hero claim: "Now. Next." + italic gold "Forever Football."
  - [ ] Scroll cue bottom-right, animated line, vertical label.
  - [ ] Talents: 3 cards desktop, links to `/jugadores/<slug>/`.
  - [ ] Services: 6 rows, accordion exclusive.
  - [ ] About: 2-line title, 3 stats row, values line.
  - [ ] Contact: 2-col layout, form renders, submit does NOT navigate.
  - [ ] DevTools mobile 375×812: hero fills viewport, talents show 2 cards, stats stack.
- `/en/`
  - [ ] All strings in English.
  - [ ] Links go to `/en/...` variants.

- [ ] **Step 4: Commit final verification log** (optional)

If any small tweaks were needed during smoke test, commit them under `fix(home): smoke-test adjustments`.

---

## Handoff notes for executor

- **Do not touch `LogoReveal.tsx`.** Its GSAP timeline is the one GSAP usage we're keeping.
- **Do not touch `HeroSection.astro` non-home variants** (page hero used by `/jugadores/`, `/servicios/`, etc. Those get replaced in Phases 2–4).
- If `astro check` fails in Task 1 because components still reference removed keys, that's expected — continue through Task 8/9 and re-verify at Task 10.
- If an icon mismatch surfaces because `servicesItems.ts` icon type is stricter than assumed, either widen the union or map both `actionPlan` and `performance` to `route` (acceptable duplicate).
- **Video asset path:** double-check the current `HeroSection.astro` for the exact `/media/*` path; do not invent it.
- **Footer email** (`footer.email`) is updated in Task 1 but the footer itself is redesigned in Phase 5 — the string swap in Task 1 is enough for Phase 1.