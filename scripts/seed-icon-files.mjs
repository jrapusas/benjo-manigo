#!/usr/bin/env node
/** Write Tabler SVG files for icon media entries and sync yaml `file` paths. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import { tablerIconSvgForPreview } from '../src/lib/tablerIcons.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaRoot = path.join(root, 'src/content/media');

const iconDirs = fs
  .readdirSync(mediaRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('icon-'))
  .map((entry) => entry.name)
  .sort();

let written = 0;
let skipped = 0;

for (const slug of iconDirs) {
  const svg = tablerIconSvgForPreview(slug, { size: 24, preserveCurrentColor: true });
  if (!svg) {
    console.warn(`No Tabler icon mapped for ${slug}`);
    skipped++;
    continue;
  }

  const assetDir = path.join(mediaRoot, slug);
  const assetPath = path.join(assetDir, 'file.svg');
  fs.mkdirSync(assetDir, { recursive: true });
  fs.writeFileSync(assetPath, svg);

  const yamlPath = path.join(mediaRoot, slug, 'index.yaml');
  const fileUrl = 'file.svg';
  let data = {};

  try {
    data = parse(fs.readFileSync(yamlPath, 'utf8')) ?? {};
  } catch {
    data = { title: slug, alt: slug, category: 'icon' };
  }

  data.file = fileUrl;
  if (!data.category) data.category = 'icon';

  fs.writeFileSync(yamlPath, stringify(data));
  written++;
}

console.log(`Icon files: ${written} written, ${skipped} skipped.`);
