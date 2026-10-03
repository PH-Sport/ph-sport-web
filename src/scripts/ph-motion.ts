/**
 * Lenguaje de movimiento «Análisis» — el núcleo ligero, sin GSAP.
 *
 * La web es la sala de análisis de PHSPORT: cada bloque es una capa de tracking.
 * Las líneas guía se dibujan hasta lo que anotan, los visores fijan lo que se
 * enfoca, los nodos marcan los puntos de interés y una línea dorada barre la
 * pantalla al cambiar de página. Por qué así y qué se descartó: DECISIONS.md
 * (2026-10-03, variante C). Cómo encaja con el resto: ARCHITECTURE.md, «Sistema
 * de animaciones».
 *
 * Este módulo no importa GSAP a propósito: lo cargan también la cabecera y el
 * pie, que están en todas las páginas, incluidas las legales, que no cargan
 * GSAP. Casi todo el movimiento es CSS que arranca con una clase (`is-inview`):
 * aquí solo se decide cuándo.
 *
 * Reglas:
 * - El estado de reposo es el visible. Lo que espera a entrar en pantalla solo se
 *   esconde con `html.ph-anim`, y `global.css` lo destapa a los 2,5 s si este
 *   módulo no llega a correr (`html.ph-motion`).
 * - Con `prefers-reduced-motion` no se dibuja ni se desplaza nada: todo aparece
 *   en su sitio. Se mantienen los cambios de color y de opacidad que confirman un
 *   gesto.
 * - Solo `transform`, `opacity`, `clip-path` y el desfase de los trazos en lo que
 *   se mueve.
 */

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Arranque: el módulo está vivo ─────────────────────────────────────────────
// Desactiva la red de seguridad de CSS. Astro rehace los atributos de <html> en
// cada navegación, así que se copia al documento entrante (abajo), igual que
// hace `ph-text-animations.ts` con `ph-anim`.
document.documentElement.classList.add('ph-motion');

// ── En pantalla ───────────────────────────────────────────────────────────────
// Un solo IntersectionObserver para toda la página. Lo que entra recibe
// `is-inview` y el CSS hace el resto (trazos, visores, nodos, líneas guía).
let inViewObserver: IntersectionObserver | null = null;
const enterCallbacks = new WeakMap<Element, Array<() => void>>();

function onEnter(el: HTMLElement): void {
  el.classList.add('is-inview');
  const callbacks = enterCallbacks.get(el);
  if (callbacks) {
    enterCallbacks.delete(el);
    callbacks.forEach((cb) => cb());
  }
}

/**
 * Vigila lo que espera a entrar en pantalla dentro de `root`: todo
 * `[data-inview]` que aún no lo haya hecho. Idempotente: se puede llamar en cada
 * `astro:page-load` y desde varias secciones.
 */
export function watchInView(root: ParentNode = document): void {
  const targets = root.querySelectorAll<HTMLElement>('[data-inview]:not(.is-inview)');
  if (prefersReducedMotion()) {
    targets.forEach((el) => onEnter(el));
    return;
  }
  inViewObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        inViewObserver?.unobserve(entry.target);
        onEnter(entry.target as HTMLElement);
      }
    },
    // Un poco antes del borde de abajo: la pieza ya se está leyendo cuando arranca.
    { rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => inViewObserver!.observe(el));
}

/**
 * Ejecuta `cb` una vez, cuando `el` (que debe llevar `data-inview`) entra en
 * pantalla. Si ya está dentro, en el siguiente fotograma.
 */
export function whenInView(el: HTMLElement, cb: () => void): void {
  if (el.classList.contains('is-inview')) {
    requestAnimationFrame(cb);
    return;
  }
  const list = enterCallbacks.get(el) ?? [];
  list.push(cb);
  enterCallbacks.set(el, list);
}

// ── Trazos medidos ────────────────────────────────────────────────────────────
/**
 * Deja en `--len` la longitud de cada trazo `.ph-draw` dentro de `root`, para
 * que el CSS lo dibuje de principio a fin (global.css, «Trazos medidos»).
 * Redondea hacia arriba: por debajo asomaría una esquirla al final.
 */
export function measureStrokes(root: ParentNode = document): void {
  root.querySelectorAll<SVGGeometryElement>('.ph-draw').forEach((el) => {
    if (typeof el.getTotalLength !== 'function') return;
    try {
      const len = Math.ceil(el.getTotalLength()) + 1;
      if (len > 1) el.style.setProperty('--len', String(len));
    } catch {
      /* sin geometría todavía (display: none): se queda entero */
    }
  });
}

// ── Trazos finos en dibujos que escalan ───────────────────────────────────────
// Un SVG con `viewBox` escala sus trazos con él: el diagrama de 360°, el campo
// del menú, el mapa de sedes. Los que llevan `data-hairline` reciben `--k`
// (unidades del dibujo por px de pantalla) y su CSS mantiene el trazo fino
// (`stroke-width: calc(1.5 * var(--k, 1))`). Sin JS, `--k` vale 1 y el trazo
// escala con el dibujo: más grueso o más fino, pero se ve.
let hairlineObserver: ResizeObserver | null = null;

function setHairline(svg: SVGSVGElement): void {
  const vb = svg.viewBox?.baseVal;
  const rect = svg.getBoundingClientRect();
  if (!vb || !vb.width || !rect.width || !rect.height) return;
  const k = Math.max(vb.width / rect.width, vb.height / rect.height);
  svg.style.setProperty('--k', k.toFixed(4));
}

export function hairlines(root: ParentNode = document): void {
  hairlineObserver ??= new ResizeObserver((entries) => {
    for (const entry of entries) setHairline(entry.target as SVGSVGElement);
  });
  root.querySelectorAll<SVGSVGElement>('svg[data-hairline]').forEach((svg) => {
    setHairline(svg);
    hairlineObserver!.observe(svg);
  });
}

// ── Nodos ─────────────────────────────────────────────────────────────────────
/** El anillo de activación de un nodo: se expande una vez y se apaga. */
export function ping(node: Element | null): void {
  if (!node || prefersReducedMotion()) return;
  node.classList.remove('is-pinged');
  void (node as HTMLElement).offsetWidth;
  node.classList.add('is-pinged');
  const done = (e: Event): void => {
    // `animationend` burbujea: solo cuenta el del propio nodo.
    if (e.target !== node) return;
    node.classList.remove('is-pinged');
    node.removeEventListener('animationend', done);
  };
  node.addEventListener('animationend', done);
}

// ── Navegación ────────────────────────────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  inViewObserver?.disconnect();
  inViewObserver = null;
  hairlineObserver?.disconnect();
  const newDoc = (e as { newDocument?: Document }).newDocument;
  if (!newDoc) return;
  newDoc.documentElement.classList.add('ph-motion');
  // El escaneo entre páginas (`.ph-stinger` en global.css). Se arranca en el
  // documento entrante para que ya esté corriendo cuando la View Transition lo
  // fotografía en vivo.
  if (!prefersReducedMotion()) {
    const back = document.documentElement.getAttribute('data-astro-transition') === 'back';
    const stinger = newDoc.querySelector<HTMLElement>('[data-stinger]');
    stinger?.classList.add('is-running');
    stinger?.classList.toggle('is-back', back);
  }
});

document.addEventListener('astro:page-load', () => {
  const stinger = document.querySelector<HTMLElement>('[data-stinger]');
  if (stinger?.classList.contains('is-running')) {
    const done = (e: AnimationEvent) => {
      if (e.target !== stinger) return;
      stinger.classList.remove('is-running', 'is-back');
      stinger.removeEventListener('animationend', done);
    };
    stinger.addEventListener('animationend', done);
    // Por si la animación ya terminó (pestaña en segundo plano): que no se quede
    // la clase puesta para la siguiente navegación.
    window.setTimeout(() => stinger.classList.remove('is-running', 'is-back'), 900);
  }
  // Cabecera, pie y todo lo que espera a entrar en pantalla en la página.
  hairlines(document);
  measureStrokes(document);
  watchInView(document);
});
