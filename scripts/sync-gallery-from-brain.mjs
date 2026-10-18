#!/usr/bin/env node
/**
 * Copy Benjo portfolio JPEGs from JA2B into public/images/gallery/ as WebP (max 2000px).
 */
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import sharp from 'sharp';

const CATEGORIES = [
  'portraits',
  'landscapes',
  'seascapes',
  'floral',
  'still-life',
  'animals',
  'christian',
  'rural-life',
];

function resolveBrainImagesRoot() {
  const env = process.env.BENJO_BRAIN_IMAGES_ROOT;
  if (env && fs.existsSync(env)) return env;

  const candidates = [
    path.join(
      process.cwd(),
      '.context/project/images',
    ),
    path.join(
      homedir(),
      'Documents/JoRap-AI-Second-Brain/01-Projects/benjo-manigo-website/images',
    ),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  throw new Error(
    'Benjo images folder not found. Set BENJO_BRAIN_IMAGES_ROOT or link .context/project.',
  );
}

function humanizeAlt(filename) {
  const base = path.basename(filename, path.extname(filename));
  const slug = base.replace(/^[^-]+-\d+-/, '');
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function main() {
  const sourceRoot = resolveBrainImagesRoot();
  const outRoot = path.join(process.cwd(), 'public/images/gallery');
  let count = 0;

  for (const category of CATEGORIES) {
    const srcDir = path.join(sourceRoot, category);
    if (!fs.existsSync(srcDir)) continue;

    const destDir = path.join(outRoot, category);
    fs.mkdirSync(destDir, { recursive: true });

    for (const name of fs.readdirSync(srcDir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
      const src = path.join(srcDir, name);
      const outName = `${path.basename(name, path.extname(name))}.webp`;
      const dest = path.join(destDir, outName);

      await sharp(src)
        .rotate()
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(dest);

      count += 1;
      console.log(`${category}/${outName} ← ${name} (${humanizeAlt(name)})`);
    }
  }

  console.log(`Synced ${count} images to public/images/gallery/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
