/**
 * Muestrario de fondos animados (`/fondos`, rama `feat/muestrario-fondos`, sin
 * fusionar): cada fondo de la web a pantalla completa, sin contenido encima, con
 * una barra para cambiar de uno a otro. Sirve para elegirlos, no es una página de
 * la web.
 *
 * - Los cinco de la web salen de `ph-ambient.ts` tal cual (mismos shaders); los
 *   dos de las variantes B y C, de `ph-fondos-extra.ts`.
 * - La luz va entera en toda la pantalla: aquí no hay menú bajo el que apagarla
 *   ni textos que proteger (en la web, `stageMask` la apaga bajo el menú y, en las
 *   páginas interiores, la baja a un tercio fuera del titular).
 * - Un solo contexto de WebGL para todos: cada fondo es un programa que se compila
 *   la primera vez que se elige y se reutiliza después.
 * - En ordenador, la luz reacciona al ratón como en la web (los fondos que lo
 *   hacen). Con `prefers-reduced-motion`, un fotograma fijo, como en la web.
 * - Barra: clic, flechas ← →, números 1-7 y `H` para esconderla del todo. Se
 *   esconde sola si no se mueve el ratón; en el móvil, un toque la saca o la quita.
 *   `?fondo=<nombre>` abre uno concreto y se actualiza al cambiar.
 */
import { VS, SCENES } from './ph-ambient';
import { PROYECCION, ESTRUCTURA_C } from './ph-fondos-extra';

type FondoId = 'velo' | 'neon' | 'trayectorias' | 'estructura' | 'calidez' | 'proyeccion' | 'estructura-c';

interface Fondo {
  fs: string;
  /** Resolución interna respecto a los px CSS, como en la web. */
  scale: number;
  /** Segundo que se pinta con movimiento reducido. */
  still: number;
  /** Proyección: el grano va a 24 fps y el halo necesita un «titular». */
  film?: boolean;
  /** Estructura de la C: enciende la cuadrícula de CSS. */
  grid?: boolean;
}

/** Sin el apagado bajo el menú ni la regla del tercio: la luz, entera. */
function pure(fs: string): string {
  const out = fs.replace(
    /float stageMask\(vec2 p, float W, float H\) \{[\s\S]*?\n\}/,
    'float stageMask(vec2 p, float W, float H) { return 1.0; }',
  );
  if (out === fs) console.warn('[fondos] no se encontró stageMask en un shader');
  return out;
}

const FONDOS: Record<FondoId, Fondo> = {
  velo: { ...SCENES.velo, fs: pure(SCENES.velo.fs) },
  neon: { ...SCENES.neon, fs: pure(SCENES.neon.fs) },
  trayectorias: { ...SCENES.trayectorias, fs: pure(SCENES.trayectorias.fs) },
  estructura: { ...SCENES.estructura, fs: pure(SCENES.estructura.fs) },
  calidez: { ...SCENES.calidez, fs: pure(SCENES.calidez.fs) },
  proyeccion: { fs: PROYECCION, scale: 1, still: 6, film: true },
  'estructura-c': { fs: pure(ESTRUCTURA_C), scale: 1, still: 9, grid: true },
};

const ORDER = Object.keys(FONDOS) as FondoId[];
const MAX_DPR = 1.5;
/** Segundos sin mover el ratón hasta que la barra se esconde sola. */
const IDLE_S = 2.5;

interface Program {
  prog: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
}

function isFondo(v: string | null): v is FondoId {
  return v !== null && v in FONDOS;
}

function init(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-fondos-canvas]');
  const grid = document.querySelector<HTMLElement>('[data-fondos-grid]');
  const bar = document.querySelector<HTMLElement>('[data-fondos-bar]');
  if (!canvas || !grid || !bar) return;
  const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-fondo]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
  if (!gl) {
    document.documentElement.classList.add('fondos--sin-webgl');
    return;
  }
  gl.bindVertexArray(gl.createVertexArray());

  const compile = (type: number, src: string): WebGLShader | null => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[fondos]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VS);
  const programs = new Map<FondoId, Program | null>();
  const program = (id: FondoId): Program | null => {
    if (programs.has(id)) return programs.get(id) ?? null;
    const fs = compile(gl.FRAGMENT_SHADER, FONDOS[id].fs);
    const prog = gl.createProgram();
    let out: Program | null = null;
    if (vs && fs && prog) {
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const u: Program['u'] = {};
        for (const n of ['uRes', 'uPx', 'uTime', 'uScroll', 'uBand', 'uMouse', 'uFrame', 'uGrid']) {
          u[n] = gl.getUniformLocation(prog, n);
        }
        out = { prog, u };
      }
    }
    programs.set(id, out);
    return out;
  };

  // Ratón (solo con puntero fino), con el mismo muelle que en la web.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, z: 0, tz: 0 };
  const stepMouse = (dt: number) => {
    const w = 9;
    mouse.vx += (w * w * (mouse.tx - mouse.x) - 2 * w * mouse.vx) * dt;
    mouse.vy += (w * w * (mouse.ty - mouse.y) - 2 * w * mouse.vy) * dt;
    mouse.x += mouse.vx * dt;
    mouse.y += mouse.vy * dt;
    mouse.z += (mouse.tz - mouse.z) * (1 - Math.exp(-dt * 4));
  };

  let current: FondoId = 'velo';
  let pxRatio = 1;
  let gridStep = 48;
  let gridOffset = 0;
  const epoch = performance.now();
  let last = epoch;
  let raf = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    pxRatio = Math.min(window.devicePixelRatio || 1, MAX_DPR) * FONDOS[current].scale;
    const w = Math.max(1, Math.round(rect.width * pxRatio));
    const h = Math.max(1, Math.round(rect.height * pxRatio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const cs = getComputedStyle(grid);
    gridStep = parseFloat(cs.backgroundSize) || (window.innerWidth >= 900 ? 64 : 48);
    gridOffset = parseFloat(cs.backgroundPositionX) || 0;
  };

  const draw = (t: number) => {
    const p = program(current);
    if (!p) return;
    const f = FONDOS[current];
    const H = canvas.clientHeight;
    gl.useProgram(p.prog);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(p.u.uRes, canvas.width, canvas.height);
    gl.uniform1f(p.u.uPx, pxRatio);
    gl.uniform1f(p.u.uTime, t);
    gl.uniform1f(p.u.uScroll, 0);
    if (f.film) {
      // Un «titular» imaginario arriba a la izquierda, donde lo tiene la web.
      gl.uniform2f(p.u.uBand, H * 0.3, H * 0.42);
      gl.uniform1f(p.u.uFrame, Math.floor(t * 24));
    } else {
      gl.uniform3f(p.u.uBand, 0, 0, 1);
    }
    if (f.grid) gl.uniform2f(p.u.uGrid, gridStep, gridOffset);
    const mx = reduceMotion ? mouse.tx : mouse.x;
    const my = reduceMotion ? mouse.ty : mouse.y;
    gl.uniform3f(p.u.uMouse, mx, H - my, reduceMotion ? mouse.tz : mouse.z);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const drawStill = () => draw(FONDOS[current].still);

  const frame = (now: number) => {
    raf = 0;
    if (document.hidden) return;
    stepMouse(Math.min(0.05, (now - last) / 1000));
    last = now;
    draw((now - epoch) / 1000);
    raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (reduceMotion) {
      drawStill();
      return;
    }
    if (!raf && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const select = (id: FondoId, focus = false) => {
    current = id;
    grid.hidden = !FONDOS[id].grid;
    buttons.forEach((b) => {
      const on = b.dataset.fondo === id;
      b.setAttribute('aria-pressed', String(on));
      if (on && focus) b.focus();
    });
    const url = new URL(window.location.href);
    url.searchParams.set('fondo', id);
    history.replaceState(null, '', url);
    document.title = `${buttons.find((b) => b.dataset.fondo === id)?.dataset.nombre ?? id} · Fondos — PHSPORT`;
    resize();
    kick();
  };

  // La barra: se esconde sola sin ratón, y con `H` del todo.
  let idle = 0;
  let pinnedHidden = false;
  const show = () => {
    if (pinnedHidden) return;
    document.documentElement.classList.remove('fondos--quieto');
    window.clearTimeout(idle);
    idle = window.setTimeout(() => {
      // Con el foco del teclado dentro de la barra, se queda a la vista.
      const el = document.activeElement;
      const keyboard = !!el && bar.contains(el) && el.matches(':focus-visible');
      if (!keyboard) document.documentElement.classList.add('fondos--quieto');
    }, IDLE_S * 1000);
  };

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.fondo ?? null;
      if (isFondo(id)) select(id);
    }),
  );

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const i = ORDER.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = ORDER[(i + (e.key === 'ArrowRight' ? 1 : ORDER.length - 1)) % ORDER.length];
      select(next, bar.contains(document.activeElement));
      show();
    } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= ORDER.length) {
      select(ORDER[Number(e.key) - 1]);
      show();
    } else if (e.key === 'h' || e.key === 'H') {
      pinnedHidden = !pinnedHidden;
      document.documentElement.classList.toggle('fondos--quieto', pinnedHidden);
      if (!pinnedHidden) show();
    }
  });

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse') {
        if (mouse.tz === 0 && mouse.z < 0.01) {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        }
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
        mouse.tz = finePointer ? 1 : 0;
        if (reduceMotion) drawStill();
        show();
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    mouse.tz = 0;
  });
  // En táctil, un toque fuera de la barra la saca o la quita.
  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' || bar.contains(e.target as Node)) return;
    const quiet = document.documentElement.classList.toggle('fondos--quieto');
    if (!quiet) window.clearTimeout(idle);
  });
  bar.addEventListener('focusin', () => {
    pinnedHidden = false;
    show();
  });

  new ResizeObserver(() => {
    resize();
    if (reduceMotion) drawStill();
  }).observe(canvas);
  document.addEventListener('visibilitychange', kick);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
  });

  const asked = new URLSearchParams(window.location.search).get('fondo');
  select(isFondo(asked) ? asked : 'velo');
  show();
  document.documentElement.classList.add('fondos--listo');
}

init();
