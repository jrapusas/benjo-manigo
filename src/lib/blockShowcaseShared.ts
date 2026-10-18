import type { ContentBlock, BlockDiscriminant, BlockValue } from './types';
import { gradientAppearanceName } from './color/appearanceIntent';
import {
  SOLID_APPEARANCE_NAMES,
  type AppearanceName,
  type BaseColorName,
} from './color/types';
import { BASE_COLORS } from './color/baseColors';
import { APPEARANCE_LABELS } from './sitePalette';
import { baseBlockSchemas } from '../keystatic/blockSchemas';

export const MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.897489045678!2d151.20612127695312!3d-33.8688197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae665e892fdd%3A0x5023d357163887e!2s100%20Market%20St%2C%20Sydney%20NSW%202000!5e0!3m2!1sen!2sau!4v1725800000000!5m2!1sen!2sau';

/** Embed-friendly YouTube watch URL (Google Developers player demo). */
export const SHOWCASE_VIDEO_URL =
  'https://www.youtube.com/watch?v=M7lc1UVf-VE';

/** Same video via youtu.be - exercises short-URL parsing in Video.astro. */
export const SHOWCASE_VIDEO_URL_SHORT = 'https://youtu.be/M7lc1UVf-VE';

export const SHOWCASE_ADDRESS = `Level 12, 100 Market Street
Sydney NSW 2000
Australia`;

export type ShowcaseSection = {
  id: string;
  name: string;
  variations: { label: string; block: ContentBlock }[];
};

export type ShowcaseBlockMeta = {
  blockName: string;
  discriminant: BlockDiscriminant;
  fields: { label: string; value: string }[];
};

const VARIANT_LABELS: Record<string, string> = {
  default: 'Default',
  fullBleed: 'Full bleed',
  compact: 'Compact',
  imageBackground: 'Image background',
  newsletter: 'Newsletter signup',
  grid: 'Grid',
  slider: 'Slider',
};

const LAYOUT_LABELS: Record<string, string> = {
  grid: 'Grid',
  list: 'List',
};

const HERO_VARIANT_LABELS: Record<string, string> = {
  splitImageContained: 'Split - Image contained',
  splitImageBleedHalf: 'Split - Image full bleed half',
  splitTextBleed: 'Split - Text full bleed',
  centered: 'Centered',
  imageBg: 'Image background',
  split: 'Split - Image contained',
  fullBleed: 'Split - Image full bleed half',
  default: 'Split - Image contained',
};

/** Human-readable CMS field summary for a showcase preview block. */
export function describeShowcaseBlock(block: ContentBlock): ShowcaseBlockMeta {
  const value = block.value as Record<string, unknown>;
  const blockName =
    baseBlockSchemas[block.discriminant]?.label ?? block.discriminant;
  const fields: { label: string; value: string }[] = [];

  if (typeof value.variant === 'string') {
    const labels =
      block.discriminant === 'hero' ? HERO_VARIANT_LABELS : VARIANT_LABELS;
    fields.push({
      label: 'Variant',
      value: labels[value.variant] ?? value.variant,
    });
  }

  if (typeof value.imagePosition === 'string') {
    fields.push({
      label: 'Image position',
      value: value.imagePosition === 'left' ? 'Left' : 'Right',
    });
  }

  if (typeof value.layout === 'string') {
    fields.push({
      label: 'Layout',
      value: LAYOUT_LABELS[value.layout] ?? value.layout,
    });
  }

  if (typeof value.appearance === 'string') {
    const appearance = value.appearance as AppearanceName;
    fields.push({
      label: 'Appearance',
      value: APPEARANCE_LABELS[appearance]?.label ?? value.appearance,
    });
  }

  if (typeof value.color === 'string') {
    const color = value.color as BaseColorName;
    fields.push({
      label: 'Color',
      value: color === 'auto' ? 'Auto' : (BASE_COLORS[color]?.label ?? value.color),
    });
  }

  return { blockName, discriminant: block.discriminant, fields };
}

/** Single-line label: Hero | Variant: Centered | Appearance: Soft | Color: Auto */
export function formatShowcaseBlockLabel(block: ContentBlock): string {
  const meta = describeShowcaseBlock(block);
  return [
    meta.blockName,
    ...meta.fields.map(({ label, value }) => `${label}: ${value}`),
  ].join(' | ');
}

/** Expand one block config into all six solid section color variants. */
export function sectionColorVariations<T extends BlockDiscriminant>(
  discriminant: T,
  value: BlockValue<T>,
  layoutLabel?: string,
): { label: string; block: ContentBlock }[] {
  return SOLID_APPEARANCE_NAMES.map((appearance) => ({
    label: layoutLabel
      ? `${layoutLabel} · ${APPEARANCE_LABELS[appearance].label}`
      : APPEARANCE_LABELS[appearance].label,
    block: {
      discriminant,
      value: { color: 'auto', ...value, appearance },
    } as ContentBlock,
  }));
}

/** Expand one block config into all six gradient section color variants. */
export function sectionGradientVariations<T extends BlockDiscriminant>(
  discriminant: T,
  value: BlockValue<T>,
  layoutLabel?: string,
): { label: string; block: ContentBlock }[] {
  return SOLID_APPEARANCE_NAMES.map((appearance) => {
    const gradientAppearance = gradientAppearanceName(appearance);
    return {
      label: layoutLabel
        ? `${layoutLabel} · ${APPEARANCE_LABELS[gradientAppearance].label}`
        : APPEARANCE_LABELS[gradientAppearance].label,
      block: {
        discriminant,
        value: { color: 'auto', ...value, appearance: gradientAppearance },
      } as ContentBlock,
    };
  });
}

/** Single default-appearance preview for a block layout variant. */
export function sectionDefaultVariation<T extends BlockDiscriminant>(
  discriminant: T,
  value: BlockValue<T>,
  layoutLabel?: string,
): { label: string; block: ContentBlock }[] {
  return [
    {
      label: layoutLabel ?? APPEARANCE_LABELS.default.label,
      block: {
        discriminant,
        value: { color: 'auto', ...value, appearance: 'default' },
      } as ContentBlock,
    },
  ];
}

export type ShowcaseVariationFn = <T extends BlockDiscriminant>(
  discriminant: T,
  value: BlockValue<T>,
  layoutLabel?: string,
) => { label: string; block: ContentBlock }[];

/** Solid + gradient section color variants for block showcase pages. */
export function sectionStyleVariations<T extends BlockDiscriminant>(
  discriminant: T,
  value: BlockValue<T>,
  layoutLabel?: string,
): { label: string; block: ContentBlock }[] {
  return mergeVariations(
    sectionColorVariations(discriminant, value, layoutLabel),
    sectionGradientVariations(discriminant, value, layoutLabel),
  );
}

export function mergeVariations(
  ...groups: { label: string; block: ContentBlock }[][]
): { label: string; block: ContentBlock }[] {
  return groups.flat();
}

/** One default-appearance preview with optional CMS fields omitted. */
export function sparseVariation<T extends BlockDiscriminant>(
  discriminant: T,
  value: BlockValue<T>,
  layoutLabel = 'Minimal fields',
): { label: string; block: ContentBlock }[] {
  return [
    {
      label: `${layoutLabel} · ${APPEARANCE_LABELS.default.label}`,
      block: {
        discriminant,
        value: { color: 'auto', ...value, appearance: 'default' },
      } as ContentBlock,
    },
  ];
}
