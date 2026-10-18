import type { BlockDiscriminant, ContentBlock } from './types';
import { resolveMedia } from './media';

type BlockValue = ContentBlock['value'];

async function mapMediaSrc(value: string | null | undefined) {
  if (!value) return value;
  const media = await resolveMedia(value);
  return media?.src ?? value;
}

async function mapMediaWithAlt(value: string | null | undefined) {
  if (!value) return { src: value, alt: '' };
  const media = await resolveMedia(value);
  if (!media) return { src: value, alt: '' };
  return { src: media.src, alt: media.alt };
}

async function resolveBlockValue(
  discriminant: BlockDiscriminant,
  value: BlockValue,
): Promise<BlockValue> {
  switch (discriminant) {
    case 'hero':
    case 'imageText':
    case 'cta':
    case 'video': {
      const resolved = await mapMediaWithAlt(value.image);
      return {
        ...value,
        image: resolved.src,
        imageAlt: resolved.alt,
      };
    }

    case 'featureGrid':
      return {
        ...value,
        features: value.features ?? [],
      };

    case 'testimonials':
      return {
        ...value,
        testimonials: await Promise.all(
          (value.testimonials ?? []).map(async (item) => ({
            ...item,
            image: await mapMediaSrc(item.image),
          })),
        ),
      };

    case 'logoGrid':
      return {
        ...value,
        logos: await Promise.all(
          (value.logos ?? []).map(async (logo) => ({
            ...logo,
            image: await mapMediaSrc(logo.image),
          })),
        ),
      };

    case 'team':
      return {
        ...value,
        members: await Promise.all(
          (value.members ?? []).map(async (member) => ({
            ...member,
            image: await mapMediaSrc(member.image),
          })),
        ),
      };

    case 'gallery':
      return {
        ...value,
        images: await Promise.all(
          (value.images ?? []).map(async (item) => ({
            ...item,
            image: await mapMediaSrc(item.image),
          })),
        ),
      };

    default:
      return value;
  }
}

export async function resolveBlocksMedia(
  blocks: ContentBlock[] | null | undefined,
): Promise<ContentBlock[]> {
  if (!blocks?.length) return [];

  return Promise.all(
    blocks.map(async (block) => ({
      discriminant: block.discriminant,
      value: await resolveBlockValue(block.discriminant, block.value),
    })),
  );
}
