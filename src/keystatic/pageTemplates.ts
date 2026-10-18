// Page template catalog - metadata for scaffolding new pages (see scripts/content-templates.mjs).
import pageTemplateCatalog from './page-template-catalog.json';

// keyof typeof - union of all keys in the imported JSON object
export type PageTemplateId = keyof typeof pageTemplateCatalog;

export type PageTemplate = {
  id: string;
  label: string;
  collection: 'pages' | 'posts';
  source: string;
};

export const PAGE_TEMPLATES = pageTemplateCatalog as Record<
  PageTemplateId,
  PageTemplate
>;

export const PAGE_TEMPLATE_IDS = Object.keys(PAGE_TEMPLATES) as PageTemplateId[];
