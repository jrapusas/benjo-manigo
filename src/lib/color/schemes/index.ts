import { CLIENT_SCHEME } from './client';
import type { NamedColorScheme } from './types';

export const COLOR_SCHEME_IDS = ['client'] as const;

export type ColorSchemeId = (typeof COLOR_SCHEME_IDS)[number];

export const COLOR_SCHEMES: Record<ColorSchemeId, NamedColorScheme> = {
  client: CLIENT_SCHEME,
};

export const COLOR_SCHEME_OPTIONS = COLOR_SCHEME_IDS.map((id) => ({
  value: id,
  label: COLOR_SCHEMES[id].label,
  description: COLOR_SCHEMES[id].description,
}));

export function isColorSchemeId(value?: string | null): value is ColorSchemeId {
  if (!value) return false;
  return (COLOR_SCHEME_IDS as readonly string[]).includes(value.trim().toLowerCase());
}

export function resolveColorSchemeId(value?: string | null): ColorSchemeId | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || !isColorSchemeId(normalized)) return null;
  return normalized;
}

export function getColorScheme(id: ColorSchemeId): NamedColorScheme {
  return COLOR_SCHEMES[id];
}

export { generateSchemeColorTheme } from './derive';
export type { NamedColorScheme, SchemeAppearanceSpec, SchemeSemanticOverrides } from './types';
