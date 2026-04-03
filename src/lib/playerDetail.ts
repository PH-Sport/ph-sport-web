/**
 * Detalle de jugador/entrenador: merge roster JSON + colección Markdown (`players`).
 */

import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection, type CollectionEntry } from 'astro:content';
import { marked } from 'marked';
import jugadoresData from '../../data/jugadores.json';
import entrenadoresData from '../../data/entrenadores.json';
import placeholderSrc from '@/assets/images/players/avatar-placeholder.svg?url';
import { getPlayerPhotoBySlug } from '@/lib/playerPhotos';
import { useTranslations, type Lang } from '@/i18n/utils';
import { slugify } from '@/lib/slugify';

export type RosterJsonRow = {
  name: string;
  club: { name: string } | null;
  nationalTeamCodes?: string[];
};

export type PlayerRole = 'player' | 'coach';

export type PlayerDetailPayload = {
  slug: string;
  name: string;
  /** Línea tipo tarjeta (club o "Sin club" / "No club") */
  subtitle: string;
  role: PlayerRole;
  nationalTeamCodes: string[];
  contentHtml: string;
  paths: { es: string; en: string };
  /** URL final para `<img>` en el modal (getImage / placeholder) */
  photoSrc: string;
};

export type ModalPayload = {
  slug: string;
  name: string;
  subtitle: string;
  /** Escudo o logo del club (modal Equipo / referencia tipo Leaderbrock). */
  clubLogoSrc?: string;
};

export type RosterEntry = {
  slug: string;
  role: PlayerRole;
  row: RosterJsonRow;
};

export function getAllRosterEntries(): RosterEntry[] {
  const players = jugadoresData.map((row) => ({
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

export async function getPlayersCollectionBySlug(): Promise<
  Map<string, CollectionEntry<'players'>>
> {
  const collection = await getCollection('players');
  return new Map(collection.map((e) => [e.id.replace(/\.md$/, ''), e]));
}

async function resolvePhotoSrcForPayload(
  slug: string,
  entry: CollectionEntry<'players'> | undefined,
): Promise<string> {
  const assetPhoto = getPlayerPhotoBySlug(slug);
  const src: ImageMetadata | undefined = assetPhoto ?? entry?.data.photo;
  if (!src) {
    return placeholderSrc;
  }
  try {
    const out = await getImage({ src, width: 640 });
    return out.src;
  } catch {
    return placeholderSrc;
  }
}

/**
 * Payloads por slug para un idioma (subtítulos localizados).
 */
export async function buildPlayerDetailPayloadsForLang(
  lang: Lang,
): Promise<Record<string, PlayerDetailPayload>> {
  const t = useTranslations(lang);
  const bySlug = await getPlayersCollectionBySlug();
  const roster = getAllRosterEntries();

  const entries = await Promise.all(
    roster.map(async ({ slug, role: rosterRole, row }) => {
      const entry = bySlug.get(slug);

      let name: string;
      let clubName: string | null;
      let nationalTeamCodes: string[];
      let role: PlayerRole;
      let contentHtml: string;

      if (entry) {
        name = entry.data.name;
        clubName = entry.data.club?.name ?? null;
        nationalTeamCodes = entry.data.nationalTeamCodes ?? [];
        role = entry.data.role === 'coach' ? 'coach' : 'player';
        const raw = entry.body?.trim() ?? '';
        contentHtml = raw ? (marked.parse(raw, { async: false }) as string) : '';
      } else {
        name = row.name;
        clubName = row.club?.name ?? null;
        nationalTeamCodes = row.nationalTeamCodes ?? [];
        role = rosterRole;
        contentHtml = '';
      }

      const subtitle = clubName && clubName.length > 0 ? clubName : t('players.club.none');
      const photoSrc = await resolvePhotoSrcForPayload(slug, entry);

      const payload: PlayerDetailPayload = {
        slug,
        name,
        subtitle,
        role,
        nationalTeamCodes,
        contentHtml,
        paths: { es: `/jugadores/${slug}`, en: `/en/players/${slug}` },
        photoSrc,
      };
      return [slug, payload] as const;
    }),
  );

  return Object.fromEntries(entries);
}

/**
 * Payloads ligeros para el modal inline (solo los campos que necesita el flip card).
 */
export function buildModalPayloadsForLang(
  lang: Lang,
): Record<string, ModalPayload> {
  const t = useTranslations(lang);
  const roster = getAllRosterEntries();
  const out: Record<string, ModalPayload> = {};

  for (const { slug, row } of roster) {
    const clubName = row.club?.name ?? null;
    out[slug] = {
      slug,
      name: row.name,
      subtitle: clubName && clubName.length > 0 ? clubName : t('players.club.none'),
    };
  }

  return out;
}
