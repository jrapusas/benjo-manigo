import { describe, expect, it } from 'vitest';
import {
  ICON_CATALOG,
  ICON_CATALOG_COUNT,
  filterIconCatalog,
  normalizeIconId,
} from './iconCatalog';

describe('iconCatalog', () => {
  it('includes the full Tabler set', () => {
    expect(ICON_CATALOG_COUNT).toBeGreaterThan(6000);
    expect(ICON_CATALOG).toHaveLength(ICON_CATALOG_COUNT);
  });

  it('is sorted A–Z by label', () => {
    const labels = ICON_CATALOG.map((e) => e.label);
    const sorted = [...labels].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
    expect(labels).toEqual(sorted);
  });

  it('normalizes legacy short ids to Tabler names', () => {
    expect(normalizeIconId('strategy')).toBe('target');
    expect(normalizeIconId('icon-strategy')).toBe('target');
  });

  it('accepts Tabler icon names directly', () => {
    expect(normalizeIconId('package')).toBe('package');
    expect(normalizeIconId('chart-dots-3')).toBe('chart-dots-3');
  });

  it('filters by label or id', () => {
    const hits = filterIconCatalog('target');
    expect(hits.some((e) => e.id === 'target')).toBe(true);
    expect(hits.length).toBeLessThan(ICON_CATALOG_COUNT);
  });
});
