/**
 * URLs de redes. Sustituir '#' por enlaces reales cuando estén disponibles.
 */
export type SocialId = 'instagram' | 'linkedin';

export type SocialEntry = {
  id: SocialId;
  href: string;
};

export const SOCIAL_LINKS: readonly SocialEntry[] = [
  { id: 'instagram', href: 'https://www.instagram.com/phsportagency/' },
  { id: 'linkedin', href: 'https://www.linkedin.com/company/phsport-management/' },
] as const;

export function isSocialPlaceholder(href: string): boolean {
  return href === '#' || href === '';
}

/** URL del perfil de Instagram (misma fuente que el footer). */
export function getInstagramProfileUrl(): string {
  const entry = SOCIAL_LINKS.find((s) => s.id === 'instagram');
  return entry?.href ?? '#';
}
