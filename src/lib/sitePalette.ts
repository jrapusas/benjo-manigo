import { parse } from 'yaml';
import { presetSlugToBaseColor, resolveBrandColorName } from './color/baseColors';
import { resolveColorSchemeId, type ColorSchemeId } from './color/schemes';
import { parseCustomPrimitives } from './color/variations';
import {
  gradientAppearanceName,
  parseAppearanceIntent,
} from './color/appearanceIntent';
import {
  SOLID_APPEARANCE_NAMES,
  type AppearanceName,
  type BaseColorName,
  type ColorPrimitives,
  type SolidAppearanceName,
} from './color/types';

/** Stored in colors.yaml - design intent, not generated hex values. */
export type SitePaletteInput = {
  color?: string | null;
  custom?: ColorPrimitives | Record<string, unknown> | null;
  /** Named color scheme - overrides hue/custom when set */
  scheme?: string | null;
  /** @deprecated Legacy preset slug - mapped to base color on read */
  preset?: string | null;
};

export type SitePalette = {
  color: BaseColorName;
  custom: ColorPrimitives;
  scheme: ColorSchemeId | null;
};

const SOLID_APPEARANCE_LABELS: Record<
  SolidAppearanceName,
  { label: string; description: string }
> = {
  default: {
    label: 'Default',
    description: 'Normal content sections with neutral background.',
  },
  soft: {
    label: 'Soft',
    description: 'Subtle branded tint for alternating sections.',
  },
  tinted: {
    label: 'Tinted',
    description: 'Stronger background tint for visual grouping.',
  },
  contrast: {
    label: 'Contrast',
    description: 'Medium branded band with contrasting text.',
  },
  dark: {
    label: 'Dark',
    description: 'Dark sections for footer-like or CTA areas.',
  },
  accent: {
    label: 'Accent',
    description: 'Strongest brand emphasis for hero or major CTAs.',
  },
};

export const APPEARANCE_LABELS: Record<
  AppearanceName,
  { label: string; description: string }
> = {
  ...SOLID_APPEARANCE_LABELS,
  ...Object.fromEntries(
    SOLID_APPEARANCE_NAMES.map((tone) => {
      const base = SOLID_APPEARANCE_LABELS[tone];
      return [
        gradientAppearanceName(tone),
        {
          label: `Gradient · ${base.label}`,
          description: `${base.description} Gradient background.`,
        },
      ];
    }),
  ) as Record<
    `gradient-${SolidAppearanceName}`,
    { label: string; description: string }
  >,
};

export function resolveSitePalette(
  input?: SitePaletteInput | null,
): SitePalette {
  const scheme = resolveColorSchemeId(input?.scheme);
  const color = input?.color
    ? resolveBrandColorName(input.color)
    : input?.preset
      ? presetSlugToBaseColor(input.preset)
      : 'blue';

  const custom = parseCustomPrimitives(input?.custom);

  return { color, custom, scheme };
}

/** data-color attribute value for the active site palette. */
export function sitePaletteColorId(palette: SitePalette): string {
  return palette.scheme ?? palette.color;
}

export function themeGenerationInput(
  palette: SitePalette,
  appearance: AppearanceName,
) {
  const { tone } = parseAppearanceIntent(appearance);
  return {
    color: palette.scheme ?? palette.color,
    appearance: tone,
    customPrimitives:
      palette.scheme === null && palette.color === 'custom' ? palette.custom : undefined,
  };
}

const colorsYaml = import.meta.glob('../content/colors.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function parseCustomFromRecord(
  record: Record<string, unknown>,
): SitePaletteInput['custom'] {
  return parseCustomPrimitives(record.custom);
}

/** Read site palette intent from colors.yaml. */
export function getSitePalette(): SitePaletteInput | null {
  const raw = colorsYaml['../content/colors.yaml'];
  if (!raw) return null;

  const doc = parse(raw) as { palette?: Record<string, unknown> };
  if (!doc.palette || typeof doc.palette !== 'object' || Array.isArray(doc.palette)) {
    return null;
  }

  const record = doc.palette;
  const color = typeof record.color === 'string' ? record.color.trim() : undefined;
  const scheme = typeof record.scheme === 'string' ? record.scheme.trim() : undefined;
  const preset =
    typeof record.preset === 'string' ? record.preset.trim() : undefined;

  if (!color && !preset && !scheme) {
    return { color: 'blue', custom: parseCustomFromRecord(record) };
  }

  return {
    color: color || undefined,
    scheme: scheme || undefined,
    preset: preset || undefined,
    custom: parseCustomFromRecord(record),
  };
}

/** Single read + resolve for layouts and blocks. */
export function getResolvedSitePalette(): SitePalette {
  return resolveSitePalette(getSitePalette());
}
