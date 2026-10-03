/**
 * La línea de pase de la portada: la firma de la variante «Análisis».
 *
 * Una sola trayectoria dorada que baja por la portada desde «Scroll» (la
 * trayectoria discontinua del hero) hasta el correo de contacto, pasando por los
 * nodos de Talentos, Servicios y la cita de Sobre PHSPORT. Se dibuja con el
 * scroll: su punta va al 62 % de la pantalla, así que avanza al ritmo del dedo y
 * nunca bloquea ni secuestra el scroll. Cuando la punta alcanza un nodo, el nodo
 * se rellena y su anillo se expande una vez; el último, el del correo, es el gol.
 *
 * Cómo se construye. Cada bloque de la portada lleva su tramo (un `<svg
 * data-pass-seg>` que lo cubre entero, por detrás del contenido) y su nodo
 * (`[data-pass-node]`). La línea baja por un carril en el margen izquierdo —la
 * mitad del margen de sección, donde está «Scroll» en el hero— y en cada bloque
 * hace un quiebro a 45° (la diagonal del logo) hasta su nodo y vuelve al carril;
 * en el último termina en el nodo. Como cada tramo vive en su bloque, si un bloque
 * se desplaza (un acordeón que se abre más arriba) su tramo va con él, y los
 * tramos casan en las juntas porque todos entran y salen por el carril. Se
 * recalcula cuando cambia de tamaño cualquier bloque (ResizeObserver) o el ancho
 * de la ventana; fuera de la portada no hay tramos y no cuesta nada.
 *
 * Con movimiento reducido se dibuja entera y quieta. Sin JavaScript no hay línea:
 * es la firma, no contenido.
 */
import { prefersReducedMotion, ping } from './ph-motion';

/** Dónde va la punta de la línea, en fracción del alto de la pantalla. */
const HEAD = 0.62;
/** Muestras por tramo para pasar de altura a longitud recorrida. */
const SAMPLES = 120;
/** Radio de los quiebros: la línea gira, no se parte. */
const CORNER = 12;

interface Segment {
  section: HTMLElement;
  path: SVGPathElement;
  node: HTMLElement | null;
  goal: boolean;
  /** Arriba del bloque, en px de página. */
  top: number;
  height: number;
  /** Altura del nodo dentro del bloque. */
  nodeY: number;
  length: number;
  /** Largo del guion (y del hueco): la longitud redondeada hacia arriba. */
  dash: number;
  ys: Float32Array;
  lens: Float32Array;
  reached: boolean;
}

let segments: Segment[] = [];
let ro: ResizeObserver | null = null;
let measureScheduled = false;
let updateScheduled = false;
let lastWidth = 0;

/** Polilínea con las esquinas redondeadas (curvas cuadráticas). */
function rounded(points: Array<[number, number]>, radius: number): string {
  const r1 = (v: number) => Math.round(v * 10) / 10;
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i];
    const next = points[i + 1];
    if (!next) {
      d += `L${r1(px)} ${r1(py)}`;
      break;
    }
    const [ax, ay] = points[i - 1];
    const [bx, by] = next;
    const la = Math.hypot(ax - px, ay - py);
    const lb = Math.hypot(bx - px, by - py);
    const r = Math.min(radius, la / 2, lb / 2);
    if (r < 0.5) {
      d += `L${r1(px)} ${r1(py)}`;
      continue;
    }
    const sx = px + ((ax - px) / la) * r;
    const sy = py + ((ay - py) / la) * r;
    const ex = px + ((bx - px) / lb) * r;
    const ey = py + ((by - py) / lb) * r;
    d += `L${r1(sx)} ${r1(sy)}Q${r1(px)} ${r1(py)} ${r1(ex)} ${r1(ey)}`;
  }
  return d;
}

function measure(): void {
  measureScheduled = false;
  if (!segments.length) return;
  const scrollY = window.scrollY;
  for (const seg of segments) {
    const rect = seg.section.getBoundingClientRect();
    const rail = parseFloat(getComputedStyle(seg.section).paddingLeft) / 2 || 12;
    seg.top = rect.top + scrollY;
    seg.height = rect.height;
    const H = rect.height;
    let points: Array<[number, number]>;
    if (seg.node) {
      const n = seg.node.getBoundingClientRect();
      const nx = n.left + n.width / 2 - rect.left;
      const ny = n.top + n.height / 2 - rect.top;
      const j = Math.abs(nx - rail);
      seg.nodeY = ny;
      points = [[rail, 0], [rail, Math.max(0, ny - j)], [nx, ny]];
      if (!seg.goal) points.push([rail, Math.min(H, ny + j)], [rail, H]);
    } else {
      seg.nodeY = H;
      points = [[rail, 0], [rail, H]];
    }
    seg.path.setAttribute('d', rounded(points, CORNER));
    const length = seg.path.getTotalLength();
    seg.length = length;
    for (let i = 0; i <= SAMPLES; i++) {
      const l = (length * i) / SAMPLES;
      seg.lens[i] = l;
      seg.ys[i] = seg.path.getPointAtLength(l).y;
    }
    seg.dash = Math.ceil(length) + 1;
    seg.path.style.strokeDasharray = `${seg.dash} ${seg.dash}`;
  }
  update();
}

/** Longitud recorrida cuando la punta está a `y` px del arriba del bloque. */
function lengthAt(seg: Segment, y: number): number {
  const { ys, lens } = seg;
  let lo = 0;
  let hi = SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ys[mid] <= y) lo = mid;
    else hi = mid;
  }
  const span = ys[hi] - ys[lo];
  const a = span > 0 ? Math.min(1, Math.max(0, (y - ys[lo]) / span)) : 1;
  return lens[lo] + (lens[hi] - lens[lo]) * a;
}

function update(): void {
  updateScheduled = false;
  if (!segments.length) return;
  const reduced = prefersReducedMotion();
  const head = window.scrollY + window.innerHeight * HEAD;
  for (const seg of segments) {
    const local = head - seg.top;
    let drawn: number;
    if (reduced || local >= seg.height) drawn = seg.length;
    else if (local <= 0) drawn = 0;
    else drawn = lengthAt(seg, local);
    // El desfase se cuenta sobre el guion entero, no sobre la longitud: con la
    // longitud, a cero asomaba un píxel de guion y el remate redondo lo pintaba
    // como un punto suelto en el carril. Sin nada dibujado, el tramo ni se pinta.
    seg.path.style.strokeDashoffset = String(Math.max(0, seg.dash - drawn));
    seg.path.style.visibility = drawn > 0 ? '' : 'hidden';
    if (!seg.node) continue;
    const reached = reduced || local >= seg.nodeY;
    if (reached !== seg.reached) {
      seg.reached = reached;
      seg.node.classList.toggle('is-reached', reached);
      if (reached && !reduced) ping(seg.node);
    }
  }
}

function scheduleMeasure(): void {
  if (measureScheduled) return;
  measureScheduled = true;
  requestAnimationFrame(measure);
}

function scheduleUpdate(): void {
  if (updateScheduled) return;
  updateScheduled = true;
  requestAnimationFrame(update);
}

function onResize(): void {
  if (window.innerWidth === lastWidth) return;
  lastWidth = window.innerWidth;
  scheduleMeasure();
}

function teardown(): void {
  ro?.disconnect();
  ro = null;
  segments = [];
}

function init(): void {
  teardown();
  const svgs = Array.from(document.querySelectorAll<SVGSVGElement>('[data-pass-seg]'));
  if (!svgs.length) return;
  segments = svgs.flatMap((svg) => {
    const section = svg.closest<HTMLElement>('[data-pass-section]');
    const path = svg.querySelector<SVGPathElement>('path');
    if (!section || !path) return [];
    const node = section.querySelector<HTMLElement>('[data-pass-node]');
    return [{
      section,
      path,
      node,
      goal: section.hasAttribute('data-pass-goal'),
      top: 0,
      height: 0,
      nodeY: 0,
      length: 0,
      dash: 0,
      ys: new Float32Array(SAMPLES + 1),
      lens: new Float32Array(SAMPLES + 1),
      reached: false,
    }];
  });
  lastWidth = window.innerWidth;
  ro = new ResizeObserver(scheduleMeasure);
  segments.forEach((seg) => ro!.observe(seg.section));
  document.fonts?.ready.then(scheduleMeasure);
  scheduleMeasure();
}

document.addEventListener('scroll', () => {
  if (segments.length) scheduleUpdate();
}, { passive: true });
window.addEventListener('resize', onResize, { passive: true });
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', teardown);
