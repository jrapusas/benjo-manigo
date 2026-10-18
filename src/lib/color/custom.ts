import type { ColorPrimitives } from './types';

export const DEFAULT_CUSTOM_PRIMITIVES: ColorPrimitives = {
  background: '#ffffff',
  text: '#0f172a',
  buttonBg: '#3b82f6',
  buttonText: '#ffffff',
};

export function isColorPrimitives(value: unknown): value is ColorPrimitives {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.background === 'string' &&
    typeof record.text === 'string' &&
    typeof record.buttonBg === 'string' &&
    typeof record.buttonText === 'string'
  );
}
