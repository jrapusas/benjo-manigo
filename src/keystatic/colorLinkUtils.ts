import { contrastRatio, relativeLuminance } from '../lib/color/contrast';
import { mixHex } from '../lib/color/mix';
import {
  deriveSecondaryButtonColors,
  deriveSurfaceHovers,
  textContrastsSurface,
  usesLightTextContrastMode,
  type SecondaryButtonColors,
} from '../lib/color/surfaceExtras';
import { normalizeHexColor } from './fields/colorUtils';

export {
  deriveSecondaryButtonColors,
  deriveSurfaceHovers,
  textContrastsSurface,
  usesLightTextContrastMode,
  type SecondaryButtonColors,
};

const MIN_LINK_CONTRAST = 4.5;
const MIN_LINK_HOVER_CONTRAST = 4;
const MIN_TEXT_ON_SURFACE_CONTRAST = 4.5;
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

function hasContrastOnSurface(
  foreground: string,
  background: string,
  minContrast = MIN_TEXT_ON_SURFACE_CONTRAST,
): boolean {
  return contrastRatio(foreground, background) >= minContrast;
}

function resolveSecondaryForeground(
  preferred: string,
  background: string,
): string {
  const fg = normalizeHexColor(preferred);
  const ratio = contrastRatio(fg, background);
  if (ratio < MIN_TEXT_ON_SURFACE_CONTRAST) {
    return hasContrastOnSurface('#0f172a', background) ? '#0f172a' : '#ffffff';
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

function tuneLinkTowardContrast(
  accent: string,
  background: string,
  text: string,
): string {
  const isLightBackground = relativeLuminance(background) > 0.5;
  const contrastTarget = isLightBackground ? '#000000' : '#ffffff';
  let next = accent;

  for (let step = 0; step < 24; step += 1) {
    if (isUsableLinkColor(next, background, text)) {
      return normalizeHexColor(next);
    }
    next = mixHex(next, contrastTarget, 82 - step * 3);
  }

  return normalizeHexColor(
    isLightBackground
      ? mixHex('#000000', accent, 72)
      : mixHex('#ffffff', accent, 35),
  );
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

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const sat = saturation / 100;
  const light = lightness / 100;
  const chroma = sat * Math.min(light, 1 - light);
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12;
    const color = light - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex);
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

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.max(0, Math.min(255, channel)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function isDistinctLinkFromText(
  link: string,
  text: string,
  minContrast = 2.5,
): boolean {
  return contrastRatio(normalizeHexColor(link), normalizeHexColor(text)) >= minContrast;
}

function isUsableLinkColor(
  candidate: string,
  background: string,
  text: string,
  minContrast = MIN_LINK_CONTRAST,
  requireDistinctFromText = false,
): boolean {
  const normalized = normalizeHexColor(candidate);
  return (
    normalized !== normalizeHexColor(text) &&
    contrastRatio(normalized, background) >= minContrast &&
    (!requireDistinctFromText || isDistinctLinkFromText(normalized, text))
  );
}

function brandLinkCandidates(background: string, accent: string): string[] {
  const [red, green, blue] = hexToRgb(background);
  const [hue, saturation, lightness] = rgbToHsl(red, green, blue);
  const sat = Math.min(Math.max(saturation, 25), 75);
  const lightnessSteps =
    lightness > 42 ? [70, 66, 62, 58] : [82, 78, 74, 70];

  return [
    ...lightnessSteps.map((light) => hslToHex(hue, sat, light)),
    mixHex('#ffffff', accent, 35),
    accent,
    ...TINTED_LINK_CANDIDATES,
    '#fef3c7',
    '#fde047',
    '#000000',
    '#0f172a',
    mixHex('#0f172a', background, 20),
    mixHex('#000000', background, 10),
  ];
}

function pickBestBrandLink(
  background: string,
  text: string,
  candidates: string[],
  minBgContrast = MIN_LINK_CONTRAST,
  exclude?: string,
): string | undefined {
  const excludeNormalized = exclude ? normalizeHexColor(exclude) : undefined;
  let best: string | undefined;
  let bestScore = 0;

  for (const candidate of candidates) {
    const normalized = normalizeHexColor(candidate);
    if (excludeNormalized && normalized === excludeNormalized) continue;

    const bgRatio = contrastRatio(normalized, background);
    const textRatio = contrastRatio(normalized, text);
    if (bgRatio < minBgContrast) continue;
    if (textRatio < 2.5) continue;

    const score = textRatio * 0.55 + bgRatio * 0.45;
    if (score > bestScore) {
      best = normalized;
      bestScore = score;
    }
  }

  return best;
}

function pickBestBrandLinkHover(
  background: string,
  text: string,
  link: string,
  candidates: string[],
): string | undefined {
  const linkNorm = normalizeHexColor(link);
  let best: string | undefined;
  let bestScore = 0;

  for (const candidate of candidates) {
    const normalized = normalizeHexColor(candidate);
    if (normalized === linkNorm) continue;

    const bgRatio = contrastRatio(normalized, background);
    const linkRatio = contrastRatio(normalized, linkNorm);
    if (bgRatio < MIN_LINK_HOVER_CONTRAST) continue;
    if (linkRatio < 1.12) continue;

    const textRatio = contrastRatio(normalized, text);
    const score = bgRatio * 0.65 + Math.min(textRatio, 12) * 0.2 + linkRatio * 0.15;
    if (score > bestScore) {
      best = normalized;
      bestScore = score;
    }
  }

  return best;
}

function pickBrandLinkHoverFallback(background: string, link: string): string {
  const linkIsDark = relativeLuminance(link) < 0.5;
  const target = linkIsDark ? '#ffffff' : '#000000';

  for (let step = 4; step <= 70; step += 2) {
    const candidate = normalizeHexColor(mixHex(target, link, step));
    if (
      candidate !== normalizeHexColor(link) &&
      contrastRatio(candidate, background) >= MIN_LINK_HOVER_CONTRAST
    ) {
      return candidate;
    }
  }

  return normalizeHexColor(mixHex(target, link, linkIsDark ? 40 : 28));
}

/** Brand-colored link seed for neutral surfaces (page, card, muted, etc.). */
export function deriveBrandLinkAccent(
  surfaceBackground: string,
  surfaceText: string,
  brand: { background: string; text: string },
): string {
  const brandBg = normalizeHexColor(brand.background);
  const candidates = [
    brandBg,
    ...Array.from({ length: 16 }, (_, step) =>
      mixHex(brandBg, '#000000', 92 - step * 4),
    ),
    ...Array.from({ length: 8 }, (_, step) =>
      mixHex(brandBg, '#ffffff', 88 - step * 5),
    ),
    ...brandLinkCandidates(surfaceBackground, brandBg),
  ];

  const best = pickBestBrandLink(surfaceBackground, surfaceText, candidates);
  if (best) return best;

  return tuneLinkTowardContrast(
    deriveAccentFromPair(brand.background, brand.text),
    surfaceBackground,
    surfaceText,
  );
}

const TINTED_LINK_CANDIDATES = [
  '#dbeafe',
  '#bfdbfe',
  '#fef9c3',
  '#fde68a',
  '#e2e8f0',
];

function pickTintedLinkOnDarkSurface(
  background: string,
  text: string,
  accent: string,
): string {
  const candidates = [
    ...TINTED_LINK_CANDIDATES,
    accent,
    mixHex('#ffffff', accent, 35),
    ...Array.from({ length: 12 }, (_, step) =>
      mixHex('#ffffff', background, 96 - step * 2),
    ),
  ];

  const distinct = usesLightTextContrastMode(background, text);
  for (const candidate of candidates) {
    if (isUsableLinkColor(candidate, background, text, MIN_LINK_CONTRAST, distinct)) {
      return normalizeHexColor(candidate);
    }
  }

  return tuneLinkTowardContrast(accent, background, text);
}

function pickLinkOnColoredSurface(
  background: string,
  text: string,
  accent: string,
): string {
  if (!isLightBodyText(text)) {
    return tuneLinkTowardContrast(accent, background, text);
  }

  if (usesLightTextContrastMode(background, text)) {
    const best = pickBestBrandLink(
      background,
      text,
      brandLinkCandidates(background, accent),
    );
    if (best) return best;
    return pickTintedLinkOnDarkSurface(background, text, accent);
  }

  const darkCandidates = [
    '#0f172a',
    '#1e293b',
    '#000000',
    mixHex('#0f172a', background, 25),
    mixHex('#0f172a', accent, 40),
  ];
  const lightCandidates = [
    accent,
    mixHex('#ffffff', accent, 35),
    ...TINTED_LINK_CANDIDATES,
    ...Array.from({ length: 12 }, (_, step) =>
      mixHex('#ffffff', background, 96 - step * 2),
    ),
  ];
  const candidates =
    relativeLuminance(background) > 0.5
      ? [...darkCandidates, ...lightCandidates]
      : [accent, ...darkCandidates, ...lightCandidates.slice(1)];

  for (const candidate of candidates) {
    if (isUsableLinkColor(candidate, background, text, MIN_LINK_CONTRAST, true)) {
      return normalizeHexColor(candidate);
    }
  }

  return pickTintedLinkOnDarkSurface(background, text, accent);
}

function adjustTowardContrast(
  candidate: string,
  background: string,
  text: string,
): string {
  const isLightBackground = relativeLuminance(background) > 0.5;

  if (usesLightTextContrastMode(background, text)) {
    return pickLinkOnColoredSurface(background, text, candidate);
  }

  return tuneLinkTowardContrast(candidate, background, text);
}

function distinctHover(
  link: string,
  background: string,
  text: string,
  accentHover?: string,
): string {
  const isLightBackground = relativeLuminance(background) > 0.5;
  const linkIsDark = relativeLuminance(link) <= relativeLuminance(background);
  const candidates = accentHover ? [accentHover] : [];

  if (linkIsDark) {
    candidates.push(
      mixHex('#ffffff', link, 5),
      mixHex('#ffffff', link, 8),
      mixHex('#ffffff', link, 10),
      mixHex(link, '#000000', 90),
    );
  } else {
    candidates.push(
      mixHex('#ffffff', link, 55),
      mixHex(link, '#000000', 68),
      mixHex('#ffffff', link, 45),
    );
  }

  const onBrandSurface = usesLightTextContrastMode(background, text);

  if (onBrandSurface) {
    const linkIsDark = relativeLuminance(link) <= relativeLuminance(background);
    const hoverCandidates = linkIsDark
      ? Array.from({ length: 24 }, (_, step) =>
          mixHex('#ffffff', link, 4 + step * 2),
        )
      : Array.from({ length: 24 }, (_, step) =>
          mixHex('#000000', link, 4 + step * 2),
        );
    const best = pickBestBrandLinkHover(
      background,
      text,
      link,
      hoverCandidates,
    );
    if (best) return best;
    return pickBrandLinkHoverFallback(background, link);
  }

  for (const candidate of candidates) {
    const normalized = normalizeHexColor(candidate);
    if (
      isUsableLinkColor(
        normalized,
        background,
        text,
        MIN_LINK_HOVER_CONTRAST,
        onBrandSurface,
      ) &&
      normalized.toLowerCase() !== link.toLowerCase()
    ) {
      return normalized;
    }
  }

  const fallbackCandidates = Array.from({ length: 14 }, (_, step) =>
    linkIsDark
      ? mixHex('#ffffff', link, 2 + step)
      : mixHex('#000000', link, 10 + step * 4),
  );

  let bestHover = link;
  let bestContrast = 0;

  for (const candidate of fallbackCandidates) {
    const normalized = normalizeHexColor(candidate);
    const ratio = contrastRatio(normalized, background);
    if (
      normalized.toLowerCase() === link.toLowerCase() ||
      normalized === normalizeHexColor(text)
    ) {
      continue;
    }
    if (
      ratio >= MIN_LINK_HOVER_CONTRAST &&
      ratio > bestContrast
    ) {
      bestHover = normalized;
      bestContrast = ratio;
    }
  }

  if (bestContrast >= MIN_LINK_HOVER_CONTRAST) {
    return bestHover;
  }

  return normalizeHexColor(
    linkIsDark ? mixHex('#ffffff', link, 2) : mixHex('#000000', link, 12),
  );
}

/** Pick link colors that contrast the background and differ from body text. */
export function deriveLinkColors(
  background: string,
  text: string,
  accent: string,
  accentHover?: string,
): { link: string; linkHover: string } {
  const onBrandSurface = usesLightTextContrastMode(background, text);
  let link = normalizeHexColor(accent);
  if (
    !isUsableLinkColor(link, background, text, MIN_LINK_CONTRAST, onBrandSurface)
  ) {
    if (onBrandSurface) {
      link = pickLinkOnColoredSurface(background, text, accent);
    } else {
      link = adjustTowardContrast(link, background, text);
    }
  }

  let linkHover = distinctHover(link, background, text, accentHover);

  if (
    !isUsableLinkColor(link, background, text, MIN_LINK_CONTRAST, onBrandSurface)
  ) {
    link = onBrandSurface
      ? pickLinkOnColoredSurface(background, text, accent)
      : tuneLinkTowardContrast(link, background, text);
  }
  if (
    !isUsableLinkColor(
      linkHover,
      background,
      text,
      MIN_LINK_HOVER_CONTRAST,
      onBrandSurface,
    )
  ) {
    linkHover = distinctHover(link, background, text, accentHover);
  }

  return {
    link: normalizeHexColor(link),
    linkHover: normalizeHexColor(linkHover),
  };
}

/** Adjust preset bg/text so stored pairs always pass CMS contrast validation. */
export function ensurePresetPair(
  background: string,
  text: string,
): { background: string; text: string } {
  const bg = normalizeHexColor(background);
  const preferredText = normalizeHexColor(text);

  if (textContrastsSurface(preferredText, bg)) {
    return { background: bg, text: preferredText };
  }

  const wantsLightText = isLightBodyText(preferredText);
  let adjusted = bg;
  for (let step = 0; step < 40; step += 1) {
    adjusted = normalizeHexColor(
      mixHex(adjusted, wantsLightText ? '#000000' : '#ffffff', 88 - step),
    );
    const candidateText = wantsLightText ? '#ffffff' : '#0f172a';
    if (textContrastsSurface(candidateText, adjusted)) {
      return { background: adjusted, text: candidateText };
    }
  }

  const altText = wantsLightText ? '#0f172a' : '#ffffff';
  if (textContrastsSurface(altText, bg)) {
    return { background: bg, text: normalizeHexColor(altText) };
  }

  return { background: bg, text: preferredText };
}

/** Accent seed for links and filled buttons, derived from a bg/text pair. */
export function deriveAccentFromPair(background: string, text: string): string {
  const isLightBackground = relativeLuminance(background) > 0.5;

  if (usesLightTextContrastMode(background, text)) {
    const [red, green, blue] = hexToRgb(background);
    const [hue, saturation] = rgbToHsl(red, green, blue);
    if (!isLightBackground) {
      return hslToHex(hue, Math.min(saturation + 25, 80), 78);
    }
    return hslToHex(hue, Math.min(saturation + 10, 88), 16);
  }

  const [red, green, blue] = hexToRgb(text);
  const [hue, saturation] = rgbToHsl(red, green, blue);
  const accentSaturation = saturation < 15 ? 62 : Math.min(saturation + 34, 88);
  const accentLightness = isLightBackground ? 46 : 56;
  return hslToHex(hue, accentSaturation, accentLightness);
}

export type ButtonColors = {
  buttonBg: string;
  buttonBgHover: string;
  buttonFg: string;
  buttonFgHover: string;
};

/** Primary button colors that contrast the surrounding tone background. */
export function deriveButtonColors(
  surfaceBackground: string,
  surfaceText: string,
  surfaceBackgroundHover: string,
  surfaceTextHover: string,
  accentBackground: string,
  accentBackgroundHover: string,
  accentText: string,
): ButtonColors {
  if (usesLightTextContrastMode(surfaceBackground, surfaceText)) {
    const buttonBg = normalizeHexColor(surfaceText);
    const buttonFg = normalizeHexColor(surfaceBackground);
    const buttonBgHover = normalizeHexColor(
      textContrastsSurface(surfaceTextHover, surfaceBackground)
        ? surfaceTextHover
        : mixHex(surfaceText, '#ffffff', 92),
    );
    const buttonFgHover = normalizeHexColor(
      textContrastsSurface(surfaceBackgroundHover, buttonBgHover)
        ? surfaceBackgroundHover
        : mixHex(surfaceBackground, '#000000', 88),
    );

    return {
      buttonBg,
      buttonBgHover,
      buttonFg: ensureContrastOnSurface(buttonFg, buttonBg),
      buttonFgHover: ensureContrastOnSurface(buttonFgHover, buttonBgHover),
    };
  }

  let buttonBg = normalizeHexColor(accentBackground);
  if (!textContrastsSurface(buttonBg, surfaceBackground)) {
    buttonBg = normalizeHexColor(
      relativeLuminance(accentBackground) > relativeLuminance(surfaceBackground)
        ? mixHex(accentBackground, '#000000', 72)
        : mixHex(accentBackground, '#ffffff', 72),
    );
  }

  let buttonFg = normalizeHexColor(accentText);
  if (!textContrastsSurface(buttonFg, buttonBg)) {
    buttonFg =
      relativeLuminance(buttonBg) > 0.5
        ? normalizeHexColor('#0f172a')
        : normalizeHexColor('#ffffff');
  }

  let buttonBgHover = normalizeHexColor(accentBackgroundHover);
  if (!textContrastsSurface(buttonBgHover, surfaceBackground)) {
    buttonBgHover = normalizeHexColor(
      mixHex(buttonBg, relativeLuminance(buttonBg) > 0.5 ? '#000000' : '#ffffff', 88),
    );
  }

  for (let step = 0; step < 24 && !textContrastsSurface(buttonFg, buttonBg); step += 1) {
    buttonBg = normalizeHexColor(
      mixHex(buttonBg, relativeLuminance(buttonBg) > 0.5 ? '#000000' : '#ffffff', 82 - step * 2),
    );
  }
  buttonFg = ensureContrastOnSurface(buttonFg, buttonBg);

  for (
    let step = 0;
    step < 24 && !textContrastsSurface(buttonFg, buttonBgHover);
    step += 1
  ) {
    buttonBgHover = normalizeHexColor(
      mixHex(
        buttonBgHover,
        relativeLuminance(buttonBgHover) > 0.5 ? '#000000' : '#ffffff',
        82 - step * 2,
      ),
    );
  }
  const buttonFgHover = ensureContrastOnSurface(buttonFg, buttonBgHover);

  return {
    buttonBg,
    buttonBgHover,
    buttonFg,
    buttonFgHover,
  };
}
