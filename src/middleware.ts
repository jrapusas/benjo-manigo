import { defineMiddleware } from 'astro:middleware';
import { DEV_SHOWCASE_QUERY_PARAM, DEV_SHOWCASE_QUERY_VALUE } from './lib/devOnly';

export const onRequest = defineMiddleware(async (context, next) => {
  const devShowcase =
    context.url.searchParams.get(DEV_SHOWCASE_QUERY_PARAM) === DEV_SHOWCASE_QUERY_VALUE;
  context.locals.devShowcase = devShowcase;
  return next();
});
