import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LightboxItem } from './PaintingLightbox';
import {
  MASONRY_ITEM_GAP_PX,
  balanceMasonryColumnIndices,
  defaultMasonryAspect,
  estimateMasonryItemHeight,
} from './balancedMasonry';

const TWO_COLUMN_MIN_WIDTH_PX = 640;
const THREE_COLUMN_MIN_WIDTH_PX = 960;

type Props = {
  items: LightboxItem[];
  onOpen: (index: number) => void;
};

function useMasonryColumnCount(containerWidth: number): number {
  if (containerWidth <= 0) return 2;
  if (containerWidth >= THREE_COLUMN_MIN_WIDTH_PX) return 3;
  return containerWidth >= TWO_COLUMN_MIN_WIDTH_PX ? 2 : 1;
}

export default function PaintingMasonryGrid({ items, onOpen }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [aspects, setAspects] = useState<Record<string, number>>({});

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => setContainerWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const columnCount = useMasonryColumnCount(containerWidth);
  const columnContentWidth = Math.max(
    0,
    (containerWidth - MASONRY_ITEM_GAP_PX * (columnCount - 1)) / columnCount,
  );

  const columns = useMemo(
    () =>
      balanceMasonryColumnIndices(
        items.length,
        (index) => {
          const item = items[index];
          const aspect = defaultMasonryAspect(aspects, item.src);
          return estimateMasonryItemHeight(columnContentWidth, aspect, false);
        },
        columnCount,
      ),
    [items, aspects, columnContentWidth, columnCount],
  );

  const registerAspect = useCallback((src: string, aspect: number) => {
    if (!Number.isFinite(aspect) || aspect <= 0) return;
    setAspects((current) => {
      if (current[src] === aspect) return current;
      return { ...current, [src]: aspect };
    });
  }, []);

  const renderItem = (index: number) => {
    const item = items[index];
    return (
      <figure
        key={item.src}
        className="painting-masonry-item group overflow-hidden"
      >
        <button
          type="button"
          className="painting-cell block w-full p-3 text-left"
          onClick={() => onOpen(index)}
          aria-label={`View larger: ${item.alt.includes(' — ') ? item.alt.slice(0, item.alt.indexOf(' — ')) : item.alt}`}
        >
          <img
            src={item.src}
            alt=""
            className="media-hover-zoom h-auto w-full object-contain"
            loading="lazy"
            decoding="async"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth > 0) {
                registerAspect(item.src, img.naturalHeight / img.naturalWidth);
              }
            }}
          />
        </button>
      </figure>
    );
  };

  return (
    <div
      ref={containerRef}
      className="painting-masonry"
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {columns.map((indices, column) => (
        <div key={column} className="painting-masonry-col">
          {indices.map((index) => renderItem(index))}
        </div>
      ))}
    </div>
  );
}
