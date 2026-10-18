import { parse } from 'yaml';
import { getMediaPreviewPath } from '../lib/mediaPreview';

export type MediaOption = {
  slug: string;
  src: string;
  label: string;
  category: 'photo' | 'logo' | 'og';
  previewSrc: string;
};

export function sortMediaOptions(options: MediaOption[]): MediaOption[] {
  return [...options].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
  );
}

type TreeEntry = {
  path: string;
  type: string;
  sha?: string;
};

const yamlFiles = import.meta.glob('../content/media/*/index.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const MEDIA_YAML_RE = /^src\/content\/media\/([^/]+)\/index\.yaml$/;

function slugFromPath(path: string) {
  return path.match(/\/media\/([^/]+)\/index\.yaml$/)?.[1] ?? '';
}

export function mediaOptionFromYaml(slug: string, raw: string): MediaOption {
  let data: Record<string, unknown> = {};
  try {
    data = parse(raw) as Record<string, unknown>;
  } catch {
    const previewSrc = getMediaPreviewPath(slug);
    return {
      slug,
      src: previewSrc,
      label: slug,
      category: slug.startsWith('logo-') ? 'logo' : 'photo',
      previewSrc,
    };
  }

  const title =
    typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : slug;
  const categoryRaw = typeof data.category === 'string' ? data.category : 'photo';
  const category =
    categoryRaw === 'logo' || categoryRaw === 'og'
      ? categoryRaw
      : categoryRaw === 'icon'
        ? 'logo'
        : 'photo';
  const src = slug ? getMediaPreviewPath(slug) : '';

  return {
    slug,
    src,
    label: title,
    category,
    previewSrc: src,
  };
}

function isMediaLibrarySlug(slug: string) {
  return !slug.startsWith('icon-');
}

function buildCatalogFromGlob(): MediaOption[] {
  const options = Object.entries(yamlFiles)
    .map(([path, raw]) => {
      const slug = slugFromPath(path);
      if (!slug || !isMediaLibrarySlug(slug)) return null;
      return mediaOptionFromYaml(slug, raw);
    })
    .filter((item): item is MediaOption => item !== null);

  return sortMediaOptions(options);
}

async function fetchYaml(path: string, sha: string) {
  const response = await fetch(`/api/keystatic/blob/${sha}/${path}`, {
    headers: { 'no-cors': '1' },
  });
  if (!response.ok) return '';
  return response.text();
}

async function buildCatalogFromMediaApi(): Promise<MediaOption[]> {
  const response = await fetch('/api/media-catalog');
  if (!response.ok) {
    throw new Error(`Media catalog request failed (${response.status})`);
  }
  return (await response.json()) as MediaOption[];
}

async function buildCatalogFromKeystaticApi(): Promise<MediaOption[]> {
  const response = await fetch('/api/keystatic/tree', {
    headers: { 'no-cors': '1' },
  });
  if (!response.ok) {
    throw new Error(`Keystatic tree request failed (${response.status})`);
  }

  const tree = (await response.json()) as TreeEntry[];
  const yamlEntries = tree.filter(
    (entry) =>
      entry.type === 'blob' &&
      MEDIA_YAML_RE.test(entry.path) &&
      typeof entry.sha === 'string',
  );

  const options = await Promise.all(
    yamlEntries.map(async (entry) => {
      const slug = entry.path.match(MEDIA_YAML_RE)?.[1] ?? '';
      if (!isMediaLibrarySlug(slug)) return null;
      const raw = await fetchYaml(entry.path, entry.sha!);
      return mediaOptionFromYaml(slug, raw);
    }),
  );

  return sortMediaOptions(options);
}

/** Sync snapshot from the bundled glob - may miss brand-new uploads. */
export function getMediaCatalog(): MediaOption[] {
  return buildCatalogFromGlob();
}

/** Fresh catalog - includes uploads created in this session. */
export async function loadMediaCatalog(): Promise<MediaOption[]> {
  try {
    return await buildCatalogFromMediaApi();
  } catch {
    try {
      return await buildCatalogFromKeystaticApi();
    } catch {
      return buildCatalogFromGlob();
    }
  }
}
