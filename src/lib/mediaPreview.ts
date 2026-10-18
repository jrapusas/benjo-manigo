/** Preview URL for Keystatic admin thumbnails. */
export function getMediaPreviewPath(slug: string): string {
  return `/api/media-preview/${encodeURIComponent(slug)}`;
}
