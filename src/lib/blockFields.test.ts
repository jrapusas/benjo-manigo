import { describe, expect, it } from 'vitest';
import { hasButton, hasDocument, hasText } from './blockFields';

describe('blockFields', () => {
  it('hasText rejects empty and whitespace', () => {
    expect(hasText('')).toBe(false);
    expect(hasText('   ')).toBe(false);
    expect(hasText(undefined)).toBe(false);
    expect(hasText('hello')).toBe(true);
  });

  it('hasButton requires both label and url', () => {
    expect(hasButton({ label: 'Go', url: '' })).toBe(false);
    expect(hasButton({ label: '', url: '/x' })).toBe(false);
    expect(hasButton({ label: 'Go', url: '/x' })).toBe(true);
  });

  it('hasDocument checks array length', () => {
    expect(hasDocument([])).toBe(false);
    expect(hasDocument([{ type: 'paragraph' }])).toBe(true);
  });
});
