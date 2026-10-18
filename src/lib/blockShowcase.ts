import { docRichSample, docStressAnswer } from './sampleDocument';
import {
  MAP_EMBED,
  mergeVariations,
  sectionDefaultVariation,
  SHOWCASE_ADDRESS,
  SHOWCASE_VIDEO_URL,
  type ShowcaseSection,
  type ShowcaseVariationFn,
} from './blockShowcaseShared';

const SAMPLE_DESC =
  'Supporting copy at a realistic length for previews. Enough words to confirm line height and wrapping without overwhelming the layout.';

const SAMPLE_SHORT = 'Short supporting line for cards and list rows.';

const heroBase = {
  color: 'auto' as const,
  eyebrow: 'Eyebrow',
  title: 'Hero block headline with enough length to wrap on smaller viewports',
  description: SAMPLE_DESC,
  primaryCta: { label: 'Primary action', url: '/contact' },
  secondaryCta: { label: 'Secondary action', url: '/about' },
  image: 'hero-home',
};

const imageTextBase = {
  color: 'auto' as const,
  title: 'Image + text block with full field coverage',
  content: docRichSample(),
  image: 'about-hero',
  cta: { label: 'Learn more', url: '/about' },
};

const ctaBase = {
  color: 'auto' as const,
  eyebrow: 'Call to action',
  heading: 'Ready to start? Heading stresses contrast on every section color.',
  description: SAMPLE_DESC,
  button: { label: 'Get in touch', url: '/contact' },
};

const feature = (
  title: string,
  icon: string,
  options?: { link?: { label: string; url: string } | null; description?: string },
) => ({
  icon,
  title,
  description: options?.description ?? SAMPLE_SHORT,
  ...(options?.link === null
    ? {}
    : { link: options?.link ?? { label: 'Learn more', url: '/services' } }),
});

export type { ShowcaseSection } from './blockShowcaseShared';

export function buildShowcaseSections(
  vary: ShowcaseVariationFn,
): ShowcaseSection[] {
  return [
  {
    id: 'hero',
    name: 'Hero',
    variations: mergeVariations(
      vary(
        'hero',
        { ...heroBase, variant: 'splitImageContained' },
        'Split - Image contained',
      ),
      vary(
        'hero',
        { ...heroBase, variant: 'splitImageBleedHalf' },
        'Split - Image full bleed half',
      ),
      vary(
        'hero',
        { ...heroBase, variant: 'splitTextBleed' },
        'Split - Text full bleed',
      ),
      vary(
        'hero',
        { ...heroBase, variant: 'centered' },
        'Centered',
      ),
      vary(
        'hero',
        { ...heroBase, variant: 'imageBg' },
        'Image background',
      ),
    ),
  },
  {
    id: 'richText',
    name: 'Rich Text',
    variations: vary('richText', { content: docRichSample() }),
  },
  {
    id: 'imageText',
    name: 'Image + Text',
    variations: mergeVariations(
      vary(
        'imageText',
        { ...imageTextBase, variant: 'default', imagePosition: 'left' },
        'Default · image left',
      ),
      vary(
        'imageText',
        { ...imageTextBase, variant: 'default', imagePosition: 'right' },
        'Default · image right',
      ),
      vary(
        'imageText',
        { ...imageTextBase, variant: 'fullBleed', imagePosition: 'left' },
        'Full bleed · image left',
      ),
      vary(
        'imageText',
        { ...imageTextBase, variant: 'fullBleed', imagePosition: 'right' },
        'Full bleed · image right',
      ),
    ),
  },
  {
    id: 'featureGrid',
    name: 'Feature Grid',
    variations: mergeVariations(
      vary('featureGrid', {
        heading: 'Feature grid · all fields',
        description: SAMPLE_DESC,
        layout: 'grid',
        features: [
          feature('Strategy', 'strategy'),
          feature('Operations', 'operations'),
          feature('Growth', 'growth'),
          feature('Change leadership', 'change', { link: null }),
        ],
      }),
      vary(
        'featureGrid',
        {
          heading: 'Services list',
          description: SAMPLE_DESC,
          layout: 'list',
          features: [
            {
              title: 'Strategic planning',
              description:
                'Quarterly priorities partners can actually execute with clear owners.',
              icon: 'strategy',
              link: { label: 'View service', url: '/services' },
            },
            {
              title: 'Operational clarity',
              description: 'Map workflows and reduce delivery friction across practice groups.',
              icon: 'operations',
              link: { label: 'View service', url: '/services' },
            },
            {
              title: 'Client experience',
              description:
                'Design delivery models that improve retention without eroding margin.',
              icon: 'growth',
            },
            {
              title: 'Change leadership',
              description: 'Stakeholder engagement and adoption planning for major initiatives.',
              icon: 'change',
              link: { label: 'View service', url: '/contact' },
            },
          ],
        },
        'List',
      ),
    ),
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    variations: mergeVariations(
      vary('testimonials', {
        heading: 'What clients say',
        testimonials: [
          {
            quote:
              'Clear priorities and practical follow-through from day one. The team helped us align partners around one operating rhythm.',
            person: 'Alex Morgan',
            role: 'Managing Partner',
            company: 'Northline Advisory',
            image: 'testimonial-1',
          },
          {
            quote:
              'The team helped us align partners around one operating rhythm without adding bureaucracy.',
            person: 'Samira Khan',
            role: 'Chief Operating Officer',
            company: 'Harbor Legal',
            image: 'testimonial-2',
          },
          {
            quote:
              'We finally have a planning cadence the whole firm trusts through busy season.',
            person: 'Jordan Lee',
            role: 'Practice Lead',
            company: 'Summit Consulting',
            image: 'testimonial-3',
          },
        ],
      }),
      vary(
        'testimonials',
        {
          heading: 'What clients say',
          variant: 'slider',
          testimonials: [
            {
              quote:
                'Clear priorities and practical follow-through from day one. The team helped us align partners around one operating rhythm.',
              person: 'Alex Morgan',
              role: 'Managing Partner',
              company: 'Northline Advisory',
              image: 'testimonial-1',
            },
            {
              quote:
                'The team helped us align partners around one operating rhythm without adding bureaucracy.',
              person: 'Samira Khan',
              role: 'Chief Operating Officer',
              company: 'Harbor Legal',
              image: 'testimonial-2',
            },
            {
              quote:
                'We finally have a planning cadence the whole firm trusts through busy season.',
              person: 'Jordan Lee',
              role: 'Practice Lead',
              company: 'Summit Consulting',
              image: 'testimonial-3',
            },
            {
              quote:
                'Practical frameworks we could adopt immediately without a massive change program.',
              person: 'Elena Vasquez',
              role: 'Director',
              company: 'Meridian Partners',
              image: 'testimonial-2',
            },
            {
              quote:
                'The quarterly cadence gave our leadership team shared language for tough tradeoffs.',
              person: 'Chris Park',
              role: 'Founding Partner',
              company: 'Eastgate Advisory',
              image: 'testimonial-3',
            },
            {
              quote:
                'They met us where we were and left us with tools we still use a year later.',
              person: 'Priya Nair',
              role: 'Head of Operations',
              company: 'Coastal Legal Group',
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
    variations: vary('accordion', {
      heading: 'Frequently asked questions',
      questions: [
        {
          question: 'Who is this advisory work for?',
          answer: docStressAnswer(
            'Professional services firms between 20 and 200 people where partners are still close to delivery.',
          ),
        },
        {
          question: 'How long does a typical engagement run?',
          answer: docStressAnswer(
            'Most projects run 8–12 weeks with optional quarterly check-ins afterward.',
          ),
        },
        {
          question: 'Do you work remotely?',
          answer: docStressAnswer(
            'Yes. We blend remote working sessions with on-site workshops when helpful.',
          ),
        },
        {
          question: 'What does onboarding look like?',
          answer: docStressAnswer(
            'A short discovery phase aligns stakeholders before deeper diagnostic work begins.',
          ),
        },
      ],
    }),
  },
  {
    id: 'cta',
    name: 'Call to Action',
    variations: mergeVariations(
      vary(
        'cta',
        { ...ctaBase, variant: 'imageBackground', image: 'about-hero' },
        'Image background',
      ),
      vary('cta', { ...ctaBase, variant: 'default' }, 'Default'),
      vary(
        'cta',
        { ...ctaBase, variant: 'compact', eyebrow: '' },
        'Compact',
      ),
      vary(
        'cta',
        {
          heading: 'Stay informed',
          description: SAMPLE_DESC,
          button: {
            label: 'Join mailing list',
            url: 'mailto:hello@acmeconsulting.example.com?subject=Newsletter',
          },
          note: 'No spam. Unsubscribe any time. Monthly at most - usually less.',
          variant: 'newsletter',
        },
        'Newsletter signup',
      ),
    ),
  },
  {
    id: 'logoGrid',
    name: 'Logo Grid',
    variations: mergeVariations(
      vary('logoGrid', {
        heading: 'Trusted by growing firms',
        description: SAMPLE_DESC,
        logos: [
          {
            name: 'Mitchell Legal Group',
            image: 'logo-client-1',
            url: 'https://example.com/mitchell-legal',
          },
          {
            name: 'Northbridge Advisory',
            image: 'logo-client-2',
            url: 'https://example.com/northbridge',
          },
          {
            name: 'Vasquez & Co.',
            image: 'logo-client-3',
          },
          {
            name: 'Harbour Finance Partners',
            image: 'logo-client-4',
            url: 'https://example.com/harbour-finance',
          },
        ],
      }),
      vary(
        'logoGrid',
        {
          heading: 'Trusted by growing firms',
          description: SAMPLE_DESC,
          variant: 'slider',
          logos: [
            {
              name: 'Mitchell Legal Group',
              image: 'logo-client-1',
              url: 'https://example.com/mitchell-legal',
            },
            {
              name: 'Northbridge Advisory',
              image: 'logo-client-2',
              url: 'https://example.com/northbridge',
            },
            {
              name: 'Vasquez & Co.',
              image: 'logo-client-3',
            },
            {
              name: 'Harbour Finance Partners',
              image: 'logo-client-4',
              url: 'https://example.com/harbour-finance',
            },
            {
              name: 'Summit Consulting',
              image: 'logo-client-1',
              url: 'https://example.com/summit',
            },
            {
              name: 'Meridian Partners',
              image: 'logo-client-2',
            },
            {
              name: 'Eastgate Advisory',
              image: 'logo-client-3',
              url: 'https://example.com/eastgate',
            },
            {
              name: 'Coastal Legal Group',
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
    variations: vary('pricing', {
      heading: 'Engagement options',
      description: SAMPLE_DESC,
      plans: [
        {
          name: 'Starter',
          price: '$4,500',
          period: 'project',
          description: 'Focused diagnostic and priority map for leadership teams.',
          features: [
            'Leadership workshop',
            'Priority roadmap',
            'Summary report',
            '30-day check-in',
          ],
          button: { label: 'Choose Starter', url: '/contact' },
          highlighted: false,
        },
        {
          name: 'Growth',
          price: '$9,500',
          period: 'quarter',
          description: 'Hands-on advisory through implementation with monthly reviews.',
          features: [
            'Everything in Starter',
            'Monthly partner reviews',
            'Partner coaching',
            'Delivery support',
          ],
          button: { label: 'Choose Growth', url: '/contact' },
          highlighted: true,
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          period: 'year',
          description: 'Multi-workstream support for larger firms with complex priorities.',
          features: [
            'Dedicated advisor',
            'Quarterly offsite',
            'Custom metrics',
            'Change leadership',
          ],
          button: { label: 'Talk to us', url: '/contact' },
          highlighted: false,
        },
      ],
    }),
  },
  {
    id: 'team',
    name: 'Team',
    variations: vary('team', {
      heading: 'Leadership team',
      description: SAMPLE_DESC,
      members: [
        {
          name: 'Jordan Lee',
          role: 'Principal Advisor',
          bio: 'Former COO at a 120-person advisory firm. Leads strategy and operations engagements end to end.',
          image: 'team-1',
        },
        {
          name: 'Samira Khan',
          role: 'Operations Lead',
          bio: 'Specialises in delivery design, partner alignment, and workflow mapping for growing firms.',
          image: 'team-2',
        },
        {
          name: 'Alex Morgan',
          role: 'Client Experience',
          bio: 'Helps firms turn service quality into retention, referrals, and repeatable delivery models.',
          image: 'team-3',
        },
        {
          name: 'Elena Vasquez',
          role: 'Change Lead',
          bio: 'Guides major firm initiatives from stakeholder mapping through adoption and governance.',
          image: 'team-2',
        },
      ],
    }),
  },
  {
    id: 'stats',
    name: 'Stats',
    variations: vary('stats', {
      heading: 'By the numbers',
      stats: [
        { value: '200+', label: 'Workshops', description: 'Facilitated annually across practices' },
        { value: '40+', label: 'Partner teams', description: 'Aligned on quarterly priorities' },
        { value: '6 wks', label: 'Average cycle', description: 'Kickoff to first measurable impact' },
        { value: '94%', label: 'Retention', description: 'Clients who re-engage within a year' },
      ],
    }),
  },
  {
    id: 'gallery',
    name: 'Gallery',
    variations: mergeVariations(
      vary('gallery', {
        heading: 'Gallery',
        description: SAMPLE_DESC,
        images: [
          { image: 'gallery-1', caption: 'Workshop session with partner group' },
          { image: 'gallery-2', caption: 'Partner alignment offsite' },
          { image: 'gallery-3', caption: 'Quarterly planning review' },
          { image: 'team-collaboration' },
        ],
      }),
      vary(
        'gallery',
        {
          heading: 'Gallery',
          description: SAMPLE_DESC,
          variant: 'slider',
          images: [
            { image: 'gallery-1', caption: 'Workshop session with partner group' },
            { image: 'gallery-2', caption: 'Partner alignment offsite' },
            { image: 'gallery-3', caption: 'Quarterly planning review' },
            { image: 'team-collaboration', caption: 'Leadership team collaboration' },
            { image: 'planning-workshop', caption: 'Quarterly planning workshop' },
            { image: 'partner-alignment', caption: 'Partner alignment session' },
            { image: 'quarterly-planning', caption: 'Planning review with practice leads' },
          ],
        },
        'Slider',
      ),
    ),
  },
  {
    id: 'video',
    name: 'Video',
    variations: vary('video', {
      heading: 'Video embed',
      description: 'Supports standard watch URLs converted to embeds at build time.',
      image: 'planning-workshop',
      url: SHOWCASE_VIDEO_URL,
    }),
  },
  {
    id: 'contactDetails',
    name: 'Contact Details',
    variations: mergeVariations(
      vary('contactDetails', {
        heading: 'Contact us',
        description: SAMPLE_DESC,
        email: 'hello@acmeconsulting.example.com',
        phone: '+61 2 9000 1234',
        address: SHOWCASE_ADDRESS,
        button: { label: 'Send an email', url: 'mailto:hello@acmeconsulting.example.com' },
      }),
      vary(
        'contactDetails',
        {
          heading: 'Find us',
          description: SAMPLE_DESC,
          email: 'hello@acmeconsulting.example.com',
          phone: '+61 2 9000 1234',
          address: SHOWCASE_ADDRESS,
          embedUrl: MAP_EMBED,
          button: { label: 'Send an email', url: 'mailto:hello@acmeconsulting.example.com' },
        },
        'With map',
      ),
    ),
  },
  {
    id: 'relatedPosts',
    name: 'Related Posts',
    variations: mergeVariations(
      vary('relatedPosts', {
        heading: 'Related posts',
        posts: [
          'strategic-planning-that-sticks',
          'operational-clarity-for-growing-teams',
          'client-experience-as-a-growth-lever',
        ],
      }),
      vary(
        'relatedPosts',
        {
          heading: 'Related posts',
          variant: 'slider',
          posts: [
            'strategic-planning-that-sticks',
            'operational-clarity-for-growing-teams',
            'client-experience-as-a-growth-lever',
            'building-a-quarterly-planning-cadence',
            'partner-alignment-in-growing-firms',
            'pricing-strategy-for-advisory-firms',
          ],
        },
        'Slider',
      ),
    ),
  },
  {
    id: 'timeline',
    name: 'Timeline',
    variations: vary('timeline', {
      heading: 'Firm milestones',
      description: SAMPLE_DESC,
      events: [
        {
          date: '2014',
          title: 'Founded in Sydney',
          description: 'Started as a two-partner advisory practice focused on operational clarity.',
        },
        {
          date: '2019',
          title: 'Expanded nationally',
          description: 'Opened remote delivery for firms across Australia and New Zealand.',
        },
        {
          date: '2022',
          title: '100+ partner teams',
          description: 'Reached consistent quarterly planning cadence with mid-market clients.',
        },
        {
          date: '2024',
          title: '200+ workshops delivered',
          description: 'Scaled facilitation playbook across strategy and change engagements.',
        },
      ],
    }),
  },
  {
    id: 'processSteps',
    name: 'Process Steps',
    variations: mergeVariations(
      vary('processSteps', {
        heading: 'How we work',
        description: SAMPLE_DESC,
        steps: [
          {
            title: 'Discover',
            description:
              'Understand goals, constraints, stakeholders, and current operating reality.',
          },
          {
            title: 'Diagnose',
            description: 'Surface priorities, friction points, and quick wins with leadership input.',
          },
          {
            title: 'Design',
            description:
              'Co-create a focused plan with named owners, timelines, and success measures.',
          },
          {
            title: 'Deliver',
            description:
              'Support implementation through working sessions and monthly decision reviews.',
          },
        ],
      }),
      vary(
        'processSteps',
        {
          heading: 'How we work',
          description: SAMPLE_DESC,
          variant: 'slider',
          steps: [
            {
              title: 'Discover',
              description:
                'Understand goals, constraints, stakeholders, and current operating reality.',
            },
            {
              title: 'Diagnose',
              description:
                'Surface priorities, friction points, and quick wins with leadership input.',
            },
            {
              title: 'Design',
              description:
                'Co-create a focused plan with named owners, timelines, and success measures.',
            },
            {
              title: 'Deliver',
              description:
                'Support implementation through working sessions and monthly decision reviews.',
            },
            {
              title: 'Sustain',
              description:
                'Embed quarterly check-ins so priorities stay current after the engagement ends.',
            },
            {
              title: 'Scale',
              description:
                'Extend proven practices to additional practice groups with lighter-touch support.',
            },
          ],
        },
        'Slider',
      ),
    ),
  },
  ];
}

export const showcaseSections = buildShowcaseSections(sectionDefaultVariation);
