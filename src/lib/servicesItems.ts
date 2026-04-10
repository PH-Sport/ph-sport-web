import { useTranslations, type Lang } from '@/i18n/utils';

export type ServiceItem = {
  icon: 'users' | 'route' | 'scale' | 'megaphone' | 'globe';
  title: string;
  body: string;
  short: string;
};

/**
 * Lista única de servicios (órbita 3D y preview en home).
 */
export function getServicesItems(lang: Lang): ServiceItem[] {
  const t = useTranslations(lang);
  return [
    {
      icon: 'users',
      title: t('services.items.representation.title'),
      body: t('services.items.representation.body'),
      short: t('services.items.representation.short'),
    },
    {
      icon: 'route',
      title: t('services.items.career.title'),
      body: t('services.items.career.body'),
      short: t('services.items.career.short'),
    },
    {
      icon: 'scale',
      title: t('services.items.legal.title'),
      body: t('services.items.legal.body'),
      short: t('services.items.legal.short'),
    },
    {
      icon: 'megaphone',
      title: t('services.items.image.title'),
      body: t('services.items.image.body'),
      short: t('services.items.image.short'),
    },
    {
      icon: 'globe',
      title: t('services.items.scouting.title'),
      body: t('services.items.scouting.body'),
      short: t('services.items.scouting.short'),
    },
  ];
}
