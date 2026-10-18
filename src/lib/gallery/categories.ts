export const GALLERY_CATEGORIES = [
  { slug: 'portraits', label: 'Portraits' },
  { slug: 'landscapes', label: 'Landscapes' },
  { slug: 'seascapes', label: 'Seascapes' },
  { slug: 'floral', label: 'Floral' },
  { slug: 'still-life', label: 'Still life' },
  { slug: 'animals', label: 'Animals' },
  { slug: 'christian', label: 'Christian' },
  { slug: 'rural-life', label: 'Rural life' },
] as const;

export type GalleryCategorySlug = (typeof GALLERY_CATEGORIES)[number]['slug'];

export const GALLERY_CATEGORY_SLUGS: GalleryCategorySlug[] = GALLERY_CATEGORIES.map(
  (c) => c.slug,
);

export function galleryCategoryLabel(slug: string): string {
  return GALLERY_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function paintingTypeOptions() {
  return [
    ...GALLERY_CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
    { value: 'other', label: 'Other' },
  ];
}
