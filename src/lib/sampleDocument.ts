import { STRESS_DESC, STRESS_HEADING, STRESS_UNBROKEN } from './stressContent';

type TextNode = { text: string; bold?: boolean; italic?: boolean };
type BlockNode = { type: string; children: Array<TextNode | BlockNode>; [key: string]: unknown };

export type SampleDocument = BlockNode[];

export function docParagraph(text: string): SampleDocument {
  return [{ type: 'paragraph', children: [{ text }] }];
}

/** Rich WYSIWYG sample - headings, emphasis, lists of paragraphs. */
export function docRichSample(): SampleDocument {
  return [
    {
      type: 'heading',
      level: 2,
      children: [{ text: 'Sample rich text block' }],
    },
    {
      type: 'paragraph',
      children: [
        { text: 'Use this block for long-form copy, links, and ' },
        { text: 'inline emphasis', bold: true },
        {
          text: ' between other sections. Paragraphs should read naturally at a comfortable line length.',
        },
      ],
    },
    {
      type: 'heading',
      level: 3,
      children: [{ text: 'Secondary heading level' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Add headings, blockquotes, tables, and images from the CMS editor. This second paragraph ensures multiple blocks render with consistent ',
        },
        { text: 'italic treatment', italic: true },
        { text: ' where supported.' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Closing paragraph with enough copy to confirm spacing before the next section on the page.',
        },
      ],
    },
  ];
}

/** FAQ / image-text answer with nested heading. */
export function docStressAnswer(intro: string): SampleDocument {
  return [
    { type: 'paragraph', children: [{ text: intro }] },
    {
      type: 'paragraph',
      children: [
        { text: 'Supporting detail with ' },
        { text: 'bold emphasis', bold: true },
        { text: ' and enough length to wrap in the accordion or prose column.' },
      ],
    },
    { type: 'heading', level: 3, children: [{ text: 'What happens next' }] },
    {
      type: 'paragraph',
      children: [
        {
          text: 'A follow-up paragraph confirms nested headings inside answers remain readable on every background tone.',
        },
      ],
    },
  ];
}

/** Extreme rich text for /blocks-extreme. */
export function docRichSampleExtreme(): SampleDocument {
  return [
    {
      type: 'heading',
      level: 2,
      children: [{ text: `${STRESS_HEADING} - H2 with gypqj descenders` }],
    },
    {
      type: 'paragraph',
      children: [{ text: STRESS_DESC }],
    },
    {
      type: 'heading',
      level: 3,
      children: [{ text: `Nested H3: ${STRESS_UNBROKEN}` }],
    },
    {
      type: 'paragraph',
      children: [
        { text: 'Inline ' },
        { text: 'bold emphasis', bold: true },
        { text: ' beside ' },
        { text: 'italic treatment', italic: true },
        {
          text: ' and a closing run long enough to confirm wrapping, hyphenation, and rhythm across default, soft, tinted, contrast, dark, and accent section bands.',
        },
      ],
    },
    {
      type: 'heading',
      level: 2,
      children: [{ text: 'Second H2 - numerals, symbols, and punctuation mixed in one block' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Paragraph three repeats density: $1,234,567.89 · 94.7% · Q4 FY2024–25 · → ← ↑ ↓ · enough copy to force multiple line breaks before the next section on the page.',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [{ text: STRESS_DESC }],
    },
  ];
}

/** Extreme FAQ answer for /blocks-extreme. */
export function docStressAnswerExtreme(intro: string): SampleDocument {
  return [
    { type: 'paragraph', children: [{ text: intro }] },
    {
      type: 'paragraph',
      children: [{ text: STRESS_DESC }],
    },
    {
      type: 'heading',
      level: 3,
      children: [{ text: `What happens next - ${STRESS_UNBROKEN}` }],
    },
    {
      type: 'paragraph',
      children: [
        { text: 'A follow-up paragraph with bold ' },
        { text: 'and italic', italic: true },
        {
          text: ' spans confirms nested headings inside accordion answers remain readable on every background tone, including tight mobile widths.',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [{ text: STRESS_DESC }],
    },
  ];
}
