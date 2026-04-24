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
};

export type PlayerRole = 'player' | 'coach';

export type PlayerDetailPayload = {
  slug: string;
  name: string;
  /** Club name o cadena vacía si no hay club. */
  subtitle: string;
  role: PlayerRole;
  nationalTeamCodes: string[];
  /** URL final para `<img>` en la tarjeta (getImage / placeholder). */
  photoSrc: string;
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
  const coaches = entrenadoresData.map((row) => ({
    slug: slugify(row.name),
    role: 'coach' as const,
    row: row as RosterJsonRow,
  }));
  return [...players, ...coaches];
}

async function resolvePhotoSrcForSlug(slug: string): Promise<string> {
  const src: ImageMetadata | undefined = getPlayerPhotoBySlug(slug);
  if (!src) return placeholderSrc;
  try {
    const out = await getImage({ src, width: 640 });
    return out.src;
  } catch {
    return placeholderSrc;
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
      const photoSrc = await resolvePhotoSrcForSlug(slug);
      const payload: PlayerDetailPayload = {
        slug,
        name: row.name,
        subtitle,
        role,
        nationalTeamCodes: row.nationalTeamCodes ?? [],
        photoSrc,
      };
      return [slug, payload] as const;
    }),
  );

  return Object.fromEntries(entries);
}
