import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

/**
 * Wraps each word in a plain inline-block span for blur/opacity reveal.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent?.trim() ?? '';
  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span style="display:inline-block">${w}</span>`)
    .join(' ');
  return Array.from(el.querySelectorAll<HTMLElement>('span'));
}

// ── Character scramble ────────────────────────────────────────────────────────
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const activeScrambles: Array<(time: number, deltaTime: number) => void> = [];

// ── Magnetic hover disposers ──────────────────────────────────────────────────
const magneticDisposers: Array<() => void> = [];

/**
 * Animates el.textContent through random chars before resolving to the real text.
 * Uses GSAP ticker for reliable frame-rate synchronization.
 */
export function scrambleReveal(el: HTMLElement, delay = 0): void {
  const finalText = el.textContent ?? '';
  const len = finalText.length;
  const DURATION = 1.3;
  let elapsed = -delay;
  let visible = false;

  gsap.set(el, { opacity: 0 });

  const tick = (_time: number, deltaTime: number) => {
    elapsed += deltaTime / 1000;
    if (elapsed < 0) return;
    if (!visible) {
      gsap.set(el, { opacity: 1 });
      visible = true;
    }

    const progress = Math.min(elapsed / DURATION, 1);
    const settled = Math.floor(progress * len * 1.1);

    let result = '';
    for (let i = 0; i < len; i++) {
      if (finalText[i] === ' ' || finalText[i] === '.') {
        result += finalText[i];
      } else if (i < settled) {
        result += finalText[i];
      } else {
        result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = result;

    if (progress >= 1 || !document.contains(el)) {
      el.textContent = finalText;
      gsap.ticker.remove(tick);
      const idx = activeScrambles.indexOf(tick);
      if (idx > -1) activeScrambles.splice(idx, 1);
    }
  };

  activeScrambles.push(tick);
  gsap.ticker.add(tick);
}

// ── Tracking (letter-spacing) compression ────────────────────────────────────
export function trackingReveal(
  el: HTMLElement,
  scrollTrigger?: ScrollTrigger.Vars,
): gsap.core.Tween {
  return gsap.from(el, {
    letterSpacing: '0.3em',
    opacity: 0,
    duration: 0.9,
    ease: 'expo.out',
    scrollTrigger,
  });
}

// ── Number counter ────────────────────────────────────────────────────────────
export function counterReveal(
  el: HTMLElement,
  target: number,
  scrollTrigger?: ScrollTrigger.Vars,
): gsap.core.Tween {
  const obj = { val: 0 };
  el.textContent = '00';
  return gsap.to(obj, {
    val: target,
    duration: 0.8,
    ease: 'power3.out',
    onUpdate() {
      el.textContent = String(Math.round(obj.val)).padStart(2, '0');
    },
    scrollTrigger,
  });
}

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

// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  // Marca que la próxima carga es una navegación SPA (hay telón que enmascara el
  // init) → afterTransitionPaint lo lanzará pronto en vez de diferirlo. Se queda
  // en true para el resto de navegaciones; una recarga completa resetea el módulo.
  navInProgress = true;

  activeScrambles.forEach((t) => gsap.ticker.remove(t));
  activeScrambles.length = 0;
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
