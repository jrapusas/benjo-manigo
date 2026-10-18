#!/usr/bin/env node
/**
 * One-time migration: move flat public/images/media assets into
 * src/content/media/{slug}/file.{ext} and normalize yaml `file` fields.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaRoot = path.join(root, 'src/content/media');
const legacyPublic = path.join(root, 'public/images/media');
const EXT_PRIORITY = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

function extFromPath(filePath) {
  return path.extname(filePath).toLowerCase();
}

function findLegacySource(slug, yamlFile) {
  if (yamlFile) {
    const trimmed = yamlFile.replace(/^\.\//, '');
    if (trimmed.startsWith('/images/media/')) {
      const flat = path.join(legacyPublic, path.basename(trimmed));
      if (fs.existsSync(flat)) return flat;
      const nested = path.join(legacyPublic, slug, path.basename(trimmed));
      if (fs.existsSync(nested)) return nested;
    }
    if (!trimmed.includes('/') && trimmed.includes('.')) {
      const inSlug = path.join(mediaRoot, slug, trimmed);
      if (fs.existsSync(inSlug)) return inSlug;
    }
  }

  for (const ext of EXT_PRIORITY) {
    const flat = path.join(legacyPublic, `${slug}${ext}`);
    if (fs.existsSync(flat)) return flat;
    const nested = path.join(legacyPublic, slug, `file${ext}`);
    if (fs.existsSync(nested)) return nested;
  }

  return null;
}

let migrated = 0;
let skipped = 0;

for (const entry of fs.readdirSync(mediaRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const slug = entry.name;
  const yamlPath = path.join(mediaRoot, slug, 'index.yaml');
  if (!fs.existsSync(yamlPath)) continue;

  const data = parse(fs.readFileSync(yamlPath, 'utf8')) ?? {};
  const source = findLegacySource(slug, typeof data.file === 'string' ? data.file : undefined);
  if (!source) {
    const existing = EXT_PRIORITY
      .map((ext) => path.join(mediaRoot, slug, `file${ext}`))
      .find((candidate) => fs.existsSync(candidate));
    if (existing) {
      data.file = `file${extFromPath(existing)}`;
      fs.writeFileSync(yamlPath, stringify(data));
      skipped++;
      continue;
    }
    console.warn(`No source file for ${slug}`);
    skipped++;
    continue;
  }

  const ext = extFromPath(source);
  const dest = path.join(mediaRoot, slug, `file${ext}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest) || fs.statSync(source).mtimeMs > fs.statSync(dest).mtimeMs) {
    fs.copyFileSync(source, dest);
  }

  data.file = `file${ext}`;
  fs.writeFileSync(yamlPath, stringify(data));
  migrated++;
}

console.log(`Migrated ${migrated} media entries (${skipped} already in content).`);
