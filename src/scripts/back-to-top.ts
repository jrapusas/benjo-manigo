function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initBackToTop(): () => void {
  const button = document.querySelector<HTMLButtonElement>('[data-back-to-top]');
  if (!button) return () => {};

  const threshold = 480;
  const reduced = prefersReducedMotion();

  const setVisible = (visible: boolean) => {
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    button.tabIndex = visible ? 0 : -1;
  };

  const update = () => {
    setVisible(window.scrollY >= threshold);
  };

  window.addEventListener('scroll', update, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  update();

  return () => {
    window.removeEventListener('scroll', update);
  };
}
