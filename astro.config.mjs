// @ts-check - tells TypeScript to type-check this .mjs file (JSDoc + inference).
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import fs from 'node:fs';
import { keystaticApiOnly } from './scripts/keystatic-api-only.mjs';
import {
  patchKeystaticBundle,
  patchKeystaticMediaUI,
  patchKeystarTableUI,
  patchUseVirtualizerItem,
} from './scripts/keystatic-media-ui-patch.mjs';
import { siteConfig } from './src/config/site.ts';
import { DEV_ONLY_PATHS } from './src/lib/devOnly.ts';

/** Keystatic `storage: local` needs Node.js - Cloudflare workerd breaks the API in dev. */
const useCloudflareAdapter = process.argv.some((arg) =>
  ['build', 'preview', 'sync'].includes(arg),
);

/** React 19 has useSyncExternalStore - shim CJS package breaks named ESM imports in dev. */
const reactUseSyncExternalStoreShim = {
  name: 'react-use-sync-external-store-shim',
  resolveId(id) {
    if (
      id === 'use-sync-external-store/shim' ||
      id === 'use-sync-external-store/shim/index.js'
    ) {
      return '\0react-use-sync-external-store-shim';
    }
  },
  load(id) {
    if (id === '\0react-use-sync-external-store-shim') {
      return `export { useSyncExternalStore } from 'react';\nexport { useSyncExternalStore as default } from 'react';`;
    }
  },
};

/** Render image thumbnails in the Media Library collection table. */
const keystaticMediaUiEsbuildPlugin = {
  name: 'keystatic-media-ui-patch-esbuild',
  setup(build) {
    build.onLoad({ filter: /keystatic-core-ui\.js$/ }, async (args) => {
      const contents = patchKeystaticMediaUI(
        await fs.promises.readFile(args.path, 'utf8'),
      );
      return { contents, loader: 'js' };
    });
    build.onLoad({ filter: /keystar-ui-table\.js$/ }, async (args) => {
      const contents = patchKeystarTableUI(
        await fs.promises.readFile(args.path, 'utf8'),
      );
      return { contents, loader: 'js' };
    });
    build.onLoad({ filter: /useVirtualizerItem\.mjs$/ }, async (args) => {
      const contents = patchUseVirtualizerItem(
        await fs.promises.readFile(args.path, 'utf8'),
      );
      return { contents, loader: 'js' };
    });
  },
};

const keystaticMediaTableThumbs = {
  name: 'keystatic-media-table-thumbs',
  enforce: 'pre',
  transform(code, id) {
    const patched = patchKeystaticBundle(code, id);
    return patched === code ? undefined : patched;
  },
};

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url, // used by sitemap integration and absolute URL helpers
  // Static pages prerender at build; /keystatic + /api/keystatic stay on-demand (see @keystatic/astro).
  output: 'static',
  // Keystatic handles its own OAuth cookies - no Astro session KV needed.
  session: false,
  ...(useCloudflareAdapter
    ? {
        adapter: cloudflare({
          // Keystatic reader reads content from disk at build time.
          prerenderEnvironment: 'node',
        }),
      }
    : {}),
  env: {
    schema: {
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_GITHUB_REPO: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      INQUIRY_TO_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      INQUIRY_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
  vite: {
    // Cloudflare adapter merges vite.optimizeDeps.include into SSR/prerender
    // environments (vite.ssr.optimizeDeps is ignored). Pre-include Keystatic so
    // the workerd dep optimizer does not reload mid-request and invalidate
    // deps_ssr chunk hashes.
    optimizeDeps: {
      include: [
        '@keystatic/astro/internal/keystatic-api.js',
        '@keystatic/astro/ui',
        '@keystatic/core',
        '@keystatic/core/ui',
        '@keystatic/core/api/generic',
        'use-sync-external-store/shim',
        '@keystar/ui/button',
        '@keystar/ui/combobox',
        '@keystar/ui/layout',
        '@keystar/ui/text-field',
        'yaml',
        'superstruct',
      ],
      esbuildOptions: {
        plugins: [keystaticMediaUiEsbuildPlugin],
      },
    },
    plugins: [tailwindcss(), reactUseSyncExternalStoreShim, keystaticMediaTableThumbs],
  },
  integrations: [
    react(), // lets you use .tsx islands (e.g. DocumentContent) inside .astro files
    markdoc(),
    keystaticApiOnly(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';
        return !DEV_ONLY_PATHS.has(pathname);
      },
    }),
  ],
});
