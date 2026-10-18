import type { NamedColorScheme } from './types';

/** Deep navy + off-white + restrained teal - regulatory authority without government aesthetics. */
export const CLIENT_SCHEME: NamedColorScheme = {
  id: 'client',
  label: 'Client',
  description:
    'Deep navy brand anchor with off-white surfaces and restrained teal accents for links and highlights.',
  appearances: {
    default: {
      primitives: {
        background: '#ffffff',
        text: '#17212b',
        buttonBg: '#12304a',
        buttonText: '#ffffff',
      },
      semantic: {
        heading: '#12304a',
        link: '#167c80',
      },
    },
    soft: {
      primitives: {
        background: '#f5f7f9',
        text: '#17212b',
        buttonBg: '#12304a',
        buttonText: '#ffffff',
      },
      semantic: {
        heading: '#12304a',
        link: '#167c80',
      },
    },
    tinted: {
      primitives: {
        background: '#eef7f7',
        text: '#17212b',
        buttonBg: '#12304a',
        buttonText: '#ffffff',
      },
      semantic: {
        heading: '#12304a',
        link: '#167c80',
      },
    },
    contrast: {
      primitives: {
        background: '#12304a',
        text: '#e8eef2',
        buttonBg: '#ffffff',
        buttonText: '#12304a',
      },
      semantic: {
        heading: '#ffffff',
        link: '#e8eef2',
      },
    },
    accent: {
      primitives: {
        background: '#12304a',
        text: '#ffffff',
        buttonBg: '#167c80',
        buttonText: '#ffffff',
      },
      semantic: {
        heading: '#ffffff',
        link: '#ffffff',
      },
    },
    dark: {
      primitives: {
        background: '#0b1f2e',
        text: '#ffffff',
        buttonBg: '#167c80',
        buttonText: '#ffffff',
      },
      semantic: {
        subheading: '#aebbc4',
        link: '#ffffff',
      },
    },
  },
};
