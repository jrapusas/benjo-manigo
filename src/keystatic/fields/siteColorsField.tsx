import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { meetsContrast } from '../../lib/color/contrast';
import {
  BRAND_COLOR_NAMES,
  presetSlugToBaseColor,
  resolveBrandColorName,
} from '../../lib/color/baseColors';
import { resolveColorSchemeId } from '../../lib/color/schemes';
import { DEFAULT_CUSTOM_PRIMITIVES } from '../../lib/color/custom';
import type { BrandColorName, ColorPrimitives } from '../../lib/color/types';
import { parseCustomPrimitives } from '../../lib/color/variations';
import {
  SiteColorsInput,
  type SiteColorsFormValue,
} from './SiteColorsInput';
import { isValidHexColor, normalizeHexColor } from './colorUtils';

class SiteColorsFieldError extends Error {
  name = 'FieldDataError';
}

function defaultColorsValue(): SiteColorsFormValue {
  return {
    scheme: null,
    color: 'blue',
    custom: { ...DEFAULT_CUSTOM_PRIMITIVES },
  };
}

function parseCustom(record: Record<string, unknown>): ColorPrimitives {
  return parseCustomPrimitives(record.custom);
}

function parseSiteColors(value: FormFieldStoredValue): SiteColorsFormValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaultColorsValue();
  }

  const record = value as Record<string, unknown>;
  const custom = parseCustom(record);
  const scheme = resolveColorSchemeId(
    typeof record.scheme === 'string' ? record.scheme : null,
  );

  if (scheme) {
    return { scheme, color: 'blue', custom };
  }

  if (typeof record.color === 'string' && record.color.trim()) {
    return {
      scheme: null,
      color: resolveBrandColorName(record.color),
      custom,
    };
  }

  if (typeof record.preset === 'string' && record.preset.trim()) {
    return {
      scheme: null,
      color: resolveBrandColorName(presetSlugToBaseColor(record.preset)),
      custom,
    };
  }

  return { ...defaultColorsValue(), custom };
}

function validateCustomPrimitives(custom: ColorPrimitives): void {
  for (const key of ['background', 'text', 'buttonBg', 'buttonText'] as const) {
    if (!isValidHexColor(custom[key])) {
      throw new SiteColorsFieldError(`Custom ${key} must be a valid hex color`);
    }
  }
  if (!meetsContrast(custom.text, custom.background)) {
    throw new SiteColorsFieldError(
      'Custom text must contrast the background (WCAG AA)',
    );
  }
  if (!meetsContrast(custom.buttonText, custom.buttonBg, 3)) {
    throw new SiteColorsFieldError(
      'Custom button text must contrast the button background',
    );
  }
}

function validateSiteColors(value: SiteColorsFormValue): SiteColorsFormValue {
  if (value.scheme) {
    return {
      scheme: value.scheme,
      color: 'blue',
      custom: value.custom,
    };
  }

  if (!(BRAND_COLOR_NAMES as readonly string[]).includes(value.color)) {
    throw new SiteColorsFieldError(`Unknown brand color: ${value.color}`);
  }

  if (value.color === 'custom') {
    validateCustomPrimitives(value.custom);
  }

  return {
    scheme: null,
    color: resolveBrandColorName(value.color),
    custom: value.custom,
  };
}

export function siteColorsField(): BasicFormField<
  SiteColorsFormValue,
  SiteColorsFormValue,
  SiteColorsFormValue
> {
  return {
    kind: 'form',
    label: 'Site colors',
    description:
      'Site-wide brand color or custom primitives. Appearances and semantic colors compute automatically.',
    Input(props) {
      return <SiteColorsInput {...props} />;
    },
    defaultValue() {
      return defaultColorsValue();
    },
    parse: parseSiteColors,
    serialize(value) {
      const payload: Record<string, unknown> = {};

      if (value.scheme) {
        payload.scheme = value.scheme;
        return { value: payload };
      }

      payload.color = value.color;

      if (value.color === 'custom') {
        payload.custom = {
          background: normalizeHexColor(value.custom.background),
          text: normalizeHexColor(value.custom.text),
          buttonBg: normalizeHexColor(value.custom.buttonBg),
          buttonText: normalizeHexColor(value.custom.buttonText),
        };
      }

      return { value: payload };
    },
    validate: validateSiteColors,
    reader: {
      parse: parseSiteColors,
    },
  };
}

export type { SiteColorsFormValue, BrandColorName, ColorPrimitives };
