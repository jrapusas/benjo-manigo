import type { APIRoute } from 'astro';
import { iconIdToTablerName, normalizeIconId } from '../../../keystatic/iconCatalog';
import { prepareSvgForImagePreview } from '../../../lib/iconSvg';
import { getIconData, iconToSVG } from '@iconify/utils';
import tabler from '@iconify-json/tabler/icons.json';

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
  const rawId = params.id;
  if (!rawId) {
    return new Response('Not found', { status: 404 });
  }

  const id = normalizeIconId(rawId);
  const tablerName = iconIdToTablerName(id ?? rawId);
  if (!tablerName) {
    return new Response('Not found', { status: 404 });
  }

  const data = getIconData(tabler, tablerName);
  if (!data) {
    return new Response('Not found', { status: 404 });
  }

  const { attributes, body } = iconToSVG(data, { width: '128', height: '128' });
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const svg = prepareSvgForImagePreview(`<svg ${attrs} aria-hidden="true">${body}</svg>`);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': import.meta.env.DEV ? 'no-store' : 'public, max-age=3600',
    },
  });
};
