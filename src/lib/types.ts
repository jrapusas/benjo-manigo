// Shared TypeScript types derived from Keystatic config - single source of truth.
import type { EntryWithResolvedLinkedFiles } from '@keystatic/core/reader';
import type { KeystaticConfig } from './reader';

// EntryWithResolvedLinkedFiles resolves image paths to public URLs (e.g. /images/media/foo.jpg)
export type PageEntry = EntryWithResolvedLinkedFiles<
  KeystaticConfig['collections']['pages']
>;

export type PostEntry = EntryWithResolvedLinkedFiles<
  KeystaticConfig['collections']['posts']
>;

export type MediaEntry = EntryWithResolvedLinkedFiles<
  KeystaticConfig['collections']['media']
>;

export type SiteEntry = EntryWithResolvedLinkedFiles<
  KeystaticConfig['singletons']['site']
>;

// ContentBlock = one item from the blocks array: { discriminant: 'hero', value: { ... } }
export type ContentBlock = NonNullable<PageEntry['blocks']>[number];

// Union of all block type names - 'hero' | 'pricing' | 'richText' | ...
export type BlockDiscriminant = ContentBlock['discriminant'];

// Generic helper: BlockValue<'pricing'> = the props shape for the pricing block only.
// Extract<T, U> filters a union type to members matching U.
export type BlockValue<T extends BlockDiscriminant> = Extract<
  ContentBlock,
  { discriminant: T }
>['value'];

export type ButtonLink = {
  label: string;
  url: string;
};

export type SeoFields = {
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
};
