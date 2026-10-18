const FOCUSABLE =
  'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function initMobileMenu(root: ParentNode = document): void {
  const menu = root.querySelector<HTMLDetailsElement>('.mobile-menu');
  if (!menu || menu.dataset.mobileMenuReady === 'true') return;
  menu.dataset.mobileMenuReady = 'true';

  const trigger = menu.querySelector<HTMLElement>('.mobile-menu-trigger');
  const backdrop = menu.querySelector<HTMLElement>('.mobile-menu-backdrop');
  const panel = menu.querySelector<HTMLElement>('.mobile-menu-panel');
  if (!trigger || !panel) return;

  let onKeyDown: ((event: KeyboardEvent) => void) | null = null;

  const getFocusables = () =>
    Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => !node.closest('[aria-hidden="true"]') && node.offsetParent !== null,
    );

  const close = () => {
    menu.open = false;
  };

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = getFocusables();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  backdrop?.addEventListener('click', (event) => {
    event.preventDefault();
    close();
  });

  menu.addEventListener('toggle', () => {
    if (menu.open) {
      const focusables = getFocusables();
      (focusables[0] ?? trigger).focus();
      onKeyDown = trapFocus;
      document.addEventListener('keydown', onKeyDown);
      return;
    }

    if (onKeyDown) {
      document.removeEventListener('keydown', onKeyDown);
      onKeyDown = null;
    }
    trigger.focus();
  });

  panel.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement && target.href) {
      close();
    }
  });
}
