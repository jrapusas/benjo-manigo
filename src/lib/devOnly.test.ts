import { describe, expect, it } from 'vitest';
import {
  guardDevOnlyPage,
  hasDevShowcaseAccess,
  withDevShowcaseQuery,
} from './devOnly';

describe('hasDevShowcaseAccess', () => {
  it('denies without the dev query param', () => {
    expect(hasDevShowcaseAccess(new URL('http://localhost/blocks'))).toBe(false);
  });

  it('allows when dev=true is present', () => {
    expect(hasDevShowcaseAccess(new URL('http://localhost/blocks?dev=true'))).toBe(true);
  });
});

describe('withDevShowcaseQuery', () => {
  it('appends dev=true to a path', () => {
    expect(withDevShowcaseQuery('/blocks')).toBe('/blocks?dev=true');
  });
});

describe('guardDevOnlyPage', () => {
  const redirect = (path: string) =>
    new Response(null, { status: 302, headers: { Location: path } });

  it('redirects home when devShowcase is not set', () => {
    const response = guardDevOnlyPage({
      redirect,
      locals: {},
    });

    expect(response?.headers.get('Location')).toBe('/');
  });

  it('allows when devShowcase is true', () => {
    const response = guardDevOnlyPage({
      redirect,
      locals: { devShowcase: true },
    });

    expect(response).toBeUndefined();
  });
});
