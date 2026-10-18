import { type ColorSetId } from '../keystatic/colors';
import {
  deriveSecondaryButtonColors,
  deriveSurfaceHovers,
} from './color/surfaceExtras';
import {
  generateColorTheme,
  generateCustomColorAttributeCss,
  generateSchemeColorAttributeCss,
} from './color/generate';
import type { AppearanceName } from './color/types';
import { COLOR_SET_APPEARANCE, legacyToneSemanticVars } from './color/siteBridge';
import {
  resolveSitePalette,
  sitePaletteColorId,
  themeGenerationInput,
  type SitePaletteInput,
} from './sitePalette';

export type SiteColors = SitePaletteInput;

const CMS_COLOR_KEYS: Record<ColorSetId, string> = {
  default: 'default',
  surface: 'surface',
  card: 'card',
  brand: 'brand',
  brandStrong: 'brand-strong',
  muted: 'muted',
};

const CMS_COLOR_SET_IDS = Object.keys(CMS_COLOR_KEYS) as ColorSetId[];

function renderToneVars(palette: ReturnType<typeof resolveSitePalette>, id: ColorSetId): string {
  const appearance = COLOR_SET_APPEARANCE[id] as AppearanceName;
  const theme = generateColorTheme(themeGenerationInput(palette, appearance));
  const s = theme.semantic;
  const hovers = deriveSurfaceHovers(s.background, s.text);
  const secondary = deriveSecondaryButtonColors(
    s.background,
    s.text,
    hovers.backgroundHover,
    hovers.textHover,
  );
  const key = CMS_COLOR_KEYS[id];

  return `  --color-${key}-bg: ${s.background};
  --color-${key}-fg: ${s.text};
  --color-${key}-bg-hover: ${hovers.backgroundHover};
  --color-${key}-fg-hover: ${hovers.textHover};
  --color-${key}-link: ${s.link};
  --color-${key}-link-hover: ${s.linkHover};
  --color-${key}-button-bg: ${s.buttonBg};
  --color-${key}-button-bg-hover: ${s.buttonBgHover};
  --color-${key}-button-fg: ${s.buttonText};
  --color-${key}-button-fg-hover: ${s.buttonTextHover};
  --color-${key}-button-secondary-bg: ${secondary.buttonSecondaryBg};
  --color-${key}-button-secondary-bg-hover: ${secondary.buttonSecondaryBgHover};
  --color-${key}-button-secondary-fg: ${secondary.buttonSecondaryFg};
  --color-${key}-button-secondary-fg-hover: ${secondary.buttonSecondaryFgHover};
  --color-${key}-button-secondary-border: ${secondary.buttonSecondaryBorder};
  ${legacyToneSemanticVars(key, s)}`;
}

/** CSS custom properties from Site Settings, overriding theme.css defaults. */
export function siteThemeStyle(colors?: SiteColors | null): string {
  const palette = resolveSitePalette(colors);
  const defaultTheme = generateColorTheme(themeGenerationInput(palette, 'default'));
  const accentTheme = generateColorTheme(themeGenerationInput(palette, 'accent'));
  const softTheme = generateColorTheme(themeGenerationInput(palette, 'soft'));
  const darkTheme = generateColorTheme(themeGenerationInput(palette, 'dark'));
  const defaultSemantic = defaultTheme.semantic;
  const accentSemantic = accentTheme.semantic;
  const softSemantic = softTheme.semantic;
  const darkSemantic = darkTheme.semantic;
  const defaultHovers = deriveSurfaceHovers(
    defaultSemantic.background,
    defaultSemantic.text,
  );

  const toneVars = CMS_COLOR_SET_IDS.map((id) => renderToneVars(palette, id)).join('\n');

  const accentHovers = deriveSurfaceHovers(
    accentSemantic.background,
    accentSemantic.text,
  );
  const brandSecondary = deriveSecondaryButtonColors(
    accentSemantic.background,
    accentSemantic.text,
    accentHovers.backgroundHover,
    accentHovers.textHover,
  );

  const interactiveVars = legacyToneSemanticVars('interactive', accentSemantic)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
  const onBrandVars = legacyToneSemanticVars('on-brand', accentSemantic)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');

  return `:root {
  --site-base-color: ${sitePaletteColorId(palette)};
  --color-default-bg: ${defaultSemantic.background};
  --color-default-fg: ${defaultSemantic.text};
  --color-surface-bg: ${softSemantic.background};
  --color-surface-fg: ${softSemantic.text};
  --color-card-bg: ${defaultSemantic.background};
  --color-card-fg: ${defaultSemantic.text};
  --color-card-border: color-mix(in srgb, ${defaultSemantic.text} 12%, ${defaultSemantic.background});
  --color-brand-bg: ${accentSemantic.background};
  --color-brand-fg: ${accentSemantic.text};
  --color-brand-strong-bg: ${darkTheme.semantic.background};
  --color-brand-strong-fg: ${darkTheme.semantic.text};
  --color-muted-bg: ${softSemantic.background};
  --color-muted-fg: ${softSemantic.subheading};
  --color-muted-fg-subtle: ${softSemantic.subheading};
  --color-interactive-bg: ${defaultSemantic.buttonBg};
  --color-interactive-bg-hover: ${defaultSemantic.buttonBgHover};
  --color-interactive-link: ${accentSemantic.link};
  --color-interactive-link-hover: ${accentSemantic.linkHover};
  --color-interactive-fg: ${defaultSemantic.link};
  --color-interactive-fg-hover: ${defaultSemantic.linkHover};
  --color-on-interactive-fg: ${defaultSemantic.buttonText};
  --color-on-interactive-fg-hover: ${defaultSemantic.buttonTextHover};
  --color-on-brand-bg: ${accentSemantic.background};
  --color-on-brand-fg: ${accentSemantic.text};
  --color-on-brand-fg-muted: color-mix(in srgb, ${accentSemantic.text} 80%, ${accentSemantic.background});
  --color-on-brand-fg-subtle: color-mix(in srgb, ${accentSemantic.text} 65%, ${accentSemantic.background});
  --color-accent-line: color-mix(in srgb, ${defaultSemantic.buttonBg} 90%, #000000);
  --color-accent-line-subtle: color-mix(in srgb, ${accentSemantic.text} 50%, ${accentSemantic.background});
  --color-link: ${defaultSemantic.link};
  --color-link-hover: ${defaultSemantic.linkHover};
  --color-bg-hover: ${defaultHovers.backgroundHover};
  --color-fg-hover: ${defaultHovers.textHover};
  --color-button-bg: var(--color-default-button-bg);
  --color-button-bg-hover: var(--color-default-button-bg-hover);
  --color-button-fg: var(--color-default-button-fg);
  --color-button-fg-hover: var(--color-default-button-fg-hover);
  --color-interactive-button-secondary-bg: ${brandSecondary.buttonSecondaryBg};
  --color-interactive-button-secondary-bg-hover: ${brandSecondary.buttonSecondaryBgHover};
  --color-interactive-button-secondary-fg: ${brandSecondary.buttonSecondaryFg};
  --color-interactive-button-secondary-fg-hover: ${brandSecondary.buttonSecondaryFgHover};
  --color-interactive-button-secondary-border: ${brandSecondary.buttonSecondaryBorder};
${toneVars}
${interactiveVars}
${onBrandVars}
}`;
}

/** Runtime CSS for data-color="custom" and named scheme section attributes. */
export function siteThemeAttributeCss(colors?: SiteColors | null): string {
  const palette = resolveSitePalette(colors);
  if (palette.scheme) {
    return generateSchemeColorAttributeCss(palette.scheme);
  }
  if (palette.color !== 'custom') return '';
  return generateCustomColorAttributeCss(palette.custom);
}

/** CMS theme as inline custom properties (wins over theme.css :root defaults). */
export function siteThemeInlineStyle(colors?: SiteColors | null): string {
  return siteThemeStyle(colors)
    .replace(/^:root\s*\{\s*/u, '')
    .replace(/\s*\}\s*$/u, '')
    .trim();
}

/** Map CMS color set to data-attribute appearance for blocks. */
export function colorSetToAppearance(id: ColorSetId): string {
  return COLOR_SET_APPEARANCE[id];
}
