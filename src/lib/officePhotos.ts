/**
 * Las fotos de la oficina: qué foto va en cada hueco y cómo se mueve su luz.
 * Las prepara `npm run assets:oficina` (scripts/build-office-photos.mjs) y las
 * pinta `LivePhoto.astro`; el movimiento lo pone `src/scripts/ph-live-photos.ts`.
 * Por qué estas fotos y no otras: DECISIONS.md (2026-10-15).
 */
import type { ImageMetadata } from 'astro';
import boligrafos from '@/assets/images/oficina/boligrafos.jpg';
import boligrafosLuz from '@/assets/images/oficina/boligrafos-luz.png';
import escultura from '@/assets/images/oficina/escultura.jpg';
import esculturaLuz from '@/assets/images/oficina/escultura-luz.png';
import sala from '@/assets/images/oficina/sala.jpg';
import salaLuz from '@/assets/images/oficina/sala-luz.png';
import carpeta from '@/assets/images/oficina/carpeta.jpg';
import carpetaLuz from '@/assets/images/oficina/carpeta-luz.png';
import sillones from '@/assets/images/oficina/sillones.jpg';
import sillonesLuz from '@/assets/images/oficina/sillones-luz.png';
import tarjeta from '@/assets/images/oficina/tarjeta.jpg';
import tarjetaLuz from '@/assets/images/oficina/tarjeta-luz.png';

/**
 * Cómo se mueve la luz de la foto:
 * - `sheen`: un brillo recorre una pieza (los clips, el logo de la carpeta o de la
 *   tarjeta).
 * - `sunlit`: el sol calienta una zona (la mesa, el patio, la escultura) y una
 *   mancha de luz la cruza.
 */
export type LiveKind = 'sheen' | 'sunlit';

/** El tono de la luz: cobre, plata u oro en los brillos; `white`, el sol sobre una
 *  pieza blanca, que con el filtro cálido de siempre apenas cambia. */
export type LightTone = 'copper' | 'silver' | 'gold' | 'white';

export interface LivePhotoSpec {
  photo: ImageMetadata;
  /** Dónde actúa la luz (blanco con alfa). Sin máscara, en toda la foto. */
  light?: ImageMetadata;
  kind: LiveKind;
  tone?: LightTone;
  /** Brillo: posición de reposo de la banda, en % (50 = centro de la pieza). */
  x?: number;
  /** Sol: cuánto se calienta la zona al terminar de cruzar la pantalla (0-1). */
  warm?: number;
  /** Brillo: un reflejo cruza la pieza cuando la foto entra en pantalla. */
  sweep?: boolean;
}

/** Los cinco pilares de Servicios, por la clave de `servicesItems.ts`. */
export const PILLAR_PHOTOS = {
  // Fotogramas del vídeo de la oficina: sin el logo de PH (los bolígrafos llevan
  // «PHSPORT» impreso en pequeño).
  press: { photo: boligrafos, light: boligrafosLuz, kind: 'sheen', tone: 'copper', x: 50 },
  media: { photo: sala, light: salaLuz, kind: 'sunlit', warm: 0.55 },
  // Fotos de la sesión. La escultura sustituyó a la pared de chevrones el 2026-10-27
  // (DECISIONS.md).
  performance: { photo: escultura, light: esculturaLuz, kind: 'sunlit', tone: 'white', warm: 0.45 },
  familyOffice: { photo: carpeta, light: carpetaLuz, kind: 'sheen', tone: 'silver', x: 50 },
  psychology: { photo: sillones, light: sillonesLuz, kind: 'sunlit', warm: 0.8 },
} satisfies Record<string, LivePhotoSpec>;

/** La ventana de repetición de Contacto, en la portada. */
export const CONTACT_PHOTO: LivePhotoSpec = {
  photo: tarjeta,
  light: tarjetaLuz,
  kind: 'sheen',
  tone: 'gold',
  x: 50,
  sweep: true,
};
