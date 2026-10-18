import { hexToRgb } from './oklch';

export const CONTRAST = {
  normalText: 4.5,
  largeText: 3,
  ui: 3,
  linkHover: 4,
} as const;

/** WCAG relative luminance for sRGB hex. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrast(
  foreground: string,
  background: string,
  minimum = CONTRAST.normalText,
): boolean {
  return contrastRatio(foreground, background) >= minimum;
}

/** Push foreground lightness in OKLCH space until contrast passes. */
export function ensureContrast(
  foregroundHex: string,
  backgroundHex: string,
  minimum = CONTRAST.normalText,
  toOklch: (hex: string) => { l: number; c: number; h: number },
  fromOklch: (color: { l: number; c: number; h: number }) => string,
): string {
  if (meetsContrast(foregroundHex, backgroundHex, minimum)) {
    return foregroundHex;
  }

  const fg = toOklch(foregroundHex);
  const preferDark = relativeLuminance(backgroundHex) > 0.55;

  for (let step = 1; step <= 40; step += 1) {
    const delta = step * 0.025;
    const darker = fromOklch({
      l: Math.max(0.05, fg.l - delta),
      c: Math.max(0, fg.c * (1 - step * 0.012)),
      h: fg.h,
    });
    const lighter = fromOklch({
      l: Math.min(0.98, fg.l + delta),
      c: Math.max(0, fg.c * (1 - step * 0.012)),
      h: fg.h,
    });
    const primary = preferDark ? darker : lighter;
    const secondary = preferDark ? lighter : darker;
    if (meetsContrast(primary, backgroundHex, minimum)) return primary;
    if (meetsContrast(secondary, backgroundHex, minimum)) return secondary;
  }

  const darkFallback = '#0f172a';
  const lightFallback = '#ffffff';
  if (preferDark) {
    if (meetsContrast(darkFallback, backgroundHex, minimum)) return darkFallback;
    if (meetsContrast(lightFallback, backgroundHex, minimum)) return lightFallback;
  } else {
    if (meetsContrast(lightFallback, backgroundHex, minimum)) return lightFallback;
    if (meetsContrast(darkFallback, backgroundHex, minimum)) return darkFallback;
  }

  return preferDark
    ? contrastRatio(darkFallback, backgroundHex) >=
        contrastRatio(lightFallback, backgroundHex)
      ? darkFallback
      : lightFallback
    : contrastRatio(lightFallback, backgroundHex) >=
        contrastRatio(darkFallback, backgroundHex)
      ? lightFallback
      : darkFallback;
}
