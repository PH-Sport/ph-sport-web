/**
 * Lenguaje de movimiento «Retransmisión» — el núcleo ligero, sin GSAP.
 *
 * La web se mueve como el paquete gráfico de una retransmisión: las placas
 * crecen desde su borde izquierdo y su texto sube dentro de ellas, las fotos se
 * descubren en la diagonal del logo y una cortinilla barre la pantalla al
 * cambiar de página. Por qué así y qué se descartó: DECISIONS.md (variante A,
 * 2026-10-03). Cómo encaja con el resto: ARCHITECTURE.md, «Sistema de
 * animaciones».
 *
 * Este módulo no importa GSAP a propósito: lo cargan la cabecera y el pie, que
 * están en todas las páginas, incluidas las legales, que no cargan GSAP. Las
 * entradas son CSS (global.css); aquí solo se decide CUÁNDO entra cada bloque.
 *
 * Reglas:
 * - El estado de reposo es el visible. Lo que espera a entrar en pantalla solo se
 *   esconde con `html.ph-anim`, y `global.css` lo destapa a los 2,5 s si este
 *   módulo no llega a correr (`html.ph-motion`).
 * - Con `prefers-reduced-motion` todo está en su sitio desde el principio.
 */

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Arranque: el módulo está vivo ─────────────────────────────────────────────
// Desactiva la red de seguridad de CSS. Astro rehace los atributos de <html> en
// cada navegación, así que se copia al documento entrante (abajo), igual que
// hace `ph-text-animations.ts` con `ph-anim`.
document.documentElement.classList.add('ph-motion');

// ── En pantalla ───────────────────────────────────────────────────────────────
// Un solo IntersectionObserver para toda la página. Lo que entra recibe
// `is-inview` y el CSS hace el resto.
let inViewObserver: IntersectionObserver | null = null;

/** Tope de una cascada: el último de un grupo no espera más que esto. */
const CASCADE_MAX_MS = 360;

/**
 * Lo que entra a la vez entra en cascada. Las piezas con `data-cascade="<ms>"`
 * que llegan en el mismo aviso del observador (las filas de una tabla, las
 * fichas de una fila del grid) reciben su retardo por orden de lectura, en
 * `--cd`, que el CSS suma al retardo propio de cada pieza. Una pieza que entra
 * sola no espera.
 */
function enterBatch(els: HTMLElement[]): void {
  // Por filas y, dentro de cada fila, por columnas: en una lista es una cascada
  // de arriba abajo; en el grid de talentos, una ola en la diagonal del logo
  // (fila + columna).
  const placed = els
    .filter((el) => el.dataset.cascade)
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .sort((a, b) => (Math.abs(a.r.top - b.r.top) > 4 ? a.r.top - b.r.top : a.r.left - b.r.left));
  let row = -1;
  let col = 0;
  let rowTop = Number.NEGATIVE_INFINITY;
  placed.forEach(({ el, r }) => {
    if (Math.abs(r.top - rowTop) > 4) {
      row++;
      col = 0;
      rowTop = r.top;
    } else {
      col++;
    }
    const step = Number(el.dataset.cascade) || 0;
    el.style.setProperty('--cd', `${Math.min((row + col) * step, CASCADE_MAX_MS)}ms`);
  });
  els.forEach((el) => el.classList.add('is-inview'));
}

/**
 * Vigila lo que espera a entrar en pantalla dentro de `root`: todo
 * `[data-inview]`. Idempotente: se puede llamar en cada `astro:page-load` y
 * desde varias secciones.
 */
export function watchInView(root: ParentNode = document): void {
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-inview]:not(.is-inview)'));
  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-inview'));
    return;
  }

  inViewObserver ??= new IntersectionObserver(
    (entries) => {
      const entering: HTMLElement[] = [];
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        inViewObserver?.unobserve(entry.target);
        entering.push(entry.target as HTMLElement);
      }
      if (entering.length) enterBatch(entering);
    },
    // Un poco antes del borde de abajo: la pieza ya se está leyendo cuando entra.
    { rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => {
    // Lo que se maneja a mano (el rótulo del hero, que espera a la intro) no se
    // vigila.
    if (el.hasAttribute('data-inview-manual')) return;
    inViewObserver!.observe(el);
  });
}

// ── Placas partidas por líneas ────────────────────────────────────────────────
// Un rótulo de televisión no tiene placas de dos líneas: cada línea es su placa.
// Las placas con `data-plate-lines` que no caben en una línea se parten aquí:
// la original se queda para los lectores de pantalla (`is-split`, global.css) y
// cada línea pasa a ser una copia visual con su propio corte a 45°. Se rehace al
// cambiar el ancho. Sin JS se ve la placa de varias líneas.
const generated = new WeakMap<HTMLElement, HTMLElement[]>();

function unsplitPlate(plate: HTMLElement): void {
  generated.get(plate)?.forEach((el) => el.remove());
  generated.delete(plate);
  plate.classList.remove('is-split');
}

interface Token {
  text: string;
  chain: Element[];
  spaceBefore: boolean;
  top: number;
}

/** Las palabras de la placa, con los elementos que las envuelven (un `<em>`) y
 *  la altura de línea a la que caen. */
function readTokens(inner: HTMLElement): Token[] {
  const tokens: Token[] = [];
  const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT);
  let pendingSpace = false;
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const text = node.data;
    const chain: Element[] = [];
    for (let p = node.parentElement; p && p !== inner; p = p.parentElement) chain.unshift(p);
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    let last = 0;
    while ((m = re.exec(text))) {
      const range = document.createRange();
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
      tokens.push({
        text: m[0],
        chain,
        spaceBefore: tokens.length > 0 && (pendingSpace || m.index > last),
        top: rect.top,
      });
      pendingSpace = false;
      last = m.index + m[0].length;
    }
    if (/\s$/.test(text)) pendingSpace = true;
  }
  return tokens;
}

function splitPlate(plate: HTMLElement): void {
  unsplitPlate(plate);
  const inner = plate.querySelector<HTMLElement>('.ph-plate__in');
  if (!inner) return;
  const tokens = readTokens(inner);
  // Agrupar por línea: una palabra pegada a la anterior (la «.» de «roster.»)
  // va siempre con ella.
  const lines: Token[][] = [];
  tokens.forEach((tk) => {
    const cur = lines[lines.length - 1];
    if (cur && (!tk.spaceBefore || Math.abs(tk.top - cur[0].top) < 4)) cur.push(tk);
    else lines.push([tk]);
  });
  if (lines.length < 2) return;

  const baseDelay = Number.parseFloat(getComputedStyle(plate).getPropertyValue('--d')) || 0;
  const made: HTMLElement[] = [];
  let anchor: Element = plate;
  lines.forEach((line, i) => {
    const copy = plate.cloneNode(false) as HTMLElement;
    copy.removeAttribute('id');
    copy.removeAttribute('data-plate-lines');
    copy.removeAttribute('data-inview');
    copy.classList.add('ph-plate-line');
    if (i > 0) copy.classList.remove('ph-plate--tab');
    copy.setAttribute('aria-hidden', 'true');
    copy.style.setProperty('--d', `${baseDelay + i * 70}ms`);
    if (i === 0) {
      const tab = plate.querySelector('.ph-plate__tab');
      if (tab) copy.append(tab.cloneNode(true));
    }
    const t = document.createElement('span');
    t.className = 'ph-plate__t';
    const inn = document.createElement('span');
    inn.className = inner.className;
    line.forEach((tk, j) => {
      if (j > 0 && tk.spaceBefore) inn.append(' ');
      let node: Node = document.createTextNode(tk.text);
      for (let k = tk.chain.length - 1; k >= 0; k--) {
        const wrap = tk.chain[k].cloneNode(false);
        wrap.appendChild(node);
        node = wrap;
      }
      inn.append(node);
    });
    t.append(inn);
    copy.append(t);
    anchor.after(copy);
    anchor = copy;
    made.push(copy);
  });
  plate.classList.add('is-split');
  generated.set(plate, made);
}

function splitPlates(): void {
  document.querySelectorAll<HTMLElement>('[data-plate-lines]').forEach(splitPlate);
}

let splitWidth = window.innerWidth;
let splitTimer = 0;
window.addEventListener('resize', () => {
  if (window.innerWidth === splitWidth) return;
  splitWidth = window.innerWidth;
  window.clearTimeout(splitTimer);
  splitTimer = window.setTimeout(splitPlates, 150);
});

// ── Navegación ────────────────────────────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  inViewObserver?.disconnect();
  inViewObserver = null;
  const newDoc = (e as { newDocument?: Document }).newDocument;
  if (!newDoc) return;
  newDoc.documentElement.classList.add('ph-motion');
  // La cortinilla (`.ph-stinger` en global.css). Se arranca en el documento
  // entrante para que ya esté corriendo cuando la View Transition lo fotografía
  // en vivo. El sentido se apunta en la propia pieza: Astro quita el
  // `data-astro-transition` de <html> a mitad de la pasada.
  if (!prefersReducedMotion()) {
    const back = document.documentElement.getAttribute('data-astro-transition') === 'back';
    const stinger = newDoc.querySelector<HTMLElement>('[data-stinger]');
    stinger?.classList.add('is-running');
    stinger?.classList.toggle('is-back', back);
  }
});

document.addEventListener('astro:page-load', () => {
  const stinger = document.querySelector<HTMLElement>('[data-stinger]');
  const sweep = stinger?.querySelector<HTMLElement>('.ph-stinger__sweep');
  if (stinger && sweep && stinger.classList.contains('is-running')) {
    // `animationend` burbujea: solo cuenta el de la propia banda.
    const done = (e: AnimationEvent) => {
      if (e.target !== sweep) return;
      stinger.classList.remove('is-running', 'is-back');
      sweep.removeEventListener('animationend', done);
    };
    sweep.addEventListener('animationend', done);
  }
  // Las placas que no caben en una línea, partidas antes de que entren. Si
  // Söhne aún no ha llegado, se vuelven a partir con ella.
  splitPlates();
  if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(splitPlates);
  // Cabecera y pie (en todas las páginas) y lo que no monte su propia sección.
  watchInView(document);
});
