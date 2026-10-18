#!/usr/bin/env node
/**
 * Download Unsplash photography aligned with media_prompt briefs.
 * fit=crop with explicit w×h per slot to avoid object-cover clipping.
 *
 * Run: npm run content:refresh-media
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaRoot = path.join(root, 'src/content/media');

/** @param {string} id Unsplash photo id (timestamp-hash) */
function unsplash(id, w, h, extra = '') {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85${extra}`;
}

/**
 * @type {Record<string, { url: string; note: string }>}
 */
const ASSETS = {
  // Hero split - portrait 3:4
  'hero-home.jpg': {
    url: unsplash('1773332598414-44a45e364d85', 1200, 1600),
    note: 'Woman at desk with laptop and tablet - import assessment consultation',
  },
  'services-hero.jpg': {
    url: unsplash('1497215728101-856f4ea42174', 1200, 1600),
    note: 'Minimal desk with laptop - regulatory services',
  },
  'careers-hero.jpg': {
    url: unsplash('1684125483810-b4c196bc9162', 1200, 1600),
    note: 'Professional at desk - advisory careers',
  },
  'contact-hero.jpg': {
    url: unsplash('1732209556861-0bcf634a8174', 1200, 1600),
    note: 'Consultation at table with laptop - contact / inquiry',
  },

  // Hero / CTA backgrounds - landscape 16:9
  'about-hero.jpg': {
    url: unsplash('1497366811353-6870744d04b2', 1920, 1080),
    note: 'Bright office interior - about page hero',
  },
  'case-studies-hero.jpg': {
    url: unsplash('1497366754035-f200968a6e72', 1920, 1080),
    note: 'Modern office hallway - CTA background with readable overlay',
  },

  // ImageText / gallery - 4:3
  'principles.jpg': {
    url: unsplash('1630659508381-2e88af5d72ee', 1200, 900),
    note: 'Two professionals in discussion - requirements vary by product',
  },
  'client-journey.jpg': {
    url: unsplash('1681569685378-4ca075d22f1b', 1200, 900),
    note: 'Colleagues reviewing work at table - client consultation',
  },
  'operations.jpg': {
    url: unsplash('1701267969951-7b4e83ec722b', 1200, 900),
    note: 'Hands on keyboard with desk setup - documents and information',
  },
  'planning-workshop.jpg': {
    url: unsplash('1604328698692-f76ea9498e76', 1200, 900),
    note: 'Meeting table workspace - clarity before paperwork',
  },
  'team-collaboration.jpg': {
    url: unsplash('1758873268745-dd2cf0d677b5', 1200, 900),
    note: 'Team collaborating at computer - documentation support',
  },
  'client-hero.jpg': {
    url: unsplash('1581092568395-d68050c2ab43', 1200, 900),
    note: 'Professional pair reviewing materials - client advisory',
  },

  // Gallery - distinct document/compliance scenes
  'gallery-1.jpg': {
    url: unsplash('1495364037436-fed1ba81ad3e', 1200, 900),
    note: 'White papers on desk - technical document review',
  },
  'gallery-2.jpg': {
    url: unsplash('1762427907123-c7ab022a5de7', 1200, 900),
    note: 'Papers, pen, and calculator - requirement identification',
  },
  'gallery-3.jpg': {
    url: unsplash('1773332598501-f8612761781a', 1200, 900),
    note: 'Laptop, tablet, and phone on desk - application preparation',
  },

  // Blog / post featured - 16:9
  'strategic-planning.jpg': {
    url: unsplash('1773332585754-f1436987743b', 1600, 900),
    note: 'Focused work at wooden desk - strategy session',
  },
  'quarterly-planning.jpg': {
    url: unsplash('1651684195895-38708dc94cfa', 1600, 900),
    note: 'Professional working on laptop - quarterly planning',
  },
  'partner-alignment.jpg': {
    url: unsplash('1531973576160-7125cd663d86', 1600, 900),
    note: 'Two people at table - partner alignment',
  },
  'client-experience.jpg': {
    url: unsplash('1606857521015-7f9fcf423740', 1600, 900),
    note: 'Team at workstations - client experience',
  },
  'pricing-strategy.jpg': {
    url: unsplash('1758876203819-4cb3eec8e1aa', 1600, 900),
    note: 'Professional at laptop - pricing / strategy focus',
  },

  // Headshots - square face crop
  'team-1.jpg': {
    url: unsplash('1472099645785-5658abf4ff4e', 512, 512, '&crop=faces&facepad=2'),
    note: 'Team headshot',
  },
  'team-2.jpg': {
    url: unsplash('1500648767791-00dcc994a43e', 512, 512, '&crop=faces&facepad=2'),
    note: 'Team headshot',
  },
  'team-3.jpg': {
    url: unsplash('1517841905240-472988babdf9', 512, 512, '&crop=faces&facepad=2'),
    note: 'Team headshot',
  },
  'testimonial-1.jpg': {
    url: unsplash('1534528741775-53994a69daeb', 512, 512, '&crop=faces&facepad=2'),
    note: 'Testimonial headshot',
  },
  'testimonial-2.jpg': {
    url: unsplash('1494790108377-be9c29b29330', 512, 512, '&crop=faces&facepad=2'),
    note: 'Testimonial headshot',
  },
  'testimonial-3.jpg': {
    url: unsplash('1527980965255-d3b416303d12', 512, 512, '&crop=faces&facepad=2'),
    note: 'Testimonial headshot',
  },
};

let ok = 0;
let fail = 0;

for (const [file, { url, note }] of Object.entries(ASSETS)) {
  const ext = path.extname(file);
  const slug = path.basename(file, ext);
  const destDir = path.join(mediaRoot, slug);
  const dest = path.join(destDir, `file${ext}`);
  fs.mkdirSync(destDir, { recursive: true });
  process.stdout.write(`↓ ${file} … `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10_000) throw new Error('response too small');
    fs.writeFileSync(dest, buf);
    ok += 1;
    console.log(`${(buf.length / 1024).toFixed(0)} KB - ${note}`);
  } catch (err) {
    fail += 1;
    console.log(`FAILED (${err.message})`);
  }
}

console.log(`\nDone: ${ok} saved, ${fail} failed.`);
