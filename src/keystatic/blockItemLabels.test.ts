import { describe, expect, it } from 'vitest';
import { blockItemLabel, heroBlockItemLabel } from './blockItemLabels';

describe('blockItemLabels', () => {
  it('combines block label with heading', () => {
    const label = blockItemLabel('Feature Grid')({
      fields: { heading: { value: 'Philippine import regulatory services' } },
    });

    expect(label).toBe(
      'Feature Grid - Philippine import regulatory services',
    );
  });

  it('uses title for image + text blocks', () => {
    const label = blockItemLabel('Image + Text', 'title')({
      fields: {
        title: { value: "Import requirements depend on what you're importing." },
      },
    });

    expect(label).toBe(
      "Image + Text - Import requirements depend on what you're importing.",
    );
  });

  it('prefers hero title over eyebrow', () => {
    const label = heroBlockItemLabel('Hero')({
      fields: {
        title: { value: 'Importing a Product into the Philippines?' },
        eyebrow: { value: 'Philippine Import Regulatory Services' },
      },
    });

    expect(label).toBe('Hero - Importing a Product into the Philippines?');
  });

  it('falls back to block label when no heading exists', () => {
    const label = blockItemLabel('Rich Text')({ fields: {} });
    expect(label).toBe('Rich Text');
  });
});
