import { describe, expect, it } from 'vitest';
import {
  gradientAppearanceName,
  isGradientAppearance,
  parseAppearanceIntent,
} from './appearanceIntent';

describe('appearanceIntent', () => {
  it('keeps solid appearances on the matching tone', () => {
    expect(parseAppearanceIntent('soft')).toEqual({
      tone: 'soft',
      backgroundStyle: 'solid',
      stored: 'soft',
    });
  });

  it('maps gradient appearances to tone + gradient background', () => {
    expect(parseAppearanceIntent('gradient-accent')).toEqual({
      tone: 'accent',
      backgroundStyle: 'gradient',
      stored: 'gradient-accent',
    });
  });

  it('builds gradient appearance names', () => {
    expect(gradientAppearanceName('tinted')).toBe('gradient-tinted');
    expect(isGradientAppearance('gradient-tinted')).toBe(true);
    expect(isGradientAppearance('tinted')).toBe(false);
  });
});
