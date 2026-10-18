#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generateColorThemesCss } from '../src/lib/color/generate.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'src/styles/color-themes.css');

writeFileSync(outPath, generateColorThemesCss(), 'utf8');
console.log(`Wrote ${outPath}`);
