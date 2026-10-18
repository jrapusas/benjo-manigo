import type { NavItem } from './navigation';

export const DEV_ONLY_PATHS = new Set(['/blocks', '/blocks-extended', '/blocks-extreme']);

export const DEV_SHOWCASE_QUERY_PARAM = 'dev';
export const DEV_SHOWCASE_QUERY_VALUE = 'true';

/** Strip dev-only routes from navigation. */
export function navigationForEnv(navigation: NavItem[]): NavItem[] {
  return navigation
    .filter((item) => !DEV_ONLY_PATHS.has(item.href))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => !DEV_ONLY_PATHS.has(child.href)),
    }));
}

export function withDevShowcaseQuery(path: string): string {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set(DEV_SHOWCASE_QUERY_PARAM, DEV_SHOWCASE_QUERY_VALUE);
  return `${url.pathname}${url.search}`;
}

export function hasDevShowcaseAccess(url: URL): boolean {
  return url.searchParams.get(DEV_SHOWCASE_QUERY_PARAM) === DEV_SHOWCASE_QUERY_VALUE;
}

/** Block showcase pages in production; in dev require `?dev=true` (set in middleware). */
export function guardDevOnlyPage(astro: {
  redirect: (path: string) => Response;
  locals: App.Locals;
}): Response | undefined {
  if (import.meta.env.PROD) {
    return astro.redirect('/');
  }

  if (!astro.locals.devShowcase) {
    return astro.redirect('/');
  }
}
