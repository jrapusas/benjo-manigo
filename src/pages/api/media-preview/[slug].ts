import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import {
  MEDIA_FILE_BASENAME,
  MEDIA_FILE_DIRECTORY,
} from '../../../keystatic/fields/mediaFileUtils';
import { prepareSvgForImagePreview } from '../../../lib/iconSvg';
import { resolveMediaPreviewSlug } from '../../../lib/mediaPreviewSlug';
import { tablerIconSvgForPreview } from '../../../lib/tablerIcons';

export const prerender = false;

const MIME: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml; charset=utf-8',
  webp: 'image/webp',
};

export const GET: APIRoute = ({ params }) => {
  const rawSlug = params.slug;
  if (!rawSlug) {
    return new Response('Not found', { status: 404 });
  }

  const slug = resolveMediaPreviewSlug(rawSlug);
  const dir = path.join(process.cwd(), MEDIA_FILE_DIRECTORY, slug);
  for (const ext of ['webp', 'jpg', 'jpeg', 'png', 'gif', 'avif', 'svg'] as const) {
    const filePath = path.join(dir, `${MEDIA_FILE_BASENAME}.${ext}`);
    if (!fs.existsSync(filePath)) continue;

    if (ext === 'svg') {
      const svg = prepareSvgForImagePreview(fs.readFileSync(filePath, 'utf8'));
      return new Response(svg, {
        headers: {
          'Content-Type': MIME.svg,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const cacheControl = import.meta.env.DEV
      ? 'no-store'
      : 'public, max-age=3600';

    return new Response(fs.readFileSync(filePath), {
      headers: {
        'Content-Type': MIME[ext],
        'Cache-Control': cacheControl,
      },
    });
  }

  const svg = tablerIconSvgForPreview(slug, {
    size: 128,
    className: 'ks-media-table-thumb-svg',
  });

  if (!svg) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(prepareSvgForImagePreview(svg), {
    headers: {
      'Content-Type': MIME.svg,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
