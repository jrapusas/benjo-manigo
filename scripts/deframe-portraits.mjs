#!/usr/bin/env node
/**
 * Crop visible photo frames from portrait JPEGs (brain + public WebP).
 * Insets: .context/project/images/portraits-deframe.json
 *
 * Destructive: overwrites brain JPEGs. Re-running on already-cropped files compounds
 * the crop — restore originals before tuning insets and running again.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, '.context/project/images/portraits-deframe.json');
const brainDir = path.join(root, '.context/project/images/portraits');
const publicDir = path.join(root, 'public/images/gallery/portraits');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const defaultInset = manifest.default;

function insetFor(filename) {
  return { ...defaultInset, ...(manifest.files[filename] ?? {}) };
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
  const names = fs.readdirSync(brainDir).filter((n) => /\.jpe?g$/i.test(n)).sort();
  for (const name of names) {
    const src = path.join(brainDir, name);
    const inset = insetFor(name);
    const { buffer, width, height } = await cropToBuffer(src, inset);
    fs.writeFileSync(src, buffer);
    const webpName = `${path.basename(name, path.extname(name))}.webp`;
    await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(publicDir, webpName));
    console.log(
      `${name} → ${width}x${height} (L${(inset.left * 100).toFixed(0)}% T${(inset.top * 100).toFixed(0)}% R${(inset.right * 100).toFixed(0)}% B${(inset.bottom * 100).toFixed(0)}%)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
