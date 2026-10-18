import { oklchToHex, withOklch, hexToOklch } from './oklch';
import {
  CONTRAST,
  ensureContrast,
  meetsContrast,
  relativeLuminance,
} from './contrast';
import { isColorPrimitives, DEFAULT_CUSTOM_PRIMITIVES } from './custom';
import { finalizePrimitiveButtonPair } from './derive';
import type { ColorPrimitives, SolidAppearanceName } from './types';

type PrimitiveRecipe = {
  background: { l: number; c: number };
  text: { l: number; c: number };
  buttonBg: { l: number; c: number };
  buttonText: { l: number; c: number };
};

/** OKLCH recipes per appearance - increasing emphasis down the list. */
const APPEARANCE_RECIPES: Record<SolidAppearanceName, PrimitiveRecipe> = {
  default: {
    background: { l: 0.995, c: 0.004 },
    text: { l: 0.22, c: 0.03 },
    buttonBg: { l: 0.48, c: 0.16 },
    buttonText: { l: 0.99, c: 0.01 },
  },
  soft: {
    background: { l: 0.975, c: 0.018 },
    text: { l: 0.24, c: 0.035 },
    buttonBg: { l: 0.48, c: 0.16 },
    buttonText: { l: 0.99, c: 0.01 },
  },
  tinted: {
    background: { l: 0.94, c: 0.045 },
    text: { l: 0.24, c: 0.04 },
    buttonBg: { l: 0.5, c: 0.17 },
    buttonText: { l: 0.99, c: 0.01 },
  },
  contrast: {
    background: { l: 0.55, c: 0.14 },
    text: { l: 0.98, c: 0.015 },
    buttonBg: { l: 0.98, c: 0.015 },
    buttonText: { l: 0.28, c: 0.05 },
  },
  dark: {
    background: { l: 0.2, c: 0.035 },
    text: { l: 0.95, c: 0.015 },
    buttonBg: { l: 0.62, c: 0.16 },
    buttonText: { l: 0.99, c: 0.01 },
  },
  accent: {
    background: { l: 0.45, c: 0.18 },
    text: { l: 0.98, c: 0.012 },
    buttonBg: { l: 0.98, c: 0.012 },
    buttonText: { l: 0.3, c: 0.06 },
  },
};

function recipeToHex(
  recipe: { l: number; c: number },
  hue: number,
  neutralHue = 250,
): string {
  return oklchToHex(
    withOklch({ l: recipe.l, c: recipe.c, h: hue || neutralHue }, {}),
  );
}

const NEUTRAL_LIGHT = '#ffffff';
const NEUTRAL_DARK = '#0f172a';

/** Bands with light body copy - darken surface until white passes WCAG. */
const LIGHT_TEXT_APPEARANCES = new Set<SolidAppearanceName>(['contrast', 'accent']);

function ensureBackgroundForLightText(background: string): string {
  if (meetsContrast(NEUTRAL_LIGHT, background, CONTRAST.normalText)) {
    return background;
  }

  const base = hexToOklch(background);
  for (let step = 1; step <= 30; step += 1) {
    const darker = oklchToHex(
      withOklch(base, { l: Math.max(0.12, base.l - step * 0.015) }),
    );
    if (meetsContrast(NEUTRAL_LIGHT, darker, CONTRAST.normalText)) {
      return darker;
    }
  }

  return background;
}

function lightTextOnBand(background: string): string {
  return ensureContrast(
    NEUTRAL_LIGHT,
    background,
    CONTRAST.normalText,
    hexToOklch,
    oklchToHex,
  );
}

function autoTextForBackground(
  background: string,
  hue: number,
  minimum = CONTRAST.normalText,
): string {
  const tintedDark = oklchToHex(withOklch({ l: 0.22, c: 0.04, h: hue }, {}));
  const onLightBg = relativeLuminance(background) > 0.55;

  if (onLightBg) {
    if (meetsContrast(tintedDark, background, minimum)) return tintedDark;
    if (meetsContrast(NEUTRAL_DARK, background, minimum)) return NEUTRAL_DARK;
    return ensureContrast(tintedDark, background, minimum, hexToOklch, oklchToHex);
  }

  if (meetsContrast(NEUTRAL_LIGHT, background, minimum)) return NEUTRAL_LIGHT;
  if (meetsContrast(tintedDark, background, minimum)) return tintedDark;
  if (meetsContrast(NEUTRAL_DARK, background, minimum)) return NEUTRAL_DARK;
  return ensureContrast(NEUTRAL_LIGHT, background, minimum, hexToOklch, oklchToHex);
}

function autoButtonPair(
  background: string,
  hue: number,
  recipe: PrimitiveRecipe,
): Pick<ColorPrimitives, 'buttonBg' | 'buttonText'> {
  let buttonBg = recipeToHex(recipe.buttonBg, hue);
  let buttonText = recipeToHex(recipe.buttonText, hue);

  if (!meetsContrast(buttonText, buttonBg, CONTRAST.normalText)) {
    const onLightBg = relativeLuminance(background) > 0.55;
    buttonBg = onLightBg
      ? recipeToHex(recipe.buttonBg, hue)
      : oklchToHex(withOklch({ l: 0.62, c: 0.16, h: hue }, {}));
    buttonText = autoTextForBackground(buttonBg, hue, CONTRAST.normalText);
  }

  return finalizePrimitiveButtonPair(buttonBg, buttonText);
}

/** Appearances that use the Tailwind 500 brand as the primary button. */
const BRAND_BUTTON_APPEARANCES = new Set<SolidAppearanceName>([
  'default',
  'soft',
  'tinted',
  'dark',
]);

/** Generate the four primitives from base hue + appearance mode. */
export function generatePrimitives(
  hue: number,
  appearance: SolidAppearanceName,
  brand500?: string,
): ColorPrimitives {
  const recipe = APPEARANCE_RECIPES[appearance];
  let background = recipeToHex(recipe.background, hue);
  let text: string;

  if (LIGHT_TEXT_APPEARANCES.has(appearance)) {
    background = ensureBackgroundForLightText(background);
    text = lightTextOnBand(background);
  } else {
    text = autoTextForBackground(background, hue);
  }

  let buttonBg: string;
  let buttonText: string;
  if (brand500 && BRAND_BUTTON_APPEARANCES.has(appearance)) {
    buttonBg = brand500;
    buttonText = '#ffffff';
    ({ buttonBg, buttonText } = finalizePrimitiveButtonPair(buttonBg, buttonText));
  } else {
    ({ buttonBg, buttonText } = autoButtonPair(background, hue, recipe));
  }

  return { background, text, buttonBg, buttonText };
}

/** Normalize and validate the four custom primitives. */
export function normalizeCustomPrimitives(
  input: ColorPrimitives,
): ColorPrimitives {
  const background = input.background;
  let text = input.text;
  let buttonBg = input.buttonBg;
  let buttonText = input.buttonText;

  text = ensureContrast(text, background, CONTRAST.normalText, hexToOklch, oklchToHex);
  ({ buttonBg, buttonText } = finalizePrimitiveButtonPair(buttonBg, buttonText));

  return { background, text, buttonBg, buttonText };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Shift a custom color toward an appearance recipe, relative to default. */
function shiftTowardRecipe(
  color: string,
  fromRecipe: { l: number; c: number },
  toRecipe: { l: number; c: number },
  hue: number,
): string {
  const current = hexToOklch(color);
  const deltaL = toRecipe.l - fromRecipe.l;
  const deltaC = toRecipe.c - fromRecipe.c;

  return oklchToHex(
    withOklch(
      {
        l: clamp01(current.l + deltaL),
        c: Math.max(0, current.c + deltaC),
        h: Number.isFinite(hue) ? hue : current.h,
      },
      {},
    ),
  );
}

/** Appearances with inverted surfaces/buttons - use absolute recipes, not deltas. */
const RECIPE_DRIVEN_APPEARANCES = new Set<SolidAppearanceName>(['contrast', 'accent']);

/** Derive appearance primitives from custom defaults + brand hue. */
export function generatePrimitivesFromCustom(
  custom: ColorPrimitives,
  appearance: SolidAppearanceName,
): ColorPrimitives {
  const base = normalizeCustomPrimitives(custom);

  if (appearance === 'default') {
    return base;
  }

  const hue = hexToOklch(base.buttonBg).h;

  if (RECIPE_DRIVEN_APPEARANCES.has(appearance)) {
    return generatePrimitives(hue, appearance);
  }

  const defaultRecipe = APPEARANCE_RECIPES.default;
  const targetRecipe = APPEARANCE_RECIPES[appearance];

  const background = shiftTowardRecipe(
    base.background,
    defaultRecipe.background,
    targetRecipe.background,
    hue,
  );
  const text = autoTextForBackground(background, hue);

  let buttonBg = shiftTowardRecipe(
    base.buttonBg,
    defaultRecipe.buttonBg,
    targetRecipe.buttonBg,
    hue,
  );
  let buttonText = shiftTowardRecipe(
    base.buttonText,
    defaultRecipe.buttonText,
    targetRecipe.buttonText,
    hue,
  );
  ({ buttonBg, buttonText } = finalizePrimitiveButtonPair(buttonBg, buttonText));

  return { background, text, buttonBg, buttonText };
}

export function resolveCustomPrimitives(
  input?: ColorPrimitives | null,
): ColorPrimitives {
  if (!input) return { ...DEFAULT_CUSTOM_PRIMITIVES };
  return normalizeCustomPrimitives(input);
}

export function parseCustomPrimitives(raw: unknown): ColorPrimitives {
  if (isColorPrimitives(raw)) {
    return normalizeCustomPrimitives(raw);
  }

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const record = raw as Record<string, unknown>;
    if (isColorPrimitives(record.default)) {
      return normalizeCustomPrimitives(record.default as ColorPrimitives);
    }
    if (
      typeof record.background === 'string' &&
      typeof record.text === 'string' &&
      typeof record.buttonBg === 'string' &&
      typeof record.buttonText === 'string'
    ) {
      return normalizeCustomPrimitives(record as ColorPrimitives);
    }
  }

  return { ...DEFAULT_CUSTOM_PRIMITIVES };
}

export { APPEARANCE_RECIPES };
