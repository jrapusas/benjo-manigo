import { describe, expect, it } from 'vitest';
import { tablerIconFromSlug, tablerIconFromSrc, tablerIconSvgForPreview } from './tablerIcons';

describe('tablerIconFromSrc', () => {
  it('renders SVG for catalog id', () => {
    const svg = tablerIconFromSrc('strategy');
    expect(svg).toContain('<svg');
    expect(svg).toContain('class="h-8 w-8"');
  });

  it('renders SVG for legacy slug', () => {
    const svg = tablerIconFromSlug('icon-strategy', 'ks-admin-media-icon__svg');
    expect(svg).toContain('<svg');
    expect(svg).toContain('class="ks-admin-media-icon__svg"');
  });

  it('maps consulting catalog icons', () => {
    expect(tablerIconFromSrc('leadership')).toContain('<svg');
    expect(tablerIconFromSrc('analytics')).toContain('<svg');
    expect(tablerIconFromSrc('workshop')).toContain('<svg');
    expect(tablerIconFromSrc('metrics')).toContain('<svg');
  });

  it('renders fixed-size preview SVG for img and API use', () => {
    const svg = tablerIconSvgForPreview('metrics', { size: 128 });
    expect(svg).toContain('width="128"');
    expect(svg).toContain('height="128"');
    expect(svg).toContain('#334155');
    expect(svg).not.toContain('currentColor');
  });

  it('keeps currentColor when requested', () => {
    const svg = tablerIconSvgForPreview('metrics', {
      size: 24,
      preserveCurrentColor: true,
    });
    expect(svg).toContain('currentColor');
    expect(svg).not.toContain('#334155');
  });
});
