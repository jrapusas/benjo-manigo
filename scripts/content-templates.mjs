#!/usr/bin/env node
/**
 * Copy a committed page/post folder as a starting point for new content.
 *
 * apply-template  pages|posts <newSlug> <templateId>
 * list-templates
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES_DIR = path.join(ROOT, 'src/keystatic');

const PAGE_TEMPLATES = JSON.parse(
  fs.readFileSync(path.join(TEMPLATES_DIR, 'page-template-catalog.json'), 'utf8'),
);

function contentDir(collection, slug) {
  return path.join(ROOT, 'src/content', collection, slug);
}

function humanize(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function applyTemplate(collection, newSlug, templateId) {
  const template = PAGE_TEMPLATES[templateId];
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  if (template.collection !== collection) {
    throw new Error(`Template ${templateId} belongs to ${template.collection}, not ${collection}`);
  }

  const sourceDir = contentDir(collection, template.source);
  const targetDir = contentDir(collection, newSlug);
  if (!fs.existsSync(sourceDir)) throw new Error(`Source not found: ${sourceDir}`);
  if (fs.existsSync(targetDir)) throw new Error(`Target already exists: ${targetDir}`);

  copyDir(sourceDir, targetDir);

  const indexPath = path.join(targetDir, 'index.yaml');
  const doc = parse(fs.readFileSync(indexPath, 'utf8'));
  doc.title = humanize(newSlug);
  if (collection === 'pages') {
    doc.seoTitle = doc.seoTitle?.replace(template.source, newSlug) ?? `${newSlug}`;
  }
  fs.writeFileSync(indexPath, stringify(doc));

  console.log(`Created ${collection}/${newSlug} from template "${templateId}"`);
}

function listTemplates() {
  for (const template of Object.values(PAGE_TEMPLATES)) {
    console.log(`${template.id}  [${template.collection}]  from ${template.source}`);
  }
}

const [command, ...args] = process.argv.slice(2);

try {
  switch (command) {
    case 'apply-template': {
      const [collection, newSlug, templateId] = args;
      if (!collection || !newSlug || !templateId) {
        throw new Error('Usage: apply-template pages|posts <newSlug> <templateId>');
      }
      applyTemplate(collection, newSlug, templateId);
      break;
    }
    case 'list-templates':
      listTemplates();
      break;
    default:
      console.log(`Usage:
  node scripts/content-templates.mjs apply-template pages|posts <newSlug> <templateId>
  node scripts/content-templates.mjs list-templates`);
      process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
