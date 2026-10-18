import type { ColorPrimitives, SemanticColors } from './types';
import { deriveSemanticColors } from './derive';
import { type ColorSetId } from '../../keystatic/colors';
import { type ColorInput } from '../../keystatic/colorSets';

/** Map legacy CMS color sets to appearance modes. */
export const COLOR_SET_APPEARANCE: Record<ColorSetId, string> = {
  default: 'default',
  surface: 'soft',
  card: 'default',
  brand: 'accent',
  brandStrong: 'dark',
  muted: 'soft',
};

export function primitivesFromPair(
  pair: ColorInput,
  brand: ColorInput,
): ColorPrimitives {
  return {
    background: pair.background,
    text: pair.text,
    buttonBg: brand.background,
    buttonText: brand.text,
  };
}

export function semanticCssVars(
  semantic: SemanticColors,
  prefix?: string,
): string[] {
  const p = prefix ? `${prefix}-` : '';
  return [
    `--color-${p}background: ${semantic.background};`,
    `--color-${p}heading: ${semantic.heading};`,
    `--color-${p}subheading: ${semantic.subheading};`,
    `--color-${p}text: ${semantic.text};`,
    `--color-${p}button-bg: ${semantic.buttonBg};`,
    `--color-${p}button-text: ${semantic.buttonText};`,
    `--color-${p}button-bg-hover: ${semantic.buttonBgHover};`,
    `--color-${p}button-text-hover: ${semantic.buttonTextHover};`,
    `--color-${p}link: ${semantic.link};`,
    `--color-${p}link-hover: ${semantic.linkHover};`,
    `--color-${p}button-fg: ${semantic.buttonText};`,
    `--color-${p}button-fg-hover: ${semantic.buttonTextHover};`,
    // Legacy aliases
    `--color-${p}bg: ${semantic.background};`,
    `--color-${p}fg: ${semantic.text};`,
  ];
}

/** Legacy tone key prefix (default, surface, brand, …). */
export function legacyToneSemanticVars(
  key: string,
  semantic: SemanticColors,
): string {
  return semanticCssVars(semantic, key).join('\n  ');
}

export function deriveFromPair(
  pair: ColorInput,
  brand: ColorInput,
): SemanticColors {
  return deriveSemanticColors(primitivesFromPair(pair, brand));
}
