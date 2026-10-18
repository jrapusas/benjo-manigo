/** Site-specific branding and defaults - swap per client project. */

import { artistNamePlain, artistNameWithTagline } from '../lib/artistName';

export const siteConfig = {
  name: artistNameWithTagline,
  shortName: 'Benjo Manigo',
  tagline: 'Oil paintings',
  url: 'https://benjo-manigo.example.com',
  locale: 'en-PH',
  defaultSeo: {
    title: 'Jonathan “Benjo” Manigo | Oil paintings',
    description:
      'Gallery of oil paintings by Filipino artist Jonathan “Benjo” Manigo — portraits, landscapes, seascapes, and more.',
    ogImage: '/images/gallery/seascapes/seascapes-01-fishermen-bangka.webp',
  },
  contact: {
    email: '[INQUIRY_EMAIL]',
    phone: '',
    address: '',
  },
  social: {
    facebookPhotos: 'https://www.facebook.com/jonathanbenjo.manigo/photos',
  },
  cta: {
    primary: { label: 'Commission a painting', href: '/commission' },
    secondary: { label: 'View work', href: '/work' },
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
  ],
  footer: {
    description:
      'Oil paintings by Jonathan “Benjo” Manigo. Browse the gallery by genre.',
    services: [
      { label: 'Portraits', href: '/work/portraits' },
      { label: 'Landscapes', href: '/work/landscapes' },
      { label: 'Seascapes', href: '/work/seascapes' },
      { label: 'Floral', href: '/work/floral' },
      { label: 'Still life', href: '/work/still-life' },
      { label: 'Animals', href: '/work/animals' },
      { label: 'Christian', href: '/work/christian' },
      { label: 'Rural life', href: '/work/rural-life' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Commission', href: '/commission' },
      { label: 'All work', href: '/work' },
    ],
    resources: [] as Array<{ label: string; href: string }>,
    legal: [] as Array<{ label: string; href: string }>,
  },
} as const;
