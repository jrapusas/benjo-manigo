import { describe, expect, it } from 'vitest';
import { balanceMasonryColumnIndices } from './balancedMasonry';

describe('balanceMasonryColumnIndices', () => {
  it('keeps column totals closer than naive alternating', () => {
    const heights = [100, 400, 100, 400];
    const [left, right] = balanceMasonryColumnIndices(heights.length, (i) => heights[i]);
    const sum = (indices: number[]) =>
      indices.reduce((total, i) => total + heights[i], 0);

    expect(Math.abs(sum(left) - sum(right))).toBeLessThanOrEqual(200);
    expect(left.length + right.length).toBe(4);
  });

  it('preserves source order within each column', () => {
    const heights = [50, 50, 50, 50, 200];
    const [left, right] = balanceMasonryColumnIndices(heights.length, (i) => heights[i]);

    expect(left).toEqual([0, 2, 4]);
    expect(right).toEqual([1, 3]);
  });

  it('fills the shortest of three columns', () => {
    const heights = [300, 100, 100, 100, 100];
    const columns = balanceMasonryColumnIndices(heights.length, (i) => heights[i], 3);

    expect(columns).toEqual([[0], [1, 3], [2, 4]]);
  });
});
