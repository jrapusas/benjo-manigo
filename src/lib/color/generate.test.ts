import { describe, expect, it } from 'vitest';
import {
  APPEARANCE_NAMES,
  BASE_COLOR_NAMES,
  SOLID_APPEARANCE_NAMES,
  cardSurfaceCssVars,
  generateAllColorThemes,
  generateColorTheme,
  generateColorThemesCss,
} from './generate';
import { BRAND_COLOR_NAMES } from './baseColors';
import { contrastRatio, meetsContrast, CONTRAST, relativeLuminance } from './contrast';
import { resolveBaseColorName } from './baseColors';
import { resolveAppearanceName } from './generate';
import { COLOR_SET_APPEARANCE } from './siteBridge';
import { resolveSitePalette, themeGenerationInput } from '../sitePalette';
import {
  assertNoFailures,
  SITE_TONE_IDS,
  validateColorTheme,
  validatePrimitiveContrast,
  validateSemanticContrast,
  validateSiteRoot,
  validateSiteTone,
  type ContrastPairCheck,
} from './validateContrast';

describe('generateColorTheme', () => {
  it('returns four primitives and semantic roles', () => {
    const theme = generateColorTheme({ color: 'blue', appearance: 'soft' });
    expect(Object.keys(theme.primitives).sort()).toEqual([
      'background',
      'buttonBg',
      'buttonText',
      'text',
    ]);
    expect(Object.keys(theme.semantic).sort()).toEqual([
      'background',
      'buttonBg',
      'buttonBgHover',
      'buttonText',
      'buttonTextHover',
      'gradientHeading',
      'gradientLink',
      'gradientSubheading',
      'gradientText',
      'heading',
      'link',
      'linkHover',
      'subheading',
      'subheadingMutedSubtle',
      'subheadingSectionSubtle',
      'text',
    ]);
  });

  it('is deterministic', () => {
    const a = generateColorTheme({ color: 'purple', appearance: 'tinted' });
    const b = generateColorTheme({ color: 'purple', appearance: 'tinted' });
    expect(a).toEqual(b);
  });

  it('falls back for invalid inputs', () => {
    const theme = generateColorTheme({ color: 'not-a-color', appearance: 'nope' });
    expect(theme.color).toBe('auto');
    expect(theme.appearance).toBe('default');
  });

  it('differentiates color × appearance combinations', () => {
    const soft = generateColorTheme({ color: 'blue', appearance: 'soft' });
    const accent = generateColorTheme({ color: 'blue', appearance: 'accent' });
    expect(soft.semantic.background).not.toBe(accent.semantic.background);
  });

  it('emits light card surfaces on contrast, dark, and accent bands', () => {
    const defaultTheme = generateColorTheme({ color: 'green', appearance: 'default' });
    for (const appearance of ['contrast', 'dark', 'accent'] as const) {
      const band = generateColorTheme({ color: 'green', appearance });
      const surface = cardSurfaceCssVars(band);
      expect(surface['--color-card-surface-bg']).toBe(defaultTheme.semantic.background);
      expect(surface['--color-card-surface-text']).toBe(defaultTheme.semantic.text);
      expect(
        contrastRatio(surface['--color-card-surface-text']!, surface['--color-card-surface-bg']!),
      ).toBeGreaterThan(CONTRAST.normalText);
      expect(surface['--color-card-surface-bg']).not.toBe(band.semantic.background);
      expect(
        contrastRatio(surface['--color-card-surface-bg']!, band.semantic.background),
      ).toBeGreaterThan(1.5);
    }

    const css = generateColorThemesCss();
    expect(css).toMatch(
      /\[data-color="green"\]\[data-appearance="contrast"\][\s\S]*?--color-card-surface-bg:/,
    );
    expect(cardSurfaceCssVars(generateColorTheme({ color: 'green', appearance: 'soft' }))).toEqual(
      {},
    );
  });

  it('does not emit card surface tokens on light bands', () => {
    const theme = generateColorTheme({ color: 'blue', appearance: 'soft' });
    expect(cardSurfaceCssVars(theme)).toEqual({});
  });

  it('anchors brand buttons to Tailwind 500 with a white label at 4.5:1', () => {
    const theme = generateColorTheme({ color: 'teal', appearance: 'default' });
    expect(theme.primitives.buttonText).toBe('#ffffff');
    expect(
      meetsContrast(theme.primitives.buttonText, theme.primitives.buttonBg, CONTRAST.normalText),
    ).toBe(true);
    expect(contrastRatio('#ffffff', '#14b8a6')).toBeLessThan(CONTRAST.normalText);
  });

  it('uses light button text on saturated brand colors like blue', () => {
    for (const appearance of ['default', 'soft', 'tinted', 'dark'] as const) {
      const theme = generateColorTheme({ color: 'blue', appearance });
      expect(relativeLuminance(theme.semantic.buttonText)).toBeGreaterThan(0.9);
      expect(
        meetsContrast(theme.semantic.buttonText, theme.semantic.buttonBg, CONTRAST.normalText),
      ).toBe(true);
    }
  });

  it('uses light body text on all contrast bands', () => {
    for (const color of BASE_COLOR_NAMES) {
      if (color === 'custom') continue;
      const theme = generateColorTheme({ color, appearance: 'contrast' });
      expect(relativeLuminance(theme.primitives.text)).toBeGreaterThan(0.9);
      expect(relativeLuminance(theme.semantic.text)).toBeGreaterThan(0.9);
      expect(relativeLuminance(theme.semantic.heading)).toBeGreaterThan(0.9);
      expect(relativeLuminance(theme.semantic.subheading)).toBeGreaterThan(0.9);
      expect(meetsContrast(theme.primitives.text, theme.primitives.background)).toBe(true);
      expect(meetsContrast(theme.semantic.heading, theme.semantic.background)).toBe(true);
      expect(meetsContrast(theme.semantic.subheading, theme.semantic.background)).toBe(true);
    }
  });
});

describe('contrast validation', () => {
  for (const theme of generateAllColorThemes()) {
    it(`passes all pairs for ${theme.color}/${theme.appearance}`, () => {
      assertNoFailures(validateColorTheme(`${theme.color}/${theme.appearance}`, theme));
    });
  }

  for (const color of BRAND_COLOR_NAMES) {
    if (color === 'custom') continue;

    it(`passes site tone pairs for brand ${color}`, () => {
      const palette = resolveSitePalette({ color });
      const results = SITE_TONE_IDS.map((toneId) => {
        const appearance = COLOR_SET_APPEARANCE[toneId];
        const theme = generateColorTheme(themeGenerationInput(palette, appearance));
        return validateSiteTone(`${color}/site:${toneId}`, theme.semantic);
      });

      const defaultTheme = generateColorTheme(themeGenerationInput(palette, 'default'));
      const accentTheme = generateColorTheme(themeGenerationInput(palette, 'accent'));
      const softTheme = generateColorTheme(themeGenerationInput(palette, 'soft'));
      const darkTheme = generateColorTheme(themeGenerationInput(palette, 'dark'));

      assertNoFailures(
        ...results,
        validateSiteRoot(
          `${color}/site:root`,
          defaultTheme.semantic,
          accentTheme.semantic,
          softTheme.semantic,
          darkTheme.semantic,
        ),
      );
    });
  }

  it('passes all pairs for custom themes', () => {
    const custom = {
      background: '#ffffff',
      text: '#111827',
      buttonBg: '#7c3aed',
      buttonText: '#ffffff',
    };
    const results = APPEARANCE_NAMES.map((appearance) =>
      validateColorTheme(
        `custom/${appearance}`,
        generateColorTheme({ color: 'custom', appearance, customPrimitives: custom }),
      ),
    );
    assertNoFailures(...results);
  });

  it('creates readable hierarchy on light and dark appearances', () => {
    const light = generateColorTheme({ color: 'blue', appearance: 'default' });
    const dark = generateColorTheme({ color: 'blue', appearance: 'dark' });
    const contrast = generateColorTheme({ color: 'blue', appearance: 'contrast' });

    expect(contrastRatio(light.semantic.heading, light.semantic.background)).toBeGreaterThan(
      contrastRatio(light.semantic.subheading, light.semantic.background),
    );
    expect(contrastRatio(dark.semantic.heading, dark.semantic.background)).toBeGreaterThan(
      contrastRatio(dark.semantic.subheading, dark.semantic.background),
    );
    expect(contrast.semantic.heading).not.toBe(contrast.semantic.text);
    expect(contrastRatio(contrast.semantic.heading, contrast.semantic.background)).toBeGreaterThan(
      contrastRatio(contrast.semantic.subheading, contrast.semantic.background),
    );
  });

  it('precomputes subtle text tokens that pass AA', () => {
    for (const theme of generateAllColorThemes()) {
      const { semantic: s } = theme;
      expect(meetsContrast(s.subheadingSectionSubtle, s.background)).toBe(true);
      expect(meetsContrast(s.subheadingMutedSubtle, s.background)).toBe(true);
    }
  });

  it('keeps primitive button pairs at body-text contrast', () => {
    for (const theme of generateAllColorThemes()) {
      expect(
        meetsContrast(
          theme.primitives.buttonText,
          theme.primitives.buttonBg,
          CONTRAST.normalText,
        ),
      ).toBe(true);
    }
  });
});

describe('derivation relationships', () => {
  it('derives hover from button colors', () => {
    const theme = generateColorTheme({ color: 'teal', appearance: 'default' });
    expect(theme.semantic.buttonBgHover).not.toBe(theme.semantic.buttonBg);
  });

  it('derives links from button background', () => {
    const theme = generateColorTheme({ color: 'amber', appearance: 'soft' });
    expect(theme.semantic.link).not.toBe(theme.semantic.text);
    expect(theme.semantic.linkHover).not.toBe(theme.semantic.link);
  });

  it('keeps links readable on light bands and distinct from button fills', () => {
    const theme = generateColorTheme({ color: 'blue', appearance: 'soft' });
    expect(contrastRatio(theme.semantic.link, theme.semantic.background)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrastRatio(theme.semantic.link, theme.semantic.buttonBg)).toBeGreaterThanOrEqual(3);
  });

  it('keeps primary button labels at body-text contrast', () => {
    for (const appearance of ['default', 'soft', 'tinted', 'dark'] as const) {
      const theme = generateColorTheme({ color: 'blue', appearance });
      expect(
        meetsContrast(theme.semantic.buttonText, theme.semantic.buttonBg, CONTRAST.normalText),
      ).toBe(true);
      expect(
        meetsContrast(
          theme.semantic.buttonTextHover,
          theme.semantic.buttonBgHover,
          CONTRAST.normalText,
        ),
      ).toBe(true);
    }
  });
});

describe('resolvers', () => {
  it('covers all base colors and appearances', () => {
    expect(BASE_COLOR_NAMES.length).toBeGreaterThanOrEqual(10);
    expect(BASE_COLOR_NAMES).toContain('custom');
    expect(APPEARANCE_NAMES).toEqual([
      'default',
      'soft',
      'tinted',
      'contrast',
      'dark',
      'accent',
      'gradient-default',
      'gradient-soft',
      'gradient-tinted',
      'gradient-contrast',
      'gradient-dark',
      'gradient-accent',
    ]);
  });

  it('resolves base color names safely', () => {
    expect(resolveBaseColorName('GREEN')).toBe('green');
    expect(resolveBaseColorName('unknown')).toBe('auto');
  });

  it('resolves appearance names safely', () => {
    expect(resolveAppearanceName('DARK')).toBe('dark');
    expect(resolveAppearanceName('gradient-soft')).toBe('soft');
    expect(resolveAppearanceName('invalid')).toBe('default');
  });
});

describe('custom primitives', () => {
  const custom = {
    background: '#ffffff',
    text: '#111827',
    buttonBg: '#7c3aed',
    buttonText: '#ffffff',
  };

  it('uses exact primitives for default appearance', () => {
    const theme = generateColorTheme({
      color: 'custom',
      appearance: 'default',
      customPrimitives: custom,
    });
    expect(theme.primitives.background).toBe(custom.background);
    expect(theme.primitives.text).toBe(custom.text);
    expect(theme.primitives.buttonBg).toBe(custom.buttonBg);
    expect(theme.primitives.buttonText).toBe(custom.buttonText);
  });

  it('derives other appearances from custom primitives', () => {
    const soft = generateColorTheme({
      color: 'custom',
      appearance: 'soft',
      customPrimitives: custom,
    });
    expect(soft.primitives.background).not.toBe(custom.background);

    const accent = generateColorTheme({
      color: 'custom',
      appearance: 'accent',
      customPrimitives: custom,
    });
    expect(accent.primitives.buttonBg).not.toBe(custom.buttonBg);
  });

  it('derives other appearances when custom background changes', () => {
    const softBefore = generateColorTheme({
      color: 'custom',
      appearance: 'soft',
      customPrimitives: custom,
    });
    const updated = { ...custom, background: '#fef3c7' };
    const softAfter = generateColorTheme({
      color: 'custom',
      appearance: 'soft',
      customPrimitives: updated,
    });
    expect(softAfter.primitives.background).not.toBe(softBefore.primitives.background);
  });

  it('computes contrast appearance as medium band with inverted buttons', () => {
    const theme = generateColorTheme({
      color: 'custom',
      appearance: 'contrast',
      customPrimitives: custom,
    });
    expect(relativeLuminance(theme.primitives.background)).toBeLessThan(0.7);
    expect(relativeLuminance(theme.primitives.background)).toBeGreaterThan(0.15);
    expect(relativeLuminance(theme.primitives.buttonBg)).toBeGreaterThan(0.7);
    expect(relativeLuminance(theme.primitives.buttonText)).toBeLessThan(0.4);
    expect(meetsContrast(theme.primitives.text, theme.primitives.background)).toBe(true);
    expect(meetsContrast(theme.semantic.heading, theme.semantic.background)).toBe(true);
    expect(meetsContrast(theme.semantic.subheading, theme.semantic.background)).toBe(true);
  });

  it('passes contrast checks for custom themes', () => {
    for (const appearance of APPEARANCE_NAMES) {
      const theme = generateColorTheme({
        color: 'custom',
        appearance,
        customPrimitives: custom,
      });
      expect(meetsContrast(theme.primitives.text, theme.primitives.background)).toBe(true);
      expect(
        meetsContrast(theme.primitives.buttonText, theme.primitives.buttonBg, CONTRAST.ui),
      ).toBe(true);
      expect(meetsContrast(theme.semantic.text, theme.semantic.background)).toBe(true);
      expect(meetsContrast(theme.semantic.buttonText, theme.semantic.buttonBg, 3)).toBe(
        true,
      );
    }
  });
});

describe('client color scheme', () => {
  it('uses the specified brand palette per appearance', () => {
    const defaultTheme = generateColorTheme({ color: 'client', appearance: 'default' });
    const softTheme = generateColorTheme({ color: 'client', appearance: 'soft' });
    const tintedTheme = generateColorTheme({ color: 'client', appearance: 'tinted' });
    const contrastTheme = generateColorTheme({ color: 'client', appearance: 'contrast' });
    const accentTheme = generateColorTheme({ color: 'client', appearance: 'accent' });
    const darkTheme = generateColorTheme({ color: 'client', appearance: 'dark' });

    expect(defaultTheme.semantic.background).toBe('#ffffff');
    expect(defaultTheme.semantic.heading).toBe('#12304a');
    expect(defaultTheme.semantic.text).toBe('#17212b');
    expect(defaultTheme.semantic.buttonBg).toBe('#12304a');
    expect(defaultTheme.semantic.link).toBe('#167c80');

    expect(softTheme.semantic.background).toBe('#f5f7f9');
    expect(tintedTheme.semantic.background).toBe('#eef7f7');
    expect(contrastTheme.semantic.background).toBe('#12304a');
    expect(contrastTheme.semantic.buttonBg).toBe('#ffffff');
    expect(contrastTheme.semantic.buttonText).toBe('#12304a');
    expect(accentTheme.semantic.buttonBg).toBe('#167c80');
    expect(accentTheme.semantic.buttonText).toBe('#ffffff');
    expect(darkTheme.semantic.background).toBe('#0b1f2e');
    expect(darkTheme.semantic.buttonBg).toBe('#167c80');
    expect(darkTheme.semantic.link).toBe('#ffffff');
  });

  it('passes contrast validation for client solid appearances', () => {
    const bands = SOLID_APPEARANCE_NAMES.filter((appearance) => appearance !== 'accent');
    const results = bands.map((appearance) =>
      validateColorTheme(
        `client/${appearance}`,
        generateColorTheme({ color: 'client', appearance }),
      ),
    );
    assertNoFailures(...results);
  });

  it('passes solid semantic contrast for client accent band', () => {
    const theme = generateColorTheme({ color: 'client', appearance: 'accent' });
    const failures: ContrastPairCheck[] = [];
    validatePrimitiveContrast(failures, theme);
    validateSemanticContrast(failures, theme.semantic);
    assertNoFailures({ label: 'client/accent', failures });
  });

  it('uses client default-band buttons on inverted card surfaces', () => {
    const darkTheme = generateColorTheme({ color: 'client', appearance: 'dark' });
    const surface = cardSurfaceCssVars(darkTheme, { colorId: 'client' });
    expect(surface['--color-card-surface-button-bg']).toBe('#12304a');
    expect(surface['--color-card-surface-button-bg']).not.toBe('#3b82f6');
  });

  it('resolves from site palette input', () => {
    const palette = resolveSitePalette({ scheme: 'client' });
    expect(palette.scheme).toBe('client');
    expect(themeGenerationInput(palette, 'default').color).toBe('client');
  });
});
