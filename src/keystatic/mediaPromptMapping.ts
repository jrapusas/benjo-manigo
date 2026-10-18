/** Rules for 1:1 media_prompt ↔ image/icon pairing in block content. */

export const BLOCK_LEVEL_MEDIA_BLOCKS = new Set([
  'hero',
  'imageText',
  'cta',
  'video',
]);

export const ITEM_MEDIA_BLOCKS: Record<
  string,
  { arrayKey: string; mediaKey: 'image' | 'icon' }
> = {
  featureGrid: { arrayKey: 'features', mediaKey: 'icon' },
  testimonials: { arrayKey: 'testimonials', mediaKey: 'image' },
  team: { arrayKey: 'members', mediaKey: 'image' },
  logoGrid: { arrayKey: 'logos', mediaKey: 'image' },
  gallery: { arrayKey: 'images', mediaKey: 'image' },
};

export type MediaPromptViolation = {
  path: string;
  message: string;
};

type BlockLike = {
  discriminant?: string;
  value?: Record<string, unknown>;
};

function itemPath(blockPath: string, arrayKey: string, index: number) {
  return `${blockPath}.value.${arrayKey}[${index}]`;
}

export function collectMediaPromptViolations(
  blocks: BlockLike[],
  docPath = 'blocks',
): MediaPromptViolation[] {
  const violations: MediaPromptViolation[] = [];

  for (const [blockIndex, block] of blocks.entries()) {
    const discriminant = block.discriminant;
    const value = block.value;
    const blockPath = `${docPath}[${blockIndex}]${discriminant ? ` (${discriminant})` : ''}`;

    if (!discriminant || !value || typeof value !== 'object') continue;

    const itemRule = ITEM_MEDIA_BLOCKS[discriminant];
    const allowsBlockLevel = BLOCK_LEVEL_MEDIA_BLOCKS.has(discriminant);

    if (value.media_prompt && !allowsBlockLevel) {
      violations.push({
        path: blockPath,
        message:
          'Block-level media_prompt is not paired with a single image or icon - use per-item prompts only.',
      });
    }

    if (itemRule) {
      const items = value[itemRule.arrayKey];
      if (!Array.isArray(items)) continue;

      for (const [index, item] of items.entries()) {
        if (!item || typeof item !== 'object') continue;
        const record = item as Record<string, unknown>;
        const itemPathLabel = itemPath(blockPath, itemRule.arrayKey, index);

        if (record.media_prompt && !record[itemRule.mediaKey]) {
          violations.push({
            path: itemPathLabel,
            message: `media_prompt exists without a paired ${itemRule.mediaKey} field.`,
          });
        }
      }
    }

    if (allowsBlockLevel && value.media_prompt && !value.image) {
      violations.push({
        path: blockPath,
        message: 'Block-level media_prompt exists without a paired image field.',
      });
    }
  }

  return violations;
}
