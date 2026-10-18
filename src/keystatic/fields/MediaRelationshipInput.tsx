import { Combobox, Item } from '@keystar/ui/combobox';
import type { FormFieldInputProps } from '@keystatic/core';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Key,
} from 'react';
import { getMediaPreviewPath } from '../../lib/mediaPreview';
import {
  getMediaCatalog,
  loadMediaCatalog,
  sortMediaOptions,
  type MediaOption,
} from '../mediaCatalog';
import { AdminMediaThumb } from './AdminMediaThumb';

type Props = FormFieldInputProps<string | null> & {
  label: string;
  description?: string;
};

export function MediaRelationshipInput({
  label,
  description,
  value,
  onChange,
  autoFocus,
  forceValidation,
  validation,
}: Props) {
  const [blurred, onBlur] = useReducer(() => true, false);
  const [options, setOptions] = useState<MediaOption[]>(() => getMediaCatalog());

  const refreshCatalog = useCallback(() => {
    void loadMediaCatalog().then(setOptions);
  }, []);

  useEffect(() => {
    refreshCatalog();

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshCatalog();
      }
    }

    window.addEventListener('focus', refreshCatalog);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshCatalog);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCatalog]);

  const bySlug = useMemo(
    () => new Map(options.map((option) => [option.slug, option])),
    [options],
  );

  const selected = value ? bySlug.get(value) : undefined;

  const comboboxItems = useMemo(() => {
    if (value && !bySlug.has(value)) {
      const category = value.startsWith('icon-') ? 'icon' : 'photo';
      return sortMediaOptions([
        ...options,
        {
          slug: value,
          src: '',
          label: value,
          category,
          previewSrc: getMediaPreviewPath(value),
        },
      ]);
    }
    return options;
  }, [options, value, bySlug]);

  const requiredMessage =
    (forceValidation || blurred) &&
    validation?.isRequired &&
    value === null
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
    <div className="ks-media-relationship">
      <div className="ks-media-relationship__row">
        {selected ? (
          <AdminMediaThumb
            slug={selected.slug}
            src={selected.src}
            category={selected.category}
            className="ks-media-relationship-thumb ks-media-relationship-thumb--selected"
            previewable
            previewLabel={selected.label}
          />
        ) : null}
        <Combobox
          label={label}
          description={description}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onOpenChange={(isOpen) => {
            if (isOpen) refreshCatalog();
          }}
          autoFocus={autoFocus}
          items={comboboxItems}
          isRequired={validation?.isRequired}
          errorMessage={errorMessage}
          width="auto"
        >
          {(item: MediaOption) => (
            <Item key={item.slug} textValue={`${item.label} ${item.slug}`}>
              <span className="ks-media-relationship-option">
                <AdminMediaThumb
                  slug={item.slug}
                  src={item.src}
                  category={item.category}
                />
                <span className="ks-media-relationship-option__label">
                  {item.label}
                </span>
              </span>
            </Item>
          )}
        </Combobox>
      </div>
    </div>
  );
}
