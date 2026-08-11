# Premium Animations V1 — Design Spec

**Date:** 2026-04-20
**Scope:** Homepage (todas las secciones) + `/servicios` + `/jugadores` index
**Intensity:** Moderate (entrance on-scroll + 4 flourishes)
**Page transitions:** ClientRouter fade default — **no** custom transition

---

## 1. Goal

Elevar el homepage, `/servicios` y `/jugadores` al nivel de motion de `/sobre-nosotros`, reutilizando la biblioteca existente `src/scripts/ph-text-animations.ts` y el patrón de `gsap.context()` por sección. Añadir cuatro flourishes premium (parallax hero, stagger+scale en cards, magnetic hover en CTAs clave, clip-path reveal en imágenes) que eleven la estética sin romper la identidad editorial.

---

## 2. Architecture

**Reutilización (zero-new-dep):**
- `src/scripts/ph-text-animations.ts` ya exporta `wrapWords`, `splitWords`, `scrambleReveal`, `trackingReveal`, `counterReveal`, `reducedMotion`.
- GSAP 3.14.2 + ScrollTrigger ya instalados y registrados.
- Cleanup universal en `astro:before-swap` ya resuelto.

**Patrón canónico por sección** (idéntico a `AboutSection.astro`):

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { wrapWords, reducedMotion } from '@/scripts/ph-text-animations';

  const init = () => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => { /* tweens + ScrollTriggers */ });
    document.addEventListener('astro:before-swap', () => ctx.revert(), { once: true });
  };
  init();
  document.addEventListener('astro:page-load', init);
</script>
```

**Helpers nuevos** (añadir a `ph-text-animations.ts`):
- `magneticHover(el, strength = 0.3)` — pointer follow suave, gated por `(hover: hover) and (pointer: fine)`.
- `clipPathReveal(el, direction, trigger?)` — `inset()` clip-path reveal, dirección `left` o `right`.

**No añadimos** plugins GSAP de pago (`SplitText`, `DrawSVG`, etc.).

---

## 3. Per-Component Inventory

### Homepage

| Sección | Entrada on-scroll | Flourish |
|---|---|---|
| **HeroSection** | `hero-claim__lead` + `__accent` con `wrapWords` (curtain), stagger 0.08s. Scroll indicator fade + pulse. | **Parallax (#1)**: claim se desplaza `yPercent: 0→20` durante el recorrido del hero, scrub 0.8s. |
| **HomePlayersSection** | Head: eyebrow `trackingReveal`, title `wrapWords`, lead fade-up. | **Stagger+scale (#2)**: 3 cards, stagger 0.12s, `opacity 0→1` + `scale 0.96→1` + `y: 24→0`. |
| **HomeServicesSection** | Head mismo patrón que Players. Filas accordion: stagger 0.06s, slide-up 12px + fade. | — |
| **HomeAboutSection** | Head: `wrapWords` title + fade body. Stats con `counterReveal` (21, 6, 360°). | **Magnetic hover (#3)** en CTA "Conócenos". |
| **HomeContactSection** | Head: eyebrow + `wrapWords` title + fade lead. | **Clip-path reveal (#4)** en imagen placeholder (left-to-right, 1.2s). **Magnetic hover (#3)** en email link. |

### Páginas completas

| Sección | Entrada on-scroll | Flourish |
|---|---|---|
| **ServicesSection** (`/servicios`) | Hero: `wrapWords` title + fade lead + `.srv-rule` width 0→100%. Areas head: tracking + `wrapWords`. Manifest: `wrapWords` body + `scrambleReveal` en accent. | **Clip-path reveal (#4)** en 6 imágenes de pilares (I/III/V desde `left`, II/IV/VI desde `right`). **Magnetic hover (#3)** en CTA final. |
| **TalentsSection** (`/jugadores`) | Head: tracking eyebrow + `wrapWords` title + fade lead. Controls bar: fade-up unitario. | **Stagger+scale (#2)** en grid: stagger 0.05s, `scale 0.96→1` + `y: 20→0` + fade. |

### Resumen de flourishes
- Parallax: 1 uso (Hero).
- Stagger+scale: 3 usos (Players home, Talents, Services pillars).
- Magnetic hover: 3 usos (HomeAbout CTA, HomeContact email, Services CTA).
- Clip-path reveal: 7 usos (HomeContact imagen + 6 pillars).

---

## 4. Flourish Specs

### #1 Parallax en Hero claim

```js
ScrollTrigger.create({
  trigger: '.hero--home',
  start: 'top top',
  end: 'bottom top',
  scrub: 0.8,
  onUpdate: (self) => {
    gsap.set('.hero-claim', { yPercent: self.progress * 20 });
  },
});
```

Bajo `reducedMotion`: no se crea el trigger; claim queda estático.

### #2 Stagger + scale en cards

```js
gsap.from(cards, {
  opacity: 0,
  scale: 0.96,
  y: 24,
  duration: 0.9,
  ease: 'power3.out',
  stagger: 0.12, // 0.05 en TalentsSection
  scrollTrigger: { trigger: listEl, start: 'top 80%' },
});
```

`transform-origin: center bottom` en las cards (añadir a CSS). Bajo `reducedMotion`: sólo `opacity 0→1` en 0.3s, sin transform.

### #3 Magnetic hover

Nuevo helper `magneticHover(el, strength = 0.3)`:

```ts
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
  const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
  };
}
```

Retorna función cleanup. La sección la almacena en un array local de disposers y los ejecuta en el listener de `astro:before-swap` **antes** de `ctx.revert()` (porque `gsap.context()` sólo trackea tweens GSAP, no event listeners). Bajo `reducedMotion`: no se adjunta (devuelve noop).

**Patrón de uso en sección con magnetic hover:**

```js
const disposers: Array<() => void> = [];
const init = () => {
  if (reducedMotion()) return;
  const ctx = gsap.context(() => { /* tweens */ });
  const cta = document.querySelector<HTMLElement>('.my-cta');
  if (cta) disposers.push(magneticHover(cta));
  document.addEventListener('astro:before-swap', () => {
    disposers.forEach((d) => d());
    disposers.length = 0;
    ctx.revert();
  }, { once: true });
};
```

### #4 Clip-path reveal

Nuevo helper `clipPathReveal`:

```ts
export function clipPathReveal(
  el: HTMLElement,
  direction: 'left' | 'right' = 'left',
  trigger?: ScrollTrigger.Vars,
): gsap.core.Tween {
  const from = direction === 'left'
    ? 'inset(0 100% 0 0)'
    : 'inset(0 0 0 100%)';
  return gsap.fromTo(el,
    { clipPath: from },
    { clipPath: 'inset(0 0 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: trigger },
  );
}
```

Bajo `reducedMotion`: helper early-returns un tween vacío; imagen visible sin animar.

---

## 5. Motion Tokens (defaults reutilizados)

| Token | Valor | Uso |
|---|---|---|
| Duración corta | 0.6s | Eyebrows, separadores |
| Duración estándar | 0.9s | Titles, leads, cards |
| Duración larga | 1.2s | Clip-path reveals |
| Stagger denso | 0.05s | TalentsSection (grid grande) |
| Stagger estándar | 0.08–0.12s | Cards, accordion rows |
| Easing rápida | `power3.out` | Cards, stats |
| Easing suave | `expo.out` | Títulos, clip-path, tracking |
| Easing return | `power2.out` | Magnetic hover follow |
| ScrollTrigger start | `'top 80%'` | Default para entradas |
| Scrub parallax | 0.8s | Hero claim |

---

## 6. Reduced Motion & Accesibilidad

**Gate universal:** cada `init()` de sección abre con `if (reducedMotion()) return;`. La función existe en `ph-text-animations.ts:7`.

**Comportamiento bajo `prefers-reduced-motion: reduce`:**
- Entradas on-scroll → skip completo; elementos visibles en estado final sin fade-up.
- Parallax hero → no se crea trigger.
- Stagger cards → opcional fade 0.3s sin transform.
- Magnetic hover → listeners no se adjuntan (noop desde `matchMedia` check).
- Clip-path reveal → imagen visible sin animar.

**A11y:**
- Ninguna animación bloquea foco, scroll ni interacción.
- Sin `will-change` permanente (se añade/quita durante el tween si hace falta).
- Sin loops infinitos nuevos.
- Cleanup via `astro:before-swap` sigue el patrón existente — ClientRouter no deja tweens huérfanos.

---

## 7. Files touched

**Modify:**
- `src/scripts/ph-text-animations.ts` — añadir `magneticHover` y `clipPathReveal`.
- `src/components/sections/HeroSection.astro` — añadir `<script>` con parallax + wrapWords en claim.
- `src/components/sections/HomePlayersSection.astro` — añadir `<script>` con head entrance + stagger+scale en cards.
- `src/components/sections/HomeServicesSection.astro` — añadir `<script>` con head entrance + accordion rows stagger.
- `src/components/sections/HomeAboutSection.astro` — añadir `<script>` con head entrance + counter stats + magnetic CTA.
- `src/components/sections/HomeContactSection.astro` — añadir `<script>` con head entrance + clip-path imagen + magnetic email.
- `src/components/sections/ServicesSection.astro` — añadir `<script>` con entrance por bloques + clip-path pillars + magnetic CTA final.
- `src/components/sections/TalentsSection.astro` — añadir `<script>` con head entrance + stagger+scale grid.

**Create:** ninguno.

**Delete:** ninguno.

---

## 8. Acceptance Criteria

- `npx astro check` → 0 errors / 0 warnings / 0 hints en `src/`.
- `npx astro build` → completa sin errores ni warnings nuevos.
- Cada sección animada dispara sus entradas al entrar en viewport, una sola vez (no re-dispara al volver a scrollear).
- Con `prefers-reduced-motion: reduce`, ninguna animación se ejecuta; todo el contenido es visible y legible en estado final.
- Magnetic hover sólo se activa en dispositivos con `hover: hover` + `pointer: fine`.
- Sin layout shift causado por animaciones (CLS ≤ 0.01 en todas las páginas).
- Sin errores en consola durante page load ni al navegar entre páginas con ClientRouter.
- `ScrollTrigger.getAll().length` vuelve a 0 tras navegación (cleanup completo).
- La coherencia visual con `/sobre-nosotros` se mantiene (mismas easings, mismas duraciones, misma sensación).

---

## 9. Out of Scope

Pospuesto para passes posteriores sin rearquitectura:
- Footer micro-animaciones (gold rule barrido, hover chips sociales).
- Players detail page (`/jugadores/[slug]`) — transición card → detail, parallax foto.
- Custom route transition (ClientRouter slice/wipe personalizado).
- Plugins GSAP de pago.
- Cursor custom / cursor-follow parallax.
- Horizontal scroll en pillars.
- Scramble scroll-scrubbed.
