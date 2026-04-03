import { gsap } from 'gsap';
import { reducedMotion } from '@/scripts/ph-text-animations';
import type { ModalPayload } from '@/lib/playerDetail';
import '@/styles/player-modal.css';

/** Solo Equipo: lightbox tipo póster (`data-player-modal-variant="team"`). */
type ModalVariant = 'team' | undefined;

const FLIP_DURATION = 0.78;
const FLIP_EASE = 'power3.inOut';
const BACKDROP_EXIT_FADE = 0.28;

function getDefaultCardBox(): { targetW: number; targetH: number; cx: number; cy: number } {
  const targetW = Math.min(320, window.innerWidth * 0.88);
  const targetH = targetW * (4 / 3);
  const cx = window.innerWidth / 2 - targetW / 2;
  const cy = window.innerHeight / 2 - targetH / 2;
  return { targetW, targetH, cx, cy };
}

/**
 * Lightbox apaisado (~1.58). Ancho generoso pero **alto acotado** (no pantalla completa)
 * para que la caja quede con margen vertical y el contenido pueda centrarse dentro.
 */
function getTeamLightboxBox(): { targetW: number; targetH: number; cx: number; cy: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const marginX = Math.max(10, vw * 0.02);
  const marginY = Math.max(10, vh * 0.03);
  const maxW = vw - marginX * 2;
  const maxH = Math.min(vh * 0.7, 620, vh - marginY * 2);
  const targetAspect = 1.58;
  let targetW = Math.min(maxW, 1200);
  let targetH = targetW / targetAspect;
  if (targetH > maxH) {
    targetH = maxH;
    targetW = Math.min(maxW, targetH * targetAspect);
  }
  const cx = (vw - targetW) / 2;
  const cy = (vh - targetH) / 2;
  return { targetW, targetH, cx, cy };
}

function getTargetCardBox(variant: ModalVariant): { targetW: number; targetH: number; cx: number; cy: number } {
  return variant === 'team' ? getTeamLightboxBox() : getDefaultCardBox();
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
  face.style.setProperty('-webkit-backface-visibility', 'hidden');
}

type ModalState = {
  slug: string;
  opener: HTMLElement;
  detailHref: string;
  /** URL completa antes de abrir el modal (para restore sin history.back / popstate). */
  originalHref: string;
};

let active: ModalState | null = null;
let backdropEl: HTMLDivElement | null = null;
let cloneEl: HTMLElement | null = null;
let popStateBound = false;
let escapeKeyBound = false;
let beforePrepBound = false;
/** Cierre animado en curso; `exitPending` conserva estado para interrupción instantánea. */
let exitAnimating = false;
let exitPending: ModalState | null = null;
/** Opener con `visibility: hidden`; restaurar en close y en astro:page-load si el nodo sigue en el DOM. */
let lastOpenerHidden: HTMLElement | null = null;
/** Última apertura sin giro 3D (touch / viewport estrecho); la salida omite rotateY en exit. */
let lastOpenUsedSimpleFlip = false;

function clearOpenerHiddenStyle(): void {
  if (lastOpenerHidden && document.contains(lastOpenerHidden)) {
    lastOpenerHidden.style.visibility = '';
  }
  lastOpenerHidden = null;
}

function prefersSimpleFlip(): boolean {
  if (typeof window.matchMedia !== 'function') return false;
  return (
    window.matchMedia('(max-width: 767px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

function readPayloads(root: HTMLElement): Record<string, ModalPayload> {
  const raw = root.dataset.playerPayloads;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, ModalPayload>;
  } catch {
    return {};
  }
}

function readModalVariant(root: HTMLElement): ModalVariant {
  return root.dataset.playerModalVariant === 'team' ? 'team' : undefined;
}

const TEAM_MARQUEE_REPEATS = 8;

function buildTeamMarqueeTrack(name: string): HTMLDivElement {
  const track = document.createElement('div');
  track.className = 'player-modal-marquee-track';
  track.setAttribute('aria-hidden', 'true');

  const g1 = document.createElement('div');
  g1.className = 'player-modal-marquee-group';
  const g2 = document.createElement('div');
  g2.className = 'player-modal-marquee-group';

  for (const group of [g1, g2]) {
    for (let i = 0; i < TEAM_MARQUEE_REPEATS; i++) {
      const span = document.createElement('span');
      span.className = 'player-modal-marquee-word';
      span.textContent = name;
      group.appendChild(span);
    }
  }

  track.append(g1, g2);
  return track;
}

/** Dos líneas tipo cartel (p. ej. nombre + apellidos). */
function splitNameAccentLines(name: string): string[] {
  const t = name.trim();
  if (!t) return [''];
  const parts = t.split(/\s+/);
  if (parts.length === 1) return [parts[0]!];
  return [parts[0]!, parts.slice(1).join(' ')];
}

/** Modal Equipo: composición tipo póster (marca de agua + foto estrecha + acento + rol). */
function buildTeamPosterStage(clone: HTMLElement, payload: ModalPayload): HTMLDivElement {
  const stage = document.createElement('div');
  stage.className = 'player-modal-team-stage';

  const poster = document.createElement('div');
  poster.className = 'player-modal-team-poster';

  const watermark = document.createElement('div');
  watermark.className = 'player-modal-team-watermark';
  watermark.setAttribute('aria-hidden', 'true');
  watermark.appendChild(buildTeamMarqueeTrack(payload.name));

  const accent = document.createElement('div');
  accent.className = 'player-modal-team-accent-name';
  accent.setAttribute('aria-hidden', 'true');
  for (const line of splitNameAccentLines(payload.name)) {
    const lineEl = document.createElement('span');
    lineEl.className = 'player-modal-team-accent-line';
    lineEl.textContent = line;
    accent.appendChild(lineEl);
  }

  const meta = document.createElement('div');
  meta.className = 'player-modal-team-meta';
  meta.setAttribute('aria-hidden', 'true');
  const metaText = document.createElement('span');
  metaText.className = 'player-modal-team-meta-text';
  metaText.textContent = payload.subtitle;
  if (payload.clubLogoSrc) {
    const logo = document.createElement('img');
    logo.className = 'player-modal-team-club-logo';
    logo.src = payload.clubLogoSrc;
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
    logo.decoding = 'async';
    meta.appendChild(logo);
  }
  meta.appendChild(metaText);

  const shell = document.createElement('div');
  shell.className = 'player-modal-team-photo-shell';

  clone.classList.add('player-modal-team-poster-card');
  shell.appendChild(clone);

  poster.append(watermark, shell, accent, meta);
  stage.appendChild(poster);

  return stage;
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

function ensureBackdrop(): HTMLDivElement {
  if (backdropEl) return backdropEl;

  const backdrop = document.createElement('div');
  backdrop.className = 'player-modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;

  document.body.appendChild(backdrop);
  backdropEl = backdrop;

  backdrop.addEventListener('click', () => {
    if (active) closeModal();
  });

  return backdrop;
}

function removeClone(): void {
  if (cloneEl) {
    cloneEl.remove();
    cloneEl = null;
  }
}

function hideBackdrop(): void {
  if (!backdropEl) return;
  gsap.killTweensOf(backdropEl);
  backdropEl.hidden = true;
  backdropEl.style.opacity = '0';
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
    hideBackdrop();
    removeClone();
    if (pend) {
      clearOpenerHiddenStyle();
      lastOpenUsedSimpleFlip = false;
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
    hideBackdrop();
    removeClone();
    clearOpenerHiddenStyle();
    lastOpenUsedSimpleFlip = false;
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
    hideBackdrop();
    removeClone();
    clearOpenerHiddenStyle();
    lastOpenUsedSimpleFlip = false;
    if (!opts?.skipUrlRestore) {
      history.replaceState(history.state, '', prev.originalHref);
    }
    prev.opener.focus();
  });
}

/**
 * El clon se crea con `cloneNode` **después** de que GSAP haya puesto `opacity` / `transform`
 * en la tarjeta del grid (p. ej. reveal en Equipo). Esos estilos inline se copian y dejan
 * la ficha invisible en el modal si la animación no ha terminado.
 */
function resetClonedCardFromGridAnimations(clone: HTMLElement): void {
  gsap.killTweensOf(clone);
  gsap.set(clone, { clearProps: 'opacity,transform,filter' });
  clone.style.visibility = 'visible';
  for (const img of clone.querySelectorAll('img')) {
    img.loading = 'eager';
  }
}

/** Cierra el flip: tarjeta legible + botón cerrar (sin bloque de biografía). */
function finalizeOpenCard(
  flipRoot: HTMLDivElement,
  clone: HTMLElement,
  payload: ModalPayload,
  closeLabel: string,
  modalVariant: ModalVariant = undefined,
): void {
  resetClonedCardFromGridAnimations(clone);

  clone.removeAttribute('href');
  clone.setAttribute('tabindex', '-1');

  clone.style.position = 'relative';
  clone.style.left = '';
  clone.style.top = '';
  /** Equipo: el ancho lo fija el CSS (`clamp` + `max-width`); `width: 100%` inline rompía el grid del póster (shell a 0px → foto invisible). */
  if (modalVariant === 'team') {
    clone.style.removeProperty('width');
  } else {
    clone.style.width = '100%';
  }
  clone.style.height = '';
  clone.style.aspectRatio = '3 / 4';
  clone.style.margin = '0';
  clone.style.flexShrink = '0';

  if (modalVariant === 'team' && flipRoot.contains(clone)) {
    flipRoot.removeChild(clone);
    const stage = buildTeamPosterStage(clone, payload);
    flipRoot.appendChild(stage);
    flipRoot.classList.add('player-modal-flip-root--team');
  }

  flipRoot.classList.add('player-modal-flip-root--locked');
  gsap.set(flipRoot, { clearProps: 'height' });
  flipRoot.style.height = 'auto';

  if (modalVariant === 'team') {
    const tb = getTeamLightboxBox();
    flipRoot.style.boxSizing = 'border-box';
    flipRoot.style.width = `${tb.targetW}px`;
    flipRoot.style.height = `${tb.targetH}px`;
    flipRoot.style.minHeight = `${tb.targetH}px`;
  }

  flipRoot.style.pointerEvents = 'auto';
  flipRoot.style.display = 'flex';
  flipRoot.style.flexDirection = 'column';
  flipRoot.style.overflow = 'hidden';
  flipRoot.style.maxHeight = modalVariant === 'team' ? 'none' : 'min(85vh, 900px)';
  flipRoot.setAttribute('role', 'dialog');
  flipRoot.setAttribute('aria-modal', 'true');
  flipRoot.setAttribute('aria-label', `${payload.name} — ${payload.subtitle}`);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className =
    modalVariant === 'team'
      ? 'player-modal-close player-modal-close--on-card player-modal-close--team-lightbox'
      : 'player-modal-close player-modal-close--on-card';
  closeBtn.setAttribute('aria-label', closeLabel);
  closeBtn.innerHTML =
    modalVariant === 'team'
      ? '<span class="player-modal-close-line" aria-hidden="true"></span>'
      : '<span class="player-modal-close-icon" aria-hidden="true">&times;</span>';
  flipRoot.appendChild(closeBtn);

  closeBtn.addEventListener('click', () => {
    closeModal();
  });

  const backdrop = ensureBackdrop();
  backdrop.hidden = false;
  gsap.to(backdrop, { opacity: 1, duration: 0.28, ease: 'power2.out' });

  closeBtn.focus();
}

function runFlipAnimation(
  card: HTMLElement,
  modalVariant: ModalVariant,
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

  gsap.set(frontFace, { z: 0.1, force3D: true });
  gsap.set(backFace, { rotationY: 180, z: 0.1, force3D: true });

  flipInner.appendChild(frontFace);
  flipInner.appendChild(backFace);
  flipRoot.appendChild(flipInner);
  document.body.appendChild(flipRoot);
  cloneEl = flipRoot;

  const { targetW, targetH, cx, cy } = getTargetCardBox(modalVariant);

  const flatten = (): void => {
    const run = (): void => {
      gsap.killTweensOf([flipRoot, flipInner]);
      frontFace.remove();
      gsap.set(backFace, { rotationY: 0 });
      backFace.style.backfaceVisibility = 'visible';
      backFace.style.setProperty('-webkit-backface-visibility', 'visible');
      flipRoot.appendChild(backFace);
      flipInner.remove();
      onComplete(flipRoot, backFace);
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  };

  if (reducedMotion()) {
    lastOpenUsedSimpleFlip = false;
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

  const simple = prefersSimpleFlip();
  lastOpenUsedSimpleFlip = simple;

  if (simple) {
    gsap.timeline({ onComplete: flatten }).to(
      flipRoot,
      { left: cx, top: cy, width: targetW, height: targetH, duration: FLIP_DURATION, ease: FLIP_EASE },
      0,
    );
    return;
  }

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

  if (lastOpenUsedSimpleFlip) {
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

    const single = opener.cloneNode(true) as HTMLElement;
    single.classList.add('player-modal-card-clone');
    single.style.visibility = 'visible';
    single.style.position = 'absolute';
    single.style.left = '0';
    single.style.top = '0';
    single.style.width = '100%';
    single.style.height = '100%';
    single.style.boxSizing = 'border-box';
    flipRoot.replaceChildren(single);

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
    );
    return;
  }

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
  const modalVariant = readModalVariant(root);

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

    lastOpenerHidden = a;
    a.style.visibility = 'hidden';
    document.body.style.overflow = 'hidden';

    const backdrop = ensureBackdrop();
    backdrop.hidden = false;
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 0.55, duration: 0.2, ease: 'power2.out' });

    history.replaceState(history.state, '', `${detailUrl.pathname}${detailUrl.search}${detailUrl.hash}`);

    runFlipAnimation(a, modalVariant, (flipRoot, clone) => {
      finalizeOpenCard(flipRoot, clone, payload, closeLabel, modalVariant);
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
  lastOpenUsedSimpleFlip = false;
  killExitTweens();
  document.body.style.overflow = '';
  removeClone();
  clearOpenerHiddenStyle();
  if (backdropEl) {
    backdropEl.remove();
    backdropEl = null;
  }
});
