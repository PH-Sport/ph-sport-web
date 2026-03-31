import { gsap } from 'gsap';
import { reducedMotion } from '@/scripts/ph-text-animations';

export interface DropdownHandle {
  close(): void;
  open(): void;
  toggle(): void;
}

export function createDropdown(
  root: HTMLElement,
  trigger: HTMLButtonElement,
  panel: HTMLElement,
): DropdownHandle {
  function close(): void {
    if (panel.hidden) return;

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

    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;

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

  return { close, open, toggle };
}
