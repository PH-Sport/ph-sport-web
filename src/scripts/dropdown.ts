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

/**
 * Cierra todos los dropdowns abiertos cuando el usuario toca/clica
 * fuera de cualquier dropdown registrado.
 *
 * Se delega en `document` (igual que Header.astro para el menú móvil)
 * porque iOS Safari siempre despacha eventos al document, incluso cuando
 * falla el hit-testing directo sobre elementos post-animación.
 */
let outsideListenerBound = false;
const dropdownRoots = new Set<HTMLElement>();

function bindOutsideListener(): void {
  if (outsideListenerBound) return;
  outsideListenerBound = true;

  document.addEventListener('pointerdown', (e) => {
    const target = e.target as Node;
    // Si el toque fue dentro de algún dropdown registrado, no hacer nada
    for (const root of dropdownRoots) {
      if (root.contains(target)) return;
    }
    // Toque fuera → cerrar todos
    closeAllExcept();
  });
}

export function createDropdown(
  root: HTMLElement,
  trigger: HTMLButtonElement,
  panel: HTMLElement,
): DropdownHandle {
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

  /**
   * Usamos `pointerup` en vez de `click` para el toggle.
   *
   * Motivo: iOS Safari puede ignorar el primer `click` en botones
   * cuyos contenedores fueron animados (GSAP, ViewTransitions…)
   * o que tengan pseudo-elementos `::before` posicionados.
   *
   * `pointerup` se dispara de forma fiable en TODOS los navegadores
   * y dispositivos (touch + mouse), inmediatamente al levantar el dedo.
   * Además, NO se dispara si el usuario hace scroll (se emite
   * `pointercancel` en su lugar), por lo que es seguro para mobile.
   */
  trigger.addEventListener('pointerup', (e) => {
    e.preventDefault();
    toggle();
  });

  /**
   * Suplimos `click` para dos fines:
   * 1. Evitar que el click sintético (que dispara el navegador tras
   *    pointerup) burbujee hasta el handler global de cierre-fuera.
   * 2. Accesibilidad: lectores de pantalla y teclados usan `click`
   *    (ej. al pulsar Enter/Space en un botón). En ese caso pointerup
   *    puede no haberse disparado, así que togglamos aquí también.
   */
  let toggledByPointer = false;
  trigger.addEventListener('pointerup', () => {
    toggledByPointer = true;
    requestAnimationFrame(() => {
      toggledByPointer = false;
    });
  });

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Si ya se gestionó en pointerup, no duplicar
    if (toggledByPointer) return;
    toggle();
  });

  /* ── Registrar root y montar el listener global (una sola vez) ── */
  dropdownRoots.add(root);
  bindOutsideListener();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      close();
      trigger.focus();
    }
  });

  return handle;
}
