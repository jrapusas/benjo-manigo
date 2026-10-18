// Keystatic "reader" - reads content from disk at build/dev time (not in the browser).
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// process.cwd() = project root; reader walks src/content/ using paths in keystatic.config.ts
export const reader = createReader(process.cwd(), keystaticConfig);

// typeof keystaticConfig - TypeScript trick: infer types FROM the config object
// so PageEntry, PostEntry, etc. stay in sync when you change Keystatic schemas.
export type KeystaticConfig = typeof keystaticConfig;
