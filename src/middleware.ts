import { defineMiddleware } from 'astro:middleware';
import { DEV_SHOWCASE_QUERY_PARAM, DEV_SHOWCASE_QUERY_VALUE } from './lib/devOnly';
import { holdingPageHtml, shouldHideLivePage } from './lib/liveSite';

export const onRequest = defineMiddleware(async (context, next) => {
  if (shouldHideLivePage(context.url.pathname)) {
    return new Response(holdingPageHtml(), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  const devShowcase =
    context.url.searchParams.get(DEV_SHOWCASE_QUERY_PARAM) === DEV_SHOWCASE_QUERY_VALUE;
  context.locals.devShowcase = devShowcase;
  return next();
});
