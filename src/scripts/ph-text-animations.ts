import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { watchInView } from './ph-motion';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// ── Curvas del lenguaje «Retransmisión» ───────────────────────────────────────
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
// Cada sección pide un refresh al terminar de montar sus animaciones; en la home
// son varias en el mismo lote de navegación, y cada refresh fuerza un reflow
// completo recalculando TODOS los triggers. Esta versión los junta en un único
// refresh por fotograma, sea cual sea el nº de secciones que lo pidan. El flag
// vive a nivel de módulo: Vite instancia este módulo una sola vez y lo comparte
// entre todos los <script> de sección, así que el coalescing es global.
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
// La ventana entre el swap y el refresh son ~60 ms tapados por la cortinilla, así
// que no hay un scroll del usuario que pisar. Se limpia al usarla para no
// reafirmar nada en los refreshes posteriores (los de resize), donde el usuario
// sí manda.
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

// ── Init: durante la cortinilla en navegación, diferido en carga inicial ──────
// El init de animaciones (crear ScrollTriggers + el refresh que fuerza un
// reflow) es el bloque más pesado del hilo principal al montar una página.
//
// NAVEGACIÓN SPA: la cortinilla y el fundido de `page-main` corren en el
// compositor, son inmunes al trabajo del hilo principal y ADEMÁS lo tapan. Por
// eso el init se lanza cuanto antes, durante la cortinilla.
//
// CARGA INICIAL: no hay nada que tape el primer pintado, así que ahí se difiere
// en idle (requestIdleCallback, timeout 200 ms) para no competir con él.
let navInProgress = false;

export function afterTransitionPaint(cb: () => void): void {
  if (navInProgress) {
    // Doble rAF: tras el swap y su pintado, con la geometría asentada para
    // ScrollTrigger.
    requestAnimationFrame(() => requestAnimationFrame(cb));
    return;
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(cb, { timeout: 200 });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(cb));
  }
}

// ── Cintas inferiores ─────────────────────────────────────────────────────────
/**
 * El texto de cada cinta (`Ticker.astro`) se desplaza con el scroll mientras la
 * cinta cruza la pantalla, y solo con él: nada se mueve solo (WCAG 2.2.2). Con
 * movimiento reducido se queda quieta.
 */
export function mountTickers(root: ParentNode): void {
  if (reducedMotion()) return;
  root.querySelectorAll<HTMLElement>('[data-ticker]').forEach((ticker) => {
    const track = ticker.querySelector<HTMLElement>('[data-ticker-track]');
    if (!track || track.dataset.tickerOn) return;
    track.dataset.tickerOn = '1';
    gsap.fromTo(
      track,
      { x: 0 },
      {
        // Recorre algo más de un ancho de pantalla en lo que la cinta tarda en
        // cruzarla: se lee como una cinta que corre, no como un salto.
        x: () => -Math.min(track.scrollWidth * 0.45, window.innerWidth * 1.1),
        ease: 'none',
        scrollTrigger: {
          trigger: ticker,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

/** Cierre del montaje de una sección: vigilar lo que entra en pantalla, montar sus
 *  cintas y pedir el refresh coalescido de ScrollTrigger. */
export function mountSection(root: HTMLElement): void {
  watchInView(root);
  mountTickers(root);
  scheduleScrollTriggerRefresh();
}

// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  // Marca que la próxima carga es una navegación SPA (hay cortinilla que tapa el
  // init) → afterTransitionPaint lo lanzará pronto en vez de diferirlo. Se queda
  // en true para el resto de navegaciones; una recarga completa resetea el módulo.
  navInProgress = true;

  ScrollTrigger.getAll().forEach((t) => t.kill());

  // El `ph-anim` de <html> lo añade un script inline en el head, pero Astro
  // RESETEA los atributos de <html> en cada swap a los del documento entrante
  // (que no la trae, al ser una clase de runtime). Sin esto, `ph-anim` se pierde
  // en cada navegación y el CSS deja de esconder lo que espera a entrar. Se copia
  // al documento entrante ANTES del swap (y del pintado).
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
