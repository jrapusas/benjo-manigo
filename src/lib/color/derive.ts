import {
  CONTRAST,
  contrastRatio,
  ensureContrast,
  meetsContrast,
  relativeLuminance,
} from './contrast';
import { mixSrgb } from './mix';
import { hexToOklch, oklchToHex, withOklch } from './oklch';
import type { ColorPrimitives, SemanticColors } from './types';

const SECTION_SUBTLE_MIX = 0.85;
const MUTED_SUBTLE_MIX = 0.82;

function hoverBackground(buttonBg: string): string {
  const base = hexToOklch(buttonBg);
  const lighter = base.l > 0.55;
  return oklchToHex(
    withOklch(base, {
      l: lighter
        ? Math.max(0.08, base.l - 0.06)
        : Math.min(0.92, base.l + 0.08),
    }),
  );
}

function hoverForeground(buttonText: string, hoverBg: string): string {
  return ensureContrast(
    buttonText,
    hoverBg,
    CONTRAST.normalText,
    hexToOklch,
    oklchToHex,
  );
}

/** Primary buttons and block-step badges use body text contrast (4.5:1). */
export function finalizePrimitiveButtonPair(
  buttonBg: string,
  buttonText: string,
): Pick<ColorPrimitives, 'buttonBg' | 'buttonText'> {
  if (meetsContrast(buttonText, buttonBg, CONTRAST.normalText)) {
    return { buttonBg, buttonText };
  }

  const textIsLight = relativeLuminance(buttonText) > relativeLuminance(buttonBg);
  let bg = buttonBg;
  let fg = buttonText;
  const base = hexToOklch(bg);

  if (textIsLight) {
    for (let step = 1; step <= 24; step += 1) {
      bg = oklchToHex(
        withOklch(base, { l: Math.max(0.08, base.l - step * 0.025) }),
      );
      if (meetsContrast(fg, bg, CONTRAST.normalText)) {
        return { buttonBg: bg, buttonText: fg };
      }
    }
  } else {
    for (let step = 1; step <= 24; step += 1) {
      bg = oklchToHex(
        withOklch(base, { l: Math.min(0.96, base.l + step * 0.025) }),
      );
      if (meetsContrast(fg, bg, CONTRAST.normalText)) {
        return { buttonBg: bg, buttonText: fg };
      }
    }
  }

  fg = ensureContrast(fg, bg, CONTRAST.normalText, hexToOklch, oklchToHex);
  return { buttonBg: bg, buttonText: fg };
}

function subtleMixesPass(subheading: string, background: string): boolean {
  return (
    meetsContrast(
      mixSrgb(subheading, background, SECTION_SUBTLE_MIX),
      background,
      CONTRAST.normalText,
    ) &&
    meetsContrast(
      mixSrgb(subheading, background, MUTED_SUBTLE_MIX),
      background,
      CONTRAST.normalText,
    )
  );
}

function deriveSubtleTextColors(
  subheading: string,
  background: string,
): Pick<SemanticColors, 'subheading' | 'subheadingSectionSubtle' | 'subheadingMutedSubtle'> {
  let resolved = subheading;
  const onLightBg = relativeLuminance(background) > 0.55;
  const base = hexToOklch(resolved);

  if (!subtleMixesPass(resolved, background)) {
    for (let step = 1; step <= 24; step += 1) {
      const candidate = oklchToHex(
        withOklch(base, {
          l: onLightBg
            ? Math.max(0.08, base.l - step * 0.012)
            : Math.min(0.98, base.l + step * 0.01),
          c: Math.max(0, base.c * (1 - step * 0.01)),
        }),
      );
      if (
        meetsContrast(candidate, background, CONTRAST.normalText) &&
        subtleMixesPass(candidate, background)
      ) {
        resolved = candidate;
        break;
      }
    }
  }

  const sectionSubtle = ensureContrast(
    mixSrgb(resolved, background, SECTION_SUBTLE_MIX),
    background,
    CONTRAST.normalText,
    hexToOklch,
    oklchToHex,
  );
  const mutedSubtle = ensureContrast(
    mixSrgb(resolved, background, MUTED_SUBTLE_MIX),
    background,
    CONTRAST.normalText,
    hexToOklch,
    oklchToHex,
  );

  return {
    subheading: resolved,
    subheadingSectionSubtle: sectionSubtle,
    subheadingMutedSubtle: mutedSubtle,
  };
}

type TextHierarchy = Pick<
  SemanticColors,
  'heading' | 'subheading' | 'subheadingSectionSubtle' | 'subheadingMutedSubtle' | 'text'
>;

/** Typography hierarchy from text primitive - heading strongest, subheading secondary. */
function deriveTextHierarchy(text: string, background: string): TextHierarchy {
  const textIsLight = relativeLuminance(text) > 0.55;
  const onLightBg = relativeLuminance(background) > 0.55 && !textIsLight;
  const base = hexToOklch(text);

  if (textIsLight) {
    const body = ensureContrast(text, background, CONTRAST.normalText, hexToOklch, oklchToHex);
    const bodyOklch = hexToOklch(body);
    let heading = oklchToHex(
      withOklch(bodyOklch, {
        l: Math.min(0.99, bodyOklch.l + 0.025),
        c: Math.max(0, bodyOklch.c * 0.95),
      }),
    );
    if (!meetsContrast(heading, background, CONTRAST.normalText)) {
      heading = body;
    }

    let subheading = body;
    for (let step = 1; step <= 16; step += 1) {
      const candidate = oklchToHex(
        withOklch(bodyOklch, {
          l: Math.max(0.75, bodyOklch.l - step * 0.015),
          c: Math.max(0, bodyOklch.c * (1 - step * 0.02)),
        }),
      );
      if (meetsContrast(candidate, background, CONTRAST.normalText)) {
        subheading = candidate;
        break;
      }
    }

    const subtle = deriveSubtleTextColors(subheading, background);
    return {
      heading,
      text: body,
      ...subtle,
    };
  }

  if (!onLightBg) {
    const body = ensureContrast(text, background, CONTRAST.normalText, hexToOklch, oklchToHex);
    const bodyOklch = hexToOklch(body);
    const heading = ensureContrast(
      oklchToHex(
        withOklch(bodyOklch, {
          l: Math.max(0.05, bodyOklch.l - 0.04),
          c: Math.min(bodyOklch.c + 0.01, 0.1),
        }),
      ),
      background,
      CONTRAST.normalText,
      hexToOklch,
      oklchToHex,
    );
    const subheading = ensureContrast(
      oklchToHex(
        withOklch(bodyOklch, {
          l: Math.min(bodyOklch.l + 0.08, 0.55),
          c: Math.max(0, bodyOklch.c * 0.85),
        }),
      ),
      background,
      CONTRAST.normalText,
      hexToOklch,
      oklchToHex,
    );
    const subtle = deriveSubtleTextColors(subheading, background);
    return {
      heading,
      text: body,
      ...subtle,
    };
  }

  const heading = oklchToHex(
    withOklch(base, {
      l: Math.max(0.08, base.l - 0.06),
      c: Math.min(base.c + 0.015, 0.12),
    }),
  );

  const subheading = oklchToHex(
    withOklch(base, {
      l: Math.min(0.55, base.l + 0.12),
      c: Math.max(0.01, base.c * 0.75),
    }),
  );
  const resolvedSubheading = ensureContrast(
    subheading,
    background,
    CONTRAST.normalText,
    hexToOklch,
    oklchToHex,
  );
  const subtle = deriveSubtleTextColors(resolvedSubheading, background);

  return {
    heading: ensureContrast(heading, background, CONTRAST.normalText, hexToOklch, oklchToHex),
    text: ensureContrast(text, background, CONTRAST.normalText, hexToOklch, oklchToHex),
    ...subtle,
  };
}

const LINK_CONTRAST_TARGET = 4.55;

function finalizeLinkColor(
  link: string,
  background: string,
  buttonBg: string,
  text: string,
): string {
  let resolved = ensureContrast(
    link,
    background,
    CONTRAST.normalText,
    hexToOklch,
    oklchToHex,
  );

  if (contrastRatio(resolved, background) < LINK_CONTRAST_TARGET) {
    resolved = ensureContrast(
      text,
      background,
      LINK_CONTRAST_TARGET,
      hexToOklch,
      oklchToHex,
    );
  }

  if (!meetsContrast(resolved, buttonBg, CONTRAST.ui)) {
    const textBase = hexToOklch(text);
    resolved = ensureContrast(
      oklchToHex(
        withOklch(textBase, {
          l: Math.max(0.08, textBase.l - 0.04),
          c: Math.min(textBase.c + 0.02, 0.14),
        }),
      ),
      background,
      LINK_CONTRAST_TARGET,
      hexToOklch,
      oklchToHex,
    );
  }

  return resolved;
}

function deriveLinkColors(
  buttonBg: string,
  background: string,
  text: string,
): Pick<SemanticColors, 'link' | 'linkHover'> {
  const onLightBg = relativeLuminance(background) > 0.55;
  const buttonIsLight = relativeLuminance(buttonBg) > 0.55;
  const accent = hexToOklch(buttonBg);

  if (!onLightBg && buttonIsLight) {
    const bg = hexToOklch(background);
    const textBase = hexToOklch(text);
    const candidates = [
      oklchToHex(withOklch({ l: 0.98, c: 0.012, h: bg.h })),
      oklchToHex(
        withOklch({
          l: Math.max(0.1, textBase.l - 0.04),
          c: Math.min(textBase.c + 0.02, 0.1),
          h: bg.h,
        }),
      ),
      text,
    ];
    let link =
      candidates.find((candidate) => meetsContrast(candidate, background)) ?? text;
    link = finalizeLinkColor(link, background, buttonBg, text);

    if (link.toLowerCase() === buttonBg.toLowerCase()) {
      link = finalizeLinkColor(text, background, buttonBg, text);
    }

    let linkHover = oklchToHex(
      withOklch(hexToOklch(link), {
        l: Math.min(0.99, hexToOklch(link).l + 0.04),
        c: hexToOklch(link).c,
      }),
    );
    if (!meetsContrast(linkHover, background, CONTRAST.linkHover)) {
      linkHover = ensureContrast(
        linkHover,
        background,
        CONTRAST.linkHover,
        hexToOklch,
        oklchToHex,
      );
    }
    return { link, linkHover };
  }

  let link = oklchToHex(
    withOklch(accent, {
      l: relativeLuminance(background) > 0.55
        ? Math.max(0.32, accent.l - 0.1)
        : Math.min(0.82, accent.l + 0.18),
      c: Math.min(accent.c + 0.02, 0.22),
    }),
  );

  link = finalizeLinkColor(link, background, buttonBg, text);

  let linkHover = oklchToHex(
    withOklch(hexToOklch(link), {
      l: hexToOklch(link).l + (relativeLuminance(background) > 0.55 ? -0.05 : 0.06),
      c: Math.min(hexToOklch(link).c + 0.015, 0.24),
    }),
  );

  if (!meetsContrast(linkHover, background, CONTRAST.linkHover)) {
    linkHover = ensureContrast(
      linkHover,
      background,
      CONTRAST.linkHover,
      hexToOklch,
      oklchToHex,
    );
  }

  return { link, linkHover };
}

/** Derive all 10 semantic roles from the four primitives. */
export function deriveSemanticColors(primitives: ColorPrimitives): SemanticColors {
  const buttonPair = finalizePrimitiveButtonPair(primitives.buttonBg, primitives.buttonText);
  const buttonBgHover = hoverBackground(buttonPair.buttonBg);
  const buttonTextHover = hoverForeground(buttonPair.buttonText, buttonBgHover);
  const textHierarchy = deriveTextHierarchy(primitives.text, primitives.background);
  const links = deriveLinkColors(
    buttonPair.buttonBg,
    primitives.background,
    primitives.text,
  );

  return {
    background: primitives.background,
    ...textHierarchy,
    buttonBg: buttonPair.buttonBg,
    buttonText: buttonPair.buttonText,
    buttonBgHover,
    buttonTextHover,
    ...links,
  };
}
