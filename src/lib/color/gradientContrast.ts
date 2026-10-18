import {
  CONTRAST,
  contrastRatio,
  meetsContrast,
  relativeLuminance,
} from './contrast';
import { mixSrgb } from './mix';
import { hexToOklch, oklchToHex, withOklch } from './oklch';
import type { SemanticColors, SolidAppearanceName } from './types';

type ContrastFailure = {
  pair: string;
  foreground: string;
  background: string;
  minimum: number;
  ratio: number;
};

type GradientStop = {
  color: (semantic: SemanticColors) => string;
  /** Foreground weight in `color-mix(in srgb, color W%, background)`. */
  weight: number;
};

/** Mirrors `global.css` gradient stop recipes - worst-case surfaces for contrast checks. */
const WHITE = '#ffffff';
const BLACK = '#000000';

const GRADIENT_STOPS: Record<SolidAppearanceName, GradientStop[]> = {
  default: [
    { color: (s) => s.buttonBg, weight: 0.16 },
    { color: (s) => s.link, weight: 0.08 },
    { color: () => WHITE, weight: 0.48 },
    { color: (s) => s.buttonBg, weight: 0.1 },
  ],
  soft: [
    { color: (s) => s.buttonBg, weight: 0.22 },
    { color: (s) => s.link, weight: 0.12 },
    { color: () => WHITE, weight: 0.55 },
    { color: (s) => s.buttonBg, weight: 0.14 },
  ],
  tinted: [
    { color: (s) => s.buttonBg, weight: 0.34 },
    { color: (s) => s.link, weight: 0.18 },
    { color: () => WHITE, weight: 0.35 }, // background 35% + white 65%
    { color: (s) => s.buttonBg, weight: 0.24 },
  ],
  contrast: [
    { color: (s) => s.buttonText, weight: 0.42 },
    { color: (s) => s.background, weight: 1 },
    { color: (s) => s.buttonText, weight: 0.28 },
    { color: (s) => s.buttonText, weight: 0.52 },
  ],
  dark: [
    { color: (s) => s.buttonBg, weight: 0.28 },
    { color: () => BLACK, weight: 0.84 },
    { color: () => BLACK, weight: 0.86 },
    { color: (s) => s.background, weight: 1 },
    { color: (s) => s.buttonBg, weight: 0.26 },
  ],
  accent: [
    { color: (s) => s.buttonText, weight: 0.38 },
    { color: (s) => s.buttonText, weight: 0.22 },
    { color: (s) => s.background, weight: 1 },
    { color: (s) => s.buttonText, weight: 0.46 },
  ],
};

export function gradientSurfaceColors(
  semantic: SemanticColors,
  appearance: SolidAppearanceName,
): string[] {
  const background = semantic.background;
  return GRADIENT_STOPS[appearance].map((stop) => {
    if (stop.weight >= 1) return background;
    const tint = stop.color(semantic);
    if (tint === WHITE) {
      return mixSrgb(background, WHITE, stop.weight);
    }
    if (tint === BLACK) {
      return mixSrgb(background, BLACK, stop.weight);
    }
    return mixSrgb(tint, background, stop.weight);
  });
}

const GRADIENT_SAFE_MINIMUM = 4.55;

function ensureOnSurfaces(
  foreground: string,
  surfaces: string[],
  minimum = GRADIENT_SAFE_MINIMUM,
): string {
  if (surfaces.every((surface) => meetsContrast(foreground, surface, minimum))) {
    return foreground;
  }

  const fg = hexToOklch(foreground);

  for (let step = 1; step <= 50; step += 1) {
    const delta = step * 0.025;
    const candidates = [
      oklchToHex(
        withOklch(fg, {
          l: Math.min(0.99, fg.l + delta),
          c: Math.max(0, fg.c * (1 - step * 0.01)),
        }),
      ),
      oklchToHex(
        withOklch(fg, {
          l: Math.max(0.05, fg.l - delta),
          c: Math.max(0, fg.c * (1 - step * 0.01)),
        }),
      ),
    ];
    for (const candidate of candidates) {
      if (surfaces.every((surface) => meetsContrast(candidate, surface, minimum))) {
        return candidate;
      }
    }
  }

  const fallbacks = ['#ffffff', '#f8fafc', '#0f172a', '#000000'];
  for (const fallback of fallbacks) {
    if (surfaces.every((surface) => meetsContrast(fallback, surface, minimum))) {
      return fallback;
    }
  }

  return foreground;
}

/** Harden text roles against worst-case gradient stops from `global.css`. */
export function hardenSemanticForGradients(
  semantic: SemanticColors,
  appearance: SolidAppearanceName,
): Pick<SemanticColors, 'gradientText' | 'gradientHeading' | 'gradientSubheading' | 'gradientLink'> {
  const surfaces = gradientSurfaceColors(semantic, appearance);
  return {
    gradientText: ensureOnSurfaces(semantic.text, surfaces),
    gradientHeading: ensureOnSurfaces(semantic.heading, surfaces),
    gradientSubheading: ensureOnSurfaces(semantic.subheading, surfaces),
    gradientLink: ensureOnSurfaces(semantic.link, surfaces, CONTRAST.normalText),
  };
}

export function validateGradientContrast(
  failures: ContrastFailure[],
  label: string,
  semantic: SemanticColors,
  appearance: SolidAppearanceName,
): void {
  const surfaces = gradientSurfaceColors(semantic, appearance);
  const roles: Array<[string, string]> = [
    ['text', semantic.text],
    ['heading', semantic.heading],
    ['subheading', semantic.subheading],
    ['link', semantic.link],
  ];

  for (const surface of surfaces) {
    for (const [role, foreground] of roles) {
      const ratio = contrastRatio(foreground, surface);
      if (!meetsContrast(foreground, surface, CONTRAST.normalText)) {
        failures.push({
          pair: `${label} gradient ${role}/stop`,
          foreground,
          background: surface,
          minimum: CONTRAST.normalText,
          ratio,
        });
      }
    }
  }
}
