import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  PATCH_MARKER,
  VIRTUALIZER_PATCH_MARKER,
  patchKeystarTableUI,
  patchKeystaticMediaUI,
  patchUseVirtualizerItem,
} from './keystatic-media-ui-patch.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

function readDependency(path) {
  return readFileSync(`${root}node_modules/${path}`, 'utf8');
}

describe('Keystatic media UI patches', () => {
  it('patches the installed Keystatic collection table', () => {
    const source = readDependency('@keystatic/core/dist/keystatic-core-ui.js');
    const patched = patchKeystaticMediaUI(source);

    expect(patched).toContain(PATCH_MARKER);
    expect(patched).toContain('ks-media-thumb-loaded');
    expect(patched).toContain('column === "file" ? { minWidth: 300');
    expect(patched).toContain('@@rowIndex');
    expect(patchKeystaticMediaUI(patched)).toBe(patched);
  });

  it('patches the installed Keystar table', () => {
    const source = readDependency('@keystar/ui/dist/keystar-ui-table.js');
    const patched = patchKeystarTableUI(source);

    expect(patched).toContain(PATCH_MARKER);
    expect(patched).toContain('props.mediaRowHeight');
    expect(patchKeystarTableUI(patched)).toBe(patched);
  });

  it('patches the installed React Aria virtualizer', () => {
    const source = readDependency(
      'react-aria/dist/private/virtualizer/useVirtualizerItem.mjs',
    );
    const patched = patchUseVirtualizerItem(source);

    expect(patched).toContain(VIRTUALIZER_PATCH_MARKER);
    expect(patched).toContain('ks-media-thumb-loaded');
    expect(patchUseVirtualizerItem(patched)).toBe(patched);
  });
});
