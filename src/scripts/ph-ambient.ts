/**
 * Fondo animado de la web: un «bombo» de escenas.
 *
 * Cada página (salvo los textos legales) lleva un único `<canvas data-ambient>`
 * que monta `BaseLayout`. Al cargar la página sale una escena al azar del bombo
 * (`POOL`), nunca la de la página anterior (decisión de Mario, 2026-10-05;
 * DECISIONS.md). Se dibuja en directo con un shader de WebGL2: va a la frecuencia
 * de la pantalla (60 o 120 Hz), no pesa nada en descargas y se ve nítido a
 * cualquier tamaño. Por qué en directo y no en vídeo como el hero: DECISIONS.md
 * (2026-10-01). Las escenas y el bombo vienen del rediseño «Mochi» (su rama se
 * borró el 2026-10-05; DECISIONS.md).
 *
 * Reglas de convivencia con la página:
 * - Es el fondo de TODA la página: el canvas va fijo a la pantalla (`.ph-page-bg`)
 *   y el contenido pasa por encima al hacer scroll. La luz brilla entera detrás del
 *   titular de la página (su `<h1>`) y baja a un tercio en el resto, para que no
 *   ensucie la lectura. En la portada va entera en toda la página (su titular está
 *   tapado por el vídeo del hero). Bajo el menú siempre se apaga (`stageMask`).
 * - En ordenador (puntero fino), la luz reacciona al ratón: le llega amortiguada
 *   por un muelle, sin saltos. En táctil no hay ratón y no reacciona.
 * - Solo se dibuja con la pestaña visible.
 * - Con `prefers-reduced-motion` se pinta un fotograma fijo y no se anima (se
 *   vuelve a pintar al hacer scroll y al mover el ratón).
 * - La luz se suma al fondo de la página (salida premultiplicada): el canvas no
 *   tapa nada.
 * - Al navegar con el ClientRouter se destruye el contexto de la página que se va,
 *   para no acumular contextos de WebGL ni listeners.
 * - Sin WebGL2, el canvas se queda transparente y se ve el halo de CSS de
 *   `.ph-ambient:not(.is-live)` (global.css). Con la animación en marcha lleva
 *   `is-live` y el halo desaparece.
 * - Para revisar una escena concreta: `?fondo=<escena>` en la URL.
 */

export type SceneName = 'velo' | 'neon' | 'trayectorias' | 'estructura' | 'calidez';

export interface SceneDef {
  fs: string;
  /** Resolución interna respecto a los px CSS (las escenas suaves aguantan menos). */
  scale: number;
  /** Segundo que se pinta con movimiento reducido. */
  still: number;
}

export const VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
uniform vec2 uRes;    // px internos del canvas
uniform float uPx;    // px internos por px CSS
uniform float uTime;  // segundos
uniform float uScroll; // px CSS desplazados en la página
uniform vec3 uBand;   // titular en px CSS de página (arriba, abajo) y la luz fuera de él (0-1)
uniform vec3 uMouse;  // ratón en px CSS (origen abajo a la izquierda) y presencia 0-1
out vec4 o;
const vec3 GOLD = vec3(0.839, 0.698, 0.369);   // --color-ph-gold #D6B25E
const vec3 WHITE = vec3(1.0);
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
// Cerca del ratón: campana suave de radio r (px CSS).
float nearMouse(vec2 p, float r) { vec2 d = p - uMouse.xy; return uMouse.z * exp(-dot(d, d) / (2.0 * r * r)); }
// Dónde hay luz. El canvas es fijo y cubre la pantalla: la luz brilla entera
// detrás del titular y baja a uBand.z en el resto de la página, así los párrafos se
// leen limpios; bajo el menú se apaga siempre. p, W y H en px CSS, con el origen
// abajo a la izquierda.
float stageMask(vec2 p, float W, float H) {
  float fromTop = H - p.y;
  float pageY = uScroll + fromTop;
  float nav = smoothstep(30.0, W < 768.0 ? 120.0 : 190.0, fromTop);
  float band = smoothstep(uBand.x - 90.0, uBand.x, pageY) * (1.0 - smoothstep(uBand.y, uBand.y + 70.0, pageY));
  return nav * mix(uBand.z, 1.0, band);
}
// Salida premultiplicada: la luz se suma al fondo de la página, que se ve a través.
// El tramado evita escalones en degradados tan oscuros.
void emit(vec3 c) {
  c += (hash12(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) / 255.0;
  c = max(c, 0.0);
  o = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
}
`;

// Velo: la red de luz que deja un cristal (o el agua) al sol, a 45°, tenue y lenta;
// casi una textura. Junto al ratón se concentra apenas, como bajo una lupa (al 10 %
// de la fuerza de las demás escenas, a petición de Mario). Con el doble de luz que
// en Mochi: allí apenas se notaba la neblina (Mario, 2026-10-05).
const VELO = `${HEADER}
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  vec2 r = vec2(p.x + p.y, p.x - p.y) * 0.70710678;
  float m = nearMouse(p, 240.0) * 0.1;
  float k = caustic(r / (1000.0 - m * 220.0), uTime * 0.06 + 23.0);
  float k2 = caustic(r / 620.0 + 0.37, uTime * 0.045 + 11.0);
  float v = k * 0.7 + k2 * 0.3;
  vec3 c = GOLD * v * (0.1 + m * 0.14) + WHITE * v * 0.008;
  // Todo por igual, para que el movimiento y la reacción al ratón no cambien.
  const float GAIN = 2.0;
  emit(c * GAIN * stageMask(p, W, H));
}`;

// Neón: el contorno del logo en grande, con ecos paralelos como curvas de nivel, y
// una luz que recorre el tubo como el rótulo al encenderse. Con el ratón se
// encienden los trazos cercanos.
const NEON = `${HEADER}
const vec2 A[9] = vec2[9](vec2(0.0,206.1), vec2(58.2,206.1), vec2(57.9,145.5), vec2(158.1,45.4), vec2(112.7,0.0), vec2(0.0,0.0), vec2(0.0,52.6), vec2(76.9,52.6), vec2(0.0,128.7));
const vec2 B[13] = vec2[13](vec2(122.6,206.1), vec2(200.1,206.1), vec2(152.2,157.8), vec2(173.0,137.1), vec2(182.4,146.4), vec2(259.8,146.4), vec2(169.6,55.6), vec2(130.5,94.2), vec2(131.8,95.6), vec2(141.1,105.4), vec2(120.3,125.8), vec2(109.8,115.4), vec2(70.8,153.9));
float segPoint(vec2 q, vec2 a, vec2 b, out float t) {
  vec2 ab = b - a; t = clamp(dot(q - a, ab) / dot(ab, ab), 0.0, 1.0);
  return length(q - a - ab * t);
}
// Distancia al contorno (en unidades del logo, public/logo.svg) y posición a lo
// largo de él, para que la luz lo recorra.
float polyA(vec2 q, out float s, out float L) {
  float best = 1e9; float cum = 0.0; s = 0.0;
  for (int i = 0; i < 9; i++) {
    vec2 a = A[i]; vec2 b = A[i == 8 ? 0 : i + 1];
    a.y = 206.1 - a.y; b.y = 206.1 - b.y;
    float t; float d = segPoint(q, a, b, t); float len = length(b - a);
    if (d < best) { best = d; s = cum + t * len; }
    cum += len;
  }
  L = cum; return best;
}
float polyB(vec2 q, out float s, out float L) {
  float best = 1e9; float cum = 0.0; s = 0.0;
  for (int i = 0; i < 13; i++) {
    vec2 a = B[i]; vec2 b = B[i == 12 ? 0 : i + 1];
    a.y = 206.1 - a.y; b.y = 206.1 - b.y;
    float t; float d = segPoint(q, a, b, t); float len = length(b - a);
    if (d < best) { best = d; s = cum + t * len; }
    cum += len;
  }
  L = cum; return best;
}
float rings(float dpx, float m) {
  float acc = 0.0;
  for (int n = 0; n < 4; n++) {
    float fn = float(n);
    float w = mix(1.0, 0.16, fn / 3.0);
    acc += w * (1.0 - smoothstep(0.45, 1.35 + m * 0.6, abs(dpx - fn * 26.0)));
  }
  return acc;
}
float pulse(float s, float L, float k, float speed, float phase) {
  float Lp = L * k;
  float head = fract(uTime * speed + phase) * Lp;
  float behind = mod(head - s * k, Lp);
  return exp(-behind / 240.0) * (1.0 - exp(-(Lp - behind) / 6.0));
}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float portrait = step(W, H);
  float k = max(H * 1.35, 760.0) / 206.1;
  vec2 C = vec2(W * mix(0.70, 0.56, portrait), H * 0.46 + uScroll * 0.08);
  vec2 q = (p - C) / k + vec2(129.9, 103.05);
  float sA, LA, sB, LB;
  float dA = polyA(q, sA, LA) * k;
  float dB = polyB(q, sB, LB) * k;
  float m = nearMouse(p, 200.0);
  float rA = rings(dA, m), rB = rings(dB, m);
  float pA = pulse(sA, LA, k, 0.035, 0.0);
  float pB = pulse(sB, LB, k, 0.028, 0.37);
  float flick = 0.9 + 0.1 * step(0.985, hash11(floor(uTime * 9.0)));
  vec3 c = WHITE * (rA + rB) * 0.026
         + GOLD * (rA * pA + rB * pB) * 0.55 * flick
         + GOLD * (exp(-dA / 3.0) * pA + exp(-dB / 3.0) * pB) * 0.22
         + GOLD * (rA + rB) * m * 0.22;
  emit(c * stageMask(p, W, H));
}`;

// Trayectorias: líneas finas a 45°, la diagonal del logo, por las que suben
// destellos dorados. Dos capas a distinta velocidad dan profundidad. Cerca del
// ratón, las líneas y los destellos se avivan.
const TRAYECTORIAS = `${HEADER}
float layer(vec2 p, float S, float speed, float tail, float density, float seed, out float base) {
  float u = (p.x + p.y) * 0.70710678;   // avanza hacia arriba a la derecha
  float v = (p.x - p.y) * 0.70710678;   // cruza las líneas
  float id = floor(v / S);
  float dv = (fract(v / S) - 0.5) * S;
  float core = 1.0 - smoothstep(0.35, 1.25, abs(dv));
  base = core;
  float h = hash11(id * 1.37 + seed);
  float on = step(1.0 - density, hash11(id * 7.91 + seed * 3.1));
  float sp = speed * mix(0.6, 1.4, h);
  float L = mix(900.0, 1700.0, hash11(id * 3.3 + seed));
  float ph = fract((uTime * sp - u) / L + h) * L;
  float trail = exp(-ph / tail) * (1.0 - exp(-(L - ph) / 2.5));
  float glow = exp(-abs(dv) / 2.2);
  return on * trail * (core * 0.9 + glow * 0.35);
}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float b1, b2;
  float l1 = layer(p, 34.0, 120.0, 150.0, 0.35, 1.0, b1);
  float l2 = layer(p + vec2(13.0, 0.0), 21.0, 70.0, 90.0, 0.25, 7.0, b2);
  float m = nearMouse(p, 220.0);
  vec3 c = WHITE * (b1 * 0.030 + b2 * 0.016) * (1.0 + m * 3.0)
         + GOLD * (l1 * 0.55 + l2 * 0.28) * (1.0 + m * 1.6)
         + GOLD * (b1 + b2) * m * 0.12;
  emit(c * stageMask(p, W, H));
}`;

// Estructura: la retícula a 45° con la que se construye el logo, casi invisible, y
// una luz lenta que la barre y enciende sus cruces. El ratón lleva una linterna.
const ESTRUCTURA = `${HEADER}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float S = 72.0;
  vec2 q = vec2(p.x + p.y, p.x - p.y) * 0.70710678 + vec2(uTime * 6.0, 0.0);
  vec2 f = abs(fract(q / S + 0.5) - 0.5) * S;
  float lines = max(1.0 - smoothstep(0.3, 1.2, f.x), 1.0 - smoothstep(0.3, 1.2, f.y));
  float node = exp(-dot(f, f) / 6.0);
  // Dos barridos: uno principal y otro más ancho y tenue en sentido contrario.
  // Recorren el ancho más 600 px de margen a cada lado, así el salto de vuelta
  // ocurre fuera de la vista.
  float diag = p.x - p.y * 0.35;
  float span = W + H * 0.35 + 1200.0;
  float x1 = mod(uTime * 70.0, span) - 600.0;
  float x2 = span - mod(uTime * 38.0 + span * 0.5, span) - 600.0;
  float light = exp(-pow((diag - x1) / 220.0, 2.0)) + 0.5 * exp(-pow((diag - x2) / 340.0, 2.0));
  light += 1.3 * nearMouse(p, 190.0);
  float tw = 0.5 + 0.5 * sin(uTime * 1.3 + hash12(floor(q / S + 0.5)) * 6.2832);
  vec3 c = WHITE * lines * 0.022 + GOLD * (lines * light * 0.32 + node * light * tw * 0.9);
  emit(c * stageMask(p, W, H));
}`;

// Calidez: un haz de luz cálida que se mece despacio, con motas de polvo flotando
// dentro, en la línea del neón de la portada. El haz se inclina hacia el ratón.
const CALIDEZ = `${HEADER}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float portrait = step(W, H * 1.1);
  vec2 origin = vec2(W * mix(0.72, 0.62, portrait), H + 40.0);
  float sway = sin(uTime * 0.21) * 0.05 + sin(uTime * 0.13 + 1.7) * 0.03;
  float toMouse = clamp((uMouse.x - origin.x) / max(origin.y - uMouse.y, 120.0), -0.6, 0.6);
  sway = mix(sway, toMouse, uMouse.z * 0.85);
  vec2 d = p - origin;
  float depth = max(-d.y, 1.0);
  float beam = exp(-pow((d.x / depth - sway) / 0.33, 2.0)) * exp(-depth / (H * 1.1));
  float dust = 0.0;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    float S = mix(38.0, 90.0, fk * 0.5);
    vec2 q = p / S;
    q.y -= uTime * mix(9.0, 22.0, fk * 0.5) / S;             // suben despacio
    q.x += sin(uTime * 0.3 + fk) * 0.3;
    vec2 cell = floor(q);
    vec2 f = fract(q) - 0.5;
    float h = hash12(cell + fk * 17.0);
    vec2 off = vec2(hash12(cell + 3.1 + fk), hash12(cell + 7.7 + fk)) - 0.5;
    off += 0.25 * vec2(sin(uTime * 0.7 + h * 6.2832), cos(uTime * 0.5 + h * 4.0));
    float r = mix(0.9, 2.6, fk * 0.5) / S;
    float m = smoothstep(r * 1.8, r * 0.2, length(f - off * 0.7)) * step(0.55, h);
    dust += m * (0.6 + 0.4 * sin(uTime * (0.8 + h) + h * 20.0)) * mix(0.9, 0.5, fk * 0.5);
  }
  float m = nearMouse(p, 200.0);
  vec3 c = GOLD * beam * 0.22 + mix(GOLD, WHITE, 0.4) * dust * (0.08 + beam * 0.9 + m * 0.8);
  emit(c * stageMask(p, W, H));
}`;

export const SCENES: Record<SceneName, SceneDef> = {
  velo: { fs: VELO, scale: 0.7, still: 30 },
  neon: { fs: NEON, scale: 0.8, still: 7 },
  trayectorias: { fs: TRAYECTORIAS, scale: 1, still: 6 },
  estructura: { fs: ESTRUCTURA, scale: 1, still: 9 },
  calidez: { fs: CALIDEZ, scale: 0.75, still: 4 },
};

/** El bombo: de aquí sale el fondo de cada página. Para quitar o añadir una
 *  escena, basta con esta lista. Van las cinco (Mario, 2026-10-05); en la rama
 *  Mochi había sacado Calidez el 2026-10-02. */
const POOL: SceneName[] = ['velo', 'neon', 'trayectorias', 'estructura', 'calidez'];

/** Tope de densidad de píxeles: más allá no se nota en algo tan tenue y cuesta GPU. */
const MAX_DPR = 1.5;

/** Intensidad de la luz fuera del titular: detrás de los párrafos, a un tercio. */
const OUTSIDE_TITLE = 0.32;

const LAST_KEY = 'ph-ambient-ultima';
let lastScene: SceneName | null = null;

/** Escena al azar del bombo, sin repetir la de la página anterior. La última se
 *  guarda en memoria (navegaciones del ClientRouter) y en sessionStorage (recargas
 *  y enlaces abiertos en la misma pestaña). `?fondo=<escena>` fuerza una. */
function pickScene(): SceneName {
  const forced = new URLSearchParams(window.location.search).get('fondo') as SceneName | null;
  if (forced && forced in SCENES) return forced;
  let last = lastScene;
  try {
    last = (sessionStorage.getItem(LAST_KEY) as SceneName | null) ?? last;
  } catch {
    /* almacenamiento bloqueado: basta con la memoria */
  }
  const options = POOL.filter((s) => s !== last);
  const pick = options[Math.floor(Math.random() * options.length)];
  lastScene = pick;
  try {
    sessionStorage.setItem(LAST_KEY, pick);
  } catch {
    /* sin almacenamiento */
  }
  return pick;
}

interface Instance {
  destroy(): void;
}

const live = new Set<Instance>();

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[ph-ambient]', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function create(canvas: HTMLCanvasElement, reduceMotion: boolean): Instance | null {
  const name = pickScene();
  const scene = SCENES[name];
  canvas.dataset.ambient = name;
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    // Que un portátil con dos GPU no despierte la potente para un fondo.
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VS);
  const fs = compile(gl, gl.FRAGMENT_SHADER, scene.fs);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uPx = gl.getUniformLocation(prog, 'uPx');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uScroll = gl.getUniformLocation(prog, 'uScroll');
  const uBand = gl.getUniformLocation(prog, 'uBand');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  // El titular de la página: detrás de él la luz brilla entera. Su posición se
  // guarda en px de página y se vuelve a medir cuando cambia de tamaño.
  const title = canvas.closest('main')?.querySelector<HTMLElement>('h1') ?? null;
  // En la portada el titular es el lema del hero, tapado por el vídeo: no hay
  // titular sobre el fondo y, con la regla del tercio, la luz quedaría apagada en
  // toda la página. Ahí va entera, como en el prototipo que aprobó Mario (Mochi).
  const outside = title?.closest('.hero--home') ? 1 : OUTSIDE_TITLE;
  let bandTop = 0;
  let bandBottom = 0;
  const measureBand = () => {
    if (!title) return;
    const r = title.getBoundingClientRect();
    bandTop = r.top + window.scrollY;
    bandBottom = r.bottom + window.scrollY;
  };

  // Ratón (solo con puntero fino): la posición se acerca al cursor con un muelle
  // crítico y la presencia sube o baja suave al entrar o salir de la ventana.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, z: 0, tz: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (mouse.tz === 0 && mouse.z < 0.01) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
    mouse.tz = 1;
    if (reduceMotion) drawStill();
  };
  const onLeave = () => {
    mouse.tz = 0;
  };
  const stepMouse = (dt: number) => {
    const w = 9; // rigidez del muelle (1/s)
    const ax = w * w * (mouse.tx - mouse.x) - 2 * w * mouse.vx;
    const ay = w * w * (mouse.ty - mouse.y) - 2 * w * mouse.vy;
    mouse.vx += ax * dt;
    mouse.vy += ay * dt;
    mouse.x += mouse.vx * dt;
    mouse.y += mouse.vy * dt;
    mouse.z += (mouse.tz - mouse.z) * (1 - Math.exp(-dt * 4));
  };
  if (finePointer) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }

  let pxRatio = 1;
  let raf = 0;
  let onScreen = false;
  let last = performance.now();
  const epoch = last;

  const draw = (t: number) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uPx, pxRatio);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, window.scrollY);
    gl.uniform3f(uBand, bandTop, bandBottom - 8, outside);
    const mx = reduceMotion ? mouse.tx : mouse.x;
    const my = reduceMotion ? mouse.ty : mouse.y;
    gl.uniform3f(uMouse, mx, canvas.clientHeight - my, reduceMotion ? mouse.tz : mouse.z);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const drawStill = () => draw(scene.still);

  const resize = () => {
    measureBand();
    const rect = canvas.getBoundingClientRect();
    pxRatio = Math.min(window.devicePixelRatio || 1, MAX_DPR) * scene.scale;
    const w = Math.max(1, Math.round(rect.width * pxRatio));
    const h = Math.max(1, Math.round(rect.height * pxRatio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (reduceMotion) drawStill();
  };

  const frame = (now: number) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    stepMouse(Math.min(0.05, (now - last) / 1000));
    last = now;
    draw((now - epoch) / 1000);
    raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!reduceMotion && !raf && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  if (title) ro.observe(title);
  document.fonts?.ready.then(resize);
  // Con movimiento reducido no hay bucle: el fotograma fijo se repinta al hacer
  // scroll, porque la zona brillante (el titular) se mueve con la página.
  let stillRaf = 0;
  const onScroll = () => {
    if (stillRaf) return;
    stillRaf = requestAnimationFrame(() => {
      stillRaf = 0;
      drawStill();
    });
  };
  if (reduceMotion) window.addEventListener('scroll', onScroll, { passive: true });
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    kick();
  });
  io.observe(canvas);
  document.addEventListener('visibilitychange', kick);
  const onLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    canvas.classList.remove('is-live');
  };
  canvas.addEventListener('webglcontextlost', onLost);

  resize();
  canvas.classList.add('is-live');

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(stillRaf);
      raf = 0;
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      io.disconnect();
      document.removeEventListener('visibilitychange', kick);
      canvas.removeEventListener('webglcontextlost', onLost);
      // Libera la GPU ya: el navegador tiene un tope de contextos de WebGL vivos.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

function initAmbient(): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-ambient]').forEach((canvas) => {
    if (canvas.dataset.ambientReady) return;
    canvas.dataset.ambientReady = '1';
    const inst = create(canvas, reduceMotion);
    if (inst) live.add(inst);
  });
}

function destroyAll(): void {
  for (const inst of live) inst.destroy();
  live.clear();
}

// El módulo se evalúa una sola vez por carga completa; los listeners sirven para
// todas las navegaciones del ClientRouter.
document.addEventListener('astro:page-load', initAmbient);
document.addEventListener('astro:before-swap', destroyAll);
