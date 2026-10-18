// Canonical list of base block IDs - `as const` makes this a readonly tuple of literal strings.
export const BASE_BLOCK_IDS = [
  'hero',
  'richText',
  'imageText',
  'featureGrid',
  'testimonials',
  'accordion',
  'cta',
  'logoGrid',
  'pricing',
  'team',
  'stats',
  'gallery',
  'paintingMasonry',
  'video',
  'contactDetails',
  'relatedPosts',
  'timeline',
  'processSteps',
] as const;

// (typeof BASE_BLOCK_IDS)[number] - union of all array element types
export type BaseBlockId = (typeof BASE_BLOCK_IDS)[number];
