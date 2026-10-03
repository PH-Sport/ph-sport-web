/**
 * Fondo animado de Talentos, Servicios y Sobre nosotros.
 *
 * Cada fondo es un `<canvas data-ambient="<escena>">` que se dibuja en directo con
 * un shader de WebGL2: va a la frecuencia de la pantalla (60 o 120 Hz), no pesa
 * nada en descargas y se ve nítido a cualquier tamaño. Por qué en directo y no en
 * vídeo como el hero: DECISIONS.md (2026-10-01).
 *
 * Reglas de convivencia con la página:
 * - Es el fondo de TODA la página: el canvas va fijo a la pantalla (`.ph-page-bg`)
 *   y el contenido pasa por encima al hacer scroll. La luz brilla entera detrás del
 *   titular (el `<h1>` de la sección) y baja a un tercio en el resto, para que no
 *   ensucie la lectura; bajo el menú siempre se apaga (`stageMask`).
 * - Solo se dibuja con la pestaña visible.
 * - Con `prefers-reduced-motion` se pinta un fotograma fijo y no se anima (se
 *   vuelve a pintar al hacer scroll, porque la zona brillante se mueve con él).
 * - La luz se suma al fondo de la página (salida premultiplicada): el canvas no
 *   tapa nada.
 * - Al navegar con el ClientRouter se destruyen los contextos de la página que se
 *   va, para no acumular contextos de WebGL ni listeners.
 * - Sin WebGL2, el canvas se queda transparente y se ve el halo de CSS de
 *   `.ph-ambient:not(.is-live)` (global.css). Con la animación en marcha lleva
 *   `is-live` y el halo desaparece.
 */

type SceneName = 'trayectorias' | 'estructura' | 'calidez';

interface SceneDef {
  fs: string;
  /** Resolución interna respecto a los px CSS (las escenas suaves aguantan menos). */
  scale: number;
  /** Segundo que se pinta con movimiento reducido. */
  still: number;
}

const VS = `#version 300 es
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
uniform vec2 uGrid;   // retícula de la página: paso y desfase horizontal, en px CSS
out vec4 o;
const vec3 GOLD = vec3(0.839, 0.698, 0.369);   // --color-ph-gold #D6B25E
const vec3 WHITE = vec3(1.0);
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
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

// Talentos — «Trayectorias»: líneas finas a 45°, la diagonal del logo, por las que
// suben destellos dorados hacia arriba a la derecha. Dos capas a distinta velocidad
// dan profundidad.
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
  float ph = fract((uTime * sp - u) / L + h) * L;            // px por detrás de la cabeza
  float trail = exp(-ph / tail) * (1.0 - exp(-(L - ph) / 2.5));
  float glow = exp(-abs(dv) / 2.2);
  return on * trail * (core * 0.9 + glow * 0.35);
}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float b1, b2;
  float l1 = layer(p, 34.0, 120.0, 150.0, 0.35, 1.0, b1);
  float l2 = layer(p + vec2(13.0, 0.0), 21.0, 70.0, 90.0, 0.25, 7.0, b2);
  vec3 c = WHITE * (b1 * 0.030 + b2 * 0.016) + GOLD * (l1 * 0.55 + l2 * 0.28);
  emit(c * stageMask(p, uRes.x / uPx, uRes.y / uPx));
}`;

// Servicios — «Estructura»: la retícula de la sala de análisis (la de CSS, fija a
// la pantalla, `body::before` en global.css) se enciende al paso de una luz lenta
// que la barre en la diagonal del logo; sus cruces brillan como nodos. El shader
// no dibuja otra retícula: suma luz justo encima de las líneas de la de CSS
// (mismo paso y mismo desfase, `uGrid`), así que la que se ve es una sola.
const ESTRUCTURA = `${HEADER}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float S = uGrid.x;
  float fromTop = H - p.y;
  // Distancia, en px CSS, a la línea vertical y a la horizontal más cercanas.
  float gx = mod(p.x - uGrid.y, S);
  float gy = mod(fromTop, S);
  float dx = min(gx, S - gx);
  float dy = min(gy, S - gy);
  float lines = max(1.0 - smoothstep(0.5, 1.6, dx), 1.0 - smoothstep(0.5, 1.6, dy));
  float node = exp(-(dx * dx + dy * dy) / 7.0);
  // Dos barridos a 45°: uno principal y otro más ancho y tenue en sentido
  // contrario. Recorren la diagonal más 450 px de margen a cada lado, así el
  // salto de vuelta ocurre fuera de la vista.
  float diag = (p.x + fromTop) * 0.70710678;
  float span = (W + H) * 0.70710678 + 900.0;
  float x1 = mod(uTime * 62.0, span) - 450.0;
  float x2 = span - mod(uTime * 34.0 + span * 0.5, span) - 450.0;
  float light = exp(-pow((diag - x1) / 210.0, 2.0)) + 0.45 * exp(-pow((diag - x2) / 330.0, 2.0));
  vec2 cell = floor(vec2(p.x - uGrid.y, fromTop) / S + 0.5);
  float tw = 0.5 + 0.5 * sin(uTime * 1.2 + hash12(cell) * 6.2832);
  vec3 c = GOLD * (lines * light * 0.24 + node * light * tw * 0.8);
  emit(c * stageMask(p, W, H));
}`;

// Sobre nosotros — «Calidez»: un haz de luz cálida que se mece despacio, con motas
// de polvo flotando dentro, en la línea del neón de la portada.
const CALIDEZ = `${HEADER}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float sway = sin(uTime * 0.21) * 0.05 + sin(uTime * 0.13 + 1.7) * 0.03;
  float portrait = step(W, H * 1.1);
  vec2 d = p - vec2(W * mix(0.72, 0.62, portrait), H + 40.0);
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
  vec3 c = GOLD * beam * 0.22 + mix(GOLD, WHITE, 0.4) * dust * (0.08 + beam * 0.9);
  emit(c * stageMask(p, W, H));
}`;

const SCENES: Record<SceneName, SceneDef> = {
  trayectorias: { fs: TRAYECTORIAS, scale: 1, still: 6 },
  estructura: { fs: ESTRUCTURA, scale: 1, still: 9 },
  calidez: { fs: CALIDEZ, scale: 0.75, still: 4 },
};

/** Tope de densidad de píxeles: más allá no se nota en algo tan tenue y cuesta GPU. */
const MAX_DPR = 1.5;

/** Intensidad de la luz fuera del titular: detrás de los párrafos, a un tercio. */
const OUTSIDE_TITLE = 0.32;

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
  const scene = SCENES[canvas.dataset.ambient as SceneName];
  if (!scene) return null;
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
  const uGrid = gl.getUniformLocation(prog, 'uGrid');

  // El titular de la sección: detrás de él la luz brilla entera. Su posición se
  // guarda en px de página y se vuelve a medir cuando cambia de tamaño.
  const title = canvas.closest('section')?.querySelector<HTMLElement>('h1') ?? null;
  let bandTop = 0;
  let bandBottom = 0;
  const measureBand = () => {
    if (!title) return;
    const r = title.getBoundingClientRect();
    bandTop = r.top + window.scrollY;
    bandBottom = r.bottom + window.scrollY;
  };

  // La retícula de CSS: paso (`--ph-grid`) y dónde cae la primera vertical (el
  // margen de sección), leídos ya resueltos del propio pseudoelemento.
  let gridStep = 48;
  let gridOffset = 0;
  const measureGrid = () => {
    const cs = getComputedStyle(document.body, '::before');
    gridStep = parseFloat(cs.backgroundSize) || (window.innerWidth >= 900 ? 64 : 48);
    gridOffset = parseFloat(cs.backgroundPositionX) || 0;
  };

  let pxRatio = 1;
  let raf = 0;
  let onScreen = false;
  const epoch = performance.now();

  const draw = (t: number) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uPx, pxRatio);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, window.scrollY);
    gl.uniform3f(uBand, bandTop, bandBottom - 8, OUTSIDE_TITLE);
    gl.uniform2f(uGrid, gridStep, gridOffset);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    measureBand();
    measureGrid();
    const rect = canvas.getBoundingClientRect();
    pxRatio = Math.min(window.devicePixelRatio || 1, MAX_DPR) * scene.scale;
    const w = Math.max(1, Math.round(rect.width * pxRatio));
    const h = Math.max(1, Math.round(rect.height * pxRatio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (reduceMotion) draw(scene.still);
  };

  const frame = (now: number) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    draw((now - epoch) / 1000);
    raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!reduceMotion && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
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
      draw(scene.still);
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
