import { describe, expect, it } from 'vitest';
import { buildNavTree, resolveNavigation } from './navigation';

describe('buildNavTree', () => {
  it('groups submenu items under the previous main item', () => {
    expect(
      buildNavTree([
        { label: 'Services', href: '/services', level: 'main' },
        { label: 'Assessment', href: '/services/assessment', level: 'submenu' },
        { label: 'About', href: '/about', level: 'main' },
      ]),
    ).toEqual([
      {
        label: 'Services',
        href: '/services',
        children: [{ label: 'Assessment', href: '/services/assessment' }],
      },
      { label: 'About', href: '/about' },
    ]);
  });

  it('promotes orphan submenu items to main items', () => {
    expect(
      buildNavTree([{ label: 'FAQ', href: '/faq', level: 'submenu' }]),
    ).toEqual([{ label: 'FAQ', href: '/faq' }]);
  });
});

describe('resolveNavigation', () => {
  it('keeps nested navigation as-is', () => {
    const nested = [{ label: 'About', href: '/about', children: [{ label: 'FAQ', href: '/faq' }] }];
    expect(resolveNavigation(nested)).toEqual(nested);
  });
});
