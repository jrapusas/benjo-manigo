/** Named base colors - hue sources for deterministic theme generation. */
export const BASE_COLOR_NAMES = [
  'auto',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive',
  'custom',
] as const;

export type BaseColorName = (typeof BASE_COLOR_NAMES)[number];

/** Solid section tones - increasing visual emphasis. */
export const SOLID_APPEARANCE_NAMES = [
  'default',
  'soft',
  'tinted',
  'contrast',
  'dark',
  'accent',
] as const;

export type SolidAppearanceName = (typeof SOLID_APPEARANCE_NAMES)[number];

export const GRADIENT_APPEARANCE_PREFIX = 'gradient-';

export type GradientAppearanceName = `gradient-${SolidAppearanceName}`;

export const GRADIENT_APPEARANCE_NAMES = SOLID_APPEARANCE_NAMES.map(
  (name) => `${GRADIENT_APPEARANCE_PREFIX}${name}` as GradientAppearanceName,
);

/** Solid + gradient variants selectable in the CMS. */
export const APPEARANCE_NAMES = [
  ...SOLID_APPEARANCE_NAMES,
  ...GRADIENT_APPEARANCE_NAMES,
] as const;

export type AppearanceName = (typeof APPEARANCE_NAMES)[number];

/** Legacy section tones mapped to appearance for backward compatibility. */
export const LEGACY_TONE_TO_APPEARANCE = {
  default: 'default',
  surface: 'soft',
  card: 'default',
  brand: 'accent',
  'brand-strong': 'dark',
} as const;

export type LegacySectionTone = keyof typeof LEGACY_TONE_TO_APPEARANCE;

/** Four foundational primitives - the only explicit color inputs. */
export type ColorPrimitives = {
  background: string;
  text: string;
  buttonBg: string;
  buttonText: string;
};

/** Brand color picker options - site palette excludes auto. */
export type BrandColorName = Exclude<BaseColorName, 'auto'>;

/** Ten semantic roles exposed to components via CSS custom properties. */
export type SemanticColors = {
  background: string;
  heading: string;
  subheading: string;
  /** Pre-mixed subheading for `text-section-subtle` - passes AA on section background. */
  subheadingSectionSubtle: string;
  /** Pre-mixed subheading for `text-muted-subtle` - passes AA on section background. */
  subheadingMutedSubtle: string;
  text: string;
  buttonBg: string;
  buttonText: string;
  buttonBgHover: string;
  buttonTextHover: string;
  link: string;
  linkHover: string;
  /** Text roles hardened for gradient midpoint contrast (defaults match base roles). */
  gradientText: string;
  gradientHeading: string;
  gradientSubheading: string;
  gradientLink: string;
};

export type ColorTheme = {
  color: BaseColorName;
  appearance: SolidAppearanceName;
  primitives: ColorPrimitives;
  semantic: SemanticColors;
};

export type GenerateColorThemeInput = {
  color?: string | null;
  appearance?: string | null;
  /** Required when color is custom - default appearance primitives; others derive. */
  customPrimitives?: ColorPrimitives | null;
  /** Deterministic hue offset for card/block variants (golden-angle steps). */
  variantIndex?: number;
};

export type Oklch = {
  l: number;
  c: number;
  h: number;
};
