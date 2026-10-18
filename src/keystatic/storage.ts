import type { Config } from '@keystatic/core';

type StorageConfig = Config['storage'];

function readEnv(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env[name]) {
    return process.env[name].trim();
  }

  return (import.meta.env as Record<string, string | undefined>)[name]?.trim();
}

function isProduction(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'production';
  }

  return import.meta.env.PROD;
}

/** Local filesystem in dev; GitHub in prod (or when KEYSTATIC_STORAGE=github). */
export function resolveKeystaticStorage(): StorageConfig {
  const repo = readEnv('KEYSTATIC_GITHUB_REPO');
  const mode = readEnv('KEYSTATIC_STORAGE')?.toLowerCase();

  if (mode === 'github') {
    if (!repo) {
      throw new Error(
        'KEYSTATIC_GITHUB_REPO is required when KEYSTATIC_STORAGE=github.',
      );
    }
    return { kind: 'github', repo };
  }

  if (mode === 'local') {
    return { kind: 'local' };
  }

  if (isProduction() && repo) {
    return { kind: 'github', repo };
  }

  return { kind: 'local' };
}
