import { ActionButton } from '@keystar/ui/button';
import { Box } from '@keystar/ui/layout';
import type { FormFieldInputProps } from '@keystatic/core';
import { useEffect, useId, useRef, useState } from 'react';
import {
  getMediaPreviewSrc,
  isExternalMediaValue,
  type MediaFileValue,
} from './mediaFileUtils';
import { MediaPreviewLightbox } from './MediaPreviewLightbox';

type Props = FormFieldInputProps<MediaFileValue> & {
  label: string;
  description?: string;
};

function useUploadPreview(data: Uint8Array | undefined, extension: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      setUrl(null);
      return;
    }

    const mime =
      extension === 'svg'
        ? 'image/svg+xml'
        : extension === 'jpg' || extension === 'jpeg'
          ? 'image/jpeg'
          : extension === 'png'
            ? 'image/png'
            : extension === 'webp'
              ? 'image/webp'
              : extension === 'gif'
                ? 'image/gif'
                : 'application/octet-stream';
    const nextUrl = URL.createObjectURL(new Blob([data], { type: mime }));
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [data, extension]);

  return url;
}

export function MediaFileInput({
  value,
  onChange,
  label,
  description,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const uploadPreview = useUploadPreview(
    value && !isExternalMediaValue(value) ? value.data : undefined,
    value && !isExternalMediaValue(value) ? value.extension : '',
  );
  const previewSrc = getMediaPreviewSrc(value) ?? uploadPreview;

  async function onFileSelected(file: File | undefined) {
    if (!file) return;
    const match = file.name.match(/\.([^.]+)$/);
    const extension = match?.[1];
    if (!extension) return;

    onChange({
      data: new Uint8Array(await file.arrayBuffer()),
      filename: file.name,
      extension,
    });
  }

  return (
    <div className="ks-media-file-field" aria-labelledby={labelId}>
      <div className="ks-media-file-field__header">
        <span id={labelId} className="ks-media-file-field__label">
          {label}
        </span>
        {description ? (
          <p className="ks-media-file-field__description">{description}</p>
        ) : null}
      </div>

      <div className="ks-media-file-field__actions">
        <ActionButton onPress={() => inputRef.current?.click()}>
          {value ? 'Replace image' : 'Choose image'}
        </ActionButton>
        {value ? (
          <ActionButton prominence="low" onPress={() => onChange(null)}>
            Remove
          </ActionButton>
        ) : null}
      </div>

      {previewSrc ? (
        <Box className="ks-media-file-field__preview">
          <MediaPreviewLightbox
            src={previewSrc}
            label="View full size image"
            className="ks-media-preview-trigger ks-media-preview-trigger--block"
          >
            <img src={previewSrc} alt="" />
          </MediaPreviewLightbox>
        </Box>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="ks-media-file-field__input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          void onFileSelected(file);
        }}
      />
    </div>
  );
}
