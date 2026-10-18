import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { normalizeIconId } from '../iconCatalog';
import { IconPickerInput } from './IconPickerInput';

class IconFieldError extends Error {
  name = 'FieldDataError';
}

export function iconField(
  label = 'Icon',
  description = 'Choose from the site icon library (Tabler icons).',
): BasicFormField<string | null, string | null, string | null> {
  return {
    kind: 'form',
    label,
    description,
    Input(props) {
      return (
        <IconPickerInput
          {...props}
          label={label}
          description={description}
        />
      );
    },
    defaultValue() {
      return null;
    },
    parse(value) {
      if (value === undefined) return null;
      if (typeof value !== 'string') {
        throw new IconFieldError('Must be a string');
      }
      const normalized = normalizeIconId(value);
      return normalized ?? value;
    },
    validate(value) {
      if (value === null) return value;
      const normalized = normalizeIconId(value);
      if (!normalized) {
        throw new IconFieldError(`Unknown icon: ${value}`);
      }
      return normalized;
    },
    serialize(value) {
      return { value: value === null ? undefined : value };
    },
    reader: {
      parse(value: FormFieldStoredValue) {
        if (typeof value !== 'string' && value !== undefined) {
          throw new IconFieldError('Must be a string');
        }
        if (!value) return null;
        return normalizeIconId(value) ?? value;
      },
    },
  };
}
