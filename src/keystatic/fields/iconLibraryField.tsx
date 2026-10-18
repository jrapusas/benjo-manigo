import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core';
import { IconLibraryPanel } from './IconLibraryPanel';

/** Non-editable field that renders the full icon catalog in the CMS. */
export function iconLibraryField(): BasicFormField<null, null, null> {
  return {
    kind: 'form',
    label: 'Available icons',
    Input() {
      return <IconLibraryPanel />;
    },
    defaultValue() {
      return null;
    },
    parse() {
      return null;
    },
    validate(value) {
      return value;
    },
    serialize() {
      return { value: undefined };
    },
    reader: {
      parse(value: FormFieldStoredValue) {
        return value === undefined || value === null ? null : null;
      },
    },
  };
}
