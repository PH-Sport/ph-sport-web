# Escalonado de animaciones (animation tiering) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reservar la coreografía pesada `wrapWords` (curtain palabra-a-palabra) para momentos señtura, y migrar el resto de cabeceras a un reveal simple, robusto y barato (fade + slide) vía un helper único.

**Architecture:** Se añade un helper `revealOnView(el, opts)` a `ph-text-animations.ts` que encapsula el patrón robusto ya validado este ciclo: `inView al cargar ? animación inmediata : scrollTrigger`, fade+slide, compatible con el failsafe de 2 s. Cada sección sustituye su bloque artesanal `wrapWords(title) + gsap.from(words, { yPercent, scrollTrigger })` por una llamada a este helper. Tier 1 se deja intacto.

**Tech Stack:** Astro 5, GSAP 3 + ScrollTrigger, TypeScript en `<script>` de sección (bundle Vite), verificación con Playwright (no hay framework de unit tests; la "prueba" de cada tarea es un audit de comportamiento en el navegador).

## Global Constraints

- No tocar Tier 1: home hero (claim lead+accent) + LogoReveal; `.talents__title`; `.srv-hero__title` + `.srv-manifest__body`; `.abt-hero__title` + `.abt-closing__quote`. Estos conservan `wrapWords`.
- El helper debe respetar `reducedMotion()` (el init de cada sección ya hace early-return; el helper no se llama en ese caso).
- Mantener el guard de FOUC (`data-reveal`) solo donde el elemento puede estar above-the-fold al cargar; los Tier 2 de este plan son todos below-the-fold salvo `.srv-areas__title` (que ya tiene guard + `revealReveals` en su init — no quitarlo).
- Verificación obligatoria por página tras cada migración (Playwright, **rAF vivo con jiggle de ratón** — el headless throttlea rAF tras recarga ociosa y da falsos atascos): 0 títulos atascados en viewport, 0 errores de consola, y el recuento de `.ph-clip-inner` (palabras `wrapWords`) debe bajar.
- Commits frecuentes, uno por tarea. Mensajes en español, estilo `refactor(anim): ...`. Terminar el mensaje con la línea Co-Authored-By.

---

### Task 1: Helper `revealOnView`

**Files:**
- Modify: `src/scripts/ph-text-animations.ts` (añadir export tras `afterTransitionPaint`)

**Interfaces:**
- Produces: `revealOnView(el: HTMLElement, opts?: { y?: number; duration?: number; delay?: number; ease?: string }): gsap.core.Tween`

- [ ] **Step 1: Añadir el helper**

Insertar después de la función `afterTransitionPaint` (antes de `// ── FOUC guard (reveal) ──`):

```ts
// ── Reveal Tier 2 (fade + slide) ──────────────────────────────────────────────
// Reveal simple y robusto para cabeceras secundarias. Reemplaza el patrón
// wrapWords + gsap.from(yPercent) + scrollTrigger artesanal de cada sección.
// Si el elemento ya está en viewport al llamarse, anima INMEDIATO: un scrollTrigger
// `once` cuyo `start` no se alcanza al cargar dejaría el contenido invisible (el bug
// que arreglamos en Servicios). Si está below-the-fold, scroll-reveal normal.
export function revealOnView(
  el: HTMLElement,
  opts: { y?: number; duration?: number; delay?: number; ease?: string } = {},
): gsap.core.Tween {
  const { y = 20, duration = 0.85, delay = 0, ease = 'power3.out' } = opts;
  const inView = el.getBoundingClientRect().top < window.innerHeight;
  return gsap.from(el, {
    opacity: 0,
    y,
    duration,
    ease,
    delay: inView ? delay : 0,
    scrollTrigger: inView ? undefined : { trigger: el, start: 'top 85%', once: true },
  });
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: `Complete!`, sin `error TS`.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/ph-text-animations.ts
git commit -m "feat(anim): helper revealOnView (reveal Tier 2 robusto)"
```

---

### Task 2: Home — 4 títulos de sección a Tier 2

**Files:**
- Modify: `src/components/sections/HomePlayersSection.astro`
- Modify: `src/components/sections/HomeServicesSection.astro`
- Modify: `src/components/sections/HomeAboutSection.astro`
- Modify: `src/components/sections/HomeContactSection.astro`

**Interfaces:**
- Consumes: `revealOnView` (Task 1)

- [ ] **Step 1: HomePlayersSection** — en `initHomePlayersAnimations`, sustituir el bloque del título:

Buscar:
```ts
    if (title && head) {
      const words = wrapWords(title);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.08,
        scrollTrigger: { trigger: head, start: 'top 80%', once: true },
      });
    }
```
Reemplazar por:
```ts
    if (title) {
      revealOnView(title, { y: 24, duration: 0.9 });
    }
```
Y en el import de `@/scripts/ph-text-animations`: quitar `wrapWords`, añadir `revealOnView`. (Queda: `reducedMotion, trackingReveal, scheduleScrollTriggerRefresh, afterTransitionPaint, revealOnView`.)

- [ ] **Step 2: HomeServicesSection** — en `initHomeServicesAnimations`, mismo cambio sobre `.home-services__title`:

Buscar el bloque `if (title && head) { const words = wrapWords(title); gsap.from(words, { yPercent: 115, ... scrollTrigger: { trigger: head, start: 'top 80%', once: true } }); }` y reemplazar por:
```ts
    if (title) {
      revealOnView(title, { y: 24, duration: 0.9 });
    }
```
Import: quitar `wrapWords`, añadir `revealOnView`.

- [ ] **Step 3: HomeAboutSection** — en `initHomeAboutAnimations`, mismo cambio sobre `.home-about__title`:
```ts
    if (title) {
      revealOnView(title, { y: 24, duration: 0.9 });
    }
```
Import: quitar `wrapWords`, añadir `revealOnView`. (Mantener `counterReveal` y `trackingReveal`.)

- [ ] **Step 4: HomeContactSection** — en `initHomeContactAnimations`, mismo cambio sobre `.home-contact__title`:
```ts
    if (title) {
      revealOnView(title, { y: 24, duration: 0.9 });
    }
```
Import: quitar `wrapWords`, añadir `revealOnView`.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: `Complete!`, sin `error TS`.

- [ ] **Step 6: Verificar en navegador (preview)**

Levantar preview (`npm run preview`) y correr este audit con Playwright (rAF vivo). Navegar a `/`, recargar, hacer jiggle de ratón ~1.3 s, y comprobar en consola del navegador:
```js
// Esperado: stuck = [], totalClipWords MUY por debajo de 18
const inners = document.querySelectorAll('.ph-clip-inner');
const tyOf = (n)=>{const t=getComputedStyle(n).transform;const m=t&&t.match(/matrix[^(]*\(([^)]+)\)/);if(!m)return 0;const p=m[1].split(',').map(Number);return p.length===6?p[5]:(p[13]||0);};
console.log('clipWords', inners.length, 'stuckInView',
  [...document.querySelectorAll('.home-players__title,.home-services__title,.home-about__title,.home-contact__title')]
    .filter(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0 && el.querySelector('.ph-clip-inner');}).map(el=>el.className));
```
Expected: `clipWords` baja de 18 a 6 (solo el hero claim sigue con wrapWords: lead+accent ≈ 6 palabras); ningún `home-*__title` contiene `.ph-clip-inner`; al scrollear, los títulos hacen fade+slide; 0 errores de consola.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/HomePlayersSection.astro src/components/sections/HomeServicesSection.astro src/components/sections/HomeAboutSection.astro src/components/sections/HomeContactSection.astro
git commit -m "refactor(anim): títulos de secciones de home a reveal Tier 2"
```

---

### Task 3: Servicios — áreas + 6 pilares a Tier 2

**Files:**
- Modify: `src/components/sections/ServicesSection.astro`

**Interfaces:**
- Consumes: `revealOnView` (Task 1)

**Tier 1 que NO se toca aquí:** `.srv-hero__title` (hero, inmediato wrapWords) y `.srv-manifest__body` (manifiesto wrapWords).

- [ ] **Step 1: Áreas** — en `initServicesAnimations`, sustituir el bloque del título de áreas (conservando el guard `data-reveal` que ya tiene en el HTML y `revealReveals(section)` al final del init). Buscar:
```ts
    if (areasTitle && areasHead) {
      const words = wrapWords(areasTitle);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.08,
        delay: areasInView ? 0.1 : 0,
        scrollTrigger: areasTrigger,
      });
    }
```
Reemplazar por:
```ts
    if (areasTitle) {
      revealOnView(areasTitle, { y: 24, duration: 0.9, delay: areasInView ? 0.1 : 0 });
    }
```
(El `data-reveal` de `.srv-areas__title` y `.srv-areas__eyebrow` en el HTML se queda; `revealReveals(section)` se queda; `areasInView` se sigue calculando para el delay.)

- [ ] **Step 2: Pilares** — sustituir el título de cada `.srv-block`. Buscar dentro del `pillars.forEach(...)`:
```ts
      const blockTitle = block.querySelector<HTMLElement>('.srv-block__title');
      if (blockTitle) {
        const words = wrapWords(blockTitle);
        gsap.from(words, {
          yPercent: 115,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.08,
          scrollTrigger: { trigger: block, start: 'top 75%', once: true },
        });
      }
```
Reemplazar por:
```ts
      const blockTitle = block.querySelector<HTMLElement>('.srv-block__title');
      if (blockTitle) {
        revealOnView(blockTitle, { y: 22, duration: 0.85 });
      }
```
(`wrapWords` se mantiene en el import: lo siguen usando `.srv-hero__title` y `.srv-manifest__body`. Añadir `revealOnView` al import.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `Complete!`, sin `error TS`.

- [ ] **Step 4: Verificar en navegador**

Preview, navegar a `/servicios`. **Desktop (1366×768)** y **móvil (390×844)**, recargar + jiggle:
```js
console.log('clipWords', document.querySelectorAll('.ph-clip-inner').length);
// áreas en móvil (in-view): debe acabar visible
const a=document.querySelector('.srv-areas__title'); console.log('areas anim', a && getComputedStyle(a.querySelector('span')||a).opacity);
```
Expected: `clipWords` baja de 35 a ~3 (solo hero `.srv-hero__title` ≈ 2-3 palabras; el manifiesto está below-the-fold y aún no envuelto hasta scroll — al hacer scroll subirá un poco). En móvil, `.srv-areas__title` ("Gestionamos tu carrera...") aparece con fade+slide, sin parpadeo ni atasco. Pilares hacen fade+slide al scrollear. 0 errores de consola.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ServicesSection.astro
git commit -m "refactor(anim): áreas y pilares de Servicios a reveal Tier 2"
```

---

### Task 4: Sobre-nosotros — manifiesto + equipo a Tier 2

**Files:**
- Modify: `src/components/sections/AboutSection.astro`

**Interfaces:**
- Consumes: `revealOnView` (Task 1)

**Tier 1 que NO se toca aquí:** `.abt-hero__title` (hero, inmediato wrapWords) y `.abt-closing__quote` (cita de cierre wrapWords).

- [ ] **Step 1: Manifiesto** — en `initAboutAnimations`, dentro del `section.querySelectorAll('.abt-manifesto__row').forEach((row) => { ... })`, sustituir el bloque del título. Buscar:
```ts
      if (title) {
        const words = wrapWords(title);
        gsap.from(words, {
          yPercent: 115,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power4.out',
          scrollTrigger: { trigger: row, start: 'top 88%', once: true },
        });
      }
```
Reemplazar por:
```ts
      if (title) {
        revealOnView(title, { y: 18, duration: 0.7 });
      }
```

- [ ] **Step 2: Equipo** — sustituir el título del equipo. Buscar:
```ts
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
```
Reemplazar por:
```ts
    const teamTitle = section.querySelector<HTMLElement>('.abt-team__title');
    if (teamTitle) {
      revealOnView(teamTitle, { y: 22, duration: 0.8 });
    }
```
(`wrapWords` se mantiene en el import: lo usan `.abt-hero__title` y `.abt-closing__quote`. Añadir `revealOnView` al import.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `Complete!`, sin `error TS`.

- [ ] **Step 4: Verificar en navegador**

Preview, navegar a `/sobre-nosotros`. Desktop + móvil, recargar + jiggle, y scrollear hasta manifiesto/equipo:
```js
console.log('clipWords', document.querySelectorAll('.ph-clip-inner').length);
```
Expected: `clipWords` arranca en ~2-3 (solo hero `.abt-hero__title`); al scrollear hasta el cierre, sube por `.abt-closing__quote` (Tier 1). Manifiesto y equipo hacen fade+slide. Hero title intacto, cita de cierre intacta. 0 errores de consola, 0 atascos.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/AboutSection.astro
git commit -m "refactor(anim): manifiesto y equipo de Sobre-nosotros a reveal Tier 2"
```

---

### Task 5: Verificación global + push

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Audit completo (Playwright, rAF vivo, desktop + móvil)**

Reproducir el barrido del 2026-06-23 sobre las 4 páginas:
- 0 títulos atascados en viewport (desktop + móvil).
- 0 errores de consola.
- Links 200.
- Recuento `wrapWords` por página claramente reducido vs baseline (Home 18→~6, Servicios 35→~3, Sobre-nosotros 10→~2-3 + cierre al scroll, Talentos 3 sin cambio).
- Spot-check visual: Tier 1 conserva la coreografía (hero home, H1 de cada página, manifiesto Servicios, cita cierre About); Tier 2 hace fade+slide.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Actualizar memoria**

Marcar el escalonado como shipped en `project_nav_jank_audit_2026_06_22.md` y `MEMORY.md`.

---

## Notas de alcance (fuera de este plan)

- **Eyebrows** (`trackingReveal`, anima `letter-spacing` → layout por frame): se mantienen. Migrarlos a fade simple es una mejora menor de 120Hz para otra pasada.
- **Cuerpos con `splitWords` + blur** (hero de About, manifiesto): se mantienen; son otra coreografía, no `wrapWords`. Posible Tier 2 futuro si se quiere aligerar más.
