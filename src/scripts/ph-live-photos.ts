/**
 * Fotos vivas: las fotos de la oficina de los pilares de Servicios y de la
 * ventana de Contacto respiran en reposo y se avivan con el scroll, igual que el
 * fondo animado reacciona al ratón (`ph-ambient.ts`). La foto es real y no se
 * toca: se mueven la cámara —el contenedor `[data-live-cam]`— y la luz que pinta
 * `LivePhoto.astro`. Por qué así y qué se descartó: DECISIONS.md (2026-10-15).
 *
 * - Reposo: la cámara deriva despacio (unas décimas de % en x e y, una décima de
 *   grado de giro y un zoom que respira) y la luz pasea sola. Una foto sin luz
 *   (`camera`) solo tiene la cámara.
 * - Scroll: la posición de la foto en pantalla llega por un muelle crítico, como el
 *   ratón en los fondos, así que no hay saltos aunque la rueda vaya a golpes. La
 *   velocidad del scroll sube una «energía» que aviva la luz y se calma sola al
 *   parar; la cámara se queda un poco atrás y vuelve. Los pilares, además, se
 *   acercan despacio mientras cruzan la pantalla (el empuje de antes).
 * - Solo corre con alguna foto en pantalla y la pestaña visible. Con
 *   `prefers-reduced-motion` no arranca: foto quieta y sin luz.
 * - Se vigila el bloque (`[data-inview]`), no el marco: el marco que espera a
 *   descubrirse está recortado del todo y Chromium no avisa nunca de que entra en
 *   pantalla (docs/trampas-conocidas.md).
 * - Al navegar con el ClientRouter se para y se suelta todo.
 */

const TAU = Math.PI * 2;
const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v: number): number => clamp(v, 0, 1);
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Rigidez del muelle de la posición (1/s). La de los fondos con el ratón es 9;
 *  aquí algo más blanda, porque una foto grande que corre se nota más. */
const SPRING = 6;
/** Velocidad de scroll (px/s) que enciende la energía del todo. */
const FULL_SPEED = 1600;
/** El reflejo de Contacto arranca cuando la foto pasa de este punto de la pantalla. */
const ENTER_AT = 0.62;

/** El scroll, compartido por todas las fotos: su velocidad suavizada y la energía. */
const scroll = { y: 0, v: 0, energy: 0 };

interface Shot {
  block: Element;
  frame: HTMLElement;
  cam: HTMLElement;
  push: boolean;
  seed: number;
  /** Posición de la foto en pantalla (0 = asoma por abajo, 1 = sale por arriba), con muelle. */
  p: number;
  pv: number;
  visible: boolean;
  entered: boolean;
  light: LightControl;
}

interface LightControl {
  frame(t: number, s: Shot): void;
  enter(): void;
}

const setMaskX = (el: HTMLElement, x: number): void => {
  const v = `${x.toFixed(2)}% 0%`;
  el.style.setProperty('-webkit-mask-position', v);
  el.style.setProperty('mask-position', v);
};

/** Brillo: la banda pasea despacio por la pieza en reposo y la recorre, más
 *  brillante, con el scroll. Con `data-live-sweep`, además, un reflejo la cruza
 *  entero cuando la foto entra en pantalla. */
function sheen(live: HTMLElement): LightControl {
  const band = live.querySelector<HTMLElement>('.ph-live__sheen');
  const x0 = Number(live.dataset.liveX ?? 50);
  const seed = Math.random() * TAU;
  const sweeps = live.hasAttribute('data-live-sweep');
  let sweepAt = -1;
  return {
    frame(t, s) {
      if (!band) return;
      let x = x0 - 60 * (s.p - 0.5) + 14 * Math.sin(t * 0.45 + seed);
      let a = 0.3 + 0.1 * Math.sin(t * 0.9 + seed) + 0.6 * scroll.energy;
      if (sweepAt >= 0) {
        const u = clamp01((performance.now() - sweepAt) / 1800);
        const k = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
        const w = Math.sin(Math.PI * u);
        x = lerp(x, lerp(84, 16, k), Math.min(1, w * 1.6));
        a = lerp(a, 1, w);
        if (u >= 1) sweepAt = -1;
      }
      setMaskX(band, clamp(x, 8, 92));
      band.style.opacity = clamp01(a).toFixed(3);
    },
    enter() {
      if (sweeps) sweepAt = performance.now();
    },
  };
}

/** Sol: la zona se calienta mientras la foto cruza la pantalla, como si avanzara la
 *  tarde, y una mancha de luz la cruza; las dos respiran en reposo. */
function sunlit(live: HTMLElement): LightControl {
  const warm = live.querySelector<HTMLElement>('.ph-live__warm');
  const sun = live.querySelector<HTMLElement>('.ph-live__sun');
  const most = Number(live.dataset.liveWarm ?? 0.8);
  return {
    frame(t, s) {
      if (warm) warm.style.opacity = clamp01(0.15 + (most - 0.15) * smooth(0.1, 0.9, s.p) + 0.08 * Math.sin(t * 0.27)).toFixed(3);
      if (sun) {
        const x = lerp(24, -24, s.p) + 5 * Math.sin(t * 0.21);
        sun.style.transform = `translate3d(${x.toFixed(2)}%, ${(2 * Math.sin(t * 0.17)).toFixed(2)}%, 0)`;
        sun.style.opacity = clamp01(0.35 + 0.15 * Math.sin(t * 0.5) + 0.5 * scroll.energy).toFixed(3);
      }
    },
    enter() {},
  };
}

/** Sin luz: la foto solo tiene el movimiento de cámara. */
const NO_LIGHT: LightControl = { frame() {}, enter() {} };

let shots: Shot[] = [];
let observer: IntersectionObserver | null = null;
let raf = 0;
let last = 0;
const epoch = performance.now();

function loop(now: number): void {
  raf = 0;
  if (document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000) || 1 / 60;
  last = now;
  const t = (now - epoch) / 1000;

  const y = window.scrollY;
  scroll.v += ((y - scroll.y) / dt - scroll.v) * (1 - Math.exp(-dt * 10));
  scroll.y = y;
  const target = clamp01(Math.abs(scroll.v) / FULL_SPEED);
  // Sube deprisa y baja despacio: se aviva al hacer scroll y se calma al parar.
  scroll.energy += (target - scroll.energy) * (1 - Math.exp(-dt * (target > scroll.energy ? 6 : 1.6)));

  // Primero se mide todo y luego se escribe, para no forzar el maquetado a cada paso.
  const vh = window.innerHeight;
  const live = shots.filter((s) => s.visible);
  const rects = live.map((s) => s.frame.getBoundingClientRect());
  const lag = clamp(scroll.v * 0.0009, -1.3, 1.3);
  live.forEach((s, i) => {
    const r = rects[i];
    if (!s.entered && r.top < vh * ENTER_AT && r.bottom > 0) {
      s.entered = true;
      s.light.enter();
    }
    const goal = clamp01((vh - r.top) / (vh + r.height));
    s.pv += (SPRING * SPRING * (goal - s.p) - 2 * SPRING * s.pv) * dt;
    s.p += s.pv * dt;

    const ph = s.seed;
    const tx = 0.55 * Math.sin(t * 0.37 + ph) + 0.25 * Math.sin(t * 0.61 + ph * 2.1);
    const ty = 0.45 * Math.sin(t * 0.29 + ph * 1.3) + 0.2 * Math.sin(t * 0.53 + ph * 0.7) + lag;
    const rot = 0.12 * Math.sin(t * 0.23 + ph * 1.9);
    // 1,05 de base: margen para que la deriva nunca enseñe el borde de la foto.
    const scale = 1.05 + (s.push ? 0.04 * s.p : 0) + 0.008 * Math.sin(t * 0.41 + ph) + 0.012 * scroll.energy;
    s.cam.style.transform = `translate3d(${tx.toFixed(3)}%, ${ty.toFixed(3)}%, 0) rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
    s.light.frame(t, s);
  });
  if (live.length) raf = requestAnimationFrame(loop);
}

function kick(): void {
  if (raf || document.hidden || !shots.some((s) => s.visible)) return;
  scroll.y = window.scrollY;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

/**
 * Monta las fotos vivas de `root` (`.ph-live` dentro de un `[data-live-cam]`).
 * Idempotente: cada foto se monta una vez por página.
 */
export function mountLivePhotos(root: ParentNode): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        shots.filter((s) => s.block === e.target).forEach((s) => (s.visible = e.isIntersecting));
      });
      kick();
    },
    { rootMargin: '15% 0px' },
  );
  root.querySelectorAll<HTMLElement>('.ph-live').forEach((live) => {
    if (live.dataset.liveOn) return;
    const cam = live.closest<HTMLElement>('[data-live-cam]');
    if (!cam) return;
    live.dataset.liveOn = '1';
    const shot: Shot = {
      block: live.closest('[data-inview]') ?? cam,
      frame: cam.parentElement ?? cam,
      cam,
      push: cam.hasAttribute('data-live-push'),
      seed: Math.random() * TAU,
      p: 0.5,
      pv: 0,
      visible: false,
      entered: false,
      light: live.dataset.live === 'sunlit' ? sunlit(live) : live.dataset.live === 'sheen' ? sheen(live) : NO_LIGHT,
    };
    shots.push(shot);
    observer!.observe(shot.block);
  });
}

document.addEventListener('visibilitychange', kick);
document.addEventListener('astro:before-swap', () => {
  cancelAnimationFrame(raf);
  raf = 0;
  observer?.disconnect();
  observer = null;
  shots = [];
});
