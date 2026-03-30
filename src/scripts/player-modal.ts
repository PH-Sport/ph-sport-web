import { gsap } from 'gsap';
import { reducedMotion } from '@/scripts/ph-text-animations';
import type { PlayerDetailPayload } from '@/lib/playerDetail';
import './player-modal.css';

const FLIP_DURATION = 0.78;
const FLIP_EASE = 'power3.inOut';
const BACKDROP_EXIT_FADE = 0.28;

function getTargetCardBox(): { targetW: number; targetH: number; cx: number; cy: number } {
  const targetW = Math.min(320, window.innerWidth * 0.88);
  const targetH = targetW * (4 / 3);
  const cx = window.innerWidth / 2 - targetW / 2;
  const cy = window.innerHeight / 2 - targetH / 2;
  return { targetW, targetH, cx, cy };
}

function styleFlipFace(face: HTMLElement): void {
  face.style.position = 'absolute';
  face.style.left = '0';
  face.style.top = '0';
  face.style.width = '100%';
  face.style.height = '100%';
  face.style.margin = '0';
  face.style.boxSizing = 'border-box';
  face.style.backfaceVisibility = 'hidden';
}

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
/** Cierre animado en curso; `exitPending` conserva estado para interrupción instantánea. */
let exitAnimating = false;
let exitPending: ModalState | null = null;

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

function killExitTweens(): void {
  if (backdropEl) gsap.killTweensOf(backdropEl);
  if (cloneEl) {
    gsap.killTweensOf(cloneEl);
    const inner = cloneEl.firstElementChild;
    if (inner) gsap.killTweensOf(inner);
  }
}

/**
 * Cierra el modal. Por defecto restaura la URL con replaceState (sin popstate → sin View Transition).
 * `skipUrlRestore`: la URL ya es correcta (popstate) o la va a fijar Astro (navegación).
 * `instant`: sin animación de salida (navegación, reduced motion, o carga de página).
 */
function closeModal(opts?: { skipUrlRestore?: boolean; instant?: boolean }): void {
  if (exitAnimating) {
    if (!opts?.instant) return;
    const pend = exitPending;
    exitAnimating = false;
    exitPending = null;
    killExitTweens();
    document.body.style.overflow = '';
    destroyShellContent();
    removeClone();
    if (pend) {
      pend.opener.style.visibility = '';
      if (!opts?.skipUrlRestore) {
        history.replaceState(history.state, '', pend.originalHref);
      }
      pend.opener.focus();
    }
    return;
  }

  const prev = active;
  if (!prev) return;

  const instant =
    opts?.instant === true || reducedMotion() || !cloneEl;

  if (instant) {
    active = null;
    document.body.style.overflow = '';
    destroyShellContent();
    removeClone();
    prev.opener.style.visibility = '';
    if (!opts?.skipUrlRestore) {
      history.replaceState(history.state, '', prev.originalHref);
    }
    prev.opener.focus();
    return;
  }

  exitAnimating = true;
  exitPending = prev;
  active = null;

  const flipRoot = cloneEl as HTMLDivElement;

  runFlipExitAnimation(flipRoot, prev.opener, () => {
    exitAnimating = false;
    exitPending = null;
    document.body.style.overflow = '';
    destroyShellContent();
    removeClone();
    prev.opener.style.visibility = '';
    if (!opts?.skipUrlRestore) {
      history.replaceState(history.state, '', prev.originalHref);
    }
    prev.opener.focus();
  });
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
  frontFace.style.visibility = 'visible';
  const backFace = card.cloneNode(true) as HTMLElement;
  backFace.classList.add('player-modal-card-clone');
  backFace.style.visibility = 'visible';

  for (const face of [frontFace, backFace]) {
    styleFlipFace(face);
  }

  gsap.set(backFace, { rotationY: 180 });

  flipInner.appendChild(frontFace);
  flipInner.appendChild(backFace);
  flipRoot.appendChild(flipInner);
  document.body.appendChild(flipRoot);
  cloneEl = flipRoot;

  const { targetW, targetH, cx, cy } = getTargetCardBox();

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

  gsap
    .timeline({ onComplete: flatten })
    .to(
      flipRoot,
      { left: cx, top: cy, width: targetW, height: targetH, duration: FLIP_DURATION, ease: FLIP_EASE },
      0,
    )
    .to(
      flipInner,
      { rotationY: 180, duration: FLIP_DURATION, ease: FLIP_EASE },
      0,
    );
}

/**
 * Invierte la entrada: reconstruye flipInner, anima hacia la tarjeta del grid y giro 180° → 0°.
 */
function runFlipExitAnimation(
  flipRoot: HTMLDivElement,
  opener: HTMLElement,
  onComplete: () => void,
): void {
  const backdrop = backdropEl;

  flipRoot.querySelector('.player-modal-close')?.remove();

  const backFace = flipRoot.querySelector('.player-modal-card-clone') as HTMLElement | null;
  if (!backFace) {
    onComplete();
    return;
  }

  const fromRect = backFace.getBoundingClientRect();

  backFace.remove();

  flipRoot.classList.remove('player-modal-flip-root--locked');
  flipRoot.removeAttribute('role');
  flipRoot.removeAttribute('aria-modal');
  flipRoot.removeAttribute('aria-label');

  flipRoot.style.display = 'block';
  flipRoot.style.flexDirection = '';
  flipRoot.style.overflow = 'visible';
  flipRoot.style.maxHeight = 'none';
  flipRoot.style.height = `${fromRect.height}px`;
  flipRoot.style.left = `${fromRect.left}px`;
  flipRoot.style.top = `${fromRect.top}px`;
  flipRoot.style.width = `${fromRect.width}px`;
  flipRoot.style.position = 'fixed';
  flipRoot.style.margin = '0';
  flipRoot.style.zIndex = '250';
  flipRoot.style.boxSizing = 'border-box';
  flipRoot.style.pointerEvents = 'none';

  const flipInner = document.createElement('div');
  flipInner.style.width = '100%';
  flipInner.style.height = '100%';
  flipInner.style.position = 'relative';
  flipInner.style.transformStyle = 'preserve-3d';
  flipInner.style.transformOrigin = 'center center';

  const frontFace = opener.cloneNode(true) as HTMLElement;
  frontFace.classList.add('player-modal-card-clone');
  frontFace.style.visibility = 'visible';
  styleFlipFace(frontFace);
  styleFlipFace(backFace);
  gsap.set(backFace, { rotationY: 180 });

  flipInner.appendChild(frontFace);
  flipInner.appendChild(backFace);
  flipRoot.replaceChildren(flipInner);

  gsap.set(flipInner, { rotationY: 180 });

  const toRect = opener.getBoundingClientRect();

  if (backdrop) {
    gsap.killTweensOf(backdrop);
    backdrop.hidden = false;
  }

  const tl = gsap.timeline({ onComplete });
  if (backdrop) {
    tl.to(
      backdrop,
      { opacity: 0, duration: BACKDROP_EXIT_FADE, ease: 'power2.out' },
      0,
    );
  }
  tl.to(
    flipRoot,
    {
      left: toRect.left,
      top: toRect.top,
      width: toRect.width,
      height: toRect.height,
      duration: FLIP_DURATION,
      ease: FLIP_EASE,
    },
    0,
  ).to(
    flipInner,
    { rotationY: 0, duration: FLIP_DURATION, ease: FLIP_EASE },
    0,
  );
}

function onPopState(): void {
  if (!active) return;
  const expected = expectedPathname(active.detailHref);
  if (window.location.pathname !== expected) {
    closeModal({ skipUrlRestore: true, instant: true });
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
    closeModal({ skipUrlRestore: true, instant: true });
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

    a.style.visibility = 'hidden';
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
      if (e.key !== 'Escape' || exitAnimating) return;
      if (!active) return;
      e.preventDefault();
      closeModal();
    });
  }
}

document.addEventListener('astro:page-load', () => {
  active = null;
  exitAnimating = false;
  exitPending = null;
  killExitTweens();
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
