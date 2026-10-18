// Reusable Keystatic field builders - keeps keystatic.config.ts and blockSchemas DRY.

import { fields } from '@keystatic/core';
import { iconField } from './fields/iconField';
import { mediaField } from './media';

export { mediaField };

// Higher-order function: returns a configured fields.object for button label + URL
export const buttonField = (
  label = 'Button',
  defaults?: { label?: string; url?: string },
) =>
  fields.object(
    {
      label: fields.text({
        label: 'Button Label',
        defaultValue: defaults?.label,
        validation: { isRequired: true },
      }),
      url: fields.text({
        label: 'Button URL',
        defaultValue: defaults?.url,
        validation: { isRequired: true },
      }),
    },
    { label },
  );

export const optionalButtonField = (
  label = 'Button (optional)',
  defaults?: { label?: string; url?: string },
) =>
  fields.object(
    {
      label: fields.text({ label: 'Button Label', defaultValue: defaults?.label }),
      url: fields.text({ label: 'Button URL', defaultValue: defaults?.url }),
    },
    { label },
  );

/** Brief for AI or client photo shoots - not rendered on the public site. */
export const mediaPromptField = (
  label = 'Media prompt',
  description = 'Describe the ideal photo or icon for this slot.',
) =>
  fields.text({
    label,
    multiline: true,
    description,
  });

/** One image field paired with its media_prompt - keeps slots 1:1 in the CMS. */
export const imageMediaSlot = (
  imageLabel: string,
  promptLabel = 'Media prompt',
  promptDescription = 'Describe the ideal photo or icon for this slot.',
  imageDescription?: string,
) => ({
  image: mediaField(imageLabel, imageDescription),
  media_prompt: mediaPromptField(promptLabel, promptDescription),
});

/** One icon/image field paired with its media_prompt - for feature cards and similar. */
export const iconMediaSlot = (
  iconLabel = 'Icon',
  promptLabel = 'Icon note (optional)',
  promptDescription = 'Internal note about this icon choice — not shown on the site.',
) => ({
  icon: iconField(iconLabel),
  media_prompt: mediaPromptField(promptLabel, promptDescription),
});

export const richTextField = (label: string) =>
  fields.document({
    label,
    formatting: true,
    dividers: true,
    links: true,
    images: {
      directory: 'public/images/media',
      publicPath: '/images/media/',
    },
  });

// Spread into collection schemas - adds the same SEO inputs to pages and posts
export const seoFields = {
  seoTitle: fields.text({ label: 'SEO Title' }),
  metaDescription: fields.text({
    label: 'Meta Description',
    multiline: true,
  }),
  canonicalUrl: fields.text({ label: 'Canonical URL' }),
  ogTitle: fields.text({ label: 'Open Graph Title' }),
  ogDescription: fields.text({
    label: 'Open Graph Description',
    multiline: true,
  }),
  ogImage: mediaField('Open Graph Image', 'Choose a 1200×630 image from the Media Library.'),
};
