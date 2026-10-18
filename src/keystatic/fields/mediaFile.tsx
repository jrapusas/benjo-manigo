import type {
  AssetFormField,
  FormFieldStoredValue,
} from '@keystatic/core';
import { MediaFileInput } from './MediaFileInput';
import { getMediaPreviewPath } from '../../lib/mediaPreview';
import {
  canonicalMediaFilename,
  isExternalMediaPath,
  isExternalMediaValue,
  isMediaPreviewApiPath,
  MEDIA_FILE_DIRECTORY,
  relativeMediaPathFromValue,
  type MediaFileValue,
} from './mediaFileUtils';

class MediaFieldError extends Error {
  name = 'FieldDataError';
}

function extensionFromPath(path: string) {
  return path.match(/\.([^.]+)$/)?.[1] ?? '';
}

export function mediaFileField(): AssetFormField<
  MediaFileValue,
  MediaFileValue,
  string | null
> {
  const label = 'Image file';
  const description =
    'Upload a new file or keep the current image from the site.';

  return {
    kind: 'form',
    formKind: 'asset',
    label,
    directory: MEDIA_FILE_DIRECTORY,
    Input(props) {
      return (
        <MediaFileInput
          {...props}
          label={label}
          description={description}
        />
      );
    },
    defaultValue() {
      return null;
    },
    filename(value, args) {
      if (typeof value !== 'string') return undefined;
      if (isExternalMediaPath(value)) return undefined;
      return relativeMediaPathFromValue(value, args.slug);
    },
    parse(value, { asset, slug }) {
      if (value === undefined) return null;
      if (typeof value !== 'string') {
        throw new MediaFieldError('Must be a string');
      }
      if (isExternalMediaPath(value) || !asset) {
        if (slug && value && !isExternalMediaPath(value)) {
          return {
            external: true,
            path: getMediaPreviewPath(slug),
            storedFilename: relativeMediaPathFromValue(value, slug),
          };
        }
        return { external: true, path: value };
      }
      const relative = relativeMediaPathFromValue(value, slug);
      return {
        data: asset,
        filename: relative,
        extension: extensionFromPath(relative),
      };
    },
    validate(value) {
      return value;
    },
    serialize(value) {
      if (!value) {
        return { value: undefined, asset: undefined };
      }
      if (isExternalMediaValue(value)) {
        if (isMediaPreviewApiPath(value.path)) {
          return {
            value: value.storedFilename ?? canonicalMediaFilename('jpg'),
            asset: undefined,
          };
        }
        return { value: value.path, asset: undefined };
      }

      const filename = canonicalMediaFilename(value.extension);

      return {
        value: filename,
        asset: {
          filename,
          content: value.data,
        },
      };
    },
    reader: {
      parse(value: FormFieldStoredValue) {
        if (typeof value !== 'string' && value !== undefined) {
          throw new MediaFieldError('Must be a string');
        }
        return value ?? null;
      },
    },
  };
}
