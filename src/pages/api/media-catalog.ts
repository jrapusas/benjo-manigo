import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import {
  mediaOptionFromYaml,
  sortMediaOptions,
} from '../../keystatic/mediaCatalog';

export const prerender = false;

export const GET: APIRoute = () => {
  const mediaRoot = path.join(process.cwd(), 'src/content/media');

  const options = fs
    .readdirSync(mediaRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('icon-'))
    .map((entry) => {
      const slug = entry.name;
      const yamlPath = path.join(mediaRoot, slug, 'index.yaml');
      if (!fs.existsSync(yamlPath)) return null;

      const raw = fs.readFileSync(yamlPath, 'utf8');
      return mediaOptionFromYaml(slug, raw);
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return new Response(JSON.stringify(sortMediaOptions(options)), {
    headers: { 'Content-Type': 'application/json' },
  });
};
