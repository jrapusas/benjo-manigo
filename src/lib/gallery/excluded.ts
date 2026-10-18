/** On-disk WebPs omitted from Work gallery grids, counts, and category covers. */
export const GALLERY_EXCLUDED_IDS = new Set<string>([
  'floral/floral-04-cream-roses-butterfly.webp',
]);

export function isGalleryPaintingExcluded(category: string, filename: string): boolean {
  return GALLERY_EXCLUDED_IDS.has(`${category}/${filename}`);
}
