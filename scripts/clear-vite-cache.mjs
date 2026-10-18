#!/usr/bin/env node
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const cacheDirs = [
  join(root, 'node_modules', '.vite'),
  join(root, '.astro'),
];

for (const dir of cacheDirs) {
  rmSync(dir, { recursive: true, force: true });
}

console.log('Cleared dev caches: node_modules/.vite, .astro/');
