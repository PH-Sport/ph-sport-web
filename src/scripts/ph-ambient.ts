/**
 * Fondo vivo de Talentos, Servicios y Sobre nosotros: la «proyección».
 *
 * En el mundo «Títulos» la web es una secuencia de créditos proyectada, así que
 * el fondo es la pantalla de cine: negro con grano de película, que cambia a 24
 * fotogramas por segundo (la cadencia del cine), y un halo cálido muy tenue que
 * respira detrás del titular de la página, como la luz del proyector. Sustituye a
 * las tres escenas doradas del 2026-10-01 (DECISIONS.md, 2026-10-03): con titulares
 * gigantes y fotos en rectángulos duros, las líneas y los destellos competían con
 * la tipografía, que aquí es la imagen.
 *
 * Es un `<canvas data-ambient="proyeccion">` dibujado con un shader de WebGL2, como
 * antes: no pesa en descargas y se ve nítido a cualquier tamaño.
 *
 * Reglas de convivencia con la página:
 * - Es el fondo de TODA la página: el canvas va fijo a la pantalla (`.ph-page-bg`)
 *   y el contenido pasa por encima al hacer scroll. El halo sigue al titular (el
 *   `<h1>` de la sección) y, cuando sale por arriba, se queda tenue en el borde.
 * - El grano se redibuja a 24 fps; el halo, además, en cada scroll, para que vaya
 *   pegado al titular. Fuera de eso no se dibuja: menos GPU que a la frecuencia de
 *   la pantalla.
 * - Solo se dibuja con la pestaña visible.
 * - Con `prefers-reduced-motion` se pinta un fotograma fijo y no se anima (se
 *   vuelve a pintar al hacer scroll, porque el halo se mueve con el titular).
 * - La luz se suma al fondo de la página (salida premultiplicada): el canvas no
 *   tapa nada.
 * - Al navegar con el ClientRouter se destruyen los contextos de la página que se
 *   va, para no acumular contextos de WebGL ni listeners.
 * - Sin WebGL2, el canvas se queda transparente y se ve el halo de CSS de
 *   `.ph-ambient:not(.is-live)` (global.css). Con la animación en marcha lleva
 *   `is-live` y el halo de CSS desaparece.
 */

type SceneName = 'proyeccion';

interface SceneDef {
  fs: string;
  /** Resolución interna respecto a los px CSS. */
  scale: number;
  /** Segundo que se pinta con movimiento reducido. */
  still: number;
}

const VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Proyección: el grano cambia con cada fotograma de 24 fps (`uFrame`) y el halo
// se centra a la izquierda, donde arrancan los titulares, a la altura del
// titular en pantalla (`uBand`: arriba y abajo del <h1> en px CSS de página).
const PROYECCION = `#version 300 es
precision highp float;
uniform vec2 uRes;     // px internos del canvas
uniform float uPx;     // px internos por px CSS
uniform float uTime;   // segundos
uniform float uFrame;  // fotograma de 24 fps
uniform float uScroll; // px CSS desplazados en la página
uniform vec2 uBand;    // titular en px CSS de página (arriba, abajo)
out vec4 o;
const vec3 GOLD = vec3(0.839, 0.698, 0.369);   // --color-ph-gold #D6B25E
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  // Halo: a la altura del titular mientras está en pantalla; cuando sale por
  // arriba se queda en el borde, más tenue. Deriva y respira muy despacio.
  float titleMid = (uBand.x + uBand.y) * 0.5 - uScroll;
  float ty = clamp(titleMid, -0.12 * H, 0.6 * H);
  vec2 c = vec2(W * 0.28 + sin(uTime * 0.11) * W * 0.04, H - ty + cos(uTime * 0.09) * 24.0);
  float r = max(W, H) * 0.6;
  vec2 d = (p - c) / vec2(1.3, 1.0) / r;
  float near = mix(0.4, 1.0, smoothstep(-0.7 * H, 0.0, titleMid));
  float halo = exp(-dot(d, d) * 2.4) * (0.84 + 0.16 * sin(uTime * 0.42)) * near;
  // Grano de película: motas que encienden el negro, distintas en cada fotograma.
  float g = hash12(floor(gl_FragCoord.xy) + uFrame * 37.17);
  float grain = pow(g, 3.0) * 0.05;
  vec3 col = GOLD * halo * 0.075 + vec3(grain);
  col = max(col, 0.0);
  // Salida premultiplicada: la luz se suma al fondo de la página, que se ve a través.
  o = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
}`;

const SCENES: Record<SceneName, SceneDef> = {
  proyeccion: { fs: PROYECCION, scale: 1, still: 6 },
};

/** Tope de densidad de píxeles: más allá no se nota en algo tan tenue y cuesta GPU. */
const MAX_DPR = 1.5;

/** Fotogramas por segundo del grano: la cadencia del cine. */
const FILM_FPS = 24;

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
  const uFrame = gl.getUniformLocation(prog, 'uFrame');
  const uScroll = gl.getUniformLocation(prog, 'uScroll');
  const uBand = gl.getUniformLocation(prog, 'uBand');

  // El titular de la sección: el halo lo sigue. Su posición se guarda en px de
  // página y se vuelve a medir cuando cambia de tamaño.
  const title = canvas.closest('section')?.querySelector<HTMLElement>('h1') ?? null;
  let bandTop = 0;
  let bandBottom = 0;
  const measureBand = () => {
    if (!title) return;
    const r = title.getBoundingClientRect();
    bandTop = r.top + window.scrollY;
    bandBottom = r.bottom + window.scrollY;
  };

  let pxRatio = 1;
  let raf = 0;
  let onScreen = false;
  let lastFrame = -1;
  let scrolled = false;
  const epoch = performance.now();

  const draw = (t: number, frameNo: number) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uPx, pxRatio);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uFrame, frameNo);
    gl.uniform1f(uScroll, window.scrollY);
    gl.uniform2f(uBand, bandTop, bandBottom);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

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
    if (reduceMotion) draw(scene.still, 0);
    else scrolled = true;
  };

  // El bucle mira cada fotograma de la pantalla, pero solo dibuja cuando cambia
  // el fotograma de cine o cuando la página se ha movido.
  const frame = (now: number) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    const t = (now - epoch) / 1000;
    const f = Math.floor(t * FILM_FPS);
    if (f !== lastFrame || scrolled) {
      draw(t, f);
      lastFrame = f;
      scrolled = false;
    }
    raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!reduceMotion && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  if (title) ro.observe(title);
  document.fonts?.ready.then(resize);
  // En movimiento: marca que hay que redibujar el halo en el próximo fotograma.
  // Con movimiento reducido no hay bucle: el fotograma fijo se repinta al hacer
  // scroll, porque el halo se mueve con el titular.
  let stillRaf = 0;
  const onScroll = () => {
    if (!reduceMotion) {
      scrolled = true;
      return;
    }
    if (stillRaf) return;
    stillRaf = requestAnimationFrame(() => {
      stillRaf = 0;
      draw(scene.still, 0);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
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
