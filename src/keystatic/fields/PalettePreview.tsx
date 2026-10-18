import type { CSSProperties } from 'react';
import { APPEARANCE_NAMES, type BaseColorName, type ColorPrimitives } from '../../lib/color/types';
import {
  generateColorTheme,
  generateCustomColorAttributeCss,
  generateSchemeColorAttributeCss,
  semanticStyleProps,
} from '../../lib/color/generate';
import { appearanceExtraCssVars } from '../../lib/color/appearanceExtras';
import { isColorSchemeId } from '../../lib/color/schemes';
import { parseAppearanceIntent } from '../../lib/sectionStyle';
import { APPEARANCE_LABELS } from '../../lib/sitePalette';

type Props = {
  color: BaseColorName | string;
  custom?: ColorPrimitives;
};

export function PalettePreview({ color, custom }: Props) {
  const attributeCss = isColorSchemeId(color)
    ? generateSchemeColorAttributeCss(color)
    : color === 'custom' && custom
      ? generateCustomColorAttributeCss(custom)
      : '';

  return (
    <div className="ks-palette-preview">
      {attributeCss ? (
        <style dangerouslySetInnerHTML={{ __html: attributeCss }} />
      ) : null}
      <div className="ks-palette-preview__header">
        <h3 className="ks-palette-preview__title">Appearance preview</h3>
        <p className="ks-palette-preview__description">
          Twelve section appearances - six solid and six gradient - derived from
          your brand color. Hover links and buttons to preview accessible hover states.
        </p>
      </div>
      <div className="ks-palette-preview__grid">
        {APPEARANCE_NAMES.map((appearance) => {
          const { tone, backgroundStyle } = parseAppearanceIntent(appearance);
          const theme = generateColorTheme({
            color,
            appearance: tone,
            customPrimitives:
              !isColorSchemeId(color) && color === 'custom' ? custom : undefined,
          });
          const s = theme.semantic;
          const meta = APPEARANCE_LABELS[appearance];
          const style = semanticStyleProps(s, appearanceExtraCssVars(s));

          return (
            <article
              key={appearance}
              data-color={color}
              data-appearance={tone}
              {...(backgroundStyle === 'gradient'
                ? { 'data-background-style': 'gradient' }
                : {})}
              className="ks-palette-preview__item ks-appearance-section appearance-section"
              style={style as CSSProperties}
            >
              <div className="ks-palette-preview__item-body">
                <div>
                  <p className="ks-palette-preview__eyebrow">{appearance}</p>
                  <h4 className="ks-palette-preview__item-title">{meta.label}</h4>
                  <p className="ks-palette-preview__item-description">
                    {meta.description}
                  </p>
                </div>

                <p className="ks-palette-preview__copy">
                  Body copy with an{' '}
                  <a href="#palette-preview" className="ks-preview-link">
                    inline link
                  </a>{' '}
                  and a{' '}
                  <a
                    href="#palette-preview"
                    className="ks-preview-link ks-preview-link--bold"
                  >
                    bold link
                  </a>
                  .
                </p>

                <div className="ks-palette-preview__buttons">
                  <button type="button" className="ks-preview-btn ks-preview-btn--primary">
                    Primary
                  </button>
                  <button
                    type="button"
                    className="ks-preview-btn ks-preview-btn--secondary"
                  >
                    Secondary
                  </button>
                </div>

                <div className="ks-palette-preview__swatches">
                  <span className="ks-palette-preview__swatch-row">
                    <span
                      className="ks-palette-preview__swatch ks-palette-preview__swatch--bg-hover"
                      aria-hidden="true"
                    />
                    Bg hover
                  </span>
                  <span className="ks-palette-preview__swatch-row">
                    <span
                      className="ks-palette-preview__swatch ks-palette-preview__swatch--fg-hover"
                      aria-hidden="true"
                    />
                    Text hover
                  </span>
                  <span className="ks-palette-preview__swatch-row">
                    <span
                      className="ks-palette-preview__swatch ks-palette-preview__swatch--link"
                      aria-hidden="true"
                    />
                    Link
                  </span>
                  <span className="ks-palette-preview__swatch-row">
                    <span
                      className="ks-palette-preview__swatch ks-palette-preview__swatch--link-hover"
                      aria-hidden="true"
                    />
                    Link hover
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
