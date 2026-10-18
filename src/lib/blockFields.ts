export function hasText(value?: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isSliderVariant(variant?: string | null): boolean {
  return variant === 'slider';
}

export function hasButton(
  button?: { label?: string; url?: string } | null,
): button is { label: string; url: string } {
  return hasText(button?.label) && hasText(button?.url);
}

export function hasDocument(document?: unknown[] | null): boolean {
  return Array.isArray(document) && document.length > 0;
}
