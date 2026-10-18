import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { ColorPickerInput } from './ColorPickerInput';
import { isValidHexColor, normalizeHexColor } from './colorUtils';

type ColorHexFieldOptions = {
  label: string;
  defaultValue?: string;
  description?: string;
};

class ColorFieldError extends Error {
  name = 'FieldDataError';
}

function parseColorValue(
  value: FormFieldStoredValue,
  defaultValue: string,
  label: string,
): string {
  if (value === undefined || value === '') return defaultValue;
  if (typeof value !== 'string') {
    throw new ColorFieldError(`${label} must be a string`);
  }
  const normalized = normalizeHexColor(value);
  if (!isValidHexColor(normalized)) {
    throw new ColorFieldError(`${label} must be a valid hex color`);
  }
  return normalized;
}

export function colorHexField({
  label,
  defaultValue = '#000000',
  description,
}: ColorHexFieldOptions): BasicFormField<string, string, string> {
  const fallback = normalizeHexColor(defaultValue);

  return {
    kind: 'form',
    label,
    Input(props) {
      return (
        <ColorPickerInput
          {...props}
          label={label}
          description={description}
        />
      );
    },
    defaultValue() {
      return fallback;
    },
    parse(value) {
      return parseColorValue(value, fallback, label);
    },
    serialize(value) {
      return { value: value || undefined };
    },
    validate(value) {
      const normalized = normalizeHexColor(value);
      if (!isValidHexColor(normalized)) {
        throw new ColorFieldError(`${label} must be a valid hex color`);
      }
      return normalized;
    },
    reader: {
      parse(value) {
        return parseColorValue(value, fallback, label);
      },
    },
  };
}
