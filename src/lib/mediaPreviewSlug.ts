/** Resolve media slug for preview API (aliases for renamed / blocked paths). */
const PREVIEW_SLUG_ALIASES: Record<string, string> = {
  // Ad blockers often block URLs containing "delivery" (ad-delivery trackers).
  'icon-delivery': 'icon-package',
};

export function resolveMediaPreviewSlug(slug: string): string {
  return PREVIEW_SLUG_ALIASES[slug] ?? slug;
}
