import { hideProductionSite } from './liveSiteFlag';

/** Production builds replace public pages with a holding page while the flag is on. */
export const liveSiteHidden = hideProductionSite && import.meta.env.PROD;

export function shouldHideLivePage(pathname: string, hidden = liveSiteHidden): boolean {
  if (!hidden) return false;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/keystatic') ||
    pathname === '/robots.txt'
  ) {
    return false;
  }
  return true;
}

export function holdingPageHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Benjo Manigo</title>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#141210;color:#f3efe6;font-family:Georgia,serif">
<main><p>This site is not public yet.</p></main>
</body>
</html>`;
}
