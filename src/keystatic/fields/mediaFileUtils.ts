export const MEDIA_FILE_DIRECTORY = 'src/content/media';
export const MEDIA_FILE_BASENAME = 'file';
export const LEGACY_MEDIA_PUBLIC_PATH = '/images/media/';

export function canonicalMediaFilename(ext = 'jpg'): string {
  return `${MEDIA_FILE_BASENAME}.${ext.replace(/^\./, '')}`;
}

function extensionFromPath(filePath: string): string {
  return filePath.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg';
}

/** Keystatic stores collection assets under `{directory}/{slug}/`. */
export function getMediaAssetSrcPrefix(slug?: string) {
  return `${LEGACY_MEDIA_PUBLIC_PATH.replace(/\/*$/, '')}/${slug ? `${slug}/` : ''}`;
}

/** @deprecated Use canonicalMediaFilename. Kept for legacy public-path tests. */
export function canonicalMediaPublicPath(slug: string, ext = 'jpg'): string {
  return `${getMediaAssetSrcPrefix(slug)}${canonicalMediaFilename(ext)}`;
}

export function relativeMediaPathFromValue(value: string, slug?: string) {
  const trimmed = value.replace(/^\.\//, '');
  if (!trimmed.includes('/') && trimmed.includes('.')) return trimmed;

  const slugPrefix = getMediaAssetSrcPrefix(slug);
  if (slug && trimmed.startsWith(slugPrefix)) {
    return trimmed.slice(slugPrefix.length);
  }

  if (trimmed.startsWith(LEGACY_MEDIA_PUBLIC_PATH)) {
    const rest = trimmed.slice(LEGACY_MEDIA_PUBLIC_PATH.length);
    const parts = rest.split('/');
    return parts[parts.length - 1] ?? rest;
  }

  const contentMatch = trimmed.match(/content\/media\/[^/]+\/(.+)$/);
  if (contentMatch) return contentMatch[1];

  return trimmed.split('/').pop() ?? trimmed;
}

export function isExternalMediaPath(mediaPath: string) {
  return /^(https?:)?\/\//.test(mediaPath) || mediaPath.startsWith('/api/');
}

export type MediaFileUpload = {
  data: Uint8Array;
  filename: string;
  extension: string;
};

export type MediaFileExternal = {
  external: true;
  path: string;
  /** YAML `file` value when `path` is a preview API URL. */
  storedFilename?: string;
};

export type MediaFileValue = MediaFileUpload | MediaFileExternal | null;

export function isExternalMediaValue(
  value: MediaFileValue,
): value is MediaFileExternal {
  return value !== null && 'external' in value;
}

const MEDIA_PREVIEW_PREFIX = '/api/media-preview/';

export function isMediaPreviewApiPath(path: string): boolean {
  return path.startsWith(MEDIA_PREVIEW_PREFIX);
}

export function getMediaPreviewSrc(value: MediaFileValue): string | null {
  if (!value) return null;
  if (isExternalMediaValue(value)) {
    return isExternalMediaPath(value.path) || isMediaPreviewApiPath(value.path)
      ? value.path
      : null;
  }
  return null;
}

/** Normalize stored values to `file.{ext}`. */
export function normalizeUploadedMediaPath(file: string, slug: string): string {
  if (isExternalMediaPath(file)) return file;
  const ext = extensionFromPath(file || 'file.jpg');
  const canonical = canonicalMediaFilename(ext);
  const relative = relativeMediaPathFromValue(file, slug);
  if (relative === canonical) return canonical;

  const slugPrefix = getMediaAssetSrcPrefix(slug);
  const mediaRoot = LEGACY_MEDIA_PUBLIC_PATH.replace(/\/*$/, '');
  const src = file.startsWith('/') ? file : `/${file.replace(/^public\//, '')}`;

  if (src === `${mediaRoot}/${slug}.${ext}`) return canonical;
  if (src === `${slugPrefix}${slug}.${ext}`) return canonical;
  if (src === `${slugPrefix}${canonical}`) return canonical;
  if (relative === `${slug}.${ext}`) return canonical;

  return relative.includes('.') ? relative.split('/').pop() ?? canonical : canonical;
}

export function mediaSlugFromRef(ref: string): string | null {
  if (!ref) return null;
  if (isExternalMediaPath(ref) || ref.startsWith('/_astro/')) return null;

  const legacy = ref.match(/^\/images\/media\/([^/]+)\//);
  if (legacy) return legacy[1];

  const content = ref.match(/content\/media\/([^/]+)\//);
  if (content) return content[1];

  if (ref.includes('/') || ref.includes('.')) return null;
  return ref;
}
