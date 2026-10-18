import { describe, expect, it } from 'vitest';
import {
  injectSvgClass,
  prepareInlineIconSvg,
  prepareSvgForImagePreview,
  readPublicSvg,
  resolveIconSrc,
} from './iconSvg';

describe('iconSvg', () => {
  it('resolves icon slugs for lookup', () => {
    expect(resolveIconSrc('icon-change')).toBe('icon-change');
  });

  it('injects class into svg markup', () => {
    const svg = injectSvgClass('<svg viewBox="0 0 24 24"><path /></svg>', 'h-8 w-8');
    expect(svg).toContain('class="h-8 w-8"');
  });

  it('binds currentColor to section link token for inline icons', () => {
    const svg = prepareInlineIconSvg(
      '<svg width="24" height="24" viewBox="0 0 24 24"><path stroke="currentColor" /></svg>',
    );
    expect(svg).toContain('stroke="var(--color-link)"');
    expect(svg).not.toContain('width="24"');
  });

  it('reads icon svg from slug or media path', () => {
    const svg = readPublicSvg('icon-change', 'h-8 w-8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('class="h-8 w-8 shrink-0"');
    expect(svg).toContain('<path');
  });

  it('adds xmlns and fixed color for img preview', () => {
    const svg = prepareSvgForImagePreview(
      '<svg width="24" height="24"><path stroke="currentColor" /></svg>',
    );
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('width="128"');
    expect(svg).toContain('stroke="#334155"');
  });

  it('does not strip stroke-width from path elements', () => {
    const svg = prepareSvgForImagePreview(
      '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M0 0"/></svg>',
    );
    expect(svg).toContain('stroke-width="2"');
  });

  it('reads icon svg from media preview api path', () => {
    const svg = readPublicSvg('/api/media-preview/icon-leadership', 'h-8 w-8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('class="h-8 w-8 shrink-0"');
    expect(svg).toContain('<path');
  });
});
