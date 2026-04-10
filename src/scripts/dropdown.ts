import { gsap } from 'gsap';
import { reducedMotion } from '@/scripts/ph-text-animations';

export interface DropdownHandle {
  close(): void;
  open(): void;
  toggle(): void;
}

/* ── Registro global: al abrir uno se cierran los demás ── */
const activeDropdowns = new Set<DropdownHandle>();

function closeAllExcept(keep?: DropdownHandle): void {
  activeDropdowns.forEach((dd) => {
    if (dd !== keep) dd.close();
  });
}

export function createDropdown(
  root: HTMLElement,
  trigger: HTMLButtonElement,
  panel: HTMLElement,
): DropdownHandle {
  /* ── Mejoras tactiles universales ── */
  trigger.style.touchAction = 'manipulation';
  trigger.style.webkitTapHighlightColor = 'transparent';

  function close(): void {
    if (panel.hidden) return;

    activeDropdowns.delete(handle);

    if (reducedMotion()) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      return;
    }

    gsap.killTweensOf(panel);
    gsap.to(panel, {
      opacity: 0,
      y: -6,
      duration: 0.16,
      ease: 'power2.in',
      onComplete: () => {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        gsap.set(panel, { clearProps: 'all' });
      },
    });
  }

  function open(): void {
    if (!panel.hidden) return;

    /* Cerrar cualquier otro dropdown abierto primero */
    closeAllExcept(handle);

    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    activeDropdowns.add(handle);

    if (reducedMotion()) return;

    gsap.killTweensOf(panel);
    gsap.fromTo(
      panel,
      { opacity: 0, y: -8, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.22,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(panel, { clearProps: 'opacity,transform' });
        },
      },
    );
  }

  function toggle(): void {
    if (panel.hidden) open();
    else close();
  }

  const handle: DropdownHandle = { close, open, toggle };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (!root.contains(t) && !panel.hidden) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      close();
      trigger.focus();
    }
  });

  return handle;
}
