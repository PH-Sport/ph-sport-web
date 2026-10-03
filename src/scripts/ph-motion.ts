/**
 * «Títulos» — el núcleo ligero del movimiento, sin GSAP.
 *
 * La web se mueve como la secuencia de títulos de crédito de una película sobre
 * PHSPORT: palabras gigantes que suben de su línea base, frases que se encienden
 * al leerlas, imágenes que se abren desde una rendija y escenas que se suceden por
 * cortes. Por qué así y qué se descartó: DECISIONS.md (2026-10-03). Cómo encaja
 * con el resto: ARCHITECTURE.md, «Sistema de animaciones».
 *
 * Este módulo no importa GSAP a propósito: lo cargan la cabecera y el pie, que
 * están en todas las páginas, incluidas las legales, que no cargan GSAP. Lo que
 * necesita GSAP (titulares, lectura cinética, escenas fijadas) vive en
 * `ph-text-animations.ts` y en el script de cada sección. Aquí queda:
 *
 * - `ph-motion` en <html>: apaga la red de seguridad de CSS (global.css).
 * - El observador de «entra en pantalla»: `data-inview` → `is-inview`.
 * - El cartón de título entre páginas (`.ph-stinger`).
 * - `setLetters`: las letras sueltas de un enlace, para su cascada al señalarlo.
 *
 * Reglas:
 * - El estado de reposo es el visible. Lo que espera a entrar en pantalla solo se
 *   esconde con `html.ph-anim`, y `global.css` lo destapa a los 2,5 s si este
 *   módulo no llega a correr.
 * - Con `prefers-reduced-motion` no se desplaza nada: todo aparece en su sitio y
 *   el cambio de página es un fundido corto sin cartón.
 */

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Arranque: el módulo está vivo ─────────────────────────────────────────────
// Astro rehace los atributos de <html> en cada navegación, así que la clase se
// copia al documento entrante (abajo), igual que `ph-anim`.
document.documentElement.classList.add('ph-motion');

// ── En pantalla ───────────────────────────────────────────────────────────────
// Un solo IntersectionObserver para toda la página: lo que entra recibe
// `is-inview` y el CSS hace el resto (hilos que se dibujan, rótulos que suben,
// fotos que se abren).
let inViewObserver: IntersectionObserver | null = null;

/**
 * Vigila todo `[data-inview]` de `root` que no haya entrado aún. Idempotente: se
 * puede llamar en cada `astro:page-load` y desde varias secciones.
 */
export function watchInView(root: ParentNode = document): void {
  const targets = root.querySelectorAll<HTMLElement>('[data-inview]:not(.is-inview)');
  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-inview'));
    return;
  }
  inViewObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        inViewObserver?.unobserve(entry.target);
        entry.target.classList.add('is-inview');
      }
    },
    // Un poco antes del borde de abajo: la pieza ya se está leyendo cuando arranca.
    { rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => inViewObserver!.observe(el));
}

/**
 * Escalona una lista para las cascadas de CSS: `--i` (posición) y `--d`
 * (retardo en ms). La regla de CSS decide qué hace con ellos.
 */
export function cascade(items: Iterable<HTMLElement>, stepMs = 60, startMs = 0): void {
  let i = 0;
  for (const el of items) {
    el.style.setProperty('--i', String(i));
    el.style.setProperty('--d', `${startMs + i * stepMs}ms`);
    i++;
  }
}

/**
 * Escribe `text` en `el` letra a letra (`.ph-ltr`, con su `--i`), para la cascada
 * de 10 ms de los enlaces al señalarlos. El nombre accesible va aparte, en el
 * `aria-label` del enlace.
 */
export function setLetters(el: HTMLElement, text: string): void {
  el.replaceChildren(
    ...[...text].map((ch, i) => {
      const span = document.createElement('span');
      span.className = 'ph-ltr';
      span.style.setProperty('--i', String(i));
      span.textContent = ch === ' ' ? ' ' : ch;
      return span;
    }),
  );
}

// ── Cartón de título entre páginas ────────────────────────────────────────────
// Al navegar, el cartón (`.ph-stinger`, en BaseLayout) sube con el nombre de la
// página de destino y tapa la pantalla. El ClientRouter no cambia de página
// hasta que ha tapado: se envuelve el `loader` de `astro:before-preparation`
// (Astro lo deja reescribir) para que espere también a la subida. En la página
// nueva, el mismo cartón ya está puesto y sale por arriba (`is-out`).
//
// El nombre sale de un mapa ruta → etiqueta que pinta BaseLayout en
// `data-titles`: las etiquetas del menú (y las del pie para los textos legales)
// en el idioma de cada ruta. Ningún texto nuevo, y sin cargar los diccionarios.

/** Lo que tarda en tapar (el `ph-card-in` de global.css). */
const CARD_IN_MS = 100;

function normPath(path: string): string {
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

function cardTitle(stinger: HTMLElement, to: URL): string {
  try {
    const titles = JSON.parse(stinger.dataset.titles ?? '{}') as Record<string, string>;
    return titles[normPath(to.pathname)] ?? '';
  } catch {
    return '';
  }
}

type PreparationEvent = Event & { to: URL; loader: () => Promise<void> };

document.addEventListener('astro:before-preparation', (e) => {
  if (prefersReducedMotion()) return;
  const ev = e as PreparationEvent;
  const stinger = document.querySelector<HTMLElement>('[data-stinger]');
  const label = stinger?.querySelector<HTMLElement>('[data-stinger-label]');
  if (!stinger || !label) return;
  label.textContent = cardTitle(stinger, ev.to);
  const alreadyCovering = stinger.classList.contains('is-in');
  stinger.classList.remove('is-out');
  stinger.classList.add('is-in');
  const covered = alreadyCovering
    ? Promise.resolve()
    : new Promise<void>((resolve) => window.setTimeout(resolve, CARD_IN_MS));
  const load = ev.loader;
  ev.loader = async () => {
    await Promise.all([load(), covered]);
  };
});

document.addEventListener('astro:before-swap', (e) => {
  inViewObserver?.disconnect();
  inViewObserver = null;
  const newDoc = (e as { newDocument?: Document }).newDocument;
  if (!newDoc) return;
  newDoc.documentElement.classList.add('ph-motion');

  // El cartón de la página nueva arranca tapando, con el mismo nombre, y sale.
  // Se pone en el documento entrante para que ya esté corriendo cuando la View
  // Transition lo fotografía en vivo (su nombre propio: `ph-stinger`).
  const current = document.querySelector<HTMLElement>('[data-stinger]');
  const next = newDoc.querySelector<HTMLElement>('[data-stinger]');
  if (!current?.classList.contains('is-in') || !next) return;
  const label = next.querySelector<HTMLElement>('[data-stinger-label]');
  if (label) label.textContent = current.querySelector('[data-stinger-label]')?.textContent ?? '';
  next.classList.add('is-out');
});

document.addEventListener('astro:page-load', () => {
  // Al acabar la salida (160 ms), el cartón vuelve a su reposo: oculto debajo de
  // la pantalla. Sin esperar a `animationend`, que puede haber pasado ya.
  const stinger = document.querySelector<HTMLElement>('[data-stinger]');
  if (stinger?.classList.contains('is-out')) {
    window.setTimeout(() => stinger.classList.remove('is-out'), 600);
  }
  // Cabecera y pie (en todas las páginas) y lo que no monte su propia sección.
  watchInView(document);
});
