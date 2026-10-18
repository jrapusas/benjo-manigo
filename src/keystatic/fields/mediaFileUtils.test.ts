import { describe, expect, it } from 'vitest';
import {
  canonicalMediaFilename,
  canonicalMediaPublicPath,
  getMediaAssetSrcPrefix,
  isExternalMediaPath,
  mediaSlugFromRef,
  normalizeUploadedMediaPath,
  relativeMediaPathFromValue,
} from './mediaFileUtils';

describe('mediaFileUtils', () => {
  it('builds slug-scoped legacy public prefixes', () => {
    expect(getMediaAssetSrcPrefix('home-understand')).toBe(
      '/images/media/home-understand/',
    );
  });

  it('builds canonical filenames', () => {
    expect(canonicalMediaFilename('jpg')).toBe('file.jpg');
    expect(canonicalMediaFilename('svg')).toBe('file.svg');
  });

  it('builds legacy public paths', () => {
    expect(canonicalMediaPublicPath('home-main')).toBe(
      '/images/media/home-main/file.jpg',
    );
  });

  it('reads relative paths from stored values', () => {
    expect(relativeMediaPathFromValue('file.jpg', 'home-understand')).toBe(
      'file.jpg',
    );
    expect(
      relativeMediaPathFromValue(
        '/images/media/home-understand/file.jpg',
        'home-understand',
      ),
    ).toBe('file.jpg');
  });

  it('normalizes legacy paths to file.{ext}', () => {
    expect(normalizeUploadedMediaPath('/images/media/home-main.jpg', 'home-main')).toBe(
      'file.jpg',
    );
    expect(
      normalizeUploadedMediaPath(
        '/images/media/home-understand/home-understand.jpg',
        'home-understand',
      ),
    ).toBe('file.jpg');
    expect(
      normalizeUploadedMediaPath('/images/media/file.jpg', 'home-understand'),
    ).toBe('file.jpg');
  });

  it('detects external paths', () => {
    expect(isExternalMediaPath('https://cdn.example/a.jpg')).toBe(true);
    expect(isExternalMediaPath('file.webp')).toBe(false);
    expect(isExternalMediaPath('/images/media/home-main/file.webp')).toBe(false);
  });

  it('extracts slugs from refs', () => {
    expect(mediaSlugFromRef('home-main')).toBe('home-main');
    expect(mediaSlugFromRef('/images/media/home-main/file.webp')).toBe('home-main');
    expect(mediaSlugFromRef('file.webp')).toBeNull();
  });
});
