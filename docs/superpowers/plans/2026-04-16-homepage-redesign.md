# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar la homepage de PHSPORT en una narrativa editorial premium que comunica identidad de marca, cifras reales y el diferenciador 360°.

**Architecture:** Se eliminan `HomeInstagramSection` y las 3 cards de servicios. Se añaden tres nuevas secciones (StatsStrip, Manifesto, 360°), se rediseñan Services y About. Todo el contenido nuevo pasa por el sistema i18n (`es.ts` / `en.ts`). No se añaden dependencias externas. Las animaciones GSAP/ScrollTrigger siguen el patrón ya establecido en las secciones existentes.

**Tech Stack:** Astro 5, GSAP + ScrollTrigger (ya instalado), CSS custom properties (design tokens existentes), TypeScript i18n

**Orden final de secciones en la home:**
```
HeroSection → HomeStatsStrip (nuevo) → HomePlayersSection → HomeManifestoSection (nuevo) → HomeServicesSection (rediseñado) → Home360Section (nuevo) → HomeAboutSection (rediseñado)
```

---

## File Map

| Acción | Archivo | Responsabilidad |
|--------|---------|----------------|
| Modify | `src/i18n/es.ts` | Añadir claves para StatsStrip, Manifesto, 360°, About statement |
| Modify | `src/i18n/en.ts` | Equivalentes en inglés |
| Create | `src/components/sections/HomeStatsStrip.astro` | Franja horizontal con 3 cifras clave |
| Create | `src/components/sections/HomeManifestoSection.astro` | Sección viewport con frase de impacto + valores |
| Modify | `src/components/sections/HomeServicesSection.astro` | Sustituir 3 cards por lista editorial numerada con 5 servicios |
| Create | `src/components/sections/Home360Section.astro` | Sección con los 5 pilares del acompañamiento 360° |
| Modify | `src/components/sections/HomeAboutSection.astro` | Rediseño split: statement grande izquierda, texto+CTA derecha |
| Modify | `src/pages/index.astro` | Nuevo orden, eliminar Instagram, añadir imports |
| Modify | `src/pages/en/index.astro` | Espejo del anterior para versión inglesa |

---

## Task 1: Añadir claves de traducción

**Files:**
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: Añadir claves en `es.ts`** — insertar justo antes de `// --- Jugadores ---`

```ts
  // --- Home: Stats Strip ---
  'home.stats.aria': 'Cifras PHSPORT',
  'home.stats.players.value': '+100',
  'home.stats.players.label': 'Jugadores',
  'home.stats.countries.value': '12',
  'home.stats.countries.label': 'Países',
  'home.stats.service.value': '360°',
  'home.stats.service.label': 'Acompañamiento',

  // --- Home: Manifesto ---
  'home.manifesto.eyebrow': 'Representar con propósito',
  'home.manifesto.statement': 'Construimos y protegemos la carrera de nuestros jugadores con representación estratégica, visión internacional y enfoque a largo plazo.',
  'home.manifesto.value1': 'Rigor',
  'home.manifesto.value2': 'Cercanía',
  'home.manifesto.value3': 'Excelencia',
  'home.manifesto.values.aria': 'Valores de PHSPORT',

  // --- Home: 360° ---
  'home.360.label': 'Acompañamiento 360°',
  'home.360.title': 'Más allá de la representación',
  'home.360.subtitle': 'Construimos una estructura integral que acompaña al jugador en cada área clave de su carrera.',
  'home.360.pillar1.title': 'Prensa',
  'home.360.pillar1.body': 'Imagen pública, relación con medios y posicionamiento del jugador.',
  'home.360.pillar2.title': 'Media',
  'home.360.pillar2.body': 'Estrategia digital, creación de contenido y gestión de redes sociales.',
  'home.360.pillar3.title': 'Psicología deportiva',
  'home.360.pillar3.body': 'Preparación mental, gestión de la presión y acompañamiento competitivo.',
  'home.360.pillar4.title': 'Rendimiento',
  'home.360.pillar4.body': 'Análisis físico, seguimiento continuo y optimización del rendimiento.',
  'home.360.pillar5.title': 'Family Office',
  'home.360.pillar5.body': 'Gestión patrimonial, planificación fiscal y estructura financiera del jugador.',
  'home.360.aria': 'Los cinco pilares del acompañamiento PHSPORT',

  // --- Home: About (nuevo statement para split) ---
  'home.about.statement': 'Gestionamos tu carrera, tu presente y tu futuro.',
```

- [ ] **Step 2: Añadir claves en `en.ts`** — misma posición relativa

```ts
  // --- Home: Stats Strip ---
  'home.stats.aria': 'PHSPORT figures',
  'home.stats.players.value': '+100',
  'home.stats.players.label': 'Players',
  'home.stats.countries.value': '12',
  'home.stats.countries.label': 'Countries',
  'home.stats.service.value': '360°',
  'home.stats.service.label': 'Support',

  // --- Home: Manifesto ---
  'home.manifesto.eyebrow': 'Representing with purpose',
  'home.manifesto.statement': 'We build and protect the careers of our players through strategic representation, international vision and a long-term approach.',
  'home.manifesto.value1': 'Rigour',
  'home.manifesto.value2': 'Closeness',
  'home.manifesto.value3': 'Excellence',
  'home.manifesto.values.aria': 'PHSPORT values',

  // --- Home: 360° ---
  'home.360.label': '360° Support',
  'home.360.title': 'Beyond representation',
  'home.360.subtitle': 'We build a comprehensive structure that accompanies the player across every key area of their career.',
  'home.360.pillar1.title': 'Press',
  'home.360.pillar1.body': 'Public image, media relations and player positioning.',
  'home.360.pillar2.title': 'Media',
  'home.360.pillar2.body': 'Digital strategy, content creation and social media management.',
  'home.360.pillar3.title': 'Sports psychology',
  'home.360.pillar3.body': 'Mental preparation, pressure management and competitive support.',
  'home.360.pillar4.title': 'Performance',
  'home.360.pillar4.body': 'Physical analysis, ongoing monitoring and performance optimisation.',
  'home.360.pillar5.title': 'Family Office',
  'home.360.pillar5.body': 'Wealth management, tax planning and financial structure for the player.',
  'home.360.aria': 'The five pillars of PHSPORT support',

  // --- Home: About (new statement) ---
  'home.about.statement': 'We manage your career, your present and your future.',
```

- [ ] **Step 3: Verificar que TypeScript compila**

```bash
npx astro check
```
Expected: 0 errores relacionados con claves i18n. Si hay errores de clave faltante, revisar que ambos ficheros tienen exactamente las mismas claves.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/es.ts src/i18n/en.ts
git commit -m "feat(i18n): add translation keys for homepage redesign sections"
```

---

## Task 2: Crear HomeStatsStrip.astro

**Files:**
- Create: `src/components/sections/HomeStatsStrip.astro`

- [ ] **Step 1: Crear el archivo**

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);
---

<div class="stats-strip" aria-label={t('home.stats.aria')} role="region" data-stats-strip>
  <div class="ph-section">
    <dl class="stats-strip-list">
      <div class="stats-strip-item">
        <dd class="stats-strip-value">{t('home.stats.players.value')}</dd>
        <dt class="stats-strip-label">{t('home.stats.players.label')}</dt>
      </div>
      <div class="stats-strip-item">
        <dd class="stats-strip-value">{t('home.stats.countries.value')}</dd>
        <dt class="stats-strip-label">{t('home.stats.countries.label')}</dt>
      </div>
      <div class="stats-strip-item">
        <dd class="stats-strip-value">{t('home.stats.service.value')}</dd>
        <dt class="stats-strip-label">{t('home.stats.service.label')}</dt>
      </div>
    </dl>
  </div>
</div>

<style>
  .stats-strip {
    position: relative;
    border-top: 1px solid var(--color-ph-white-10);
    border-bottom: 1px solid var(--color-ph-white-10);
    padding-block: 2.5rem;
    background: var(--ph-section-bg);
    overflow: hidden;
  }

  .stats-strip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 100%, rgba(214, 178, 94, 0.05) 0%, transparent 60%);
    pointer-events: none;
  }

  .stats-strip-list {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin: 0;
    padding: 0;
  }

  .stats-strip-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding-inline: 1rem;
    position: relative;
  }

  /* Separador vertical entre items */
  .stats-strip-item + .stats-strip-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 2.5rem;
    background: rgba(214, 178, 94, 0.25);
  }

  .stats-strip-value {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0;
  }

  .stats-strip-label {
    font-family: var(--font-body);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    margin: 0;
  }

  @media (min-width: 640px) {
    .stats-strip-item {
      padding-inline: 3rem;
    }
  }

  @media (min-width: 1024px) {
    .stats-strip-item {
      padding-inline: 5rem;
    }
  }
</style>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('astro:page-load', () => {
    const strip = document.querySelector<HTMLElement>('[data-stats-strip]');
    if (!strip || reducedMotion()) return;

    const items = strip.querySelectorAll<HTMLElement>('.stats-strip-item');
    gsap.from(items, {
      opacity: 0,
      y: 16,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: strip, start: 'top 85%', once: true },
    });
  });
</script>
```

- [ ] **Step 2: Verificar en browser**

Con el dev server corriendo en `http://localhost:4321`, inspeccionar que el componente renderiza (lo añadiremos al index en Task 7, pero podemos verificar importándolo temporalmente).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeStatsStrip.astro
git commit -m "feat(home): add stats strip section"
```

---

## Task 3: Crear HomeManifestoSection.astro

**Files:**
- Create: `src/components/sections/HomeManifestoSection.astro`

- [ ] **Step 1: Crear el archivo**

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

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
    min-height: 80vh;
    display: flex;
    align-items: center;
    background: var(--ph-section-bg);
    border-top: 1px solid var(--color-ph-white-10);
    overflow: hidden;
    padding-block: 6rem;
  }

  /* Gradiente radial sutil para dar profundidad */
  .manifesto-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 0% 50%, rgba(214, 178, 94, 0.06) 0%, transparent 55%),
      radial-gradient(ellipse at 100% 50%, rgba(214, 178, 94, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  .manifesto-inner {
    position: relative;
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

  .manifesto-eyebrow {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    white-space: nowrap;
    margin: 0;
    opacity: 0;
  }

  .manifesto-divider {
    flex: 1;
    max-width: 20rem;
  }

  .manifesto-statement {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 3rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0;
    opacity: 0;
  }

  .manifesto-values {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    opacity: 0;
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
    .manifesto-section {
      padding-block: 8rem;
    }
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

    const lead      = section.querySelector<HTMLElement>('[data-manifesto-lead]');
    const statement = section.querySelector<HTMLElement>('[data-manifesto-statement]');
    const values    = section.querySelector<HTMLElement>('[data-manifesto-values]');
    const divider   = section.querySelector<HTMLElement>('.manifesto-divider');
    const eyebrow   = section.querySelector<HTMLElement>('.manifesto-eyebrow');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 70%', once: true },
    });

    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 1 });
      tl.from(eyebrow, { opacity: 0, y: 8, duration: 0.5, ease: 'power3.out' }, 0);
    }

    if (divider) {
      gsap.set(divider, { opacity: 1 });
      tl.from(divider, { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'expo.out' }, 0.1);
    }

    if (statement) {
      const words = wrapWords(statement);
      gsap.set(statement, { opacity: 1 });
      tl.from(words, { yPercent: 115, duration: 0.9, stagger: 0.04, ease: 'power4.out' }, 0.3);
    }

    if (values) {
      gsap.set(values, { opacity: 1 });
      tl.from(values, { opacity: 0, y: 12, duration: 0.6, ease: 'power3.out' }, 0.8);
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/HomeManifestoSection.astro
git commit -m "feat(home): add manifesto section"
```

---

## Task 4: Rediseñar HomeServicesSection.astro

**Files:**
- Modify: `src/components/sections/HomeServicesSection.astro`

El cambio clave: eliminar el grid de 3 cards con iconos y la línea `items = allItems.slice(0, 3)`. Sustituir por una lista editorial numerada con los 5 servicios.

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```astro
---
import SectionHeader from '@/components/ui/SectionHeader.astro';
import Button from '@/components/ui/Button.astro';
import { getServicesItems } from '@/lib/servicesItems';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

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
    .home-services-section {
      padding-block: 5rem 5.5rem;
    }
  }

  /* ── Lista editorial ─────────────────────────────────────────────────────── */

  .services-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .services-list-item {
    display: flex;
    align-items: baseline;
    gap: 2rem;
    padding-block: 1.75rem;
    border-bottom: 1px solid var(--color-ph-white-10);
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
  }

  .services-list-item:hover .services-list-num {
    color: rgba(214, 178, 94, 0.45);
  }

  .services-list-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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
    .services-list-title {
      min-width: 16rem;
    }
  }

  .services-list-short {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-ph-white-60);
  }

  /* ── CTA ─────────────────────────────────────────────────────────────────── */

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

    const items = section.querySelectorAll<HTMLElement>('[data-service-item]');
    gsap.from(items, {
      opacity: 0,
      x: -20,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power4.out',
      scrollTrigger: { trigger: section, start: 'top 75%', once: true },
    });
  });
</script>
```

- [ ] **Step 2: Verificar en browser** — navegar a `http://localhost:4321` y bajar hasta Servicios. Deben verse 5 filas con número grande a la izquierda y título + descripción. Sin iconos.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeServicesSection.astro
git commit -m "feat(home): redesign services section as editorial numbered list"
```

---

## Task 5: Crear Home360Section.astro

**Files:**
- Create: `src/components/sections/Home360Section.astro`

- [ ] **Step 1: Crear el archivo**

```astro
---
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const pillars = [
  { key: '1', title: t('home.360.pillar1.title'), body: t('home.360.pillar1.body') },
  { key: '2', title: t('home.360.pillar2.title'), body: t('home.360.pillar2.body') },
  { key: '3', title: t('home.360.pillar3.title'), body: t('home.360.pillar3.body') },
  { key: '4', title: t('home.360.pillar4.title'), body: t('home.360.pillar4.body') },
  { key: '5', title: t('home.360.pillar5.title'), body: t('home.360.pillar5.body') },
] as const;
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

    <ul
      class="home-360-grid"
      aria-label={t('home.360.aria')}
    >
      {
        pillars.map((p) => (
          <li class="home-360-pillar" data-360-pillar>
            <h3 class="home-360-pillar-title">{p.title}</h3>
            <p class="home-360-pillar-body">{p.body}</p>
          </li>
        ))
      }
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
    .home-360-section {
      padding-block: 5rem 5.5rem;
    }
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

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

  /* ── Grid de pilares ─────────────────────────────────────────────────────── */

  .home-360-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 640px) {
    .home-360-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .home-360-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
    }
  }

  .home-360-pillar {
    padding: 1.5rem 1.25rem;
    border: 1px solid var(--color-ph-white-10);
    border-radius: var(--radius-md);
    background: var(--ph-glass-bg);
    backdrop-filter: var(--ph-glass-backdrop);
    -webkit-backdrop-filter: var(--ph-glass-backdrop);
    transition:
      border-color var(--ph-duration) var(--ease-ph),
      box-shadow var(--ph-duration) var(--ease-ph);
  }

  .home-360-pillar:hover {
    border-color: rgba(214, 178, 94, 0.3);
    box-shadow: var(--ph-glass-highlight);
  }

  .home-360-pillar-title {
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
    margin: 0 0 0.625rem;
  }

  .home-360-pillar-body {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.55;
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
      gsap.from(header, {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: 'power4.out',
        scrollTrigger: { trigger: header, start: 'top 85%', once: true },
      });
    }

    const pillars = section.querySelectorAll<HTMLElement>('[data-360-pillar]');
    if (pillars.length) {
      gsap.from(pillars, {
        opacity: 0,
        y: 24,
        duration: 0.75,
        stagger: 0.07,
        ease: 'power4.out',
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      });
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Home360Section.astro
git commit -m "feat(home): add 360 support section"
```

---

## Task 6: Rediseñar HomeAboutSection.astro

**Files:**
- Modify: `src/components/sections/HomeAboutSection.astro`

Sustituir el layout de columna única (heading + párrafos + botón) por un split: izquierda con el statement grande, derecha con descripción + CTA.

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```astro
---
import Button from '@/components/ui/Button.astro';
import { useTranslations, type Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

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
  }

  @media (min-width: 1024px) {
    .home-about-section {
      padding-block: 6rem 7rem;
    }
  }

  /* ── Split grid ──────────────────────────────────────────────────────────── */

  .home-about-grid {
    display: grid;
    gap: 3rem;
    grid-template-columns: 1fr;
    align-items: center;
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

  /* ── Left: statement ─────────────────────────────────────────────────────── */

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

  .home-about-divider {
    max-width: 10rem;
  }

  .home-about-statement {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 900;
    color: var(--color-ph-white);
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin: 0;
  }

  /* ── Right: text + CTA ───────────────────────────────────────────────────── */

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

  .home-about-cta {
    display: flex;
    justify-content: flex-start;
  }
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
        gsap.set(statement, { opacity: 1 });
        tl.from(words, { yPercent: 115, duration: 0.85, stagger: 0.05, ease: 'power4.out' }, 0);
      }
      const eyebrow = left.querySelector<HTMLElement>('.home-about-eyebrow');
      const divider = left.querySelector<HTMLElement>('.home-about-divider');
      if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 8, duration: 0.5, ease: 'power3.out' }, 0);
      if (divider) {
        gsap.set(divider, { opacity: 1 });
        tl.from(divider, { scaleX: 0, transformOrigin: 'left center', duration: 0.6, ease: 'expo.out' }, 0.1);
      }
    }

    if (right) {
      tl.from(right, { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, 0.25);
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/HomeAboutSection.astro
git commit -m "feat(home): redesign about section as editorial split layout"
```

---

## Task 7: Actualizar index.astro y en/index.astro

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Reemplazar `src/pages/index.astro`**

```astro
---
import BaseLayout from '@/components/layout/BaseLayout.astro';
import LogoReveal from '@/components/islands/LogoReveal.tsx';
import HeroSection from '@/components/sections/HeroSection.astro';
import HomeStatsStrip from '@/components/sections/HomeStatsStrip.astro';
import HomePlayersSection from '@/components/sections/HomePlayersSection.astro';
import HomeManifestoSection from '@/components/sections/HomeManifestoSection.astro';
import HomeServicesSection from '@/components/sections/HomeServicesSection.astro';
import Home360Section from '@/components/sections/Home360Section.astro';
import HomeAboutSection from '@/components/sections/HomeAboutSection.astro';
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
  <HomeStatsStrip lang={lang} />
  <HomePlayersSection lang={lang} players={homePlayers} />
  <HomeManifestoSection lang={lang} />
  <HomeServicesSection lang={lang} />
  <Home360Section lang={lang} />
  <HomeAboutSection lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Espejo en `src/pages/en/index.astro`** — aplicar exactamente los mismos cambios (mismos imports, mismo orden de componentes, distinto `canonical`)

Abrir `src/pages/en/index.astro`, reemplazar las importaciones y el cuerpo del layout igual que en el paso anterior. Solo cambia la línea canonical:

```astro
canonical={`${SITE_URL}/en/`}
```

- [ ] **Step 3: Verificar en browser**

Navegar a `http://localhost:4321` y hacer scroll completo. Verificar que el orden es:
1. Hero (vídeo estadio)
2. Stats Strip (3 cifras)
3. Jugadores (3 cards)
4. Manifesto (frase grande + valores)
5. Servicios (5 filas editoriales)
6. 360° (5 pilares en grid)
7. Sobre nosotros (split)

No debe aparecer la sección de Instagram en ningún punto.

- [ ] **Step 4: Verificar versión inglesa**

Navegar a `http://localhost:4321/en` y verificar que todas las secciones muestran texto en inglés.

- [ ] **Step 5: Commit final**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(home): wire up redesigned homepage — remove instagram, add stats/manifesto/360 sections"
```

---

## Verificación final

- [ ] Scroll completo en desktop (≥1280px): todas las secciones se ven correctamente
- [ ] Scroll completo en mobile (375px): no hay overflow horizontal, las tipografías escalan bien
- [ ] Animaciones GSAP se disparan al entrar en cada sección
- [ ] `npx astro check` sin errores TypeScript
- [ ] La versión `/en` muestra todo en inglés
