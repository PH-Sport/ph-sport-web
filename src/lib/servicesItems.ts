import { useTranslations, type Lang } from '@/i18n/utils';

export type ServiceItem = {
  title: string;
  body: string;
  tags: string[];
};

/**
 * Lista única de servicios (acordeón home y página de servicios).
 */
export function getServicesItems(lang: Lang): ServiceItem[] {
  const t = useTranslations(lang);
  return [
    {
      title: t('services.items.press.title'),
      body: t('services.items.press.body'),
      tags: [
        t('services.items.press.tag1'),
        t('services.items.press.tag2'),
        t('services.items.press.tag3'),
      ],
    },
    {
      title: t('services.items.performance.title'),
      body: t('services.items.performance.body'),
      tags: [
        t('services.items.performance.tag1'),
        t('services.items.performance.tag2'),
        t('services.items.performance.tag3'),
        t('services.items.performance.tag4'),
      ],
    },
    {
      title: t('services.items.media.title'),
      body: t('services.items.media.body'),
      tags: [
        t('services.items.media.tag1'),
        t('services.items.media.tag2'),
        t('services.items.media.tag3'),
        t('services.items.media.tag4'),
      ],
    },
    {
      title: t('services.items.familyOffice.title'),
      body: t('services.items.familyOffice.body'),
      tags: [
        t('services.items.familyOffice.tag1'),
        t('services.items.familyOffice.tag2'),
        t('services.items.familyOffice.tag3'),
        t('services.items.familyOffice.tag4'),
      ],
    },
    {
      title: t('services.items.psychology.title'),
      body: t('services.items.psychology.body'),
      tags: [
        t('services.items.psychology.tag1'),
        t('services.items.psychology.tag2'),
        t('services.items.psychology.tag3'),
      ],
    },
    {
      title: t('services.items.actionPlan.title'),
      body: t('services.items.actionPlan.body'),
      tags: [
        t('services.items.actionPlan.tag1'),
        t('services.items.actionPlan.tag2'),
        t('services.items.actionPlan.tag3'),
      ],
    },
  ];
}
