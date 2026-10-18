/** Vertical gap between masonry items (matches `gap` on `.painting-masonry-col`). */
export const MASONRY_ITEM_GAP_PX = 20;

/** Horizontal padding on `.painting-cell` (`p-3` × 2) — narrows image width. */
const CELL_PADDING_X_PX = 24;

/** Vertical padding on cell + placard block (`p-3` + caption margin). */
const CELL_CHROME_PX = 24;
const CAPTION_BLOCK_PX = 32;

const DEFAULT_ASPECT = 0.75;

export function estimateMasonryItemHeight(
  columnContentWidth: number,
  aspect: number,
  hasCaption: boolean,
): number {
  if (columnContentWidth <= 0) return 240;
  const safeAspect = aspect > 0 ? aspect : DEFAULT_ASPECT;
  const imageWidth = Math.max(0, columnContentWidth - CELL_PADDING_X_PX);
  const imageHeight = imageWidth * safeAspect;
  const caption = hasCaption ? CAPTION_BLOCK_PX : 0;
  return CELL_CHROME_PX + imageHeight + caption;
}

/**
 * Greedy shortest-column pack in source order (stable reading order).
 */
export function balanceMasonryColumnIndices(
  itemCount: number,
  heightForIndex: (index: number) => number,
  columnCount = 2,
): number[][] {
  const columns: number[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array<number>(columnCount).fill(0);

  for (let index = 0; index < itemCount; index += 1) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(index);
    heights[shortest] += heightForIndex(index) + MASONRY_ITEM_GAP_PX;
  }

  return columns;
}

export function defaultMasonryAspect(aspects: Record<string, number>, src: string): number {
  const aspect = aspects[src];
  return aspect && aspect > 0 ? aspect : DEFAULT_ASPECT;
}
