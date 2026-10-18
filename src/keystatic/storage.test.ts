import { afterEach, describe, expect, it } from 'vitest';
import { resolveKeystaticStorage } from './storage';

const originalStorage = process.env.KEYSTATIC_STORAGE;
const originalRepo = process.env.KEYSTATIC_GITHUB_REPO;

afterEach(() => {
  if (originalStorage === undefined) delete process.env.KEYSTATIC_STORAGE;
  else process.env.KEYSTATIC_STORAGE = originalStorage;

  if (originalRepo === undefined) delete process.env.KEYSTATIC_GITHUB_REPO;
  else process.env.KEYSTATIC_GITHUB_REPO = originalRepo;
});

describe('resolveKeystaticStorage', () => {
  it('rejects explicit GitHub mode without a repository', () => {
    process.env.KEYSTATIC_STORAGE = 'github';
    delete process.env.KEYSTATIC_GITHUB_REPO;

    expect(() => resolveKeystaticStorage()).toThrow(
      'KEYSTATIC_GITHUB_REPO is required when KEYSTATIC_STORAGE=github.',
    );
  });

  it('uses the configured GitHub repository', () => {
    process.env.KEYSTATIC_STORAGE = 'github';
    process.env.KEYSTATIC_GITHUB_REPO = 'owner/repo';

    expect(resolveKeystaticStorage()).toEqual({
      kind: 'github',
      repo: 'owner/repo',
    });
  });
});
