import { describe, expect, it } from 'vitest';
import { mediaOptionFromYaml, sortMediaOptions } from './mediaCatalog';

describe('mediaCatalog', () => {
  it('builds dropdown options from media yaml', () => {
    const option = mediaOptionFromYaml(
      'home-tell-us',
      `title: Home - Tell Us
category: photo
file: /images/media/file.jpg
`,
    );

    expect(option).toEqual({
      slug: 'home-tell-us',
      src: '/api/media-preview/home-tell-us',
      label: 'Home - Tell Us',
      category: 'photo',
      previewSrc: '/api/media-preview/home-tell-us',
    });
  });

  it('maps legacy icon category to logo', () => {
    const option = mediaOptionFromYaml(
      'logo-client-1',
      `title: Mitchell Legal Group
category: icon
`,
    );

    expect(option.category).toBe('logo');
    expect(option.src).toBe('/api/media-preview/logo-client-1');
  });

  it('sorts options alphabetically by label', () => {
    const sorted = sortMediaOptions([
      { slug: 'z-last', src: '', label: 'Zebra', category: 'photo', previewSrc: '' },
      { slug: 'a-first', src: '', label: 'About Hero', category: 'photo', previewSrc: '' },
      { slug: 'm-mid', src: '', label: 'Home Main', category: 'photo', previewSrc: '' },
    ]);

    expect(sorted.map((item) => item.label)).toEqual([
      'About Hero',
      'Home Main',
      'Zebra',
    ]);
  });
});
