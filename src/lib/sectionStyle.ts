import { resolveBaseColorName } from './color/baseColors';
import {
  type AppearanceName,
  type SolidAppearanceName,
} from './color/types';
import {
  isAppearanceName,
  parseAppearanceIntent,
} from './color/appearanceIntent';
import type { SitePalette } from './sitePalette';

/** Resolve block/site color intent against the site palette. */
export function resolveSectionColor(
  color: string | null | undefined,
  site: SitePalette,
): string {
  const requested = resolveBaseColorName(color ?? 'auto');

  if (requested === 'auto') {
    return site.scheme ?? site.color;
  }

  if (requested === 'custom') {
    if (site.scheme) return site.scheme;
    return site.color === 'custom' ? 'custom' : site.color;
  }

  return requested;
}

export function resolveSectionAppearance(
  appearance: string | null | undefined,
  fallback: SolidAppearanceName = 'default',
): AppearanceName {
  if (appearance && isAppearanceName(appearance)) {
    return appearance;
  }
  return parseAppearanceIntent(fallback, 'default').stored;
}

/** Resolve CMS color/appearance intent for Section blocks. */
export function resolveSectionIntent(
  site: SitePalette,
  input?: {
    color?: string | null;
    appearance?: string | null;
    fallbackAppearance?: SolidAppearanceName;
  },
): { color: string; appearance: AppearanceName } {
  return {
    color: resolveSectionColor(input?.color, site),
    appearance: resolveSectionAppearance(
      input?.appearance,
      input?.fallbackAppearance ?? 'default',
    ),
  };
}

export { parseAppearanceIntent } from './color/appearanceIntent';
