# About Redesign V3 — Design Spec

**Goal:** Replace the current `/sobre-nosotros/` and `/en/about/` pages (currently rendering the 01/02/03 `AboutSection`) with a new editorial layout that matches the Claude Design bundle (`sobre-nosotros.html`), and absorb the `/equipo/` and `/en/team/` routes via 301 redirects into an `#equipo` anchor on the new About page. Delete `TeamSection.astro` and the old team pages.

**Source of truth:** `.design-ref/handoff-unpacked/wf-web-phsport/project/sobre-nosotros.html` (unpacked locally from the handoff zip; not committed beyond the `.design-ref/` folder already tracked).

**Scope boundaries**

- **IN:** Rewrite of `AboutSection.astro` (monolithic, matching the design's five blocks); new `src/lib/teamMembers.ts` data module; i18n changes in `es.ts`/`en.ts` (add new `about.*` and expanded `team.*` keys, drop obsolete 01/02/03 keys and team placeholder keys); 301 redirects for `/equipo` and `/en/team`; deletion of `TeamSection.astro`, `src/pages/equipo.astro`, `src/pages/en/team.astro`; conditional deletion of `src/scripts/player-modal.ts` if unused elsewhere; addition of `--font-mono` global token.
- **OUT (later phases):** Real hero image (stays CSS placeholder — radial gradient + grain + mono caption); footer restyle (Phase 5); `HomeAboutSection.astro` — the Home page's compact About hint stays untouched; `HomeInstagramSection.astro` deletion (Phase 5).

---

## 1 — Page structure

The page renders as a single `AboutSection.astro` component composed of five vertical blocks, inside `BaseLayout` (existing header + footer).

```
01  Hero split           (text left + placeholder right, grid 1.1fr 1fr, min 80vh)
02  Historia             (title + 4-paragraph body with dropcap, grid 1fr 2fr)
03  Equipo               (editorial table, 21 rows, hover gold tint)  [#equipo anchor]
04  Presencia            (v2 sutil: Madrid left + 5 countries list right)
05  Cierre manifesto     (large centered quote + mono signature)
```

Anchor IDs on the page: `#historia`, `#equipo`, `#presencia`.

**Gold accent rendering (global rule).** All gold accents in titles (`propósito`, `presente`, `futuro`, `personas`, `Construimos estructuras`, and EN equivalents) are wrapped in a `<span class="abt-gold">` at render time (concatenating the `titlePre`/`titleAccent`/`titlePost` i18n fragments). The CSS resets any inherited italic and applies color + weight only:

```css
.abt-gold {
  color: var(--abt-gold);
  font-weight: 700;
  font-style: normal;
}
```

Do NOT use `<em>` for these accents — Söhne has no italic variant, and using `<em>` risks inherited italic styling from global `em` rules. The spec's copy tables use `<em>` notation purely as a readability convention for marking which substring is the accent.

### 1.1 — Hero split

Two-column editorial grid `1.1fr 1fr`, `min-height: 80vh`, `border-bottom: 1px solid var(--abt-line)`.

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `04 · Sobre nosotros` | `04 · About us` |
| title (HTML) | `Representar con <em>propósito</em>.` | `Representing with <em>purpose</em>.` |
| body1 | `PHSPORT es una agencia de fútbol que construye y protege la carrera de los futbolistas a través de una representación estratégica, visión internacional y enfoque a largo plazo.` | `PHSPORT is a football agency that builds and protects players' careers through strategic representation, international reach, and long-term focus.` |
| body2 | `Más que representar jugadores, desarrollamos estructuras integrales que acompañan al jugador en todas las áreas clave de su carrera — dentro y fuera del campo.` | `More than representing players, we develop integral structures that support the player across every key area of their career — on and off the pitch.` |
| ctaServices | `Nuestros servicios` | `Our services` |
| ctaContact | `Contactar` | `Get in touch` |
| values | `EXCELENCIA · CERCANÍA · RIGOR` | `EXCELLENCE · CLOSENESS · RIGOR` |
| heroCaption | `PHSPORT · SEDE MADRID` | `PHSPORT · MADRID HQ` |

Typography: h1 `clamp(40px, 6vw, 84px)`, Söhne 500–600, `letter-spacing: -0.02em`, `line-height: 1.02`. Gold accent on `propósito` / `purpose` via `.abt-gold` span (see global rule above). Paragraphs `15–16px`, `line-height: 1.7`, `max-width: 480px`, color `var(--abt-ink-soft)`. CTAs reuse existing `.btn` and `.btn.primary` from `ph-ui-buttons.css`; `ctaServices` primary, `ctaContact` secondary; services href = `/servicios` (ES) / `/en/services` (EN); contact href = `/#contacto` (ES) / `/en#contacto` (EN).

Right column: `position: relative; overflow: hidden; border-left: 1px solid var(--abt-line);`. Placeholder background: radial gradient `radial-gradient(ellipse at 70% 30%, rgba(214,178,94,0.08) 0%, transparent 60%), linear-gradient(180deg, #0e0e0e 0%, #181818 100%)`; CSS grain via `background-image: repeating-linear-gradient(...)` for subtle texture. Caption at bottom-right: mono 10px, tracking `0.2em`, color `var(--color-ph-white)`, bg `rgba(14,14,14,0.65)` + `backdrop-filter: blur(4px)`, padding `6px 10px`.

Responsive (< 900px): collapse to single column; right column moves to `order: -1` (above text), `aspect-ratio: 4/5`, `border-left: none; border-bottom: 1px solid var(--abt-line)`.

### 1.2 — Historia (dropcap)

Two-column editorial grid `1fr 2fr`, gap `clamp(32px, 6vw, 80px)`, `padding-block: clamp(72px, 10vw, 140px)`, `border-bottom: 1px solid var(--abt-line)`.

| Field | ES | EN |
| --- | --- | --- |
| title (HTML) | `Gestionamos tu carrera. Cuidamos tu <em>presente</em> y planificamos tu <em>futuro</em>.` | `We manage your career. We look after your <em>present</em> and plan your <em>future</em>.` |
| p1 | `PHSPORT representa futbolistas con proyección y les acompaña con una gestión integral, estratégica y personalizada para impulsar su crecimiento dentro y fuera del campo.` | `PHSPORT represents footballers with potential and supports them with integral, strategic, and personalized management to drive their growth on and off the pitch.` |
| p2 | `Trabajamos sobre cinco áreas clave: representación e intermediación, planificación de carrera, acceso a clubes y oportunidades internacionales, comunicación y marketing, y asesoramiento legal y financiero.` | `We work across five key areas: representation and intermediation, career planning, access to clubs and international opportunities, communication and marketing, and legal and financial advisory.` |
| p3 | `Más allá de la representación, desarrollamos una estructura de trabajo integral — prensa, media, psicología deportiva, rendimiento y family office — para acompañar cada etapa de la carrera del jugador.` | `Beyond representation, we build an integral working structure — press, media, sports psychology, performance, and family office — to support every stage of the player's career.` |
| p4 | `Servicio 365: disponibilidad y seguimiento continuo. Adaptación a cada etapa de la carrera. Soporte integral dentro y fuera del campo.` | `365 Service: continuous availability and follow-up. Adaptation at every career stage. Integral support on and off the pitch.` |

Typography: h2 `clamp(32px, 4.5vw, 52px)`, Söhne 500–600, `letter-spacing: -0.02em`, `line-height: 1.05`. Gold accents on `presente` / `futuro` (and `present` / `future`) via color-only emphasis.

Body column: `column-count: 2; column-gap: 40px;`. Paragraphs `15px`, `line-height: 1.7`, `margin: 0 0 14px`, color `var(--abt-ink-soft)`.

Dropcap on `p1`: selector `.abt-historia__body p:first-child::first-letter` — `float: left`, `font-size: 72px`, `line-height: 0.85`, `padding: 6px 12px 0 0`, `color: var(--abt-gold)`, `font-family: var(--font-display)`, `font-weight: 700`. No italic.

Responsive (< 900px): grid collapses to 1 column, `column-count: 1`, dropcap retained.

### 1.3 — Equipo (editorial table) — `id="equipo"`

Section padding `clamp(72px, 10vw, 140px) var(--edge)`, `border-bottom: 1px solid var(--abt-line)`. The section element gets `id="equipo"` and `aria-labelledby="equipo-heading"`.

**Header row** (flex `justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; margin-bottom: clamp(32px, 5vw, 64px)`):

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `EL EQUIPO` | `THE TEAM` |
| title (HTML) | `Las <em>personas</em> detrás.` | `The <em>people</em> behind it.` |
| meta | `21 INTEGRANTES · 6 PAÍSES` | `21 MEMBERS · 6 COUNTRIES` |

Title `clamp(36px, 5vw, 64px)`, Söhne 500–600, gold accent on `personas` / `people`. Eyebrow mono `11px`, gold, tracking `0.2em`. Meta mono `11px`, tracking `0.15em`, color `var(--abt-ink-faint)`.

**Table container** (`class="abt-team-table"`, `role="list"`): `border-top: 1px solid var(--abt-line-strong)`.

**21 rows**, rendered from `TEAM_MEMBERS` via `.map()`. Each row: `role="listitem"`, grid `60px 1.4fr 1.2fr`, `gap: 24px`, `align-items: center`, `padding-block: clamp(18px, 2.5vw, 28px)`, `border-bottom: 1px solid var(--abt-line)`, `transition: padding 300ms var(--ease-ph), background 300ms var(--ease-ph)`.

Columns:
1. **Index** (mono, `11px`, color `var(--abt-ink-faint)`, tracking `0.15em`): padded to 2 digits (`01`, `02`, ..., `21`).
2. **Name** (display, `clamp(22px, 2.4vw, 34px)`, Söhne 500, `letter-spacing: -0.02em`, `line-height: 1.1`): plain name from `TEAM_MEMBERS[i].name`.
3. **Role** (mono, `11px`, uppercase, tracking `0.12em`, color `var(--abt-ink-soft)`): translated via `team.members.<id>.role`.
4. **Flag + country** (mono, `11px`, tracking `0.1em`): if `nationality` present → inline SVG flag (22×14, `border-radius: 2px`, `box-shadow: 0 0 0 1px var(--abt-line-strong)`) + country label translated from `team.countries.<countryKey>`. If absent → muted text `ESPAÑA` / `SPAIN` from `team.defaultLocation`, opacity `0.5`, color `var(--abt-ink-faint)`.

**No trailing arrow column.** The handoff's original 4-column grid `60px 1.4fr 1.2fr 60px` is reduced to `60px 1.4fr 1.2fr`; the empty trailing column is dropped.

**Hover** (`.abt-team-row:hover`): `padding-inline: 18px`, `background: rgba(201, 164, 90, 0.04)`, `.abt-team-row__name { color: var(--abt-gold); }`. Desktop only; `@media (hover: hover)`.

**Responsive (< 900px):** grid collapses to `40px 1fr`, `gap: 10px`, `padding-block: 18px`. Role and flag columns hidden; name becomes flex-column with a `.abt-team-row__mobile-extras` sub-element below showing role + country in mono `10px`, tracking `0.12em`, uppercase.

**Flag SVGs** — inline constants at top of `<script>` or as Astro component-scope constants (match handoff approach):

```ts
const FLAGS = {
  ES: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#c60b1e"/><rect y="0.5" width="3" height="1" fill="#ffc400"/></svg>',
  PT: '<svg viewBox="0 0 6 4" aria-hidden="true"><rect width="6" height="4" fill="#da291c"/><rect width="2.4" height="4" fill="#006233"/><circle cx="2.4" cy="2" r="0.6" fill="#ffcb00" stroke="#000" stroke-width="0.04"/></svg>',
} as const;
```

Only ES and PT are needed (every member with `nationality` in `TEAM_MEMBERS` is ES or PT).

### 1.4 — Presencia (v2 sutil)

Section padding `clamp(60px, 9vw, 100px) var(--edge)`, `border-bottom: 1px solid var(--abt-line)`. `id="presencia"`, `aria-labelledby="presencia-heading"`.

Desktop grid `1.2fr 1fr`, gap `clamp(40px, 6vw, 80px)`, `align-items: end`, `border-top: 1px solid var(--abt-line)`, `padding-top: clamp(32px, 4vw, 48px)`.

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `05 · Presencia` | `05 · Presence` |
| madridLabel | `SEDE CENTRAL · ES` | `HEADQUARTERS · ES` |
| internationalLabel | `PRESENCIA INTERNACIONAL` | `INTERNATIONAL PRESENCE` |

**Left column:**
- Eyebrow mono `11px` gold tracking `0.2em`, `margin-bottom: 32px`.
- h3 `Madrid.` — Söhne 500–600, `clamp(36px, 5vw, 56px)`, `letter-spacing: -0.02em`, `line-height: 1`, `margin: 0`.
- Label mono `10px`, tracking `0.2em`, color `var(--abt-ink-faint)`, `margin-top: 12px`.

**Right column:**
- Label mono `10px`, tracking `0.2em`, color `var(--abt-ink-faint)`, `margin-bottom: 16px`.
- Five rows, `display: flex; flex-direction: column; gap: 8px;`. Each row: `display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px solid var(--abt-line); padding-bottom: 6px;`.
- Country name (body text) ↔ ISO code mono dorado tracking `0.15em`.

Countries (fixed order, ES copy below; EN copy mirrors): `Portugal · PT`, `Reino Unido · UK`, `Alemania · DE`, `Arabia Saudí · KSA`, `Uruguay · UY`. EN: `Portugal · PT`, `United Kingdom · UK`, `Germany · DE`, `Saudi Arabia · KSA`, `Uruguay · UY`.

Responsive (< 900px): single column, `align-items: stretch`. Madrid block on top with reduced `h3` scale (`40px`); right column below.

### 1.5 — Cierre manifesto

Full-width, centered. Padding vertical `clamp(80px, 12vw, 160px) var(--edge)`. Background `rgba(255, 255, 255, 0.02)` (subtle lift from the rest). `text-align: center`.

| Field | ES | EN |
| --- | --- | --- |
| quote (HTML) | `"No solo representamos jugadores.<br/><em>Construimos estructuras</em> que maximizan su rendimiento, estabilidad y proyección a largo plazo."` | `"We don't just represent players.<br/><em>We build structures</em> that maximize their performance, stability, and long-term projection."` |
| sig | `— PHSPORT · ACOMPAÑAMIENTO 360º` | `— PHSPORT · 360° SUPPORT` |

H2 `clamp(36px, 6vw, 72px)`, Söhne 500, `letter-spacing: -0.02em`, `line-height: 1.1`, `max-width: 900px`, `margin: 0 auto`. Gold accent on `Construimos estructuras` / `We build structures` via color + weight 700 — no italic.

Signature: mono `11px`, tracking `0.25em`, color `var(--abt-ink-faint)`, `margin-top: 28px`.

---

## 2 — Data model

### 2.1 — `src/lib/teamMembers.ts` (new file)

```ts
import type { Lang } from '@/i18n/utils';
import { useTranslations } from '@/i18n/utils';

export type Nationality = 'ES' | 'PT';

export interface TeamMember {
  id: string;
  name: string;
  nationality?: Nationality;
  countryKey?: 'arabia' | 'uk' | 'portugal' | 'alemania' | 'uruguay';
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  { id: 'cogollos',    name: 'Ángel Cogollos' },
  { id: 'castello',    name: 'Santiago Castello' },
  { id: 'castell',     name: 'Ángel Castell',     nationality: 'ES', countryKey: 'arabia' },
  { id: 'weggelaar',   name: 'Bibiana Weggelaar', nationality: 'ES', countryKey: 'uk' },
  { id: 'canoa',       name: 'Pedro Canoa',       nationality: 'PT', countryKey: 'portugal' },
  { id: 'leon',        name: 'Diego León',        nationality: 'ES', countryKey: 'alemania' },
  { id: 'nanini',      name: 'Thiago Nanini',     nationality: 'ES', countryKey: 'uruguay' },
  { id: 'caserza',     name: 'Javier Caserza' },
  { id: 'hernansanz',  name: 'Diego Hernansanz' },
  { id: 'martin',      name: 'Ismael Martín' },
  { id: 'lopez',       name: 'Daniel López' },
  { id: 'alvarez',     name: 'Javier Álvarez' },
  { id: 'garcia',      name: 'Moisés García' },
  { id: 'sancho',      name: 'Esteban Sancho' },
  { id: 'granados',    name: 'Alberto Granados' },
  { id: 'gomez',       name: 'Juan Luis Gómez' },
  { id: 'toledo',      name: 'Diego Toledo' },
  { id: 'marin',       name: 'Jaime Marín' },
  { id: 'alcazar',     name: 'Eva Alcázar' },
  { id: 'rodriguez',   name: 'María Rodríguez' },
  { id: 'salles',      name: 'Jordi Sallés' },
];

export interface RenderableMember {
  id: string;
  index: string;        // '01', '02', ..., '21'
  name: string;
  role: string;         // translated
  nationality?: Nationality;
  country?: string;     // translated country label
}

export function getTeamMembers(lang: Lang): RenderableMember[] {
  const t = useTranslations(lang);
  return TEAM_MEMBERS.map((m, i) => ({
    id: m.id,
    index: String(i + 1).padStart(2, '0'),
    name: m.name,
    role: t(`team.members.${m.id}.role` as any),
    nationality: m.nationality,
    country: m.countryKey ? t(`team.countries.${m.countryKey}` as any) : undefined,
  }));
}
```

Invariant: `TEAM_MEMBERS.length === 21`. Each `id` is unique and appears as `team.members.<id>.role` in both `es.ts` and `en.ts`. Every `countryKey` used must exist as `team.countries.<key>` in both locales.

### 2.2 — i18n keys (exhaustive list)

**New namespace `about.*`:**

| Key | ES | EN |
| --- | --- | --- |
| `about.hero.eyebrow` | `04 · Sobre nosotros` | `04 · About us` |
| `about.hero.titlePre` | `Representar con ` | `Representing with ` |
| `about.hero.titleAccent` | `propósito` | `purpose` |
| `about.hero.titlePost` | `.` | `.` |
| `about.hero.body1` | (see 1.1) | (see 1.1) |
| `about.hero.body2` | (see 1.1) | (see 1.1) |
| `about.hero.ctaServices` | `Nuestros servicios` | `Our services` |
| `about.hero.ctaContact` | `Contactar` | `Get in touch` |
| `about.hero.values` | `EXCELENCIA · CERCANÍA · RIGOR` | `EXCELLENCE · CLOSENESS · RIGOR` |
| `about.hero.caption` | `PHSPORT · SEDE MADRID` | `PHSPORT · MADRID HQ` |
| `about.historia.titlePre` | `Gestionamos tu carrera. Cuidamos tu ` | `We manage your career. We look after your ` |
| `about.historia.titleAccent1` | `presente` | `present` |
| `about.historia.titleMid` | ` y planificamos tu ` | ` and plan your ` |
| `about.historia.titleAccent2` | `futuro` | `future` |
| `about.historia.titlePost` | `.` | `.` |
| `about.historia.p1` | (see 1.2) | (see 1.2) |
| `about.historia.p2` | (see 1.2) | (see 1.2) |
| `about.historia.p3` | (see 1.2) | (see 1.2) |
| `about.historia.p4` | (see 1.2) | (see 1.2) |
| `about.team.eyebrow` | `EL EQUIPO` | `THE TEAM` |
| `about.team.titlePre` | `Las ` | `The ` |
| `about.team.titleAccent` | `personas` | `people` |
| `about.team.titlePost` | ` detrás.` | ` behind it.` |
| `about.team.meta` | `21 INTEGRANTES · 6 PAÍSES` | `21 MEMBERS · 6 COUNTRIES` |
| `about.presencia.eyebrow` | `05 · Presencia` | `05 · Presence` |
| `about.presencia.madridLabel` | `SEDE CENTRAL · ES` | `HEADQUARTERS · ES` |
| `about.presencia.internationalLabel` | `PRESENCIA INTERNACIONAL` | `INTERNATIONAL PRESENCE` |
| `about.manifesto.quotePre` | `"No solo representamos jugadores.` | `"We don't just represent players.` |
| `about.manifesto.quoteAccent` | `Construimos estructuras` | `We build structures` |
| `about.manifesto.quotePost` | ` que maximizan su rendimiento, estabilidad y proyección a largo plazo."` | ` that maximize their performance, stability, and long-term projection."` |
| `about.manifesto.sig` | `— PHSPORT · ACOMPAÑAMIENTO 360º` | `— PHSPORT · 360° SUPPORT` |

Note: title keys are split into `Pre`/`Accent`/`Post` fragments so the accent span can be rendered as a separate `<span class="abt-gold">…</span>` without needing HTML-in-translation or `set:html`. The historia title uses four fragments (two accents). The implementer concatenates fragments at render time.

**Existing namespace `team.*` — additions:**

| Key | ES | EN |
| --- | --- | --- |
| `team.title` | (exists) `Equipo PHSPORT` | (exists) `PHSPORT team` |
| `team.defaultLocation` | `ESPAÑA` | `SPAIN` |
| `team.countries.arabia` | `PH Arabia` | `PH Arabia` |
| `team.countries.uk` | `PH UK` | `PH UK` |
| `team.countries.portugal` | `PH Portugal` | `PH Portugal` |
| `team.countries.alemania` | `PH Alemania` | `PH Germany` |
| `team.countries.uruguay` | `Uruguay` | `Uruguay` |
| `team.members.cogollos.role` | `CEO` | `CEO` |
| `team.members.castello.role` | `Agente FIFA · Coordinador Dto. Fútbol` | `FIFA Agent · Football Dept. Coordinator` |
| `team.members.castell.role` | `Agente FIFA · Dto. Fútbol` | `FIFA Agent · Football Dept.` |
| `team.members.weggelaar.role` | `Dto. Fútbol` | `Football Dept.` |
| `team.members.canoa.role` | `Dto. Fútbol` | `Football Dept.` |
| `team.members.leon.role` | `Dto. Fútbol` | `Football Dept.` |
| `team.members.nanini.role` | `Dto. Fútbol` | `Football Dept.` |
| `team.members.caserza.role` | `Agente FIFA · Dto. Fútbol España` | `FIFA Agent · Football Dept. Spain` |
| `team.members.hernansanz.role` | `Agente FIFA · Dto. Fútbol España` | `FIFA Agent · Football Dept. Spain` |
| `team.members.martin.role` | `Agente FIFA · Dto. Fútbol España` | `FIFA Agent · Football Dept. Spain` |
| `team.members.lopez.role` | `Agente FIFA · Dto. Fútbol España` | `FIFA Agent · Football Dept. Spain` |
| `team.members.alvarez.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.garcia.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.sancho.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.granados.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.gomez.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.toledo.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.marin.role` | `Dto. Fútbol PH España` | `PH Spain Football Dept.` |
| `team.members.alcazar.role` | `Dto. Marketing y Redes Sociales` | `Marketing & Social Media Dept.` |
| `team.members.rodriguez.role` | `Dto. Financiero` | `Finance Dept.` |
| `team.members.salles.role` | `Dto. Financiero` | `Finance Dept.` |

**Keys to DELETE:**

- `about.block1.title`, `about.block1.body`
- `about.block2.title`, `about.block2.body`
- `about.block3.title`, `about.block3.body`
- `team.placeholderName`
- `team.placeholderRole`

`about.title` and `about.subtitle` are retained (used in the page `<title>` and meta description).

Parity check: both `es.ts` and `en.ts` must have identical key sets after changes. The project's `Record<TranslationKey, string>` type enforces this at build time.

---

## 3 — Token additions

### 3.1 — Global: `--font-mono`

In `src/styles/global.css`, add to `:root`:

```css
--font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
```

Used by the About page for eyebrows, meta labels, and index numerals. Available to other components if needed.

### 3.2 — Component-scoped aliases (inside `AboutSection.astro`)

Following the Phase 2 `--srv-*` precedent, declare aliases at the section root:

```css
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
}
```

No new global color tokens needed — everything aliases existing `--color-ph-*` tokens.

---

## 4 — Routing changes

### 4.1 — Redirects (`astro.config.mjs`)

Add to the config:

```js
redirects: {
  '/equipo': { status: 301, destination: '/sobre-nosotros#equipo' },
  '/en/team': { status: 301, destination: '/en/about#equipo' },
}
```

Use the object form with explicit `status: 301` (Astro default is 302). Verify against Astro 5 redirect documentation during implementation — fall back to string form (`'/equipo': '/sobre-nosotros#equipo'`) if object form isn't supported in the installed version, and set status via a `_headers` / `_redirects` file if the host (Vercel/Netlify) requires it.

### 4.2 — Page file deletions

- `src/pages/equipo.astro` — delete (redirect config takes over).
- `src/pages/en/team.astro` — delete (redirect config takes over).

If the Astro redirect config does not generate a build output for absent routes, create minimal stub pages that do `---\nreturn Astro.redirect('/sobre-nosotros#equipo', 301);\n---` as fallback.

### 4.3 — Component deletion

- `src/components/sections/TeamSection.astro` — delete after confirming no other importer via `grep "from '@/components/sections/TeamSection'"` across `src/`.
- `src/scripts/player-modal.ts` — **conditional delete**. Run `grep -rn "player-modal" src/` before removing. If `HomePlayersSection`, `TalentsSection`, or any other section imports it, keep it. Document the result in the commit message.

---

## 5 — Animations

All via GSAP + `astro:page-load`, mirroring the existing `AboutSection` script and helpers from `@/scripts/ph-text-animations` (`reducedMotion`, `wrapWords`, `splitWords`, `trackingReveal`). Section root: `.about-section`. Guard: early return if `reducedMotion()` is true, but in that case dispatch a class like `.motion-reduced` on each relevant container so content remains visible (no hidden-forever states).

**Hero:**
- `trackingReveal` on eyebrow (`.abt-hero__eyebrow`), start `top 88%`, once.
- `wrapWords` on h1 → `gsap.from(words, { yPercent: 115, duration: 0.85, stagger: 0.07, ease: 'power4.out', ... })`.
- `splitWords` on each body paragraph → `gsap.from(spans, { opacity: 0, filter: 'blur(6px)', y: 6, duration: 0.6, stagger: 0.03 })`.
- CTAs fade-up (`y: 12, opacity: 0`, stagger 0.1, duration 0.5) on hero enter.
- `trackingReveal` on values tagline.

**Historia:**
- `wrapWords` on h2 stagger, same curve as hero h1.
- `splitWords` with blur on each paragraph, stagger across all 4.
- Dropcap NOT animated (visual interference with `::first-letter`).

**Equipo:**
- Header label/title/meta: same trackingReveal + wrapWords pattern.
- Rows: `gsap.from('.abt-team-row', { opacity: 0, y: 14, duration: 0.45, stagger: { each: 0.04, from: 'start' }, ease: 'power3.out', scrollTrigger: { trigger: '.abt-team-table', start: 'top 88%', once: true } })`. Safety timeout after 2200ms clears opacity/transform on any unfinished rows (mirrors TeamSection pattern).

**Presencia:**
- Fade-up simple on `.abt-presencia__left` and `.abt-presencia__right-row` children, `y: 20`, stagger `0.1`, duration `0.55`.

**Cierre manifesto:**
- `wrapWords` on the quote h2.
- `trackingReveal` on the signature.

ScrollTrigger refresh bound once per section, debounced 150ms on resize/orientationchange (mirror TeamSection pattern).

---

## 6 — Testing plan (manual)

1. `npm run check` — zero **new** TypeScript errors. The existing errors (`HomeInstagramSection.astro:11/16` missing i18n keys, `Button.astro:27` type prop) must remain unchanged. The pre-existing `TeamSection.astro:136` Timeout type error disappears (file deleted).
2. `npm run build` — completes green. Page count: expect 240 (was 242 before Phase 2 merge; Phase 2 left it at 242; we remove 2 pages via redirects = 240 — verify).
3. `npm run dev` + manual browser:
   - **`/sobre-nosotros`:** all 5 blocks render, 21 team members appear in correct order with roles and countries/flags, hero placeholder shows gradient + caption, dropcap renders on first historia paragraph, hover on team rows shows gold tint and name turns gold, all GSAP animations fire once and then settle with content fully visible.
   - **`/en/about`:** identical to ES but with EN copy. All 21 team roles translated.
   - **`/equipo`:** 301 redirect lands at `/sobre-nosotros#equipo`, browser scroll-jumps to the team block.
   - **`/en/team`:** 301 redirect lands at `/en/about#equipo`.
   - **Mobile ≤ 900px:** hero collapses to single column (placeholder on top); historia becomes single column with dropcap preserved; team rows collapse to `40px 1fr` layout with name + mobile-extras below; presencia stacks vertically; manifesto stays centered.
   - **`prefers-reduced-motion: reduce`:** all content visible immediately, no animations fire.
   - **Keyboard nav:** `Tab` reaches both CTAs in the hero in order. Focus styles present.
   - **Anchor deep-link:** navigating to `/sobre-nosotros#equipo` directly scrolls to the team block on page load.

---

## 7 — File manifest

**Create:**
- `src/lib/teamMembers.ts`

**Modify:**
- `src/components/sections/AboutSection.astro` (full rewrite, keep file path)
- `src/i18n/es.ts` (add/remove keys as per §2.2)
- `src/i18n/en.ts` (add/remove keys as per §2.2)
- `src/styles/global.css` (add `--font-mono` to `:root`)
- `astro.config.mjs` (add `redirects`)

**Delete:**
- `src/components/sections/TeamSection.astro`
- `src/pages/equipo.astro`
- `src/pages/en/team.astro`
- `src/scripts/player-modal.ts` (conditional — only if no other consumer)

**Untouched (explicit out-of-scope):**
- `src/components/sections/HomeAboutSection.astro`
- `src/components/sections/HomeInstagramSection.astro` (Phase 5 target)
- `src/components/sections/Footer*` (Phase 5 target)
- `src/pages/sobre-nosotros.astro` (shell stays)
- `src/pages/en/about.astro` (shell stays)
- `src/components/ui/PortraitCard.astro` (used elsewhere)

---

## 8 — Non-goals

- No real photography — the hero right column stays as a CSS placeholder until a later content-update pass.
- No per-member detail page or modal — the flecha "—" column from the handoff is dropped. Rows are visually inert (hover tint only).
- No internationalization of member names — Spanish names render as-is in EN.
- No automated tests — this project currently has no UI test infrastructure; validation is manual per §6.
