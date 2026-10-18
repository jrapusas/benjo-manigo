import { ColorPickerInput } from './ColorPickerInput';
import type { ColorPrimitives } from '../../lib/color/types';

type Props = {
  value: ColorPrimitives;
  onChange: (value: ColorPrimitives) => void;
};

const FIELDS: {
  key: keyof ColorPrimitives;
  label: string;
  description: string;
}[] = [
  {
    key: 'background',
    label: 'Background',
    description: 'Page and section surface color.',
  },
  {
    key: 'text',
    label: 'Text',
    description: 'Body text - headings and subheadings derive from this.',
  },
  {
    key: 'buttonBg',
    label: 'Button background',
    description: 'Primary button fill - links derive from this.',
  },
  {
    key: 'buttonText',
    label: 'Button text',
    description: 'Label color on primary buttons.',
  },
];

export function CustomPrimitivesInput({ value, onChange }: Props) {
  return (
    <fieldset className="ks-custom-primitives">
      <legend className="ks-custom-primitives__legend">Custom primitives</legend>
      <p className="ks-custom-primitives__description">
        Four foundational colors. All six appearances in the preview above derive
        from these values.
      </p>
      <div className="ks-custom-primitives__grid">
        {FIELDS.map(({ key, label, description }) => (
          <ColorPickerInput
            key={key}
            label={label}
            description={description}
            value={value[key]}
            onChange={(next) => onChange({ ...value, [key]: next })}
            forceValidation={false}
            autoFocus={false}
          />
        ))}
      </div>
    </fieldset>
  );
}
