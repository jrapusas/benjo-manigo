#!/usr/bin/env node
// ponytail: Pages treats any wrangler file with pages_build_output_dir as a
// Pages project and then rejects the adapter's ASSETS binding. Root config
// keeps the field so the first Pages read still finds dist/client. This only
// deletes it from generated copies under dist/.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (entry.name !== 'wrangler.json') continue;
    const config = JSON.parse(await readFile(path, 'utf8'));
    if (config.pages_build_output_dir === undefined) continue;
    delete config.pages_build_output_dir;
    await writeFile(path, JSON.stringify(config));
    console.log(`Removed pages_build_output_dir from ${path}`);
  }
}

await walk('dist');
