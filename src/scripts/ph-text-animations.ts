import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { watchInView, measureStrokes } from './ph-motion';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// ── Curvas de la casa ─────────────────────────────────────────────────────────
// Las mismas que `--ph-ease-*` de global.css, con el mismo nombre, para que lo
// que mueve GSAP y lo que mueve CSS frenen igual. Ver ph-motion.ts.
CustomEase.create('ph-out', '0.16, 1, 0.3, 1');
CustomEase.create('ph-emph', '0.05, 0.7, 0.1, 1');
CustomEase.create('ph-std', '0.2, 0, 0, 1');
CustomEase.create('ph-in', '0.3, 0, 0.8, 0.15');

export const EASE = { out: 'ph-out', emph: 'ph-emph', std: 'ph-std', in: 'ph-in' } as const;

// ── Config global de ScrollTrigger ────────────────────────────────────────────
// ignoreMobileResize: en móvil, mostrar/ocultar la barra de direcciones del
// navegador cambia la altura del viewport y, por defecto, dispara un
// ScrollTrigger.refresh() (reflow completo recalculando todos los triggers) en
// pleno scroll → microcortes. Ese resize es solo chrome del navegador, no un
// cambio real de layout que justifique recalcular, así que lo ignoramos.
ScrollTrigger.config({ ignoreMobileResize: true });

// ── Reduced motion ────────────────────────────────────────────────────────────
export const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Coalesced ScrollTrigger.refresh ───────────────────────────────────────────
// Cada sección llamaba a su propio `requestAnimationFrame(() => ScrollTrigger.refresh())`
// al terminar de montar sus animaciones. En home eso eran 5 refreshes (uno por
// sección) en el mismo batch de navegación, y cada refresh fuerza un reflow
// completo recalculando TODOS los triggers. Esta versión los coalesce en un único
// refresh por frame, sea cual sea el nº de secciones que lo pidan.
// El flag vive a nivel de módulo: como Vite instancia este módulo una sola vez y
// lo comparte entre todos los <script> de sección, el coalescing es global.
let refreshScheduled = false;
export function scheduleScrollTriggerRefresh(): void {
  if (refreshScheduled) return;
  refreshScheduled = true;
  requestAnimationFrame(() => {
    refreshScheduled = false;
    ScrollTrigger.refresh();
    reafirmarScrollDeLlegada();
    // El refresh es el último que toca el scroll en el montaje de una página, así
    // que aquí se acaba la ventana en la que el scroll suave estorba (ver el hook
    // de `astro:before-swap`).
    permitirScrollSuave();
  });
}

// ── La posición de llegada manda sobre el refresh ─────────────────────────────
// `ScrollTrigger.refresh()` guarda la posición de scroll, se va a 0 para medir y
// restaura lo guardado. Ese "lo guardado" no siempre es lo que hay: entrar en
// /talentos desde media página aterrizaba a la misma altura de la que se venía en
// vez de arriba (4 de 4 en producción, 2026-09-03), porque restauraba una posición
// heredada de la página anterior.
//
// En vez de pelearse con la caché interna de GSAP —se probó `clearScrollMemory()`
// y NO lo arregla— se fija la posición buena y se reafirma después del refresh.
// La buena es la que deja el ClientRouter, que ya ha corrido cuando salta
// `astro:after-swap`: 0 en una navegación normal, la guardada al volver atrás.
//
// La ventana entre el swap y el refresh son ~60 ms tapados por el telón, así que
// no hay un scroll del usuario que pisar. Se limpia al usarla para no reafirmar
// nada en los refreshes posteriores (los de resize), donde el usuario sí manda.
let scrollDeLlegada: number | null = null;

document.addEventListener('astro:after-swap', () => {
  scrollDeLlegada = window.scrollY;
});

function reafirmarScrollDeLlegada(): void {
  if (scrollDeLlegada === null) return;
  const objetivo = scrollDeLlegada;
  scrollDeLlegada = null;
  if (Math.abs(window.scrollY - objetivo) > 1) {
    window.scrollTo({ top: objetivo, left: 0, behavior: 'instant' });
  }
}

// ── Scroll suave: apagado durante la navegación ───────────────────────────────
// El motivo largo está en el hook de `astro:before-swap`, abajo. Aquí solo queda
// el interruptor y su red de seguridad: las páginas sin animaciones (aviso legal,
// privacidad) no piden ningún refresh, así que nadie volvería a encenderlo.
function permitirScrollSuave(): void {
  document.documentElement.style.removeProperty('scroll-behavior');
}

document.addEventListener('astro:page-load', () => {
  window.setTimeout(permitirScrollSuave, 1000);
});

// ── Init: durante el telón en navegación, diferido en carga inicial ───────────
// El init de animaciones (medir, crear ScrollTriggers y el refresh que fuerza un
// reflow) es el bloque más pesado del hilo principal al montar una página.
//
// NAVEGACIÓN SPA: el escaneo entre páginas corre en el compositor → es inmune al
// trabajo del hilo principal y ADEMÁS lo enmascara. Por eso el init se lanza
// cuanto antes, DURANTE el escaneo, para que las entradas ya estén en marcha
// cuando la página aparece.
//
// CARGA INICIAL: no hay escaneo que enmascare el primer paint, así que ahí sí
// diferimos en idle (requestIdleCallback, timeout 200 ms) para no competir con
// el render inicial.
let navInProgress = false;

export function afterTransitionPaint(cb: () => void): void {
  if (navInProgress) {
    // Doble rAF: tras el swap y su paint, con la geometría asentada para ScrollTrigger.
    requestAnimationFrame(() => requestAnimationFrame(cb));
    return;
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(cb, { timeout: 200 });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(cb));
  }
}

// ── Magnetic hover disposers ──────────────────────────────────────────────────
const magneticDisposers: Array<() => void> = [];

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

// ── Clip-path reveal ──────────────────────────────────────────────────────────
/**
 * Animates `clipPath: inset(…)` from fully clipped (from a side) to fully open.
 * Caller is responsible for gating on `reducedMotion()`.
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

// ── Montaje de una sección ────────────────────────────────────────────────────
/** Cierre del montaje de una sección: medir sus trazos, vigilar lo que entra en
 *  pantalla y pedir el refresh coalescido de ScrollTrigger. */
export function mountSection(root: HTMLElement): void {
  measureStrokes(root);
  watchInView(root);
  scheduleScrollTriggerRefresh();
}

// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  // Marca que la próxima carga es una navegación SPA (hay escaneo que enmascara
  // el init) → afterTransitionPaint lo lanzará pronto en vez de diferirlo. Se
  // queda en true para el resto de navegaciones; una recarga completa resetea el
  // módulo.
  navInProgress = true;

  magneticDisposers.forEach((d) => d());
  magneticDisposers.length = 0;
  ScrollTrigger.getAll().forEach((t) => t.kill());

  // `.ph-anim` en <html> lo añade un script inline en el head, pero Astro
  // RESETEA los atributos de <html> en cada swap a los del documento entrante
  // (que no la trae, al ser una clase de runtime). Sin esto, `.ph-anim` se
  // pierde en cada navegación SPA y las entradas dejan de esperar a entrar en
  // pantalla. La copiamos al documento entrante ANTES del swap (y del paint).
  const newDoc = (e as { newDocument?: Document }).newDocument;
  if (newDoc) {
    // Y por la misma vía, el scroll suave se apaga mientras dura la navegación.
    // Al volver atrás, el ClientRouter restaura la posición con `scrollTo(x, y)`
    // —forma de dos argumentos, que no admite `behavior`—, así que hereda el
    // `scroll-behavior: smooth` de global.css y la restauración se ANIMA. Unos
    // 60 ms después, el refresh de ScrollTrigger hace su ciclo guardar → ir a 0 →
    // restaurar, fotografía esa animación a medio camino y deja la página clavada
    // en y≈2. Medido en producción el 2026-09-03.
    // Va en el documento ENTRANTE, no en el actual, porque el swap resetea los
    // atributos de <html> y el `scrollTo` del router corre DESPUÉS del swap.
    newDoc.documentElement.style.scrollBehavior = 'auto';
    if (document.documentElement.classList.contains('ph-anim')) {
      newDoc.documentElement.classList.add('ph-anim');
    }
  }
});
