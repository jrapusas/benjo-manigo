import type { Oklch } from './types';

/** sRGB channel 0–255 → linear 0–1 */
function srgbToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** linear 0–1 → sRGB channel 0–255 */
function linearToSrgb(channel: number): number {
  const value =
    channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(255, value * 255)));
}

/** #rgb or #rrggbb → [r, g, b] */
export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().toLowerCase();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/u.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  if (normalized.length === 4) {
    const [, r, g, b] = normalized;
    return [
      parseInt(`${r}${r}`, 16),
      parseInt(`${g}${g}`, 16),
      parseInt(`${b}${b}`, 16),
    ];
  }
  return [
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.max(0, Math.min(255, channel)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** sRGB hex → OKLCH (L 0–1, C ≥ 0, H 0–360) */
export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const L = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bLab = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  const C = Math.sqrt(a * a + bLab * bLab);
  let H = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/** OKLCH → sRGB hex */
export function oklchToHex({ l, c, h }: Oklch): string {
  const hueRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hueRad);
  const bLab = c * Math.sin(hueRad);

  const lRoot = l + 0.3963377774 * a + 0.2158037573 * bLab;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * bLab;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * bLab;

  const lLin = lRoot ** 3;
  const mLin = mRoot ** 3;
  const sLin = sRoot ** 3;

  const lr = 4.0767416621 * lLin - 3.3077115913 * mLin + 0.2309699292 * sLin;
  const lg = -1.2684380046 * lLin + 2.6097574011 * mLin - 0.3413193965 * sLin;
  const lb = -0.0041960863 * lLin - 0.7034186147 * mLin + 1.707614701 * sLin;

  return rgbToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb));
}

export function clampOklch(color: Oklch): Oklch {
  return {
    l: Math.max(0, Math.min(1, color.l)),
    c: Math.max(0, color.c),
    h: ((color.h % 360) + 360) % 360,
  };
}

export function withOklch(
  base: Oklch,
  patch: Partial<Oklch>,
): Oklch {
  return clampOklch({ ...base, ...patch });
}
