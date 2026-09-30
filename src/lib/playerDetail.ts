/**
 * Payload por jugador/entrenador para las tarjetas de `/talentos/`.
 * Merge del roster JSON con la resolución de foto por slug.
 */

import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import jugadoresData from '../../data/jugadores.json';
import entrenadoresData from '../../data/entrenadores.json';
import placeholderSrc from '@/assets/images/players/avatar-placeholder.svg?url';
import { getPlayerPhotoBySlug } from '@/lib/playerPhotos';
import type { Lang } from '@/i18n/utils';
import { slugify } from '@/lib/slugify';

export type RosterJsonRow = {
  name: string;
  club: { name: string } | null;
  nationalTeamCodes?: string[];
  hidden?: boolean;
  /**
   * Por qué está oculto: `left-agency` si ya no es de PH, `on-hold` si sigue
   * pero no se muestra. Ausente = motivo sin registrar (entradas antiguas).
   * Nadie lo lee: documenta el dato para quien edite el roster.
   */
  hiddenReason?: 'left-agency' | 'on-hold';
};

export type PlayerRole = 'player' | 'coach';

export type PlayerDetailPayload = {
  slug: string;
  name: string;
  /** Club name o cadena vacía si no hay club. */
  subtitle: string;
  role: PlayerRole;
  nationalTeamCodes: string[];
  /** URL final para `<img>` en la tarjeta (WebP 480w / placeholder). */
  photoSrc: string;
  /** srcset WebP 320w/480w/720w, reserva sin AVIF (vacío si es placeholder SVG). */
  photoSrcset: string;
  /** srcset AVIF 320w/480w/720w para el `<source>` (vacío si es placeholder SVG). */
  photoSrcsetAvif: string;
};

export type RosterEntry = {
  slug: string;
  role: PlayerRole;
  row: RosterJsonRow;
};

export function getAllRosterEntries(): RosterEntry[] {
  const players = jugadoresData
    .filter((row) => !row.hidden)
    .map((row) => ({
      slug: slugify(row.name),
      role: 'player' as const,
      row: row as RosterJsonRow,
    }));
  const coaches = entrenadoresData
    .filter((row) => !row.hidden)
    .map((row) => ({
      slug: slugify(row.name),
      role: 'coach' as const,
      row: row as RosterJsonRow,
    }));
  return [...players, ...coaches];
}

/** Anchos del srcset de tarjeta: cubren DPR 1-3 en grid de 2/3/5 columnas. */
const PHOTO_WIDTHS = [320, 480, 720] as const;
/**
 * AVIF 90 para quien lo entiende; WebP 85 de reserva para navegadores sin AVIF
 * (iOS anterior al 16, por ejemplo). Medido en `DECISIONS.md` (2026-10-01).
 */
const PHOTO_AVIF_QUALITY = 90;
const PHOTO_WEBP_QUALITY = 85;

type PhotoSources = { src: string; srcset: string; srcsetAvif: string };

async function resolvePhotoForSlug(slug: string): Promise<PhotoSources> {
  const src: ImageMetadata | undefined = getPlayerPhotoBySlug(slug);
  if (!src) return { src: placeholderSrc, srcset: '', srcsetAvif: '' };
  try {
    const encode = (format: 'avif' | 'webp', quality: number) =>
      Promise.all(PHOTO_WIDTHS.map((w) => getImage({ src, width: w, format, quality })));
    const [avif, webp] = await Promise.all([
      encode('avif', PHOTO_AVIF_QUALITY),
      encode('webp', PHOTO_WEBP_QUALITY),
    ]);
    const toSrcset = (variants: { src: string }[]) =>
      variants.map((v, i) => `${v.src} ${PHOTO_WIDTHS[i]}w`).join(', ');
    // Fallback `src`: la variante 480w (la que sirve la mayoría de móviles DPR 2-3).
    const fallbackIndex = PHOTO_WIDTHS.indexOf(480);
    return { src: webp[fallbackIndex].src, srcset: toSrcset(webp), srcsetAvif: toSrcset(avif) };
  } catch {
    return { src: placeholderSrc, srcset: '', srcsetAvif: '' };
  }
}

export async function buildPlayerDetailPayloadsForLang(
  _lang: Lang,
): Promise<Record<string, PlayerDetailPayload>> {
  const roster = getAllRosterEntries();

  const entries = await Promise.all(
    roster.map(async ({ slug, role, row }) => {
      const clubName = row.club?.name ?? null;
      const subtitle = clubName && clubName.length > 0 ? clubName : '';
      const photo = await resolvePhotoForSlug(slug);
      const payload: PlayerDetailPayload = {
        slug,
        name: row.name,
        subtitle,
        role,
        nationalTeamCodes: row.nationalTeamCodes ?? [],
        photoSrc: photo.src,
        photoSrcset: photo.srcset,
        photoSrcsetAvif: photo.srcsetAvif,
      };
      return [slug, payload] as const;
    }),
  );

  return Object.fromEntries(entries);
}
