import { getIconData, iconToSVG } from '@iconify/utils';
import tabler from '@iconify-json/tabler/icons.json';
import { iconIdToTablerName, normalizeIconId } from '../keystatic/iconCatalog';

function renderTablerIcon(
  iconName: string,
  className: string,
  size: number | string = '1em',
): string | null {
  const data = getIconData(tabler, iconName);
  if (!data) return null;

  const { attributes, body } = iconToSVG(data, {
    height: String(size),
    width: String(size),
  });

  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  const classAttr = className ? ` class="${className}"` : '';
  return `<svg ${attrs}${classAttr} aria-hidden="true">${body}</svg>`;
}

/** Fixed-size SVG for admin previews (currentColor is unreliable in &lt;img&gt;). */
export function tablerIconSvgForPreview(
  slug: string,
  options: {
    size?: number;
    color?: string;
    className?: string;
    preserveCurrentColor?: boolean;
  } = {},
): string | null {
  const { size = 128, color = '#334155', className = '', preserveCurrentColor = false } =
    options;
  const iconName = iconIdToTablerName(slug);
  if (!iconName) return null;

  const svg = renderTablerIcon(iconName, className, size);
  if (!svg) return null;

  return preserveCurrentColor ? svg : svg.replace(/currentColor/g, color);
}

export function tablerIconFromSlug(
  slug?: string | null,
  className = 'h-8 w-8',
): string | null {
  if (!slug) return null;
  const iconName = iconIdToTablerName(slug);
  if (!iconName) return null;
  return renderTablerIcon(iconName, className);
}

export function tablerIconFromSrc(src?: string | null, className = 'h-8 w-8'): string | null {
  if (!src) return null;
  return tablerIconFromSlug(src, className);
}
