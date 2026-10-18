#!/usr/bin/env node
/**
 * Add contextual media_prompt values to blocks that use images or icons.
 * Run after schema changes: node scripts/add-media-prompts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BRAND_IMPORT =
  'Philippine import regulatory consultancy - professional B2B, documentation and compliance focus';

const BRAND_ADVISORY =
  'professional services advisory firm - calm B2B tone, partner-level consultation, not generic stock';

const ICON_STYLE =
  'Tabler icon style: 24×24 outline, stroke via currentColor. Must read clearly at 48px. No literal government agency logos or wordmarks.';

/** Icon slug → metaphor brief (matches src/lib/tablerIcons.ts). */
const ICON_BY_SLUG = {
  'icon-import-assessment': 'magnifying glass - reviewing and identifying applicable import requirements',
  'icon-technical-documentation': 'document with text lines - technical files and supporting documentation',
  'icon-import-permits': 'shield with checkmark - approved permits and clearances',
  'icon-product-registration': 'verified diploma or ID card - product registration and licensing',
  'icon-application-support': 'clipboard with list - preparing and processing agency applications',
  'icon-document-review': 'clipboard with checkmark - reviewing documents for gaps before import',
  'icon-checklist': 'checklist - structured documentation requirements',
  'icon-regulatory-agencies': 'group of people - multiple Philippine regulatory agencies',
  'icon-requirements-vary': 'branching paths - requirements that differ by product type',
  'icon-da-sps': 'leaf or sprout - sanitary and phytosanitary agricultural products',
  'icon-fpa': 'test tube - fertilizer, pesticide, and agricultural chemical regulation',
  'icon-fertilizers': 'crop or plant - fertilizer products and registrations',
  'icon-pesticides': 'bug - pest-control and pesticide products',
  'icon-other-regulated': 'stacked documents - additional regulated product categories',
  'icon-philippine-importers': 'city skyline - local Philippine importing businesses',
  'icon-foreign-manufacturers': 'globe - international manufacturers and exporters',
  'icon-distributors': 'delivery vehicle - distribution and trading companies',
  'icon-new-importers': 'route or path - businesses starting their first import journey',
  'icon-customs-brokers': 'tagged suitcase - customs brokers and logistics partners',
  'icon-strategy': 'target or crosshair - strategic focus and prioritization',
  'icon-operations': 'stacked layers - operations, systems, and delivery',
  'icon-growth': 'upward trend graph - growth, pipeline, and momentum',
  'icon-change': 'circular refresh arrows - change management and iteration',
};

/** Feature title (lowercase) → icon metaphor when slug is absent or unmapped. */
const ICON_BY_TITLE = {
  'import requirement assessment': ICON_BY_SLUG['icon-import-assessment'],
  'technical documentation': ICON_BY_SLUG['icon-technical-documentation'],
  'import permits & clearances': ICON_BY_SLUG['icon-import-permits'],
  'product registration & licensing': ICON_BY_SLUG['icon-product-registration'],
  'regulatory application support': ICON_BY_SLUG['icon-application-support'],
  'pre-import document review': ICON_BY_SLUG['icon-document-review'],
  'da / sps': ICON_BY_SLUG['icon-da-sps'],
  'da / sps overview': ICON_BY_SLUG['icon-da-sps'],
  'fpa': ICON_BY_SLUG['icon-fpa'],
  'fpa requirements overview': ICON_BY_SLUG['icon-fpa'],
  fertilizers: ICON_BY_SLUG['icon-fertilizers'],
  pesticides: ICON_BY_SLUG['icon-pesticides'],
  'other regulated products': ICON_BY_SLUG['icon-other-regulated'],
  'philippine importers': ICON_BY_SLUG['icon-philippine-importers'],
  'foreign manufacturers & exporters': ICON_BY_SLUG['icon-foreign-manufacturers'],
  'distributors & trading companies': ICON_BY_SLUG['icon-distributors'],
  'new importers': ICON_BY_SLUG['icon-new-importers'],
  'customs brokers & logistics providers': ICON_BY_SLUG['icon-customs-brokers'],
  'getting started with import requirements': ICON_BY_SLUG['icon-import-assessment'],
  'understanding regulatory agencies': ICON_BY_SLUG['icon-regulatory-agencies'],
  'general import documentation checklist': ICON_BY_SLUG['icon-checklist'],
  'product assessment information checklist': ICON_BY_SLUG['icon-document-review'],
  'why import requirements vary by product': ICON_BY_SLUG['icon-requirements-vary'],
  'working with your customs broker': ICON_BY_SLUG['icon-customs-brokers'],
  'senior client work': ICON_BY_SLUG['icon-strategy'],
  'hybrid flexibility': 'home or location pin - flexible hybrid delivery',
  'growing practice': ICON_BY_SLUG['icon-growth'],
  'clear culture': 'checkmark in circle - clarity, honesty, and follow-through',
};

const PHOTO_HINTS = [
  {
    match: /document|paperwork|file|checklist|submission/i,
    hint: 'organized technical documents, specification sheets, and labeled folders on a desk',
  },
  {
    match: /product|assessment|import|sample/i,
    hint: 'product sample alongside specification documents during a requirements review',
  },
  {
    match: /consultation|tell us|request|meeting/i,
    hint: 'consultant and client reviewing product details in a professional meeting',
  },
  {
    match: /strateg|quarterly|alignment|facilitat/i,
    hint: 'facilitated strategy workshop with whiteboard, notebooks, and a small group',
  },
  {
    match: /clarity before|workshop/i,
    hint: 'calm working session mapping requirements before applications',
  },
  {
    match: /team|collaboration|support/i,
    hint: 'small professional team collaborating over regulatory files',
  },
  {
    match: /regulatory|compliance|permit|clearance|registration/i,
    hint: 'regulatory documentation organized and ready for review',
  },
  {
    match: /agricultural|sps|sanitary|phytosanitary|crop/i,
    hint: 'agricultural product documentation and compliance files, not farm scenery',
  },
  {
    match: /fertilizer|pesticide|fpa|chemical/i,
    hint: 'product registration files and technical data sheets for agricultural inputs',
  },
  {
    match: /resource|guide|reference/i,
    hint: 'reference materials and guides laid out for importer self-service review',
  },
  {
    match: /client|experience|touchpoint/i,
    hint: 'professional client conversation in a modern office setting',
  },
  {
    match: /operational|operations|workflow/i,
    hint: 'operations team reviewing workflows at a shared table',
  },
  {
    match: /career|advisor|partner/i,
    hint: 'approachable professional environment suggesting senior advisory work',
  },
];

const IMPORT_PAGE_RE =
  /^(home|about|services|how-it-works|faq|contact|resources|request-assessment|privacy-policy|terms|regulatory-areas)/;

function pageContext(slug, title, collection) {
  const importSite = collection === 'pages' && IMPORT_PAGE_RE.test(slug);
  return {
    slug,
    title: title || slug,
    collection,
    brand: importSite ? BRAND_IMPORT : BRAND_ADVISORY,
    importSite,
  };
}

function photoHint(text) {
  const subject = text || '';
  for (const { match, hint } of PHOTO_HINTS) {
    if (match.test(subject)) return hint;
  }
  return null;
}

function heroPrompt(value, ctx) {
  const subject = value.title || ctx.title;
  const variant = value.variant || 'default';
  const crop =
    variant === 'centered'
      ? 'Centered hero composition, 16:9 or 3:2, generous negative space for headline overlay.'
      : 'Crop for split hero (portrait 3:4 or half-bleed) with subject weighted to one side.';
  const scene =
    photoHint(subject) ||
    (ctx.importSite
      ? 'consultation desk, organized import documents, or product assessment'
      : 'partner workshop, client meeting, or thoughtful professional workspace');
  const avoid = ctx.importSite
    ? 'Avoid freight containers, customs gates, port cranes, or generic handshake stock.'
    : 'Avoid clichéd stock handshakes, empty glass offices, or exaggerated celebration poses.';
  return `Hero photo for "${subject}" (${ctx.slug}): ${ctx.brand}. Scene: ${scene}. ${crop} ${avoid}`;
}

function imageTextPrompt(value, ctx) {
  const subject = value.title || value.heading || ctx.title;
  const scene =
    photoHint(subject) ||
    (ctx.importSite
      ? 'regulatory review, technical files, or importer consultation'
      : 'professional consultation, working session, or advisory discussion');
  return `Side-by-side photo for "${subject}" on ${ctx.title}: ${scene}. Neutral professional tones, 4:3 aspect ratio, subject not edge-cropped, no logos or watermarks.`;
}

function ctaPrompt(value, ctx) {
  const subject = value.heading || ctx.title;
  const scene = ctx.importSite
    ? 'office, documents, or meeting space suited to an import assessment conversation'
    : 'quiet meeting room or workspace where a consultation CTA feels natural';
  return `CTA background for "${subject}": wide 16:9 scene with soft contrast - ${scene} - where light or dark overlay text stays readable. ${ctx.brand}.`;
}

function galleryItemPrompt(item, value, index, ctx) {
  const caption = item.caption?.trim();
  const heading = value.heading || 'Gallery';
  const scene = photoHint(caption) || 'regulatory documentation or consultation scene';
  if (caption) {
    return `Gallery slot (${heading}): ${caption}. Scene: ${scene}. Professional context, 4:3 crop, no logos or watermarks.`;
  }
  return `Gallery image ${index + 1} for "${heading}": ${scene}. 4:3 crop, no logos or watermarks.`;
}

function iconMetaphor(feature) {
  const icon = feature.icon?.trim();
  if (icon) {
    for (const [slug, metaphor] of Object.entries(ICON_BY_SLUG)) {
      if (icon === slug || icon.includes(slug)) return metaphor;
    }
  }
  const title = feature.title?.trim().toLowerCase();
  if (title && ICON_BY_TITLE[title]) return ICON_BY_TITLE[title];
  return 'simple professional metaphor relevant to the feature - document, process, or audience symbol';
}

function featureIconPrompt(feature, blockHeading) {
  const title = feature.title || 'Feature';
  const parent = blockHeading || 'Feature grid';
  const metaphor = iconMetaphor(feature);
  return `Icon for "${title}" in ${parent}: ${ICON_STYLE} Metaphor: ${metaphor}.`;
}

function testimonialPrompt(item) {
  const who = [item.person, item.role, item.company].filter(Boolean).join(', ');
  return `Headshot for testimonial${who ? ` - ${who}` : ''}: approachable B2B professional, neutral background, square face crop, natural light, no stock-photo exaggeration.`;
}

function teamPrompt(item) {
  return `Team photo: ${item.name || 'Team member'}${item.role ? `, ${item.role}` : ''}. Professional services headshot, square crop, neutral background, consistent style with other team portraits.`;
}

function logoPrompt(item) {
  return `Logo mark for ${item.name || 'partner'}: clear background, suitable for muted logo grid row. Replace with real client logo in production.`;
}

function videoPrompt(value, ctx) {
  const subject = value.heading || ctx.title;
  const scene = ctx.importSite
    ? 'import requirement briefing or document walkthrough'
    : 'client briefing or working session overview';
  return `Video poster for "${subject}": frame suggesting ${scene}. 16:9 with calm center area for play affordance, no embedded UI chrome.`;
}

function processBlockValue(discriminant, value, ctx) {
  if (!value || typeof value !== 'object') return;

  switch (discriminant) {
    case 'hero':
      value.media_prompt = heroPrompt(value, ctx);
      break;

    case 'imageText':
      value.media_prompt = imageTextPrompt(value, ctx);
      break;

    case 'cta':
      if (value.image || value.variant === 'imageBackground') {
        value.media_prompt = ctaPrompt(value, ctx);
      }
      break;

    case 'gallery':
      delete value.media_prompt;
      for (const [i, item] of (value.images ?? []).entries()) {
        if (item && typeof item === 'object') {
          item.media_prompt = galleryItemPrompt(item, value, i, ctx);
        }
      }
      break;

    case 'featureGrid':
      for (const feature of value.features ?? []) {
        if (feature && typeof feature === 'object') {
          feature.media_prompt = featureIconPrompt(feature, value.heading);
        }
      }
      break;

    case 'testimonials':
      for (const item of value.testimonials ?? []) {
        if (item && typeof item === 'object') {
          item.media_prompt = testimonialPrompt(item);
        }
      }
      break;

    case 'team':
      for (const member of value.members ?? []) {
        if (member && typeof member === 'object') {
          member.media_prompt = teamPrompt(member);
        }
      }
      break;

    case 'logoGrid':
      for (const logo of value.logos ?? []) {
        if (logo && typeof logo === 'object') {
          logo.media_prompt = logoPrompt(logo);
        }
      }
      break;

    case 'video':
      if (value.image || value.url) {
        value.media_prompt = videoPrompt(value, ctx);
      }
      break;

    default:
      break;
  }
}

function processDoc(doc, slug, collection) {
  const ctx = pageContext(slug, doc.title, collection);
  for (const block of doc.blocks ?? []) {
    processBlockValue(block.discriminant, block.value, ctx);
  }
  return doc;
}

function walkContent(collection) {
  const dir = path.join(ROOT, 'src/content', collection);
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  for (const slug of fs.readdirSync(dir)) {
    const indexPath = path.join(dir, slug, 'index.yaml');
    if (!fs.existsSync(indexPath)) continue;

    const doc = parse(fs.readFileSync(indexPath, 'utf8'));
    processDoc(doc, slug, collection);
    fs.writeFileSync(indexPath, `${stringify(doc, { lineWidth: 100 })}\n`);
    count += 1;
  }
  return count;
}

const pages = walkContent('pages');
const posts = walkContent('posts');
console.log(`Updated media_prompt on ${pages} pages and ${posts} posts.`);
