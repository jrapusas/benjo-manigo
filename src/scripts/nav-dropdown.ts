const CLOSE_DELAY_MS = 250;

export function initNavDropdowns(root: ParentNode = document): void {
  const dropdowns = root.querySelectorAll<HTMLElement>('.nav-dropdown');

  dropdowns.forEach((dropdown) => {
    if (dropdown.dataset.navDropdownReady === 'true') return;
    dropdown.dataset.navDropdownReady = 'true';

    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    const open = () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      dropdown.dataset.open = 'true';
    };

    const scheduleClose = () => {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        delete dropdown.dataset.open;
        closeTimer = null;
      }, CLOSE_DELAY_MS);
    };

    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', scheduleClose);
    dropdown.addEventListener('focusin', open);
    dropdown.addEventListener('focusout', (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && dropdown.contains(next)) return;
      scheduleClose();
    });
  });
}
