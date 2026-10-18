import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { MediaRelationshipInput } from './MediaRelationshipInput';

class MediaRelationshipFieldError extends Error {
  name = 'FieldDataError';
}

export function mediaRelationshipField(
  label = 'Image',
  description = 'Choose from the Media Library.',
): BasicFormField<string | null, string | null, string | null> {
  return {
    kind: 'form',
    label,
    description,
    Input(props) {
      return (
        <MediaRelationshipInput
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
        throw new MediaRelationshipFieldError('Must be a string');
      }
      return value;
    },
    validate(value) {
      return value;
    },
    serialize(value) {
      return { value: value === null ? undefined : value };
    },
    reader: {
      parse(value: FormFieldStoredValue) {
        if (typeof value !== 'string' && value !== undefined) {
          throw new MediaRelationshipFieldError('Must be a string');
        }
        return value ?? null;
      },
    },
  };
}
