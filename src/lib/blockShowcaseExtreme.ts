import {
  docParagraph,
  docRichSampleExtreme,
  docStressAnswerExtreme,
} from './sampleDocument';
import {
  MAP_EMBED,
  mergeVariations,
  sectionStyleVariations,
  SHOWCASE_VIDEO_URL,
  SHOWCASE_VIDEO_URL_SHORT,
  sparseVariation,
  type ShowcaseSection,
} from './blockShowcaseShared';
import {
  STRESS_ADDRESS,
  STRESS_BUTTON,
  STRESS_BUTTON_SHORT,
  STRESS_COMPANY,
  STRESS_DESC,
  STRESS_DISCLOSURE,
  STRESS_EMAIL,
  STRESS_EYEBROW,
  STRESS_HEADING,
  STRESS_LINK,
  STRESS_NAME,
  STRESS_NOTE,
  STRESS_PHONE,
  STRESS_PLAN_FEATURES,
  STRESS_POST_SLUGS,
  STRESS_QUOTE,
  STRESS_ROLE,
  STRESS_SHORT,
  STRESS_TITLE,
  STRESS_UNBROKEN,
} from './stressContent';

const heroBase = {
  color: 'auto' as const,
  eyebrow: STRESS_EYEBROW,
  title: STRESS_TITLE,
  description: STRESS_DESC,
  primaryCta: { label: STRESS_BUTTON, url: '/contact' },
  secondaryCta: { label: STRESS_BUTTON_SHORT, url: '/about' },
  image: 'hero-home',
};

const imageTextBase = {
  color: 'auto' as const,
  title: STRESS_HEADING,
  content: docRichSampleExtreme(),
  image: 'about-hero',
  cta: { label: STRESS_LINK, url: '/about' },
};

const ctaBase = {
  color: 'auto' as const,
  eyebrow: STRESS_EYEBROW,
  heading: STRESS_HEADING,
  description: STRESS_DESC,
  button: { label: STRESS_BUTTON, url: '/contact' },
};

const feature = (
  title: string,
  icon?: string,
  options?: { link?: { label: string; url: string } | null; description?: string },
) => ({
  ...(icon ? { icon } : {}),
  title,
  description: options?.description ?? STRESS_SHORT,
  ...(options?.link === null
    ? {}
    : { link: options?.link ?? { label: STRESS_LINK, url: '/services' } }),
});

const { image: _heroImage, ...heroNoMedia } = heroBase;
const { image: _imageTextImage, ...imageTextNoMedia } = imageTextBase;

export const extremeShowcaseSections: ShowcaseSection[] = [
  {
    id: 'hero',
    name: 'Hero',
    variations: mergeVariations(
      sectionStyleVariations(
        'hero',
        { ...heroBase, variant: 'splitImageContained' },
        'Split - Image contained',
      ),
      sectionStyleVariations(
        'hero',
        { ...heroBase, variant: 'splitImageBleedHalf' },
        'Split - Image full bleed half',
      ),
      sectionStyleVariations(
        'hero',
        { ...heroBase, variant: 'splitTextBleed' },
        'Split - Text full bleed',
      ),
      sectionStyleVariations(
        'hero',
        { ...heroBase, variant: 'centered' },
        'Centered',
      ),
      sectionStyleVariations(
        'hero',
        { ...heroBase, variant: 'imageBg' },
        'Image background',
      ),
      sparseVariation('hero', {
        title: 'Title only',
        variant: 'splitImageContained',
      }),
      sparseVariation(
        'hero',
        { ...heroNoMedia, variant: 'splitImageContained' },
        'No media · Split - Image contained',
      ),
      sparseVariation(
        'hero',
        { ...heroNoMedia, variant: 'splitImageBleedHalf' },
        'No media · Split - Image full bleed half',
      ),
      sparseVariation(
        'hero',
        { ...heroNoMedia, variant: 'splitTextBleed' },
        'No media · Split - Text full bleed',
      ),
      sparseVariation('hero', { ...heroNoMedia, variant: 'centered' }, 'No media · Centered'),
      sparseVariation('hero', { ...heroNoMedia, variant: 'imageBg' }, 'No media · Image background'),
    ),
  },
  {
    id: 'richText',
    name: 'Rich Text',
    variations: mergeVariations(
      sectionStyleVariations('richText', { content: docRichSampleExtreme() }),
      sparseVariation('richText', { content: docParagraph('Single paragraph.') }),
    ),
  },
  {
    id: 'imageText',
    name: 'Image + Text',
    variations: mergeVariations(
      sectionStyleVariations(
        'imageText',
        { ...imageTextBase, variant: 'default', imagePosition: 'left' },
        'Default · image left',
      ),
      sectionStyleVariations(
        'imageText',
        { ...imageTextBase, variant: 'default', imagePosition: 'right' },
        'Default · image right',
      ),
      sectionStyleVariations(
        'imageText',
        { ...imageTextBase, variant: 'fullBleed', imagePosition: 'left' },
        'Full bleed · image left',
      ),
      sectionStyleVariations(
        'imageText',
        { ...imageTextBase, variant: 'fullBleed', imagePosition: 'right' },
        'Full bleed · image right',
      ),
      sparseVariation('imageText', {
        title: 'Title only',
        content: docParagraph('Body copy without a call to action.'),
        image: 'about-hero',
        variant: 'default',
        imagePosition: 'left',
      }),
      sparseVariation(
        'imageText',
        { ...imageTextNoMedia, variant: 'default', imagePosition: 'left' },
        'No media · image left',
      ),
      sparseVariation(
        'imageText',
        { ...imageTextNoMedia, variant: 'default', imagePosition: 'right' },
        'No media · image right',
      ),
    ),
  },
  {
    id: 'featureGrid',
    name: 'Feature Grid',
    variations: mergeVariations(
      sectionStyleVariations('featureGrid', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        features: [
          feature('Strategic planning & quarterly prioritization', 'strategy'),
          feature('Operational clarity for delivery teams', 'operations'),
          feature('Growth, pipeline, and referral velocity', 'growth'),
          feature('Change leadership & adoption governance', 'change'),
          feature('Client experience as a retention lever', 'retention', {
            description: STRESS_DESC,
          }),
          feature('Partner alignment & decision forums', 'alignment'),
          feature('Leadership coaching for practice heads', 'leadership'),
          feature('Metrics, dashboards, and operating cadence', 'analytics'),
          feature('Facilitated workshops & offsites', 'workshop'),
          feature('Governance, boards, and accountability', 'governance'),
          feature('Implementation roadmaps with owners', 'roadmap'),
          feature('Delivery assurance & handoff quality', 'package'),
          feature('Executive coaching & difficult conversations', 'coaching'),
          feature(STRESS_UNBROKEN, 'metrics', { link: null }),
        ],
      }),
      sparseVariation('featureGrid', {
        features: [
          feature('Feature one', 'strategy', { link: null }),
          feature('Feature two', 'operations', { link: null }),
          feature('Feature three', 'workshop', { link: null }),
          feature('Feature four', 'metrics', { link: null }),
        ],
      }),
      sparseVariation('featureGrid', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        features: [
          feature('Strategic planning & quarterly prioritization'),
          feature('Operational clarity for delivery teams'),
          feature('Growth, pipeline, and referral velocity'),
          feature(STRESS_UNBROKEN, undefined, { link: null }),
          feature('Change leadership & adoption governance'),
          feature('Client experience as a retention lever', undefined, {
            description: STRESS_DESC,
          }),
        ],
      }, 'No media'),
      sparseVariation('featureGrid', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        layout: 'list',
        features: [
          feature('Strategic planning & quarterly prioritization', 'strategy', {
            link: { label: STRESS_LINK, url: '/services' },
          }),
          feature('Operational clarity for delivery teams', 'operations', {
            link: { label: STRESS_LINK, url: '/services' },
          }),
          feature('Client experience & retention design', 'retention'),
          feature('Partner alignment & decision forums', 'alignment'),
          feature('Metrics, dashboards, and operating cadence', 'analytics'),
          feature('Facilitated workshops & offsites', 'workshop'),
          feature('Governance, boards, and accountability', 'governance'),
          feature('Implementation roadmaps with owners', 'roadmap'),
          feature(STRESS_UNBROKEN, 'metrics', {
            link: { label: STRESS_LINK, url: '/contact' },
          }),
        ],
      }, 'List layout'),
    ),
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    variations: mergeVariations(
      sectionStyleVariations('testimonials', {
        heading: STRESS_HEADING,
        testimonials: [
        {
          quote: STRESS_QUOTE,
          person: STRESS_NAME,
          role: STRESS_ROLE,
          company: STRESS_COMPANY,
          image: 'testimonial-1',
        },
        {
          quote: STRESS_QUOTE,
          person: 'Samira Khan',
          role: 'Chief Operating Officer (Interim) · Transformation',
          company: 'Harbour Finance & Legal Partners LLC',
          image: 'testimonial-2',
        },
        {
          quote: STRESS_QUOTE,
          person: 'Jordan Lee-O\'Malley',
          role: 'Practice Lead - Advisory & Delivery',
          company: 'Summit Consulting Collective',
          image: 'testimonial-3',
        },
        {
          quote: STRESS_QUOTE,
          person: 'Elena Vasquez',
          role: 'Managing Partner',
          company: STRESS_UNBROKEN,
          image: 'testimonial-2',
        },
      ],
      }),
      sparseVariation('testimonials', {
        testimonials: [
          {
            quote: 'Short quote.',
            person: 'Alex Morgan',
          },
        ],
      }),
      sparseVariation('testimonials', {
        heading: STRESS_HEADING,
        testimonials: [
          {
            quote: STRESS_QUOTE,
            person: STRESS_NAME,
            role: STRESS_ROLE,
            company: STRESS_COMPANY,
          },
          {
            quote: STRESS_QUOTE,
            person: 'Samira Khan',
            role: 'Chief Operating Officer (Interim) · Transformation',
            company: 'Harbour Finance & Legal Partners LLC',
          },
          {
            quote: STRESS_QUOTE,
            person: 'Jordan Lee-O\'Malley',
            role: 'Practice Lead - Advisory & Delivery',
            company: 'Summit Consulting Collective',
          },
        ],
      }, 'No media'),
      sectionStyleVariations(
        'testimonials',
        {
          heading: STRESS_HEADING,
          variant: 'slider',
          testimonials: [
            {
              quote: STRESS_QUOTE,
              person: STRESS_NAME,
              role: STRESS_ROLE,
              company: STRESS_COMPANY,
              image: 'testimonial-1',
            },
            {
              quote: STRESS_QUOTE,
              person: 'Samira Khan',
              role: 'Chief Operating Officer (Interim) · Transformation',
              company: 'Harbour Finance & Legal Partners LLC',
              image: 'testimonial-2',
            },
            {
              quote: STRESS_QUOTE,
              person: 'Jordan Lee-O\'Malley',
              role: 'Practice Lead - Advisory & Delivery',
              company: 'Summit Consulting Collective',
              image: 'testimonial-3',
            },
            {
              quote: STRESS_QUOTE,
              person: 'Elena Vasquez',
              role: 'Managing Partner',
              company: STRESS_UNBROKEN,
              image: 'testimonial-2',
            },
            {
              quote: STRESS_QUOTE,
              person: 'Chris Park-O\'Neill',
              role: 'Founding Partner · Strategy & Operations',
              company: 'Eastgate Advisory Partners International',
              image: 'testimonial-3',
            },
            {
              quote: STRESS_QUOTE,
              person: 'Priya Nair',
              role: 'Head of Operations & Client Delivery',
              company: 'Coastal Legal Group Pty Ltd',
              image: 'testimonial-1',
            },
          ],
        },
        'Slider',
      ),
    ),
  },
  {
    id: 'accordion',
    name: 'Accordion',
    variations: mergeVariations(
      sectionStyleVariations('accordion', {
        heading: STRESS_HEADING,
        questions: [
        {
          question: `Who is this advisory work for - ${STRESS_UNBROKEN}?`,
          answer: docStressAnswerExtreme(
            'Professional services firms between 20 and 200 people where partners are still close to delivery and every quarter feels like a fire drill.',
          ),
        },
        {
          question: 'How long does a typical engagement run when scope includes multiple practice groups?',
          answer: docStressAnswerExtreme(
            'Most projects run 8–12 weeks with optional quarterly check-ins afterward, plus async support between working sessions.',
          ),
        },
        {
          question: 'Do you work remotely across multiple regions and overlapping time zones?',
          answer: docStressAnswerExtreme(
            'Yes. We blend remote working sessions with on-site workshops when helpful, including hybrid partner offsites.',
          ),
        },
        {
          question: 'What does onboarding look like for firms with 3+ office locations?',
          answer: docStressAnswerExtreme(
            'A short discovery phase aligns stakeholders before deeper diagnostic work begins, with explicit decision rights mapped upfront.',
          ),
        },
        {
          question: 'Can you stress-test pricing, packaging, and partner compensation models?',
          answer: docStressAnswerExtreme(
            'We routinely facilitate pricing strategy sessions that connect positioning, delivery cost, and partner incentives.',
          ),
        },
        {
          question: 'What happens after the engagement ends - gypqj descenders?',
          answer: docStressAnswerExtreme(
            'Optional quarterly reviews keep priorities honest; most clients re-engage within a year for the next planning cycle.',
          ),
        },
      ],
      }),
      sparseVariation('accordion', {
        questions: [
          {
            question: 'Single question?',
            answer: docParagraph('Short answer.'),
          },
        ],
      }),
    ),
  },
  {
    id: 'cta',
    name: 'Call to Action',
    variations: mergeVariations(
      sectionStyleVariations(
        'cta',
        { ...ctaBase, variant: 'imageBackground', image: 'about-hero' },
        'Image background',
      ),
      sparseVariation(
        'cta',
        { ...ctaBase, variant: 'imageBackground' },
        'No media · Image background',
      ),
      sectionStyleVariations('cta', { ...ctaBase, variant: 'default' }, 'Default'),
      sectionStyleVariations(
        'cta',
        { ...ctaBase, variant: 'compact', eyebrow: '' },
        'Compact',
      ),
      sectionStyleVariations(
        'cta',
        {
          heading: STRESS_HEADING,
          description: STRESS_DESC,
          button: {
            label: STRESS_BUTTON,
            url: `mailto:${STRESS_EMAIL}?subject=Newsletter%20stress%20test`,
          },
          note: STRESS_NOTE,
          variant: 'newsletter',
        },
        'Newsletter signup',
      ),
      sparseVariation('cta', {
        heading: 'Heading and button only',
        button: { label: 'Action', url: '/contact' },
        variant: 'default',
      }),
    ),
  },
  {
    id: 'logoGrid',
    name: 'Logo Grid',
    variations: mergeVariations(
      sectionStyleVariations('logoGrid', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        disclosure: STRESS_DISCLOSURE,
        logos: [
        {
          name: 'Mitchell Legal Group & International Holdings Pty Ltd',
          image: 'logo-client-1',
          url: 'https://example.com/mitchell-legal-extraordinarily-long-path',
        },
        {
          name: 'Northbridge Advisory Partners International',
          image: 'logo-client-2',
          url: 'https://example.com/northbridge',
        },
        {
          name: STRESS_UNBROKEN,
          image: 'logo-client-3',
        },
        {
          name: 'Harbour Finance & Legal Partners LLC',
          image: 'logo-client-4',
          url: 'https://example.com/harbour-finance',
        },
        {
          name: 'Vasquez Consulting Group LLC',
          image: 'logo-client-1',
          url: 'https://example.com/vasquez',
        },
        {
          name: 'Summit Consulting Collective · Chicago',
          image: 'logo-client-2',
        },
      ],
      }),
      sparseVariation('logoGrid', {
        logos: [
          { name: 'Client A', image: 'logo-client-1' },
          { name: 'Client B', image: 'logo-client-2' },
        ],
      }),
      sparseVariation('logoGrid', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        disclosure: STRESS_DISCLOSURE,
        logos: [
          {
            name: 'Mitchell Legal Group & International Holdings Pty Ltd',
            url: 'https://example.com/mitchell-legal-extraordinarily-long-path',
          },
          {
            name: 'Northbridge Advisory Partners International',
            url: 'https://example.com/northbridge',
          },
          { name: STRESS_UNBROKEN },
          {
            name: 'Harbour Finance & Legal Partners LLC',
            url: 'https://example.com/harbour-finance',
          },
        ],
      }, 'No media'),
      sectionStyleVariations(
        'logoGrid',
        {
          heading: STRESS_HEADING,
          description: STRESS_DESC,
          disclosure: STRESS_DISCLOSURE,
          variant: 'slider',
          logos: [
            {
              name: 'Mitchell Legal Group & International Holdings Pty Ltd',
              image: 'logo-client-1',
              url: 'https://example.com/mitchell-legal-extraordinarily-long-path',
            },
            {
              name: 'Northbridge Advisory Partners International',
              image: 'logo-client-2',
              url: 'https://example.com/northbridge',
            },
            {
              name: STRESS_UNBROKEN,
              image: 'logo-client-3',
            },
            {
              name: 'Harbour Finance & Legal Partners LLC',
              image: 'logo-client-4',
              url: 'https://example.com/harbour-finance',
            },
            {
              name: 'Vasquez Consulting Group LLC',
              image: 'logo-client-1',
              url: 'https://example.com/vasquez',
            },
            {
              name: 'Summit Consulting Collective · Chicago',
              image: 'logo-client-2',
            },
            {
              name: 'Eastgate Advisory Partners International',
              image: 'logo-client-3',
              url: 'https://example.com/eastgate',
            },
            {
              name: 'Coastal Legal Group Pty Ltd',
              image: 'logo-client-4',
            },
          ],
        },
        'Slider',
      ),
    ),
  },
  {
    id: 'pricing',
    name: 'Pricing',
    variations: mergeVariations(
      sectionStyleVariations('pricing', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        plans: [
        {
          name: 'Starter · Diagnostic',
          price: '$4,500',
          period: 'project · one-time',
          description: STRESS_SHORT,
          features: STRESS_PLAN_FEATURES.slice(0, 4),
          button: { label: STRESS_BUTTON, url: '/contact' },
          highlighted: false,
        },
        {
          name: 'Growth · Advisory',
          price: '$9,500',
          period: 'quarter · recurring',
          description: STRESS_DESC,
          features: STRESS_PLAN_FEATURES,
          button: { label: STRESS_BUTTON, url: '/contact' },
          highlighted: true,
        },
        {
          name: 'Enterprise · Multi-workstream',
          price: 'Custom',
          period: 'year · annual agreement',
          description: STRESS_DESC,
          features: STRESS_PLAN_FEATURES,
          button: { label: STRESS_BUTTON, url: '/contact' },
          highlighted: false,
        },
        {
          name: STRESS_UNBROKEN,
          price: '$1,234,567.89',
          period: 'stress-test',
          description: STRESS_SHORT,
          features: STRESS_PLAN_FEATURES.slice(0, 6),
          button: { label: STRESS_LINK, url: '/contact' },
          highlighted: false,
        },
      ],
      }),
      sparseVariation('pricing', {
        plans: [
          {
            name: 'Basic',
            price: '$0',
            button: { label: 'Start', url: '/contact' },
            highlighted: false,
          },
        ],
      }),
    ),
  },
  {
    id: 'team',
    name: 'Team',
    variations: mergeVariations(
      sectionStyleVariations('team', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        members: [
        {
          name: STRESS_NAME,
          role: STRESS_ROLE,
          bio: STRESS_DESC,
          image: 'team-1',
        },
        {
          name: 'Samira Khan',
          role: 'Operations Lead · Workflow & Delivery Design',
          bio: STRESS_DESC,
          image: 'team-2',
        },
        {
          name: 'Alex Morgan III',
          role: 'Client Experience · Retention & Referrals',
          bio: STRESS_SHORT,
          image: 'team-3',
        },
        {
          name: 'Elena Vasquez',
          role: 'Change Lead · Stakeholder Mapping',
          bio: STRESS_DESC,
          image: 'team-2',
        },
        {
          name: 'Jordan Lee-O\'Malley',
          role: 'Principal Advisor · Strategy',
          bio: STRESS_DESC,
          image: 'team-1',
        },
        {
          name: STRESS_UNBROKEN,
          role: 'Fictional Specimen Role for Layout Stress Testing',
          bio: STRESS_DESC,
          image: 'team-3',
        },
      ],
      }),
      sparseVariation('team', {
        members: [{ name: 'Alex Morgan', role: 'Advisor' }],
      }),
      sparseVariation('team', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        members: [
          {
            name: STRESS_NAME,
            role: STRESS_ROLE,
            bio: STRESS_DESC,
          },
          {
            name: 'Samira Khan',
            role: 'Operations Lead · Workflow & Delivery Design',
            bio: STRESS_DESC,
          },
          {
            name: 'Alex Morgan III',
            role: 'Client Experience · Retention & Referrals',
            bio: STRESS_SHORT,
          },
          {
            name: STRESS_UNBROKEN,
            role: 'Fictional Specimen Role for Layout Stress Testing',
            bio: STRESS_DESC,
          },
        ],
      }, 'No media'),
    ),
  },
  {
    id: 'stats',
    name: 'Stats',
    variations: mergeVariations(
      sectionStyleVariations('stats', {
        heading: STRESS_HEADING,
        stats: [
        {
          value: '1,234,567.89',
          label: 'Workshops facilitated annually across practices',
          description: STRESS_SHORT,
        },
        {
          value: '94.7%',
          label: 'Partner teams aligned on quarterly priorities',
          description: STRESS_SHORT,
        },
        {
          value: '6 wks',
          label: 'Average cycle kickoff → measurable impact',
          description: STRESS_DESC,
        },
        {
          value: '∞',
          label: STRESS_UNBROKEN,
          description: STRESS_SHORT,
        },
        {
          value: 'Q4 FY24–25',
          label: 'Planning cadence with gypqj descenders',
          description: STRESS_SHORT,
        },
        {
          value: '$42k/mo',
          label: 'Pipeline velocity (stress numerals)',
          description: STRESS_DESC,
        },
      ],
      }),
      sparseVariation('stats', {
        stats: [{ value: '42', label: 'Stat label' }],
      }),
    ),
  },
  {
    id: 'gallery',
    name: 'Gallery',
    variations: mergeVariations(
      sectionStyleVariations('gallery', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        images: [
        { image: 'gallery-1', caption: `Workshop session - ${STRESS_SHORT}` },
        { image: 'gallery-2', caption: `Partner alignment offsite · ${STRESS_UNBROKEN}` },
        { image: 'gallery-3', caption: STRESS_DESC },
        { image: 'team-collaboration' },
        { image: 'gallery-1', caption: 'Duplicate image to stress grid rhythm' },
        { image: 'gallery-2', caption: 'gypqj descender caption stress test' },
      ],
      }),
      sparseVariation('gallery', {
        images: [{ image: 'gallery-1' }, { image: 'gallery-2' }],
      }),
      sparseVariation('gallery', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        images: [],
      }, 'No media'),
      sectionStyleVariations(
        'gallery',
        {
          heading: STRESS_HEADING,
          description: STRESS_DESC,
          variant: 'slider',
          images: [
            { image: 'gallery-1', caption: `Workshop session - ${STRESS_SHORT}` },
            { image: 'gallery-2', caption: `Partner alignment offsite · ${STRESS_UNBROKEN}` },
            { image: 'gallery-3', caption: STRESS_DESC },
            { image: 'team-collaboration', caption: STRESS_SHORT },
            { image: 'planning-workshop', caption: 'Quarterly planning workshop' },
            { image: 'partner-alignment', caption: `Partner alignment · ${STRESS_SHORT}` },
            { image: 'quarterly-planning', caption: STRESS_DESC },
            { image: 'gallery-1', caption: 'Duplicate image to stress slider rhythm' },
            { image: 'gallery-2', caption: 'gypqj descender caption stress test' },
          ],
        },
        'Slider',
      ),
    ),
  },
  {
    id: 'video',
    name: 'Video',
    variations: mergeVariations(
      sectionStyleVariations('video', {
        heading: STRESS_HEADING,
        description: `${STRESS_DESC} Supports standard watch URLs converted to embeds at build time.`,
        image: 'planning-workshop',
        url: SHOWCASE_VIDEO_URL,
      }),
      sparseVariation('video', {
        url: SHOWCASE_VIDEO_URL_SHORT,
      }),
    ),
  },
  {
    id: 'contactDetails',
    name: 'Contact Details',
    variations: mergeVariations(
      sectionStyleVariations('contactDetails', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        email: STRESS_EMAIL,
        phone: STRESS_PHONE,
        address: STRESS_ADDRESS,
        button: { label: STRESS_BUTTON, url: `mailto:${STRESS_EMAIL}` },
      }),
      sparseVariation('contactDetails', { heading: 'Contact heading only' }),
      sparseVariation(
        'contactDetails',
        {
          heading: STRESS_HEADING,
          description: STRESS_DESC,
          email: STRESS_EMAIL,
          phone: STRESS_PHONE,
          address: STRESS_ADDRESS,
          embedUrl: MAP_EMBED,
          button: { label: STRESS_BUTTON, url: `mailto:${STRESS_EMAIL}` },
        },
        'With map',
      ),
    ),
  },
  {
    id: 'relatedPosts',
    name: 'Related Posts',
    variations: mergeVariations(
      sectionStyleVariations('relatedPosts', {
        heading: STRESS_HEADING,
        posts: [...STRESS_POST_SLUGS],
      }),
      sparseVariation('relatedPosts', {
        posts: [STRESS_POST_SLUGS[0]],
      }),
      sectionStyleVariations(
        'relatedPosts',
        {
          heading: STRESS_HEADING,
          variant: 'slider',
          posts: [...STRESS_POST_SLUGS],
        },
        'Slider',
      ),
    ),
  },
  {
    id: 'timeline',
    name: 'Timeline',
    variations: mergeVariations(
      sectionStyleVariations('timeline', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        events: [
        {
          date: '2014 · Q1',
          title: 'Founded in Sydney with an extraordinarily long milestone title',
          description: STRESS_DESC,
        },
        {
          date: '2017–2019',
          title: STRESS_UNBROKEN,
          description: STRESS_SHORT,
        },
        {
          date: '2019',
          title: 'Expanded nationally across Australia & New Zealand',
          description: STRESS_DESC,
        },
        {
          date: '2022',
          title: '100+ partner teams on a trusted quarterly cadence',
          description: STRESS_SHORT,
        },
        {
          date: '2024',
          title: '200+ workshops delivered · gypqj descenders',
          description: STRESS_DESC,
        },
        {
          date: 'Q4 FY2024–25',
          title: 'National delivery across overlapping time zones',
          description: STRESS_DESC,
        },
      ],
      }),
      sparseVariation('timeline', {
        events: [{ date: '2024', title: 'Milestone title' }],
      }),
    ),
  },
  {
    id: 'processSteps',
    name: 'Process Steps',
    variations: mergeVariations(
      sectionStyleVariations('processSteps', {
        heading: STRESS_HEADING,
        description: STRESS_DESC,
        steps: [
        {
          title: 'Discover · goals, constraints, stakeholders',
          description: STRESS_DESC,
        },
        {
          title: 'Diagnose · friction, priorities, quick wins',
          description: STRESS_SHORT,
        },
        {
          title: STRESS_UNBROKEN,
          description: STRESS_DESC,
        },
        {
          title: 'Design · owners, timelines, success measures',
          description: STRESS_DESC,
        },
        {
          title: 'Deliver · working sessions & decision reviews',
          description: STRESS_SHORT,
        },
        {
          title: 'Sustain · quarterly check-ins & adoption',
          description: STRESS_DESC,
        },
      ],
      }),
      sparseVariation('processSteps', {
        steps: [{ title: 'Step one', description: 'Short step copy.' }],
      }),
      sectionStyleVariations(
        'processSteps',
        {
          heading: STRESS_HEADING,
          description: STRESS_DESC,
          variant: 'slider',
          steps: [
            {
              title: 'Discover · goals, constraints, stakeholders',
              description: STRESS_DESC,
            },
            {
              title: 'Diagnose · friction, priorities, quick wins',
              description: STRESS_SHORT,
            },
            {
              title: STRESS_UNBROKEN,
              description: STRESS_DESC,
            },
            {
              title: 'Design · owners, timelines, success measures',
              description: STRESS_DESC,
            },
            {
              title: 'Deliver · working sessions & decision reviews',
              description: STRESS_SHORT,
            },
            {
              title: 'Sustain · quarterly check-ins & adoption',
              description: STRESS_DESC,
            },
            {
              title: 'Scale · extend practices across additional groups',
              description: STRESS_SHORT,
            },
            {
              title: 'Govern · decision rights, metrics, and partner forums',
              description: STRESS_DESC,
            },
          ],
        },
        'Slider',
      ),
    ),
  },
];
