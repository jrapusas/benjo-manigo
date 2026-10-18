/**
 * Responsive audit for /blocks showcase - checks horizontal overflow per block at key viewports.
 * Usage: npx vite-node scripts/audit-blocks-responsive.mjs [--url http://127.0.0.1:4321]
 */
import { chromium } from 'playwright';

const BASE_URL = process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'http://127.0.0.1:4322';
const PAGE_PATH = process.argv.find((a) => a.startsWith('--path='))?.slice(7) ?? '/blocks';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

const BLOCK_IDS = [
  'link-colors',
  'hero',
  'richText',
  'imageText',
  'featureGrid',
  'testimonials',
  'accordion',
  'cta',
  'logoGrid',
  'pricing',
  'team',
  'stats',
  'gallery',
  'video',
  'contactDetails',
  'relatedPosts',
  'timeline',
  'processSteps',
];

/** @param {import('playwright').Page} page */
async function getOverflowIssues(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const issues = [];

    if (document.documentElement.scrollWidth > vw + 1) {
      issues.push({
        type: 'page',
        selector: 'html',
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: vw,
        overflow: document.documentElement.scrollWidth - vw,
      });
    }

    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      const right = rect.right + window.scrollX;
      const left = rect.left + window.scrollX;
      if (right > vw + 2 || left < -2) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls =
          typeof el.className === 'string' && el.className
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
        offenders.push({
          selector: `${tag}${id}${cls}`,
          left: Math.round(left),
          right: Math.round(right),
          width: Math.round(rect.width),
          overflowRight: Math.round(right - vw),
          overflowLeft: Math.round(-left),
        });
      }
    }

    // Dedupe by selector, keep worst overflow
    const byKey = new Map();
    for (const o of offenders) {
      const prev = byKey.get(o.selector);
      if (!prev || o.overflowRight > prev.overflowRight) byKey.set(o.selector, o);
    }

    const top = [...byKey.values()]
      .sort((a, b) => b.overflowRight - a.overflowRight)
      .slice(0, 5);

    if (top.length) issues.push({ type: 'elements', offenders: top });
    return issues;
  });
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      console.error('No Chrome/Chromium found. Install Chrome or run: npx playwright install chromium');
      process.exit(1);
    }
  }

  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForSelector('#hero', { timeout: 30_000 });
  } catch (err) {
    console.error(`Failed to load ${BASE_URL}/blocks - is the dev server running?`);
    console.error(err.message);
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(500);
  const ids = BLOCK_IDS;

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);

    // Full page check
    const pageIssues = await getOverflowIssues(page);
    results.push({ viewport: viewport.name, block: '_page', issues: pageIssues });

    for (const id of ids) {
      const el = page.locator(`#${id}`);
      if ((await el.count()) === 0) continue;

      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);

      const issues = await page.evaluate((sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return [];
        const vw = document.documentElement.clientWidth;
        const out = [];
        const sectionRight = section.getBoundingClientRect().right;
        if (sectionRight > vw + 2) {
          out.push({
            type: 'section',
            overflow: Math.round(sectionRight - vw),
          });
        }
        const offenders = [];
        for (const el of section.querySelectorAll('*')) {
          const rect = el.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) continue;
          if (rect.right > vw + 2) {
            const tag = el.tagName.toLowerCase();
            const cls =
              typeof el.className === 'string' && el.className
                ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
                : '';
            offenders.push({
              selector: `${tag}${cls}`,
              overflowRight: Math.round(rect.right - vw),
              width: Math.round(rect.width),
            });
          }
        }
        const top = offenders.sort((a, b) => b.overflowRight - a.overflowRight).slice(0, 3);
        if (top.length) out.push({ type: 'elements', offenders: top });
        return out;
      }, id);

      results.push({ viewport: viewport.name, block: id, issues });
    }
  }

  await browser.close();

  // Report
  const failures = results.filter((r) => r.issues.length > 0);
  const summary = { pass: results.length - failures.length, fail: failures.length, total: results.length };

  console.log('\n=== Block responsive audit ===');
  console.log(`URL: ${BASE_URL}${PAGE_PATH}`);
  console.log(`Checks: ${summary.total} (${summary.pass} pass, ${summary.fail} fail)\n`);

  if (!failures.length) {
    console.log('All blocks pass at mobile (375), tablet (768), and desktop (1280).');
    process.exit(0);
  }

  const grouped = new Map();
  for (const f of failures) {
    const key = `${f.block}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(f);
  }

  for (const [block, entries] of grouped) {
    console.log(`\n## ${block}`);
    for (const e of entries) {
      console.log(`  [${e.viewport}]`);
      for (const issue of e.issues) {
        if (issue.type === 'page') {
          console.log(
            `    Page overflow: scrollWidth ${issue.scrollWidth}px > viewport ${issue.clientWidth}px (+${issue.overflow}px)`,
          );
        }
        if (issue.type === 'section') {
          console.log(`    Section bleeds +${issue.overflow}px past viewport`);
        }
        if (issue.type === 'elements') {
          for (const o of issue.offenders) {
            const parts = [];
            if (o.overflowRight > 0) parts.push(`+${o.overflowRight}px right`);
            if (o.overflowLeft > 0) parts.push(`+${o.overflowLeft}px left`);
            console.log(`    ${o.selector}: ${parts.join(', ')} (w=${o.width}px)`);
          }
        }
      }
    }
  }

  process.exit(1);
}

main();
