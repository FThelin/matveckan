import type { DayOfWeek } from './types';

export const DEFAULT_TAGS = [
  'Vegetariskt',
  'Kott',
  'Fisk',
  'Fredagsmys',
  'Pasta',
  'Snabbt',
] as const;

export const DAYS: DayOfWeek[] = [
  'Mondag',
  'Tisdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lordag',
  'Sondag',
];
