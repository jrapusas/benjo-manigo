#!/usr/bin/env node
/**
 * Regenerate IMAGE-BRIEF.md from live content media_prompt fields.
 * Usage: npm run content:image-brief
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'IMAGE-BRIEF.md');

function routeFromPageSlug(slug) {
  if (slug === 'home') return '/';
  return `/${slug}`;
}

function resolveContentFile(slug, metaFile) {
  const extPriority = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const dir = path.join(ROOT, 'src/content/media', slug);
  if (metaFile && !metaFile.startsWith('/') && !metaFile.startsWith('http')) {
    const direct = path.join(dir, metaFile.replace(/^\.\//, ''));
    if (fs.existsSync(direct)) return direct;
  }
  for (const ext of extPriority) {
    const canonical = path.join(dir, `file${ext}`);
    if (fs.existsSync(canonical)) return canonical;
  }
  return null;
}

function mediaStatus(slug) {
  const yamlPath = path.join(ROOT, 'src/content/media', slug, 'index.yaml');
  if (!fs.existsSync(yamlPath)) {
    return { cms: false, file: false, category: slug.startsWith('icon-') ? 'icon' : 'photo' };
  }
  const meta = parse(fs.readFileSync(yamlPath, 'utf8'));
  const file = resolveContentFile(slug, meta.file);
  return {
    cms: true,
    file: Boolean(file),
    category: meta.category || (slug.startsWith('icon-') ? 'icon' : 'photo'),
  };
}

function blockLabel(obj, blockType) {
  if (obj.title) return obj.title;
  if (obj.heading) return obj.heading;
  if (obj.caption) return obj.caption;
  if (obj.question) return obj.question;
  if (blockType === 'hero') return 'Hero';
  if (blockType === 'cta') return 'CTA background';
  return blockType || 'Image';
}

function walk(node, ctx, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, ctx, out));
    return;
  }

  const next = { ...ctx };
  if (node.discriminant) next.blockType = node.discriminant;
  if (node.value && typeof node.value === 'object') {
    walk(node.value, { ...next, blockType: node.discriminant || next.blockType }, out);
    return;
  }

  const slug = node.image || node.icon;
  const prompt = node.media_prompt;
  if (prompt && slug) {
    const isIcon = Boolean(node.icon) || slug.startsWith('icon-');
    out.push({
      route: ctx.route,
      pageTitle: ctx.pageTitle,
      blockType: ctx.blockType || 'block',
      label: blockLabel(node, ctx.blockType),
      slug,
      prompt: prompt.trim(),
      kind: isIcon ? 'icon' : 'photo',
    });
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'media_prompt') continue;
    walk(value, next, out);
  }
}

function collectContent() {
  const results = [];
  const sources = [
    { dir: path.join(ROOT, 'src/content/pages'), type: 'page' },
    { dir: path.join(ROOT, 'src/content/posts'), type: 'post' },
  ];

  for (const { dir, type } of sources) {
    if (!fs.existsSync(dir)) continue;
    for (const slug of fs.readdirSync(dir)) {
      const file = path.join(dir, slug, 'index.yaml');
      if (!fs.existsSync(file)) continue;
      const data = parse(fs.readFileSync(file, 'utf8'));
      const route = type === 'post' ? `/blog/${slug}` : routeFromPageSlug(slug);
      walk(data, { route, pageTitle: data.title, pageSlug: slug }, results);
    }
  }
  return results;
}

function slotType(blockType, kind) {
  if (kind === 'icon') return 'Icon';
  if (blockType === 'hero') return 'Hero';
  if (blockType === 'cta') return 'CTA background';
  if (blockType === 'gallery') return 'Gallery';
  if (blockType === 'imageText') return 'Image + text';
  if (blockType === 'team') return 'Team portrait';
  return blockType || 'Photo';
}

function statusTag(slug, kind) {
  const s = mediaStatus(slug);
  if (!s.cms) return '(**no CMS entry**)';
  if (!s.file) return kind === 'icon' ? '(**missing SVG file**)' : '(**missing image file**)';
  return '(exists)';
}

function render() {
  const rows = collectContent();
  const photos = rows.filter((r) => r.kind === 'photo');
  const icons = rows.filter((r) => r.kind === 'icon');
  const photoSlugs = [...new Set(photos.map((p) => p.slug))];
  const iconSlugs = [...new Set(icons.map((p) => p.slug))];
  const missingFiles = photoSlugs.filter((s) => !mediaStatus(s).file);
  const routes = [...new Set(photos.map((p) => p.route))].sort();

  const slugCounts = {};
  for (const row of photos) {
    slugCounts[row.slug] = (slugCounts[row.slug] || 0) + 1;
  }
  const slugReuse = Object.entries(slugCounts).sort((a, b) => b[1] - a[1]);

  const iconUsage = {};
  for (const row of icons) {
    (iconUsage[row.slug] ||= { prompt: row.prompt, routes: new Set() }).routes.add(row.route);
  }

  let md = `# Image production brief

Generated from live content \`media_prompt\` fields in \`src/content/\`. Regenerate with \`npm run content:image-brief\`.

## Summary

- **Photo slots:** ${photos.length} across ${routes.length} pages/posts
- **Distinct photo slugs:** ${photoSlugs.length} (${missingFiles.length} missing image files on disk)
- **Icon slugs:** ${iconSlugs.length} unique (${icons.length} placements)
- **Reuse ratio:** ${photoSlugs.length ? `${photos.length} placements ÷ ${photoSlugs.length} files ≈ ${Math.round(photos.length / photoSlugs.length)}× average reuse per slug` : 'n/a'}

### Photo slug usage

| Slug | Placements |
|------|------------|
${slugReuse.map(([slug, count]) => `| \`${slug}\` | ${count} |`).join('\n')}

`;

  if (missingFiles.length) {
    md += `## Missing photo files

`;
    for (const slug of missingFiles.sort()) {
      const placements = photos.filter((p) => p.slug === slug);
      md += `### \`${slug}\`

- **Used on:** ${[...new Set(placements.map((p) => p.route))].join(', ')}
- **Prompt (first):** ${placements[0]?.prompt}

`;
    }
  }

  md += `## Photos by page

`;

  const byRoute = {};
  for (const row of photos) {
    (byRoute[row.route] ||= []).push(row);
  }

  for (const route of Object.keys(byRoute).sort()) {
    md += `### \`${route}\`\n\n`;
    byRoute[route].forEach((row, i) => {
      const type = slotType(row.blockType, row.kind);
      md += `${i + 1}. **${type}** - ${row.label}\n`;
      md += `   - **Slug:** \`${row.slug}\` ${statusTag(row.slug, row.kind)}\n`;
      md += `   - **Prompt:** ${row.prompt}\n\n`;
    });
  }

  md += `## Icon library

Icons live at \`src/content/media/{slug}/file.svg\`. Seed placeholders: \`npm run content:seed-icons\`.

`;

  for (const slug of Object.keys(iconUsage).sort()) {
    const { prompt, routes: usedRoutes } = iconUsage[slug];
    const cms = mediaStatus(slug).file ? 'exists' : 'missing SVG file';
    md += `### \`${slug}\` (${cms})\n\n`;
    md += `- **Used on:** ${[...usedRoutes].sort().join(', ')}\n`;
    md += `- **Prompt:** ${prompt}\n\n`;
  }

  fs.writeFileSync(OUT, md);
  console.log(`Wrote ${OUT}`);
  console.log(`Photos: ${photos.length}, icons: ${icons.length}, missing files: ${missingFiles.length}`);
}

render();
