import {
  deriveSecondaryButtonColors,
  deriveSurfaceHovers,
} from './surfaceExtras';
import type { SemanticColors } from './types';

/** Hover + secondary button tokens not stored in color-themes.css. */
export function appearanceExtraCssVars(
  semantic: Pick<SemanticColors, 'background' | 'text'>,
): Record<string, string> {
  const hovers = deriveSurfaceHovers(semantic.background, semantic.text);
  const secondary = deriveSecondaryButtonColors(
    semantic.background,
    semantic.text,
    hovers.backgroundHover,
    hovers.textHover,
  );

  return {
    '--color-bg-hover': hovers.backgroundHover,
    '--color-fg-hover': hovers.textHover,
    '--color-button-secondary-bg': secondary.buttonSecondaryBg,
    '--color-button-secondary-bg-hover': secondary.buttonSecondaryBgHover,
    '--color-button-secondary-fg': secondary.buttonSecondaryFg,
    '--color-button-secondary-fg-hover': secondary.buttonSecondaryFgHover,
    '--color-button-secondary-border': secondary.buttonSecondaryBorder,
  };
}
