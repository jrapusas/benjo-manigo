import {
  BASE_COLOR_NAMES,
  APPEARANCE_NAMES,
  SOLID_APPEARANCE_NAMES,
  type BaseColorName,
  type SolidAppearanceName,
  type ColorTheme,
  type GenerateColorThemeInput,
} from './types';
import { parseAppearanceIntent } from './appearanceIntent';
import { resolveBaseColorName, resolveBaseHue, resolveBrand500 } from './baseColors';
import {
  generatePrimitives,
  generatePrimitivesFromCustom,
  resolveCustomPrimitives,
} from './variations';
import { appearanceExtraCssVars } from './appearanceExtras';
import { deriveSemanticColors } from './derive';
import { hardenSemanticForGradients } from './gradientContrast';
import { generateSchemeColorTheme } from './schemes/derive';
import { isColorSchemeId, type ColorSchemeId } from './schemes';

export function resolveAppearanceName(
  value?: string | null,
): SolidAppearanceName {
  return parseAppearanceIntent(value, 'default').tone;
}

/** Single source of truth: color intent → primitives → semantic roles. */
export function generateColorTheme(
  input: GenerateColorThemeInput = {},
): ColorTheme {
  const appearance = resolveAppearanceName(input.appearance);
  const schemeId = isColorSchemeId(input.color) ? input.color : null;

  if (schemeId) {
    return generateSchemeColorTheme(schemeId, appearance);
  }

  const color = resolveBaseColorName(input.color);

  let primitives;
  if (color === 'custom') {
    const custom = resolveCustomPrimitives(input.customPrimitives);
    primitives = generatePrimitivesFromCustom(custom, appearance);
  } else {
    const hue = resolveBaseHue(color, input.variantIndex ?? 0);
    primitives = generatePrimitives(hue, appearance, resolveBrand500(color));
  }

  const baseSemantic = deriveSemanticColors(primitives);
  const semantic = {
    ...baseSemantic,
    ...hardenSemanticForGradients(baseSemantic, appearance),
  };

  return { color, appearance, primitives, semantic };
}

type CardSurfaceInput = Pick<GenerateColorThemeInput, 'customPrimitives'> & {
  /** Theme source for default-band card surfaces - scheme id, base color, or custom. */
  colorId?: string;
};

function generateColorAttributeCssBlocks(
  colorId: string,
  appearances: readonly SolidAppearanceName[],
  themeFor: (appearance: SolidAppearanceName) => ColorTheme,
  cardInput?: CardSurfaceInput,
): string {
  return appearances
    .map((appearance) => {
      const theme = themeFor(appearance);
      const vars = {
        ...semanticToCssVars(theme.semantic),
        ...cardSurfaceCssVars(theme, cardInput),
      };
      const lines = Object.entries(vars)
        .map(([name, value]) => `  ${name}: ${value};`)
        .join('\n');
      return `[data-color="${colorId}"][data-appearance="${appearance}"] {\n${lines}\n}`;
    })
    .join('\n\n');
}

/** CSS attribute rules for site custom palette (injected at runtime). */
export function generateCustomColorAttributeCss(
  custom: ColorTheme['primitives'] | null | undefined,
): string {
  if (!custom) return '';
  const resolved = resolveCustomPrimitives(custom);

  return generateColorAttributeCssBlocks('custom', SOLID_APPEARANCE_NAMES, (appearance) =>
    generateColorTheme({
      color: 'custom',
      appearance,
      customPrimitives: resolved,
    }),
  { customPrimitives: resolved, colorId: 'custom' });
}

/** CSS attribute rules for named color schemes (injected at runtime). */
export function generateSchemeColorAttributeCss(schemeId: ColorSchemeId): string {
  return generateColorAttributeCssBlocks(
    schemeId,
    SOLID_APPEARANCE_NAMES,
    (appearance) => generateSchemeColorTheme(schemeId, appearance),
    { colorId: schemeId },
  );
}

export function generateAllColorThemes(): ColorTheme[] {
  const themes: ColorTheme[] = [];
  for (const color of BASE_COLOR_NAMES) {
    if (color === 'custom') continue;
    for (const appearance of SOLID_APPEARANCE_NAMES) {
      themes.push(generateColorTheme({ color, appearance }));
    }
  }
  return themes;
}

export function themeSelector(
  color: BaseColorName,
  appearance: SolidAppearanceName,
): string {
  return `[data-color="${color}"][data-appearance="${appearance}"]`;
}

const INVERTED_CARD_APPEARANCES = new Set<SolidAppearanceName>([
  'contrast',
  'dark',
  'accent',
]);

export function semanticToCssVars(
  semantic: ColorTheme['semantic'],
): Record<string, string> {
  return {
    '--color-background': semantic.background,
    '--color-heading': semantic.heading,
    '--color-subheading': semantic.subheading,
    '--color-subheading-section-subtle': semantic.subheadingSectionSubtle,
    '--color-subheading-muted-subtle': semantic.subheadingMutedSubtle,
    '--color-text': semantic.text,
    '--color-button-bg': semantic.buttonBg,
    '--color-button-text': semantic.buttonText,
    '--color-button-bg-hover': semantic.buttonBgHover,
    '--color-button-text-hover': semantic.buttonTextHover,
    '--color-link': semantic.link,
    '--color-link-hover': semantic.linkHover,
    '--color-gradient-text': semantic.gradientText,
    '--color-gradient-heading': semantic.gradientHeading,
    '--color-gradient-subheading': semantic.gradientSubheading,
    '--color-gradient-link': semantic.gradientLink,
    // Legacy aliases used by existing components
    '--color-button-fg': semantic.buttonText,
    '--color-button-fg-hover': semantic.buttonTextHover,
  };
}

/** Light default-band tokens for cards sitting on contrast, dark, or accent sections. */
export function cardSurfaceCssVars(
  theme: ColorTheme,
  input?: CardSurfaceInput,
): Record<string, string> {
  if (!INVERTED_CARD_APPEARANCES.has(theme.appearance)) {
    return {};
  }

  const defaultTheme = generateColorTheme({
    color: input?.colorId ?? theme.color,
    appearance: 'default',
    customPrimitives: input?.customPrimitives,
  });
  const surface = defaultTheme.semantic;

  return {
    '--color-card-surface-bg': surface.background,
    '--color-card-surface-heading': surface.heading,
    '--color-card-surface-subheading': surface.subheading,
    '--color-card-surface-subheading-section-subtle': surface.subheadingSectionSubtle,
    '--color-card-surface-subheading-muted-subtle': surface.subheadingMutedSubtle,
    '--color-card-surface-text': surface.text,
    '--color-card-surface-link': surface.link,
    '--color-card-surface-link-hover': surface.linkHover,
    '--color-card-surface-button-bg': surface.buttonBg,
    '--color-card-surface-button-text': surface.buttonText,
    '--color-card-surface-button-bg-hover': surface.buttonBgHover,
    '--color-card-surface-button-text-hover': surface.buttonTextHover,
    '--color-card-surface-button-fg': surface.buttonText,
    '--color-card-surface-button-fg-hover': surface.buttonTextHover,
  };
}

/** Inline style object for React preview panels (Keystatic admin). */
export function semanticStyleProps(
  semantic: ColorTheme['semantic'],
  extra?: Record<string, string>,
): Record<string, string> {
  return { ...semanticToCssVars(semantic), ...extra };
}

export function themeToCssBlock(theme: ColorTheme): string {
  const vars = {
    ...semanticToCssVars(theme.semantic),
    ...appearanceExtraCssVars(theme.semantic),
    ...cardSurfaceCssVars(theme),
  };
  const lines = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${themeSelector(theme.color, theme.appearance)} {\n${lines}\n}`;
}

export function generateColorThemesCss(): string {
  const header = `/* Generated by scripts/generate-color-themes.mjs - do not edit */\n`;
  const themes = generateAllColorThemes()
    .map((theme) => themeToCssBlock(theme))
    .join('\n\n');
  return `${header}${themes}\n`;
}

export {
  BASE_COLOR_NAMES,
  APPEARANCE_NAMES,
  SOLID_APPEARANCE_NAMES,
  type BaseColorName,
  type AppearanceName,
  type SolidAppearanceName,
  type ColorTheme,
};
