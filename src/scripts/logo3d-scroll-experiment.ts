import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initLogo3DScene, type Logo3DSceneInstance } from '@/lib/logo3d/scene';
import { reducedMotion } from '@/scripts/ph-text-animations';

gsap.registerPlugin(ScrollTrigger);

const ROOT_SELECTOR = '[data-cine-exp]';
const TRACK_SELECTOR = '[data-logo3d-scroll-track]';
const MOUNT_SELECTOR = '[data-logo3d-scroll-root]';

type Pose = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  positionY: number;
  scale: number;
  cameraZ: number;
};

type HoldSegment = {
  kind: 'hold';
  start: number;
  end: number;
  pose: Pose;
  quat: THREE.Quaternion;
};

type TransitionSegment = {
  kind: 'transition';
  start: number;
  end: number;
  from: Pose;
  to: Pose;
  quatFrom: THREE.Quaternion;
  quatTo: THREE.Quaternion;
  /**
   * Vueltas completas extra en eje Y (1 = 360°). Usa interpolación Euler para que el giro sea visible;
   * el slerp directo entre poses parecidas solo recorre el arco corto.
   * Usar enteros si el hold siguiente usa la misma pose `to`: medias vueltas desalinean el cuaternión final.
   */
  ySpinTurns?: number;
};

type TimelineSegment = HoldSegment | TransitionSegment;

let cleanupExperiment: (() => void) | null = null;

/** Tramo superior del scroll: mensaje “vuelve a deslizar” si hay progreso dentro del track. */
const TOP_REST_SCROLL_RATIO = 0.045;
const TOP_REST_PROGRESS_EPS = 0.0008;

/** Desplazamiento del canvas (vh) al ocultar arriba (entrada/salida simétrica). */
const LOGO_REVEAL_Y_VH = 20;

const MOUNT_INTRO_END = 0.035;
const MOUNT_OUT_START = 0.96;

const transitionEase = gsap.parseEase('power3.inOut');

/** Seguimiento del puntero (viewport -1…1); solo si no hay reduced motion. */
const POINTER_SMOOTH = 0.08;
const POINTER_CAM_X = 0.18;
const POINTER_CAM_Y = 0.15;
const POINTER_TILT_YAW = 0.19;
const POINTER_TILT_PITCH = 0.13;
const POINTER_TILT_ROLL = 0.05;

const pointerParallaxQuat = new THREE.Quaternion();
const pointerParallaxEuler = new THREE.Euler();

/**
 * Tras la pose del scroll: parallax en cámara + ligera rotación del logo hacia el cursor.
 */
function applyPointerParallax(instance: Logo3DSceneInstance, nx: number, ny: number): void {
  instance.camera.position.x = nx * POINTER_CAM_X;
  instance.camera.position.y = -ny * POINTER_CAM_Y;
  pointerParallaxEuler.set(
    -ny * POINTER_TILT_PITCH,
    nx * POINTER_TILT_YAW,
    nx * -POINTER_TILT_ROLL,
    'XYZ',
  );
  pointerParallaxQuat.setFromEuler(pointerParallaxEuler);
  instance.logoGroup.quaternion.multiply(pointerParallaxQuat);
}

const scratchLogoWorld = new THREE.Vector3();

type CineActGlassKey = 'intro' | 'pillars' | 'outro';

type GlassAnchorRule = {
  offsetX: number;
  offsetY: number;
  /** translate() tras posicionar left/top en el ancla (porcentajes del propio panel → solape con el logo) */
  transform: string;
  narrow?: { offsetX: number; offsetY: number; transform?: string };
};

const GLASS_ANCHOR_RULES: Record<CineActGlassKey, GlassAnchorRule> = {
  intro: {
    offsetX: -26,
    offsetY: 42,
    transform: 'translate(-88%, -36%)',
    narrow: { offsetX: -10, offsetY: 26, transform: 'translate(-82%, -30%)' },
  },
  pillars: {
    offsetX: 30,
    offsetY: -6,
    transform: 'translate(0%, -44%)',
    narrow: { offsetX: 8, offsetY: 0, transform: 'translate(-2%, -40%)' },
  },
  outro: {
    offsetX: -34,
    offsetY: -52,
    transform: 'translate(-92%, -88%)',
    narrow: { offsetX: -14, offsetY: -30, transform: 'translate(-90%, -82%)' },
  },
};

function projectLogoToStickySpace(
  instance: Logo3DSceneInstance,
  stickyEl: HTMLElement,
): { x: number; y: number } | null {
  const canvas = instance.renderer.domElement;
  const canvasRect = canvas.getBoundingClientRect();
  if (canvasRect.width < 2 || canvasRect.height < 2) return null;

  instance.camera.updateMatrixWorld(true);
  instance.camera.updateProjectionMatrix();
  instance.logoGroup.updateMatrixWorld(true);

  scratchLogoWorld.set(0, 0, 0);
  instance.logoGroup.localToWorld(scratchLogoWorld);
  scratchLogoWorld.project(instance.camera);

  const px = (scratchLogoWorld.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
  const py = (1 - (scratchLogoWorld.y * 0.5 + 0.5)) * canvasRect.height + canvasRect.top;

  const stickyRect = stickyEl.getBoundingClientRect();
  let lx = px - stickyRect.left;
  let ly = py - stickyRect.top;

  const edge = Math.max(14, Math.min(stickyRect.width, stickyRect.height) * 0.02);
  lx = Math.min(Math.max(lx, edge), stickyRect.width - edge);
  ly = Math.min(Math.max(ly, edge), stickyRect.height - edge);

  return { x: lx, y: ly };
}

function applyAnchorPanelsToGlasses(
  anchor: { x: number; y: number },
  glassByAct: Partial<Record<CineActGlassKey, HTMLElement | null>>,
): void {
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  (['intro', 'pillars', 'outro'] as const).forEach((key) => {
    const glass = glassByAct[key];
    if (!glass) return;
    const rule = GLASS_ANCHOR_RULES[key];
    const ox = narrow && rule.narrow ? rule.narrow.offsetX : rule.offsetX;
    const oy = narrow && rule.narrow ? rule.narrow.offsetY : rule.offsetY;
    const tr = narrow && rule.narrow?.transform != null ? rule.narrow.transform : rule.transform;
    glass.style.left = `${anchor.x + ox}px`;
    glass.style.top = `${anchor.y + oy}px`;
    glass.style.transform = tr;
    glass.style.right = 'auto';
    glass.style.bottom = 'auto';
  });
}

function poseToQuaternion(p: Pose): THREE.Quaternion {
  const e = new THREE.Euler(p.rotationX, p.rotationY, p.rotationZ, 'XYZ');
  return new THREE.Quaternion().setFromEuler(e);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

function driftEnvelope(progress: number, start: number, end: number, edgeRatio = 0.12): number {
  const span = end - start;
  const w = Math.max(span * edgeRatio, 0.02);
  const fin = smoothstep(start, start + w, progress);
  const fout = 1 - smoothstep(end - w, end, progress);
  return Math.max(0, Math.min(1, fin * fout));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoseScalars(a: Pose, b: Pose, t: number): Pick<Pose, 'positionX' | 'positionY' | 'scale' | 'cameraZ'> {
  return {
    positionX: lerp(a.positionX, b.positionX, t),
    positionY: lerp(a.positionY, b.positionY, t),
    scale: lerp(a.scale, b.scale, t),
    cameraZ: lerp(a.cameraZ, b.cameraZ, t),
  };
}

function applyLogoState(
  instance: Logo3DSceneInstance,
  positionX: number,
  positionY: number,
  scale: number,
  cameraZ: number,
  quat: THREE.Quaternion,
): void {
  instance.logoGroup.quaternion.copy(quat);
  instance.logoGroup.position.x = positionX;
  instance.logoGroup.position.y = positionY;
  instance.logoGroup.scale.setScalar(scale);
  instance.camera.position.z = cameraZ;
}

/** Valores de mount: introT/outT ya vienen con easing del tween GSAP (scrub); no aplicar ease de nuevo. */
function applyMountVisual(mount: HTMLElement, introT: number, outT: number, reduced: boolean): void {
  if (reduced) return;

  if (outT > 0) {
    const t = Math.min(1, Math.max(0, outT));
    const opacity = 1 - t;
    const y = `${-t * LOGO_REVEAL_Y_VH}vh`;
    const blur = 10 * t;
    const scale = 1 - 0.03 * t;
    gsap.set(mount, {
      opacity,
      y,
      scale,
      filter: `blur(${blur}px)`,
      pointerEvents: opacity > 0.04 ? '' : 'none',
      transformOrigin: '50% 50%',
    });
    return;
  }

  const t = Math.min(1, Math.max(0, introT));
  gsap.set(mount, {
    opacity: t,
    y: `${-(1 - t) * LOGO_REVEAL_Y_VH}vh`,
    scale: 0.97 + 0.03 * t,
    filter: `blur(${10 * (1 - t)}px)`,
    pointerEvents: t > 0.04 ? '' : 'none',
    transformOrigin: '50% 50%',
  });
}

function destroyExperiment(): void {
  cleanupExperiment?.();
  cleanupExperiment = null;
}

/**
 * Tres lecturas: intro (logo grande, desplazado al lado opuesto al texto), pilares (más pequeño y lejano),
 * cierre (sello). Transiciones con vuelta completa / media vuelta en Y para lectura clara del movimiento.
 */
function buildCinematicPoses(baseY: number): {
  holdIntro: Pose;
  holdPillars: Pose;
  holdOutro: Pose;
} {
  const holdIntro: Pose = {
    rotationX: 0.09,
    rotationY: -0.38,
    rotationZ: 0.045,
    positionX: 0.2,
    positionY: baseY + 0.06,
    scale: 1.08,
    cameraZ: 5.18,
  };

  const holdPillars: Pose = {
    rotationX: 0.1,
    rotationY: 0.22,
    rotationZ: 0.05,
    positionX: -0.46,
    positionY: baseY + 0.03,
    scale: 0.66,
    cameraZ: 6.35,
  };

  const holdOutro: Pose = {
    rotationX: 0.25,
    rotationY: 0.25,
    rotationZ: 0,
    positionX: 0.90,
    positionY: baseY + 0.5,
    scale: 0.44,
    cameraZ: 4.62,
  };

  return { holdIntro, holdPillars, holdOutro };
}

function buildTimelineSegments(poses: ReturnType<typeof buildCinematicPoses>): TimelineSegment[] {
  const { holdIntro, holdPillars, holdOutro } = poses;

  return [
    {
      kind: 'hold',
      start: 0,
      end: 0.28,
      pose: holdIntro,
      quat: poseToQuaternion(holdIntro),
    },
    {
      kind: 'transition',
      start: 0.28,
      end: 0.47,
      from: holdIntro,
      to: holdPillars,
      quatFrom: poseToQuaternion(holdIntro),
      quatTo: poseToQuaternion(holdPillars),
      ySpinTurns: 1,
    },
    {
      kind: 'hold',
      start: 0.47,
      end: 0.64,
      pose: holdPillars,
      quat: poseToQuaternion(holdPillars),
    },
    {
      kind: 'transition',
      start: 0.64,
      end: 0.86,
      from: holdPillars,
      to: holdOutro,
      quatFrom: poseToQuaternion(holdPillars),
      quatTo: poseToQuaternion(holdOutro),
      ySpinTurns: -1,
    },
    {
      kind: 'hold',
      start: 0.86,
      end: 1,
      pose: holdOutro,
      quat: poseToQuaternion(holdOutro),
    },
  ];
}

const scratchQuat = new THREE.Quaternion();
const scratchEuler = new THREE.Euler();
const scratchDriftEuler = new THREE.Euler();
const scratchDriftQuat = new THREE.Quaternion();

function pickSegment(segments: TimelineSegment[], p: number): TimelineSegment | null {
  if (segments.length === 0) return null;
  const pn = Math.min(1, Math.max(0, p));
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const isLast = i === segments.length - 1;
    if (isLast) {
      if (pn >= s.start && pn <= s.end) return s;
    } else if (pn >= s.start && pn < s.end) {
      return s;
    }
  }
  return segments[segments.length - 1];
}

function updateLogoFromScrollProgress(
  instance: Logo3DSceneInstance,
  progress: number,
  segments: TimelineSegment[],
): void {
  const p = Math.min(1, Math.max(0, progress));
  const seg = pickSegment(segments, p);
  if (!seg) return;

  if (seg.kind === 'hold') {
    scratchQuat.copy(seg.quat);
    const env = driftEnvelope(p, seg.start, seg.end);
    if (env > 0) {
      const now = performance.now();
      const amp = 0.022 * env;
      scratchDriftEuler.set(
        Math.sin(now * 0.00065) * amp,
        Math.cos(now * 0.00055) * amp * 0.88,
        Math.sin(now * 0.00072) * amp * 0.55,
        'XYZ',
      );
      scratchDriftQuat.setFromEuler(scratchDriftEuler);
      scratchQuat.multiply(scratchDriftQuat);
    }
    applyLogoState(
      instance,
      seg.pose.positionX,
      seg.pose.positionY,
      seg.pose.scale,
      seg.pose.cameraZ,
      scratchQuat,
    );
    return;
  }

  const span = seg.end - seg.start || 1;
  const localT = (p - seg.start) / span;
  const te = transitionEase(localT);
  const turns = seg.ySpinTurns ?? 0;
  const { positionX, positionY, scale, cameraZ } = lerpPoseScalars(seg.from, seg.to, te);
  if (turns !== 0) {
    const ex = lerp(seg.from.rotationX, seg.to.rotationX, te);
    const ey = lerp(seg.from.rotationY, seg.to.rotationY + turns * Math.PI * 2, te);
    const ez = lerp(seg.from.rotationZ, seg.to.rotationZ, te);
    scratchEuler.set(ex, ey, ez, 'XYZ');
    scratchQuat.setFromEuler(scratchEuler);
  } else {
    scratchQuat.slerpQuaternions(seg.quatFrom, seg.quatTo, te);
  }
  applyLogoState(instance, positionX, positionY, scale, cameraZ, scratchQuat);
}

function initExperiment(): void {
  destroyExperiment();

  const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  if (!root) return;

  const track = root.querySelector<HTMLElement>(TRACK_SELECTOR);
  const mount = root.querySelector<HTMLElement>(MOUNT_SELECTOR);
  if (!track || !mount) return;

  const vignette = root.querySelector<HTMLElement>('[data-cine-vignette]');
  const watermark = root.querySelector<HTMLElement>('[data-cine-watermark]');

  const actIntro = root.querySelector<HTMLElement>('[data-cine-act="intro"]');
  const actPillars = root.querySelector<HTMLElement>('[data-cine-act="pillars"]');
  const actOutro = root.querySelector<HTMLElement>('[data-cine-act="outro"]');

  const stickyEl = mount.closest<HTMLElement>('[data-cine-sticky]');
  const glassIntro = actIntro?.querySelector<HTMLElement>('.cine-glass') ?? null;
  const glassPillars = actPillars?.querySelector<HTMLElement>('.cine-glass') ?? null;
  const glassOutro = actOutro?.querySelector<HTMLElement>('.cine-glass') ?? null;

  const introTagline = actIntro?.querySelector<HTMLElement>('[data-cine-intro-tagline]');
  const introWords = actIntro
    ? Array.from(actIntro.querySelectorAll<HTMLElement>('.cine-intro__word'))
    : [];

  const pillarsEyebrow = actPillars?.querySelector<HTMLElement>('[data-cine-pillars-eyebrow]');
  const pillarsBody = actPillars?.querySelector<HTMLElement>('.cine-glass__body');
  const pillarCards = actPillars
    ? Array.from(actPillars.querySelectorAll<HTMLElement>('[data-cine-pillar]'))
    : [];
  const pillarTitles = pillarCards
    .map((c) => c.querySelector<HTMLElement>('[data-cine-pillar-title]'))
    .filter((el): el is HTMLElement => Boolean(el));
  const pillarBodies = pillarCards
    .map((c) => c.querySelector<HTMLElement>('[data-cine-pillar-body]'))
    .filter((el): el is HTMLElement => Boolean(el));

  const outroLines = actOutro
    ? Array.from(actOutro.querySelectorAll<HTMLElement>('[data-cine-outro-line]'))
    : [];

  const instance = initLogo3DScene(mount, {
    backgroundColor: 0x0a0e14,
    floating: false,
    heroLighting: true,
    controls: {
      enabled: false,
      enableRotate: false,
      enableZoom: false,
      enablePan: false,
      autoRotate: false,
    },
  });

  const poses = buildCinematicPoses(instance.basePositionY);
  const timelineSegments = buildTimelineSegments(poses);

  const prefersReducedMotion = reducedMotion();

  const hideLogoCanvasReduced = () => {
    gsap.killTweensOf(mount);
    gsap.set(mount, {
      opacity: 0,
      y: '-2.75rem',
      pointerEvents: 'none',
      scale: 1,
      filter: 'none',
      transformOrigin: '50% 50%',
    });
  };

  const revealLogoCanvasReduced = () => {
    gsap.killTweensOf(mount);
    gsap.fromTo(
      mount,
      { opacity: 0, y: '-2.75rem' },
      {
        opacity: 1,
        y: 0,
        duration: 0.34,
        ease: 'power2.out',
        onComplete: () => {
          mount.style.pointerEvents = '';
          gsap.set(mount, { clearProps: 'opacity,transform' });
        },
      },
    );
  };

  let firstScrollReveal: (() => void) | null = null;

  if (prefersReducedMotion) {
    root.classList.add('cine-exp--reduced');
    updateLogoFromScrollProgress(instance, 1, timelineSegments);
    hideLogoCanvasReduced();
    firstScrollReveal = () => {
      revealLogoCanvasReduced();
      if (firstScrollReveal) {
        window.removeEventListener('scroll', firstScrollReveal, { capture: true });
        firstScrollReveal = null;
      }
    };
    window.addEventListener('scroll', firstScrollReveal, { passive: true, capture: true });
    if (window.scrollY > 32) revealLogoCanvasReduced();
  } else {
    root.classList.remove('cine-exp--reduced');
    if (stickyEl) root.classList.add('cine-exp--anchored-panels');
    gsap.killTweensOf(mount);
    gsap.set(mount, {
      opacity: 0,
      y: `${-LOGO_REVEAL_Y_VH}vh`,
      scale: 0.97,
      filter: 'blur(10px)',
      pointerEvents: 'none',
      transformOrigin: '50% 50%',
    });
    updateLogoFromScrollProgress(instance, 0, timelineSegments);
  }

  instance.start();

  const domCleanup: HTMLElement[] = [];

  let timeline: gsap.core.Timeline | null = null;
  let scrollTrigger: ScrollTrigger | null = null;
  let ambientRafId: number | null = null;

  const mountScrub = { introT: 0, outT: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const pointerSmoothed = { x: 0, y: 0 };
  let pointerCleanup: (() => void) | null = null;

  const syncCineVisualFrame = (): void => {
    if (prefersReducedMotion) return;
    pointerSmoothed.x += (pointerTarget.x - pointerSmoothed.x) * POINTER_SMOOTH;
    pointerSmoothed.y += (pointerTarget.y - pointerSmoothed.y) * POINTER_SMOOTH;
    const p = scrollTrigger?.progress ?? 0;
    updateLogoFromScrollProgress(instance, p, timelineSegments);
    applyPointerParallax(instance, pointerSmoothed.x, pointerSmoothed.y);
    if (stickyEl && root.classList.contains('cine-exp--anchored-panels')) {
      const anchor = projectLogoToStickySpace(instance, stickyEl);
      if (anchor) {
        applyAnchorPanelsToGlasses(anchor, {
          intro: glassIntro,
          pillars: glassPillars,
          outro: glassOutro,
        });
      }
    }
    applyMountVisual(mount, mountScrub.introT, mountScrub.outT, false);
    const topRest = Boolean(
      scrollTrigger && p > TOP_REST_PROGRESS_EPS && p < TOP_REST_SCROLL_RATIO,
    );
    root.classList.toggle('cine-exp--top-rest', topRest);
  };

  const runAmbientLoop = (): void => {
    ambientRafId = window.requestAnimationFrame(runAmbientLoop);
    syncCineVisualFrame();
  };

  if (!prefersReducedMotion) {
    const acts = [actIntro, actPillars, actOutro].filter(Boolean) as HTMLElement[];
    gsap.set(acts, { opacity: 0 });

    if (vignette) gsap.set(vignette, { opacity: 0.16 });
    if (watermark) gsap.set(watermark, { opacity: 0.028, scale: 1 });

    if (introTagline) gsap.set(introTagline, { opacity: 0, y: 12 });
    gsap.set(introWords, { opacity: 0, y: 18 });
    if (pillarsEyebrow) gsap.set(pillarsEyebrow, { opacity: 0, y: 10 });
    if (pillarsBody) gsap.set(pillarsBody, { opacity: 0, filter: 'blur(14px)', y: 22 });
    gsap.set(pillarCards, { opacity: 0, y: 16 });
    gsap.set(pillarTitles, { opacity: 0, y: 10 });
    gsap.set(pillarBodies, { opacity: 0, y: 10 });
    gsap.set(outroLines, { opacity: 0, y: 16 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.25,
      },
    });
    timeline = tl;

    tl.to(mountScrub, { introT: 1, duration: MOUNT_INTRO_END, ease: 'power3.out' }, 0);
    tl.to(
      mountScrub,
      { outT: 1, duration: 1 - MOUNT_OUT_START, ease: 'power3.in' },
      MOUNT_OUT_START,
    );

    if (vignette) {
      tl.fromTo(
        vignette,
        { opacity: 0.16 },
        { opacity: 0.4, duration: 0.68, ease: 'none' },
        0.06,
      );
    }

    if (watermark) {
      tl.fromTo(
        watermark,
        { opacity: 0.028, scale: 1 },
        { opacity: 0.065, scale: 1.1, duration: 0.72, ease: 'power1.out' },
        0.1,
      );
    }

    if (actIntro) {
      tl.to(actIntro, { opacity: 1, duration: 0.08, ease: 'none' }, 0.02);
      /* Dejar tiempo a la última palabra (~0,40) antes de fundir el cartel */
      tl.to(actIntro, { opacity: 0, duration: 0.22, ease: 'sine.inOut' }, 0.34);
    }

    if (introTagline) {
      tl.to(introTagline, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.03);
    }

    introWords.forEach((word, i) => {
      tl.to(
        word,
        { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' },
        0.06 + i * 0.042,
      );
    });

    if (actPillars) {
      tl.to(actPillars, { opacity: 1, duration: 0.1, ease: 'none' }, 0.28);
      /* Pilares legibles hasta bien entrado el tramo hacia outro */
      tl.to(actPillars, { opacity: 0, duration: 0.22, ease: 'sine.inOut' }, 0.56);
    }

    if (pillarsBody) {
      tl.to(
        pillarsBody,
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
        },
        0.29,
      );
    }

    if (pillarsEyebrow) {
      tl.to(pillarsEyebrow, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.31);
    }

    pillarCards.forEach((card, i) => {
      const t0 = 0.34 + i * 0.058;
      tl.to(card, { opacity: 1, y: 0, duration: 0.17, ease: 'power2.out' }, t0);
      const title = pillarTitles[i];
      const body = pillarBodies[i];
      if (title) {
        tl.to(title, { opacity: 1, y: 0, duration: 0.13, ease: 'power2.out' }, t0 + 0.045);
      }
      if (body) {
        tl.to(body, { opacity: 1, y: 0, duration: 0.13, ease: 'power2.out' }, t0 + 0.095);
      }
    });

    /* Outro: cuando el sello ya va hacia su sitio; líneas escalonadas para lectura */
    if (actOutro) {
      tl.to(actOutro, { opacity: 1, duration: 0.12, ease: 'none' }, 0.7);
    }

    outroLines.forEach((line, i) => {
      tl.to(line, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.75 + i * 0.085);
    });

    scrollTrigger = tl.scrollTrigger ?? null;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerTarget.x = Math.max(-1, Math.min(1, nx));
      pointerTarget.y = Math.max(-1, Math.min(1, ny));
    };
    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };
    root.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerleave', onPointerLeave);
    pointerCleanup = () => {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
    };

    syncCineVisualFrame();
    ambientRafId = window.requestAnimationFrame(runAmbientLoop);

    domCleanup.push(
      ...acts,
      ...(glassIntro ? [glassIntro] : []),
      ...(glassPillars ? [glassPillars] : []),
      ...(glassOutro ? [glassOutro] : []),
      ...(vignette ? [vignette] : []),
      ...(watermark ? [watermark] : []),
      ...(introTagline ? [introTagline] : []),
      ...introWords,
      ...(pillarsEyebrow ? [pillarsEyebrow] : []),
      ...(pillarsBody ? [pillarsBody] : []),
      ...pillarCards,
      ...pillarTitles,
      ...pillarBodies,
      ...outroLines,
    );
  }

  cleanupExperiment = () => {
    root.classList.remove('cine-exp--top-rest', 'cine-exp--anchored-panels');
    pointerCleanup?.();
    pointerCleanup = null;
    if (ambientRafId !== null) {
      window.cancelAnimationFrame(ambientRafId);
      ambientRafId = null;
    }
    instance.camera.position.x = 0;
    instance.camera.position.y = 0;
    if (firstScrollReveal) {
      window.removeEventListener('scroll', firstScrollReveal, { capture: true });
      firstScrollReveal = null;
    }
    timeline?.kill();
    scrollTrigger?.kill();
    domCleanup.forEach((el) => gsap.set(el, { clearProps: 'all' }));
    gsap.killTweensOf(mount);
    gsap.set(mount, { clearProps: 'opacity,scale,filter,transform,pointerEvents' });
    mount.style.pointerEvents = '';
    instance.dispose();
  };

  ScrollTrigger.refresh();
}

document.addEventListener('astro:page-load', initExperiment);
document.addEventListener('astro:before-swap', destroyExperiment);

function bootWhenReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initExperiment();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootWhenReady, { once: true });
} else {
  bootWhenReady();
}
