import { CONTRAST, contrastRatio, relativeLuminance } from './contrast';
import { mixHex } from './mix';
import { hexToRgb } from './oklch';
import { normalizeHexColor } from '../../keystatic/fields/colorUtils';

const MIN_TEXT_ON_SURFACE_CONTRAST = CONTRAST.normalText;
const LIGHT_BODY_TEXT = new Set(['#ffffff', '#f8fafc', '#f1f5f9']);
const LIGHT_BODY_LUMINANCE = 0.85;

function isLightBodyText(text: string): boolean {
  const normalized = normalizeHexColor(text);
  return (
    LIGHT_BODY_TEXT.has(normalized) ||
    relativeLuminance(normalized) >= LIGHT_BODY_LUMINANCE
  );
}

function surfaceSaturation(background: string): number {
  const [red, green, blue] = hexToRgb(background);
  const [, saturation] = rgbToHsl(red, green, blue);
  return saturation;
}

/** Light text on dark or saturated brand surfaces - links stay light, not brand-fill colored. */
export function usesLightTextContrastMode(background: string, text: string): boolean {
  if (!isLightBodyText(text)) return false;
  if (relativeLuminance(background) <= 0.5) return true;
  return surfaceSaturation(background) >= 28;
}

function resolveSecondaryForeground(preferred: string, background: string): string {
  const fg = normalizeHexColor(preferred);
  if (contrastRatio(fg, background) < MIN_TEXT_ON_SURFACE_CONTRAST) {
    return contrastRatio('#0f172a', background) >= MIN_TEXT_ON_SURFACE_CONTRAST
      ? '#0f172a'
      : '#ffffff';
  }
  return fg;
}

function ensureContrastOnSurface(
  foreground: string,
  background: string,
  minContrast = MIN_TEXT_ON_SURFACE_CONTRAST,
): string {
  let fg = normalizeHexColor(foreground);
  if (textContrastsSurface(fg, background, minContrast)) return fg;

  const towardDark = relativeLuminance(background) > 0.5;
  for (let step = 0; step < 32; step += 1) {
    fg = normalizeHexColor(
      mixHex(fg, towardDark ? '#000000' : '#ffffff', 82 - step * 2),
    );
    if (textContrastsSurface(fg, background, minContrast)) return fg;
  }

  if (textContrastsSurface('#0f172a', background, minContrast)) return '#0f172a';
  if (textContrastsSurface('#ffffff', background, minContrast)) return '#ffffff';
  return towardDark ? '#0f172a' : '#ffffff';
}

function rgbToHsl(
  red: number,
  green: number,
  blue: number,
): [number, number, number] {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = ((b - r) / delta + 2) / 6;
        break;
      default:
        hue = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return [hue * 360, saturation * 100, lightness * 100];
}

function isUsableTextOnSurface(
  candidate: string,
  surface: string,
  baseText: string,
): boolean {
  const normalized = normalizeHexColor(candidate);
  return (
    normalized !== normalizeHexColor(baseText) &&
    contrastRatio(normalized, surface) >= MIN_TEXT_ON_SURFACE_CONTRAST
  );
}

function pickTextHoverOnSurface(
  backgroundHover: string,
  text: string,
  seed?: string,
): string {
  if (seed && isUsableTextOnSurface(seed, backgroundHover, text)) {
    return normalizeHexColor(seed);
  }

  const textIsLight = isLightBodyText(text);
  const hoverIsLight = relativeLuminance(backgroundHover) > 0.5;
  const contrastTarget = hoverIsLight ? '#000000' : '#ffffff';
  const candidates: string[] = [];

  if (textIsLight) {
    candidates.push(
      ...Array.from({ length: 15 }, (_, step) =>
        mixHex('#ffffff', backgroundHover, 99 - step),
      ),
      mixHex('#0f172a', backgroundHover, 40),
      mixHex('#0f172a', backgroundHover, 25),
      '#0f172a',
      '#1e293b',
      '#000000',
    );
  } else if (hoverIsLight) {
    candidates.push(
      mixHex(text, '#000000', 68),
      mixHex(text, '#000000', 55),
      mixHex(text, '#000000', 45),
      '#0f172a',
      '#000000',
    );
  }

  for (const candidate of candidates) {
    if (isUsableTextOnSurface(candidate, backgroundHover, text)) {
      return normalizeHexColor(candidate);
    }
  }

  let next = mixHex(text, contrastTarget, 30);
  for (let step = 0; step < 24; step += 1) {
    if (isUsableTextOnSurface(next, backgroundHover, text)) {
      return normalizeHexColor(next);
    }
    next = mixHex(next, contrastTarget, 72 + step * 2);
  }

  if (textIsLight) {
    for (let tint = 85; tint <= 99; tint += 1) {
      const candidate = mixHex('#ffffff', backgroundHover, tint);
      if (isUsableTextOnSurface(candidate, backgroundHover, text)) {
        return normalizeHexColor(candidate);
      }
    }
  }

  const fallback = textIsLight
    ? mixHex('#ffffff', backgroundHover, 98)
    : mixHex(text, '#000000', 52);
  return normalizeHexColor(fallback);
}

function pickLightTextHoverOnColoredSurface(
  backgroundHover: string,
  text: string,
  seed?: string,
): string {
  if (seed && isUsableTextOnSurface(seed, backgroundHover, text)) {
    return normalizeHexColor(seed);
  }

  const candidates = [
    '#f8fafc',
    '#f1f5f9',
    ...Array.from({ length: 14 }, (_, step) =>
      mixHex('#ffffff', backgroundHover, 98 - step),
    ),
  ];

  for (const candidate of candidates) {
    if (isUsableTextOnSurface(candidate, backgroundHover, text)) {
      return normalizeHexColor(candidate);
    }
  }

  for (let tint = 96; tint >= 82; tint -= 1) {
    const candidate = normalizeHexColor(mixHex('#ffffff', text, tint));
    if (candidate !== normalizeHexColor(text)) {
      return candidate;
    }
  }

  return '#f8fafc';
}

/** Derive surface background and text hover colors for a pair. */
export function deriveSurfaceHovers(
  background: string,
  text: string,
  backgroundHover?: string,
  textHover?: string,
): { backgroundHover: string; textHover: string } {
  const lightTextOnColoredSurface = usesLightTextContrastMode(background, text);
  const isLightBackground = relativeLuminance(background) > 0.5;
  const resolvedBackgroundHover = backgroundHover
    ? normalizeHexColor(backgroundHover)
    : normalizeHexColor(
        lightTextOnColoredSurface
          ? mixHex(background, '#000000', 90)
          : isLightBackground
            ? mixHex(background, '#000000', 96)
            : mixHex(background, '#ffffff', 90),
      );

  const resolvedTextHover = lightTextOnColoredSurface
    ? pickLightTextHoverOnColoredSurface(
        resolvedBackgroundHover,
        text,
        textHover,
      )
    : pickTextHoverOnSurface(resolvedBackgroundHover, text, textHover);

  return {
    backgroundHover: resolvedBackgroundHover,
    textHover: resolvedTextHover,
  };
}

export function textContrastsSurface(
  foreground: string,
  surface: string,
  minContrast = MIN_TEXT_ON_SURFACE_CONTRAST,
): boolean {
  return contrastRatio(foreground, surface) >= minContrast;
}

export type SecondaryButtonColors = {
  buttonSecondaryBg: string;
  buttonSecondaryBgHover: string;
  buttonSecondaryFg: string;
  buttonSecondaryFgHover: string;
  buttonSecondaryBorder: string;
};

/** Secondary button colors that stay distinct from primary on each tone. */
export function deriveSecondaryButtonColors(
  surfaceBackground: string,
  surfaceText: string,
  surfaceBackgroundHover: string,
  surfaceTextHover: string,
): SecondaryButtonColors {
  if (usesLightTextContrastMode(surfaceBackground, surfaceText)) {
    const bg = normalizeHexColor(mixHex(surfaceBackground, '#000000', 90));
    const bgHover = normalizeHexColor(mixHex(surfaceBackground, '#000000', 84));
    const border = normalizeHexColor(mixHex(surfaceText, surfaceBackground, 42));
    const fg = normalizeHexColor(surfaceText);
    const fgHover = normalizeHexColor(
      textContrastsSurface(surfaceTextHover, bgHover)
        ? surfaceTextHover
        : mixHex(surfaceText, '#ffffff', 90),
    );

    return {
      buttonSecondaryBg: bg,
      buttonSecondaryBgHover: bgHover,
      buttonSecondaryFg: resolveSecondaryForeground(fg, bg),
      buttonSecondaryFgHover: resolveSecondaryForeground(fgHover, bgHover),
      buttonSecondaryBorder: ensureContrastOnSurface(
        border,
        surfaceBackground,
        CONTRAST.ui,
      ),
    };
  }

  const border = normalizeHexColor(mixHex(surfaceText, surfaceBackground, 38));
  const bg = normalizeHexColor(mixHex(surfaceBackground, '#ffffff', 92));
  const bgHover = normalizeHexColor(surfaceBackgroundHover);
  const fg = normalizeHexColor(surfaceText);
  const fgHover = textContrastsSurface(surfaceTextHover, bgHover)
    ? normalizeHexColor(surfaceTextHover)
    : fg;

  return {
    buttonSecondaryBg: bg,
    buttonSecondaryBgHover: bgHover,
    buttonSecondaryFg: resolveSecondaryForeground(fg, bg),
    buttonSecondaryFgHover: resolveSecondaryForeground(fgHover, bgHover),
    buttonSecondaryBorder: ensureContrastOnSurface(border, surfaceBackground, CONTRAST.ui),
  };
}
