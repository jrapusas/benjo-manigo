#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const devJson = join(root, '.astro', 'dev.json');
const astroDevMarker = `${root}/node_modules/astro/bin/astro.mjs dev`;

spawnSync('npx', ['astro', 'dev', 'stop'], { cwd: root, stdio: 'ignore' });

if (existsSync(devJson)) {
  try {
    const { pid } = JSON.parse(readFileSync(devJson, 'utf8'));
    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // already gone
      }
    }
  } catch {
    // ignore malformed lock file
  }
  try {
    unlinkSync(devJson);
  } catch {
    // ignore
  }
}

try {
  execFileSync('pkill', ['-f', astroDevMarker], { stdio: 'ignore' });
} catch {
  // pkill exits 1 when nothing matched
}

// Free Astro's default port range so `npm run dev` lands on 4321.
for (let port = 4321; port <= 4335; port++) {
  try {
    const pids = execFileSync('lsof', ['-ti', `:${port}`], {
      encoding: 'utf8',
    }).trim();
    if (!pids) continue;
    for (const pid of pids.split('\n')) {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // already gone
      }
    }
  } catch {
    // lsof exits 1 when nothing is listening
  }
}
