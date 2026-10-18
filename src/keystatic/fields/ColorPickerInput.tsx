import { TextField } from '@keystar/ui/text-field';
import type { FormFieldInputProps } from '@keystatic/core';
import { useState } from 'react';
import {
  isValidHexColor,
  normalizeHexColor,
  toColorInputValue,
} from './colorUtils';

type Props = FormFieldInputProps<string> & {
  label: string;
  description?: string;
};

export function ColorPickerInput({
  value,
  onChange,
  label,
  description,
  forceValidation,
  autoFocus,
}: Props) {
  const [blurred, setBlurred] = useState(false);
  const normalized = normalizeHexColor(value || '');
  const showError = forceValidation || blurred;
  const errorMessage =
    showError && normalized && !isValidHexColor(normalized)
      ? 'Enter a valid hex color (e.g. #1e40af)'
      : undefined;

  const swatch = (
    <span
      className="ks-color-swatch"
      style={{
        backgroundColor: isValidHexColor(normalized) ? normalized : 'transparent',
      }}
      aria-hidden="true"
    />
  );

  const picker = (
    <input
      type="color"
      className="ks-color-picker"
      value={toColorInputValue(normalized)}
      onChange={(event) => onChange(event.target.value)}
      aria-label={`${label} picker`}
      title={`Pick ${label.toLowerCase()}`}
    />
  );

  return (
    <TextField
      label={label}
      description={description}
      autoFocus={autoFocus}
      value={normalized}
      onChange={(next) => onChange(normalizeHexColor(next))}
      onBlur={() => setBlurred(true)}
      placeholder="#000000"
      errorMessage={errorMessage}
      startElement={picker}
      endElement={swatch}
    />
  );
}
