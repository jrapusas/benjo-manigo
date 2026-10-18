import fs from 'node:fs';
import path from 'node:path';
import {
  GALLERY_CATEGORIES,
  type GalleryCategorySlug,
  galleryCategoryLabel,
} from './categories';
import { isGalleryPaintingExcluded } from './excluded';

export type GalleryPainting = {
  id: string;
  category: GalleryCategorySlug;
  src: string;
  alt: string;
  filename: string;
};

const GALLERY_PUBLIC_ROOT = path.join(process.cwd(), 'public/images/gallery');

function humanizeFilename(filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  const slug = base.replace(/^[^-]+-\d+-/, '');
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function listPaintingsForCategory(category: GalleryCategorySlug): GalleryPainting[] {
  const dir = path.join(GALLERY_PUBLIC_ROOT, category);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => /\.webp$/i.test(name))
    .filter((name) => !isGalleryPaintingExcluded(category, name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((filename) => ({
      id: `${category}/${filename}`,
      category,
      src: `/images/gallery/${category}/${filename}`,
      alt: `${humanizeFilename(filename)} — ${galleryCategoryLabel(category)} oil painting by Jonathan “Benjo” Manigo`,
      filename,
    }));
}

export function listAllPaintings(): GalleryPainting[] {
  return GALLERY_CATEGORIES.flatMap((c) => listPaintingsForCategory(c.slug));
}

export function categorySummaries() {
  return GALLERY_CATEGORIES.map((category) => {
    const paintings = listPaintingsForCategory(category.slug);
    const cover = paintings[0];
    return {
      ...category,
      count: paintings.length,
      coverSrc: cover?.src,
      coverAlt: cover?.alt ?? `${category.label} gallery`,
      href: `/work/${category.slug}`,
    };
  }).filter((row) => row.count > 0);
}

export function isGalleryCategorySlug(value: string): value is GalleryCategorySlug {
  return GALLERY_CATEGORIES.some((c) => c.slug === value);
}

export { galleryCategoryLabel } from './categories';
