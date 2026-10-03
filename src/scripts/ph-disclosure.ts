/**
 * Acordeones sin animar alturas.
 *
 * Abrir o cerrar un panel cambia el alto de la página, y animar `height` hace
 * recalcular el layout en cada fotograma. Aquí el panel cambia de alto de una
 * vez, en el layout, y lo que se ve se anima solo con `transform` y `clip-path`:
 * - el panel se descubre (o se recoge) de arriba abajo con un recorte;
 * - lo que cambia de sitio por culpa del panel —las filas siguientes, el resto
 *   de la sección, las secciones de después y el pie— se desliza a la vez con
 *   `translateY` (FLIP), así que nada salta.
 *
 * Qué se mueve no se adivina por el orden del DOM: se mide. Antes del cambio,
 * con el estado final y con el intermedio (el que se pinta mientras dura: los que
 * se abren ya abiertos y los que se cierran todavía abiertos). Así una pieza que
 * va detrás en el DOM pero al lado en pantalla (la placa llave de la portada, en
 * la columna de la izquierda) no se mueve.
 *
 * Varios cambios a la vez (abrir una fila cierra la que estaba abierta) se
 * animan juntos, con un solo avance.
 *
 * Lo usan el tablero de servicios de la portada (`<details>`) y las áreas de
 * Servicios (botón + región). Cada uno dice qué es «abierto» con `setOpen`.
 */
import { gsap } from 'gsap';
import { EASE, scheduleScrollTriggerRefresh, reducedMotion } from './ph-text-animations';

export interface DisclosureChange {
  /** El panel que cambia de alto. */
  panel: HTMLElement;
  /** Hacia dónde va. */
  open: boolean;
  /** Pone el estado de layout (el `open` de `<details>`, el `hidden` del panel).
   *  Se llama varias veces para medir: no debe tener otros efectos. */
  setOpen: (open: boolean) => void;
  /** Lo que tiene que pasar una vez al empezar a abrirse (la cascada de su
   *  contenido). */
  onOpen?: () => void;
}

/** Abrir tarda más que cerrar: lo que llega se presenta, lo que se va no espera. */
const OPEN_S = 0.32;
const CLOSE_S = 0.22;

/** Lo que puede cambiar de sitio: los hermanos siguientes de `el` y los de cada
 *  antepasado hasta <body>. Lo fijo a la pantalla no se mueve con la página. */
function candidates(el: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  let node: Element | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    let sib = node.nextElementSibling;
    while (sib) {
      if (sib instanceof HTMLElement && !/^(SCRIPT|STYLE|TEMPLATE)$/.test(sib.tagName)) {
        const pos = getComputedStyle(sib).position;
        if (pos !== 'fixed' && pos !== 'sticky') out.push(sib);
      }
      sib = sib.nextElementSibling;
    }
    node = node.parentElement;
  }
  return out;
}

const tops = (els: HTMLElement[]): number[] => els.map((el) => el.getBoundingClientRect().top);

let running: { finish: () => void } | null = null;

export function animateDisclosures(changes: DisclosureChange[]): void {
  // Una animación a medias se termina de golpe antes de empezar la siguiente.
  running?.finish();
  if (!changes.length) return;

  if (reducedMotion()) {
    // Sin desplazamientos: el panel aparece con un fundido corto; al cerrar, se va.
    changes.forEach(({ panel, open, setOpen, onOpen }) => {
      setOpen(open);
      if (open) {
        onOpen?.();
        gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none', clearProps: 'opacity' });
      }
    });
    scheduleScrollTriggerRefresh();
    return;
  }

  const els = Array.from(new Set(changes.flatMap((c) => candidates(c.panel))));
  // Antes, después y mientras: tres medidas en el mismo fotograma, sin pintar
  // entre ellas.
  const before = tops(els);
  changes.forEach((c) => c.setOpen(c.open));
  const after = tops(els);
  changes.forEach((c) => {
    if (!c.open) c.setOpen(true);
  });
  const mid = tops(els);

  const moving = els
    .map((el, i) => ({ el, from: before[i] - mid[i], to: after[i] - mid[i] }))
    .filter((m) => Math.abs(m.from) > 0.5 || Math.abs(m.to) > 0.5);
  // Mientras dura, lo que se mueve no anima su `transform` por CSS: si una pieza
  // tiene transición de entrada, suavizaría cada fotograma y se quedaría atrás.
  moving.forEach((m) => m.el.style.setProperty('transition', 'none'));

  const state = { p: 0 };
  const apply = () => {
    const p = state.p;
    for (const m of moving) {
      const y = m.from + (m.to - m.from) * p;
      m.el.style.transform = Math.abs(y) > 0.01 ? `translate3d(0, ${y.toFixed(2)}px, 0)` : '';
    }
    for (const c of changes) {
      const hidden = c.open ? 1 - p : p;
      c.panel.style.clipPath = `inset(0 0 ${(hidden * 100).toFixed(3)}% 0)`;
    }
  };

  let done = false;
  let tween: gsap.core.Tween | null = null;
  const finish = () => {
    if (done) return;
    done = true;
    tween?.kill();
    // Todo en el mismo fotograma: el panel que se cierra sale del layout justo
    // cuando lo de debajo ya está donde le toca.
    changes.forEach((c) => {
      if (!c.open) c.setOpen(false);
      c.panel.style.removeProperty('clip-path');
    });
    moving.forEach((m) => m.el.style.removeProperty('transform'));
    // Primero se asienta el sitio sin transición y después se devuelve la suya:
    // en el mismo cálculo de estilos, la transición animaría la vuelta.
    void document.body.offsetHeight;
    moving.forEach((m) => m.el.style.removeProperty('transition'));
    running = null;
    scheduleScrollTriggerRefresh();
  };

  apply();
  changes.forEach((c) => {
    if (c.open) c.onOpen?.();
  });
  const opening = changes.some((c) => c.open);
  tween = gsap.to(state, {
    p: 1,
    duration: opening ? OPEN_S : CLOSE_S,
    ease: opening ? EASE.out : EASE.in,
    onUpdate: apply,
    onComplete: finish,
  });
  running = { finish };
}

// Al navegar, nada a medias.
document.addEventListener('astro:before-swap', () => running?.finish());
