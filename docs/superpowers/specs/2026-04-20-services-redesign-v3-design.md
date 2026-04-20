# Services Redesign V3 — Design Spec

**Goal:** Replace the current `/servicios/` and `/en/services/` pages (currently rendering `ServicesOrbit3D`) with a new editorial layout that matches the Claude Design bundle (`servicios.html`). Delete `ServicesOrbit3D.astro`. Home services accordion content is refreshed to match the new pillar copy (single source of truth), but its layout stays as-is.

**Source of truth:** `/tmp/design-extract/wf-web-phsport/project/servicios.html` (mirrored at `.design-ref/servicios.html` in the repo during this phase, deleted before final merge).

**Scope boundaries**
- **IN:** New `ServicesSection.astro` (monolithic, matching the design's six blocks); refactor of `src/lib/servicesItems.ts` to new shape `{ title, body, tags[] }`; i18n changes in `es.ts`/`en.ts` (add new keys, drop orbit-only keys, update pillar body copy to new editorial copy); wiring of both page files; deletion of `ServicesOrbit3D.astro`.
- **OUT (later phases):** Real pillar imagery (stays placeholder — diagonal hash pattern + Roman numeral corner tag); About/Equipo merge (Phase 3); footer restyle (Phase 5).

---

## 1 — Page structure

The page renders as a single `ServicesSection.astro` component composed of six vertical blocks. Rendered inside `BaseLayout` (existing header + footer).

```
01  Page hero (editorial 2-col)
02  Áreas de gestión  (accordion, 5 rows, exclusive-open, first open by default)
03  Model intro      (centered transition block with top decorative rule)
04  Six pillar blocks (alternating text/image split, Roman numerals I–VI)
05  Manifest         (large centered italic quote)
06  Final CTA        (goldfill primary button → #contacto on home)
```

### 1.1 — Page hero

Two-column editorial grid (`1.3fr 1fr`, `align-items:end`), horizontal rule at the bottom.

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `03 · Servicios` | `03 · Services` |
| title (HTML) | `Un equipo<br/>fuera del <em>campo</em>.` | `A team<br/>off the <em>pitch</em>.` |
| lead | `Representación estratégica, visión internacional y enfoque a largo plazo. Cinco áreas de gestión y seis pilares del modelo operativo — bajo un mismo techo, alineados con una sola persona: el jugador.` | `Strategic representation, international reach, and long-term focus. Five management areas and six operating pillars — under one roof, aligned with one person: the player.` |

Typography: h1 `clamp(48px, 8vw, 108px)`, weight 500, `letter-spacing:-0.03em`, `line-height:0.98`. Italic gold accent on `campo` / `pitch`. Paragraph `15px`, `line-height:1.7`, `max-width:420px`, color `var(--color-ph-ink-soft)`.

Responsive: below `900px`, collapse to single column.

### 1.2 — Áreas de gestión (accordion)

Header grid `1fr 1.6fr`, left = eyebrow + kicker, right = title.

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `Áreas de gestión` | `Management areas` |
| kicker | `05 disciplinas · 01 equipo` | `05 disciplines · 01 team` |
| title (HTML) | `Gestionamos tu carrera. Cuidamos tu <em>presente</em> y planificamos tu <em>futuro</em>.` | `We manage your career. We look after your <em>present</em> and plan your <em>future</em>.` |
| foot | `ACOMPAÑAMIENTO 360º · SERVICIO 365` | `360° SUPPORT · 365 SERVICE` |

Five accordion rows. Each row: number (mono 11px gold), h3 title, toggle button (40×40 round, thin border, `+` symbol that rotates 45° to `×` when open). On open: descriptive paragraph + bullet list (each bullet preceded by a 10px gold horizontal line). Row body uses `max-height` transition for smooth expand (500–600ms cubic-bezier `.7,0,.2,1`).

**Items (5):**

| n | ES title | EN title | ES lead | EN lead | ES bullets | EN bullets |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Representación e intermediación | Representation & intermediation | Negociamos y protegemos todos los términos de la relación entre jugador y club. Nuestra misión es asegurar las mejores condiciones posibles — deportivas, económicas y personales — en cada decisión. | We negotiate and protect every term of the relationship between player and club. Our mission is to secure the best possible conditions — sporting, financial, and personal — in every decision. | Negociación de contratos profesionales · Relación directa con clubes y decisores · Protección de intereses deportivos y económicos · Transferencias nacionales e internacionales | Professional contract negotiation · Direct relationship with clubs and decision-makers · Protection of sporting and financial interests · Domestic and international transfers |
| 02 | Planificación de carrera | Career planning | Cada decisión cuenta. Analizamos oportunidades, contexto competitivo y momento deportivo para construir una trayectoria coherente, sostenible y ambiciosa. | Every decision counts. We analyze opportunities, competitive context, and sporting momentum to build a coherent, sustainable, and ambitious trajectory. | Toma de decisiones deportivas clave · Análisis de oportunidades y evolución · Construcción de una carrera sostenible · Estrategia a corto, medio y largo plazo | Key sporting decisions · Opportunity and evolution analysis · Building a sustainable career · Short, mid, and long-term strategy |
| 03 | Acceso internacional | International access | Una red activa en 12 países y oficinas propias en seis mercados clave. Abrimos puertas reales y acompañamos al jugador en cada adaptación. | An active network in 12 countries and owned offices in six key markets. We open real doors and stand by the player through every adaptation. | Estrategia de mercado y posicionamiento · Red activa en 12 países · Oficinas en ESP, PT, UK, DE, KSA y UY · Adaptación a cada etapa de la carrera | Market strategy and positioning · Active network in 12 countries · Offices in ESP, PT, UK, DE, KSA, and UY · Adaptation at every career stage |
| 04 | Comunicación y marketing | Communication & marketing | Desarrollamos la marca personal del jugador dentro y fuera del campo, con un enfoque editorial que refuerza su imagen pública y abre nuevas líneas de ingreso. | We develop the player's personal brand on and off the pitch, with an editorial approach that strengthens their public image and opens new revenue streams. | Desarrollo de marca personal · Estrategia digital y redes sociales · Gestión de imagen pública · Activación de patrocinios | Personal brand development · Digital and social strategy · Public image management · Sponsorship activation |
| 05 | Asesoramiento legal y financiero | Legal and financial advisory | Estructura jurídica y financiera dedicada: contratos, imagen, fiscalidad y patrimonio. Cuidamos lo que hoy se construye para que dure mucho después de la retirada. | A dedicated legal and financial structure: contracts, image rights, taxation, and wealth. We care for what is built today so it lasts long after retirement. | Contratos y derechos de imagen · Protección patrimonial · Optimización fiscal y planificación · Supervisión y control financiero | Contracts and image rights · Wealth protection · Tax optimization and planning · Financial oversight and control |

**Interaction:** one row open at a time. Default: row 01 open. Clicking an open row closes it. Keyboard: `<button>` summary with `aria-expanded` + `aria-controls`; Space/Enter triggers. Closed rows `aria-hidden="false"` (still in flow) but the panel is `hidden` attribute removed in favor of CSS `max-height` animation.

**A11y note:** the design uses `<div class="summary">` with pointer events. We upgrade to semantic `<button type="button">` to get keyboard support for free.

**Reduced motion:** disable `max-height` transition + toggle rotation via `@media (prefers-reduced-motion: reduce)`.

### 1.3 — Model intro (transition block)

Centered, `max-width: 900px`, with a 1px vertical line hanging from the top rule (`clamp(40px,6vw,72px)` tall).

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `Modelo operativo PHSPORT` | `PHSPORT operating model` |
| title (HTML) | `Más allá de la representación, desarrollamos una estructura <em>integral</em>.` | `Beyond representation, we build an <em>integrated</em> structure.` |
| lead | `Seis pilares especializados que acompañan al jugador en todas las áreas clave de su carrera.` | `Six specialized pillars that support the player across every key area of their career.` |

### 1.4 — Six pillar blocks (srv-blocks)

Each pillar = a full-viewport two-column split. Alternating layout: odd pillars (I, III, V) = text-left / image-right; even pillars (II, IV, VI) = image-left / text-right. Background alternates `--bg` / `--bg-2` for visual rhythm. `min-height: clamp(420px, 58vw, 640px)`; bottom border.

**Text column** (padded `clamp(48px, 7vw, 96px) var(--edge)`, center-justified vertically):
- Roman numeral (display italic gold, `clamp(56px, 9vw, 120px)`)
- h3 title (display 500 italic off, `clamp(36px, 5.5vw, 72px)`)
- paragraph (15px / 1.7, `max-width: 480px`, `--ink-soft`)
- chip row: pill-shaped mono tags (`10px` text, `0.15em tracking`, `6px 12px` padding, border `--line-strong`)

**Image column** (placeholder):
- Diagonal hash pattern background using shared `.ph` style
- Roman numeral corner tag absolute positioned top-left, e.g. `I / VI` (mono 10px, backdrop-blur 4px, `rgba(14,14,14,0.6)` bg)
- `order: -1` on `.img` when block index is even to swap sides

**Content table (6 pillars):**

| n | Roman | ES title | EN title | ES body | EN body | ES tags | EN tags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | I | Prensa. | Press. | Gestión de imagen y reputación, relación con medios y posicionamiento público del jugador. Cada aparición es una decisión. | Image and reputation management, media relations, and public positioning of the player. Every appearance is a decision. | Imagen pública · Medios · Posicionamiento | Public image · Media · Positioning |
| 2 | II | Rendimiento. | Performance. | Análisis físico y performance. Seguimiento continuo. Optimización del rendimiento deportivo. | Physical and performance analysis. Continuous tracking. Sporting performance optimization. | Análisis físico · Performance · Seguimiento · Optimización | Physical analysis · Performance · Tracking · Optimization |
| 3 | III | Media. | Media. | Estrategia de comunicación digital, creación de contenido y gestión de redes sociales. Definimos la voz y el universo visual del jugador. | Digital communication strategy, content creation, and social media management. We define the voice and visual universe of the player. | Estrategia digital · Contenido · Redes sociales · Marca personal | Digital strategy · Content · Social media · Personal brand |
| 4 | IV | Family Office. | Family Office. | Gestión patrimonial, planificación financiera y fiscal, y estructura administrativa del jugador. Lo que se construye debe durar más que una carrera. | Wealth management, financial and tax planning, and administrative structure for the player. What is built must last longer than a career. | Patrimonio · Fiscal · Planificación · Administración | Wealth · Tax · Planning · Administration |
| 5 | V | Psicólogo. | Psychology. | Preparación mental de alto rendimiento, gestión de presión y hábitos. Acompañamiento competitivo continuo. | High-performance mental preparation, pressure management, and habits. Continuous competitive support. | Alto rendimiento · Presión competitiva · Hábitos | High performance · Competitive pressure · Habits |
| 6 | VI | Plan de Acción. | Action Plan. | Gestión y revisión de contratos. Estrategia de mercado y posicionamiento internacional. Soporte integral dentro y fuera del campo. Adaptación a cada etapa de la carrera. | Contract management and review. Market strategy and international positioning. Integrated support on and off the pitch. Adaptation at every career stage. | Contratos · Mercado internacional · Servicio 365 | Contracts · International market · 365 service |

**Responsive (`@media (max-width: 900px)`):** collapse to single column, image first (`order: -1` regardless of parity), `aspect-ratio: 16/10`, text padding reduced.

### 1.5 — Manifest

Centered, top border.

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `ACOMPAÑAMIENTO 360º · SERVICIO 365` | `360° SUPPORT · 365 SERVICE` |
| body (HTML) | `En PHSPORT no solo representamos jugadores,<br/><em>construimos estructuras</em> que maximizan su rendimiento, estabilidad y proyección a largo plazo.` | `At PHSPORT we don't just represent players,<br/>we <em>build structures</em> that maximize their performance, stability, and long-term projection.` |

Typography: display 500 italic, `clamp(32px, 5vw, 60px)`, `line-height:1.15`, `max-width:1000px`, centered. Gold italic on the accent span.

### 1.6 — Final CTA

Centered, `--bg-3` background, top border.

| Field | ES | EN |
| --- | --- | --- |
| eyebrow | `¿EMPEZAMOS?` | `SHALL WE BEGIN?` |
| title (HTML) | `Un equipo para cada decisión.<br/><em>Una conversación</em> para empezar.` | `A team for every decision.<br/><em>One conversation</em> to begin.` |
| lead | `Cuéntanos sobre ti o tu club. Respondemos en 48h.` | `Tell us about yourself or your club. We reply within 48 hours.` |
| button | `Contactar con la agencia` | `Contact the agency` |

Button: primary variant (goldfill bg, black text, hover → `--gold-soft`), 100px border-radius, `14px 22px` padding, arrow icon `→` that translates 4px on hover. The `href` points at the home contact section — ES: `/#contacto`, EN: `/en/#contacto` — matching the anchor target used today in `HomeContactSection`.

---

## 2 — File changes

### 2.1 — Create

- `src/components/sections/ServicesSection.astro` — monolithic, ~450 lines, receives `{ lang: Lang }` prop. Internally imports `getServicesItems(lang)` for the 6 pillars and hardcodes (via `useTranslations`) the 5 áreas + section chrome. Scoped `<style>` block with all CSS; `<script>` handles the accordion exclusive-open logic using `astro:page-load` event.

### 2.2 — Modify

- `src/lib/servicesItems.ts` — change `ServiceItem` shape from `{ icon, title, body, short }` to `{ title, body, tags }`. Drop `icon` and `short`. Populate `tags` from new i18n keys (`services.items.<key>.tags` → space-separated string in i18n, split to array at read time, OR declare as a typed tuple per item in `servicesItems.ts` itself). **Decision: keep tags in-code as English tuples keyed by language** — `tags` is a short fixed list, i18n-ing it via flat-string split is fragile. I'll add per-key translation keys (`services.items.press.tags.0`, `.1`, …) and read them at item build time.
  - Actually simpler: declare `tags` as an array directly in `servicesItems.ts` with `t(...)` calls, 3–4 keys per item:
    ```ts
    tags: [t('services.items.press.tag1'), t('services.items.press.tag2'), t('services.items.press.tag3')]
    ```
    Each pillar has 3 or 4 tags; we define flat keys `services.items.press.tag1..tag4`. Missing tag4 (e.g. Press has only 3 tags) is handled by `.filter(Boolean)` after the array is built — but cleaner is to define exactly the right count per item with `?? ''` elimination.

  - Final shape:
    ```ts
    export type ServiceItem = {
      title: string;
      body: string;
      tags: string[];
    };
    ```

- `src/i18n/es.ts` — **add** new keys for hero, areas (5 items × title + lead + 4 bullet keys), model intro, pillar tags (6 items × 3–4 tag keys), manifest, cta. **Update** existing pillar `body` copy to new editorial text (see table §1.4). **Keep** pillar `title` (Prensa / Rendimiento / Media / Family Office / Psicólogo / Plan de Acción) — unchanged. **Remove** `services.orbitInstructions`, `services.modalAriaLabel`, `services.blocksAriaLabel`, and all `services.items.*.short` keys (obsolete when orbit is deleted).
- `src/i18n/en.ts` — mirror es.ts exactly, with EN translations per the tables above.
- `src/pages/servicios.astro` — swap `import ServicesOrbit3D` → `import ServicesSection`, render `<ServicesSection lang={lang} />`. Remove `ServicesOrbit3D` reference.
- `src/pages/en/services.astro` — same as above, `lang = 'en'`.

### 2.3 — Delete

- `src/components/sections/ServicesOrbit3D.astro` (703 lines, obsolete carousel)
- Any Lucide import that's now unused in shared scripts (verify; probably scoped to ServicesOrbit3D only).

### 2.4 — Untouched

- `src/components/sections/HomeServicesSection.astro` — already the V3 accordion from Phase 1. Will automatically pick up the updated `body` copy (single source of truth via `servicesItems.ts`) after this phase, which is desired.
- `src/styles/global.css` — already has `--color-ph-black`, `--color-ph-gold`, `--color-ph-white`, `--font-display`, `--ph-section-px`, etc. If any token from the design's `shared.css` is missing (`--bg-3`, `--ink-faint`, `--line-strong`, `--gold-soft`), add it in the `:root` of `global.css` so that ServicesSection can rely on a consistent token surface. **Decision:** add any missing tokens to `global.css`; do not duplicate locally in the component.

---

## 3 — Token mapping

Design bundle → existing project tokens:

| Design token | Existing project equivalent | Action |
| --- | --- | --- |
| `--bg` (#0d0f12) | `--color-ph-black` | alias |
| `--bg-2` (#15171b) | `--color-ph-bg-2` (if exists, else add) | verify/add |
| `--bg-3` (#1d2025) | N/A | **add** to `global.css` as `--color-ph-bg-3` |
| `--ink` (#ffffff) | `--color-ph-white` | alias |
| `--ink-soft` (#b5b7bb) | `--color-ph-ink-soft` (if exists) | verify/add |
| `--ink-faint` (#6f7278) | N/A | **add** as `--color-ph-ink-faint` |
| `--line` (rgba(255,255,255,0.12)) | `--color-ph-line` | alias |
| `--line-strong` (rgba(255,255,255,0.24)) | `--color-ph-line-strong` | alias |
| `--gold` (#d6b25e) | `--color-ph-gold` | alias |
| `--gold-soft` (#e6c682) | `--color-ph-gold-soft` | verify/add |
| `--nav-h` (72px) | N/A (Header handles its own height) | use `72px` literal or compute from existing |
| `--edge` | `--ph-section-px` | alias |
| `--display` | `--font-display` (Inter Tight) | alias |
| `--mono` | `--font-mono` (JetBrains Mono) | alias |
| `--sans` | `--font-sans` (Helvetica Neue) | alias |

The verify/add step happens in an early task of the implementation plan (grep first, add only what's missing — no over-cleaning).

---

## 4 — i18n key schema

All new/changed keys live under the `services.*` namespace.

**Remove:**
- `services.blocksAriaLabel`
- `services.orbitInstructions`
- `services.modalAriaLabel`
- `services.items.press.short`
- `services.items.performance.short`
- `services.items.media.short`
- `services.items.familyOffice.short`
- `services.items.psychology.short`
- `services.items.actionPlan.short`

**Keep (unchanged):**
- `services.title`, `services.subtitle` (used by `<BaseLayout title>` / `description` in the page wrappers)
- `services.items.<key>.title` (the 6 pillar names: Prensa / Rendimiento / …)

**Update (new copy):**
- `services.items.press.body` — new editorial text (see table §1.4, row 1)
- `services.items.performance.body` — new
- `services.items.media.body` — new
- `services.items.familyOffice.body` — new
- `services.items.psychology.body` — new
- `services.items.actionPlan.body` — new

**Add (new keys):**

Page hero (3):
- `services.hero.eyebrow` — `'03 · Servicios'` / `'03 · Services'`
- `services.hero.title` — `'Un equipo fuera del '` / `'A team off the '` (break inserted via HTML `<br/>` in component)
- `services.hero.titleAccent` — `'campo'` / `'pitch'`
- `services.hero.titleTrail` — `'.'` (literal dot, shared ES/EN — can be inline in component)
- `services.hero.lead` — see §1.1

Actually simplify: split the hero title into literal component markup, with two translatable strings:
- `services.hero.titleLead` — `'Un equipo'` / `'A team'`
- `services.hero.titleRest` — `'fuera del '` / `'off the '`
- `services.hero.titleAccent` — `'campo'` / `'pitch'`
- `services.hero.lead` — lead paragraph

**Final hero keys (4):** `hero.eyebrow`, `hero.titleLead`, `hero.titleRest`, `hero.titleAccent`, `hero.lead` — under `services.*` prefix, so `services.hero.eyebrow`, etc.

Áreas header (4):
- `services.areas.eyebrow` — `'Áreas de gestión'` / `'Management areas'`
- `services.areas.kicker` — `'05 disciplinas · 01 equipo'` / `'05 disciplines · 01 team'`
- `services.areas.titleLead` — `'Gestionamos tu carrera. Cuidamos tu '` / `'We manage your career. We look after your '`
- `services.areas.titleAccent1` — `'presente'` / `'present'`
- `services.areas.titleMid` — `' y planificamos tu '` / `' and plan your '`
- `services.areas.titleAccent2` — `'futuro'` / `'future'`
- `services.areas.titleTrail` — `'.'`
- `services.areas.foot` — `'ACOMPAÑAMIENTO 360º · SERVICIO 365'` / `'360° SUPPORT · 365 SERVICE'`

Áreas items (5 × 6 keys = 30):
For each item key in `[management, career, international, comms, legal]`:
- `services.areas.items.<key>.title`
- `services.areas.items.<key>.lead`
- `services.areas.items.<key>.bullet1`
- `services.areas.items.<key>.bullet2`
- `services.areas.items.<key>.bullet3`
- `services.areas.items.<key>.bullet4`

(All five items have exactly four bullets, per the design.)

Áreas label "Descripción" (the lead label):
- `services.areas.leadLabel` — `'Descripción'` / `'Description'`

Model intro (4):
- `services.model.eyebrow` — `'Modelo operativo PHSPORT'` / `'PHSPORT operating model'`
- `services.model.titleLead` — `'Más allá de la representación, desarrollamos una estructura '` / `'Beyond representation, we build an '`
- `services.model.titleAccent` — `'integral'` / `'integrated'`
- `services.model.titleTrail` — `'.'`
- `services.model.lead` — see §1.3

Pillar tags (6 × 3–4 per pillar = 21 keys):
Per pillar key in `[press, performance, media, familyOffice, psychology, actionPlan]`:
- `services.items.<key>.tag1`
- `services.items.<key>.tag2`
- `services.items.<key>.tag3`
- `services.items.<key>.tag4` (only for performance, media, familyOffice — the 4-tag pillars)

Final tag count per pillar:
- press: 3 tags → tag1..tag3
- performance: 4 tags → tag1..tag4
- media: 4 tags → tag1..tag4
- familyOffice: 4 tags → tag1..tag4
- psychology: 3 tags → tag1..tag3
- actionPlan: 3 tags → tag1..tag3

Manifest (3):
- `services.manifest.eyebrow` — `'ACOMPAÑAMIENTO 360º · SERVICIO 365'` / `'360° SUPPORT · 365 SERVICE'`
- `services.manifest.bodyLead` — `'En PHSPORT no solo representamos jugadores, '` / `'At PHSPORT we don't just represent players, '` (note: `&apos;` in EN to avoid quoting issues)
- `services.manifest.bodyAccent` — `'construimos estructuras'` / `'we build structures'`
- `services.manifest.bodyTrail` — `' que maximizan su rendimiento, estabilidad y proyección a largo plazo.'` / `' that maximize their performance, stability, and long-term projection.'`

CTA (4):
- `services.cta.eyebrow` — `'¿EMPEZAMOS?'` / `'SHALL WE BEGIN?'`
- `services.cta.titleLead` — `'Un equipo para cada decisión. '` / `'A team for every decision. '`
- `services.cta.titleAccent` — `'Una conversación'` / `'One conversation'`
- `services.cta.titleTrail` — `' para empezar.'` / `' to begin.'`
- `services.cta.lead` — `'Cuéntanos sobre ti o tu club. Respondemos en 48h.'` / `'Tell us about yourself or your club. We reply within 48 hours.'`
- `services.cta.button` — `'Contactar con la agencia'` / `'Contact the agency'`

Image corner tag format:
- `services.pillarImageCaption` — `'{n} / VI'` (literal, not translated — just used verbatim in the component)

**Total new keys:** approx 80 new, approx 10 removed.

---

## 5 — Accordion accessibility & interaction

- Summary is a `<button type="button">` with:
  - `aria-expanded` (initially `"true"` on row 01, `"false"` on others)
  - `aria-controls` pointing to the body element's id
- Body is a `<div id="...">` with `aria-hidden` mirroring the inverse of aria-expanded.
- Click handler: exclusive-open logic (close all other rows, toggle current) — matches the design's JS verbatim, upgraded to keyboard-accessible via `<button>`.
- `astro:page-load` event registration, not `DOMContentLoaded`, for ViewTransitions consistency with TalentsSection.
- `@media (prefers-reduced-motion: reduce)`: disable the toggle rotation transition and the `max-height`/padding transitions (instantaneous open/close).

## 6 — Self-review

- **Placeholders:** none in spec.
- **Internal consistency:** five áreas items in §1.2 have matching keys in §4. Six pillars in §1.4 have matching keys in §4. All tags counted and keyed.
- **Scope:** single plan, single implementation session. No hidden subsystems.
- **Ambiguity:** EN "off the pitch" chosen over "off the field" (football idiom). "Sporting" vs "athletic" — "sporting" (British football register, matches PHSPORT's tone).
- **Untouched surface:** home accordion body text is automatically refreshed from `servicesItems.ts`. Verify after implementation that the home accordion still reads naturally with the new longer pillar copy.
