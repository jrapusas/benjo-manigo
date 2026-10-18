import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { collectMediaPromptViolations } from './mediaPromptMapping';

const CONTENT_ROOT = path.resolve(import.meta.dirname, '../content');

function loadAllContentDocs() {
  const docs: { path: string; blocks: unknown[] }[] = [];

  for (const collection of ['pages', 'posts'] as const) {
    const dir = path.join(CONTENT_ROOT, collection);
    if (!fs.existsSync(dir)) continue;

    for (const slug of fs.readdirSync(dir)) {
      const indexPath = path.join(dir, slug, 'index.yaml');
      if (!fs.existsSync(indexPath)) continue;

      const doc = parse(fs.readFileSync(indexPath, 'utf8')) as {
        blocks?: unknown[];
      };
      docs.push({
        path: `src/content/${collection}/${slug}/index.yaml`,
        blocks: doc.blocks ?? [],
      });
    }
  }

  return docs;
}

describe('mediaPromptMapping', () => {
  it('flags orphan block-level gallery prompts', () => {
    const violations = collectMediaPromptViolations([
      {
        discriminant: 'gallery',
        value: {
          heading: 'Gallery',
          media_prompt: 'Set-level prompt',
          images: [{ image: 'home-main', media_prompt: 'Slot prompt' }],
        },
      },
    ]);

    expect(violations).toEqual([
      {
        path: 'blocks[0] (gallery)',
        message:
          'Block-level media_prompt is not paired with a single image or icon - use per-item prompts only.',
      },
    ]);
  });

  it('allows one block-level prompt per hero image', () => {
    const violations = collectMediaPromptViolations([
      {
        discriminant: 'hero',
        value: {
          title: 'Hero',
          image: 'home-main',
          media_prompt: 'Hero prompt',
        },
      },
    ]);

    expect(violations).toEqual([]);
  });

  it('keeps every media_prompt paired in pages and posts', () => {
    const allViolations = loadAllContentDocs().flatMap(({ path: docPath, blocks }) =>
      collectMediaPromptViolations(blocks as Parameters<typeof collectMediaPromptViolations>[0], docPath),
    );

    expect(allViolations).toEqual([]);
  });
});
