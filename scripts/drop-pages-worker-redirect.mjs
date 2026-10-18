#!/usr/bin/env node
// ponytail: @astrojs/cloudflare writes .wrangler/deploy/config.json so the
// next Wrangler read deploys dist/server (worker) instead of dist/client.
// Pages then publishes that worker with no HTML, and every URL 404s.
// Delete the redirect so Pages keeps pages_build_output_dir and uploads dist/client.
import { rm } from 'node:fs/promises';

await rm('.wrangler/deploy/config.json', { force: true });
console.log('Removed .wrangler/deploy/config.json');
