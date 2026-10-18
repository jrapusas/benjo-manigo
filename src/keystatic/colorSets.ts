export type ColorInput = {
  background: string;
  text: string;
};

export const COLOR_SET_LABELS = {
  default: '1. Default (page)',
  surface: '2. Surface (alternate sections)',
  card: '3. Card',
  brand: '4. Brand',
  brandStrong: '5. Brand strong',
  muted: '6. Muted',
} as const;

export type ColorSetId = keyof typeof COLOR_SET_LABELS;

export const COLOR_SET_DEFAULTS: Record<ColorSetId, ColorInput> = {
  default: { background: '#ffffff', text: '#0f172a' },
  surface: { background: '#f8fafc', text: '#0f172a' },
  card: { background: '#ffffff', text: '#0f172a' },
  brand: { background: '#1e40af', text: '#ffffff' },
  brandStrong: { background: '#0f172a', text: '#ffffff' },
  muted: { background: '#f1f5f9', text: '#475569' },
};
