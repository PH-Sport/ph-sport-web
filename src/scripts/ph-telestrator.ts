/**
 * El telestrador: una elipse «a mano» alrededor de unas palabras, como el trazo
 * de rotulador de un analista sobre la pizarra. Una vez por página como mucho
 * (la cita de la portada, el manifiesto de /servicios).
 *
 * Se construye con la medida real de las palabras (cambia con el idioma, el
 * ancho y el motor, que no parten las líneas igual): un óvalo algo inclinado que
 * se pasa de la vuelta, para que el cierre no coincida con el arranque. Se dibuja
 * una vez al entrar en pantalla; si cambia el ancho, se rehace quieto. Sin JS no
 * hay elipse: es una anotación, no contenido.
 *
 * Cómo se mide. Por arriba y por abajo, el trazo pasa por el hueco entre la
 * frase y lo que tenga encima y debajo (la letra se mide con `measureText`: la
 * caja de texto de Söhne mide 1,3 em y la letra bastante menos). A los lados, el
 * óvalo es una superelipse (más llena que una elipse en los extremos, que es
 * donde una elipse corta la primera y la última letra) con un radio por lado:
 * cada lado se abre lo justo para que las letras de los extremos de cada línea
 * queden dentro, hasta el borde de la pantalla o el texto que siga en la misma
 * línea. Donde no hay sitio (la frase empieza en el margen), el trazo roza la
 * primera letra, que es donde arranca el rotulador.
 *
 * Marcado: el texto anotado lleva `position: relative` y dentro un `<svg>` de
 * 1×1 px en su esquina, con `overflow: visible` y un `<path>`.
 */
import { prefersReducedMotion, whenInView } from './ph-motion';

/** 2 sería una elipse; 3 la llena en los extremos sin volverla un marco. */
const EXP = 3;
/** El trazo arranca a la izquierda, da la vuelta y se pasa 22°, abriéndose. */
const START = (200 * Math.PI) / 180;
const TURN = (382 * Math.PI) / 180;
const GROW = 0.05;
/** Inclinación de la mano, en grados: baja hacia el lado de la línea más larga. */
const TILT = 1.5;

interface Loop {
  /** Centro, en px desde la esquina del `<svg>`. */
  cx: number;
  cy: number;
  /** Semieje hacia cada lado y vertical. */
  left: number;
  right: number;
  ry: number;
  tilt: number;
}

interface Glyph {
  ch: string;
  left: number;
  right: number;
  /** Línea base y lo más alto de la letra, en px de pantalla. */
  base: number;
  top: number;
}

let ctx: CanvasRenderingContext2D | null = null;

/** Prepara el lienzo con la fuente de `el` y devuelve su `ascent` de caja. */
function useFont(el: Element): number {
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize) || 16;
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return size * 0.98;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ctx.measureText('Hx').fontBoundingBoxAscent || size * 0.98;
}

/** Lo que sube la letra `ch` sobre la línea base, con la fuente preparada. */
function capOf(ch: string, size: number): number {
  return ctx?.measureText(ch).actualBoundingBoxAscent ?? size * 0.72;
}

/**
 * Las letras de un elemento, una a una, con su caja y su línea base. Sirve para
 * la frase anotada y para el texto de alrededor.
 */
function glyphs(root: Node, skip: Node | null = null, limit = Infinity): Glyph[] {
  const el = root.nodeType === Node.ELEMENT_NODE ? (root as Element) : root.parentElement;
  if (!el) return [];
  const size = parseFloat(getComputedStyle(el).fontSize) || 16;
  const ascent = useFont(el);
  const out: Glyph[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (skip && skip.contains(node)) continue;
    if (node.parentElement?.closest('[aria-hidden="true"]')) continue;
    const text = node.textContent ?? '';
    for (let i = 0; i < text.length && out.length < limit; i++) {
      const ch = text[i];
      if (!ch.trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (r.width < 0.5) continue;
      const base = r.top + ascent;
      out.push({ ch, left: r.left, right: r.right, base, top: base - capOf(ch, size) });
    }
  }
  return out;
}

/** Agrupa letras en líneas por su línea base, de arriba abajo. */
function byLine(list: Glyph[]): Glyph[][] {
  const lines: Glyph[][] = [];
  for (const g of [...list].sort((a, b) => a.base - b.base || a.left - b.left)) {
    const line = lines.find((l) => Math.abs(l[0].base - g.base) < 2);
    if (line) line.push(g);
    else lines.push([g]);
  }
  lines.forEach((l) => l.sort((a, b) => a.left - b.left));
  return lines.sort((a, b) => a[0].base - b[0].base);
}

function measure(target: HTMLElement, origin: DOMRect): Loop | null {
  const lines = byLine(glyphs(target));
  if (!lines.length) return null;
  const all = lines.flat();
  const x0 = Math.min(...all.map((g) => g.left));
  const x1 = Math.max(...all.map((g) => g.right));
  const inkTop = Math.min(...lines[0].map((g) => g.top));
  const lastBase = lines[lines.length - 1][0].base;
  const size = parseFloat(getComputedStyle(target).fontSize) || 16;
  const w = x1 - x0;
  if (w <= 0) return null;
  const cx = x0 + w / 2;

  // Lo de alrededor, en el mismo bloque: la línea de encima, la de debajo y el
  // texto que siga o preceda a la frase en su misma línea.
  const block = target.closest('h1, h2, h3, p') ?? target.parentElement ?? target;
  const around = byLine(glyphs(block, target));
  const firstBase = lines[0][0].base;
  const above = around.filter((l) => l[0].base < firstBase - 2);
  const below = around.filter((l) => l[0].base > lastBase + 2);
  const sameFirst = around.find((l) => Math.abs(l[0].base - firstBase) < 2);
  const sameLast = around.find((l) => Math.abs(l[0].base - lastBase) < 2);

  // Por arriba, más cerca de la frase que de la base de encima (los rabos de la
  // línea de arriba bajan); por abajo, a medio camino de lo siguiente.
  const aboveBase = above.length ? above[above.length - 1][0].base : inkTop - size * 0.55;
  let belowTop: number;
  if (below.length) belowTop = Math.min(...below[0].map((g) => g.top));
  else {
    const next = block.nextElementSibling;
    const nextLines = next ? byLine(glyphs(next, null, 48)) : [];
    belowTop = nextLines.length ? Math.min(...nextLines[0].map((g) => g.top)) : lastBase + size * 0.7;
  }
  const limitTop = aboveBase + (inkTop - aboveBase) * 0.55;
  const limitBottom = lastBase + Math.max(4, (belowTop - lastBase) * 0.5);
  const cy = (limitTop + limitBottom) / 2;

  // La mano se inclina hacia la línea más larga.
  const widest = lines.reduce((a, b) => (b[b.length - 1].right - b[0].left > a[a.length - 1].right - a[0].left ? b : a));
  const tilt = (((widest[0].base > cy ? 1 : -1) * TILT) * Math.PI) / 180;
  const ry = (limitBottom - limitTop) / 2 - Math.abs(Math.sin(tilt)) * (w / 2) * 0.5;

  // Hasta dónde puede abrirse cada lado. La vuelta de más abre el trazo: a la
  // derecha llega un 2 % más; a la izquierda, donde termina, un 5 %. Un signo
  // suelto pegado a la frase (el punto final) no frena: queda dentro.
  const word = (g: Glyph) => /[\p{L}\p{N}]/u.test(g.ch);
  let edgeL = 6;
  let edgeR = window.innerWidth - 6;
  const lastLine = lines[lines.length - 1];
  if (sameLast) {
    const after = sameLast.filter((g) => g.left >= lastLine[lastLine.length - 1].right - 1 && word(g));
    if (after.length) edgeR = Math.min(edgeR, after[0].left - 4);
  }
  if (sameFirst) {
    const before = sameFirst.filter((g) => g.right <= lines[0][0].left + 1 && word(g));
    if (before.length) edgeL = Math.max(edgeL, before[before.length - 1].right + 4);
  }
  const roomR = Math.max(w / 2, (edgeR - cx) / 1.022);
  const roomL = Math.max(w / 2, (cx - edgeL) / (1 + GROW));
  const pad = Math.min(14, w * 0.04);
  const loop: Loop = {
    cx: cx - origin.left,
    cy: cy - origin.top,
    left: Math.min(w / 2 + pad, roomL),
    right: Math.min(w / 2 + pad, roomR),
    ry,
    tilt,
  };

  // Las dos letras de cada extremo de cada línea, dentro (en el marco del óvalo,
  // sin la inclinación). Con el alto fijado por los huecos, el lado se abre lo
  // que pida la letra.
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const ryIn = ry * 0.97;
  const fit = (px: number, py: number) => {
    const dx = px - cx;
    const dy = py - cy;
    const fx = dx * cos + dy * sin;
    const fy = -dx * sin + dy * cos;
    const q = 1 - (Math.abs(fy) / ryIn) ** EXP;
    if (q <= 0.04) return;
    const need = (Math.abs(fx) / q ** (1 / EXP)) * 1.02;
    if (fx < 0) loop.left = Math.min(roomL, Math.max(loop.left, need));
    else loop.right = Math.min(roomR, Math.max(loop.right, need));
  };
  for (const line of lines) {
    for (const g of [...line.slice(0, 2), ...line.slice(-2)]) {
      const px = g.left + (g.right - g.left) / 2 < cx ? g.left - 3 : g.right + 3;
      fit(px, g.top - 1);
      fit(px, g.base + 1);
    }
  }
  return loop;
}

function loopPath(loop: Loop): string {
  const cos = Math.cos(loop.tilt);
  const sin = Math.sin(loop.tilt);
  const e = 2 / EXP;
  const pts: Array<[number, number]> = [];
  const N = 72;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = START + TURN * u;
    const grow = 1 + GROW * u;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const x = (c < 0 ? loop.left : loop.right) * grow * Math.sign(c) * Math.abs(c) ** e;
    // El pulso de la mano: el radio se recoge un poco a mitad de vuelta.
    const y = loop.ry * (grow - 0.03 * Math.sin(u * Math.PI)) * Math.sign(s) * Math.abs(s) ** e;
    pts.push([loop.cx + x * cos - y * sin, loop.cy + x * sin + y * cos]);
  }
  // Catmull-Rom → Bézier, para que la curva sea continua.
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

function draw(target: HTMLElement, path: SVGPathElement, animate: boolean): void {
  const svg = path.ownerSVGElement;
  if (!svg) return;
  const loop = measure(target, svg.getBoundingClientRect());
  if (!loop || loop.ry <= 0) return;
  path.setAttribute('d', loopPath(loop));
  if (!animate) return;
  const len = Math.ceil(path.getTotalLength()) + 2;
  path.animate(
    [
      { strokeDasharray: `${len} ${len}`, strokeDashoffset: `${len}` },
      { strokeDasharray: `${len} ${len}`, strokeDashoffset: '0' },
    ],
    { duration: 760, delay: 380, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)', fill: 'backwards' },
  );
}

const observers = new Set<ResizeObserver>();

/**
 * Rodea `target` con la elipse cuando `trigger` (con `data-inview`) entra en
 * pantalla.
 */
export function telestrator(trigger: HTMLElement, target: HTMLElement, path: SVGPathElement): void {
  let drawn = false;
  if (prefersReducedMotion()) {
    draw(target, path, false);
    drawn = true;
  } else {
    whenInView(trigger, () => {
      draw(target, path, true);
      drawn = true;
    });
  }
  const ro = new ResizeObserver(() => {
    if (drawn) draw(target, path, false);
  });
  // Un elemento en línea no avisa de sus cambios de tamaño: se vigila su bloque.
  ro.observe(target.closest<HTMLElement>('h1, h2, h3, p') ?? target);
  observers.add(ro);
}

document.addEventListener('astro:before-swap', () => {
  observers.forEach((ro) => ro.disconnect());
  observers.clear();
});
