import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import fs from 'node:fs';
import path from 'node:path';
import {
  MEDIA_FILE_BASENAME,
  MEDIA_FILE_DIRECTORY,
  mediaSlugFromRef,
  normalizeUploadedMediaPath,
  relativeMediaPathFromValue,
} from '../keystatic/fields/mediaFileUtils';
import { resolveMediaPreviewSlug } from './mediaPreviewSlug';
import { reader } from './reader';

export type ResolvedMedia = {
  src: string;
  alt: string;
  image?: ImageMetadata;
};

const cache = new Map<string, ResolvedMedia | null>();
const devRasterCache = new Map<string, { mtimeMs: number; image: ImageMetadata }>();

const rasterLoaders = import.meta.glob<{ default: ImageMetadata }>(
  '../content/media/**/*.{avif,gif,jpeg,jpg,png,webp}',
);

function readCached(ref: string) {
  if (import.meta.env.DEV) return undefined;
  return cache.get(ref);
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function globKey(slug: string, filename: string) {
  return `../content/media/${slug}/${filename}`;
}

function svgSrcForSlug(slug: string) {
  const contentSvg = path.join(
    process.cwd(),
    MEDIA_FILE_DIRECTORY,
    slug,
    `${MEDIA_FILE_BASENAME}.svg`,
  );
  if (fs.existsSync(contentSvg)) {
    return `/api/media-preview/${slug}`;
  }

  const legacy = `/images/media/${slug}/file.svg`;
  const disk = path.join(process.cwd(), 'public', legacy.slice(1));
  return fs.existsSync(disk) ? legacy : '';
}

function loaderKeyForSlug(slug: string, filename?: string): string | undefined {
  const keys = Object.keys(rasterLoaders);
  if (filename) {
    const exact = globKey(slug, filename);
    if (keys.includes(exact)) return exact;
  }

  const suffix = `/content/media/${slug}/`;
  return keys.find((key) => {
    const normalized = key.replace(/^\.\./, '/src');
    return key.includes(suffix) || normalized.includes(suffix);
  });
}

async function rasterForSlug(
  slug: string,
  filename?: string,
): Promise<ImageMetadata | undefined> {
  const key = loaderKeyForSlug(slug, filename);
  if (!key) return undefined;

  const load = rasterLoaders[key];
  if (!load) return undefined;

  if (!import.meta.env.DEV) {
    return (await load()).default;
  }

  const diskPath = path.join(
    process.cwd(),
    MEDIA_FILE_DIRECTORY,
    slug,
    filename ?? 'file.jpg',
  );
  const mtimeMs = fs.existsSync(diskPath) ? fs.statSync(diskPath).mtimeMs : 0;
  const cached = devRasterCache.get(key);
  if (cached && cached.mtimeMs === mtimeMs) return cached.image;

  const image = (await load()).default;
  devRasterCache.set(key, { mtimeMs, image });
  return image;
}

/** Resolve a media slug or legacy public path to src + optional ImageMetadata. */
export async function resolveMedia(
  ref: string | null | undefined,
): Promise<ResolvedMedia | null> {
  if (!ref) return null;

  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/_astro/')) {
    return { src: ref, alt: '' };
  }

  const cached = readCached(ref);
  if (cached !== undefined) return cached;

  const rawSlug = mediaSlugFromRef(ref);
  if (!rawSlug) {
    if (ref.startsWith('/')) return { src: ref, alt: '' };
    return null;
  }

  const slug = resolveMediaPreviewSlug(rawSlug);
  const entry = await reader.collections.media.read(slug);
  const filename = entry?.file
    ? relativeMediaPathFromValue(
        normalizeUploadedMediaPath(String(entry.file), slug),
        slug,
      )
    : undefined;

  const raster = await rasterForSlug(slug, filename);
  const alt =
    entry?.alt != null && String(entry.alt).trim()
      ? String(entry.alt).trim()
      : humanizeSlug(slug);

  const resolved: ResolvedMedia | null = raster
    ? { src: raster.src, alt, image: raster }
    : entry
      ? { src: svgSrcForSlug(slug), alt }
      : null;

  if (!import.meta.env.DEV) cache.set(ref, resolved);
  return resolved;
}

export async function resolveMediaSrc(
  ref: string | null | undefined,
): Promise<string | null> {
  const media = await resolveMedia(ref);
  if (!media) return null;
  if (media.image) {
    const optimized = await getImage({
      src: media.image,
      width: 1200,
      format: 'webp',
    });
    return optimized.src;
  }
  return media.src || null;
}

export async function resolveOgImage(
  ref?: string | null,
): Promise<string | undefined> {
  if (
    ref?.startsWith('/_astro/') ||
    ref?.startsWith('http') ||
    ref?.startsWith('/images/')
  ) {
    return ref;
  }
  return (
    (await resolveMediaSrc(ref)) ??
    (await resolveMediaSrc('og-default')) ??
    undefined
  );
}
