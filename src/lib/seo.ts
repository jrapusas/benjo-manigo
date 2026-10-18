import type { SeoFields } from './types';
import { siteConfig } from '../config/site';

// SeoFields from Keystatic + required title/path for every page
type SeoInput = SeoFields & {
  title: string;
  path: string;
};

// Pure TypeScript function (not an Astro component) - safe to import anywhere.
// Runs at build time when pages call it in their frontmatter.
export function buildSeo({
  title,
  path,
  seoTitle,
  metaDescription,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
}: SeoInput) {
  const pageTitle = seoTitle || title;
  const description = metaDescription || siteConfig.defaultSeo.description;
  // new URL(relative, base) - builds absolute URLs for canonical/OG tags
  const url = canonicalUrl || new URL(path, siteConfig.url).toString();
  const image = ogImage || siteConfig.defaultSeo.ogImage;

  return {
    title: pageTitle.includes(siteConfig.name)
      ? pageTitle
      : `${pageTitle} | ${siteConfig.name}`,
    description,
    canonical: url,
    openGraph: {
      title: ogTitle || pageTitle,
      description: ogDescription || description,
      image,
      url,
    },
  };
}
