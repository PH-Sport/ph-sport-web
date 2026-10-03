import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { watchInView } from './ph-motion';

gsap.registerPlugin(ScrollTrigger, CustomEase);

/**
 * Infraestructura GSAP de la web y el vocabulario de «Títulos» que necesita GSAP:
 * titulares que suben de su línea base, lectura cinética, tipografía que viaja,
 * enfoque y el reflujo sin saltos de los acordeones. Lo que no necesita GSAP
 * (entrar en pantalla, el cartón entre páginas) vive en `ph-motion.ts`. Por qué
 * así: DECISIONS.md (2026-10-03); cómo encaja: ARCHITECTURE.md, «Sistema de
 * animaciones».
 */

// ── Curvas de la casa ─────────────────────────────────────────────────────────
// Las mismas que `--ph-ease-*` de global.css, con el mismo nombre, para que lo
// que mueve GSAP y lo que mueve CSS frenen igual.
CustomEase.create('ph-out', '0.16, 1, 0.3, 1');
CustomEase.create('ph-emph', '0.05, 0.7, 0.1, 1');
CustomEase.create('ph-std', '0.2, 0, 0, 1');
CustomEase.create('ph-in', '0.3, 0, 0.8, 0.15');

export const EASE = { out: 'ph-out', emph: 'ph-emph', std: 'ph-std', in: 'ph-in' } as const;
/** Segundos (los mismos que `--ph-dur-*`). */
export const DUR = { tap: 0.12, state: 0.2, move: 0.32, draw: 0.6, rise: 0.7 } as const;

// ── Config global de ScrollTrigger ────────────────────────────────────────────
// ignoreMobileResize: en móvil, mostrar/ocultar la barra de direcciones del
// navegador cambia la altura del viewport y, por defecto, dispara un
// ScrollTrigger.refresh() en pleno scroll → microcortes. Ese resize es solo
// chrome del navegador, no un cambio real de layout, así que se ignora.
ScrollTrigger.config({ ignoreMobileResize: true });

// ── Reduced motion ────────────────────────────────────────────────────────────
export const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Coalesced ScrollTrigger.refresh ───────────────────────────────────────────
// Cada sección pide su refresh al terminar de montarse; aquí se juntan en uno
// por fotograma, sea cual sea el nº de secciones que lo pidan (cada refresh
// fuerza un reflow completo). El flag vive a nivel de módulo: Vite instancia este
// módulo una sola vez y lo comparte entre todos los <script> de sección.
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
// La buena es la que pide el ClientRouter: 0 en una navegación normal (o la del
// ancla), y al volver atrás o adelante, la guardada en la entrada del historial.
//
// Esa última se lee de `history.state` y no de `scrollY`: en WebKit, cuando el
// router restaura el scroll (justo después del swap), los CSS de componente de la
// página que vuelve aún no se aplican, la página es más corta y la restauración
// se queda recortada (medido el 2026-10-03: 3.894 en vez de 5.529 en la portada).
// Por eso la posición se reafirma en cuanto la página vuelve a medir lo que tiene
// que medir, también desde el observador del alto, y se olvida a los 2,5 s.
let scrollDeLlegada: number | null = null;
let llegadaCaduca = 0;
let tipoDeNavegacion: string | null = null;

document.addEventListener('astro:after-swap', () => {
  const guardada = (history.state as { scrollY?: unknown } | null)?.scrollY;
  scrollDeLlegada = tipoDeNavegacion === 'traverse' && typeof guardada === 'number' ? guardada : window.scrollY;
  llegadaCaduca = performance.now() + 2500;
});

function reafirmarScrollDeLlegada(): void {
  if (scrollDeLlegada === null) return;
  if (performance.now() > llegadaCaduca) {
    scrollDeLlegada = null;
    return;
  }
  const objetivo = scrollDeLlegada;
  // Si la página aún no llega hasta ahí, se espera al siguiente cambio de alto.
  if (objetivo > document.documentElement.scrollHeight - window.innerHeight + 1) return;
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

// ── Reajuste cuando cambia el alto de la página ───────────────────────────────
// Las escenas ligadas al scroll guardan dónde empiezan y acaban. Si algo cambia
// el alto de lo que hay encima (abrir un acordeón, filtrar el grid, que llegue la
// fuente), esas marcas se quedan viejas: se pide un refresh cuando el alto del
// documento se asienta. Espera más que el reflujo de los acordeones (320 ms): el
// refresh mide con `getBoundingClientRect`, que incluye los `transform` a medias.
let layoutTimer = 0;
let lastBodyHeight = 0;
const layoutObserver = new ResizeObserver(() => {
  const h = document.body.offsetHeight;
  if (Math.abs(h - lastBodyHeight) < 2) return;
  lastBodyHeight = h;
  // Una restauración que se quedó recortada (arriba) se completa ya.
  reafirmarScrollDeLlegada();
  window.clearTimeout(layoutTimer);
  layoutTimer = window.setTimeout(() => {
    ScrollTrigger.refresh();
    reafirmarScrollDeLlegada();
  }, 420);
});
layoutObserver.observe(document.body);
document.addEventListener('astro:after-swap', () => {
  layoutObserver.disconnect();
  lastBodyHeight = document.body.offsetHeight;
  layoutObserver.observe(document.body);
});

// ── Init: durante el cartón en navegación, diferido en carga inicial ──────────
// NAVEGACIÓN SPA: el cartón de título tapa la página mientras se monta, así que
// el init (crear ScrollTriggers, partir titulares, el refresh) corre cuanto
// antes, debajo de él.
// CARGA INICIAL: no hay nada que lo tape, así que se difiere en idle
// (requestIdleCallback, 200 ms como mucho) para no competir con el primer pintado.
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
// Lo que entra con GSAP arranca oculto por CSS (`html.ph-anim [data-reveal]`,
// global.css). Cada sección llama a `revealReveals` al terminar de montar sus
// tweens: los estados iniciales ya están puestos, así que quitar el atributo no
// produce parpadeo. Si el módulo no llega, global.css lo destapa a los 2,5 s.
export function revealReveals(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.removeAttribute('data-reveal'));
}

// Red de seguridad en JS (defensa en profundidad): pase lo que pase con las
// entradas —un ScrollTrigger que no dispara, el ticker pausado en una pestaña en
// segundo plano—, lo que ya está en pantalla acaba en su estado final.
function revealFailsafe(): void {
  revealReveals(document);
  document.querySelectorAll<HTMLElement>('.ph-m__in, [data-rise-char]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom > 0;
    if (inView && gsap.getProperty(el, 'yPercent') !== 0) gsap.set(el, { yPercent: 0 });
  });
}
document.addEventListener('astro:page-load', () => {
  window.setTimeout(revealFailsafe, 2400);
});

// ── Partir el texto ───────────────────────────────────────────────────────────
// Recorren los nodos de texto conservando los elementos que haya dentro (la
// palabra dorada de un titular sigue siendo su `<span>`, con sus palabras
// partidas dentro).

function splitTextNodes(el: HTMLElement, make: (word: string) => Node): void {
  const transform = (parent: Element) => {
    Array.from(parent.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? '').split(/(\s+)/).filter((p) => p.length > 0);
        parts.forEach((p) => parent.insertBefore(/^\s+$/.test(p) ? document.createTextNode(p) : make(p), child));
        parent.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        transform(child as Element);
      }
    });
  };
  transform(el);
}

/**
 * Cada palabra en su máscara (`.ph-m` > `.ph-m__in`, global.css): la máscara
 * recorta la línea base y la palabra sube desde debajo. Devuelve los interiores.
 */
function maskWords(el: HTMLElement): HTMLElement[] {
  if (!el.querySelector('.ph-m')) {
    splitTextNodes(el, (word) => {
      const mask = document.createElement('span');
      mask.className = 'ph-m';
      const inner = document.createElement('span');
      inner.className = 'ph-m__in';
      inner.textContent = word;
      mask.append(inner);
      return mask;
    });
  }
  return Array.from(el.querySelectorAll<HTMLElement>('.ph-m__in'));
}

/** Cada palabra en un `<span>` en línea, sin máscara: para la lectura cinética. */
function inlineWords(el: HTMLElement): HTMLElement[] {
  if (!el.querySelector('.ph-kw')) {
    splitTextNodes(el, (word) => {
      const span = document.createElement('span');
      span.className = 'ph-kw';
      span.textContent = word;
      return span;
    });
  }
  return Array.from(el.querySelectorAll<HTMLElement>('.ph-kw'));
}

/** ¿Está ya en pantalla (o casi)? Lo que lo está anima ya; lo demás, al llegar. */
function nearView(el: Element): boolean {
  return el.getBoundingClientRect().top < window.innerHeight * 0.92;
}

// ── Titulares que suben de su línea base ──────────────────────────────────────

/**
 * Las palabras de un titular suben desde su línea base enmascarada (600-800 ms,
 * `ph-emph`, escalón de 40-60 ms). Si ya está en pantalla arranca ya; si no, al
 * llegar al 85 % de la pantalla.
 */
export function riseWords(
  el: HTMLElement,
  opts: { delay?: number; stagger?: number; duration?: number; trigger?: Element } = {},
): gsap.core.Tween {
  const { delay = 0, stagger = 0.05, duration = DUR.rise } = opts;
  const words = maskWords(el);
  el.style.visibility = 'visible';
  const trigger = opts.trigger ?? el;
  const now = nearView(trigger);
  return gsap.from(words, {
    yPercent: 150,
    duration,
    ease: EASE.emph,
    stagger,
    delay: now ? delay : 0,
    scrollTrigger: now ? undefined : { trigger, start: 'top 85%', once: true },
  });
}

/**
 * Entrada por letras: cada letra sube desde la línea base de su palabra. Al
 * terminar se devuelve el HTML original, porque partir en letras pierde el
 * interletraje de la fuente (los pares «Ta», «ro»…).
 */
export function riseLetters(el: HTMLElement, opts: { delay?: number; stagger?: number } = {}): void {
  const { delay = 0, stagger = 0.032 } = opts;
  const original = el.innerHTML;
  const words = maskWords(el);
  const letters: HTMLElement[] = [];
  words.forEach((word) => {
    const chars = [...(word.textContent ?? '')];
    word.replaceChildren(
      ...chars.map((ch) => {
        const span = document.createElement('span');
        span.dataset.riseChar = '';
        span.style.display = 'inline-block';
        span.textContent = ch;
        letters.push(span);
        return span;
      }),
    );
  });
  el.style.visibility = 'visible';
  gsap.from(letters, {
    yPercent: 150,
    duration: DUR.rise,
    ease: EASE.emph,
    stagger,
    delay,
    onComplete: () => {
      el.innerHTML = original;
    },
  });
}

/** Un bloque de texto sube y aparece (entradillas, párrafos, piezas sueltas). */
export function fadeUp(
  els: HTMLElement | ArrayLike<HTMLElement>,
  opts: { delay?: number; stagger?: number; y?: number; trigger?: Element } = {},
): gsap.core.Tween | null {
  const list = els instanceof HTMLElement ? [els] : Array.from(els);
  if (!list.length) return null;
  const { delay = 0, stagger = 0.06, y = 16 } = opts;
  const trigger = opts.trigger ?? list[0];
  const now = nearView(trigger);
  list.forEach((el) => { el.style.visibility = 'visible'; });
  return gsap.from(list, {
    opacity: 0,
    y,
    duration: 0.6,
    ease: EASE.out,
    stagger,
    delay: now ? delay : 0,
    scrollTrigger: now ? undefined : { trigger, start: 'top 88%', once: true },
  });
}

// ── Lectura cinética ──────────────────────────────────────────────────────────
/**
 * Cada palabra de la frase pasa de 0,16 a 1 de opacidad según avanza el scroll:
 * quien lee marca el ritmo. Ligado al scroll sin retardo (`scrub: true`). Con
 * movimiento reducido no se llama: la frase se queda entera a 1.
 */
export function kinetic(
  el: HTMLElement,
  opts: { start?: string; end?: string; trigger?: Element } = {},
): void {
  const words = inlineWords(el);
  el.style.visibility = 'visible';
  gsap.fromTo(
    words,
    { opacity: 0.16 },
    {
      opacity: 1,
      duration: 0.4,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: {
        trigger: opts.trigger ?? el,
        start: opts.start ?? 'top 82%',
        end: opts.end ?? 'bottom 48%',
        scrub: true,
      },
    },
  );
}

// ── Tipografía que viaja ──────────────────────────────────────────────────────
/**
 * Una línea más ancha que la pantalla se desplaza en horizontal con el scroll
 * para leerse entera. El contenedor lleva `overflow-x: clip` (cero scroll
 * horizontal de página). `dir` 1 la lleva hacia la izquierda; -1, al revés.
 */
export function travel(
  line: HTMLElement,
  opts: { container?: HTMLElement; trigger?: Element; start?: string; end?: string; dir?: 1 | -1; lead?: number } = {},
): void {
  const container = opts.container ?? (line.parentElement as HTMLElement);
  const dir = opts.dir ?? 1;
  // Lo que sobra de ancho, más un poco de margen para que la deriva se note
  // aunque la línea quepa casi entera.
  const overflow = () => Math.max(0, line.scrollWidth - container.clientWidth) + window.innerWidth * (opts.lead ?? 0.06);
  gsap.fromTo(
    line,
    { x: () => (dir === 1 ? window.innerWidth * (opts.lead ?? 0.06) * 0.5 : -overflow()) },
    {
      x: () => (dir === 1 ? -overflow() : window.innerWidth * (opts.lead ?? 0.06) * 0.5),
      ease: 'none',
      scrollTrigger: {
        trigger: opts.trigger ?? container,
        start: opts.start ?? 'top bottom',
        end: opts.end ?? 'bottom top',
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    },
  );
}

// ── Enfoque ───────────────────────────────────────────────────────────────────
/**
 * «Rack focus»: la pieza entra de desenfoque (10 px) y escala 1,15 a nítida y a
 * su tamaño, en 700 ms. El desenfoque va acotado a la pieza.
 */
export function rackFocus(
  els: HTMLElement | ArrayLike<HTMLElement>,
  opts: { trigger?: Element; stagger?: number; delay?: number } = {},
): void {
  const list = els instanceof HTMLElement ? [els] : Array.from(els);
  if (!list.length) return;
  const trigger = opts.trigger ?? list[0];
  gsap.fromTo(
    list,
    { opacity: 0, scale: 1.15, filter: 'blur(10px)' },
    {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.7,
      ease: EASE.out,
      stagger: opts.stagger ?? 0.14,
      delay: opts.delay ?? 0,
      clearProps: 'filter',
      scrollTrigger: { trigger, start: 'top 82%', once: true },
    },
  );
}

// ── Reflujo sin saltos ────────────────────────────────────────────────────────
/**
 * Cambia el layout (`mutate`) y desliza a su sitio nuevo lo que tenía debajo, en
 * vez de dejarlo saltar: mide la posición de lo que sigue a `anchor` (sus
 * hermanos y los de sus antepasados), aplica el cambio y anima la diferencia con
 * `transform`. Es la forma de abrir un acordeón sin animar `height`.
 */
export function reflow(anchor: HTMLElement, mutate: () => void, duration: number = DUR.move): void {
  if (reducedMotion()) { mutate(); return; }
  const followers: HTMLElement[] = [];
  let node: HTMLElement | null = anchor;
  while (node && node !== document.body) {
    let sib = node.nextElementSibling;
    while (sib) {
      if (sib instanceof HTMLElement && !(sib instanceof HTMLScriptElement) && getComputedStyle(sib).position !== 'fixed') {
        followers.push(sib);
      }
      sib = sib.nextElementSibling;
    }
    node = node.parentElement;
  }
  const vh = window.innerHeight;
  const before = followers.map((el) => el.getBoundingClientRect().top);
  mutate();
  followers.forEach((el, i) => {
    const after = el.getBoundingClientRect().top;
    const delta = before[i] - after;
    if (Math.abs(delta) < 1) return;
    // Solo lo que se ve, antes o después: lo de fuera de pantalla salta sin coste.
    if (Math.min(before[i], after) > vh) return;
    gsap.fromTo(el, { y: delta }, { y: 0, duration, ease: EASE.out, clearProps: 'transform' });
  });
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
  // Marca que la próxima carga es una navegación SPA (el cartón tapa el init) →
  // afterTransitionPaint lo lanzará pronto en vez de diferirlo. Se queda en true
  // para el resto de navegaciones; una recarga completa resetea el módulo.
  navInProgress = true;
  tipoDeNavegacion = (e as { navigationType?: string }).navigationType ?? null;

  ScrollTrigger.getAll().forEach((t) => t.kill());

  // El FOUC guard (.ph-anim en <html>) lo añade un script inline en el head, pero
  // Astro RESETEA los atributos de <html> en cada swap a los del documento
  // entrante (que no la trae, al ser una clase de runtime). Sin esto, .ph-anim se
  // pierde en cada navegación SPA. Se copia al documento entrante ANTES del swap.
  const newDoc = (e as { newDocument?: Document }).newDocument;
  if (newDoc) {
    // Y por la misma vía, el scroll suave se apaga mientras dura la navegación.
    // Al volver atrás, el ClientRouter restaura la posición con `scrollTo(x, y)`
    // —forma de dos argumentos, que no admite `behavior`—, así que hereda el
    // `scroll-behavior: smooth` de global.css y la restauración se ANIMA. Unos
    // 60 ms después, el refresh de ScrollTrigger hace su ciclo guardar → ir a 0 →
    // restaurar, fotografía esa animación a medio camino y deja la página clavada
    // en y≈2. Medido en producción el 2026-09-03 (docs/trampas-conocidas.md).
    // Va en el documento ENTRANTE, no en el actual, porque el swap resetea los
    // atributos de <html> y el `scrollTo` del router corre DESPUÉS del swap.
    newDoc.documentElement.style.scrollBehavior = 'auto';
    if (document.documentElement.classList.contains('ph-anim')) {
      newDoc.documentElement.classList.add('ph-anim');
    }
  }
});
