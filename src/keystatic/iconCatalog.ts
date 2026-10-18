import tabler from '@iconify-json/tabler/icons.json';

/**
 * Full Tabler outline icon set — no SVG uploads; stored value = Tabler icon name (id).
 */
export type IconCatalogEntry = {
  id: string;
  label: string;
  tabler: string;
};

const TABLER_ICON_NAMES = Object.keys(tabler.icons);

function humanizeTablerName(name: string): string {
  return name
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function buildIconCatalog(): IconCatalogEntry[] {
  return TABLER_ICON_NAMES.map((name) => ({
    id: name,
    label: humanizeTablerName(name),
    tabler: name,
  })).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
  );
}

/** Complete Tabler library, sorted A–Z by label. */
export const ICON_CATALOG: IconCatalogEntry[] = buildIconCatalog();

const BY_ID = new Map(ICON_CATALOG.map((entry) => [entry.id, entry]));

const TABLER_NAME_SET = new Set(TABLER_ICON_NAMES);

/** Short site aliases + legacy media slugs → Tabler icon name. */
const LEGACY_ICON_ALIASES: Record<string, string> = {
  strategy: 'target',
  operations: 'stack-2',
  growth: 'trending-up',
  change: 'refresh',
  leadership: 'users',
  analytics: 'chart-dots-3',
  workshop: 'presentation',
  governance: 'scale',
  retention: 'heart-handshake',
  alignment: 'git-merge',
  roadmap: 'map-2',
  package: 'package',
  coaching: 'message-circle',
  metrics: 'gauge',
  'icon-strategy': 'target',
  'icon-operations': 'stack-2',
  'icon-growth': 'trending-up',
  'icon-change': 'refresh',
  'icon-leadership': 'users',
  'icon-analytics': 'chart-dots-3',
  'icon-workshop': 'presentation',
  'icon-governance': 'scale',
  'icon-retention': 'heart-handshake',
  'icon-alignment': 'git-merge',
  'icon-roadmap': 'map-2',
  'icon-package': 'package',
  'icon-delivery': 'package',
  'icon-coaching': 'message-circle',
  'icon-metrics': 'gauge',
  'case-study-1': 'git-merge',
  'case-study-2': 'map-2',
  'case-study-3': 'package',
};

export function normalizeIconId(ref: string | null | undefined): string | null {
  if (!ref || typeof ref !== 'string') return null;
  const trimmed = ref.trim();
  if (!trimmed) return null;
  if (TABLER_NAME_SET.has(trimmed)) return trimmed;
  if (LEGACY_ICON_ALIASES[trimmed]) return LEGACY_ICON_ALIASES[trimmed];
  if (trimmed.startsWith('icon-')) {
    const stripped = trimmed.slice('icon-'.length);
    if (TABLER_NAME_SET.has(stripped)) return stripped;
    if (LEGACY_ICON_ALIASES[stripped]) return LEGACY_ICON_ALIASES[stripped];
    if (LEGACY_ICON_ALIASES[trimmed]) return LEGACY_ICON_ALIASES[trimmed];
  }
  return null;
}

export function iconIdToTablerName(ref: string | null | undefined): string | null {
  return normalizeIconId(ref);
}

export function iconCatalogLabel(id: string): string {
  const normalized = normalizeIconId(id);
  if (!normalized) return id;
  return BY_ID.get(normalized)?.label ?? humanizeTablerName(normalized);
}

export function isCatalogIconId(ref: string | null | undefined): boolean {
  return normalizeIconId(ref) !== null;
}

export function filterIconCatalog(query: string): IconCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return ICON_CATALOG;
  return ICON_CATALOG.filter(
    (entry) =>
      entry.label.toLowerCase().includes(q) || entry.id.toLowerCase().includes(q),
  );
}

export const ICON_CATALOG_COUNT = ICON_CATALOG.length;
