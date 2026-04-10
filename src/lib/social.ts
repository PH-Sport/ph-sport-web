/**
 * URLs de redes. Sustituir '#' por enlaces reales cuando estén disponibles.
 */
export type SocialId = 'instagram' | 'linkedin' | 'x';

export type SocialEntry = {
  id: SocialId;
  href: string;
};

export const SOCIAL_LINKS: readonly SocialEntry[] = [
  { id: 'instagram', href: '#' },
  { id: 'linkedin', href: '#' },
  { id: 'x', href: '#' },
] as const;

export function isSocialPlaceholder(href: string): boolean {
  return href === '#' || href === '';
}

/** URL del perfil de Instagram (misma fuente que el footer). */
export function getInstagramProfileUrl(): string {
  const entry = SOCIAL_LINKS.find((s) => s.id === 'instagram');
  return entry?.href ?? '#';
}
