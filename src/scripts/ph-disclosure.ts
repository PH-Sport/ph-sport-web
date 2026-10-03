/**
 * Acordeones que se abren sin animar alturas.
 *
 * Animar `height` obliga a recalcular la maquetación en cada fotograma; aquí no
 * se hace. El panel se abre de golpe en la maquetación y se anima lo que se ve:
 * - lo que queda debajo (las filas siguientes, el resto del bloque, los bloques
 *   de después y el pie) vuelve a su sitio con `transform` desde donde estaba
 *   (la técnica FLIP: se mide antes y después, y se anima la diferencia);
 * - el panel que se abre se descubre de arriba abajo con `clip-path`;
 * - el panel que se cierra deja un «fantasma» (una copia quieta, sin ids) que se
 *   recoge hacia arriba mientras lo de debajo sube, y luego desaparece.
 * Abrir tarda 300 ms y cerrar 220: lo que se va, más rápido que lo que llega.
 * Con movimiento reducido, el cambio es directo.
 *
 * Lo usan el diagrama de servicios de la portada (en el móvil) y las áreas de
 * /servicios. Cada uno dice cómo se abre y se cierra su panel (`set`).
 */

export interface Disclosure {
  /** La fila entera (lleva `position: relative` para alojar el fantasma). */
  item: HTMLElement;
  /** Lo que aparece y desaparece. */
  panel: HTMLElement;
  isOpen(): boolean;
  /** Abre o cierra en la maquetación, sin animar (clases, atributos ARIA…). */
  set(open: boolean): void;
}

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN = 'cubic-bezier(0.3, 0, 0.8, 0.15)';
const OPEN_MS = 300;
const CLOSE_MS = 220;

const running = new Set<Animation>();

function reduced(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Todo lo que va detrás de `el` en la página: sus hermanos siguientes, los de
 *  cada antepasado hasta <main> y el pie. */
function flowAfter(el: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  let node: HTMLElement | null = el;
  while (node && node.tagName !== 'MAIN' && node !== document.body) {
    let sib = node.nextElementSibling as HTMLElement | null;
    while (sib) {
      if (getComputedStyle(sib).position !== 'fixed') out.push(sib);
      sib = sib.nextElementSibling as HTMLElement | null;
    }
    node = node.parentElement;
  }
  const footer = document.querySelector<HTMLElement>('body > footer, footer.footer');
  if (footer && !out.includes(footer)) out.push(footer);
  return out;
}

function settle(): void {
  running.forEach((a) => a.finish());
  running.clear();
}

function track(a: Animation): Animation {
  running.add(a);
  a.addEventListener('finish', () => running.delete(a));
  a.addEventListener('cancel', () => running.delete(a));
  return a;
}

function ghostOf(d: Disclosure): HTMLElement | null {
  const rect = d.panel.getBoundingClientRect();
  if (rect.height < 1) return null;
  const itemRect = d.item.getBoundingClientRect();
  const ghost = d.panel.cloneNode(true) as HTMLElement;
  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  Object.assign(ghost.style, {
    position: 'absolute',
    left: `${rect.left - itemRect.left}px`,
    top: `${rect.top - itemRect.top}px`,
    width: `${rect.width}px`,
    margin: '0',
    pointerEvents: 'none',
    display: 'block',
  });
  ghost.classList.add('is-ghost');
  return ghost;
}

/**
 * Abre (o cierra) `target` dentro de su grupo. Si el grupo es exclusivo, quien
 * llame a `set(true)` se encarga de cerrar los demás; aquí solo se anima.
 */
export function toggleDisclosure(group: Disclosure[], target: Disclosure, open: boolean): void {
  settle();
  if (reduced()) {
    target.set(open);
    return;
  }

  const closing = open ? group.filter((d) => d !== target && d.isOpen()) : [target];
  const affected = open ? [target, ...closing] : closing;
  // Lo de debajo de la primera fila que cambia: ahí empieza a moverse todo.
  const first = affected.reduce((a, b) =>
    a.item.compareDocumentPosition(b.item) & Node.DOCUMENT_POSITION_FOLLOWING ? a : b,
  );
  const followers = flowAfter(first.item);
  const before = followers.map((f) => f.getBoundingClientRect().top);

  const ghosts = closing
    .map((d) => {
      const g = ghostOf(d);
      if (g) d.item.append(g);
      return g;
    })
    .filter((g): g is HTMLElement => !!g);

  target.set(open);

  const vh = window.innerHeight;
  followers.forEach((f, i) => {
    const now = f.getBoundingClientRect();
    const dy = before[i] - now.top;
    if (Math.abs(dy) < 0.5) return;
    // Lo que no se va a ver ni antes ni después, salta sin animar.
    if (Math.min(before[i], now.top) > vh + 120 || Math.max(before[i], now.top) + now.height < -120) return;
    track(
      f.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
        duration: open ? OPEN_MS : CLOSE_MS,
        easing: EASE_OUT,
      }),
    );
  });

  if (open) {
    track(
      target.panel.animate(
        [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }],
        { duration: OPEN_MS, easing: EASE_OUT },
      ),
    );
  }

  ghosts.forEach((g) => {
    const a = track(
      g.animate(
        [
          { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
          { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
        ],
        { duration: CLOSE_MS, easing: EASE_IN, fill: 'forwards' },
      ),
    );
    const remove = () => g.remove();
    a.addEventListener('finish', remove);
    a.addEventListener('cancel', remove);
  });
}
