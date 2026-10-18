import { describe, expect, it } from 'vitest';
import { shouldHideLivePage } from './liveSite';

describe('shouldHideLivePage', () => {
  it('hides public pages when the live site is hidden', () => {
    expect(shouldHideLivePage('/', true)).toBe(true);
    expect(shouldHideLivePage('/work/portraits', true)).toBe(true);
  });

  it('leaves the CMS and API alone', () => {
    expect(shouldHideLivePage('/keystatic', true)).toBe(false);
    expect(shouldHideLivePage('/api/inquiry', true)).toBe(false);
    expect(shouldHideLivePage('/robots.txt', true)).toBe(false);
  });

  it('shows pages when the live site is public', () => {
    expect(shouldHideLivePage('/', false)).toBe(false);
  });
});
