export const artistNameLines = ['Jonathan', 'Benjo', 'Manigo'] as const;

export const artistNamePlain = 'Jonathan “Benjo” Manigo';

export const artistNameWithTagline = `${artistNamePlain} — Oil Paintings`;

/** Match CMS titles and site strings that should render as the stacked name. */
export function isArtistDisplayName(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value
    .replace(/\s+/g, ' ')
    .replace(/"Benjo"/g, '“Benjo”')
    .trim();
  return normalized === artistNamePlain || normalized === artistNameWithTagline;
}
