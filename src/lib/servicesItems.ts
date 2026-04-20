import { useTranslations, type Lang } from '@/i18n/utils';

export type ServiceItem = {
  icon: 'users' | 'route' | 'scale' | 'megaphone' | 'globe';
  title: string;
  body: string;
  short: string;
  tags: string[];
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
      tags: [
        t('services.items.press.tag1'),
        t('services.items.press.tag2'),
        t('services.items.press.tag3'),
      ],
    },
    {
      icon: 'route',
      title: t('services.items.performance.title'),
      body: t('services.items.performance.body'),
      short: t('services.items.performance.short'),
      tags: [
        t('services.items.performance.tag1'),
        t('services.items.performance.tag2'),
        t('services.items.performance.tag3'),
        t('services.items.performance.tag4'),
      ],
    },
    {
      icon: 'globe',
      title: t('services.items.media.title'),
      body: t('services.items.media.body'),
      short: t('services.items.media.short'),
      tags: [
        t('services.items.media.tag1'),
        t('services.items.media.tag2'),
        t('services.items.media.tag3'),
        t('services.items.media.tag4'),
      ],
    },
    {
      icon: 'scale',
      title: t('services.items.familyOffice.title'),
      body: t('services.items.familyOffice.body'),
      short: t('services.items.familyOffice.short'),
      tags: [
        t('services.items.familyOffice.tag1'),
        t('services.items.familyOffice.tag2'),
        t('services.items.familyOffice.tag3'),
        t('services.items.familyOffice.tag4'),
      ],
    },
    {
      icon: 'users',
      title: t('services.items.psychology.title'),
      body: t('services.items.psychology.body'),
      short: t('services.items.psychology.short'),
      tags: [
        t('services.items.psychology.tag1'),
        t('services.items.psychology.tag2'),
        t('services.items.psychology.tag3'),
      ],
    },
    {
      icon: 'route',
      title: t('services.items.actionPlan.title'),
      body: t('services.items.actionPlan.body'),
      short: t('services.items.actionPlan.short'),
      tags: [
        t('services.items.actionPlan.tag1'),
        t('services.items.actionPlan.tag2'),
        t('services.items.actionPlan.tag3'),
      ],
    },
  ];
}
