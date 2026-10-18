import { withDevShowcaseQuery } from './devOnly';

export const KEYSTATIC_SITE_LINKS = [
  { href: '/', label: 'Homepage' },
  { href: withDevShowcaseQuery('/blocks'), label: 'Blocks' },
  { href: withDevShowcaseQuery('/blocks-extended'), label: 'Blocks extended' },
  { href: withDevShowcaseQuery('/blocks-extreme'), label: 'Blocks extreme' },
] as const;
