// KEYSTATIC CONFIG - defines CMS schema (what editors see) and where content files live.
// This file is read by the Keystatic admin UI and by createReader() at build time.

import { config, collection, fields, singleton } from '@keystatic/core';
import { contentBlocks } from './src/keystatic/blocks';
import { siteColorsField } from './src/keystatic/colors';
import { seoFields } from './src/keystatic/fields';
import { iconLibraryField } from './src/keystatic/fields/iconLibraryField';
import { mediaCollectionSchema, mediaField } from './src/keystatic/media';
import { resolveKeystaticStorage } from './src/keystatic/storage';

export default config({
  storage: resolveKeystaticStorage(),
  singletons: {
    // Singleton = one global record (site settings), not a list of entries
    site: singleton({
      label: 'Site Settings',
      path: 'src/content/site',
      format: { data: 'yaml' },
      schema: {
        companyName: fields.text({
          label: 'Company Name',
          validation: { isRequired: true },
        }),
        tagline: fields.text({ label: 'Tagline' }),
        navigation: fields.array(
          fields.object({
            label: fields.text({
              label: 'Label',
              validation: { isRequired: true },
            }),
            href: fields.text({
              label: 'Link',
              validation: { isRequired: true },
            }),
            level: fields.select({
              label: 'Level',
              description:
                'Submenu items are indented under the previous main menu item.',
              options: [
                { label: 'Main menu item', value: 'main' },
                { label: 'Submenu item', value: 'submenu' },
              ],
              defaultValue: 'main',
            }),
          }),
          {
            label: 'Main Navigation',
            itemLabel: (props) => {
              const label = props.fields.label.value || 'Untitled';
              return props.fields.level.value === 'submenu' ? `↳ ${label}` : label;
            },
          },
        ),
        footerText: fields.text({
          label: 'Footer Text',
          multiline: true,
        }),
      },
    }),
    colors: singleton({
      label: 'Colors',
      path: 'src/content/colors',
      format: { data: 'yaml' },
      schema: {
        palette: siteColorsField(),
      },
    }),
    iconLibrary: singleton({
      label: 'Icon library',
      path: 'src/content/icon-library',
      format: { data: 'yaml' },
      schema: {
        catalog: iconLibraryField(),
      },
    }),
  },
  collections: {
    media: collection({
      label: 'Media Library',
      slugField: 'title',
      path: 'src/content/media/*/',
      format: { data: 'yaml' },
      columns: ['file', 'title', 'category'],
      schema: mediaCollectionSchema,
    }),
    pages: collection({
      label: 'Pages',
      slugField: 'title', // folder name derived from title field
      path: 'src/content/pages/*/', // one folder per page
      format: { data: 'yaml' },
      previewUrl: '/{slug}',
      columns: ['title'],
      schema: {
        title: fields.slug({ name: { label: 'Page Title' } }),
        ...seoFields, // spread shared SEO field definitions
        blocks: contentBlocks,
      },
    }),
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*/',
      format: { data: 'yaml' },
      previewUrl: '/blog/{slug}',
      columns: ['title', 'publishedDate'],
      schema: {
        title: fields.slug({ name: { label: 'Post Title' } }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: true },
        }),
        publishedDate: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        featuredImage: mediaField(
          'Featured Image',
          'Shown on the blog index and post header.',
        ),
        ...seoFields,
        blocks: contentBlocks,
      },
    }),
  },
});
