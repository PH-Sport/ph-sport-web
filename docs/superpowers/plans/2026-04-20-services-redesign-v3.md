# Services Redesign V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/servicios/` and `/en/services/` (currently `ServicesOrbit3D`) with a six-block editorial layout — hero, áreas accordion, model intro, six pillar blocks, manifest, final CTA — matching `.design-ref/servicios.html`.

**Architecture:** Single monolithic `ServicesSection.astro` (scoped CSS + script), wired into both language page wrappers. i18n-first (all copy via flat keys in `es.ts`/`en.ts`). `ServiceItem` type refactored from `{ icon, title, body, short }` → `{ title, body, tags[] }` — `ServicesOrbit3D.astro` and all obsolete keys deleted.

**Tech Stack:** Astro 5 SSG, scoped component styles, `astro:page-load` event, TypeScript flat-key i18n (`TranslationKey` union).

**Spec:** `docs/superpowers/specs/2026-04-20-services-redesign-v3-design.md`
**Design source:** `.design-ref/servicios.html` (mirror of Claude Design `servicios.html`)

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `src/i18n/es.ts` | modify | Add ~80 services keys, update 6 pillar bodies, remove 9 orbit-era keys (Task 2) |
| `src/i18n/en.ts` | modify | Mirror `es.ts` with EN translations |
| `src/components/sections/ServicesSection.astro` | create | Monolithic six-block services page — hero, áreas accordion, model intro, six pillars, manifest, CTA |
| `src/pages/servicios.astro` | modify | Render `<ServicesSection lang="es" />` |
| `src/pages/en/services.astro` | modify | Render `<ServicesSection lang="en" />` |
| `src/components/sections/ServicesOrbit3D.astro` | delete | Obsolete 3D carousel (703 lines) |
| `src/lib/servicesItems.ts` | modify | Drop `icon`/`short`, add `tags[]` |

**Branch:** `feat/servicios-redesign-v3` (created off `main`, already checked out).

**Dev server:** already running at http://localhost:4321 (bash ID `b45cytlc8`).

**Token strategy:** follow existing project pattern — `var(--color-ph-X, #literal)` with inline fallbacks in scoped styles (same as `HomeServicesSection`, `HomeContactSection`). Do **not** add tokens to `global.css`; fallbacks are the single source of truth.

---

## Task 1: Preflight — verify design ref and server

**Files:** no changes

- [ ] **Step 1: Verify design reference is present**

Run: `ls .design-ref/servicios.html .design-ref/shared.css`
Expected: both files listed. If missing, abort and report.

- [ ] **Step 2: Verify dev server is up**

Run: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4321/servicios`
Expected: `200`. If server is down, start it with `npm run dev` in the background.

- [ ] **Step 3: Baseline smoke of current site**

Run: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:4321/en/services`
Expected: `200`.

No commit — this task is preflight only.

---

## Task 2: i18n ES — add new keys + update pillar bodies

**Files:**
- Modify: `src/i18n/es.ts`

Goal: add all new `services.*` keys required by the new layout, and update the 6 pillar `body` texts to the new editorial copy. Do **not** remove obsolete keys yet (removal happens in Task 8 once nothing references them).

- [ ] **Step 1: Update pillar body copy (6 edits)**

In `src/i18n/es.ts`, replace the 6 existing pillar `.body` values (leave `.title` and `.short` unchanged — `.short` is removed in Task 8):

```ts
  'services.items.press.body': 'Gestión de imagen y reputación, relación con medios y posicionamiento público del jugador. Cada aparición es una decisión.',
  'services.items.performance.body': 'Análisis físico y performance. Seguimiento continuo. Optimización del rendimiento deportivo.',
  'services.items.media.body': 'Estrategia de comunicación digital, creación de contenido y gestión de redes sociales. Definimos la voz y el universo visual del jugador.',
  'services.items.familyOffice.body': 'Gestión patrimonial, planificación financiera y fiscal, y estructura administrativa del jugador. Lo que se construye debe durar más que una carrera.',
  'services.items.psychology.body': 'Preparación mental de alto rendimiento, gestión de presión y hábitos. Acompañamiento competitivo continuo.',
  'services.items.actionPlan.body': 'Gestión y revisión de contratos. Estrategia de mercado y posicionamiento internacional. Soporte integral dentro y fuera del campo. Adaptación a cada etapa de la carrera.',
```

- [ ] **Step 2: Add hero + áreas header keys**

Append these keys inside the `// --- Servicios (página) ---` block of `src/i18n/es.ts`, just after the existing pillar keys (but before `'services.blocksAriaLabel'`):

```ts
  // Hero
  'services.hero.eyebrow': '03 · Servicios',
  'services.hero.titleLead': 'Un equipo',
  'services.hero.titleRest': 'fuera del ',
  'services.hero.titleAccent': 'campo',
  'services.hero.lead': 'Representación estratégica, visión internacional y enfoque a largo plazo. Cinco áreas de gestión y seis pilares del modelo operativo — bajo un mismo techo, alineados con una sola persona: el jugador.',

  // Áreas header
  'services.areas.eyebrow': 'Áreas de gestión',
  'services.areas.kicker': '05 disciplinas · 01 equipo',
  'services.areas.titleLead': 'Gestionamos tu carrera. Cuidamos tu ',
  'services.areas.titleAccent1': 'presente',
  'services.areas.titleMid': ' y planificamos tu ',
  'services.areas.titleAccent2': 'futuro',
  'services.areas.titleTrail': '.',
  'services.areas.foot': 'ACOMPAÑAMIENTO 360º · SERVICIO 365',
  'services.areas.leadLabel': 'Descripción',
```

- [ ] **Step 3: Add áreas items (5 × 6 keys = 30)**

Append immediately after Step 2 block:

```ts
  // Áreas — 01 Representación e intermediación
  'services.areas.items.management.title': 'Representación e intermediación',
  'services.areas.items.management.lead': 'Negociamos y protegemos todos los términos de la relación entre jugador y club. Nuestra misión es asegurar las mejores condiciones posibles — deportivas, económicas y personales — en cada decisión.',
  'services.areas.items.management.bullet1': 'Negociación de contratos profesionales',
  'services.areas.items.management.bullet2': 'Relación directa con clubes y decisores',
  'services.areas.items.management.bullet3': 'Protección de intereses deportivos y económicos',
  'services.areas.items.management.bullet4': 'Transferencias nacionales e internacionales',

  // Áreas — 02 Planificación de carrera
  'services.areas.items.career.title': 'Planificación de carrera',
  'services.areas.items.career.lead': 'Cada decisión cuenta. Analizamos oportunidades, contexto competitivo y momento deportivo para construir una trayectoria coherente, sostenible y ambiciosa.',
  'services.areas.items.career.bullet1': 'Toma de decisiones deportivas clave',
  'services.areas.items.career.bullet2': 'Análisis de oportunidades y evolución',
  'services.areas.items.career.bullet3': 'Construcción de una carrera sostenible',
  'services.areas.items.career.bullet4': 'Estrategia a corto, medio y largo plazo',

  // Áreas — 03 Acceso internacional
  'services.areas.items.international.title': 'Acceso internacional',
  'services.areas.items.international.lead': 'Una red activa en 12 países y oficinas propias en seis mercados clave. Abrimos puertas reales y acompañamos al jugador en cada adaptación.',
  'services.areas.items.international.bullet1': 'Estrategia de mercado y posicionamiento',
  'services.areas.items.international.bullet2': 'Red activa en 12 países',
  'services.areas.items.international.bullet3': 'Oficinas en ESP, PT, UK, DE, KSA y UY',
  'services.areas.items.international.bullet4': 'Adaptación a cada etapa de la carrera',

  // Áreas — 04 Comunicación y marketing
  'services.areas.items.comms.title': 'Comunicación y marketing',
  'services.areas.items.comms.lead': 'Desarrollamos la marca personal del jugador dentro y fuera del campo, con un enfoque editorial que refuerza su imagen pública y abre nuevas líneas de ingreso.',
  'services.areas.items.comms.bullet1': 'Desarrollo de marca personal',
  'services.areas.items.comms.bullet2': 'Estrategia digital y redes sociales',
  'services.areas.items.comms.bullet3': 'Gestión de imagen pública',
  'services.areas.items.comms.bullet4': 'Activación de patrocinios',

  // Áreas — 05 Asesoramiento legal y financiero
  'services.areas.items.legal.title': 'Asesoramiento legal y financiero',
  'services.areas.items.legal.lead': 'Estructura jurídica y financiera dedicada: contratos, imagen, fiscalidad y patrimonio. Cuidamos lo que hoy se construye para que dure mucho después de la retirada.',
  'services.areas.items.legal.bullet1': 'Contratos y derechos de imagen',
  'services.areas.items.legal.bullet2': 'Protección patrimonial',
  'services.areas.items.legal.bullet3': 'Optimización fiscal y planificación',
  'services.areas.items.legal.bullet4': 'Supervisión y control financiero',
```

- [ ] **Step 4: Add model intro + pillar tags + manifest + CTA keys**

Append immediately after Step 3 block:

```ts
  // Model intro
  'services.model.eyebrow': 'Modelo operativo PHSPORT',
  'services.model.titleLead': 'Más allá de la representación, desarrollamos una estructura ',
  'services.model.titleAccent': 'integral',
  'services.model.titleTrail': '.',
  'services.model.lead': 'Seis pilares especializados que acompañan al jugador en todas las áreas clave de su carrera.',

  // Pillar tags
  'services.items.press.tag1': 'Imagen pública',
  'services.items.press.tag2': 'Medios',
  'services.items.press.tag3': 'Posicionamiento',
  'services.items.performance.tag1': 'Análisis físico',
  'services.items.performance.tag2': 'Performance',
  'services.items.performance.tag3': 'Seguimiento',
  'services.items.performance.tag4': 'Optimización',
  'services.items.media.tag1': 'Estrategia digital',
  'services.items.media.tag2': 'Contenido',
  'services.items.media.tag3': 'Redes sociales',
  'services.items.media.tag4': 'Marca personal',
  'services.items.familyOffice.tag1': 'Patrimonio',
  'services.items.familyOffice.tag2': 'Fiscal',
  'services.items.familyOffice.tag3': 'Planificación',
  'services.items.familyOffice.tag4': 'Administración',
  'services.items.psychology.tag1': 'Alto rendimiento',
  'services.items.psychology.tag2': 'Presión competitiva',
  'services.items.psychology.tag3': 'Hábitos',
  'services.items.actionPlan.tag1': 'Contratos',
  'services.items.actionPlan.tag2': 'Mercado internacional',
  'services.items.actionPlan.tag3': 'Servicio 365',

  // Manifest
  'services.manifest.eyebrow': 'ACOMPAÑAMIENTO 360º · SERVICIO 365',
  'services.manifest.bodyLead': 'En PHSPORT no solo representamos jugadores, ',
  'services.manifest.bodyAccent': 'construimos estructuras',
  'services.manifest.bodyTrail': ' que maximizan su rendimiento, estabilidad y proyección a largo plazo.',

  // CTA
  'services.cta.eyebrow': '¿EMPEZAMOS?',
  'services.cta.titleLead': 'Un equipo para cada decisión. ',
  'services.cta.titleAccent': 'Una conversación',
  'services.cta.titleTrail': ' para empezar.',
  'services.cta.lead': 'Cuéntanos sobre ti o tu club. Respondemos en 48h.',
  'services.cta.button': 'Contactar con la agencia',
```

- [ ] **Step 5: Type-check**

Run: `npx astro check`
Expected: no new type errors (the new keys extend `TranslationKey`; Task 3 will add matching `en.ts` entries).

**Note:** until Task 3 is complete, `en.ts` will be missing these keys — TypeScript will complain about missing keys in `Record<TranslationKey, string>`. This is expected; Task 3 closes the loop. If needed, temporarily use `as const satisfies Partial<Record<TranslationKey, string>>` is NOT required — just proceed, the full check runs after Task 3.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/es.ts
git commit -m "$(cat <<'EOF'
i18n(services): add V3 keys + update pillar bodies (ES)

Adds hero, áreas accordion (5 items × 6 keys), model intro, pillar tags
(6 × 3–4), manifest, and CTA keys. Updates the 6 pillar body texts to
the new editorial copy from .design-ref/servicios.html.

Obsolete orbit-era keys (.short, orbitInstructions, modalAriaLabel,
blocksAriaLabel) are kept until nothing references them — removed in
Task 8.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: i18n EN — mirror all Task 2 additions

**Files:**
- Modify: `src/i18n/en.ts`

Goal: add the same keys to `en.ts` in the same order, with EN translations. `en.ts` is typed `Record<TranslationKey, string>` so every key added in `es.ts` must also exist here.

- [ ] **Step 1: Update pillar body copy (6 edits — EN)**

Replace the 6 existing `.body` values:

```ts
  'services.items.press.body': 'Image and reputation management, media relations, and public positioning of the player. Every appearance is a decision.',
  'services.items.performance.body': 'Physical and performance analysis. Continuous tracking. Sporting performance optimization.',
  'services.items.media.body': 'Digital communication strategy, content creation, and social media management. We define the voice and visual universe of the player.',
  'services.items.familyOffice.body': 'Wealth management, financial and tax planning, and administrative structure for the player. What is built must last longer than a career.',
  'services.items.psychology.body': 'High-performance mental preparation, pressure management, and habits. Continuous competitive support.',
  'services.items.actionPlan.body': 'Contract management and review. Market strategy and international positioning. Integrated support on and off the pitch. Adaptation at every career stage.',
```

- [ ] **Step 2: Add hero + áreas header keys (EN)**

Append inside the `// --- Servicios (página) ---` block, mirroring Task 2 Step 2 order:

```ts
  // Hero
  'services.hero.eyebrow': '03 · Services',
  'services.hero.titleLead': 'A team',
  'services.hero.titleRest': 'off the ',
  'services.hero.titleAccent': 'pitch',
  'services.hero.lead': 'Strategic representation, international reach, and long-term focus. Five management areas and six operating pillars — under one roof, aligned with one person: the player.',

  // Áreas header
  'services.areas.eyebrow': 'Management areas',
  'services.areas.kicker': '05 disciplines · 01 team',
  'services.areas.titleLead': 'We manage your career. We look after your ',
  'services.areas.titleAccent1': 'present',
  'services.areas.titleMid': ' and plan your ',
  'services.areas.titleAccent2': 'future',
  'services.areas.titleTrail': '.',
  'services.areas.foot': '360° SUPPORT · 365 SERVICE',
  'services.areas.leadLabel': 'Description',
```

- [ ] **Step 3: Add áreas items (5 × 6 keys — EN)**

```ts
  // Áreas — 01 Representation & intermediation
  'services.areas.items.management.title': 'Representation & intermediation',
  'services.areas.items.management.lead': 'We negotiate and protect every term of the relationship between player and club. Our mission is to secure the best possible conditions — sporting, financial, and personal — in every decision.',
  'services.areas.items.management.bullet1': 'Professional contract negotiation',
  'services.areas.items.management.bullet2': 'Direct relationship with clubs and decision-makers',
  'services.areas.items.management.bullet3': 'Protection of sporting and financial interests',
  'services.areas.items.management.bullet4': 'Domestic and international transfers',

  // Áreas — 02 Career planning
  'services.areas.items.career.title': 'Career planning',
  'services.areas.items.career.lead': 'Every decision counts. We analyze opportunities, competitive context, and sporting momentum to build a coherent, sustainable, and ambitious trajectory.',
  'services.areas.items.career.bullet1': 'Key sporting decisions',
  'services.areas.items.career.bullet2': 'Opportunity and evolution analysis',
  'services.areas.items.career.bullet3': 'Building a sustainable career',
  'services.areas.items.career.bullet4': 'Short, mid, and long-term strategy',

  // Áreas — 03 International access
  'services.areas.items.international.title': 'International access',
  'services.areas.items.international.lead': 'An active network in 12 countries and owned offices in six key markets. We open real doors and stand by the player through every adaptation.',
  'services.areas.items.international.bullet1': 'Market strategy and positioning',
  'services.areas.items.international.bullet2': 'Active network in 12 countries',
  'services.areas.items.international.bullet3': 'Offices in ESP, PT, UK, DE, KSA, and UY',
  'services.areas.items.international.bullet4': 'Adaptation at every career stage',

  // Áreas — 04 Communication & marketing
  'services.areas.items.comms.title': 'Communication & marketing',
  'services.areas.items.comms.lead': "We develop the player's personal brand on and off the pitch, with an editorial approach that strengthens their public image and opens new revenue streams.",
  'services.areas.items.comms.bullet1': 'Personal brand development',
  'services.areas.items.comms.bullet2': 'Digital and social strategy',
  'services.areas.items.comms.bullet3': 'Public image management',
  'services.areas.items.comms.bullet4': 'Sponsorship activation',

  // Áreas — 05 Legal and financial advisory
  'services.areas.items.legal.title': 'Legal and financial advisory',
  'services.areas.items.legal.lead': 'A dedicated legal and financial structure: contracts, image rights, taxation, and wealth. We care for what is built today so it lasts long after retirement.',
  'services.areas.items.legal.bullet1': 'Contracts and image rights',
  'services.areas.items.legal.bullet2': 'Wealth protection',
  'services.areas.items.legal.bullet3': 'Tax optimization and planning',
  'services.areas.items.legal.bullet4': 'Financial oversight and control',
```

- [ ] **Step 4: Add model + tags + manifest + CTA keys (EN)**

```ts
  // Model intro
  'services.model.eyebrow': 'PHSPORT operating model',
  'services.model.titleLead': 'Beyond representation, we build an ',
  'services.model.titleAccent': 'integrated',
  'services.model.titleTrail': '.',
  'services.model.lead': 'Six specialized pillars that support the player across every key area of their career.',

  // Pillar tags
  'services.items.press.tag1': 'Public image',
  'services.items.press.tag2': 'Media',
  'services.items.press.tag3': 'Positioning',
  'services.items.performance.tag1': 'Physical analysis',
  'services.items.performance.tag2': 'Performance',
  'services.items.performance.tag3': 'Tracking',
  'services.items.performance.tag4': 'Optimization',
  'services.items.media.tag1': 'Digital strategy',
  'services.items.media.tag2': 'Content',
  'services.items.media.tag3': 'Social media',
  'services.items.media.tag4': 'Personal brand',
  'services.items.familyOffice.tag1': 'Wealth',
  'services.items.familyOffice.tag2': 'Tax',
  'services.items.familyOffice.tag3': 'Planning',
  'services.items.familyOffice.tag4': 'Administration',
  'services.items.psychology.tag1': 'High performance',
  'services.items.psychology.tag2': 'Competitive pressure',
  'services.items.psychology.tag3': 'Habits',
  'services.items.actionPlan.tag1': 'Contracts',
  'services.items.actionPlan.tag2': 'International market',
  'services.items.actionPlan.tag3': '365 service',

  // Manifest
  'services.manifest.eyebrow': '360° SUPPORT · 365 SERVICE',
  'services.manifest.bodyLead': "At PHSPORT we don't just represent players, ",
  'services.manifest.bodyAccent': 'we build structures',
  'services.manifest.bodyTrail': ' that maximize their performance, stability, and long-term projection.',

  // CTA
  'services.cta.eyebrow': 'SHALL WE BEGIN?',
  'services.cta.titleLead': 'A team for every decision. ',
  'services.cta.titleAccent': 'One conversation',
  'services.cta.titleTrail': ' to begin.',
  'services.cta.lead': 'Tell us about yourself or your club. We reply within 48 hours.',
  'services.cta.button': 'Contact the agency',
```

**Note on `services.items.psychology.title`:** the EN currently reads `'Sport Psychology'`. The new design uses just `'Psychology'`. Update it:

```ts
  'services.items.psychology.title': 'Psychology',
```

- [ ] **Step 5: Type-check**

Run: `npx astro check`
Expected: zero type errors. Every `TranslationKey` from `es.ts` has a matching `en.ts` entry.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/en.ts
git commit -m "$(cat <<'EOF'
i18n(services): add V3 keys + update pillar bodies (EN)

Mirrors es.ts Task 2 additions with EN translations. Changes
services.items.psychology.title from 'Sport Psychology' to 'Psychology'
to match the design. All new keys pass TypeScript's
Record<TranslationKey, string> check.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: ServicesSection — frontmatter + hero + áreas accordion

**Files:**
- Create: `src/components/sections/ServicesSection.astro`

Goal: create the component with its frontmatter, hero block, áreas accordion markup + CSS, and the script that wires exclusive-open behavior. Subsequent tasks (5, 6) append more blocks to the same file.

- [ ] **Step 1: Write component frontmatter + hero markup + áreas markup**

Create `src/components/sections/ServicesSection.astro` with this full content (the `<style>` and `<script>` blocks will grow across Tasks 4–6):

```astro
---
import { getServicesItems } from '@/lib/servicesItems';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const items = getServicesItems(lang);

const areas = [
  {
    key: 'management',
    title: t('services.areas.items.management.title'),
    lead: t('services.areas.items.management.lead'),
    bullets: [
      t('services.areas.items.management.bullet1'),
      t('services.areas.items.management.bullet2'),
      t('services.areas.items.management.bullet3'),
      t('services.areas.items.management.bullet4'),
    ],
  },
  {
    key: 'career',
    title: t('services.areas.items.career.title'),
    lead: t('services.areas.items.career.lead'),
    bullets: [
      t('services.areas.items.career.bullet1'),
      t('services.areas.items.career.bullet2'),
      t('services.areas.items.career.bullet3'),
      t('services.areas.items.career.bullet4'),
    ],
  },
  {
    key: 'international',
    title: t('services.areas.items.international.title'),
    lead: t('services.areas.items.international.lead'),
    bullets: [
      t('services.areas.items.international.bullet1'),
      t('services.areas.items.international.bullet2'),
      t('services.areas.items.international.bullet3'),
      t('services.areas.items.international.bullet4'),
    ],
  },
  {
    key: 'comms',
    title: t('services.areas.items.comms.title'),
    lead: t('services.areas.items.comms.lead'),
    bullets: [
      t('services.areas.items.comms.bullet1'),
      t('services.areas.items.comms.bullet2'),
      t('services.areas.items.comms.bullet3'),
      t('services.areas.items.comms.bullet4'),
    ],
  },
  {
    key: 'legal',
    title: t('services.areas.items.legal.title'),
    lead: t('services.areas.items.legal.lead'),
    bullets: [
      t('services.areas.items.legal.bullet1'),
      t('services.areas.items.legal.bullet2'),
      t('services.areas.items.legal.bullet3'),
      t('services.areas.items.legal.bullet4'),
    ],
  },
];

const contactHref = lang === 'en' ? '/en/#contacto' : '/#contacto';
---

<section class="srv" aria-labelledby="srv-hero-title">
  {/* 01 — Hero */}
  <div class="srv-hero">
    <div class="srv-hero__eyebrow">
      <span class="srv-mono">{t('services.hero.eyebrow')}</span>
    </div>
    <div class="srv-hero__grid">
      <h1 class="srv-hero__title" id="srv-hero-title">
        {t('services.hero.titleLead')}<br />
        {t('services.hero.titleRest')}<em>{t('services.hero.titleAccent')}</em>.
      </h1>
      <p class="srv-hero__lead">{t('services.hero.lead')}</p>
    </div>
    <hr class="srv-rule" />
  </div>

  {/* 02 — Áreas de gestión (accordion) */}
  <div class="srv-areas">
    <header class="srv-areas__head">
      <div class="srv-areas__eyebrow">
        <span class="srv-mono">{t('services.areas.eyebrow')}</span>
        <span class="srv-areas__kicker srv-mono">{t('services.areas.kicker')}</span>
      </div>
      <h2 class="srv-areas__title">
        {t('services.areas.titleLead')}<em>{t('services.areas.titleAccent1')}</em>{t('services.areas.titleMid')}<em>{t('services.areas.titleAccent2')}</em>{t('services.areas.titleTrail')}
      </h2>
    </header>

    <ol class="srv-areas__list" role="list">
      {areas.map((area, idx) => {
        const open = idx === 0;
        const panelId = `srv-area-panel-${area.key}`;
        const buttonId = `srv-area-button-${area.key}`;
        return (
          <li class:list={['srv-area-row', { 'is-open': open }]}>
            <button
              type="button"
              class="srv-area-row__summary"
              id={buttonId}
              aria-expanded={open ? 'true' : 'false'}
              aria-controls={panelId}
              data-srv-area-toggle
            >
              <span class="srv-area-row__num srv-mono">{String(idx + 1).padStart(2, '0')}</span>
              <span class="srv-area-row__title">{area.title}</span>
              <span class="srv-area-row__toggle" aria-hidden="true">
                <span></span><span></span>
              </span>
            </button>
            <div
              class="srv-area-row__panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
            >
              <div class="srv-area-row__body">
                <div class="srv-area-row__lead">
                  <span class="srv-mono srv-area-row__leadLabel">{t('services.areas.leadLabel')}</span>
                  <p>{area.lead}</p>
                </div>
                <ul class="srv-area-row__bullets" role="list">
                  {area.bullets.map((b) => (
                    <li><span class="srv-bullet-dash" aria-hidden="true"></span>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ol>

    <div class="srv-areas__foot srv-mono">{t('services.areas.foot')}</div>
  </div>
</section>

<style>
  :root, .srv {
    /* Local aliases — resolve to project tokens when present, else fall back to design defaults */
    --srv-bg: var(--color-ph-black, #0d0f12);
    --srv-bg-2: var(--color-ph-bg-2, #15171b);
    --srv-bg-3: var(--color-ph-bg-3, #1d2025);
    --srv-ink: var(--color-ph-white, #ffffff);
    --srv-ink-soft: var(--color-ph-ink-soft, #b5b7bb);
    --srv-ink-faint: var(--color-ph-ink-faint, #6f7278);
    --srv-line: var(--color-ph-line, rgba(255, 255, 255, 0.12));
    --srv-line-strong: var(--color-ph-line-strong, rgba(255, 255, 255, 0.24));
    --srv-gold: var(--color-ph-gold, #d6b25e);
    --srv-gold-soft: var(--color-ph-gold-soft, #e6c682);
    --srv-edge: var(--ph-section-px, clamp(20px, 4vw, 48px));
    --srv-display: var(--font-display, 'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif);
    --srv-mono: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
    --srv-sans: var(--font-body, 'Helvetica Neue', Helvetica, Arial, sans-serif);
  }

  .srv {
    background: var(--srv-bg);
    color: var(--srv-ink);
    font-family: var(--srv-sans);
  }

  .srv-mono {
    font-family: var(--srv-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--srv-ink-faint);
  }

  .srv-rule { border: 0; border-top: 1px solid var(--srv-line); margin: 0; }

  /* ── 01 Hero ──────────────────────────────────────────── */
  .srv-hero {
    padding: clamp(96px, 14vw, 180px) var(--srv-edge) clamp(40px, 6vw, 72px);
  }
  .srv-hero__eyebrow {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: clamp(24px, 4vw, 40px);
  }
  .srv-hero__eyebrow::before {
    content: ""; width: 28px; height: 1px; background: var(--srv-gold);
  }
  .srv-hero__eyebrow .srv-mono { color: var(--srv-gold); }
  .srv-hero__grid {
    display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(32px, 5vw, 80px);
    align-items: end;
    margin-bottom: clamp(40px, 6vw, 80px);
  }
  .srv-hero__title {
    font-family: var(--srv-display);
    font-weight: 500;
    font-size: clamp(48px, 8vw, 108px);
    letter-spacing: -0.03em;
    line-height: 0.98;
    margin: 0;
    color: var(--srv-ink);
  }
  .srv-hero__title em {
    font-style: italic;
    color: var(--srv-gold);
    font-weight: 400;
  }
  .srv-hero__lead {
    font-size: 15px;
    line-height: 1.7;
    color: var(--srv-ink-soft);
    max-width: 420px;
    margin: 0;
  }

  @media (max-width: 900px) {
    .srv-hero__grid { grid-template-columns: 1fr; gap: 32px; }
  }

  /* ── 02 Áreas accordion ──────────────────────────────── */
  .srv-areas {
    padding: clamp(56px, 8vw, 120px) var(--srv-edge);
    border-top: 1px solid var(--srv-line);
  }
  .srv-areas__head {
    display: grid; grid-template-columns: 1fr 1.6fr; gap: clamp(24px, 4vw, 64px);
    align-items: start;
    margin-bottom: clamp(48px, 7vw, 88px);
  }
  @media (max-width: 900px) {
    .srv-areas__head { grid-template-columns: 1fr; gap: 20px; }
  }
  .srv-areas__eyebrow {
    display: flex; flex-direction: column; gap: 12px;
  }
  .srv-areas__eyebrow .srv-mono:first-child { color: var(--srv-gold); }
  .srv-areas__eyebrow .srv-mono:first-child::before {
    content: ""; display: inline-block; width: 28px; height: 1px;
    background: var(--srv-gold); vertical-align: middle; margin-right: 10px;
  }
  .srv-areas__kicker { color: var(--srv-ink-faint); }
  .srv-areas__title {
    font-family: var(--srv-display);
    font-weight: 500;
    font-size: clamp(32px, 5vw, 64px);
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin: 0;
    color: var(--srv-ink);
  }
  .srv-areas__title em { font-style: italic; color: var(--srv-gold); font-weight: 400; }

  .srv-areas__list {
    list-style: none; margin: 0; padding: 0;
    border-top: 1px solid var(--srv-line);
  }
  .srv-area-row { border-bottom: 1px solid var(--srv-line); }

  .srv-area-row__summary {
    all: unset;
    display: grid; grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: clamp(16px, 2.5vw, 32px);
    width: 100%;
    padding: clamp(22px, 3vw, 32px) 0;
    cursor: pointer;
    color: var(--srv-ink);
    transition: color 0.3s;
  }
  .srv-area-row__summary:hover,
  .srv-area-row.is-open .srv-area-row__summary { color: var(--srv-gold); }
  .srv-area-row__summary:focus-visible {
    outline: 2px solid var(--srv-gold);
    outline-offset: 4px;
  }

  .srv-area-row__num {
    color: var(--srv-gold);
    font-family: var(--srv-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
  }
  .srv-area-row__title {
    font-family: var(--srv-display);
    font-weight: 500;
    font-size: clamp(24px, 3.2vw, 40px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .srv-area-row__toggle {
    position: relative;
    width: 40px; height: 40px;
    border: 1px solid var(--srv-line-strong);
    border-radius: 999px;
    flex-shrink: 0;
    transition: transform 0.4s cubic-bezier(.7, 0, .2, 1), border-color 0.3s;
  }
  .srv-area-row__toggle span {
    position: absolute; top: 50%; left: 50%;
    width: 14px; height: 1px;
    background: currentColor;
    transform: translate(-50%, -50%);
  }
  .srv-area-row__toggle span:last-child {
    transform: translate(-50%, -50%) rotate(90deg);
    transition: transform 0.4s cubic-bezier(.7, 0, .2, 1);
  }
  .srv-area-row.is-open .srv-area-row__toggle {
    transform: rotate(45deg);
    border-color: var(--srv-gold);
  }
  .srv-area-row.is-open .srv-area-row__toggle span:last-child {
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .srv-area-row__panel {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.55s cubic-bezier(.7, 0, .2, 1), opacity 0.3s;
  }
  .srv-area-row.is-open .srv-area-row__panel {
    max-height: 800px;
    opacity: 1;
  }
  .srv-area-row__body {
    display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 64px);
    padding: 0 0 clamp(28px, 4vw, 40px);
  }
  @media (max-width: 900px) {
    .srv-area-row__body { grid-template-columns: 1fr; gap: 24px; }
  }
  .srv-area-row__leadLabel {
    display: block; color: var(--srv-gold);
    margin-bottom: 10px;
  }
  .srv-area-row__lead p {
    margin: 0;
    color: var(--srv-ink-soft);
    font-size: 15px;
    line-height: 1.7;
    max-width: 520px;
  }
  .srv-area-row__bullets {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 14px;
  }
  .srv-area-row__bullets li {
    display: flex; align-items: baseline; gap: 14px;
    color: var(--srv-ink-soft);
    font-size: 15px;
    line-height: 1.5;
  }
  .srv-bullet-dash {
    display: inline-block; width: 10px; height: 1px;
    background: var(--srv-gold);
    flex-shrink: 0;
    transform: translateY(-4px);
  }

  .srv-areas__foot {
    margin-top: clamp(32px, 4vw, 48px);
    color: var(--srv-ink-faint);
    text-align: right;
  }

  @media (prefers-reduced-motion: reduce) {
    .srv-area-row__summary,
    .srv-area-row__toggle,
    .srv-area-row__toggle span,
    .srv-area-row__panel { transition: none !important; }
  }
</style>

<script>
  function initSrvAccordion() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-srv-area-toggle]');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.srv-area-row');
        if (!row) return;
        const wasOpen = row.classList.contains('is-open');

        document.querySelectorAll('.srv-area-row').forEach((r) => {
          r.classList.remove('is-open');
          const b = r.querySelector<HTMLButtonElement>('[data-srv-area-toggle]');
          if (b) b.setAttribute('aria-expanded', 'false');
        });

        if (!wasOpen) {
          row.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  document.addEventListener('astro:page-load', initSrvAccordion);
</script>
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: zero errors (component uses `getServicesItems` which still has the old shape — `icon`/`short` unused here, `title`/`body` used — no type break yet).

- [ ] **Step 3: Visual smoke**

The component isn't wired into any page yet. Skip visual verification here; Task 7 does the wiring + smoke.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ServicesSection.astro
git commit -m "$(cat <<'EOF'
feat(services): add ServicesSection — hero + áreas accordion

Creates the monolithic Services page component with the first two
blocks: editorial hero and the five-row áreas accordion. Accordion uses
a semantic <button> per row with aria-expanded/aria-controls; exclusive-
open behavior (one open at a time, first default-open) is wired via
astro:page-load. Reduced-motion honored.

Model intro, six pillars, manifest, and CTA added in subsequent tasks.
Not yet wired into any page.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: ServicesSection — model intro + six pillar blocks

**Files:**
- Modify: `src/components/sections/ServicesSection.astro`

Goal: append model intro and six alternating pillar blocks to the component.

- [ ] **Step 1: Append model intro + pillars markup**

In `src/components/sections/ServicesSection.astro`, add the following blocks inside the `<section class="srv">` element, **after** the closing `</div>` of `.srv-areas` and **before** the closing `</section>` tag:

```astro
  {/* 03 — Model intro */}
  <div class="srv-model">
    <div class="srv-model__stem" aria-hidden="true"></div>
    <div class="srv-model__inner">
      <div class="srv-model__eyebrow">
        <span class="srv-mono">{t('services.model.eyebrow')}</span>
      </div>
      <h2 class="srv-model__title">
        {t('services.model.titleLead')}<em>{t('services.model.titleAccent')}</em>{t('services.model.titleTrail')}
      </h2>
      <p class="srv-model__lead">{t('services.model.lead')}</p>
    </div>
  </div>

  {/* 04 — Six pillar blocks */}
  <div class="srv-pillars" role="list">
    {items.map((item, idx) => {
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'][idx];
      const even = idx % 2 === 1;
      return (
        <article class:list={['srv-block', { 'srv-block--even': even }]} role="listitem">
          <div class="srv-block__text">
            <div class="srv-block__roman">{roman}</div>
            <h3 class="srv-block__title">{item.title}</h3>
            <p class="srv-block__body">{item.body}</p>
            <div class="srv-block__tags">
              {item.tags.map((tag) => (
                <span class="srv-tag srv-mono">{tag}</span>
              ))}
            </div>
          </div>
          <div class="srv-block__img" aria-hidden="true">
            <span class="srv-block__imgTag srv-mono">{roman} / VI</span>
          </div>
        </article>
      );
    })}
  </div>
```

- [ ] **Step 2: Append model + pillar CSS to the existing `<style>` block**

Add the following at the end of the existing `<style>` block (before the closing `</style>`):

```css
  /* ── 03 Model intro ──────────────────────────────────── */
  .srv-model {
    border-top: 1px solid var(--srv-line);
    padding: clamp(48px, 7vw, 96px) var(--srv-edge) clamp(56px, 8vw, 96px);
    text-align: center;
    position: relative;
  }
  .srv-model__stem {
    width: 1px;
    height: clamp(40px, 6vw, 72px);
    background: var(--srv-line-strong);
    margin: 0 auto clamp(24px, 3vw, 40px);
  }
  .srv-model__inner { max-width: 900px; margin: 0 auto; }
  .srv-model__eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: clamp(16px, 2vw, 24px);
  }
  .srv-model__eyebrow::before,
  .srv-model__eyebrow::after {
    content: ""; width: 28px; height: 1px; background: var(--srv-gold);
  }
  .srv-model__eyebrow .srv-mono { color: var(--srv-gold); }
  .srv-model__title {
    font-family: var(--srv-display);
    font-weight: 500;
    font-size: clamp(28px, 4vw, 52px);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 0 clamp(18px, 2.5vw, 28px);
    color: var(--srv-ink);
  }
  .srv-model__title em { font-style: italic; color: var(--srv-gold); font-weight: 400; }
  .srv-model__lead {
    font-size: 15px;
    line-height: 1.7;
    color: var(--srv-ink-soft);
    max-width: 680px;
    margin: 0 auto;
  }

  /* ── 04 Pillar blocks ────────────────────────────────── */
  .srv-pillars { display: flex; flex-direction: column; }

  .srv-block {
    display: grid; grid-template-columns: 1fr 1fr;
    min-height: clamp(420px, 58vw, 640px);
    border-top: 1px solid var(--srv-line);
  }
  .srv-block:nth-child(even) { background: var(--srv-bg-2); }

  .srv-block__text {
    padding: clamp(48px, 7vw, 96px) var(--srv-edge);
    display: flex; flex-direction: column; justify-content: center;
    gap: clamp(16px, 2vw, 24px);
  }
  .srv-block__roman {
    font-family: var(--srv-display);
    font-style: italic;
    font-weight: 500;
    color: var(--srv-gold);
    font-size: clamp(56px, 9vw, 120px);
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .srv-block__title {
    font-family: var(--srv-display);
    font-weight: 500;
    font-size: clamp(36px, 5.5vw, 72px);
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0;
    color: var(--srv-ink);
  }
  .srv-block__body {
    font-size: 15px;
    line-height: 1.7;
    color: var(--srv-ink-soft);
    max-width: 480px;
    margin: 0;
  }
  .srv-block__tags {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-top: 4px;
  }
  .srv-tag {
    display: inline-flex; align-items: center;
    padding: 6px 12px;
    border: 1px solid var(--srv-line-strong);
    border-radius: 999px;
    color: var(--srv-ink-soft);
    font-size: 10px;
    letter-spacing: 0.15em;
    background: transparent;
  }

  .srv-block__img {
    position: relative;
    background:
      repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 10px),
      var(--srv-bg-2);
    border-left: 1px solid var(--srv-line);
    min-height: clamp(240px, 50vw, 520px);
  }
  .srv-block--even .srv-block__img { order: -1; border-left: 0; border-right: 1px solid var(--srv-line); }
  .srv-block--even .srv-block__text { order: 0; }
  .srv-block:nth-child(even) .srv-block__img {
    background:
      repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 10px),
      var(--srv-bg-3);
  }
  .srv-block__imgTag {
    position: absolute; top: 16px; left: 16px;
    background: rgba(14, 14, 14, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    color: var(--srv-ink);
    padding: 6px 10px;
    border: 1px solid var(--srv-line);
    border-radius: 4px;
  }

  @media (max-width: 900px) {
    .srv-block { grid-template-columns: 1fr; min-height: 0; }
    .srv-block__img,
    .srv-block--even .srv-block__img {
      order: -1;
      aspect-ratio: 16 / 10;
      border: 0; border-bottom: 1px solid var(--srv-line);
      min-height: 0;
    }
    .srv-block--even .srv-block__text { order: 0; }
    .srv-block__text { padding: clamp(40px, 8vw, 64px) var(--srv-edge); }
  }
```

- [ ] **Step 3: Type-check**

Run: `npx astro check`
Expected: type error on `item.tags` — `ServiceItem` does not yet have a `tags` field. This is **expected and acceptable for the in-progress branch**; Task 6 refactors the type and populates tags. Either:
- Proceed to Task 6 immediately (error is transient), OR
- Temporarily add `tags: []` to `ServiceItem` in `servicesItems.ts` as a bridge.

**Recommended:** bridge the type in this task to keep type-check green per commit. Apply the following mini-edit to `src/lib/servicesItems.ts`:

```ts
export type ServiceItem = {
  icon: 'users' | 'route' | 'scale' | 'megaphone' | 'globe';
  title: string;
  body: string;
  short: string;
  tags: string[];
};
```

And in each of the 6 returned items inside `getServicesItems`, append `tags` arrays pulling from the i18n keys added in Task 2/3:

```ts
    {
      icon: 'megaphone',
      title: t('services.items.press.title'),
      body: t('services.items.press.body'),
      short: t('services.items.press.short'),
      tags: [
        t('services.items.press.tag1'),
        t('services.items.press.tag2'),
        t('services.items.press.tag3'),
      ],
    },
    {
      icon: 'route',
      title: t('services.items.performance.title'),
      body: t('services.items.performance.body'),
      short: t('services.items.performance.short'),
      tags: [
        t('services.items.performance.tag1'),
        t('services.items.performance.tag2'),
        t('services.items.performance.tag3'),
        t('services.items.performance.tag4'),
      ],
    },
    {
      icon: 'globe',
      title: t('services.items.media.title'),
      body: t('services.items.media.body'),
      short: t('services.items.media.short'),
      tags: [
        t('services.items.media.tag1'),
        t('services.items.media.tag2'),
        t('services.items.media.tag3'),
        t('services.items.media.tag4'),
      ],
    },
    {
      icon: 'scale',
      title: t('services.items.familyOffice.title'),
      body: t('services.items.familyOffice.body'),
      short: t('services.items.familyOffice.short'),
      tags: [
        t('services.items.familyOffice.tag1'),
        t('services.items.familyOffice.tag2'),
        t('services.items.familyOffice.tag3'),
        t('services.items.familyOffice.tag4'),
      ],
    },
    {
      icon: 'users',
      title: t('services.items.psychology.title'),
      body: t('services.items.psychology.body'),
      short: t('services.items.psychology.short'),
      tags: [
        t('services.items.psychology.tag1'),
        t('services.items.psychology.tag2'),
        t('services.items.psychology.tag3'),
      ],
    },
    {
      icon: 'route',
      title: t('services.items.actionPlan.title'),
      body: t('services.items.actionPlan.body'),
      short: t('services.items.actionPlan.short'),
      tags: [
        t('services.items.actionPlan.tag1'),
        t('services.items.actionPlan.tag2'),
        t('services.items.actionPlan.tag3'),
      ],
    },
```

Re-run `npx astro check` — expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ServicesSection.astro src/lib/servicesItems.ts
git commit -m "$(cat <<'EOF'
feat(services): add model intro + six pillar blocks

Appends the model-intro transition block and the six alternating
pillar blocks to ServicesSection. Each pillar renders a Roman numeral,
title, body, tag chips, and a placeholder image column with diagonal
hash pattern + corner tag.

ServiceItem gains a tags: string[] field (icon/short kept for now — removed
in Task 8 alongside ServicesOrbit3D deletion). Tags are populated from
the per-item i18n keys added in Task 2/3.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: ServicesSection — manifest + final CTA

**Files:**
- Modify: `src/components/sections/ServicesSection.astro`

Goal: append the manifest quote and the final CTA button — completing the six-block layout.

- [ ] **Step 1: Append manifest + CTA markup**

Inside the `<section class="srv">` in `ServicesSection.astro`, add the following **after** the closing `</div>` of `.srv-pillars` and **before** the closing `</section>`:

```astro
  {/* 05 — Manifest */}
  <div class="srv-manifest">
    <div class="srv-manifest__eyebrow">
      <span class="srv-mono">{t('services.manifest.eyebrow')}</span>
    </div>
    <p class="srv-manifest__body">
      {t('services.manifest.bodyLead')}<br />
      <em>{t('services.manifest.bodyAccent')}</em>{t('services.manifest.bodyTrail')}
    </p>
  </div>

  {/* 06 — Final CTA */}
  <div class="srv-cta">
    <div class="srv-cta__eyebrow">
      <span class="srv-mono">{t('services.cta.eyebrow')}</span>
    </div>
    <h2 class="srv-cta__title">
      {t('services.cta.titleLead')}<br />
      <em>{t('services.cta.titleAccent')}</em>{t('services.cta.titleTrail')}
    </h2>
    <p class="srv-cta__lead">{t('services.cta.lead')}</p>
    <a class="srv-cta__btn" href={contactHref}>
      {t('services.cta.button')}
      <span class="srv-cta__arrow" aria-hidden="true">→</span>
    </a>
  </div>
```

- [ ] **Step 2: Append manifest + CTA CSS**

Add the following at the end of the existing `<style>` block:

```css
  /* ── 05 Manifest ─────────────────────────────────────── */
  .srv-manifest {
    border-top: 1px solid var(--srv-line);
    padding: clamp(72px, 11vw, 144px) var(--srv-edge);
    text-align: center;
    max-width: 1120px;
    margin: 0 auto;
  }
  .srv-manifest__eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: clamp(24px, 4vw, 40px);
    color: var(--srv-gold);
  }
  .srv-manifest__eyebrow::before,
  .srv-manifest__eyebrow::after {
    content: ""; width: 28px; height: 1px; background: var(--srv-gold);
  }
  .srv-manifest__eyebrow .srv-mono { color: var(--srv-gold); }
  .srv-manifest__body {
    font-family: var(--srv-display);
    font-weight: 500;
    font-style: italic;
    font-size: clamp(28px, 4.5vw, 56px);
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--srv-ink);
    max-width: 1000px;
    margin: 0 auto;
  }
  .srv-manifest__body em {
    font-style: italic;
    color: var(--srv-gold);
    font-weight: 400;
  }

  /* ── 06 Final CTA ────────────────────────────────────── */
  .srv-cta {
    background: var(--srv-bg-3);
    border-top: 1px solid var(--srv-line);
    padding: clamp(72px, 11vw, 144px) var(--srv-edge);
    text-align: center;
  }
  .srv-cta__eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: clamp(16px, 2vw, 24px);
  }
  .srv-cta__eyebrow::before,
  .srv-cta__eyebrow::after {
    content: ""; width: 28px; height: 1px; background: var(--srv-gold);
  }
  .srv-cta__eyebrow .srv-mono { color: var(--srv-gold); }
  .srv-cta__title {
    font-family: var(--srv-display);
    font-weight: 500;
    font-size: clamp(32px, 5vw, 64px);
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0 0 clamp(18px, 2.5vw, 28px);
    color: var(--srv-ink);
  }
  .srv-cta__title em { font-style: italic; color: var(--srv-gold); font-weight: 400; }
  .srv-cta__lead {
    font-size: 15px;
    line-height: 1.7;
    color: var(--srv-ink-soft);
    max-width: 560px;
    margin: 0 auto clamp(28px, 4vw, 44px);
  }
  .srv-cta__btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 22px;
    background: var(--srv-gold);
    color: var(--color-ph-black, #0d0f12);
    border-radius: 100px;
    font-family: var(--srv-sans);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    text-decoration: none;
    border: 1px solid var(--srv-gold);
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .srv-cta__btn:hover {
    background: var(--srv-gold-soft);
    border-color: var(--srv-gold-soft);
  }
  .srv-cta__btn:hover .srv-cta__arrow { transform: translateX(4px); }
  .srv-cta__arrow { transition: transform 0.2s; }
  .srv-cta__btn:focus-visible {
    outline: 2px solid var(--srv-gold);
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .srv-cta__btn,
    .srv-cta__arrow { transition: none !important; }
  }
```

- [ ] **Step 3: Type-check**

Run: `npx astro check`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ServicesSection.astro
git commit -m "$(cat <<'EOF'
feat(services): add manifest + final CTA

Completes the six-block ServicesSection layout. The manifest is a large
centered italic quote; the final CTA is a goldfill button pointing at
the home contact anchor (/#contacto or /en/#contacto). Reduced-motion
honored on the button hover.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Wire both language pages

**Files:**
- Modify: `src/pages/servicios.astro`
- Modify: `src/pages/en/services.astro`

Goal: swap `ServicesOrbit3D` for the new `ServicesSection` in both pages. After this task the site shows the new layout.

- [ ] **Step 1: Update `src/pages/servicios.astro`**

Replace the entire file with:

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import ServicesSection from '@/components/sections/ServicesSection.astro';
import { useTranslations, type Lang } from '@/i18n/utils';
import { SITE_URL } from '@/lib/constants';

const lang: Lang = 'es';
const t = useTranslations(lang);
---

<BaseLayout
  title={`${t('services.title')} — ${t('site.name')}`}
  description={t('services.subtitle')}
  lang={lang}
  canonical={`${SITE_URL}/servicios`}
>
  <ServicesSection lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Update `src/pages/en/services.astro`**

Replace the entire file with:

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import ServicesSection from '@/components/sections/ServicesSection.astro';
import { useTranslations, type Lang } from '@/i18n/utils';
import { SITE_URL } from '@/lib/constants';

const lang: Lang = 'en';
const t = useTranslations(lang);
---

<BaseLayout
  title={`${t('services.title')} — ${t('site.name')}`}
  description={t('services.subtitle')}
  lang={lang}
  canonical={`${SITE_URL}/en/services`}
>
  <ServicesSection lang={lang} />
</BaseLayout>
```

- [ ] **Step 3: Smoke test — both pages return HTTP 200**

Run:
```bash
curl -sS -o /dev/null -w "es %{http_code}\n" http://localhost:4321/servicios
curl -sS -o /dev/null -w "en %{http_code}\n" http://localhost:4321/en/services
```
Expected: `es 200` and `en 200`.

- [ ] **Step 4: Visual check via Playwright (optional but recommended)**

Navigate to `http://localhost:4321/servicios`, snapshot, verify:
- Hero title renders with gold italic "campo"
- Five `srv-area-row` items exist, first has class `is-open`
- Six `srv-block` articles exist (press, performance, media, familyOffice, psychology, actionPlan)
- Manifest and CTA button visible

Same checks for `/en/services` (title renders "pitch", same structure).

- [ ] **Step 5: Commit**

```bash
git add src/pages/servicios.astro src/pages/en/services.astro
git commit -m "$(cat <<'EOF'
feat(services): wire /servicios and /en/services to ServicesSection

Replaces ServicesOrbit3D rendering with the new six-block
ServicesSection in both language page wrappers. The old component is
no longer referenced from any page and is deleted in Task 8.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Cleanup — delete orbit, trim ServiceItem, remove obsolete i18n keys

**Files:**
- Delete: `src/components/sections/ServicesOrbit3D.astro`
- Modify: `src/lib/servicesItems.ts`
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`

Goal: remove all obsolete code and keys. After this task, `icon` and `short` exist nowhere in the codebase, and orbit-only keys are gone.

- [ ] **Step 1: Verify no references to `ServicesOrbit3D`**

Run: `grep -rn "ServicesOrbit3D" src/ || echo "NO REFERENCES"`
Expected: `NO REFERENCES`. If anything prints, abort — a page still imports it.

- [ ] **Step 2: Delete `ServicesOrbit3D.astro`**

Run: `rm src/components/sections/ServicesOrbit3D.astro`

- [ ] **Step 3: Refactor `src/lib/servicesItems.ts`**

Replace the file with:

```ts
import { useTranslations, type Lang } from '@/i18n/utils';

export type ServiceItem = {
  title: string;
  body: string;
  tags: string[];
};

/**
 * Lista única de servicios (acordeón home y página de servicios).
 */
export function getServicesItems(lang: Lang): ServiceItem[] {
  const t = useTranslations(lang);
  return [
    {
      title: t('services.items.press.title'),
      body: t('services.items.press.body'),
      tags: [
        t('services.items.press.tag1'),
        t('services.items.press.tag2'),
        t('services.items.press.tag3'),
      ],
    },
    {
      title: t('services.items.performance.title'),
      body: t('services.items.performance.body'),
      tags: [
        t('services.items.performance.tag1'),
        t('services.items.performance.tag2'),
        t('services.items.performance.tag3'),
        t('services.items.performance.tag4'),
      ],
    },
    {
      title: t('services.items.media.title'),
      body: t('services.items.media.body'),
      tags: [
        t('services.items.media.tag1'),
        t('services.items.media.tag2'),
        t('services.items.media.tag3'),
        t('services.items.media.tag4'),
      ],
    },
    {
      title: t('services.items.familyOffice.title'),
      body: t('services.items.familyOffice.body'),
      tags: [
        t('services.items.familyOffice.tag1'),
        t('services.items.familyOffice.tag2'),
        t('services.items.familyOffice.tag3'),
        t('services.items.familyOffice.tag4'),
      ],
    },
    {
      title: t('services.items.psychology.title'),
      body: t('services.items.psychology.body'),
      tags: [
        t('services.items.psychology.tag1'),
        t('services.items.psychology.tag2'),
        t('services.items.psychology.tag3'),
      ],
    },
    {
      title: t('services.items.actionPlan.title'),
      body: t('services.items.actionPlan.body'),
      tags: [
        t('services.items.actionPlan.tag1'),
        t('services.items.actionPlan.tag2'),
        t('services.items.actionPlan.tag3'),
      ],
    },
  ];
}
```

- [ ] **Step 4: Remove obsolete keys from `src/i18n/es.ts`**

Delete these 9 lines from `es.ts`:

```ts
  'services.items.press.short': 'Imagen, medios y posicionamiento',
  'services.items.performance.short': 'Análisis y optimización física',
  'services.items.media.short': 'Contenido, redes y marca personal',
  'services.items.familyOffice.short': 'Patrimonio, fiscalidad y estructura',
  'services.items.psychology.short': 'Preparación mental y gestión de presión',
  'services.items.actionPlan.short': 'Carrera con hitos y criterio',
  'services.blocksAriaLabel': 'Áreas de servicio',
  'services.orbitInstructions':
    'Carrusel de servicios en tres dimensiones. Arrastra para girar o abre una tarjeta para ver el detalle.',
  'services.modalAriaLabel': 'Detalle del servicio',
```

(The `services.orbitInstructions` entry spans two lines — remove both.)

- [ ] **Step 5: Remove obsolete keys from `src/i18n/en.ts`**

Delete the matching 9 lines from `en.ts`:

```ts
  'services.items.press.short': 'Image, media and positioning',
  'services.items.performance.short': 'Physical analysis and optimisation',
  'services.items.media.short': 'Content, socials and personal brand',
  'services.items.familyOffice.short': 'Wealth, tax and structure',
  'services.items.psychology.short': 'Mental prep and pressure management',
  'services.items.actionPlan.short': 'Career milestones, with judgment',
  'services.blocksAriaLabel': 'Service areas',
  'services.orbitInstructions':
    'Three-dimensional service carousel. Drag to rotate or open a card for details.',
  'services.modalAriaLabel': 'Service details',
```

- [ ] **Step 6: Type-check + full build**

Run: `npx astro check`
Expected: zero errors. `TranslationKey` no longer includes the removed keys; nothing references them.

Run: `npm run build`
Expected: build succeeds. No dangling imports to `ServicesOrbit3D`, no missing i18n keys.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/ServicesOrbit3D.astro src/lib/servicesItems.ts src/i18n/es.ts src/i18n/en.ts
git commit -m "$(cat <<'EOF'
chore(services): remove ServicesOrbit3D + trim obsolete shape/keys

- Delete ServicesOrbit3D.astro (703 lines, obsolete 3D carousel).
- ServiceItem drops icon and short fields; keeps title, body, tags[].
- Remove nine orbit-only i18n keys: six .short per pillar,
  services.blocksAriaLabel, services.orbitInstructions,
  services.modalAriaLabel — in both es.ts and en.ts.

Home accordion (HomeServicesSection) continues to work — reads only
title and body, which are preserved.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Final smoke test

**Files:** no changes

Goal: verify the full flow end-to-end before handoff.

- [ ] **Step 1: Dev server returns 200 on both pages**

Run:
```bash
curl -sS -o /dev/null -w "es %{http_code}\n" http://localhost:4321/servicios
curl -sS -o /dev/null -w "en %{http_code}\n" http://localhost:4321/en/services
curl -sS -o /dev/null -w "home %{http_code}\n" http://localhost:4321/
curl -sS -o /dev/null -w "en-home %{http_code}\n" http://localhost:4321/en/
```
Expected: all `200`.

- [ ] **Step 2: Home accordion — pillar body text refreshed**

Navigate (Playwright) to `http://localhost:4321/` and verify the `HomeServicesSection` accordion now shows the **new** pillar body text (e.g. `press.body` begins with "Gestión de imagen y reputación…"). The layout must be unchanged — only the text should be the updated copy.

- [ ] **Step 3: Services page — six-block layout**

Navigate to `http://localhost:4321/servicios` and snapshot. Verify:
- Hero: title `Un equipo / fuera del campo.` with gold italic `campo`.
- Áreas: 5 rows, row 01 (`Representación e intermediación`) open by default with four bullet items.
- Click row 03; row 01 closes, row 03 opens (exclusive behavior).
- Click row 03 again; all rows close.
- Six pillar blocks render with Roman numerals I–VI and tag chips.
- Manifest quote is centered italic with gold accent.
- CTA button links to `/#contacto`.

Same checks on `http://localhost:4321/en/services` with EN copy and `/en/#contacto` CTA href.

- [ ] **Step 4: Reduced-motion sanity check**

In DevTools, enable `prefers-reduced-motion: reduce`. Click an áreas row — it should open/close instantly (no transition). Button hover should also skip the transform.

- [ ] **Step 5: Keyboard a11y**

Tab through the áreas accordion. Each summary is reachable via Tab; Space and Enter both toggle. Focus ring is visible (gold outline, 2px).

- [ ] **Step 6: Grep final sanity**

Run: `grep -rn "ServicesOrbit3D\|services.orbitInstructions\|services.items.press.short" src/ || echo "CLEAN"`
Expected: `CLEAN`.

No commit — this task is verification only. If all steps pass, the branch is ready for merge.

---

## Self-Review

**1. Spec coverage**

| Spec section | Plan task(s) | Status |
| --- | --- | --- |
| §1.1 Hero | Task 4 (markup + styles) | ✅ |
| §1.2 Áreas accordion | Task 4 (markup, styles, script, a11y) | ✅ |
| §1.3 Model intro | Task 5 | ✅ |
| §1.4 Six pillar blocks | Task 5 | ✅ |
| §1.5 Manifest | Task 6 | ✅ |
| §1.6 Final CTA | Task 6 | ✅ |
| §2.1 Create ServicesSection | Tasks 4–6 | ✅ |
| §2.2 Modify servicesItems, i18n, pages | Tasks 2, 3, 5 (bridge), 7, 8 | ✅ |
| §2.3 Delete ServicesOrbit3D | Task 8 | ✅ |
| §3 Token mapping | Decided to use inline fallbacks (project convention) — no global.css edits needed. Documented in File Structure section. | ✅ |
| §4 i18n schema | Tasks 2 + 3 (add) + Task 8 (remove) | ✅ |
| §5 Accordion a11y | Task 4 (button + aria-expanded + aria-controls + reduced-motion) | ✅ |

**2. Placeholder scan**

- No `TBD`, `TODO`, `implement later`, or "similar to Task N" references.
- Every step with code shows complete code.
- Every step with a command shows the command and expected output.
- `"Add appropriate error handling"` — not present.

**3. Type consistency**

- `ServiceItem` type evolves: Task 5 Step 3 adds `tags: string[]` as bridge; Task 8 Step 3 drops `icon` and `short`. Each transition keeps the build green.
- `useTranslations` signature unchanged.
- i18n keys follow flat-dot-notation consistently (`services.areas.items.<key>.bulletN`, `services.items.<key>.tagN`, `services.manifest.bodyLead/bodyAccent/bodyTrail`, etc.).
- `contactHref` constant in `ServicesSection.astro` frontmatter used only by the CTA anchor — no drift between definition site and use.

**4. Scope check**

Single plan, single implementation session. No hidden subsystems. Home accordion text refresh is a free side effect, not a separate task.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-20-services-redesign-v3.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review (spec compliance → code quality), fast iteration.

**2. Inline Execution** — execute tasks in this session with batch checkpoints.

Which approach?
