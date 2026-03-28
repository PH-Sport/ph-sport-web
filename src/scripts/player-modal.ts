import { gsap } from 'gsap';
import { reducedMotion } from '@/scripts/ph-text-animations';
import type { PlayerDetailPayload } from '@/lib/playerDetail';

type ModalState = {
  slug: string;
  opener: HTMLElement;
  detailHref: string;
  /** URL completa antes de abrir el modal (para restore sin history.back / popstate). */
  originalHref: string;
};

let active: ModalState | null = null;
let shellEl: HTMLDivElement | null = null;
let backdropEl: HTMLDivElement | null = null;
let cloneEl: HTMLElement | null = null;
let popStateBound = false;
let escapeKeyBound = false;
let beforePrepBound = false;

function readPayloads(root: HTMLElement): Record<string, PlayerDetailPayload> {
  const raw = root.dataset.playerPayloads;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, PlayerDetailPayload>;
  } catch {
    return {};
  }
}

function slugFromDetailPath(pathname: string, detailBase: string): string | null {
  const base = detailBase.endsWith('/') ? detailBase.slice(0, -1) : detailBase;
  if (!pathname.startsWith(base + '/')) return null;
  const rest = pathname.slice(base.length + 1);
  if (!rest || rest.includes('/')) return null;
  return rest;
}

function expectedPathname(detailHref: string): string {
  try {
    return new URL(detailHref, window.location.origin).pathname;
  } catch {
    return '';
  }
}

function ensureShell(): { shell: HTMLDivElement; backdrop: HTMLDivElement } {
  if (shellEl && backdropEl) return { shell: shellEl, backdrop: backdropEl };

  const backdrop = document.createElement('div');
  backdrop.className = 'player-modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;

  const shell = document.createElement('div');
  shell.className = 'player-modal-shell';
  shell.setAttribute('role', 'dialog');
  shell.setAttribute('aria-modal', 'true');
  shell.tabIndex = -1;
  shell.hidden = true;

  document.body.appendChild(backdrop);
  document.body.appendChild(shell);

  backdropEl = backdrop;
  shellEl = shell;

  backdrop.addEventListener('click', () => {
    if (active) closeModal();
  });

  return { shell, backdrop };
}

function removeClone(): void {
  if (cloneEl) {
    cloneEl.remove();
    cloneEl = null;
  }
}

function destroyShellContent(): void {
  if (!shellEl) return;
  shellEl.innerHTML = '';
  shellEl.hidden = true;
  if (backdropEl) {
    gsap.killTweensOf(backdropEl);
    backdropEl.hidden = true;
    backdropEl.style.opacity = '0';
  }
}

/**
 * Cierra el modal. Por defecto restaura la URL con replaceState (sin popstate → sin View Transition).
 * `skipUrlRestore`: la URL ya es correcta (popstate) o la va a fijar Astro (navegación).
 */
function closeModal(opts?: { skipUrlRestore?: boolean }): void {
  const prev = active;
  active = null;

  document.body.style.overflow = '';

  destroyShellContent();
  removeClone();

  if (prev && !opts?.skipUrlRestore) {
    history.replaceState(history.state, '', prev.originalHref);
  }

  if (prev?.opener) {
    prev.opener.focus();
  }
}

/** Cierra el flip: tarjeta legible + botón cerrar (sin bloque de biografía). */
function finalizeOpenCard(
  flipRoot: HTMLDivElement,
  clone: HTMLElement,
  payload: PlayerDetailPayload,
  closeLabel: string,
): void {
  clone.removeAttribute('href');
  clone.setAttribute('tabindex', '-1');

  clone.style.position = 'relative';
  clone.style.left = '';
  clone.style.top = '';
  clone.style.width = '100%';
  clone.style.height = '';
  clone.style.aspectRatio = '3 / 4';
  clone.style.margin = '0';
  clone.style.flexShrink = '0';

  flipRoot.classList.add('player-modal-flip-root--locked');
  gsap.set(flipRoot, { clearProps: 'height' });
  flipRoot.style.height = 'auto';

  flipRoot.style.pointerEvents = 'auto';
  flipRoot.style.display = 'flex';
  flipRoot.style.flexDirection = 'column';
  flipRoot.style.overflow = 'hidden';
  flipRoot.style.maxHeight = 'min(85vh, 900px)';
  flipRoot.setAttribute('role', 'dialog');
  flipRoot.setAttribute('aria-modal', 'true');
  flipRoot.setAttribute('aria-label', `${payload.name} — ${payload.subtitle}`);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'player-modal-close player-modal-close--on-card';
  closeBtn.setAttribute('aria-label', closeLabel);
  closeBtn.innerHTML =
    '<span class="player-modal-close-icon" aria-hidden="true">&times;</span>';
  flipRoot.appendChild(closeBtn);

  closeBtn.addEventListener('click', () => {
    closeModal();
  });

  const { backdrop } = ensureShell();
  backdrop.hidden = false;
  gsap.to(backdrop, { opacity: 1, duration: 0.28, ease: 'power2.out' });

  closeBtn.focus();
}

function runFlipAnimation(
  card: HTMLElement,
  onComplete: (flipRoot: HTMLDivElement, clone: HTMLElement) => void,
): void {
  const rect = card.getBoundingClientRect();

  const flipRoot = document.createElement('div');
  flipRoot.className = 'player-modal-flip-root';
  flipRoot.style.position = 'fixed';
  flipRoot.style.margin = '0';
  flipRoot.style.zIndex = '250';
  flipRoot.style.pointerEvents = 'none';
  flipRoot.style.boxSizing = 'border-box';

  const flipInner = document.createElement('div');
  flipInner.style.width = '100%';
  flipInner.style.height = '100%';
  flipInner.style.position = 'relative';
  flipInner.style.transformStyle = 'preserve-3d';
  flipInner.style.transformOrigin = 'center center';

  const frontFace = card.cloneNode(true) as HTMLElement;
  frontFace.classList.add('player-modal-card-clone');
  const backFace = card.cloneNode(true) as HTMLElement;
  backFace.classList.add('player-modal-card-clone');

  for (const face of [frontFace, backFace]) {
    face.style.position = 'absolute';
    face.style.left = '0';
    face.style.top = '0';
    face.style.width = '100%';
    face.style.height = '100%';
    face.style.margin = '0';
    face.style.boxSizing = 'border-box';
    face.style.backfaceVisibility = 'hidden';
  }

  gsap.set(backFace, { rotationY: 180 });

  flipInner.appendChild(frontFace);
  flipInner.appendChild(backFace);
  flipRoot.appendChild(flipInner);
  document.body.appendChild(flipRoot);
  cloneEl = flipRoot;

  const targetW = Math.min(320, window.innerWidth * 0.88);
  const targetH = targetW * (4 / 3);
  const cx = window.innerWidth / 2 - targetW / 2;
  const cy = window.innerHeight / 2 - targetH / 2;

  const flatten = (): void => {
    gsap.killTweensOf([flipRoot, flipInner]);
    frontFace.remove();
    gsap.set(backFace, { rotationY: 0 });
    backFace.style.backfaceVisibility = 'visible';
    flipRoot.appendChild(backFace);
    flipInner.remove();
    onComplete(flipRoot, backFace);
  };

  if (reducedMotion()) {
    flipRoot.style.left = `${cx}px`;
    flipRoot.style.top = `${cy}px`;
    flipRoot.style.width = `${targetW}px`;
    flipRoot.style.height = `${targetH}px`;
    flatten();
    return;
  }

  flipRoot.style.left = `${rect.left}px`;
  flipRoot.style.top = `${rect.top}px`;
  flipRoot.style.width = `${rect.width}px`;
  flipRoot.style.height = `${rect.height}px`;

  const duration = 0.78;
  const ease = 'power3.inOut';

  gsap
    .timeline({ onComplete: flatten })
    .to(
      flipRoot,
      { left: cx, top: cy, width: targetW, height: targetH, duration, ease },
      0,
    )
    .to(
      flipInner,
      { rotationY: 180, duration, ease },
      0,
    );
}

function onPopState(): void {
  if (!active) return;
  const expected = expectedPathname(active.detailHref);
  if (window.location.pathname !== expected) {
    closeModal({ skipUrlRestore: true });
  }
}

function bindPopState(): void {
  if (popStateBound) return;
  window.addEventListener('popstate', onPopState);
  popStateBound = true;
}

function bindBeforePreparation(): void {
  if (beforePrepBound) return;
  beforePrepBound = true;
  document.addEventListener('astro:before-preparation', () => {
    if (!active) return;
    closeModal({ skipUrlRestore: true });
  });
}

export function initPlayerModal(root: HTMLElement): void {
  if (root.dataset.playerModalInit === 'true') return;
  root.dataset.playerModalInit = 'true';

  const detailBase = root.dataset.playerDetailBase;
  if (!detailBase) return;

  const payloads = readPayloads(root);
  const closeLabel = root.dataset.playerModalClose ?? 'Close';

  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement | null;
    const a = t?.closest?.('a.card') as HTMLAnchorElement | null;
    if (!a || !root.contains(a)) return;

    const href = a.getAttribute('href') ?? '';
    if (!href.startsWith(detailBase + '/')) return;

    const pathname = new URL(href, window.location.origin).pathname;
    const slug = slugFromDetailPath(pathname, detailBase);
    if (!slug || !payloads[slug]) return;

    e.preventDefault();

    const payload = payloads[slug];
    const detailHref = href.startsWith('http') ? href : new URL(href, window.location.origin).href;
    const detailUrl = new URL(href, window.location.origin);

    active = {
      slug,
      opener: a,
      detailHref,
      originalHref: window.location.href,
    };
    bindPopState();
    bindBeforePreparation();

    document.body.style.overflow = 'hidden';

    const { backdrop } = ensureShell();
    backdrop.hidden = false;
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 0.55, duration: 0.2, ease: 'power2.out' });

    history.replaceState(history.state, '', `${detailUrl.pathname}${detailUrl.search}${detailUrl.hash}`);

    runFlipAnimation(a, (flipRoot, clone) => {
      finalizeOpenCard(flipRoot, clone, payload, closeLabel);
    });
  });

  if (!escapeKeyBound) {
    escapeKeyBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !active) return;
      e.preventDefault();
      closeModal();
    });
  }
}

document.addEventListener('astro:page-load', () => {
  active = null;
  document.body.style.overflow = '';
  removeClone();
  if (shellEl) {
    shellEl.remove();
    shellEl = null;
  }
  if (backdropEl) {
    backdropEl.remove();
    backdropEl = null;
  }
});
