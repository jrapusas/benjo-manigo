import fs from 'node:fs';
import path from 'node:path';
import {
  MEDIA_FILE_BASENAME,
  MEDIA_FILE_DIRECTORY,
  mediaSlugFromRef,
} from '../keystatic/fields/mediaFileUtils';
import { isCatalogIconId, normalizeIconId } from '../keystatic/iconCatalog';
import { tablerIconFromSlug } from './tablerIcons';

export function resolveIconSrc(src?: string | null): string | null {
  if (!src) return null;
  return src;
}

export function slugFromIconSrc(src: string): string | null {
  const previewMatch = src.match(/^\/api\/media-preview\/([^/]+)$/);
  if (previewMatch) return previewMatch[1];

  if (isCatalogIconId(src)) return normalizeIconId(src);
  return mediaSlugFromRef(src) ?? (src.startsWith('icon-') ? src.split('/')[0] : null);
}

export function publicSvgFilePath(src: string): string | null {
  const slug = slugFromIconSrc(src);
  if (slug) {
    const contentPath = path.join(
      process.cwd(),
      MEDIA_FILE_DIRECTORY,
      slug,
      `${MEDIA_FILE_BASENAME}.svg`,
    );
    if (fs.existsSync(contentPath)) return contentPath;
  }

  if (src.startsWith('/images/media/') && src.endsWith('.svg')) {
    const legacy = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
    if (fs.existsSync(legacy)) return legacy;
  }

  return null;
}

export function injectSvgClass(svg: string, className: string): string {
  if (/class="/.test(svg)) {
    return svg.replace(/class="([^"]*)"/, (_, existing: string) =>
      existing.includes(className) ? `class="${existing}"` : `class="${existing} ${className}"`,
    );
  }
  return svg.replace(/<svg\b/, `<svg class="${className}"`);
}

/** Inline SVG tuned for section/card link color tokens. */
export function prepareInlineIconSvg(raw: string, className = 'h-8 w-8'): string {
  const svg = raw
    .replace(/\swidth="[^"]*"/g, '')
    .replace(/\sheight="[^"]*"/g, '')
    .replace(/stroke="currentColor"/g, 'stroke="var(--color-link)"')
    .replace(/fill="currentColor"/g, 'fill="var(--color-link)"');

  return injectSvgClass(svg, `${className} shrink-0`);
}

/** Read a media SVG and prepare it for inline rendering on the site. */
export function readPublicSvg(
  src: string | null | undefined,
  className = 'h-8 w-8',
): string | null {
  const filePath = publicSvgFilePath(src ?? '');
  if (filePath) {
    return prepareInlineIconSvg(fs.readFileSync(filePath, 'utf8'), className);
  }

  const slug = slugFromIconSrc(src ?? '');
  if (!slug) return null;

  const tabler = tablerIconFromSlug(slug, `${className} shrink-0`);
  if (!tabler) return null;

  return tabler
    .replace(/stroke="currentColor"/g, 'stroke="var(--color-link)"')
    .replace(/fill="currentColor"/g, 'fill="var(--color-link)"');
}

/** SVG safe for `<img src="...">` (xmlns + fixed stroke/fill). */
export function prepareSvgForImagePreview(
  raw: string,
  color = '#334155',
  size = 128,
): string {
  const svg = raw.trim().replace(/currentColor/g, color);
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs
      .replace(/\sxmlns="[^"]*"/g, '')
      .replace(/\swidth="[^"]*"/g, '')
      .replace(/\sheight="[^"]*"/g, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"${cleaned}>`;
  });
}

/** Fixed-color SVG for admin previews and `<img>` contexts. */
export function readPublicSvgForPreview(
  src: string | null | undefined,
  color = '#334155',
): string | null {
  const filePath = publicSvgFilePath(src ?? '');
  if (!filePath) return null;
  return prepareSvgForImagePreview(fs.readFileSync(filePath, 'utf8'), color);
}
