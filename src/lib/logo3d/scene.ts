import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Point = [number, number];

export interface Logo3DControlsOptions {
  enabled?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
}

export interface InitLogo3DSceneOptions {
  backgroundColor?: number | null;
  floating?: boolean;
  controls?: Logo3DControlsOptions;
  /** Más luz ambiente + focos + exposición (p. ej. experimento sobre fondo muy oscuro). */
  heroLighting?: boolean;
}

export interface Logo3DSceneInstance {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  logoGroup: THREE.Group;
  basePositionY: number;
  start: () => void;
  stop: () => void;
  setFloating: (enabled: boolean) => void;
  dispose: () => void;
}

const SVG_W = 259.8;
const SVG_H = 206.1;
const SVG_CENTER_X = SVG_W / 2;
const SVG_CENTER_Y = SVG_H / 2;
const SVG_SCALE = 1 / 115;

const POINTS_1: Point[] = [
  [0, 206.1],
  [58.2, 206.1],
  [57.9, 145.5],
  [158.1, 45.4],
  [112.7, 0],
  [0, 0],
  [0, 52.6],
  [76.9, 52.6],
  [0, 128.7],
];

const POINTS_2: Point[] = [
  [122.6, 206.1],
  [200.1, 206.1],
  [152.2, 157.8],
  [173, 137.1],
  [182.4, 146.4],
  [259.8, 146.4],
  [169.6, 55.6],
  [130.5, 94.2],
  [131.8, 95.6],
  [141.1, 105.4],
  [120.3, 125.8],
  [109.8, 115.4],
  [70.8, 153.9],
];

const EXTRUDE_OPTIONS: THREE.ExtrudeGeometryOptions = {
  depth: 0.28,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.022,
  bevelSegments: 4,
};

const DEFAULT_CONTROLS: Required<Logo3DControlsOptions> = {
  enabled: true,
  enablePan: false,
  enableRotate: true,
  enableZoom: true,
  autoRotate: true,
  autoRotateSpeed: 1.6,
  dampingFactor: 0.07,
  minDistance: 2,
  maxDistance: 12,
};

function toVectorPoint(x: number, y: number): THREE.Vector2 {
  return new THREE.Vector2((x - SVG_CENTER_X) * SVG_SCALE, -(y - SVG_CENTER_Y) * SVG_SCALE);
}

function makeLogoGeometry(points: Point[]): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(points.map(([x, y]) => toVectorPoint(x, y)));
  return new THREE.ExtrudeGeometry(shape, EXTRUDE_OPTIONS);
}

export function initLogo3DScene(
  container: HTMLElement,
  options: InitLogo3DSceneOptions = {},
): Logo3DSceneInstance {
  const scene = new THREE.Scene();
  if (typeof options.backgroundColor === 'number') {
    scene.background = new THREE.Color(options.backgroundColor);
  }

  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 200);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = options.heroLighting ? 1.2 : 1.3;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  const controlsConfig = { ...DEFAULT_CONTROLS, ...(options.controls ?? {}) };
  controls.enabled = controlsConfig.enabled;
  controls.enableDamping = true;
  controls.dampingFactor = controlsConfig.dampingFactor;
  controls.enablePan = controlsConfig.enablePan;
  controls.enableRotate = controlsConfig.enableRotate;
  controls.enableZoom = controlsConfig.enableZoom;
  controls.minDistance = controlsConfig.minDistance;
  controls.maxDistance = controlsConfig.maxDistance;
  controls.autoRotate = controlsConfig.autoRotate;
  controls.autoRotateSpeed = controlsConfig.autoRotateSpeed;

  if (options.heroLighting) {
    scene.add(new THREE.AmbientLight(0xfff5ec, 0.32));

    const hemi = new THREE.HemisphereLight(0x3a3430, 0x08090c, 0.2);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfffaf3, 5.6);
    key.position.set(6.2, 3.2, 7);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xecd8bc, 1.85);
    fill.position.set(-7, 1.2, 4.5);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9a8, 3.6);
    rim.position.set(-3.2, -4.2, -5.2);
    scene.add(rim);

    const spot = new THREE.SpotLight(0xffe8d0, 158, 0, Math.PI / 5, 0.38, 2);
    spot.position.set(5.9, -3.6, 7.4);
    spot.target.position.set(0, 0.05, 0);
    scene.add(spot);
    scene.add(spot.target);
  } else {
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(5, 8, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xaaccff, 2);
    fill.position.set(-6, 2, 4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x4488ff, 3);
    rim.position.set(-3, -5, -6);
    scene.add(rim);
  }

  let envRenderTarget: THREE.WebGLRenderTarget | null = null;
  if (options.heroLighting) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envRenderTarget = pmrem.fromScene(room, 0.028);
    scene.environment = envRenderTarget.texture;
    scene.environmentRotation.set(0, 0.38, 0);
    pmrem.dispose();
  }

  const material = options.heroLighting
    ? new THREE.MeshPhysicalMaterial({
        color: 0xd6b25e,
        metalness: 1,
        roughness: 0.038,
        envMapIntensity: 0.68,
        clearcoat: 0.78,
        clearcoatRoughness: 0.022,
        specularIntensity: 1,
        specularColor: new THREE.Color(0xfff2e6),
      })
    : new THREE.MeshStandardMaterial({
        color: 0xd6b25e,
        metalness: 0.95,
        roughness: 0.08,
      });

  const logoGroup = new THREE.Group();
  const mesh1 = new THREE.Mesh(makeLogoGeometry(POINTS_1), material);
  const mesh2 = new THREE.Mesh(makeLogoGeometry(POINTS_2), material);
  logoGroup.add(mesh1, mesh2);
  scene.add(logoGroup);

  const box = new THREE.Box3().setFromObject(logoGroup);
  logoGroup.position.sub(box.getCenter(new THREE.Vector3()));
  const basePositionY = logoGroup.position.y;

  let frameId = 0;
  let floatingEnabled = options.floating ?? true;
  let running = false;

  const onResize = () => {
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const resizeObserver = new ResizeObserver(() => onResize());
  resizeObserver.observe(container);

  const renderFrame = (time: number) => {
    if (!running) return;
    frameId = window.requestAnimationFrame(renderFrame);
    if (floatingEnabled) {
      logoGroup.position.y = basePositionY + Math.sin(time * 0.001 * 0.7) * 0.015;
    }
    controls.update();
    renderer.render(scene, camera);
  };

  window.addEventListener('resize', onResize);

  const start = () => {
    if (running) return;
    running = true;
    frameId = window.requestAnimationFrame(renderFrame);
  };

  const stop = () => {
    running = false;
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const setFloating = (enabled: boolean) => {
    floatingEnabled = enabled;
    if (!enabled) logoGroup.position.y = basePositionY;
  };

  const dispose = () => {
    stop();
    resizeObserver.disconnect();
    window.removeEventListener('resize', onResize);
    controls.dispose();

    scene.environment = null;
    scene.environmentRotation.set(0, 0, 0);
    envRenderTarget?.dispose();
    envRenderTarget = null;

    logoGroup.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => mat.dispose());
      } else {
        obj.material.dispose();
      }
    });

    renderer.dispose();
    renderer.domElement.remove();
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    logoGroup,
    basePositionY,
    start,
    stop,
    setFloating,
    dispose,
  };
}
