import { CONTRAST, contrastRatio, meetsContrast } from './contrast';
import { validateGradientContrast } from './gradientContrast';
import type { ColorTheme, SemanticColors } from './types';
import {
  deriveSecondaryButtonColors,
  deriveSurfaceHovers,
} from './surfaceExtras';
import type { ColorSetId } from '../../keystatic/colors';

export type ContrastPairCheck = {
  pair: string;
  foreground: string;
  background: string;
  minimum: number;
  ratio: number;
};

export type ContrastValidationResult = {
  label: string;
  failures: ContrastPairCheck[];
};

function checkPair(
  failures: ContrastPairCheck[],
  pair: string,
  foreground: string,
  background: string,
  minimum: number,
): void {
  const ratio = contrastRatio(foreground, background);
  if (!meetsContrast(foreground, background, minimum)) {
    failures.push({ pair, foreground, background, minimum, ratio });
  }
}

/** Core semantic roles on section background + button states. */
export function validateSemanticContrast(
  failures: ContrastPairCheck[],
  semantic: SemanticColors,
  prefix = '',
): void {
  const p = prefix ? `${prefix} ` : '';
  const bg = semantic.background;

  checkPair(failures, `${p}text/background`, semantic.text, bg, CONTRAST.normalText);
  checkPair(failures, `${p}heading/background`, semantic.heading, bg, CONTRAST.normalText);
  checkPair(
    failures,
    `${p}subheading/background`,
    semantic.subheading,
    bg,
    CONTRAST.normalText,
  );
  checkPair(failures, `${p}link/background`, semantic.link, bg, CONTRAST.normalText);
  checkPair(
    failures,
    `${p}linkHover/background`,
    semantic.linkHover,
    bg,
    CONTRAST.linkHover,
  );
  checkPair(
    failures,
    `${p}buttonText/buttonBg`,
    semantic.buttonText,
    semantic.buttonBg,
    CONTRAST.ui,
  );
  checkPair(
    failures,
    `${p}buttonTextHover/buttonBgHover`,
    semantic.buttonTextHover,
    semantic.buttonBgHover,
    CONTRAST.ui,
  );
}

/** Four primitives - explicit CMS inputs. */
export function validatePrimitiveContrast(
  failures: ContrastPairCheck[],
  theme: ColorTheme,
): void {
  checkPair(
    failures,
    'primitive text/background',
    theme.primitives.text,
    theme.primitives.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'primitive buttonText/buttonBg',
    theme.primitives.buttonText,
    theme.primitives.buttonBg,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'subheadingSectionSubtle/background',
    theme.semantic.subheadingSectionSubtle,
    theme.semantic.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'subheadingMutedSubtle/background',
    theme.semantic.subheadingMutedSubtle,
    theme.semantic.background,
    CONTRAST.normalText,
  );
}

/** Site tone hovers + secondary buttons derived in siteTheme. */
export function validateSiteToneContrast(
  failures: ContrastPairCheck[],
  semantic: SemanticColors,
  prefix = '',
): void {
  validateSemanticContrast(failures, semantic, prefix);

  const hovers = deriveSurfaceHovers(semantic.background, semantic.text);
  const p = prefix ? `${prefix} ` : '';

  checkPair(
    failures,
    `${p}fgHover/bgHover`,
    hovers.textHover,
    hovers.backgroundHover,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    `${p}text/bgHover`,
    semantic.text,
    hovers.backgroundHover,
    CONTRAST.normalText,
  );

  const secondary = deriveSecondaryButtonColors(
    semantic.background,
    semantic.text,
    hovers.backgroundHover,
    hovers.textHover,
  );

  checkPair(
    failures,
    `${p}secondary fg/bg`,
    secondary.buttonSecondaryFg,
    secondary.buttonSecondaryBg,
    CONTRAST.ui,
  );
  checkPair(
    failures,
    `${p}secondary fgHover/bgHover`,
    secondary.buttonSecondaryFgHover,
    secondary.buttonSecondaryBgHover,
    CONTRAST.ui,
  );
  checkPair(
    failures,
    `${p}secondary border/background`,
    secondary.buttonSecondaryBorder,
    semantic.background,
    CONTRAST.ui,
  );
}

/** :root aliases from siteThemeStyle. */
export function validateSiteRootContrast(
  failures: ContrastPairCheck[],
  defaultSemantic: SemanticColors,
  accentSemantic: SemanticColors,
  softSemantic: SemanticColors,
  darkSemantic: SemanticColors,
): void {
  checkPair(
    failures,
    'interactive bg/text (badge)',
    accentSemantic.buttonText,
    accentSemantic.buttonBg,
    CONTRAST.ui,
  );
  checkPair(
    failures,
    'interactive fg on default bg',
    defaultSemantic.link,
    defaultSemantic.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'interactive link on brand bg',
    accentSemantic.link,
    accentSemantic.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'on-brand fg/bg',
    accentSemantic.text,
    accentSemantic.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'brand-strong fg/bg',
    darkSemantic.text,
    darkSemantic.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'muted fg/bg',
    softSemantic.subheading,
    softSemantic.background,
    CONTRAST.normalText,
  );
  checkPair(
    failures,
    'default primary button',
    defaultSemantic.buttonText,
    defaultSemantic.buttonBg,
    CONTRAST.ui,
  );
}

export function validateSiteRoot(
  label: string,
  defaultSemantic: SemanticColors,
  accentSemantic: SemanticColors,
  softSemantic: SemanticColors,
  darkSemantic: SemanticColors,
): ContrastValidationResult {
  const failures: ContrastPairCheck[] = [];
  validateSiteRootContrast(failures, defaultSemantic, accentSemantic, softSemantic, darkSemantic);
  return { label, failures };
}

export function validateColorTheme(label: string, theme: ColorTheme): ContrastValidationResult {
  const failures: ContrastPairCheck[] = [];
  validatePrimitiveContrast(failures, theme);
  validateSemanticContrast(failures, theme.semantic);
  validateGradientContrast(
    failures,
    label,
    {
      ...theme.semantic,
      text: theme.semantic.gradientText,
      heading: theme.semantic.gradientHeading,
      subheading: theme.semantic.gradientSubheading,
      link: theme.semantic.gradientLink,
    },
    theme.appearance,
  );
  return { label, failures };
}

export function validateSiteTone(
  label: string,
  semantic: SemanticColors,
): ContrastValidationResult {
  const failures: ContrastPairCheck[] = [];
  validateSiteToneContrast(failures, semantic);
  return { label, failures };
}

export const SITE_TONE_IDS: ColorSetId[] = [
  'default',
  'surface',
  'card',
  'brand',
  'brandStrong',
  'muted',
];

export function assertNoFailures(...results: ContrastValidationResult[]): void {
  const all = results.flatMap((result) =>
    result.failures.map((failure) => ({ ...failure, theme: result.label })),
  );
  if (all.length > 0) {
    const lines = all.map(
      (failure) =>
        `${failure.theme} ${failure.pair}: ${failure.ratio.toFixed(2)}:1 (need ≥${failure.minimum})`,
    );
    throw new Error(`Contrast validation failed:\n${lines.join('\n')}`);
  }
}
