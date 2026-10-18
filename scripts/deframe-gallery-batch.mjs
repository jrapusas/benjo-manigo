#!/usr/bin/env node
/**
 * Crop frames / scan margins from listed brain JPEGs → public WebP.
 * Insets: .context/project/images/gallery-deframe-batch.json
 *
 * Destructive on brain JPEGs. Re-running compounds the crop — restore originals first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, '.context/project/images/gallery-deframe-batch.json');
const brainRoot = path.join(root, '.context/project/images');
const publicRoot = path.join(root, 'public/images/gallery');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const defaultInset = manifest.default;

function insetFor(relPath) {
  return { ...defaultInset, ...(manifest.files[relPath] ?? {}) };
}

async function cropToBuffer(src, inset) {
  const rotated = sharp(src).rotate();
  const meta = await rotated.metadata();
  const left = Math.round(meta.width * inset.left);
  const top = Math.round(meta.height * inset.top);
  const right = Math.round(meta.width * inset.right);
  const bottom = Math.round(meta.height * inset.bottom);
  const width = meta.width - left - right;
  const height = meta.height - top - bottom;
  if (width < 80 || height < 80) {
    throw new Error(`Crop too aggressive for ${path.basename(src)}`);
  }
  return {
    buffer: await rotated
      .extract({ left, top, width, height })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer(),
    width,
    height,
  };
}

async function main() {
  const only = process.argv.slice(2);
  const all = Object.keys(manifest.files).sort();
  const entries = only.length ? only : all;
  for (const rel of entries) {
    if (!manifest.files[rel]) {
      throw new Error(`Not in manifest: ${rel}`);
    }
  }
  for (const rel of entries) {
    const src = path.join(brainRoot, rel);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing source: ${rel}`);
    }
    const inset = insetFor(rel);
    const { buffer, width, height } = await cropToBuffer(src, inset);
    fs.writeFileSync(src, buffer);

    const [category] = rel.split('/');
    const base = path.basename(rel, path.extname(rel));
    const webpPath = path.join(publicRoot, category, `${base}.webp`);
    await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath);

    console.log(
      `${rel} → ${width}x${height} (L${(inset.left * 100).toFixed(1)}% T${(inset.top * 100).toFixed(1)}% R${(inset.right * 100).toFixed(1)}% B${(inset.bottom * 100).toFixed(1)}%)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
