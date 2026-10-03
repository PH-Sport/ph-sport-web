/**
 * Trazos que se dibujan con el scroll (sin GSAP).
 *
 * Un trazo (`path`, `line`…) avanza según lo que el usuario ha recorrido de su
 * bloque: la punta va al 62 % de la pantalla, así que el trazo crece al ritmo
 * del dedo y se recoge al subir. Nunca bloquea ni secuestra el scroll. Opcional:
 * puntos de paso (fracciones del recorrido) que reciben `is-reached` cuando la
 * punta los alcanza, para descubrir lo que anotan; eso es de ida, no se deshace.
 *
 * Lo usan la trayectoria del modelo de /servicios y la línea de tiempo de
 * /sobre-nosotros. La línea de pase de la portada tiene su propio módulo
 * (ph-pass.ts) porque sigue la altura, no el avance.
 *
 * Con movimiento reducido, todo dibujado y todos los puntos alcanzados. Lo que se
 * esconde a la espera de la punta debe ir detrás de una clase que ponga este
 * módulo (`is-armed` en el bloque): si el script no llega, se ve todo.
 */
import { prefersReducedMotion } from './ph-motion';

const HEAD = 0.62;

interface Stop {
  /** Fracción del recorrido (0-1), o una función que la calcula con la
   *  maquetación del momento (se llama al medir). */
  at: number | (() => number);
  el: HTMLElement;
}

interface Item {
  host: HTMLElement;
  /** Un trazo SVG (avanza su desfase) o una recta HTML (avanza su escala). */
  path: SVGGeometryElement | HTMLElement;
  axis: 'x' | 'y' | (() => 'x' | 'y');
  stops: Stop[];
  /** Las fracciones de `stops`, resueltas al medir. */
  ats: number[];
  top: number;
  height: number;
  length: number;
}

const isSvg = (el: Element): el is SVGGeometryElement => typeof (el as SVGGeometryElement).getTotalLength === 'function';

let items: Item[] = [];
let ro: ResizeObserver | null = null;
let scheduled = false;

function measure(): void {
  const y = window.scrollY;
  items.forEach((it) => {
    const r = it.host.getBoundingClientRect();
    it.top = r.top + y;
    it.height = Math.max(1, r.height);
    it.ats = it.stops.map((s) => (typeof s.at === 'function' ? s.at() : s.at));
    if (!isSvg(it.path)) return;
    try {
      it.length = it.path.getTotalLength();
    } catch {
      it.length = 0;
    }
    const L = Math.ceil(it.length) + 1;
    it.path.style.strokeDasharray = `${L} ${L}`;
  });
  update();
}

function update(): void {
  scheduled = false;
  const reduced = prefersReducedMotion();
  const head = window.scrollY + window.innerHeight * HEAD;
  items.forEach((it) => {
    const p = reduced ? 1 : Math.min(1, Math.max(0, (head - it.top) / it.height));
    if (isSvg(it.path)) it.path.style.strokeDashoffset = String((1 - p) * (Math.ceil(it.length) + 1));
    else {
      const axis = typeof it.axis === 'function' ? it.axis() : it.axis;
      it.path.style.transform = axis === 'x' ? `scaleX(${p.toFixed(4)})` : `scaleY(${p.toFixed(4)})`;
    }
    // De ida: lo que la punta ya ha descubierto no se vuelve a esconder al subir
    // (el texto tiene que poder releerse); el trazo sí sigue al dedo.
    it.stops.forEach((s, i) => {
      if (p >= (it.ats[i] ?? 1)) s.el.classList.add('is-reached');
    });
  });
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(update);
}

/**
 * Dibuja `path` con el avance por `host`. `stops`: elementos que se marcan
 * `is-reached` al pasar la punta por su fracción del recorrido (0-1). Una recta
 * HTML crece con `scaleX`/`scaleY` (`axis`, que puede depender del ancho)
 * desde su `transform-origin`.
 */
export function scrollDraw(
  host: HTMLElement,
  path: SVGGeometryElement | HTMLElement,
  stops: Stop[] = [],
  axis: 'x' | 'y' | (() => 'x' | 'y') = 'y',
): void {
  items.push({ host, path, axis, stops, ats: stops.map(() => 1), top: 0, height: 1, length: 0 });
  host.classList.add('is-armed');
  ro ??= new ResizeObserver(() => requestAnimationFrame(measure));
  ro.observe(host);
  requestAnimationFrame(measure);
}

/** Vuelve a medir (cuando cambia algo por encima del bloque, p. ej. un acordeón). */
export function remeasureScrollDraws(): void {
  requestAnimationFrame(measure);
}

document.addEventListener('scroll', () => {
  if (items.length) schedule();
}, { passive: true });

window.addEventListener('resize', () => {
  if (items.length) requestAnimationFrame(measure);
}, { passive: true });

document.addEventListener('astro:before-swap', () => {
  ro?.disconnect();
  ro = null;
  items = [];
});
