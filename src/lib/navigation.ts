export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export type FlatNavItem = {
  label: string;
  href: string;
  level: 'main' | 'submenu';
};

type StoredNavItem = NavItem | FlatNavItem;

export function buildNavTree(items: FlatNavItem[]): NavItem[] {
  const tree: NavItem[] = [];
  let currentParent: NavItem | undefined;

  for (const item of items) {
    const entry: NavItem = { label: item.label, href: item.href };

    if (item.level === 'submenu' && currentParent) {
      currentParent.children ??= [];
      currentParent.children.push(entry);
      continue;
    }

    tree.push(entry);
    currentParent = entry;
  }

  return tree;
}

export function resolveNavigation(navigation: StoredNavItem[]): NavItem[] {
  if (!navigation.length) return [];

  if ('level' in navigation[0]) {
    return buildNavTree(navigation as FlatNavItem[]);
  }

  return navigation as NavItem[];
}

export function isNavActive(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath.startsWith(href);
}

export function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (isNavActive(item.href, currentPath)) return true;
  return item.children?.some((child) => isNavActive(child.href, currentPath)) ?? false;
}

export function navPathLabels(navigation: NavItem[]): Record<string, string> {
  const labels: Record<string, string> = {};

  for (const item of navigation) {
    labels[item.href] = item.label;
    for (const child of item.children ?? []) {
      labels[child.href] = child.label;
    }
  }

  return labels;
}
