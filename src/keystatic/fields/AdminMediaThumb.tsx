import { getMediaPreviewPath } from '../../lib/mediaPreview';
import { MediaPreviewLightbox } from './MediaPreviewLightbox';

type Props = {
  slug: string;
  src?: string;
  category?: string;
  className?: string;
  previewable?: boolean;
  previewLabel?: string;
};

function isIconMedia(slug: string, category?: string) {
  return category === 'icon' || slug.startsWith('icon-');
}

export function AdminMediaThumb({
  slug,
  src = '',
  category,
  className = 'ks-media-relationship-thumb',
  previewable = false,
  previewLabel,
}: Props) {
  const previewSrc = src || getMediaPreviewPath(slug);
  if (!previewSrc) return null;

  const icon = isIconMedia(slug, category);
  const thumbClass = icon
    ? `${className} ks-media-table-thumb ks-media-table-thumb--icon`
    : `${className} ks-media-table-thumb ks-media-table-thumb--photo`;

  const label = previewLabel ?? slug;
  const img = (
    <img
      className={thumbClass}
      src={previewSrc}
      alt=""
      loading="lazy"
    />
  );

  if (!previewable) return img;

  return (
    <MediaPreviewLightbox
      src={previewSrc}
      label={`View full size: ${label}`}
    >
      {img}
    </MediaPreviewLightbox>
  );
}
