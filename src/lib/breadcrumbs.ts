import { siteConfig } from '../config/site';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

function cleanPageTitle(title: string): string {
  let cleaned = title;
  const pipeSuffix = ` | ${siteConfig.name}`;
  if (cleaned.endsWith(pipeSuffix)) {
    cleaned = cleaned.slice(0, -pipeSuffix.length);
  }
  const dottedSuffix = ` · ${siteConfig.name}`;
  if (cleaned.endsWith(dottedSuffix)) {
    cleaned = cleaned.slice(0, -dottedSuffix.length);
  }
  return cleaned;
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function buildBreadcrumbs(
  pathname: string,
  pageTitle: string,
  pathLabels: Record<string, string> = {},
): BreadcrumbItem[] {
  if (pathname === '/') return [];

  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  let path = '';

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    path += `/${segment}`;
    const isLast = index === segments.length - 1;

    crumbs.push(
      isLast
        ? { label: cleanPageTitle(pageTitle) }
        : {
            label: pathLabels[path] ?? formatSegmentLabel(segment),
            href: path,
          },
    );
  }

  return crumbs;
}
