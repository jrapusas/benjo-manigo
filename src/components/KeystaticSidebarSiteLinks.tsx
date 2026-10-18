import { useEffect } from 'react';
import { KEYSTATIC_SITE_LINKS } from '../lib/keystaticSiteLinks';

const INJECTED_ATTR = 'data-ks-injected-site-links';
const HEADING_ID = 'ks-site-links-nav';

function findSidebarNavList(): HTMLUListElement | null {
  const dashboard = document.querySelector<HTMLAnchorElement>(
    '.ks-admin-app a[href="/keystatic"]',
  );
  return dashboard?.closest('ul') ?? null;
}

function createNavLabel(label: string): HTMLDivElement {
  const title = document.createElement('span');
  title.className = 'kui-8jc9vp';
  title.title = label;
  title.textContent = label;

  const text = document.createElement('span');
  text.className = 'kui:reset kui:Text kui-68pelp';
  text.append(title);

  const inner = document.createElement('div');
  inner.className = 'kui:reset kui-1xf6ikg';
  inner.append(text);

  return inner;
}

function createLinksGroup(): HTMLLIElement {
  const group = document.createElement('li');
  group.className = 'kui:reset kui-1pndzsm';
  group.setAttribute(INJECTED_ATTR, 'true');

  const heading = document.createElement('h3');
  heading.id = HEADING_ID;
  heading.className = 'kui:reset kui:Text kui-1k6gvht';
  heading.textContent = 'Links';

  const list = document.createElement('ul');
  list.className = 'kui:reset kui-1g0qg4p';
  list.setAttribute('aria-labelledby', HEADING_ID);

  for (const link of KEYSTATIC_SITE_LINKS) {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.className = 'kui:reset kui-1i5ysz';
    anchor.href = link.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.append(createNavLabel(link.label));
    item.append(anchor);
    list.append(item);
  }

  group.append(heading, list);
  return group;
}

function syncSidebarSiteLinks(): void {
  const navList = findSidebarNavList();
  if (!navList) return;

  if (navList.querySelector(`[${INJECTED_ATTR}]`)) return;

  const dashboardItem = navList.querySelector(':scope > li:first-child');
  if (!dashboardItem) return;

  navList.insertBefore(createLinksGroup(), dashboardItem.nextSibling);
}

export default function KeystaticSidebarSiteLinks() {
  useEffect(() => {
    syncSidebarSiteLinks();

    const root = document.querySelector('.ks-admin-app');
    if (!root) return;

    const observer = new MutationObserver(() => {
      syncSidebarSiteLinks();
    });

    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
