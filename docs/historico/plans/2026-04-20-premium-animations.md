# Premium Animations V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir animaciones premium (entrance on-scroll + 4 flourishes) al homepage, `/servicios` y `/jugadores` index, reutilizando `src/scripts/ph-text-animations.ts` y GSAP 3.14.2 ya instalados.

**Architecture:** Patrón canónico idéntico a `AboutSection.astro`: `<script>` por sección, init en `astro:page-load`, ScrollTriggers con `{ once: true }`, `ScrollTrigger.refresh()` al final. Dos helpers nuevos (`magneticHover`, `clipPathReveal`) se añaden a `ph-text-animations.ts`. Cleanup global de ScrollTriggers ya vive en `astro:before-swap` dentro del helper module (líneas 149-153) — las secciones sólo necesitan limpiar listeners de magnetic hover explícitamente.

**Tech Stack:** GSAP 3.14.2 + ScrollTrigger, Astro 5 ClientRouter, TypeScript (strict).

**Spec:** `docs/superpowers/specs/2026-04-20-premium-animations-design.md`

---

## File Structure

**Modify (9 files):**
- `src/scripts/ph-text-animations.ts` — añadir dos helpers (`magneticHover`, `clipPathReveal`) y su cleanup de disposers de magnetic en el listener existente de `astro:before-swap`.
- `src/components/sections/HeroSection.astro` — wrapWords claim + parallax scroll.
- `src/components/sections/HomePlayersSection.astro` — head entrance + stagger+scale en 3 cards.
- `src/components/sections/HomeServicesSection.astro` — head entrance + accordion rows stagger.
- `src/components/sections/HomeAboutSection.astro` — head entrance + counters + magnetic CTA.
- `src/components/sections/HomeContactSection.astro` — head entrance + clip-path image + magnetic email.
- `src/components/sections/ServicesSection.astro` — bloques entrance + clip-path 6 pillars + magnetic CTA.
- `src/components/sections/TalentsSection.astro` — head entrance + stagger+scale grid.

**Create / Delete:** ninguno.

---

## Shared Patterns (referencia para todos los tasks)

**Canonical per-section script:**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords, trackingReveal /* … */ } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initSectionAnimations(): void {
    const section = document.querySelector<HTMLElement>('.my-section');
    if (!section) return;
    if (reducedMotion()) return;

    // tweens + ScrollTriggers with { once: true }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initSectionAnimations);
</script>
```

**Head entrance (reutilizado en 6 secciones):** eyebrow con `trackingReveal`, title con `wrapWords` + `gsap.from yPercent:115` stagger 0.08s `power4.out`, lead con fade-up 18px.

**Verificación común tras cada task:**
- `npx astro check` → 0 errors, 0 warnings en `src/`.
- `npm run dev` + scroll manual: entrada dispara una sola vez, no re-dispara al volver a scrollear.
- `prefers-reduced-motion: reduce` en DevTools → sin animaciones, contenido estático.

---

## Task 1: Helpers — magneticHover + clipPathReveal

**Files:**
- Modify: `src/scripts/ph-text-animations.ts`

- [ ] **Step 1: Añadir módulo-level array de disposers**

Insertar después de la línea `const activeScrambles: Array<(time: number, deltaTime: number) => void> = [];` (línea 65):

```ts
// ── Magnetic hover disposers ──────────────────────────────────────────────────
const magneticDisposers: Array<() => void> = [];
```

- [ ] **Step 2: Añadir helper `magneticHover`**

Insertar antes del bloque `// ── Cleanup on View Transitions swap ─────`:

```ts
// ── Magnetic hover ────────────────────────────────────────────────────────────
/**
 * Attaches pointer-follow "magnetic" hover to el. Only active on devices with
 * real hover + fine pointer (skipped on touch). Returns a cleanup function; the
 * cleanup is also registered module-globally so `astro:before-swap` reverts it.
 */
export function magneticHover(el: HTMLElement, strength = 0.3): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return () => {};
  }

  const onMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
  };

  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);

  const dispose = () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    gsap.set(el, { x: 0, y: 0, clearProps: 'transform' });
  };
  magneticDisposers.push(dispose);
  return dispose;
}
```

- [ ] **Step 3: Añadir helper `clipPathReveal`**

Inmediatamente debajo de `magneticHover`:

```ts
// ── Clip-path reveal ──────────────────────────────────────────────────────────
/**
 * Animates `clipPath: inset(…)` from fully clipped (from a side) to fully open.
 * No-ops under reduced motion (caller is expected to gate too, but this is a
 * safety net for when reduced-motion check is external).
 */
export function clipPathReveal(
  el: HTMLElement,
  direction: 'left' | 'right' = 'left',
  scrollTrigger?: ScrollTrigger.Vars,
): gsap.core.Tween {
  const from = direction === 'left' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
  return gsap.fromTo(
    el,
    { clipPath: from },
    {
      clipPath: 'inset(0 0 0 0)',
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger,
    },
  );
}
```

- [ ] **Step 4: Extender cleanup global para disposers de magnetic**

Reemplazar el bloque existente (líneas 148-153):

```ts
// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', () => {
  activeScrambles.forEach((t) => gsap.ticker.remove(t));
  activeScrambles.length = 0;
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
```

con:

```ts
// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', () => {
  activeScrambles.forEach((t) => gsap.ticker.remove(t));
  activeScrambles.length = 0;
  magneticDisposers.forEach((d) => d());
  magneticDisposers.length = 0;
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
```

- [ ] **Step 5: Verificación**

Run: `npx astro check`
Expected: 0 errors, 0 warnings (hints de root *.mjs no cuentan).

- [ ] **Step 6: Commit**

```bash
git add src/scripts/ph-text-animations.ts
git commit -m "feat(motion): add magneticHover + clipPathReveal helpers"
```

---

## Task 2: HeroSection — parallax + claim wrap

**Files:**
- Modify: `src/components/sections/HeroSection.astro`

- [ ] **Step 1: Añadir `<script>` al final del componente (antes de `</>` final si aplica; si ya hay `<script>` lo extendemos)**

Añadir al final del archivo (después del `<style>`):

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initHeroAnimations(): void {
    const hero = document.querySelector<HTMLElement>('.hero--home');
    if (!hero) return;
    if (reducedMotion()) return;

    const lead = hero.querySelector<HTMLElement>('.hero-claim__lead');
    const accent = hero.querySelector<HTMLElement>('.hero-claim__accent');
    const claim = hero.querySelector<HTMLElement>('.hero-claim');
    const scroll = hero.querySelector<HTMLElement>('.hero-scroll');

    if (lead) {
      const words = wrapWords(lead);
      gsap.from(words, {
        yPercent: 115,
        duration: 1.0,
        ease: 'power4.out',
        stagger: 0.08,
        delay: 0.2,
      });
    }
    if (accent) {
      const words = wrapWords(accent);
      gsap.from(words, {
        yPercent: 115,
        duration: 1.0,
        ease: 'power4.out',
        stagger: 0.08,
        delay: 0.4,
      });
    }
    if (scroll) {
      gsap.from(scroll, { opacity: 0, y: 12, duration: 0.8, ease: 'power2.out', delay: 0.9 });
    }
    if (claim) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        onUpdate: (self) => {
          gsap.set(claim, { yPercent: self.progress * 20 });
        },
      });
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initHeroAnimations);
</script>
```

- [ ] **Step 2: Verificación**

Run: `npx astro check && npm run dev`
Manual: carga `/` → hero claim hace curtain reveal en lead + accent con 0.2s / 0.4s de offset. Scroll indicator aparece a 0.9s. Al scrollear hacia abajo, el claim se desplaza suavemente hasta 20% hacia abajo antes de salir del viewport.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HeroSection.astro
git commit -m "feat(motion): hero claim curtain reveal + parallax"
```

---

## Task 3: HomePlayersSection — head entrance + cards stagger+scale

**Files:**
- Modify: `src/components/sections/HomePlayersSection.astro`

- [ ] **Step 1: Añadir `transform-origin` a las cards en el bloque `<style>`**

Buscar el selector `.home-players__card` y añadirle:

```css
transform-origin: center bottom;
```

- [ ] **Step 2: Añadir `<script>` al final del archivo**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords, trackingReveal } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initHomePlayersAnimations(): void {
    const section = document.querySelector<HTMLElement>('.home-players');
    if (!section) return;
    if (reducedMotion()) return;

    const eyebrow = section.querySelector<HTMLElement>('.home-players__eyebrow');
    const title = section.querySelector<HTMLElement>('.home-players__title');
    const lead = section.querySelector<HTMLElement>('.home-players__lead');
    const head = section.querySelector<HTMLElement>('.home-players__head');
    const grid = section.querySelector<HTMLElement>('.home-players__grid');
    const cards = section.querySelectorAll<HTMLElement>('.home-players__card');

    if (eyebrow && head) {
      trackingReveal(eyebrow, { trigger: head, start: 'top 80%', once: true });
    }
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
    if (lead && head) {
      gsap.from(lead, {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: { trigger: head, start: 'top 80%', once: true },
      });
    }
    if (cards.length && grid) {
      gsap.from(cards, {
        opacity: 0,
        scale: 0.96,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
      });
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initHomePlayersAnimations);
</script>
```

- [ ] **Step 3: Verificación**

Run: `npx astro check`
Manual en `/`: scroll hasta players → eyebrow con tracking, title curtain, lead fade-up, 3 cards con stagger 0.12s (scale 0.96→1 + y 24→0 + fade).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/HomePlayersSection.astro
git commit -m "feat(motion): home players head entrance + cards stagger+scale"
```

---

## Task 4: HomeServicesSection — head entrance + accordion rows stagger

**Files:**
- Modify: `src/components/sections/HomeServicesSection.astro`

- [ ] **Step 1: Añadir `<script>` al final del archivo**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords, trackingReveal } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initHomeServicesAnimations(): void {
    const section = document.querySelector<HTMLElement>('.home-services');
    if (!section) return;
    if (reducedMotion()) return;

    const eyebrow = section.querySelector<HTMLElement>('.home-services__eyebrow');
    const title = section.querySelector<HTMLElement>('.home-services__title');
    const lead = section.querySelector<HTMLElement>('.home-services__lead');
    const head = section.querySelector<HTMLElement>('.home-services__head');
    const list = section.querySelector<HTMLElement>('.home-services__list');
    const rows = section.querySelectorAll<HTMLElement>('.home-services__row');

    if (eyebrow && head) {
      trackingReveal(eyebrow, { trigger: head, start: 'top 80%', once: true });
    }
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
    if (lead && head) {
      gsap.from(lead, {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: { trigger: head, start: 'top 80%', once: true },
      });
    }
    if (rows.length && list) {
      gsap.from(rows, {
        opacity: 0,
        y: 12,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: list, start: 'top 82%', once: true },
      });
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initHomeServicesAnimations);
</script>
```

**Nota:** si los nombres de clase de eyebrow/title/lead/list/row difieren en el componente, el implementador debe leer el componente primero (`Read HomeServicesSection.astro`) y ajustar los selectores antes de escribir el script. Las clases mostradas son la convención BEM del proyecto; verificar que existen.

- [ ] **Step 2: Verificación**

Run: `npx astro check`
Manual en `/`: scroll hasta services → head (eyebrow/title/lead) entra, después stagger 0.06s de las filas accordion.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeServicesSection.astro
git commit -m "feat(motion): home services head + rows stagger"
```

---

## Task 5: HomeAboutSection — head entrance + counters + magnetic CTA

**Files:**
- Modify: `src/components/sections/HomeAboutSection.astro`

- [ ] **Step 1: Añadir `<script>` al final del archivo**

Antes de escribir, leer el componente para confirmar selectores y valores numéricos de las stats.

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import {
    reducedMotion, wrapWords, trackingReveal, counterReveal, magneticHover,
  } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initHomeAboutAnimations(): void {
    const section = document.querySelector<HTMLElement>('.home-about');
    if (!section) return;
    if (reducedMotion()) return;

    const eyebrow = section.querySelector<HTMLElement>('.home-about__eyebrow');
    const title = section.querySelector<HTMLElement>('.home-about__title');
    const body = section.querySelector<HTMLElement>('.home-about__body');
    const head = section.querySelector<HTMLElement>('.home-about__head');
    const stats = section.querySelector<HTMLElement>('.home-about__stats');
    const statValues = section.querySelectorAll<HTMLElement>('.home-about__stat-value[data-counter]');
    const cta = section.querySelector<HTMLElement>('.home-about__cta');

    if (eyebrow && head) {
      trackingReveal(eyebrow, { trigger: head, start: 'top 80%', once: true });
    }
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
    if (body && head) {
      gsap.from(body, {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: { trigger: head, start: 'top 80%', once: true },
      });
    }
    if (statValues.length && stats) {
      statValues.forEach((el) => {
        const target = Number(el.dataset.counter ?? el.textContent ?? '0');
        counterReveal(el, target, { trigger: stats, start: 'top 82%', once: true });
      });
    }
    if (cta) {
      magneticHover(cta, 0.3);
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initHomeAboutAnimations);
</script>
```

- [ ] **Step 2: Asegurar que las stats tienen `data-counter`**

El implementador debe leer el componente. Si los valores vienen renderizados como `21`, `6`, `360` sin `data-counter`, añadirle `data-counter={value}` a cada `.home-about__stat-value` (o equivalente). Para el "360°", aplicar `counterReveal` sólo al número y dejar el `°` como sufijo estático adyacente.

- [ ] **Step 3: Verificación**

Run: `npx astro check`
Manual: scroll hasta about → head anima, stats hacen tick-up al entrar en viewport, hover sobre "Conócenos" sigue el cursor suavemente y vuelve a 0 al salir.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/HomeAboutSection.astro
git commit -m "feat(motion): home about head + counters + magnetic CTA"
```

---

## Task 6: HomeContactSection — head entrance + clip-path image + magnetic email

**Files:**
- Modify: `src/components/sections/HomeContactSection.astro`

- [ ] **Step 1: Añadir `<script>` al final del archivo**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import {
    reducedMotion, wrapWords, trackingReveal, clipPathReveal, magneticHover,
  } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initHomeContactAnimations(): void {
    const section = document.querySelector<HTMLElement>('.home-contact');
    if (!section) return;
    if (reducedMotion()) return;

    const eyebrow = section.querySelector<HTMLElement>('.home-contact__eyebrow');
    const title = section.querySelector<HTMLElement>('.home-contact__title');
    const lead = section.querySelector<HTMLElement>('.home-contact__lead');
    const head = section.querySelector<HTMLElement>('.home-contact__head');
    const image = section.querySelector<HTMLElement>('.home-contact__image');
    const email = section.querySelector<HTMLElement>('.home-contact__email a');

    if (eyebrow && head) {
      trackingReveal(eyebrow, { trigger: head, start: 'top 80%', once: true });
    }
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
    if (lead && head) {
      gsap.from(lead, {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: { trigger: head, start: 'top 80%', once: true },
      });
    }
    if (image) {
      clipPathReveal(image, 'left', { trigger: image, start: 'top 80%', once: true });
    }
    if (email instanceof HTMLElement) {
      magneticHover(email, 0.25);
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initHomeContactAnimations);
</script>
```

- [ ] **Step 2: Verificación**

Run: `npx astro check`
Manual: scroll hasta contact → head entra, imagen placeholder se revela de izquierda a derecha con clip-path, hover sobre email sigue cursor.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HomeContactSection.astro
git commit -m "feat(motion): home contact head + clip-path image + magnetic email"
```

---

## Task 7: ServicesSection — entrance por bloques + clip-path 6 pillars + magnetic CTA

**Files:**
- Modify: `src/components/sections/ServicesSection.astro`

- [ ] **Step 1: Leer el componente para localizar selectores reales**

El componente es grande. Antes de escribir el script, el implementador debe localizar:
- Hero block del servicio: title + lead + `.srv-rule` (separator).
- Areas head + accordion rows.
- 6 pillar blocks con `.srv-block__img` (I, II, III, IV, V, VI).
- Manifest block con body + accent.
- Final CTA button.

Los selectores abajo asumen la convención BEM del archivo (prefijo `srv-`). Ajustar si difieren.

- [ ] **Step 2: Añadir `<script>` al final del archivo**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import {
    reducedMotion, wrapWords, trackingReveal, scrambleReveal,
    clipPathReveal, magneticHover,
  } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initServicesAnimations(): void {
    const section = document.querySelector<HTMLElement>('.services-section');
    if (!section) return;
    if (reducedMotion()) return;

    // ── Hero block ───────────────────────────────────────
    const heroTitle = section.querySelector<HTMLElement>('.srv-hero__title');
    const heroLead = section.querySelector<HTMLElement>('.srv-hero__lead');
    const heroRule = section.querySelector<HTMLElement>('.srv-hero .srv-rule');

    if (heroTitle) {
      const words = wrapWords(heroTitle);
      gsap.from(words, {
        yPercent: 115,
        duration: 1.0,
        ease: 'power4.out',
        stagger: 0.08,
        delay: 0.1,
      });
    }
    if (heroLead) {
      gsap.from(heroLead, {
        opacity: 0,
        y: 18,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.45,
      });
    }
    if (heroRule) {
      gsap.from(heroRule, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.0,
        ease: 'expo.out',
        delay: 0.6,
      });
    }

    // ── Areas head ───────────────────────────────────────
    const areasHead = section.querySelector<HTMLElement>('.srv-areas__head');
    const areasEyebrow = section.querySelector<HTMLElement>('.srv-areas__eyebrow');
    const areasTitle = section.querySelector<HTMLElement>('.srv-areas__title');
    if (areasEyebrow && areasHead) {
      trackingReveal(areasEyebrow, { trigger: areasHead, start: 'top 80%', once: true });
    }
    if (areasTitle && areasHead) {
      const words = wrapWords(areasTitle);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.08,
        scrollTrigger: { trigger: areasHead, start: 'top 80%', once: true },
      });
    }

    // ── 6 pillar blocks ──────────────────────────────────
    const pillars = section.querySelectorAll<HTMLElement>('.srv-block');
    pillars.forEach((block, idx) => {
      const img = block.querySelector<HTMLElement>('.srv-block__img');
      if (img) {
        const dir = idx % 2 === 0 ? 'left' : 'right';
        clipPathReveal(img, dir, { trigger: block, start: 'top 75%', once: true });
      }
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
      const blockBody = block.querySelector<HTMLElement>('.srv-block__body');
      if (blockBody) {
        gsap.from(blockBody, {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.15,
          scrollTrigger: { trigger: block, start: 'top 75%', once: true },
        });
      }
    });

    // ── Manifest ─────────────────────────────────────────
    const manifest = section.querySelector<HTMLElement>('.srv-manifest');
    const manifestBody = section.querySelector<HTMLElement>('.srv-manifest__body');
    const manifestAccent = section.querySelector<HTMLElement>('.srv-manifest__accent');
    if (manifestBody && manifest) {
      const words = wrapWords(manifestBody);
      gsap.from(words, {
        yPercent: 115,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.05,
        scrollTrigger: { trigger: manifest, start: 'top 80%', once: true },
      });
    }
    if (manifestAccent && manifest) {
      ScrollTrigger.create({
        trigger: manifest,
        start: 'top 75%',
        once: true,
        onEnter: () => scrambleReveal(manifestAccent, 0.4),
      });
    }

    // ── Final CTA ────────────────────────────────────────
    const cta = section.querySelector<HTMLElement>('.srv-cta');
    if (cta) {
      magneticHover(cta, 0.3);
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initServicesAnimations);
</script>
```

- [ ] **Step 3: Verificación**

Run: `npx astro check`
Manual en `/servicios`: hero title curtain reveal + lead fade + rule scaleX, areas head entra, cada pillar hace clip-path reveal alternando left/right + title curtain + body fade, manifest body hace wrapWords + accent scramble, CTA magnetic.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ServicesSection.astro
git commit -m "feat(motion): services page entrances + clip-path pillars + magnetic CTA"
```

---

## Task 8: TalentsSection — head entrance + stagger+scale grid

**Files:**
- Modify: `src/components/sections/TalentsSection.astro`

- [ ] **Step 1: Añadir `transform-origin` a las cards en el `<style>`**

Buscar `.talents__card` y añadir:

```css
transform-origin: center bottom;
```

- [ ] **Step 2: Añadir `<script>` al final del archivo**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { reducedMotion, wrapWords, trackingReveal } from '@/scripts/ph-text-animations';

  gsap.registerPlugin(ScrollTrigger);

  function initTalentsAnimations(): void {
    const section = document.querySelector<HTMLElement>('.talents');
    if (!section) return;
    if (reducedMotion()) return;

    const eyebrow = section.querySelector<HTMLElement>('.talents__eyebrow');
    const title = section.querySelector<HTMLElement>('.talents__title');
    const lead = section.querySelector<HTMLElement>('.talents__lead');
    const head = section.querySelector<HTMLElement>('.talents__head');
    const controls = section.querySelector<HTMLElement>('.talents__controls');
    const grid = section.querySelector<HTMLElement>('.talents__grid');
    const cards = section.querySelectorAll<HTMLElement>('.talents__card');

    if (eyebrow && head) {
      trackingReveal(eyebrow, { trigger: head, start: 'top 80%', once: true });
    }
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
    if (lead && head) {
      gsap.from(lead, {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: { trigger: head, start: 'top 80%', once: true },
      });
    }
    if (controls) {
      gsap.from(controls, {
        opacity: 0,
        y: 14,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.3,
        scrollTrigger: { trigger: controls, start: 'top 85%', once: true },
      });
    }
    if (cards.length && grid) {
      gsap.from(cards, {
        opacity: 0,
        scale: 0.96,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      });
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('astro:page-load', initTalentsAnimations);
</script>
```

- [ ] **Step 3: Verificación**

Run: `npx astro check`
Manual en `/jugadores`: head entra, controls fade-up, grid cards stagger 0.05s con scale+y+fade.

**Nota sobre filtro/búsqueda:** si la UI tiene filtros que ocultan/muestran cards, confirmar que después de filtrar las cards reaparecen en estado final (no invisibles por tween `.from`). Si es un problema, los filtros deben resetear inline styles o usar `gsap.set(..., {clearProps: 'all'})` tras el tween. Verificar manualmente.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/TalentsSection.astro
git commit -m "feat(motion): talents head + controls + grid stagger+scale"
```

---

## Task 9: Final Verification Sweep

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Astro check clean**

Run: `npx astro check`
Expected: 0 errors, 0 warnings en `src/`. Hints aceptables en root `*.mjs`.

- [ ] **Step 2: Astro build clean**

Run: `npx astro build`
Expected: 240 páginas construidas sin errores ni warnings nuevos respecto al baseline previo.

- [ ] **Step 3: Dev server manual QA**

Run: `npm run dev`

Recorrer:
- `/` homepage: hero claim + parallax, players cards stagger, services rows stagger, about counters + magnetic CTA, contact head + clip-path image + magnetic email.
- `/servicios`: hero entrance, areas head, 6 pillars clip-path alternando, manifest body + scramble, CTA magnetic.
- `/jugadores`: head + controls + grid stagger+scale.
- Navegar con ClientRouter `/` → `/servicios` → `/jugadores` → `/`. Verificar en DevTools console: sin errores.
- En DevTools console tras carga estable: `ScrollTrigger.getAll().length` → debe ser > 0 en la página activa.
- Tras navegar a otra página con ClientRouter: `ScrollTrigger.getAll().length` → debe bajar (old triggers killed).
- Activar `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature) → recargar todas las páginas. Todo el contenido debe ser visible sin animar.
- Emular dispositivo táctil (Responsive mode) → hover magnetic no debe activarse (pointer:coarse).

- [ ] **Step 4: Commit (si hubiera fixes)**

Si la QA manual reveló ajustes, hacer commits individuales por fix y nota en el mensaje.

Si todo está verde: no hace falta commit nuevo.

- [ ] **Step 5: Handoff**

Reportar al usuario: Phase completa, X commits añadidos, diff summary, próximo paso (push a main con finishing-a-development-branch skill).

---

## Acceptance Criteria (spec alignment)

- ✅ `npx astro check` → 0 errors / 0 warnings en `src/`.
- ✅ `npx astro build` → completa sin errores nuevos.
- ✅ Cada sección dispara entradas una sola vez (`once: true`).
- ✅ `prefers-reduced-motion: reduce` → sin animaciones, contenido visible.
- ✅ Magnetic hover gated por `(hover: hover) and (pointer: fine)`.
- ✅ Sin CLS ≥ 0.02 causado por animaciones.
- ✅ Sin errores de consola en page load ni ClientRouter navigation.
- ✅ Cleanup global de ScrollTriggers y magnetic disposers en `astro:before-swap` — ya implementado en Task 1.
- ✅ Coherencia visual con `/sobre-nosotros` (mismas easings, duraciones, sensación).
