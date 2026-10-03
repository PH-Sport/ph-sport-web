import { gsap } from 'gsap';
import { EASE, reflow, reducedMotion } from './ph-text-animations';

/**
 * El índice tipográfico de las áreas de servicio (en la portada y en su página):
 * botón + panel con `aria-expanded` / `aria-controls`, uno abierto cada vez.
 *
 * Sin animar `height`: al abrir, el panel ocupa su sitio de golpe y lo que tenía
 * debajo se desliza a su posición nueva con `transform` (`reflow`, FLIP); el
 * texto aparece con una máscara que baja (320 ms). Al cerrar, el texto se va
 * antes (140 ms) y lo de debajo sube detrás: lo que se va, más rápido que lo que
 * llega. Con movimiento reducido, el cambio es directo.
 *
 * Marcado: cada fila `[data-acc-row]` con su `[data-acc-toggle]` y su
 * `[data-acc-panel]` (con `hidden` cuando está cerrado). Las columnas que entran
 * en cascada desde la izquierda, con `[data-acc-col]`. Sin JS, un `<noscript>` de
 * la sección deja los paneles a la vista.
 */
interface Part {
  row: HTMLElement;
  btn: HTMLButtonElement;
  panel: HTMLElement;
  closing?: gsap.core.Tween;
}

export function initAccordion(root: HTMLElement): void {
  if (root.dataset.accReady) return;
  root.dataset.accReady = '1';

  const parts: Part[] = [];
  root.querySelectorAll<HTMLElement>('[data-acc-row]').forEach((row) => {
    const btn = row.querySelector<HTMLButtonElement>('[data-acc-toggle]');
    const panel = row.querySelector<HTMLElement>('[data-acc-panel]');
    if (btn && panel) parts.push({ row, btn, panel });
  });

  const isOpen = (p: Part) => p.btn.getAttribute('aria-expanded') === 'true';
  const inner = (p: Part) => (p.panel.firstElementChild as HTMLElement | null) ?? p.panel;

  const setState = (p: Part, open: boolean) => {
    p.closing?.kill();
    p.closing = undefined;
    gsap.set(inner(p), { clearProps: 'clipPath,opacity' });
    p.btn.setAttribute('aria-expanded', String(open));
    p.row.classList.toggle('is-open', open);
    p.panel.hidden = !open;
  };

  const reveal = (p: Part) => {
    gsap.fromTo(
      inner(p),
      { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 },
      { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.32, ease: EASE.out, clearProps: 'clipPath,opacity' },
    );
    const cols = p.panel.querySelectorAll<HTMLElement>('[data-acc-col]');
    if (cols.length) {
      gsap.fromTo(
        cols,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: EASE.emph, stagger: 0.06, delay: 0.06, clearProps: 'clipPath' },
      );
    }
  };

  const close = (p: Part) => {
    if (reducedMotion()) {
      setState(p, false);
      return;
    }
    p.btn.setAttribute('aria-expanded', 'false');
    p.row.classList.remove('is-open');
    p.closing = gsap.to(inner(p), {
      clipPath: 'inset(0% 0% 100% 0%)',
      opacity: 0,
      duration: 0.14,
      ease: EASE.in,
      onComplete: () => {
        p.closing = undefined;
        if (isOpen(p)) return;
        reflow(p.row, () => setState(p, false), 0.24);
      },
    });
  };

  parts.forEach((p) => {
    p.btn.addEventListener('click', () => {
      if (isOpen(p)) {
        close(p);
        return;
      }
      const others = parts.filter((o) => o !== p && (isOpen(o) || o.closing));
      if (reducedMotion()) {
        others.forEach((o) => setState(o, false));
        setState(p, true);
        return;
      }
      // El ancla del reflujo es la fila más alta que cambia: todo lo que va
      // detrás (incluida la fila que se abre, si la que se cierra está encima) se
      // desliza a su sitio.
      const anchor = [p, ...others]
        .map((o) => o.row)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))[0];
      reflow(anchor, () => {
        others.forEach((o) => setState(o, false));
        setState(p, true);
      });
      reveal(p);
    });
  });
}
