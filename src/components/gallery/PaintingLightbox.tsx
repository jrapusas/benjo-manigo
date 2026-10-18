import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PaintingMasonryGrid from './PaintingMasonryGrid';

export type LightboxItem = {
  src: string;
  alt: string;
  caption?: string;
};

type Props = {
  items: LightboxItem[];
  layout?: 'grid' | 'masonry';
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function paintingLabel(alt: string): string {
  const dash = alt.indexOf(' — ');
  return dash > 0 ? alt.slice(0, dash) : alt;
}

export default function PaintingLightbox({ items, layout = 'grid' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => setOpenIndex(null), []);
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const main = document.getElementById('main-content');
    main?.setAttribute('inert', '');

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setOpenIndex((current) =>
          current === null ? null : (current + 1) % items.length,
        );
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setOpenIndex((current) =>
          current === null ? null : (current - 1 + items.length) % items.length,
        );
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const nodes = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => !node.hasAttribute('disabled') && node.tabIndex !== -1);

      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (!dialogRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey) {
        if (active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      main?.removeAttribute('inert');
      lastFocusedRef.current?.focus();
    };
  }, [close, items.length, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (items.length === 0) return null;

  const active = openIndex !== null ? items[openIndex] : null;
  const isMasonry = layout === 'masonry';
  const dialogTitle = active ? paintingLabel(active.alt) : 'Image viewer';

  return (
    <>
      {isMasonry ? (
        <PaintingMasonryGrid items={items} onOpen={setOpenIndex} />
      ) : (
        <div className="item-grid item-grid-cols-3">
          {items.map((item, index) => (
            <figure
              key={item.src}
              className="card card-hover card-fill group overflow-hidden p-0"
            >
              <button
                type="button"
                className="painting-cell relative block aspect-[4/3] w-full overflow-hidden"
                onClick={() => setOpenIndex(index)}
                aria-label={`View larger: ${paintingLabel(item.alt)}`}
              >
                <img
                  src={item.src}
                  alt=""
                  className="media-contain media-hover-zoom mx-auto max-h-full max-w-full"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </figure>
          ))}
        </div>
      )}

      {active && openIndex !== null ? createPortal(
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2a2826]/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={close}
        >
          <p id={titleId} className="sr-only">
            {dialogTitle}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute right-4 top-4 z-[2] min-h-11 rounded-md bg-[#f7f5f2]/12 px-3 py-2 text-sm text-[#f7f5f2] hover:bg-[#f7f5f2]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8a066]"
            onClick={close}
          >
            Close
          </button>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-[2] min-h-11 min-w-11 -translate-y-1/2 rounded-md bg-[#f7f5f2]/12 px-3 py-2 text-[#f7f5f2] hover:bg-[#f7f5f2]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8a066]"
            onClick={(event) => {
              event.stopPropagation();
              setOpenIndex((current) =>
                current === null ? 0 : (current - 1 + items.length) % items.length,
              );
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-[2] min-h-11 min-w-11 -translate-y-1/2 rounded-md bg-[#f7f5f2]/12 px-3 py-2 text-[#f7f5f2] hover:bg-[#f7f5f2]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8a066]"
            onClick={(event) => {
              event.stopPropagation();
              setOpenIndex((current) =>
                current === null ? 0 : (current + 1) % items.length,
              );
            }}
            aria-label="Next image"
          >
            ›
          </button>
          <figure
            className="max-h-[90vh] max-w-[min(1200px,96vw)] bg-[#f7f5f2] p-3 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={active.src}
              alt={active.alt}
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </figure>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
