import { fields } from '@keystatic/core';
import { APPEARANCE_NAMES, BASE_COLOR_NAMES } from '../lib/color/types';
import { BASE_COLORS } from '../lib/color/baseColors';
import { APPEARANCE_LABELS } from '../lib/sitePalette';

const colorOptions = BASE_COLOR_NAMES.map((value) => ({
  label: BASE_COLORS[value].label,
  value,
}));

const appearanceOptions = APPEARANCE_NAMES.map((value) => ({
  label: APPEARANCE_LABELS[value].label,
  value,
}));

export function colorIntentFields(defaults?: {
  color?: (typeof BASE_COLOR_NAMES)[number];
  appearance?: (typeof APPEARANCE_NAMES)[number];
}) {
  return {
    color: fields.select({
      label: 'Color',
      description:
        'Brand hue for this block. Auto uses the site default. Custom uses site custom primitives.',
      options: colorOptions,
      defaultValue: defaults?.color ?? 'auto',
    }),
    appearance: fields.select({
      label: 'Section color',
      description:
        'Background tone for this section - six solid levels plus six gradient variants.',
      options: appearanceOptions,
      defaultValue: defaults?.appearance ?? 'default',
    }),
  };
}

export type ColorIntent = {
  color?: string | null;
  appearance?: string | null;
};
