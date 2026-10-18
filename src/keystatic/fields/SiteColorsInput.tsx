import type { FormFieldInputProps } from '@keystatic/core';
import { BASE_COLORS, BRAND_COLOR_NAMES } from '../../lib/color/baseColors';
import { DEFAULT_CUSTOM_PRIMITIVES } from '../../lib/color/custom';
import { COLOR_SCHEME_OPTIONS, type ColorSchemeId } from '../../lib/color/schemes';
import type { BrandColorName, ColorPrimitives } from '../../lib/color/types';
import { PalettePreview } from './PalettePreview';
import { CustomPrimitivesInput } from './CustomPrimitivesInput';

export type SiteColorsFormValue = {
  scheme: ColorSchemeId | null;
  color: BrandColorName;
  custom: ColorPrimitives;
};

type Props = FormFieldInputProps<SiteColorsFormValue>;

const colorOptions = BRAND_COLOR_NAMES.map((value) => ({
  value,
  label: BASE_COLORS[value].label,
}));

export function SiteColorsInput({ value, onChange }: Props) {
  const activeScheme = value.scheme;
  const isCustom = !activeScheme && value.color === 'custom';
  const previewColor = activeScheme ?? value.color;

  function setScheme(scheme: ColorSchemeId | '') {
    if (!scheme) {
      onChange({
        ...value,
        scheme: null,
        color: value.color === 'custom' ? value.color : 'blue',
      });
      return;
    }

    onChange({
      ...value,
      scheme,
      color: 'blue',
      custom: value.custom ?? { ...DEFAULT_CUSTOM_PRIMITIVES },
    });
  }

  function setColor(color: BrandColorName) {
    onChange({
      ...value,
      scheme: null,
      color,
      custom: value.custom ?? { ...DEFAULT_CUSTOM_PRIMITIVES },
    });
  }

  return (
    <div className="ks-site-colors">
      <div className="ks-site-colors__intent">
        <label className="ks-site-colors__intent-label" htmlFor="ks-site-scheme">
          Color scheme
        </label>
        <p className="ks-site-colors__intent-description">
          Pick a named scheme with curated section appearances, or choose a hue
          preset / Custom for formula-driven colors.
        </p>
        <select
          id="ks-site-scheme"
          className="ks-site-colors__intent-select"
          value={activeScheme ?? ''}
          onChange={(event) => setScheme(event.target.value as ColorSchemeId | '')}
        >
          <option value="">Hue preset or custom</option>
          {COLOR_SCHEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {!activeScheme ? (
        <div className="ks-site-colors__intent">
          <label className="ks-site-colors__intent-label" htmlFor="ks-site-color">
            Brand color
          </label>
          <select
            id="ks-site-color"
            className="ks-site-colors__intent-select"
            value={value.color}
            onChange={(event) => setColor(event.target.value as BrandColorName)}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="ks-site-colors__primitives">
          <h3 className="ks-site-colors__primitives-title">Named scheme</h3>
          <p className="ks-site-colors__primitives-description">
            {COLOR_SCHEME_OPTIONS.find((option) => option.value === activeScheme)?.description}
          </p>
        </div>
      )}

      {!activeScheme && !isCustom ? (
        <div className="ks-site-colors__primitives">
          <h3 className="ks-site-colors__primitives-title">Foundational inputs</h3>
          <p className="ks-site-colors__primitives-description">
            Generated per appearance from the {BASE_COLORS[value.color].label}{' '}
            hue - background, text, button-bg, button-text.
          </p>
        </div>
      ) : null}

      <PalettePreview
        color={previewColor}
        custom={isCustom ? value.custom : undefined}
      />

      {isCustom ? (
        <CustomPrimitivesInput
          value={value.custom}
          onChange={(custom) =>
            onChange({ ...value, scheme: null, color: 'custom', custom })
          }
        />
      ) : null}
    </div>
  );
}
