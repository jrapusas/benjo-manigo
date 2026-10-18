import { useEffect } from 'react';

const COUNT_CLASS = 'ks-media-library-count';
const MEDIA_COLLECTION_PATH = '/keystatic/collection/media';

function updateMediaLibraryCount() {
  const onMediaPage =
    window.location.pathname === MEDIA_COLLECTION_PATH ||
    window.location.pathname.startsWith(`${MEDIA_COLLECTION_PATH}/`);

  const existing = document.querySelector(`.${COUNT_CLASS}`);
  if (!onMediaPage) {
    existing?.remove();
    return;
  }

  const rows = document.querySelectorAll(
    '.ks-admin-app [role="row"]:not([role="columnheader"])',
  );
  const count = rows.length;

  let el = existing;
  if (!el) {
    el = document.createElement('p');
    el.className = COUNT_CLASS;
    const title = document.getElementById('page-title');
    title?.insertAdjacentElement('afterend', el);
  }

  el.textContent = `${count} image${count === 1 ? '' : 's'} in library`;
  el.setAttribute('data-ks-media-row-count', String(count));
}

export default function KeystaticMediaLibraryMeta() {
  useEffect(() => {
    updateMediaLibraryCount();

    const root = document.querySelector('.ks-admin-app');
    if (!root) return;

    const observer = new MutationObserver(() => {
      updateMediaLibraryCount();
    });

    observer.observe(root, { childList: true, subtree: true });

    const onNav = () => updateMediaLibraryCount();
    window.addEventListener('popstate', onNav);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', onNav);
      document.querySelector(`.${COUNT_CLASS}`)?.remove();
    };
  }, []);

  return null;
}
