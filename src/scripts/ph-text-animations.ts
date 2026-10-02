import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { watchInView, glint } from './ph-motion';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// ── Curvas del lenguaje «Marcador» ────────────────────────────────────────────
// Las mismas que `--ph-ease-*` de global.css, con el mismo nombre, para que lo
// que mueve GSAP y lo que mueve CSS frenen igual. Ver ph-motion.ts.
CustomEase.create('ph-out', '0.16, 1, 0.3, 1');
CustomEase.create('ph-emph', '0.05, 0.7, 0.1, 1');
CustomEase.create('ph-std', '0.2, 0, 0, 1');
CustomEase.create('ph-in', '0.3, 0, 0.8, 0.15');

export const EASE = { out: 'ph-out', emph: 'ph-emph', std: 'ph-std', in: 'ph-in' } as const;
/** Segundos (los mismos que `--ph-dur-*`). */
export const DUR = { tap: 0.12, state: 0.2, move: 0.32, draw: 0.64, roll: 0.76 } as const;

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
// El init de animaciones (crear ScrollTriggers, wrapWords, gsap.set + el
// ScrollTrigger.refresh que fuerza un reflow) es el bloque más pesado del hilo
// principal al montar una página.
//
// NAVEGACIÓN SPA: el telón (fundido a oscuro sobre page-main) corre en el
// compositor → es inmune al trabajo del hilo principal y ADEMÁS lo enmascara.
// Por eso lanzamos el init cuanto antes, DURANTE el telón, para que los reveals
// de GSAP ya estén animando cuando el contenido aparece. Si se difiere hasta
// después de la transición, el contenido llega (fundido del telón) y solo
// DESPUÉS animan los títulos → entrance en dos fases percibido como "el texto se
// muestra sin animar y luego empieza la animación". Correrlo pronto une ambas
// cosas en un único movimiento; el telón oculta cualquier trompicón del init.
//
// CARGA INICIAL: no hay telón que enmascare el primer paint, así que ahí sí
// diferimos en idle (requestIdleCallback, timeout 200 ms) para no competir con
// el render inicial.
//
// Failsafe (revealFailsafe, 2 s) revela el contenido pase lo que pase; lo que
// tiene reveal arranca en visibility:hidden (guard) hasta que GSAP toma control.
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

// ── FOUC guard (reveal) ───────────────────────────────────────────────────────
// El contenido con animación de entrada arranca oculto vía CSS
// (`html.ph-anim [data-reveal] { visibility: hidden }`, fijado antes del primer
// paint por un script inline en BaseLayout). Sin esto, GSAP aplica el estado
// "from" DESPUÉS del paint y se ve el contenido en su estado final un instante
// antes de que arranque la animación (el parpadeo). Cada init llama a
// `revealReveals(section)` al terminar de montar sus tweens: para entonces los
// from-states ya están aplicados de forma síncrona, así que quitar el atributo
// revela los elementos sin parpadeo (siguen ocultos por opacity/transform de GSAP
// hasta que animan).
export function revealReveals(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.removeAttribute('data-reveal'));
}

// Failsafe (defensa en profundidad): pase lo que pase con las animaciones de
// entrada —un ScrollTrigger que no dispara, el script de sección que carga tarde,
// el ticker de GSAP pausado en una pestaña throttled— garantizamos que el
// contenido above-the-fold acaba en su estado final visible. El margen es mayor
// que la animación más larga (~1.5 s), así que solo actúa sobre lo que se quedó
// realmente atascado, nunca corta una animación legítima.
function revealFailsafe(): void {
  revealReveals(document);
  // Títulos: si las palabras del clip siguen desplazadas (yPercent:115) y están en
  // viewport, deberían haber animado ya → forzamos su estado final. Los que están
  // fuera de pantalla se dejan: siguen esperando su animación de scroll.
  document.querySelectorAll<HTMLElement>('.ph-clip-inner').forEach((el) => {
    const r = el.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom > 0;
    if (inView) gsap.set(el, { clearProps: 'transform,opacity' });
  });
}
document.addEventListener('astro:page-load', () => {
  window.setTimeout(revealFailsafe, 2000);
});

// ── DOM helpers ───────────────────────────────────────────────────────────────

/**
 * Wraps each word in an overflow:hidden clip container (.ph-clip / .ph-clip-inner)
 * so GSAP can slide each word up independently (curtain-reveal effect). Walks
 * child nodes so existing inline elements (e.g. `<span class="abt-gold">`) are
 * preserved: their inner words get wrapped, but the wrapper element survives.
 */
export function wrapWords(el: HTMLElement): HTMLElement[] {
  const makeClip = (word: string): HTMLSpanElement => {
    const clip = document.createElement('span');
    clip.className = 'ph-clip';
    const inner = document.createElement('span');
    inner.className = 'ph-clip-inner';
    inner.textContent = word;
    clip.appendChild(inner);
    return clip;
  };

  const transformTextNode = (node: Text): Node[] =>
    (node.textContent ?? '')
      .split(/(\s+)/)
      .filter((p) => p.length > 0)
      .map((p) => (/^\s+$/.test(p) ? document.createTextNode(p) : makeClip(p)));

  const transform = (parent: Element) => {
    Array.from(parent.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const replacements = transformTextNode(child as Text);
        replacements.forEach((r) => parent.insertBefore(r, child));
        parent.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        transform(child as Element);
      }
    });
  };

  transform(el);
  return Array.from(el.querySelectorAll<HTMLElement>('.ph-clip-inner'));
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
 * Caller is responsible for gating on `reducedMotion()` — follows the same
 * pattern as `trackingReveal` and `counterReveal` in this module.
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

// ── «Marcador»: titulares que ruedan y cabeceras de bloque ───────────────────
// El vocabulario sin GSAP (paletas, líneas, destello, la luz entre páginas) vive
// en ph-motion.ts; aquí, lo que necesita GSAP.

/** ¿Está ya en pantalla (o casi)? Lo que lo está anima ya; lo demás, al llegar. */
function nearView(el: Element): boolean {
  return el.getBoundingClientRect().top < window.innerHeight * 0.92;
}

/**
 * Titular que entra rodando: cada palabra sube por su ranura y frena. Si ya está
 * en pantalla, arranca ya (un ScrollTrigger `once` cuyo inicio no se alcanza lo
 * dejaría invisible); si no, al llegar al 85 % de la pantalla.
 */
export function rollIn(
  el: HTMLElement,
  opts: { delay?: number; stagger?: number; duration?: number; trigger?: Element } = {},
): gsap.core.Tween {
  const { delay = 0, stagger = 0.055, duration = DUR.roll } = opts;
  const words = wrapWords(el);
  el.style.visibility = 'visible';
  const trigger = opts.trigger ?? el;
  const now = nearView(trigger);
  return gsap.from(words, {
    yPercent: 112,
    duration,
    ease: EASE.out,
    stagger,
    delay: now ? delay : 0,
    scrollTrigger: now ? undefined : { trigger, start: 'top 85%', once: true },
  });
}

/** Sube y aparece (texto corrido, piezas sueltas), con el mismo disparo. */
export function riseIn(
  els: HTMLElement | ArrayLike<HTMLElement>,
  opts: { delay?: number; stagger?: number; y?: number; trigger?: Element } = {},
): gsap.core.Tween | null {
  const list = els instanceof HTMLElement ? [els] : Array.from(els);
  if (!list.length) return null;
  const { delay = 0, stagger = 0.07, y = 14 } = opts;
  const trigger = opts.trigger ?? list[0];
  const now = nearView(trigger);
  return gsap.from(list, {
    opacity: 0,
    y,
    duration: 0.7,
    ease: EASE.out,
    stagger,
    delay: now ? delay : 0,
    scrollTrigger: now ? undefined : { trigger, start: 'top 85%', once: true },
  });
}

/**
 * La coreografía común de una cabecera de bloque, marcada en el HTML con
 * `data-m`: `title` rueda, `lead` sube después y `item` cierra la cascada. La
 * pizarra (`Slate.astro`) se dibuja sola al entrar en pantalla. Escalonado a
 * propósito: la jerarquía se lee en el orden en que llega. Con `glint`, la
 * palabra dorada del titular (`em` o `[data-glint]`) recibe la luz al terminar.
 */
export function stage(block: HTMLElement, opts: { delay?: number; glint?: boolean } = {}): void {
  const title = block.querySelector<HTMLElement>('[data-m="title"]');
  const leads = block.querySelectorAll<HTMLElement>('[data-m="lead"]');
  const items = block.querySelectorAll<HTMLElement>('[data-m="item"]');
  const delay = opts.delay ?? 0;
  if (title) {
    const tween = rollIn(title, { delay: delay + 0.08 });
    if (opts.glint) {
      const accent = title.querySelector<HTMLElement>('[data-glint], em');
      if (accent) tween.eventCallback('onComplete', () => glint(accent));
    }
  }
  riseIn(leads, { delay: delay + 0.24, trigger: title ?? undefined });
  riseIn(items, { delay: delay + 0.36, stagger: 0.06, y: 10, trigger: title ?? undefined });
}

/** Cierre del montaje de una sección: vigilar lo que entra en pantalla, destapar
 *  `data-reveal` (los estados iniciales de GSAP ya están puestos) y pedir el
 *  refresh coalescido de ScrollTrigger. */
export function mountSection(root: HTMLElement): void {
  watchInView(root);
  revealReveals(root);
  scheduleScrollTriggerRefresh();
}

// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  // Marca que la próxima carga es una navegación SPA (hay telón que enmascara el
  // init) → afterTransitionPaint lo lanzará pronto en vez de diferirlo. Se queda
  // en true para el resto de navegaciones; una recarga completa resetea el módulo.
  navInProgress = true;

  magneticDisposers.forEach((d) => d());
  magneticDisposers.length = 0;
  ScrollTrigger.getAll().forEach((t) => t.kill());

  // El FOUC guard (.ph-anim en <html>) lo añade un script inline en el head, pero
  // Astro RESETEA los atributos de <html> en cada swap a los del documento
  // entrante (que no la trae, al ser una clase de runtime). Sin esto, .ph-anim se
  // pierde en cada navegación SPA y el CSS deja de ocultar [data-reveal] → vuelve
  // el parpadeo. La copiamos al documento entrante ANTES del swap (y del paint).
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
