import { Combobox, Item } from '@keystar/ui/combobox';
import type { FormFieldInputProps } from '@keystatic/core';
import { useEffect, useMemo, useReducer, useState, type Key } from 'react';
import {
  ICON_CATALOG,
  ICON_CATALOG_COUNT,
  iconCatalogLabel,
  normalizeIconId,
} from '../iconCatalog';
import { getIconPreviewPath } from '../../lib/iconPreview';

type Props = FormFieldInputProps<string | null> & {
  label: string;
  description?: string;
};

function IconPreview({ iconId, className }: { iconId: string; className?: string }) {
  const src = getIconPreviewPath(iconId);
  return (
    <img
      className={className ?? 'ks-icon-picker-preview'}
      src={src}
      alt=""
      loading="lazy"
    />
  );
}

const pickerDescription = (base?: string) =>
  [
    base,
    `Search ${ICON_CATALOG_COUNT.toLocaleString()} Tabler icons (A–Z). Stored value is the icon id (e.g. target).`,
  ]
    .filter(Boolean)
    .join(' ');

export function IconPickerInput({
  label,
  description,
  value,
  onChange,
  autoFocus,
  forceValidation,
  validation,
}: Props) {
  const [blurred, onBlur] = useReducer(() => true, false);
  const normalized = value ? normalizeIconId(value) : null;

  const items = useMemo(() => ICON_CATALOG, []);

  const requiredMessage =
    (forceValidation || blurred) && validation?.isRequired && !normalized
      ? `${label} is required`
      : undefined;
  const [errorMessage, setErrorMessage] = useState(requiredMessage);

  useEffect(() => {
    setErrorMessage(requiredMessage);
  }, [requiredMessage]);

  function handleChange(key: Key | null) {
    if (typeof key === 'string' || key === null) {
      onChange(key);
    }
  }

  return (
    <div className="ks-icon-picker">
      <div className="ks-icon-picker__row">
        {normalized ? (
          <IconPreview
            iconId={normalized}
            className="ks-icon-picker-preview ks-icon-picker-preview--selected"
          />
        ) : null}
        <Combobox
          label={label}
          description={pickerDescription(description)}
          value={normalized}
          onChange={handleChange}
          onBlur={onBlur}
          autoFocus={autoFocus}
          items={items}
          isRequired={validation?.isRequired}
          errorMessage={errorMessage}
          width="auto"
        >
          {(item) => (
            <Item key={item.id} textValue={`${item.label} ${item.id}`}>
              <span className="ks-icon-picker-option">
                <IconPreview iconId={item.id} />
                <span className="ks-icon-picker-option__label">
                  {item.label}
                  <span className="ks-icon-picker-option__id">{item.id}</span>
                </span>
              </span>
            </Item>
          )}
        </Combobox>
      </div>
      {normalized && value && value !== normalized ? (
        <p className="ks-icon-picker__legacy-note">
          Legacy value <code>{value}</code> maps to {iconCatalogLabel(normalized)} (
          <code>{normalized}</code>).
        </p>
      ) : null}
    </div>
  );
}
