# About Redesign V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/sobre-nosotros/` and `/en/about/` (currently the 01/02/03 editorial `AboutSection`) with a five-block editorial layout — hero split, historia dropcap, equipo editorial table, presencia, cierre manifesto — matching the handoff `sobre-nosotros.html`. Absorb `/equipo/` and `/en/team/` into `#equipo` anchors via Astro 301 redirects.

**Architecture:** Single monolithic `AboutSection.astro` (scoped CSS + script, Phase 2 `ServicesSection` pattern). New `src/lib/teamMembers.ts` data module seeds 21 real members; roles + country labels translate via i18n. Static redirects declared in `astro.config.mjs`. Old `TeamSection.astro` + old team pages deleted; `player-modal.ts` deleted only if no other importer remains.

**Tech Stack:** Astro 5 SSG, scoped component styles, `astro:page-load` event, GSAP + ScrollTrigger (existing `@/scripts/ph-text-animations`), TypeScript flat-key i18n (`TranslationKey` union).

**Spec:** `docs/superpowers/specs/2026-04-20-about-redesign-v3-design.md`
**Design source:** `.design-ref/handoff-unpacked/wf-web-phsport/project/sobre-nosotros.html` (unpacked from the handoff zip).

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `src/styles/global.css` | modify | Add `--font-mono` token to `:root` (Task 2) |
| `astro.config.mjs` | modify | Add `redirects` map for `/equipo` + `/en/team` → About `#equipo` (Task 3) |
| `src/lib/teamMembers.ts` | create | 21-member data module — structural fields (`id`, `name`, `nationality`, `countryKey`) + `getTeamMembers(lang)` helper (Task 4) |
| `src/i18n/es.ts` | modify | Add `about.*` and extended `team.*` keys (Task 5). Obsolete keys removed in Task 12 |
| `src/i18n/en.ts` | modify | Parity mirror of `es.ts` additions (Task 6). Obsolete keys removed in Task 12 |
| `src/components/sections/AboutSection.astro` | rewrite | Monolithic five-block About page — hero split, historia, equipo table, presencia, manifesto (Tasks 7–11) |
| `src/components/sections/TeamSection.astro` | delete | Obsolete placeholder grid (Task 12) |
| `src/pages/equipo.astro` | delete | Replaced by redirect (Task 12) |
| `src/pages/en/team.astro` | delete | Replaced by redirect (Task 12) |
| `src/scripts/player-modal.ts` | conditional delete | Only if no other consumer found via grep (Task 12) |

**Branch:** `feat/sobre-nosotros-redesign-v3` (created off `main` in Task 1).

**Token strategy:** alias `--color-ph-*` tokens into component-scoped `--abt-*` variables declared on `.about-section` root (mirrors the `--srv-*` pattern from Phase 2). No new color tokens added to `global.css` — only `--font-mono`.

**Gold accent rendering (global rule):** all gold title accents wrap the accent substring in `<span class="abt-gold">` concatenated from i18n fragments (`titlePre` + `titleAccent` + `titlePost`). CSS rule `.abt-gold { color: var(--abt-gold); font-weight: 700; font-style: normal; }` enforces color + weight only (Söhne has no italic variant; do **not** use `<em>` for these accents).

---

## Task 1: Preflight — branch, design-ref, dev server

**Files:** no changes

- [ ] **Step 1: Verify current branch is `main` and clean**

Run: `git status --short && git branch --show-current`
Expected: working tree clean (modulo pre-existing unstaged Phase-1 `en/players/index.astro`, `en/services.astro`, `jugadores/index.astro`, `servicios.astro` which are untouched baseline changes), current branch `main`.

- [ ] **Step 2: Create feature branch**

Run: `git checkout -b feat/sobre-nosotros-redesign-v3`
Expected: `Switched to a new branch 'feat/sobre-nosotros-redesign-v3'`.

- [ ] **Step 3: Verify design reference is unpacked**

Run: `ls .design-ref/handoff-unpacked/wf-web-phsport/project/sobre-nosotros.html`
Expected: file listed. If missing, unpack manually with `unzip -o "C:/Users/mario/Downloads/WF Web PHSPORT-handoff.zip" -d .design-ref/handoff-unpacked/`.

- [ ] **Step 4: Start dev server (if not running) and baseline-curl**

Start server (background): `npm run dev`
Then: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4321/sobre-nosotros`
Expected: `200`.

Also: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4321/en/about`
Expected: `200`.

And: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4321/equipo`
Expected: `200` (will become `301` after Task 3).

No commit — this task is preflight only.

---

## Task 2: Add `--font-mono` token to global.css

**Files:**
- Modify: `src/styles/global.css`

Goal: expose a system monospace stack as a global CSS variable so subsequent tasks (and other components) can reference `var(--font-mono)` for eyebrows, meta labels, and index numerals.

- [ ] **Step 1: Edit `global.css` — add the token**

In `src/styles/global.css`, locate the `:root` block inside `@theme` (contains `--font-display` and `--font-body` on lines 23–24). Insert a new line immediately after `--font-body`:

```css
  --font-mono:    ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
```

Full context after edit — the three font tokens should read:

```css
  /* Tipografia */
  --font-display: 'Sohne', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-body:    'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-mono:    ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
```

- [ ] **Step 2: Verify build passes**

Run: `npm run check`
Expected: same pre-existing error count as baseline (no new errors introduced). Document the baseline count before starting work.

Run: `npm run build`
Expected: build completes successfully; page count `242` (unchanged from Phase 2 merge).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(about-v3): add --font-mono global token

Expose a system monospace stack as --font-mono in :root. Will be
consumed by the About redesign for eyebrows, meta labels, and
table indices. Available globally for future components.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Add 301 redirects for `/equipo` and `/en/team`

**Files:**
- Modify: `astro.config.mjs`

Goal: declare static 301 redirects from `/equipo` to `/sobre-nosotros#equipo` and from `/en/team` to `/en/about#equipo`. Astro 5 supports the object form `{ status, destination }` in `defineConfig({ redirects })`.

Do NOT delete the existing `src/pages/equipo.astro` / `src/pages/en/team.astro` files yet — that happens in Task 12 after the new About page is live. Until deletion, Astro prioritizes the redirect over the file but keeping the files avoids 404 surface while the branch is in progress.

- [ ] **Step 1: Edit `astro.config.mjs` — add `redirects` block**

In `astro.config.mjs`, the full current file is:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [react(), sitemap()],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    /** Si 4321 está ocupado, falla en lugar de servir en 4322+ (evita abrir la URL equivocada). */
    server: {
      port: 4321,
      strictPort: true,
    },
  },
});
```

Add the `redirects` key inside `defineConfig()` directly after the `i18n` block:

```js
  redirects: {
    '/equipo': { status: 301, destination: '/sobre-nosotros#equipo' },
    '/en/team': { status: 301, destination: '/en/about#equipo' },
  },
```

- [ ] **Step 2: Verify build generates redirect pages**

Run: `npm run build`
Expected: build succeeds. The build log should show the redirects being picked up. Page count may stay `242` or drop by 2 depending on how Astro accounts for redirects vs file pages — either is acceptable. If the build errors with "object form not supported", fall back to the string form:

```js
  redirects: {
    '/equipo': '/sobre-nosotros#equipo',
    '/en/team': '/en/about#equipo',
  },
```

and verify again. Astro's default status for string form is `302`; document which form was used in the commit message.

- [ ] **Step 3: Verify redirect works in dev**

Restart dev server (redirects are picked up on config reload). Run:

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:4321/equipo
```

Expected: `301 /sobre-nosotros#equipo` (or `302` if fallback used). Same for `/en/team` → `/en/about#equipo`.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs
git commit -m "feat(about-v3): redirect /equipo and /en/team to About #equipo

Declare static 301 redirects so the team grid routes fold into the
new About page's #equipo anchor. The old equipo.astro / en/team.astro
files stay until the new About section is live (Task 12 deletes them).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Create `src/lib/teamMembers.ts` data module

**Files:**
- Create: `src/lib/teamMembers.ts`

Goal: define the 21-member data structure, the `Nationality` / `CountryKey` union types, and the `getTeamMembers(lang)` helper that joins structural data with translated roles and country labels.

- [ ] **Step 1: Create the file with full content**

Create `src/lib/teamMembers.ts` with:

```ts
import type { Lang, TranslationKey } from '@/i18n/utils';
import { useTranslations } from '@/i18n/utils';

export type Nationality = 'ES' | 'PT';

export type CountryKey = 'arabia' | 'uk' | 'portugal' | 'alemania' | 'uruguay';

export interface TeamMember {
  id: string;
  name: string;
  nationality?: Nationality;
  countryKey?: CountryKey;
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  { id: 'cogollos',   name: 'Ángel Cogollos' },
  { id: 'castello',   name: 'Santiago Castello' },
  { id: 'castell',    name: 'Ángel Castell',     nationality: 'ES', countryKey: 'arabia' },
  { id: 'weggelaar',  name: 'Bibiana Weggelaar', nationality: 'ES', countryKey: 'uk' },
  { id: 'canoa',      name: 'Pedro Canoa',       nationality: 'PT', countryKey: 'portugal' },
  { id: 'leon',       name: 'Diego León',        nationality: 'ES', countryKey: 'alemania' },
  { id: 'nanini',     name: 'Thiago Nanini',     nationality: 'ES', countryKey: 'uruguay' },
  { id: 'caserza',    name: 'Javier Caserza' },
  { id: 'hernansanz', name: 'Diego Hernansanz' },
  { id: 'martin',     name: 'Ismael Martín' },
  { id: 'lopez',      name: 'Daniel López' },
  { id: 'alvarez',    name: 'Javier Álvarez' },
  { id: 'garcia',     name: 'Moisés García' },
  { id: 'sancho',     name: 'Esteban Sancho' },
  { id: 'granados',   name: 'Alberto Granados' },
  { id: 'gomez',      name: 'Juan Luis Gómez' },
  { id: 'toledo',     name: 'Diego Toledo' },
  { id: 'marin',      name: 'Jaime Marín' },
  { id: 'alcazar',    name: 'Eva Alcázar' },
  { id: 'rodriguez',  name: 'María Rodríguez' },
  { id: 'salles',     name: 'Jordi Sallés' },
] as const;

export interface RenderableMember {
  id: string;
  index: string;          // '01', '02', ..., '21'
  name: string;
  role: string;
  nationality?: Nationality;
  country?: string;
  defaultLocation: string;
}

export function getTeamMembers(lang: Lang): RenderableMember[] {
  const t = useTranslations(lang);
  const defaultLocation = t('team.defaultLocation' as TranslationKey);
  return TEAM_MEMBERS.map((m, i) => ({
    id: m.id,
    index: String(i + 1).padStart(2, '0'),
    name: m.name,
    role: t(`team.members.${m.id}.role` as TranslationKey),
    nationality: m.nationality,
    country: m.countryKey ? t(`team.countries.${m.countryKey}` as TranslationKey) : undefined,
    defaultLocation,
  }));
}
```

- [ ] **Step 2: Verify file compiles (but i18n keys don't exist yet)**

Run: `npm run check`
Expected: new type errors referring to `team.members.*` and `team.countries.*` keys not existing in the `TranslationKey` union. The `as TranslationKey` casts make these compile-time errors instead of runtime ones — this is expected until Tasks 5 and 6 add the keys. Document the error count increase.

The build will still run because Astro's runtime doesn't enforce the cast. This is acceptable for a single-task commit; subsequent tasks bring the types back to green.

- [ ] **Step 3: Commit**

```bash
git add src/lib/teamMembers.ts
git commit -m "feat(about-v3): add teamMembers data module (21 real integrantes)

Structural data for the 21 PHSPORT team members, with optional
nationality (ES/PT) and countryKey (arabia/uk/portugal/alemania/uruguay)
for members representing PHSPORT abroad. getTeamMembers(lang) resolves
translated roles and country labels via i18n. Keys are added in the
next two tasks; type errors until then are expected.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: i18n ES — add `about.*` and extended `team.*` keys

**Files:**
- Modify: `src/i18n/es.ts`

Goal: add all new ES keys the About redesign needs. Do NOT remove the obsolete `about.block*` / `team.placeholder*` keys yet — they still support the old sections that get deleted in Task 12.

- [ ] **Step 1: Add `about.*` keys**

In `src/i18n/es.ts`, locate the block starting with `// --- Sobre nosotros ---` (around line 105). Keep `about.title` and `about.subtitle` as-is. Leave the three `about.block*` groups unchanged for now. Append these new keys immediately after `about.block3.body` (line 113), before the closing blank line that separates this block from `// --- Equipo (página) ---`:

```ts
  // Hero split
  'about.hero.eyebrow': '04 · Sobre nosotros',
  'about.hero.titlePre': 'Representar con ',
  'about.hero.titleAccent': 'propósito',
  'about.hero.titlePost': '.',
  'about.hero.body1': 'PHSPORT es una agencia de fútbol que construye y protege la carrera de los futbolistas a través de una representación estratégica, visión internacional y enfoque a largo plazo.',
  'about.hero.body2': 'Más que representar jugadores, desarrollamos estructuras integrales que acompañan al jugador en todas las áreas clave de su carrera — dentro y fuera del campo.',
  'about.hero.ctaServices': 'Nuestros servicios',
  'about.hero.ctaContact': 'Contactar',
  'about.hero.values': 'EXCELENCIA · CERCANÍA · RIGOR',
  'about.hero.caption': 'PHSPORT · SEDE MADRID',
  // Historia
  'about.historia.titlePre': 'Gestionamos tu carrera. Cuidamos tu ',
  'about.historia.titleAccent1': 'presente',
  'about.historia.titleMid': ' y planificamos tu ',
  'about.historia.titleAccent2': 'futuro',
  'about.historia.titlePost': '.',
  'about.historia.p1': 'PHSPORT representa futbolistas con proyección y les acompaña con una gestión integral, estratégica y personalizada para impulsar su crecimiento dentro y fuera del campo.',
  'about.historia.p2': 'Trabajamos sobre cinco áreas clave: representación e intermediación, planificación de carrera, acceso a clubes y oportunidades internacionales, comunicación y marketing, y asesoramiento legal y financiero.',
  'about.historia.p3': 'Más allá de la representación, desarrollamos una estructura de trabajo integral — prensa, media, psicología deportiva, rendimiento y family office — para acompañar cada etapa de la carrera del jugador.',
  'about.historia.p4': 'Servicio 365: disponibilidad y seguimiento continuo. Adaptación a cada etapa de la carrera. Soporte integral dentro y fuera del campo.',
  // Equipo (cabecera del bloque dentro de About)
  'about.team.eyebrow': 'EL EQUIPO',
  'about.team.titlePre': 'Las ',
  'about.team.titleAccent': 'personas',
  'about.team.titlePost': ' detrás.',
  'about.team.meta': '21 INTEGRANTES · 6 PAÍSES',
  // Presencia
  'about.presencia.eyebrow': '05 · Presencia',
  'about.presencia.madridLabel': 'SEDE CENTRAL · ES',
  'about.presencia.internationalLabel': 'PRESENCIA INTERNACIONAL',
  'about.presencia.madridTitle': 'Madrid.',
  'about.presencia.country.portugal': 'Portugal',
  'about.presencia.country.uk': 'Reino Unido',
  'about.presencia.country.alemania': 'Alemania',
  'about.presencia.country.arabia': 'Arabia Saudí',
  'about.presencia.country.uruguay': 'Uruguay',
  // Cierre manifesto
  'about.manifesto.quotePre': '"No solo representamos jugadores.',
  'about.manifesto.quoteAccent': 'Construimos estructuras',
  'about.manifesto.quotePost': ' que maximizan su rendimiento, estabilidad y proyección a largo plazo."',
  'about.manifesto.sig': '— PHSPORT · ACOMPAÑAMIENTO 360º',
```

- [ ] **Step 2: Add `team.*` extensions**

In `src/i18n/es.ts`, locate the `// --- Equipo (página) ---` block (around line 115). After the existing 4 keys (`team.title`, `team.subtitle`, `team.placeholderName`, `team.placeholderRole`), append:

```ts
  'team.defaultLocation': 'ESPAÑA',
  'team.countries.arabia': 'PH Arabia',
  'team.countries.uk': 'PH UK',
  'team.countries.portugal': 'PH Portugal',
  'team.countries.alemania': 'PH Alemania',
  'team.countries.uruguay': 'Uruguay',
  'team.members.cogollos.role': 'CEO',
  'team.members.castello.role': 'Agente FIFA · Coordinador Dto. Fútbol',
  'team.members.castell.role': 'Agente FIFA · Dto. Fútbol',
  'team.members.weggelaar.role': 'Dto. Fútbol',
  'team.members.canoa.role': 'Dto. Fútbol',
  'team.members.leon.role': 'Dto. Fútbol',
  'team.members.nanini.role': 'Dto. Fútbol',
  'team.members.caserza.role': 'Agente FIFA · Dto. Fútbol España',
  'team.members.hernansanz.role': 'Agente FIFA · Dto. Fútbol España',
  'team.members.martin.role': 'Agente FIFA · Dto. Fútbol España',
  'team.members.lopez.role': 'Agente FIFA · Dto. Fútbol España',
  'team.members.alvarez.role': 'Dto. Fútbol PH España',
  'team.members.garcia.role': 'Dto. Fútbol PH España',
  'team.members.sancho.role': 'Dto. Fútbol PH España',
  'team.members.granados.role': 'Dto. Fútbol PH España',
  'team.members.gomez.role': 'Dto. Fútbol PH España',
  'team.members.toledo.role': 'Dto. Fútbol PH España',
  'team.members.marin.role': 'Dto. Fútbol PH España',
  'team.members.alcazar.role': 'Dto. Marketing y Redes Sociales',
  'team.members.rodriguez.role': 'Dto. Financiero',
  'team.members.salles.role': 'Dto. Financiero',
```

- [ ] **Step 3: Verify build — partial, EN still missing**

Run: `npm run check`
Expected: still some errors because `en.ts` doesn't yet have these keys (Astro's `Record<TranslationKey, string>` is cross-locale). The `TranslationKey` union is derived from `es.ts`, so `en.ts` now has missing-key errors. This is expected and resolved in Task 6.

The count of type errors should be ~55 (one per new ES-only key in `en.ts`). Document the exact count.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/es.ts
git commit -m "feat(about-v3): add ES i18n keys for About redesign

New about.* namespace (~35 keys) covering hero, historia, equipo header,
presencia, and cierre manifesto. Extended team.* namespace (~27 keys)
with defaultLocation, 5 countries, and per-member role keys for all
21 integrantes. Obsolete about.block*/team.placeholder* keys retained
until Task 12 cleans them up.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: i18n EN — parity mirror

**Files:**
- Modify: `src/i18n/en.ts`

Goal: add the English equivalents for every key added to `es.ts` in Task 5, restoring type-check parity.

- [ ] **Step 1: Add `about.*` EN keys**

In `src/i18n/en.ts`, locate the block mirroring `// --- Sobre nosotros ---` (use the ES structure as a map — search for `about.title` and insert after `about.block3.body`):

```ts
  // Hero split
  'about.hero.eyebrow': '04 · About us',
  'about.hero.titlePre': 'Representing with ',
  'about.hero.titleAccent': 'purpose',
  'about.hero.titlePost': '.',
  'about.hero.body1': "PHSPORT is a football agency that builds and protects players' careers through strategic representation, international reach, and long-term focus.",
  'about.hero.body2': "More than representing players, we develop integral structures that support the player across every key area of their career — on and off the pitch.",
  'about.hero.ctaServices': 'Our services',
  'about.hero.ctaContact': 'Get in touch',
  'about.hero.values': 'EXCELLENCE · CLOSENESS · RIGOR',
  'about.hero.caption': 'PHSPORT · MADRID HQ',
  // Historia
  'about.historia.titlePre': 'We manage your career. We look after your ',
  'about.historia.titleAccent1': 'present',
  'about.historia.titleMid': ' and plan your ',
  'about.historia.titleAccent2': 'future',
  'about.historia.titlePost': '.',
  'about.historia.p1': "PHSPORT represents footballers with potential and supports them with integral, strategic, and personalized management to drive their growth on and off the pitch.",
  'about.historia.p2': 'We work across five key areas: representation and intermediation, career planning, access to clubs and international opportunities, communication and marketing, and legal and financial advisory.',
  'about.historia.p3': "Beyond representation, we build an integral working structure — press, media, sports psychology, performance, and family office — to support every stage of the player's career.",
  'about.historia.p4': '365 Service: continuous availability and follow-up. Adaptation at every career stage. Integral support on and off the pitch.',
  // Equipo (section header within About)
  'about.team.eyebrow': 'THE TEAM',
  'about.team.titlePre': 'The ',
  'about.team.titleAccent': 'people',
  'about.team.titlePost': ' behind it.',
  'about.team.meta': '21 MEMBERS · 6 COUNTRIES',
  // Presencia
  'about.presencia.eyebrow': '05 · Presence',
  'about.presencia.madridLabel': 'HEADQUARTERS · ES',
  'about.presencia.internationalLabel': 'INTERNATIONAL PRESENCE',
  'about.presencia.madridTitle': 'Madrid.',
  'about.presencia.country.portugal': 'Portugal',
  'about.presencia.country.uk': 'United Kingdom',
  'about.presencia.country.alemania': 'Germany',
  'about.presencia.country.arabia': 'Saudi Arabia',
  'about.presencia.country.uruguay': 'Uruguay',
  // Cierre manifesto
  'about.manifesto.quotePre': "\"We don't just represent players.",
  'about.manifesto.quoteAccent': 'We build structures',
  'about.manifesto.quotePost': ' that maximize their performance, stability, and long-term projection."',
  'about.manifesto.sig': '— PHSPORT · 360° SUPPORT',
```

- [ ] **Step 2: Add `team.*` EN extensions**

In `src/i18n/en.ts`, after the existing `team.placeholderRole`, append:

```ts
  'team.defaultLocation': 'SPAIN',
  'team.countries.arabia': 'PH Arabia',
  'team.countries.uk': 'PH UK',
  'team.countries.portugal': 'PH Portugal',
  'team.countries.alemania': 'PH Germany',
  'team.countries.uruguay': 'Uruguay',
  'team.members.cogollos.role': 'CEO',
  'team.members.castello.role': 'FIFA Agent · Football Dept. Coordinator',
  'team.members.castell.role': 'FIFA Agent · Football Dept.',
  'team.members.weggelaar.role': 'Football Dept.',
  'team.members.canoa.role': 'Football Dept.',
  'team.members.leon.role': 'Football Dept.',
  'team.members.nanini.role': 'Football Dept.',
  'team.members.caserza.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.hernansanz.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.martin.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.lopez.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.alvarez.role': 'PH Spain Football Dept.',
  'team.members.garcia.role': 'PH Spain Football Dept.',
  'team.members.sancho.role': 'PH Spain Football Dept.',
  'team.members.granados.role': 'PH Spain Football Dept.',
  'team.members.gomez.role': 'PH Spain Football Dept.',
  'team.members.toledo.role': 'PH Spain Football Dept.',
  'team.members.marin.role': 'PH Spain Football Dept.',
  'team.members.alcazar.role': 'Marketing & Social Media Dept.',
  'team.members.rodriguez.role': 'Finance Dept.',
  'team.members.salles.role': 'Finance Dept.',
```

- [ ] **Step 3: Verify parity restored**

Run: `npm run check`
Expected: type errors from Tasks 4 + 5 all resolved. Only pre-existing baseline errors remain (HomeInstagramSection i18n, Button.astro type, TeamSection Timeout type — this last one goes away in Task 12).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.ts
git commit -m "feat(about-v3): mirror EN i18n keys for About redesign

Parity mirror of the ES additions from the previous commit: about.*
namespace (~35 keys) and extended team.* namespace (~27 keys). Type
check returns to the pre-Task-4 baseline.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Rewrite `AboutSection.astro` — scaffold + hero split

**Files:**
- Modify (full rewrite): `src/components/sections/AboutSection.astro`

Goal: replace the current 01/02/03 editorial layout with the new five-block skeleton, implementing **only the hero split block** fully. Later blocks render as visible placeholders so the page isn't broken between tasks.

- [ ] **Step 1: Replace file contents entirely**

Overwrite `src/components/sections/AboutSection.astro` with:

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';
import { getTeamMembers } from '@/lib/teamMembers';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const servicesHref = lang === 'es' ? '/servicios' : '/en/services';
const contactHref = lang === 'es' ? '/#contacto' : '/en/#contacto';

const teamMembers = getTeamMembers(lang);

const internationalCountries = [
  { key: 'portugal' as const, iso: 'PT' },
  { key: 'uk' as const,       iso: 'UK' },
  { key: 'alemania' as const, iso: 'DE' },
  { key: 'arabia' as const,   iso: 'KSA' },
  { key: 'uruguay' as const,  iso: 'UY' },
];

const FLAGS = {
  ES: '<svg viewBox="0 0 3 2" aria-hidden="true" focusable="false"><rect width="3" height="2" fill="#c60b1e"/><rect y="0.5" width="3" height="1" fill="#ffc400"/></svg>',
  PT: '<svg viewBox="0 0 6 4" aria-hidden="true" focusable="false"><rect width="6" height="4" fill="#da291c"/><rect width="2.4" height="4" fill="#006233"/><circle cx="2.4" cy="2" r="0.6" fill="#ffcb00" stroke="#000" stroke-width="0.04"/></svg>',
} as const;
---

<section class="about-section" aria-labelledby="about-hero-title">
  <!-- 01 HERO SPLIT -->
  <div class="abt-hero">
    <div class="abt-hero__left">
      <div>
        <div class="abt-eyebrow">{t('about.hero.eyebrow')}</div>
        <h1 id="about-hero-title" class="abt-hero__title">
          {t('about.hero.titlePre')}<span class="abt-gold">{t('about.hero.titleAccent')}</span>{t('about.hero.titlePost')}
        </h1>
        <p class="abt-hero__body">{t('about.hero.body1')}</p>
        <p class="abt-hero__body">{t('about.hero.body2')}</p>
        <div class="abt-hero__cta">
          <a class="abt-btn abt-btn--primary" href={servicesHref}>
            {t('about.hero.ctaServices')} <span class="abt-btn__arrow" aria-hidden="true">→</span>
          </a>
          <a class="abt-btn" href={contactHref}>{t('about.hero.ctaContact')}</a>
        </div>
      </div>
      <div class="abt-hero__values">{t('about.hero.values')}</div>
    </div>
    <div class="abt-hero__right">
      <div class="abt-hero__placeholder" aria-hidden="true"></div>
      <div class="abt-hero__caption">{t('about.hero.caption')}</div>
    </div>
  </div>

  <!-- 02 HISTORIA -->
  <div class="abt-historia" id="historia">
    <h2 class="abt-historia__title">[historia placeholder — Task 8]</h2>
  </div>

  <!-- 03 EQUIPO -->
  <div class="abt-team" id="equipo">
    <div class="abt-team__head">[equipo placeholder — Task 9]</div>
  </div>

  <!-- 04 PRESENCIA -->
  <div class="abt-presencia" id="presencia">
    <div>[presencia placeholder — Task 10]</div>
  </div>

  <!-- 05 CIERRE -->
  <div class="abt-closing">
    <div>[manifesto placeholder — Task 10]</div>
  </div>
</section>

<style>
  .about-section {
    --abt-gold: var(--color-ph-gold);
    --abt-ink: var(--color-ph-white);
    --abt-ink-soft: var(--color-ph-white-80);
    --abt-ink-faint: var(--color-ph-white-60);
    --abt-line: var(--color-ph-white-10);
    --abt-line-strong: var(--color-ph-white-20);
    --abt-bg: transparent;
    --abt-bg-2: rgba(255, 255, 255, 0.02);
    --edge: var(--ph-section-px);

    position: relative;
    background: var(--abt-bg);
    color: var(--abt-ink);
  }

  /* Gold accent — color+weight only, never italic. */
  .about-section .abt-gold {
    color: var(--abt-gold);
    font-weight: 700;
    font-style: normal;
  }

  /* Shared eyebrow pattern (mono). */
  .about-section .abt-eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--abt-gold);
  }

  /* ── 01 HERO SPLIT ── */
  .abt-hero {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    min-height: 80vh;
    border-bottom: 1px solid var(--abt-line);
    padding-top: calc(var(--nav-h, 72px) + clamp(60px, 10vw, 120px));
  }
  .abt-hero__left {
    padding: clamp(20px, 3vw, 40px) var(--edge) clamp(60px, 8vw, 100px);
    display: flex;
    flex-direction: column;
    gap: 28px;
    justify-content: space-between;
  }
  .abt-hero__title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(40px, 6vw, 84px);
    letter-spacing: -0.02em;
    line-height: 1.02;
    margin: 18px 0 24px;
  }
  .abt-hero__body {
    color: var(--abt-ink-soft);
    font-size: 16px;
    line-height: 1.7;
    max-width: 480px;
    margin: 0 0 14px;
  }
  .abt-hero__cta {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .abt-hero__values {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-ink-faint);
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }
  .abt-hero__right {
    position: relative;
    overflow: hidden;
    border-left: 1px solid var(--abt-line);
  }
  .abt-hero__placeholder {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 70% 30%, rgba(214, 178, 94, 0.08) 0%, transparent 60%),
      linear-gradient(180deg, #0e0e0e 0%, #181818 100%);
  }
  .abt-hero__placeholder::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.02) 0px,
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 3px
    );
    mix-blend-mode: overlay;
    pointer-events: none;
  }
  .abt-hero__caption {
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--abt-ink);
    letter-spacing: 0.2em;
    background: rgba(14, 14, 14, 0.65);
    padding: 6px 10px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Minimal button styles — will be refined or aliased to ph-ui-buttons.css. */
  .abt-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 1px solid var(--abt-line-strong);
    color: var(--abt-ink);
    text-decoration: none;
    font-family: var(--font-body);
    font-size: 14px;
    letter-spacing: 0.02em;
    transition: background 200ms var(--ease-ph, ease), color 200ms var(--ease-ph, ease);
  }
  .abt-btn:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  .abt-btn--primary {
    background: var(--abt-gold);
    color: var(--color-ph-black, #0d0f12);
    border-color: var(--abt-gold);
  }
  .abt-btn--primary:hover {
    background: #e2c374;
    border-color: #e2c374;
  }
  .abt-btn__arrow {
    transition: transform 200ms var(--ease-ph, ease);
  }
  .abt-btn:hover .abt-btn__arrow {
    transform: translateX(3px);
  }

  @media (max-width: 900px) {
    .abt-hero {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .abt-hero__right {
      aspect-ratio: 4 / 5;
      border-left: none;
      border-bottom: 1px solid var(--abt-line);
      order: -1;
    }
    .abt-hero__left {
      padding-top: 40px;
    }
  }

  /* Placeholder sections (replaced in later tasks). */
  .abt-historia,
  .abt-team,
  .abt-presencia,
  .abt-closing {
    padding: clamp(72px, 10vw, 140px) var(--edge);
    border-bottom: 1px solid var(--abt-line);
  }
  .abt-closing {
    border-bottom: none;
  }
</style>
```

This replaces the entire file including the prior GSAP script.

- [ ] **Step 2: Verify build + dev**

Run: `npm run check`
Expected: no new TS errors (pre-existing baseline unchanged).

Run: `npm run build`
Expected: success.

Restart dev server (Astro picks up the new component). Run:

```bash
curl -sS http://localhost:4321/sobre-nosotros | grep -o 'Representar con.*propósito'
```

Expected: `Representar con <span class="abt-gold">propósito` (or similar — verify the span renders).

Open `http://localhost:4321/sobre-nosotros` in browser:
- Hero split visible: left = eyebrow + H1 + 2 paragraphs + two CTAs + `EXCELENCIA · CERCANÍA · RIGOR` at bottom.
- Right = dark gradient placeholder with caption `PHSPORT · SEDE MADRID` bottom-right.
- Below hero: four placeholder blocks with `[historia placeholder — Task 8]` etc.
- Mobile (<900px): hero stacks with placeholder on top (`aspect-ratio: 4/5`).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/AboutSection.astro
git commit -m "feat(about-v3): scaffold new AboutSection + hero split

Rewrite AboutSection.astro to the five-block structure. Hero split is
fully implemented (two-column, placeholder right, EXCELENCIA values
line, dual CTAs). Historia/equipo/presencia/manifesto render as visible
placeholders and are built out in the next four tasks. Old 01/02/03
editorial block and its GSAP script are removed — obsolete i18n keys
stay until Task 12.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: AboutSection — historia block with dropcap

**Files:**
- Modify: `src/components/sections/AboutSection.astro`

Goal: replace the historia placeholder with the full 2-column editorial block — title on the left with two gold accents (`presente`, `futuro`), 4-paragraph body on the right in 2 CSS columns, dropcap on `p1`.

- [ ] **Step 1: Replace the historia block markup**

In `AboutSection.astro`, locate the historia `<div>`:

```astro
  <!-- 02 HISTORIA -->
  <div class="abt-historia" id="historia">
    <h2 class="abt-historia__title">[historia placeholder — Task 8]</h2>
  </div>
```

Replace with:

```astro
  <!-- 02 HISTORIA -->
  <div class="abt-historia" id="historia">
    <h2 class="abt-historia__title">
      {t('about.historia.titlePre')}<span class="abt-gold">{t('about.historia.titleAccent1')}</span>{t('about.historia.titleMid')}<span class="abt-gold">{t('about.historia.titleAccent2')}</span>{t('about.historia.titlePost')}
    </h2>
    <div class="abt-historia__body">
      <p>{t('about.historia.p1')}</p>
      <p>{t('about.historia.p2')}</p>
      <p>{t('about.historia.p3')}</p>
      <p>{t('about.historia.p4')}</p>
    </div>
  </div>
```

- [ ] **Step 2: Add historia-specific styles**

In the `<style>` block of `AboutSection.astro`, locate the "Placeholder sections" group near the bottom. Before that comment, insert the following historia styles:

```css
  /* ── 02 HISTORIA ── */
  .abt-historia {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: clamp(32px, 6vw, 80px);
    padding: clamp(72px, 10vw, 140px) var(--edge);
    border-bottom: 1px solid var(--abt-line);
  }
  .abt-historia__title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(32px, 4.5vw, 52px);
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin: 12px 0 0;
  }
  .abt-historia__body {
    column-count: 2;
    column-gap: 40px;
  }
  .abt-historia__body p {
    margin: 0 0 14px;
    color: var(--abt-ink-soft);
    line-height: 1.7;
    font-size: 15px;
  }
  .abt-historia__body p:first-child::first-letter {
    font-family: var(--font-display);
    font-weight: 700;
    font-style: normal;
    float: left;
    font-size: 72px;
    line-height: 0.85;
    padding: 6px 12px 0 0;
    color: var(--abt-gold);
  }

  @media (max-width: 900px) {
    .abt-historia {
      grid-template-columns: 1fr;
    }
    .abt-historia__body {
      column-count: 1;
    }
  }
```

Then remove `.abt-historia,` from the "Placeholder sections" selector group (the historia now has its own explicit rules). Updated placeholder block:

```css
  /* Placeholder sections (replaced in later tasks). */
  .abt-team,
  .abt-presencia,
  .abt-closing {
    padding: clamp(72px, 10vw, 140px) var(--edge);
    border-bottom: 1px solid var(--abt-line);
  }
  .abt-closing {
    border-bottom: none;
  }
```

- [ ] **Step 3: Verify build + dev**

Run: `npm run check` → no new errors.
Run: `npm run build` → success.

In browser on `http://localhost:4321/sobre-nosotros`:
- Historia section shows two-column layout: title on left ("Gestionamos tu carrera..." with "presente" and "futuro" in gold bold), 4 paragraphs on right split into 2 CSS columns.
- Paragraph 1 starts with a large gold `P` (dropcap) floated to the left.
- Mobile: collapses to single column; dropcap preserved.

Also verify `/en/about`: dropcap should show gold `P` ("PHSPORT represents..."), title reads "We manage your career. We look after your present and plan your future." with gold "present" and "future".

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/AboutSection.astro
git commit -m "feat(about-v3): historia block with dropcap and dual-accent title

Two-column editorial layout for the historia section: left = title
with gold 'presente'/'futuro' accents (via .abt-gold spans, no italic),
right = 4-paragraph body in CSS columns. First paragraph gets a
72px gold dropcap (Söhne 700, no italic). Mobile collapses to single
column.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: AboutSection — equipo editorial table

**Files:**
- Modify: `src/components/sections/AboutSection.astro`

Goal: replace the equipo placeholder with the full 21-row editorial table — header row (eyebrow + title + meta), 3-column grid, per-row hover with gold tint and name color change, mobile collapse to stacked layout.

- [ ] **Step 1: Replace the equipo block markup**

Locate the equipo `<div>`:

```astro
  <!-- 03 EQUIPO -->
  <div class="abt-team" id="equipo">
    <div class="abt-team__head">[equipo placeholder — Task 9]</div>
  </div>
```

Replace with:

```astro
  <!-- 03 EQUIPO -->
  <div class="abt-team" id="equipo" aria-labelledby="about-team-title">
    <div class="abt-team__head">
      <div>
        <div class="abt-eyebrow" style="color: var(--abt-gold);">{t('about.team.eyebrow')}</div>
        <h2 id="about-team-title" class="abt-team__title">
          {t('about.team.titlePre')}<span class="abt-gold">{t('about.team.titleAccent')}</span>{t('about.team.titlePost')}
        </h2>
      </div>
      <div class="abt-team__meta">{t('about.team.meta')}</div>
    </div>

    <div class="abt-team-table" role="list">
      {teamMembers.map((m) => (
        <div class="abt-team-row" role="listitem" data-id={m.id}>
          <span class="abt-team-row__idx">{m.index}</span>
          <div class="abt-team-row__name">
            <span class="abt-team-row__name-text">{m.name}</span>
            <span class="abt-team-row__mobile-extras">
              <span>{m.role}</span>
              {m.country && <span>· {m.country}</span>}
            </span>
          </div>
          <span class="abt-team-row__role">{m.role}</span>
          <span class="abt-team-row__flag">
            {m.nationality ? (
              <Fragment>
                <span class="abt-team-row__flag-svg" set:html={FLAGS[m.nationality]} />
                <span>{m.country?.toUpperCase()}</span>
              </Fragment>
            ) : (
              <span class="abt-team-row__flag-muted">{m.defaultLocation}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  </div>
```

- [ ] **Step 2: Add equipo styles**

Insert before the "Placeholder sections" group:

```css
  /* ── 03 EQUIPO ── */
  .abt-team {
    padding: clamp(72px, 10vw, 140px) var(--edge);
    border-bottom: 1px solid var(--abt-line);
  }
  .abt-team__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: clamp(32px, 5vw, 64px);
  }
  .abt-team__title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(36px, 5vw, 64px);
    letter-spacing: -0.02em;
    margin: 10px 0 0;
    line-height: 1;
  }
  .abt-team__meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-ink-faint);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .abt-team-table {
    border-top: 1px solid var(--abt-line-strong);
  }
  .abt-team-row {
    display: grid;
    grid-template-columns: 60px 1.4fr 1.2fr;
    gap: 24px;
    align-items: center;
    padding-block: clamp(18px, 2.5vw, 28px);
    border-bottom: 1px solid var(--abt-line);
    transition: padding 300ms var(--ease-ph, ease), background 300ms var(--ease-ph, ease);
  }
  @media (hover: hover) {
    .abt-team-row:hover {
      padding-inline: 18px;
      background: rgba(201, 164, 90, 0.04);
    }
    .abt-team-row:hover .abt-team-row__name-text {
      color: var(--abt-gold);
    }
  }
  .abt-team-row__idx {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-ink-faint);
    letter-spacing: 0.15em;
  }
  .abt-team-row__name-text {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(22px, 2.4vw, 34px);
    letter-spacing: -0.02em;
    line-height: 1.1;
    transition: color 300ms var(--ease-ph, ease);
  }
  .abt-team-row__role {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-ink-soft);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .abt-team-row__flag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-ink-soft);
    letter-spacing: 0.1em;
  }
  .abt-team-row__flag-svg {
    display: inline-block;
    width: 22px;
    height: 14px;
  }
  .abt-team-row__flag-svg svg {
    width: 100%;
    height: 100%;
    border-radius: 2px;
    box-shadow: 0 0 0 1px var(--abt-line-strong);
    display: block;
  }
  .abt-team-row__flag-muted {
    color: var(--abt-ink-faint);
    opacity: 0.5;
  }
  .abt-team-row__mobile-extras {
    display: none;
  }

  @media (max-width: 900px) {
    .abt-team-row {
      grid-template-columns: 40px 1fr;
      gap: 10px;
      padding-block: 18px;
    }
    .abt-team-row__role,
    .abt-team-row__flag {
      display: none;
    }
    .abt-team-row__name {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .abt-team-row__mobile-extras {
      display: flex;
      gap: 10px;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--abt-ink-soft);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-style: normal;
    }
  }
```

Then remove `.abt-team,` from the "Placeholder sections" selector group. Remaining placeholder block:

```css
  /* Placeholder sections (replaced in later tasks). */
  .abt-presencia,
  .abt-closing {
    padding: clamp(72px, 10vw, 140px) var(--edge);
    border-bottom: 1px solid var(--abt-line);
  }
  .abt-closing {
    border-bottom: none;
  }
```

- [ ] **Step 3: Verify build + dev**

Run: `npm run check` → no new errors.
Run: `npm run build` → success.

In browser on `http://localhost:4321/sobre-nosotros`:
- Equipo section header shows `EL EQUIPO` (gold eyebrow) + `Las personas detrás.` (with `personas` in gold) + `21 INTEGRANTES · 6 PAÍSES` right-aligned.
- 21 rows below, each with index `01`–`21`, name, role (uppercase mono), and flag/country column.
- Pedro Canoa row shows a PT flag + `PH PORTUGAL`; Ángel Castell shows ES flag + `PH ARABIA`; Spanish-only members show muted `ESPAÑA` text.
- Hover over a row: padding expands horizontally, faint gold tint appears, name turns gold.
- Mobile (<900px): grid collapses to `40px 1fr`; role and flag columns hidden; name + role + country shown stacked with mono metadata.

In `/en/about`: meta reads `21 MEMBERS · 6 COUNTRIES`, title `The people behind it.`, Castell row shows `PH ARABIA`, Spanish-only rows show `SPAIN`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/AboutSection.astro
git commit -m "feat(about-v3): equipo editorial table with 21 real integrantes

Three-column grid table (index · name+role · flag+country). Rows
driven by getTeamMembers(lang) with inline ES/PT flag SVGs. Hover
state: gold tint background, horizontal padding expand, name color
shifts to gold. Mobile stacks name + role + country in mono.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: AboutSection — presencia + cierre manifesto

**Files:**
- Modify: `src/components/sections/AboutSection.astro`

Goal: replace both remaining placeholders (presencia + cierre manifesto) in one task since they're compact.

- [ ] **Step 1: Replace presencia block markup**

Locate:

```astro
  <!-- 04 PRESENCIA -->
  <div class="abt-presencia" id="presencia">
    <div>[presencia placeholder — Task 10]</div>
  </div>
```

Replace with:

```astro
  <!-- 04 PRESENCIA -->
  <div class="abt-presencia" id="presencia" aria-labelledby="about-presencia-title">
    <div class="abt-presencia__eyebrow-row">
      <div class="abt-eyebrow">{t('about.presencia.eyebrow')}</div>
    </div>
    <div class="abt-presencia__grid">
      <div class="abt-presencia__left">
        <h3 id="about-presencia-title" class="abt-presencia__madrid">
          {t('about.presencia.madridTitle')}
        </h3>
        <div class="abt-presencia__madrid-label">{t('about.presencia.madridLabel')}</div>
      </div>
      <div class="abt-presencia__right">
        <div class="abt-presencia__intl-label">{t('about.presencia.internationalLabel')}</div>
        <div class="abt-presencia__countries">
          {internationalCountries.map((c) => (
            <div class="abt-presencia__country">
              <span>{t(`about.presencia.country.${c.key}` as const)}</span>
              <span class="abt-presencia__iso">{c.iso}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
```

- [ ] **Step 2: Replace cierre block markup**

Locate:

```astro
  <!-- 05 CIERRE -->
  <div class="abt-closing">
    <div>[manifesto placeholder — Task 10]</div>
  </div>
```

Replace with:

```astro
  <!-- 05 CIERRE MANIFESTO -->
  <div class="abt-closing">
    <h2 class="abt-closing__quote">
      {t('about.manifesto.quotePre')}
      <br />
      <span class="abt-gold">{t('about.manifesto.quoteAccent')}</span>{t('about.manifesto.quotePost')}
    </h2>
    <div class="abt-closing__sig">{t('about.manifesto.sig')}</div>
  </div>
```

- [ ] **Step 3: Add presencia + cierre styles**

Remove the entire "Placeholder sections" block from `<style>`. Insert these two blocks in its place:

```css
  /* ── 04 PRESENCIA ── */
  .abt-presencia {
    padding: clamp(60px, 9vw, 100px) var(--edge);
    border-bottom: 1px solid var(--abt-line);
  }
  .abt-presencia__eyebrow-row {
    margin-bottom: 32px;
  }
  .abt-presencia__grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: clamp(40px, 6vw, 80px);
    align-items: end;
    border-top: 1px solid var(--abt-line);
    padding-top: clamp(32px, 4vw, 48px);
  }
  .abt-presencia__madrid {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(36px, 5vw, 56px);
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
  }
  .abt-presencia__madrid-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--abt-ink-faint);
    text-transform: uppercase;
    margin-top: 12px;
  }
  .abt-presencia__intl-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--abt-ink-faint);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .abt-presencia__countries {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .abt-presencia__country {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--abt-ink);
    border-bottom: 1px solid var(--abt-line);
    padding-bottom: 6px;
  }
  .abt-presencia__iso {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-gold);
    letter-spacing: 0.15em;
  }

  @media (max-width: 900px) {
    .abt-presencia__grid {
      grid-template-columns: 1fr;
      align-items: stretch;
      gap: 32px;
    }
    .abt-presencia__madrid {
      font-size: 40px;
    }
  }

  /* ── 05 CIERRE MANIFESTO ── */
  .abt-closing {
    padding: clamp(80px, 12vw, 160px) var(--edge);
    text-align: center;
    background: var(--abt-bg-2);
  }
  .abt-closing__quote {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(36px, 6vw, 72px);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 auto;
    max-width: 900px;
    color: var(--abt-ink);
  }
  .abt-closing__sig {
    margin-top: 28px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--abt-ink-faint);
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }
```

- [ ] **Step 4: Verify build + dev**

Run: `npm run check` → no new errors.
Run: `npm run build` → success.

Browser `/sobre-nosotros`:
- Presencia section: eyebrow `05 · Presencia` on top, below it a 2-column grid — left `Madrid.` with `SEDE CENTRAL · ES` muted label; right `PRESENCIA INTERNACIONAL` label + 5 rows (Portugal/PT, Reino Unido/UK, Alemania/DE, Arabia Saudí/KSA, Uruguay/UY), country name left / ISO code gold mono right.
- Cierre: centered manifesto quote with `Construimos estructuras` in gold-bold, signature below in mono muted.
- Mobile: presencia stacks vertically with Madrid on top, Madrid scales down to 40px.

In `/en/about`: presencia shows `HEADQUARTERS · ES`, `INTERNATIONAL PRESENCE`, countries as `Portugal / PT`, `United Kingdom / UK`, `Germany / DE`, `Saudi Arabia / KSA`, `Uruguay / UY`. Cierre quote in EN with `We build structures` in gold.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/AboutSection.astro
git commit -m "feat(about-v3): presencia (subtle) + cierre manifesto blocks

Presencia block: v2-sutil layout — Madrid on the left (56px, no
address/phone), 5-country international list on the right with ISO
codes in gold mono. Mobile stacks Madrid on top at 40px.
Cierre block: centered manifesto quote with 'Construimos estructuras'
in gold-bold, signature in mono muted. All five blocks now render
final content.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: AboutSection — GSAP animations script

**Files:**
- Modify: `src/components/sections/AboutSection.astro`

Goal: add the scroll-triggered animation script bound to `astro:page-load`, mirroring the existing Phase 1/2 GSAP patterns and gracefully handling `reduced-motion`.

- [ ] **Step 1: Append `<script>` block to the component**

At the end of `src/components/sections/AboutSection.astro`, after the closing `</style>`, add:

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import {
    reducedMotion,
    wrapWords,
    splitWords,
    trackingReveal,
  } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initAboutAnimations(): void {
    const section = document.querySelector<HTMLElement>('.about-section');
    if (!section) return;

    if (reducedMotion()) {
      // Ensure all content is visible without animating.
      section.querySelectorAll<HTMLElement>('.abt-team-row').forEach((r) => {
        r.style.opacity = '1';
        r.style.transform = 'none';
      });
      return;
    }

    // ── Hero ──
    const heroEyebrow = section.querySelector<HTMLElement>('.abt-hero .abt-eyebrow');
    if (heroEyebrow) trackingReveal(heroEyebrow, { trigger: heroEyebrow, start: 'top 88%', once: true });

    const heroTitle = section.querySelector<HTMLElement>('.abt-hero__title');
    if (heroTitle) {
      const words = wrapWords(heroTitle);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.85,
        stagger: 0.07,
        ease: 'power4.out',
        scrollTrigger: { trigger: heroTitle, start: 'top 82%', once: true },
      });
    }

    section.querySelectorAll<HTMLElement>('.abt-hero__body').forEach((body) => {
      const spans = splitWords(body);
      gsap.from(spans, {
        opacity: 0,
        filter: 'blur(6px)',
        y: 6,
        duration: 0.6,
        stagger: 0.025,
        ease: 'power2.out',
        scrollTrigger: { trigger: body, start: 'top 88%', once: true },
      });
    });

    const heroCtas = section.querySelectorAll<HTMLElement>('.abt-hero__cta .abt-btn');
    if (heroCtas.length) {
      gsap.from(heroCtas, {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: heroCtas[0], start: 'top 92%', once: true },
      });
    }

    const heroValues = section.querySelector<HTMLElement>('.abt-hero__values');
    if (heroValues) trackingReveal(heroValues, { trigger: heroValues, start: 'top 92%', once: true });

    // ── Historia ──
    const historiaTitle = section.querySelector<HTMLElement>('.abt-historia__title');
    if (historiaTitle) {
      const words = wrapWords(historiaTitle);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power4.out',
        scrollTrigger: { trigger: historiaTitle, start: 'top 82%', once: true },
      });
    }
    section.querySelectorAll<HTMLElement>('.abt-historia__body p').forEach((p) => {
      const spans = splitWords(p);
      gsap.from(spans, {
        opacity: 0,
        filter: 'blur(6px)',
        y: 5,
        duration: 0.55,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 88%', once: true },
      });
    });

    // ── Equipo ──
    const teamEyebrow = section.querySelector<HTMLElement>('.abt-team .abt-eyebrow');
    if (teamEyebrow) trackingReveal(teamEyebrow, { trigger: teamEyebrow, start: 'top 88%', once: true });

    const teamTitle = section.querySelector<HTMLElement>('.abt-team__title');
    if (teamTitle) {
      const words = wrapWords(teamTitle);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power4.out',
        scrollTrigger: { trigger: teamTitle, start: 'top 82%', once: true },
      });
    }

    const teamMeta = section.querySelector<HTMLElement>('.abt-team__meta');
    if (teamMeta) trackingReveal(teamMeta, { trigger: teamMeta, start: 'top 92%', once: true });

    const teamTable = section.querySelector<HTMLElement>('.abt-team-table');
    const teamRows = section.querySelectorAll<HTMLElement>('.abt-team-row');
    if (teamTable && teamRows.length) {
      gsap.set(teamRows, { opacity: 0, y: 14 });
      gsap.to(teamRows, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: { each: 0.04, from: 'start' },
        ease: 'power3.out',
        scrollTrigger: { trigger: teamTable, start: 'top 88%', once: true },
        onComplete: () => {
          gsap.set(teamRows, { clearProps: 'opacity,transform' });
        },
      });
      // Safety net — ensure rows are visible even if ScrollTrigger misfires.
      window.setTimeout(() => {
        teamRows.forEach((r) => {
          r.style.opacity = '1';
          r.style.transform = 'none';
        });
      }, 2200);
    }

    // ── Presencia ──
    const presenciaEyebrow = section.querySelector<HTMLElement>('.abt-presencia .abt-eyebrow');
    if (presenciaEyebrow) trackingReveal(presenciaEyebrow, { trigger: presenciaEyebrow, start: 'top 92%', once: true });

    const presenciaLeft = section.querySelector<HTMLElement>('.abt-presencia__left');
    const presenciaRight = section.querySelector<HTMLElement>('.abt-presencia__right');
    if (presenciaLeft && presenciaRight) {
      gsap.from([presenciaLeft, presenciaRight], {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: presenciaLeft, start: 'top 88%', once: true },
      });
    }

    // ── Cierre ──
    const closingQuote = section.querySelector<HTMLElement>('.abt-closing__quote');
    if (closingQuote) {
      const words = wrapWords(closingQuote);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.85,
        stagger: 0.05,
        ease: 'power4.out',
        scrollTrigger: { trigger: closingQuote, start: 'top 82%', once: true },
      });
    }
    const closingSig = section.querySelector<HTMLElement>('.abt-closing__sig');
    if (closingSig) trackingReveal(closingSig, { trigger: closingSig, start: 'top 92%', once: true });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initAboutAnimations);
</script>
```

- [ ] **Step 2: Verify build + dev**

Run: `npm run check` → no new errors.
Run: `npm run build` → success.

In browser on `http://localhost:4321/sobre-nosotros`:
- Page load: hero eyebrow → title words slide up → body paragraphs blur-fade → CTAs slide up → values tagline tracks in.
- Scroll down to historia: title slides up, paragraphs blur-fade word by word (dropcap is in the fade, visible but not animated separately).
- Scroll to equipo: header animates; 21 rows stagger-fade-up from bottom.
- Scroll to presencia: two columns fade-up.
- Scroll to cierre: manifesto title word-cascade, signature tracks in.
- All animations run once (`once: true`).
- In DevTools with `prefers-reduced-motion: reduce` enabled in emulation: no animations run; all content visible on load.

Test on `/en/about` as well — same behavior with EN content.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/AboutSection.astro
git commit -m "feat(about-v3): GSAP animations for all five About blocks

Scroll-triggered animations mirroring Phase 1/2 patterns: hero
(trackingReveal + wrapWords slide + splitWords blur-fade + CTA
stagger), historia (title wrapWords + paragraph blur), equipo
(header + 21-row fade-up stagger with 2.2s safety fallback),
presencia (two-column fade-up), cierre (quote wrapWords + signature
trackingReveal). Reduced-motion short-circuit makes everything
visible without animating.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: Cleanup — delete obsolete files and i18n keys

**Files:**
- Delete: `src/components/sections/TeamSection.astro`
- Delete: `src/pages/equipo.astro`
- Delete: `src/pages/en/team.astro`
- Delete (conditional): `src/scripts/player-modal.ts`
- Modify: `src/i18n/es.ts` (drop obsolete keys)
- Modify: `src/i18n/en.ts` (drop obsolete keys)

Goal: remove all code and copy that the new About page replaces. The redirect config from Task 3 already intercepts `/equipo` and `/en/team`, so deleting the page files is safe.

- [ ] **Step 1: Verify TeamSection has no other importers**

Run: `grep -rn "from '@/components/sections/TeamSection'" src/ || echo "no other importers"`
Expected: only `src/pages/equipo.astro` and `src/pages/en/team.astro` reference it (and those are both deleted in this task).

- [ ] **Step 2: Verify player-modal consumers**

Run: `grep -rn "from '@/scripts/player-modal'" src/ || echo "no importers"`
Expected: at minimum `src/components/sections/TeamSection.astro` imports it. Also check for `HomePlayersSection`, `TalentsSection`, or `HomeInstagramSection`:

```bash
grep -rn "player-modal\|initPlayerModal" src/ | grep -v TeamSection.astro
```

If the only match is TeamSection (being deleted), delete `player-modal.ts`. If any other file references it, keep it.

- [ ] **Step 3: Delete files**

```bash
rm src/components/sections/TeamSection.astro
rm src/pages/equipo.astro
rm src/pages/en/team.astro
```

If Step 2 confirmed no other consumers:

```bash
rm src/scripts/player-modal.ts
```

Otherwise skip the `player-modal.ts` deletion.

- [ ] **Step 4: Remove obsolete ES i18n keys**

In `src/i18n/es.ts`, delete these 8 keys from the `// --- Sobre nosotros ---` block:

```ts
  'about.block1.title': 'Now.',
  'about.block1.body': 'Gestionamos el día a día de cada jugador con atención personalizada. Contratos, imagen, rendimiento.',
  'about.block2.title': 'Next.',
  'about.block2.body': 'Planificamos la carrera a medio y largo plazo. Cada fichaje es un paso estratégico, no una oportunidad aislada.',
  'about.block3.title': 'Forever Football.',
  'about.block3.body': 'El fútbol es nuestra pasión y nuestro compromiso. Acompañamos a los jugadores más allá de su etapa profesional.',
```

And from the `// --- Equipo (página) ---` block:

```ts
  'team.placeholderName': 'Por definir',
  'team.placeholderRole': 'Rol',
```

Keep `about.title`, `about.subtitle`, `team.title`, `team.subtitle` (still used by page shells and/or meta).

- [ ] **Step 5: Remove obsolete EN i18n keys (parity)**

In `src/i18n/en.ts`, delete the same 8 keys (translated equivalents). Use grep to locate them:

```bash
grep -n "about.block\|team.placeholder" src/i18n/en.ts
```

Delete exactly those lines.

- [ ] **Step 6: Verify build**

Run: `npm run check`
Expected: no new errors. The pre-existing `TeamSection.astro:136` Timeout type error is GONE (file deleted). The `HomeInstagramSection` i18n errors and `Button.astro` type error remain as pre-existing baseline (they'll be resolved in Phase 5).

Run: `npm run build`
Expected: success; page count drops to 240 (was 242 before Phase 3; -2 from deleted equipo/team pages, redirects don't add build pages).

- [ ] **Step 7: Full manual validation pass**

Open dev server and verify all cases from the spec §6 testing plan:

- `/sobre-nosotros` — five blocks render with 21 real members, dropcap, hover states, GSAP animations, reduced-motion fallback.
- `/en/about` — same in EN with translated copy.
- `/equipo` — returns 301, lands at `/sobre-nosotros#equipo`, browser scrolls to team block.
- `/en/team` — returns 301, lands at `/en/about#equipo`.
- Mobile responsive at 375px, 768px, 1024px viewports.
- Reduced motion via DevTools rendering tab.
- Keyboard nav on hero CTAs.
- Direct deep link: `http://localhost:4321/sobre-nosotros#equipo` scrolls to team block on load.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(about-v3): delete TeamSection + old team pages + obsolete keys

Remove all code the About V3 redesign replaces:
- src/components/sections/TeamSection.astro (placeholder grid + modal)
- src/pages/equipo.astro and src/pages/en/team.astro (replaced by
  301 redirects from Task 3)
- src/scripts/player-modal.ts (only if no other consumer)
- 8 obsolete i18n keys (about.block1-3, team.placeholder*) from
  both es.ts and en.ts

The pre-existing Timeout type error in TeamSection also goes away
as a side effect. HomeInstagramSection i18n errors remain — Phase 5
target.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Post-plan checklist (controller responsibility)

After Task 12 commits:

1. Run `git log --oneline` on the branch — expect 11 commits (Tasks 2–12; Task 1 has no commit).
2. Dispatch the final `superpowers:code-reviewer` agent for a full-branch review before merging.
3. Use `superpowers:finishing-a-development-branch` to handle the merge-to-main.

**Branch name:** `feat/sobre-nosotros-redesign-v3`
**Base:** `main` (at `7bd6299`).

---

## Notes on deviations

- **No automated tests.** The project has no UI test infrastructure. Validation is manual via dev server + `npm run check` + `npm run build`. This plan treats "build green + visual spot check" as the task gate.
- **Redirect syntax fallback.** If the Astro version installed doesn't support the object form `{ status, destination }`, fall back to the string form and document in the Task 3 commit. Hosting layer (Vercel/Netlify/etc.) may override status at deploy time.
- **`player-modal.ts` conditional.** Keep it only if other sections depend on it; verify via grep in Task 12.
