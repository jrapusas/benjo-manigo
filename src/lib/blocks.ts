import type { BaseBlockId } from '../keystatic/baseBlocks';
import Hero from '../components/blocks/Hero.astro';
import RichText from '../components/blocks/RichText.astro';
import ImageText from '../components/blocks/ImageText.astro';
import FeatureGrid from '../components/blocks/FeatureGrid.astro';
import Testimonials from '../components/blocks/Testimonials.astro';
import Accordion from '../components/blocks/Accordion.astro';
import CTA from '../components/blocks/CTA.astro';
import LogoGrid from '../components/blocks/LogoGrid.astro';
import Pricing from '../components/blocks/Pricing.astro';
import Team from '../components/blocks/Team.astro';
import Stats from '../components/blocks/Stats.astro';
import Gallery from '../components/blocks/Gallery.astro';
import PaintingMasonry from '../components/blocks/PaintingMasonry.astro';
import Video from '../components/blocks/Video.astro';
import ContactDetails from '../components/blocks/ContactDetails.astro';
import RelatedPosts from '../components/blocks/RelatedPosts.astro';
import Timeline from '../components/blocks/Timeline.astro';
import ProcessSteps from '../components/blocks/ProcessSteps.astro';
import type { BlockDiscriminant } from './types';

export const blockComponents: Record<
  BlockDiscriminant,
  (props: Record<string, unknown>) => any
> = {
  hero: Hero,
  richText: RichText,
  imageText: ImageText,
  featureGrid: FeatureGrid,
  testimonials: Testimonials,
  accordion: Accordion,
  cta: CTA,
  logoGrid: LogoGrid,
  pricing: Pricing,
  team: Team,
  stats: Stats,
  gallery: Gallery,
  paintingMasonry: PaintingMasonry,
  video: Video,
  contactDetails: ContactDetails,
  relatedPosts: RelatedPosts,
  timeline: Timeline,
  processSteps: ProcessSteps,
} satisfies Record<BaseBlockId, (props: Record<string, unknown>) => any>;
