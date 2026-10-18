import { CONTRAST, ensureContrast, meetsContrast } from '../contrast';
import { deriveSemanticColors } from '../derive';
import { hardenSemanticForGradients } from '../gradientContrast';
import { hexToOklch, oklchToHex, withOklch } from '../oklch';
import { normalizeCustomPrimitives } from '../variations';
import type { ColorTheme, SolidAppearanceName } from '../types';
import { getColorScheme, type ColorSchemeId } from './index';
import type { SchemeSemanticOverrides } from './types';

function deriveLinkHover(link: string, background: string): string {
  const base = hexToOklch(link);
  const onLightBg = hexToOklch(background).l > 0.55;
  let hover = oklchToHex(
    withOklch(base, {
      l: onLightBg
        ? Math.max(0.12, base.l - 0.06)
        : Math.min(0.96, base.l + 0.06),
      c: Math.min(base.c + 0.015, 0.24),
    }),
  );

  if (!meetsContrast(hover, background, CONTRAST.linkHover)) {
    hover = ensureContrast(hover, background, CONTRAST.linkHover, hexToOklch, oklchToHex);
  }

  return hover;
}

function applySemanticOverrides(
  semantic: ColorTheme['semantic'],
  overrides?: SchemeSemanticOverrides,
): ColorTheme['semantic'] {
  if (!overrides) return semantic;

  const next = { ...semantic, ...overrides };

  if (overrides.link && overrides.linkHover === undefined) {
    next.linkHover = deriveLinkHover(overrides.link, semantic.background);
  }

  return next;
}

/** Generate a full theme from a named scheme appearance spec. */
export function generateSchemeColorTheme(
  schemeId: ColorSchemeId,
  appearance: SolidAppearanceName,
): ColorTheme {
  const scheme = getColorScheme(schemeId);
  const spec = scheme.appearances[appearance];
  const primitives = normalizeCustomPrimitives(spec.primitives);
  const baseSemantic = deriveSemanticColors(primitives);
  const semantic = applySemanticOverrides(baseSemantic, spec.semantic);

  return {
    color: 'custom',
    appearance,
    primitives,
    semantic: {
      ...semantic,
      ...hardenSemanticForGradients(semantic, appearance),
    },
  };
}
