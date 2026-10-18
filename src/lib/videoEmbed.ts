/** Parse a YouTube watch, short, embed, or shorts URL into a video ID. */
export function youtubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

/** Parse a Vimeo watch URL into a video ID. */
export function vimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

/** YouTube poster image for a video ID (hqdefault is always available). */
export function youtubePosterUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Build an embeddable iframe src for YouTube or Vimeo watch URLs. */
export function videoEmbedSrc(url: string): string | null {
  const youtubeId = youtubeVideoId(url);
  if (youtubeId) {
    const params = new URLSearchParams({
      modestbranding: '1',
      rel: '0',
      iv_load_policy: '3',
      playsinline: '1',
    });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`;
  }

  const vimeoId = vimeoVideoId(url);
  if (vimeoId) {
    const params = new URLSearchParams({
      title: '0',
      byline: '0',
      portrait: '0',
      badge: '0',
      dnt: '1',
    });
    return `https://player.vimeo.com/video/${vimeoId}?${params}`;
  }

  return null;
}

/** Resolve a poster image URL for YouTube or Vimeo watch URLs. */
export async function videoPosterUrl(url: string): Promise<string | null> {
  const youtubeId = youtubeVideoId(url);
  if (youtubeId) return youtubePosterUrl(youtubeId);

  const vimeoId = vimeoVideoId(url);
  if (!vimeoId) return null;

  try {
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${vimeoId}`)}`;
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    const data = (await response.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

// ponytail: assert self-check, no test framework
if (import.meta.env?.DEV) {
  const id = youtubeVideoId('https://youtu.be/M7lc1UVf-VE');
  if (id !== 'M7lc1UVf-VE') throw new Error('youtubeVideoId failed');
  if (!videoEmbedSrc('https://www.youtube.com/watch?v=M7lc1UVf-VE')?.includes('M7lc1UVf-VE')) {
    throw new Error('videoEmbedSrc failed');
  }
  if (youtubePosterUrl('M7lc1UVf-VE') !== 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg') {
    throw new Error('youtubePosterUrl failed');
  }
}
