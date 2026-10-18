import type { ColorPrimitives, SemanticColors, SolidAppearanceName } from '../types';

/** Optional semantic overrides when primitives alone cannot match the design. */
export type SchemeSemanticOverrides = Partial<
  Pick<
    SemanticColors,
    | 'heading'
    | 'subheading'
    | 'subheadingSectionSubtle'
    | 'subheadingMutedSubtle'
    | 'text'
    | 'link'
    | 'linkHover'
    | 'buttonBg'
    | 'buttonText'
    | 'buttonBgHover'
    | 'buttonTextHover'
  >
>;

export type SchemeAppearanceSpec = {
  primitives: ColorPrimitives;
  semantic?: SchemeSemanticOverrides;
};

export type NamedColorScheme = {
  id: string;
  label: string;
  description: string;
  appearances: Record<SolidAppearanceName, SchemeAppearanceSpec>;
};
