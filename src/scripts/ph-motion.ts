/**
 * Lenguaje de movimiento «Marcador» — el núcleo ligero, sin GSAP.
 *
 * La web se mueve como el marcador de un estadio de noche: los datos caen en
 * paletas hasta su valor, los titulares entran rodando en su ranura, las líneas
 * del tablero se dibujan y una sola luz dorada viaja en la diagonal del logo
 * (hacia arriba a la derecha). Por qué así y qué se descartó: DECISIONS.md
 * (2026-10-02). Cómo encaja con el resto: ARCHITECTURE.md, «Sistema de
 * animaciones».
 *
 * Este módulo no importa GSAP a propósito: lo cargan también la cabecera y el
 * pie, que están en todas las páginas, incluidas las legales, que no cargan
 * GSAP. Lo que rueda con GSAP (titulares, cascadas de cabecera) vive en
 * `ph-text-animations.ts`.
 *
 * Reglas:
 * - El estado de reposo es el visible. Lo que espera a entrar en pantalla solo se
 *   esconde con `html.ph-anim`, y `global.css` lo destapa a los 2,5 s si este
 *   módulo no llega a correr (`html.ph-motion`).
 * - Con `prefers-reduced-motion` no cae ni se dibuja nada: todo aparece en su
 *   sitio. Se mantienen los cambios de color que confirman un gesto.
 * - Solo `transform` y `opacity` en lo que se mueve; el destello (el fondo de un
 *   texto corto, un segundo) es la única excepción.
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
// `is-inview` (el CSS hace el resto) y, si lleva paletas o letras que cambian,
// se arrancan aquí.
let inViewObserver: IntersectionObserver | null = null;

function onEnter(el: HTMLElement): void {
  el.classList.add('is-inview');
  // Las fotos que se revelan dentro de una pieza (la ficha de un talento, un
  // pilar) entran con ella.
  el.querySelectorAll<HTMLElement>('.ph-develop').forEach((d) => d.classList.add('is-inview'));
  if (el.hasAttribute('data-flap')) runFlap(el);
  el.querySelectorAll<HTMLElement>('[data-flap]').forEach((f) => runFlap(f));
  if (el.hasAttribute('data-cycle')) cycleText(el);
  el.querySelectorAll<HTMLElement>('[data-cycle]').forEach((c) => cycleText(c));
}

/**
 * Vigila lo que espera a entrar en pantalla dentro de `root`: todo `[data-inview]`
 * y las paletas y letras que cambian que vayan sueltas. Idempotente: se puede
 * llamar en cada `astro:page-load` y desde varias secciones.
 */
export function watchInView(root: ParentNode = document): void {
  const targets = new Set<HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-inview]:not(.is-inview)').forEach((el) => targets.add(el));
  root.querySelectorAll<HTMLElement>('[data-flap], [data-cycle]').forEach((el) => {
    if (!el.closest('[data-inview]')) targets.add(el);
  });

  if (prefersReducedMotion()) {
    targets.forEach((el) => {
      el.classList.add('is-inview');
      el.querySelectorAll<HTMLElement>('.ph-develop').forEach((d) => d.classList.add('is-inview'));
      if (el.matches('.ph-flap')) el.classList.add('is-flapped');
      el.querySelectorAll<HTMLElement>('.ph-flap').forEach((f) => f.classList.add('is-flapped'));
    });
    return;
  }

  inViewObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        inViewObserver?.unobserve(entry.target);
        onEnter(entry.target as HTMLElement);
      }
    },
    // Un poco antes del borde de abajo: la pieza ya se está leyendo cuando arranca.
    { rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => inViewObserver!.observe(el));
}

/**
 * Escalona una lista para las cascadas de CSS: `--i` (posición) y
 * `--ph-seam-delay` (retardo de su línea). La regla de CSS decide qué hace con
 * ellos.
 */
export function cascade(items: Iterable<HTMLElement>, stepMs = 60, startMs = 0): void {
  let i = 0;
  for (const el of items) {
    el.style.setProperty('--i', String(i));
    el.style.setProperty('--ph-seam-delay', `${startMs + i * stepMs}ms`);
    i++;
  }
}

// ── Paletas ───────────────────────────────────────────────────────────────────
const DIGITS = '0123456789';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/** Cada caída dura esto: media para la cara de arriba, media para la de abajo. */
const FLAP_STEP_MS = 72;
/** Una paleta nunca pasa por más caras que estas, para que no se haga larga. */
const FLAP_MAX_FACES = 6;
/** Retardo entre una paleta y la siguiente del mismo número. */
const FLAP_STAGGER_MS = 64;

/** Las caras por las que pasa una paleta hasta su carácter: en blanco y después,
 *  en orden, los anteriores al destino, como un marcador de verdad. */
function flapSequence(target: string): string[] {
  const upper = target.toUpperCase();
  const set = DIGITS.includes(upper) ? DIGITS : LETTERS.includes(upper) ? LETTERS : '';
  const idx = set ? set.indexOf(upper) : -1;
  if (idx < 0) return [' ', target];
  const before = Math.min(idx, FLAP_MAX_FACES - 2);
  return [' ', ...set.slice(idx - before, idx).split(''), target];
}

function half(position: 'top' | 'bottom', leaf: boolean, ch: string): HTMLSpanElement {
  const el = document.createElement('span');
  el.className = `ph-flap__half ph-flap__half--${position}${leaf ? ' ph-flap__leaf' : ''}`;
  const inner = document.createElement('span');
  inner.textContent = ch;
  el.append(inner);
  return el;
}

function setFace(el: HTMLElement, ch: string): void {
  (el.firstChild as HTMLElement).textContent = ch;
}

/** Hace caer una paleta por su secuencia. Resuelve al terminar. */
function flipCell(cell: HTMLElement, seq: string[]): Promise<void> {
  return new Promise((resolve) => {
    const finish = (layers: HTMLElement[]) => {
      // Primero se destapa el carácter de verdad y en el mismo paso se quitan las
      // capas: sin fotograma en blanco entre una cosa y otra.
      cell.classList.add('is-set');
      layers.forEach((l) => l.remove());
      resolve();
    };
    if (seq.length < 2) { finish([]); return; }

    const top = half('top', false, seq[0]);
    const bottom = half('bottom', false, seq[0]);
    const leafTop = half('top', true, seq[0]);
    const leafBottom = half('bottom', true, seq[0]);
    const layers = [top, bottom, leafTop, leafBottom];
    cell.append(...layers);

    const halfMs = FLAP_STEP_MS / 2;
    let i = 0;
    const step = (): void => {
      if (i >= seq.length - 1 || !cell.isConnected) { finish(layers); return; }
      const cur = seq[i];
      const next = seq[i + 1];
      setFace(top, next);
      setFace(bottom, cur);
      setFace(leafTop, cur);
      setFace(leafBottom, next);
      // La cara de arriba cae con gravedad (acelera) y se oscurece al girar; la de
      // abajo llega y frena contra el tope.
      const fall = leafTop.animate(
        [
          { transform: 'rotateX(0deg)', backgroundColor: '#1d2025' },
          { transform: 'rotateX(-90deg)', backgroundColor: '#0f1114' },
        ],
        { duration: halfMs, easing: 'cubic-bezier(0.55, 0, 1, 0.45)', fill: 'forwards' },
      );
      fall.onfinish = () => {
        const land = leafBottom.animate(
          [
            { transform: 'rotateX(90deg)', backgroundColor: '#262a31' },
            { transform: 'rotateX(0deg)', backgroundColor: '#15171b' },
          ],
          { duration: halfMs, easing: 'cubic-bezier(0, 0.55, 0.45, 1)', fill: 'forwards' },
        );
        land.onfinish = () => {
          setFace(bottom, next);
          setFace(leafTop, next);
          fall.cancel();
          land.cancel();
          i++;
          step();
        };
      };
    };
    step();
  });
}

/**
 * Hace caer las paletas de un `.ph-flap` hasta su valor, de izquierda a derecha.
 * El valor es el que trae el HTML. Una vez por elemento.
 */
export function runFlap(group: HTMLElement): void {
  if (group.dataset.flapRun) return;
  group.dataset.flapRun = '1';
  const cells = Array.from(group.querySelectorAll<HTMLElement>('.ph-flap__cell'));
  if (prefersReducedMotion() || cells.length === 0) {
    group.classList.add('is-flapped');
    return;
  }
  const delay = Number(group.dataset.flapDelay ?? 0);
  // Una paleta con su propia secuencia (`data-flap-seq`, caras separadas por
  // «|»): los números romanos cuentan I, II, III… en una sola ficha.
  const customSeq = group.dataset.flapSeq?.split('|');
  const jobs = cells.map((cell, idx) => {
    const target = cell.querySelector('.ph-flap__char')?.textContent ?? '';
    const seq = customSeq ? [' ', ...customSeq.filter(Boolean)] : flapSequence(target);
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        void flipCell(cell, seq).then(resolve);
      }, delay + idx * FLAP_STAGGER_MS);
    });
  });
  void Promise.all(jobs).then(() => group.classList.add('is-flapped'));
}

// ── Letras que cambian (tablero de salidas) ───────────────────────────────────
const CYCLE_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CYCLE_STEP_MS = 42;
const CYCLE_TURNS = 4;

/**
 * Las letras de un texto corto en mayúsculas pasan, de izquierda a derecha, por
 * las anteriores del abecedario hasta la suya, a saltos, como un tablero de
 * salidas. Mientras cambian, la caja se queda con el ancho del texto final: la
 * letra es proporcional y, si no, empujaría lo que tiene al lado. Una vez.
 */
export function cycleText(el: HTMLElement): void {
  if (el.dataset.cycleRun) return;
  el.dataset.cycleRun = '1';
  const final = el.textContent ?? '';
  if (prefersReducedMotion() || !final.trim()) return;
  const width = el.getBoundingClientRect().width;
  el.style.display = 'inline-block';
  el.style.width = `${width}px`;
  el.style.whiteSpace = 'nowrap';
  const release = () => {
    el.style.removeProperty('display');
    el.style.removeProperty('width');
    el.style.removeProperty('white-space');
  };
  const chars = [...final];
  let frame = 0;
  const timer = window.setInterval(() => {
    frame++;
    let out = '';
    let done = true;
    chars.forEach((c, i) => {
      const idx = CYCLE_SET.indexOf(c.toUpperCase());
      const landAt = i + CYCLE_TURNS;
      if (idx < 0 || frame >= landAt) {
        out += c;
      } else if (frame <= i) {
        out += ' ';
        done = false;
      } else {
        const back = landAt - frame;
        out += CYCLE_SET[(idx - back + CYCLE_SET.length) % CYCLE_SET.length];
        done = false;
      }
    });
    el.textContent = out;
    if (done || !el.isConnected) {
      window.clearInterval(timer);
      el.textContent = final;
      release();
    }
  }, CYCLE_STEP_MS);
}

// ── Destello ──────────────────────────────────────────────────────────────────
/**
 * Una luz cruza el texto una vez, en la diagonal del logo (`.ph-glint` en
 * global.css). Si el texto ya está partido en palabras (`wrapWords`), cada palabra
 * recibe la luz cuando le llega, según su posición: se lee como una sola pasada.
 */
export function glint(el: HTMLElement, delayMs = 0): void {
  if (prefersReducedMotion()) return;
  const words = Array.from(el.querySelectorAll<HTMLElement>('.ph-clip-inner'));
  const targets = words.length ? words : [el];
  const left0 = el.getBoundingClientRect().left;
  targets.forEach((w) => {
    const dx = w.getBoundingClientRect().left - left0;
    w.style.setProperty('--ph-glint-delay', `${Math.round(delayMs + dx * 0.7)}ms`);
    w.classList.remove('ph-glint');
    void w.offsetWidth;
    w.classList.add('ph-glint');
    const end = (e: AnimationEvent) => {
      // `animationend` burbujea: solo cuenta el de este elemento.
      if (e.target !== w || e.animationName !== 'ph-glint') return;
      w.classList.remove('ph-glint');
      w.removeEventListener('animationend', end);
    };
    w.addEventListener('animationend', end);
  });
}

// ── Navegación ────────────────────────────────────────────────────────────────
document.addEventListener('astro:before-swap', (e) => {
  inViewObserver?.disconnect();
  inViewObserver = null;
  const newDoc = (e as { newDocument?: Document }).newDocument;
  if (!newDoc) return;
  newDoc.documentElement.classList.add('ph-motion');
  // La luz que cruza al cambiar de página (`.ph-stinger` en global.css). Se
  // arranca en el documento entrante para que ya esté corriendo cuando la View
  // Transition lo fotografía en vivo.
  if (!prefersReducedMotion()) {
    const back = document.documentElement.getAttribute('data-astro-transition') === 'back';
    const stinger = newDoc.querySelector<HTMLElement>('[data-stinger]');
    stinger?.classList.add('is-running');
    stinger?.classList.toggle('is-back', back);
  }
});

document.addEventListener('astro:page-load', () => {
  const stinger = document.querySelector<HTMLElement>('[data-stinger]');
  if (stinger?.classList.contains('is-running')) {
    const done = (e: AnimationEvent) => {
      if (e.target !== stinger) return;
      stinger.classList.remove('is-running', 'is-back');
      stinger.removeEventListener('animationend', done);
    };
    stinger.addEventListener('animationend', done);
  }
  // Cabecera y pie (en todas las páginas) y lo que no monte su propia sección.
  watchInView(document);
});
