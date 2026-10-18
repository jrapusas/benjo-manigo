import { fields } from '@keystatic/core';
import { baseBlockSchemas } from './blockSchemas';

export const contentBlocks = fields.blocks(baseBlockSchemas, {
  label: 'Content Blocks',
  validation: { length: { min: 1 } },
});
