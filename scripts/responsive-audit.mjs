#!/usr/bin/env node
/**
 * Responsive audit: horizontal overflow + image crop severity across pages.
 * Usage: npm run audit:responsive
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:4321';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

function collectPaths() {
  const paths = new Set(['/', '/blog', '/blocks']);
  const pagesDir = path.join(ROOT, 'src/content/pages');
  if (fs.existsSync(pagesDir)) {
    for (const slug of fs.readdirSync(pagesDir)) {
      if (!fs.existsSync(path.join(pagesDir, slug, 'index.yaml'))) continue;
      paths.add(slug === 'home' ? '/' : `/${slug}`);
    }
  }
  const postsDir = path.join(ROOT, 'src/content/posts');
  if (fs.existsSync(postsDir)) {
    for (const slug of fs.readdirSync(postsDir)) {
      if (fs.existsSync(path.join(postsDir, slug, 'index.yaml'))) {
        paths.add(`/blog/${slug}`);
      }
    }
  }
  return [...paths].sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });
}

const PATHS = collectPaths();

function auditPage() {
  const doc = document.documentElement;
  const scrollW = Math.max(doc.scrollWidth, document.body.scrollWidth);
  const clientW = doc.clientWidth;
  const vw = window.innerWidth;

  const imgs = [...document.querySelectorAll('img')]
    .filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width > 24 && r.height > 24;
    })
    .map((img) => {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const nw = img.naturalWidth || 0;
      const nh = img.naturalHeight || 0;
      const dw = r.width;
      const dh = r.height;
      const objectFit = cs.objectFit || 'fill';
      let cropPct = 0;
      if (nw && nh && dw && dh && objectFit === 'cover') {
        const containerAR = dw / dh;
        const imageAR = nw / nh;
        cropPct = Math.round(
          (1 - Math.min(containerAR, imageAR) / Math.max(containerAR, imageAR)) * 100,
        );
      }

      const src = img.currentSrc || img.src;
      const slug = src.includes('media%2F')
        ? decodeURIComponent(src.split('media%2F')[1]?.split('%2F')[0] ?? src)
        : src.split('/').slice(-1)[0];

      return {
        slug,
        alt: img.alt?.slice(0, 50) || '(empty)',
        w: Math.round(dw),
        h: Math.round(dh),
        nw,
        nh,
        objectFit,
        cropPct,
        overflowsX: r.right > vw + 2 || r.left < -2,
      };
    });

  const overflowHeadings = [...document.querySelectorAll('h1,h2,h3')]
    .filter((h) => h.scrollWidth > h.clientWidth + 2)
    .slice(0, 3)
    .map((h) => ({ tag: h.tagName, text: h.textContent?.trim().slice(0, 60) }));

  return {
    path: location.pathname,
    vw,
    horizontalOverflow: scrollW - clientW,
    heavyCrop: imgs.filter((i) => i.cropPct >= 35).sort((a, b) => b.cropPct - a.cropPct),
    overflowImages: imgs.filter((i) => i.overflowsX),
    overflowHeadings,
    imageCount: imgs.length,
  };
}

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
});
const results = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });

  for (const route of PATHS) {
    const url = `${BASE}${route}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const status = response?.status() ?? 0;
    if (status >= 400) {
      results.push({ viewport: vp.name, path: route, status, error: `HTTP ${status}` });
      continue;
    }
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(150);
    const audit = await page.evaluate(auditPage);
    results.push({ viewport: vp.name, status, ...audit });
  }

  await page.close();
}

await browser.close();

const issues = results.filter(
  (r) =>
    r.horizontalOverflow > 0 ||
    r.overflowImages?.length > 0 ||
    r.overflowHeadings?.length > 0 ||
    r.heavyCrop?.length > 0,
);

console.log(
  JSON.stringify(
    { summary: { pages: PATHS.length, viewports: VIEWPORTS.length, issueCount: issues.length }, issues, results },
    null,
    2,
  ),
);
