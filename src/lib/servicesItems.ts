import { useTranslations, type Lang } from '@/i18n/utils';

export type ServiceItem = {
  icon: 'users' | 'route' | 'scale' | 'megaphone' | 'globe';
  title: string;
  body: string;
  short: string;
};

/**
 * Lista única de servicios (acordeón home y página de servicios).
 */
export function getServicesItems(lang: Lang): ServiceItem[] {
  const t = useTranslations(lang);
  return [
    {
      icon: 'megaphone',
      title: t('services.items.press.title'),
      body: t('services.items.press.body'),
      short: t('services.items.press.short'),
    },
    {
      icon: 'route',
      title: t('services.items.performance.title'),
      body: t('services.items.performance.body'),
      short: t('services.items.performance.short'),
    },
    {
      icon: 'globe',
      title: t('services.items.media.title'),
      body: t('services.items.media.body'),
      short: t('services.items.media.short'),
    },
    {
      icon: 'scale',
      title: t('services.items.familyOffice.title'),
      body: t('services.items.familyOffice.body'),
      short: t('services.items.familyOffice.short'),
    },
    {
      icon: 'users',
      title: t('services.items.psychology.title'),
      body: t('services.items.psychology.body'),
      short: t('services.items.psychology.short'),
    },
    {
      icon: 'route',
      title: t('services.items.actionPlan.title'),
      body: t('services.items.actionPlan.body'),
      short: t('services.items.actionPlan.short'),
    },
  ];
}
