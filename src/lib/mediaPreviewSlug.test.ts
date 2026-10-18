import { describe, expect, it } from 'vitest';
import { resolveMediaPreviewSlug } from './mediaPreviewSlug';

describe('resolveMediaPreviewSlug', () => {
  it('aliases icon-delivery to icon-package', () => {
    expect(resolveMediaPreviewSlug('icon-delivery')).toBe('icon-package');
  });

  it('passes through other slugs', () => {
    expect(resolveMediaPreviewSlug('icon-strategy')).toBe('icon-strategy');
  });
});
