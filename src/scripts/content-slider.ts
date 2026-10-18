type InfiniteSlider = {
  track: HTMLElement;
  count: number;
  setWidth: number;
  adjusting: boolean;
  measure: () => void;
  normalize: () => void;
  alignToOriginals: () => void;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usesCenteredSlides(): boolean {
  return window.matchMedia('(width < 40rem)').matches;
}

function getSlideInset(track: HTMLElement, slide: HTMLElement): number {
  return usesCenteredSlides() ? (track.clientWidth - slide.offsetWidth) / 2 : 0;
}

function getAlignedScrollLeft(track: HTMLElement, slide: HTMLElement): number {
  return slide.offsetLeft - getSlideInset(track, slide);
}

function cloneSlide(slide: HTMLElement, which: 'before' | 'after'): HTMLElement {
  const clone = slide.cloneNode(true) as HTMLElement;
  clone.dataset.contentSliderClone = which;
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('data-content-slider-original');
  clone.removeAttribute('data-content-slider-slide');
  if (clone.id) clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  return clone;
}

function jumpTo(track: HTMLElement, left: number): void {
  track.dataset.contentSliderJumping = 'true';
  track.scrollLeft = left;
  requestAnimationFrame(() => {
    delete track.dataset.contentSliderJumping;
  });
}

function getSlideStep(track: HTMLElement): number {
  const first = track.querySelector<HTMLElement>('[data-content-slider-original="true"]');
  if (!first) return track.clientWidth;

  const second = first.nextElementSibling as HTMLElement | null;
  if (second?.dataset.contentSliderOriginal === 'true') {
    return second.offsetLeft - first.offsetLeft;
  }

  const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
  return first.offsetWidth + gap;
}

function setupInfiniteTrack(track: HTMLElement): InfiniteSlider | null {
  const originals = Array.from(track.children) as HTMLElement[];
  if (originals.length < 2) return null;

  originals.forEach((slide, index) => {
    slide.dataset.contentSliderOriginal = 'true';
    slide.dataset.contentSliderSlide = String(index);
  });

  const before = document.createDocumentFragment();
  const after = document.createDocumentFragment();

  for (const slide of originals) {
    before.appendChild(cloneSlide(slide, 'before'));
    after.appendChild(cloneSlide(slide, 'after'));
  }

  track.insertBefore(before, track.firstChild);
  track.appendChild(after);

  const state: InfiniteSlider = {
    track,
    count: originals.length,
    setWidth: 0,
    adjusting: false,
    measure() {
      const first = track.querySelector<HTMLElement>('[data-content-slider-original="true"]');
      const afterSet = track.children[this.count * 2] as HTMLElement | undefined;
      if (!first || !afterSet) {
        this.setWidth = 0;
        return;
      }
      this.setWidth = afterSet.offsetLeft - first.offsetLeft;
    },
    alignToOriginals() {
      const first = track.querySelector<HTMLElement>('[data-content-slider-original="true"]');
      if (first) jumpTo(track, getAlignedScrollLeft(track, first));
    },
    normalize() {
      if (this.adjusting || this.setWidth <= 0) return;

      const first = track.querySelector<HTMLElement>('[data-content-slider-original="true"]');
      if (!first) return;

      const inset = getSlideInset(track, first);
      const start = first.offsetLeft - inset;
      const end = start + this.setWidth;
      const { scrollLeft } = track;

      if (scrollLeft >= end - 1) {
        this.adjusting = true;
        jumpTo(track, scrollLeft - this.setWidth);
        this.adjusting = false;
      } else if (scrollLeft < start - 1) {
        this.adjusting = true;
        jumpTo(track, scrollLeft + this.setWidth);
        this.adjusting = false;
      }
    },
  };

  state.measure();
  state.alignToOriginals();

  return state;
}

function scrollByStep(track: HTMLElement, direction: -1 | 1): void {
  track.scrollBy({
    left: direction * getSlideStep(track),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

function updateSliderState(slider: HTMLElement, track: HTMLElement, slideCount: number): void {
  slider.dataset.contentSliderScrollable = slideCount >= 2 ? 'true' : 'false';
}

function getActiveOriginalIndex(track: HTMLElement, slideCount: number): number {
  if (slideCount <= 0) return 0;

  const originals = Array.from(
    track.querySelectorAll<HTMLElement>('[data-content-slider-original="true"]'),
  );
  if (!originals.length) return 0;

  const trackCenter = track.scrollLeft + track.clientWidth / 2;
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  originals.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideCenter - trackCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  return activeIndex;
}

function announceActiveSlide(
  slider: HTMLElement,
  track: HTMLElement,
  slideCount: number,
): void {
  const status = slider.querySelector<HTMLElement>('[data-content-slider-status]');
  if (!status || slideCount < 2) {
    status?.replaceChildren();
    return;
  }

  const activeIndex = getActiveOriginalIndex(track, slideCount);
  const originals = track.querySelectorAll<HTMLElement>('[data-content-slider-original="true"]');

  originals.forEach((slide, index) => {
    slide.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
  });

  status.textContent = `Slide ${activeIndex + 1} of ${slideCount}`;
}

export function initContentSliders(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-content-slider]').forEach((slider) => {
    if (slider.dataset.contentSliderReady === 'true') return;
    slider.dataset.contentSliderReady = 'true';

    const track = slider.querySelector<HTMLElement>('[data-content-slider-track]');
    const prev = slider.querySelector<HTMLButtonElement>('[data-content-slider-prev]');
    const next = slider.querySelector<HTMLButtonElement>('[data-content-slider-next]');
    if (!track || !prev || !next) return;

    const infinite = setupInfiniteTrack(track);
    const slideCount = infinite?.count ?? track.children.length;

    const refresh = () => {
      infinite?.measure();
      updateSliderState(slider, track, slideCount);
      announceActiveSlide(slider, track, slideCount);
    };

    let scrollTimer: number | undefined;

    const onScroll = () => {
      if (infinite && !infinite.adjusting) {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => infinite.normalize(), 100);
      }
      updateSliderState(slider, track, slideCount);
    };

    prev.addEventListener('click', () => scrollByStep(track, -1));
    next.addEventListener('click', () => scrollByStep(track, 1));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollByStep(track, -1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollByStep(track, 1);
      }
    });
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scrollend', () => infinite?.normalize());
    window.addEventListener('resize', () => {
      infinite?.measure();
      infinite?.alignToOriginals();
      refresh();
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        infinite?.measure();
        infinite?.alignToOriginals();
        refresh();
      });
    });
    refresh();
  });
}
