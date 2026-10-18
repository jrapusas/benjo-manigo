/** Preview URL for catalog icons in Keystatic admin. */
export function getIconPreviewPath(id: string): string {
  return `/api/icon-preview/${encodeURIComponent(id)}`;
}
