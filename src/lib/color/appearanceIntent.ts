import {
  APPEARANCE_NAMES,
  GRADIENT_APPEARANCE_PREFIX,
  SOLID_APPEARANCE_NAMES,
  type AppearanceName,
  type SolidAppearanceName,
} from './types';

export type BackgroundStyle = 'solid' | 'gradient';

export type ParsedAppearance = {
  tone: SolidAppearanceName;
  backgroundStyle: BackgroundStyle;
  stored: AppearanceName;
};

export function isGradientAppearance(
  value: string,
): value is `gradient-${SolidAppearanceName}` {
  if (!value.startsWith(GRADIENT_APPEARANCE_PREFIX)) return false;
  const tone = value.slice(GRADIENT_APPEARANCE_PREFIX.length);
  return (SOLID_APPEARANCE_NAMES as readonly string[]).includes(tone);
}

export function gradientAppearanceName(
  tone: SolidAppearanceName,
): `gradient-${SolidAppearanceName}` {
  return `${GRADIENT_APPEARANCE_PREFIX}${tone}`;
}

/** Split CMS appearance into tonal band + optional gradient background. */
export function parseAppearanceIntent(
  appearance: string | null | undefined,
  fallback: SolidAppearanceName = 'default',
): ParsedAppearance {
  const raw = appearance?.trim().toLowerCase() ?? fallback;

  if (isGradientAppearance(raw)) {
    const tone = raw.slice(GRADIENT_APPEARANCE_PREFIX.length) as SolidAppearanceName;
    return {
      tone,
      backgroundStyle: 'gradient',
      stored: raw as AppearanceName,
    };
  }

  const tone = (SOLID_APPEARANCE_NAMES as readonly string[]).includes(raw)
    ? (raw as SolidAppearanceName)
    : fallback;

  return {
    tone,
    backgroundStyle: 'solid',
    stored: tone,
  };
}

export function isAppearanceName(value: string): value is AppearanceName {
  return (APPEARANCE_NAMES as readonly string[]).includes(value);
}
