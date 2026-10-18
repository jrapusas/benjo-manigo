import { BASE_COLOR_NAMES, type BaseColorName, type BrandColorName } from './types';
import { hexToOklch } from './oklch';

/** Tailwind CSS v3 default palette - 500 step. */
const TAILWIND_500 = {
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
  /** Extended names - 500-level anchors aligned with palette intent. */
  taupe: '#a08c7a',
  mauve: '#b47eb3',
  mist: '#94a3b8',
  olive: '#848942',
} as const;

export type Tailwind500Name = keyof typeof TAILWIND_500;

export type BaseColorDefinition = {
  label: string;
  /** Tailwind 500 hex - primary brand anchor. */
  brand: string;
  /** Hue extracted from brand for appearance recipes. */
  hue: number;
};

function defineColor(label: string, brand: string): BaseColorDefinition {
  return { label, brand, hue: hexToOklch(brand).h };
}

/** Configurable named base colors - Tailwind 500 brand anchors. */
export const BASE_COLORS: Record<BaseColorName, BaseColorDefinition> = {
  auto: defineColor('Auto', TAILWIND_500.blue),
  red: defineColor('Red', TAILWIND_500.red),
  orange: defineColor('Orange', TAILWIND_500.orange),
  amber: defineColor('Amber', TAILWIND_500.amber),
  yellow: defineColor('Yellow', TAILWIND_500.yellow),
  lime: defineColor('Lime', TAILWIND_500.lime),
  green: defineColor('Green', TAILWIND_500.green),
  emerald: defineColor('Emerald', TAILWIND_500.emerald),
  teal: defineColor('Teal', TAILWIND_500.teal),
  cyan: defineColor('Cyan', TAILWIND_500.cyan),
  sky: defineColor('Sky', TAILWIND_500.sky),
  blue: defineColor('Blue', TAILWIND_500.blue),
  indigo: defineColor('Indigo', TAILWIND_500.indigo),
  violet: defineColor('Violet', TAILWIND_500.violet),
  purple: defineColor('Purple', TAILWIND_500.purple),
  fuchsia: defineColor('Fuchsia', TAILWIND_500.fuchsia),
  pink: defineColor('Pink', TAILWIND_500.pink),
  rose: defineColor('Rose', TAILWIND_500.rose),
  slate: defineColor('Slate', TAILWIND_500.slate),
  gray: defineColor('Gray', TAILWIND_500.gray),
  zinc: defineColor('Zinc', TAILWIND_500.zinc),
  neutral: defineColor('Neutral', TAILWIND_500.neutral),
  stone: defineColor('Stone', TAILWIND_500.stone),
  taupe: defineColor('Taupe', TAILWIND_500.taupe),
  mauve: defineColor('Mauve', TAILWIND_500.mauve),
  mist: defineColor('Mist', TAILWIND_500.mist),
  olive: defineColor('Olive', TAILWIND_500.olive),
  custom: defineColor('Custom', TAILWIND_500.blue),
};

export const GOLDEN_ANGLE = 137.508;

const HUE_BRAND_NAMES = BASE_COLOR_NAMES.filter(
  (name): name is Exclude<BrandColorName, 'custom'> =>
    name !== 'auto' && name !== 'custom',
);

/** Site brand picker: Custom first, then hues A–Z. */
export const BRAND_COLOR_NAMES: readonly BrandColorName[] = [
  'custom',
  ...[...HUE_BRAND_NAMES].sort((a, b) => a.localeCompare(b)),
];

export function resolveBrand500(color: BaseColorName): string | undefined {
  if (color === 'auto' || color === 'custom') return undefined;
  return BASE_COLORS[color].brand;
}

export function resolveBrandColorName(value?: string | null): BrandColorName {
  const resolved = resolveBaseColorName(value);
  return resolved === 'auto' ? 'blue' : resolved;
}

export function resolveBaseColorName(value?: string | null): BaseColorName {
  const normalized = value?.trim().toLowerCase() ?? 'auto';
  if (normalized in BASE_COLORS) {
    return normalized as BaseColorName;
  }
  return 'auto';
}

export function resolveBaseHue(
  color: BaseColorName,
  variantIndex = 0,
  customHue?: number,
): number {
  const base =
    color === 'custom'
      ? (customHue ?? BASE_COLORS.blue.hue)
      : BASE_COLORS[color].hue;
  if (variantIndex <= 0) return base;
  return (base + variantIndex * GOLDEN_ANGLE) % 360;
}

/** Map legacy preset slugs to base color names where possible. */
export function presetSlugToBaseColor(slug?: string | null): BaseColorName {
  if (!slug) return 'auto';
  const match = slug.match(
    /^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|grey|zinc|neutral|stone|taupe|mauve|mist|olive|navy|trust|ocean|forest|sunset|gold|crimson)/u,
  );
  if (!match) return 'auto';
  const token = match[1];
  const alias: Record<string, BaseColorName> = {
    navy: 'blue',
    trust: 'blue',
    ocean: 'teal',
    forest: 'green',
    gold: 'amber',
    crimson: 'red',
    sunset: 'amber',
    grey: 'gray',
  };
  if (token in BASE_COLORS) return token as BaseColorName;
  return alias[token] ?? 'auto';
}

export { TAILWIND_500 };
