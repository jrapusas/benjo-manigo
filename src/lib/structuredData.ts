import { artistNamePlain } from './artistName';
import { siteConfig } from '../config/site';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artistNamePlain,
    alternateName: 'Benjo Manigo',
    description: siteConfig.tagline,
    url: siteConfig.url,
    jobTitle: 'Oil painter',
    nationality: {
      '@type': 'Country',
      name: 'Philippines',
    },
    knowsAbout: [
      'Oil painting',
      'Portraits',
      'Landscapes',
      'Seascapes',
      'Still life',
      'Murals',
      'Commission art',
    ],
  };
}
