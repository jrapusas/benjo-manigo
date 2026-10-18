import type { APIRoute } from 'astro';
import { liveSiteHidden } from '../lib/liveSite';
import { siteConfig } from '../config/site';

export const GET: APIRoute = () => {
  const body = liveSiteHidden
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap-index.xml\n`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
