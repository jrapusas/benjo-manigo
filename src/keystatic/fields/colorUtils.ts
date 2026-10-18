export const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return withHash.toLowerCase();
}

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(normalizeHexColor(value));
}

/** Expand #rgb to #rrggbb for <input type="color">. */
export function toColorInputValue(hex: string): string {
  const normalized = normalizeHexColor(hex);
  if (!isValidHexColor(normalized)) return '#000000';
  if (normalized.length === 4) {
    const [, r, g, b] = normalized;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return normalized;
}
