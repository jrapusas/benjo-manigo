import { fields } from '@keystatic/core';
import { mediaFileField } from './fields/mediaFile';
import { mediaRelationshipField } from './fields/mediaRelationshipField';

export const MEDIA_COLLECTION = 'media';

export const mediaCollectionSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  alt: fields.text({
    label: 'Alt text',
    description: 'Describe the image for screen readers and SEO.',
  }),
  category: fields.select({
    label: 'Category',
    options: [
      { label: 'Photo', value: 'photo' },
      { label: 'Logo', value: 'logo' },
      { label: 'Open graph', value: 'og' },
    ],
    defaultValue: 'photo',
    description: 'Photos and client logos only — UI icons are in Icon library.',
  }),
  file: mediaFileField(),
};

/** Pick an asset from the Media Library. */
export function mediaField(label = 'Image', description?: string) {
  return mediaRelationshipField(
    label,
    description ?? 'Choose from the Media Library.',
  );
}
