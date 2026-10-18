// Keystatic block schemas - each factory returns fields.object(...) for the CMS editor.
import { fields } from '@keystatic/core';
import { blockItemLabel, heroBlockItemLabel } from './blockItemLabels';
import { colorIntentFields } from './appearanceFields';
import {
  buttonField,
  iconMediaSlot,
  imageMediaSlot,
  optionalButtonField,
  richTextField,
} from './fields';

type SectionStyleDefaults = Parameters<typeof colorIntentFields>[0];

function sectionStyle(defaults?: SectionStyleDefaults) {
  return colorIntentFields(defaults);
}

function gridSliderVariantField(defaultValue: 'grid' | 'slider' = 'grid') {
  return fields.select({
    label: 'Variant',
    options: [
      { label: 'Grid', value: 'grid' },
      { label: 'Slider', value: 'slider' },
    ],
    defaultValue,
  });
}

function galleryVariantField(defaultValue: 'grid' | 'slider' | 'splitImageBleedHalf' = 'grid') {
  return fields.select({
    label: 'Variant',
    options: [
      { label: 'Grid', value: 'grid' },
      { label: 'Slider', value: 'slider' },
      {
        label: 'Split - Image full bleed half (per painting)',
        value: 'splitImageBleedHalf',
      },
    ],
    defaultValue,
  });
}

export type HeroDefaults = {
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?:
    | 'splitImageContained'
    | 'splitImageBleedHalf'
    | 'splitTextBleed'
    | 'centered'
    | 'imageBg';
  primaryCta?: { label?: string; url?: string };
  secondaryCta?: { label?: string; url?: string };
};

export function heroSchema(defaults: HeroDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'soft' }),
    eyebrow: fields.text({ label: 'Eyebrow', defaultValue: defaults.eyebrow }),
    title: fields.text({
      label: 'Title',
      defaultValue: defaults.title,
      validation: { isRequired: true },
    }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    primaryCta: optionalButtonField('Primary Button (optional)', defaults.primaryCta),
    secondaryCta: optionalButtonField('Secondary Button (optional)', defaults.secondaryCta),
    ...imageMediaSlot(
      'Hero Image',
      'Hero media prompt',
      'Subject, mood, and crop for the hero photo (e.g. portrait 3:4 or half-bleed).',
    ),
    variant: fields.select({
      label: 'Variant',
      options: [
        { label: 'Split - Image contained', value: 'splitImageContained' },
        { label: 'Split - Image full bleed half', value: 'splitImageBleedHalf' },
        { label: 'Split - Text full bleed', value: 'splitTextBleed' },
        { label: 'Centered', value: 'centered' },
        { label: 'Image background', value: 'imageBg' },
      ],
      defaultValue: defaults.variant ?? 'splitImageContained',
    }),
  });
}

export type RichTextDefaults = { contentSlug?: string };

export function richTextSchema(_defaults: RichTextDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    content: richTextField('Content'),
  });
}

export type ImageTextDefaults = {
  title?: string;
  imagePosition?: 'left' | 'right';
  variant?: 'default' | 'fullBleed';
  cta?: { label?: string; url?: string };
};

export function imageTextSchema(defaults: ImageTextDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    title: fields.text({ label: 'Title', defaultValue: defaults.title }),
    content: richTextField('Content'),
    ...imageMediaSlot(
      'Image',
      'Image media prompt',
      'Photo beside the copy — 4:3 frame; full painting shown (no crop).',
      'Works best near 4:3; other ratios letterbox inside the mat.',
    ),
    imagePosition: fields.select({
      label: 'Image Position',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      defaultValue: defaults.imagePosition ?? 'left',
    }),
    cta: optionalButtonField('Call to Action (optional)', defaults.cta),
    variant: fields.select({
      label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Full bleed', value: 'fullBleed' },
      ],
      defaultValue: defaults.variant ?? 'default',
    }),
  });
}

export type HeadingBlockDefaults = { heading?: string; description?: string };

export function featureGridSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    layout: fields.select({
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ],
      defaultValue: 'grid',
    }),
    features: fields.array(
      fields.object({
        ...iconMediaSlot(),
        title: fields.text({
          label: 'Title',
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
        link: optionalButtonField('Link (optional)'),
      }),
      {
        label: 'Features',
        itemLabel: (props) => props.fields.title.value,
      },
    ),
  });
}

export function testimonialsSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'contrast' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    variant: gridSliderVariantField(),
    testimonials: fields.array(
      fields.object({
        quote: fields.text({
          label: 'Quote',
          multiline: true,
        }),
        person: fields.text({
          label: 'Name',
        }),
        role: fields.text({ label: 'Role' }),
        company: fields.text({ label: 'Company' }),
        ...imageMediaSlot(
          'Photo',
          'Photo media prompt',
          'Professional headshot for this testimonial.',
        ),
      }),
      {
        label: 'Testimonials',
        itemLabel: (props) => props.fields.person.value,
      },
    ),
  });
}

export function accordionSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    questions: fields.array(
      fields.object({
        ...iconMediaSlot(),
        question: fields.text({
          label: 'Question',
        }),
        answer: richTextField('Answer'),
      }),
      {
        label: 'Questions',
        itemLabel: (props) => props.fields.question.value,
      },
    ),
  });
}

export type CtaDefaults = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  note?: string;
  variant?: 'default' | 'compact' | 'imageBackground' | 'newsletter';
  image?: string;
  button?: { label?: string; url?: string };
};

export function ctaSchema(defaults: CtaDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'accent' }),
    eyebrow: fields.text({ label: 'Eyebrow', defaultValue: defaults.eyebrow }),
    heading: fields.text({
      label: 'Heading',
      defaultValue: defaults.heading,
    }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    button: buttonField('Button', defaults.button),
    note: fields.text({
      label: 'Fine Print',
      multiline: true,
      description: 'Shown below the button on newsletter-style CTAs.',
      defaultValue: defaults.note,
    }),
    ...imageMediaSlot(
      'Background Image',
      'Background media prompt',
      'Wide, low-busy background that keeps CTA text readable (16:9).',
      'Full-bleed photo behind the copy. Used with the Image background variant.',
    ),
    variant: fields.select({
      label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Compact', value: 'compact' },
        { label: 'Image background', value: 'imageBackground' },
        { label: 'Newsletter signup', value: 'newsletter' },
      ],
      defaultValue: defaults.variant ?? 'default',
    }),
  });
}

export function logoGridSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'soft' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    variant: gridSliderVariantField(),
    logos: fields.array(
      fields.object({
        ...imageMediaSlot(
          'Logo',
          'Logo media prompt',
          'Client or partner logo mark on a clear background.',
        ),
        name: fields.text({
          label: 'Company Name',
        }),
        url: fields.text({ label: 'Link (optional)' }),
      }),
      {
        label: 'Logos',
        itemLabel: (props) => props.fields.name.value,
      },
    ),
    disclosure: fields.text({
      label: 'Disclosure note',
      multiline: true,
      description: 'Shown below the logo grid - use for fictional specimen marks.',
    }),
  });
}

export function pricingSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    plans: fields.array(
      fields.object({
        name: fields.text({
          label: 'Plan Name',
        }),
        price: fields.text({
          label: 'Price',
        }),
        period: fields.text({ label: 'Billing Period' }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
        features: fields.array(
          fields.object({
            ...iconMediaSlot(),
            text: fields.text({ label: 'Feature' }),
          }),
          {
            label: 'Features',
            itemLabel: (props) => props.fields.text.value || 'Feature',
          },
        ),
        button: buttonField('Button'),
        highlighted: fields.checkbox({ label: 'Highlight this plan' }),
      }),
      {
        label: 'Plans',
        itemLabel: (props) => props.fields.name.value,
      },
    ),
  });
}

export function teamSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    members: fields.array(
      fields.object({
        name: fields.text({
          label: 'Name',
        }),
        role: fields.text({
          label: 'Role',
        }),
        bio: fields.text({
          label: 'Bio',
          multiline: true,
        }),
        ...imageMediaSlot(
          'Photo',
          'Photo media prompt',
          'Professional team headshot.',
        ),
      }),
      {
        label: 'Team Members',
        itemLabel: (props) => props.fields.name.value,
      },
    ),
  });
}

export function statsSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'accent' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    stats: fields.array(
      fields.object({
        ...iconMediaSlot(),
        value: fields.text({
          label: 'Value',
        }),
        label: fields.text({
          label: 'Label',
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
      }),
      {
        label: 'Statistics',
        itemLabel: (props) => props.fields.label.value,
      },
    ),
  });
}

const PAINTING_MASONRY_SCOPE_OPTIONS = [
  { label: 'All paintings (gallery folders)', value: 'all' },
  { label: 'Portraits', value: 'portraits' },
  { label: 'Landscapes', value: 'landscapes' },
  { label: 'Seascapes', value: 'seascapes' },
  { label: 'Floral', value: 'floral' },
  { label: 'Still life', value: 'still-life' },
  { label: 'Animals', value: 'animals' },
  { label: 'Christian', value: 'christian' },
  { label: 'Rural life', value: 'rural-life' },
] as const;

export function paintingMasonrySchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'default' }),
    heading: fields.text({
      label: 'Heading',
      defaultValue: defaults.heading ?? 'All paintings',
    }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    scope: fields.select({
      label: 'Which paintings',
      options: [...PAINTING_MASONRY_SCOPE_OPTIONS],
      defaultValue: 'all',
    }),
  });
}

export function gallerySchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    variant: galleryVariantField(),
    images: fields.array(
      fields.object({
        ...imageMediaSlot(
          'Image',
          'Image media prompt',
          'Individual photo for this gallery slot (4:3 crop).',
        ),
        caption: fields.text({ label: 'Caption' }),
      }),
      {
        label: 'Images',
        itemLabel: (props) => props.fields.caption.value || 'Image',
      },
    ),
  });
}

export type VideoDefaults = {
  heading?: string;
  description?: string;
  url?: string;
  image?: string;
};

export function videoSchema(defaults: VideoDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'soft' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    ...imageMediaSlot(
      'Poster Image',
      'Poster media prompt',
      'Video cover frame - 16:9, clear focal area for a play button.',
      'Cover image shown before play. Falls back to the video platform thumbnail when empty.',
    ),
    url: fields.text({
      label: 'Video URL (YouTube or Vimeo)',
      defaultValue:
        defaults.url ?? 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    }),
  });
}

export type ContactDetailsDefaults = {
  heading?: string;
  description?: string;
  email?: string;
  emailIcon?: string;
  phone?: string;
  phoneIcon?: string;
  address?: string;
  addressIcon?: string;
  embedUrl?: string;
  button?: { label?: string; url?: string };
};

export function contactDetailsSchema(defaults: ContactDetailsDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'soft' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    ...iconMediaSlot('Email Icon'),
    email: fields.text({ label: 'Email', defaultValue: defaults.email }),
    ...iconMediaSlot('Phone Icon'),
    phone: fields.text({ label: 'Phone', defaultValue: defaults.phone }),
    ...iconMediaSlot('Address Icon'),
    address: fields.text({
      label: 'Address',
      multiline: true,
      defaultValue: defaults.address,
    }),
    embedUrl: fields.text({
      label: 'Map Embed URL',
      description: 'Paste an embed URL from Google Maps (Share → Embed a map).',
      defaultValue: defaults.embedUrl,
    }),
    button: optionalButtonField('Call to Action (optional)', defaults.button),
  });
}

export function relatedPostsSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'soft' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    variant: gridSliderVariantField(),
    posts: fields.array(
      fields.relationship({
        label: 'Post',
        collection: 'posts',
      }),
      {
        label: 'Posts',
        itemLabel: (props) => props.value || 'Select a post',
      },
    ),
  });
}

export function timelineSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle({ appearance: 'soft' }),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    events: fields.array(
      fields.object({
        ...iconMediaSlot(),
        date: fields.text({
          label: 'Date or Period',
        }),
        title: fields.text({
          label: 'Title',
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
      }),
      {
        label: 'Events',
        itemLabel: (props) => props.fields.title.value,
      },
    ),
  });
}

export function processStepsSchema(defaults: HeadingBlockDefaults = {}) {
  return fields.object({
    ...sectionStyle(),
    heading: fields.text({ label: 'Heading', defaultValue: defaults.heading }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      defaultValue: defaults.description,
    }),
    variant: gridSliderVariantField(),
    steps: fields.array(
      fields.object({
        ...iconMediaSlot(),
        title: fields.text({
          label: 'Step Title',
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
      }),
      {
        label: 'Steps',
        itemLabel: (props) => props.fields.title.value,
      },
    ),
  });
}

export const baseBlockSchemas = {
  hero: {
    label: 'Hero',
    schema: heroSchema(),
    itemLabel: heroBlockItemLabel('Hero'),
  },
  richText: {
    label: 'Rich Text',
    schema: richTextSchema(),
    itemLabel: blockItemLabel('Rich Text'),
  },
  imageText: {
    label: 'Image + Text',
    schema: imageTextSchema(),
    itemLabel: blockItemLabel('Image + Text', 'title'),
  },
  featureGrid: {
    label: 'Feature Grid',
    schema: featureGridSchema(),
    itemLabel: blockItemLabel('Feature Grid'),
  },
  testimonials: {
    label: 'Testimonials',
    schema: testimonialsSchema(),
    itemLabel: blockItemLabel('Testimonials'),
  },
  accordion: {
    label: 'Accordion',
    schema: accordionSchema(),
    itemLabel: blockItemLabel('Accordion'),
  },
  cta: {
    label: 'Call to Action',
    schema: ctaSchema(),
    itemLabel: blockItemLabel('Call to Action'),
  },
  logoGrid: {
    label: 'Logo Grid',
    schema: logoGridSchema(),
    itemLabel: blockItemLabel('Logo Grid'),
  },
  pricing: {
    label: 'Pricing',
    schema: pricingSchema(),
    itemLabel: blockItemLabel('Pricing'),
  },
  team: {
    label: 'Team',
    schema: teamSchema(),
    itemLabel: blockItemLabel('Team'),
  },
  stats: {
    label: 'Stats',
    schema: statsSchema(),
    itemLabel: blockItemLabel('Stats'),
  },
  gallery: {
    label: 'Gallery',
    schema: gallerySchema(),
    itemLabel: blockItemLabel('Gallery'),
  },
  paintingMasonry: {
    label: 'Painting masonry',
    schema: paintingMasonrySchema(),
    itemLabel: blockItemLabel('Painting masonry'),
  },
  video: {
    label: 'Video',
    schema: videoSchema(),
    itemLabel: blockItemLabel('Video'),
  },
  contactDetails: {
    label: 'Contact Details',
    schema: contactDetailsSchema(),
    itemLabel: blockItemLabel('Contact Details'),
  },
  relatedPosts: {
    label: 'Related Posts',
    schema: relatedPostsSchema(),
    itemLabel: blockItemLabel('Related Posts'),
  },
  timeline: {
    label: 'Timeline',
    schema: timelineSchema(),
    itemLabel: blockItemLabel('Timeline'),
  },
  processSteps: {
    label: 'Process Steps',
    schema: processStepsSchema(),
    itemLabel: blockItemLabel('Process Steps'),
  },
} as const;
