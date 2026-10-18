import { hexToRgb, rgbToHex } from './oklch';

/** sRGB mix matching CSS `color-mix(in srgb, fg W%, bg)`. */
export function mixSrgb(foreground: string, background: string, foregroundWeight: number): string {
  const [r1, g1, b1] = hexToRgb(foreground);
  const [r2, g2, b2] = hexToRgb(background);
  const weight = foregroundWeight;
  return rgbToHex(
    r1 * weight + r2 * (1 - weight),
    g1 * weight + g2 * (1 - weight),
    b1 * weight + b2 * (1 - weight),
  );
}

/** Legacy 0–100 weight mix used by Keystatic admin helpers. */
export function mixHex(foreground: string, background: string, foregroundWeightPercent: number): string {
  return mixSrgb(foreground, background, foregroundWeightPercent / 100);
}
