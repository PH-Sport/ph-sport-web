import type { Lang, TranslationKey } from '@/i18n/utils';
import { useTranslations } from '@/i18n/utils';

export type Nationality = 'ES' | 'PT';

export type CountryKey = 'arabia' | 'uk' | 'portugal' | 'alemania' | 'uruguay';

export interface TeamMember {
  id: string;
  name: string;
  nationality?: Nationality;
  countryKey?: CountryKey;
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  { id: 'cogollos',   name: 'Ángel Cogollos' },
  { id: 'castello',   name: 'Santiago Castello' },
  { id: 'castell',    name: 'Ángel Castell',     nationality: 'ES', countryKey: 'arabia' },
  { id: 'weggelaar',  name: 'Bibiana Weggelaar', nationality: 'ES', countryKey: 'uk' },
  { id: 'canoa',      name: 'Pedro Canoa',       nationality: 'PT', countryKey: 'portugal' },
  { id: 'leon',       name: 'Diego León',        nationality: 'ES', countryKey: 'alemania' },
  { id: 'nanini',     name: 'Thiago Nanini',     nationality: 'ES', countryKey: 'uruguay' },
  { id: 'caserza',    name: 'Javier Caserza' },
  { id: 'hernansanz', name: 'Diego Hernansanz' },
  { id: 'martin',     name: 'Ismael Martín' },
  { id: 'lopez',      name: 'Daniel López' },
  { id: 'alvarez',    name: 'Javier Álvarez' },
  { id: 'garcia',     name: 'Moisés García' },
  { id: 'sancho',     name: 'Esteban Sancho' },
  { id: 'granados',   name: 'Alberto Granados' },
  { id: 'gomez',      name: 'Juan Luis Gómez' },
  { id: 'toledo',     name: 'Diego Toledo' },
  { id: 'marin',      name: 'Jaime Marín' },
  { id: 'alcazar',    name: 'Eva Alcázar' },
  { id: 'rodriguez',  name: 'María Rodríguez' },
  { id: 'salles',     name: 'Jordi Sallés' },
] as const;

export interface RenderableMember {
  id: string;
  index: string;          // '01', '02', ..., '21'
  name: string;
  role: string;
  nationality?: Nationality;
  country?: string;
  defaultLocation: string;
}

export function getTeamMembers(lang: Lang): RenderableMember[] {
  const t = useTranslations(lang);
  const defaultLocation = t('team.defaultLocation' as TranslationKey);
  return TEAM_MEMBERS.map((m, i) => ({
    id: m.id,
    index: String(i + 1).padStart(2, '0'),
    name: m.name,
    role: t(`team.members.${m.id}.role` as TranslationKey),
    nationality: m.nationality,
    country: m.countryKey ? t(`team.countries.${m.countryKey}` as TranslationKey) : undefined,
    defaultLocation,
  }));
}
