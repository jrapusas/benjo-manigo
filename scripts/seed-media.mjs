#!/usr/bin/env node
/**
 * Build Media Library entries from slugs used in content.
 * Raster assets live at src/content/media/{slug}/file.{ext}.
 * Icons use Tabler SVG (no file on disk until seeded).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(root, 'src/content');
const mediaRoot = path.join(contentRoot, 'media');
const mediaImagesDir = mediaRoot;

const SLUG_ALIASES = {
  'operations-jpg': 'icon-operations',
};

const EXT_PRIORITY = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

function walkYamlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'media') continue;
      files.push(...walkYamlFiles(full));
    } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
      files.push(full);
    }
  }
  return files;
}

function collectSlugsFromContent() {
  const slugs = new Set();
  const fieldRe = /(?:image|icon|featuredImage):\s*([a-z0-9-]+)/g;

  for (const file of walkYamlFiles(contentRoot)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(fieldRe)) {
      slugs.add(match[1]);
    }
  }

  return [...slugs].sort();
}

function resolveSlugFile(slug) {
  const candidates = [slug];
  if (SLUG_ALIASES[slug]) candidates.unshift(SLUG_ALIASES[slug]);

  for (const name of candidates) {
    for (const ext of EXT_PRIORITY) {
      const canonical = path.join(mediaImagesDir, name, `file${ext}`);
      if (fs.existsSync(canonical)) {
        return `file${ext}`;
      }
    }

    // Legacy flat or named paths - still discoverable, reported as canonical URL
    for (const ext of EXT_PRIORITY) {
      const flat = path.join(mediaImagesDir, `${name}${ext}`);
      if (fs.existsSync(flat)) {
        return `file${ext}`;
      }
      const named = path.join(mediaImagesDir, name, `${name}${ext}`);
      if (fs.existsSync(named)) {
        return `file${ext}`;
      }
    }
  }

  return null;
}

function humanize(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function categoryForSlug(slug, filePath) {
  if (filePath.endsWith('.svg') && slug.includes('og')) return 'og';
  if (slug.startsWith('icon-') || slug.startsWith('logo-')) return 'icon';
  return 'photo';
}

function fixContentAliases() {
  for (const file of walkYamlFiles(contentRoot)) {
    let text = fs.readFileSync(file, 'utf8');
    const next = text.replaceAll('operations-jpg', 'icon-operations');
    if (next !== text) fs.writeFileSync(file, next);
  }
}

function rebuildMediaLibrary(slugs) {
  fs.mkdirSync(mediaRoot, { recursive: true });

  const missing = [];

  for (const slug of slugs) {
    if (slug.startsWith('icon-') || slug.startsWith('logo-')) {
      const dir = path.join(mediaRoot, slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'index.yaml'),
        yaml.stringify({
          title: humanize(slug),
          alt: humanize(slug),
          category: 'icon',
        }),
      );
      continue;
    }

    const file = resolveSlugFile(slug);
    if (!file) {
      missing.push(slug);
      continue;
    }

    const dir = path.join(mediaRoot, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'index.yaml'),
      yaml.stringify({
        title: humanize(slug),
        file,
        alt: humanize(slug),
        category: categoryForSlug(slug, file),
      }),
    );
  }

  return missing;
}

fixContentAliases();
const slugs = collectSlugsFromContent();
const missing = rebuildMediaLibrary(slugs);

console.log(`Media Library: ${slugs.length - missing.length} entries.`);
if (missing.length) {
  console.warn('Missing files for slugs:', missing.join(', '));
}
