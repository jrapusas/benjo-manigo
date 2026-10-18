type BlockPreviewProps = {
  fields: {
    title?: { value?: string | null };
    heading?: { value?: string | null };
    eyebrow?: { value?: string | null };
  };
};

function trim(value?: string | null) {
  return value?.trim() ?? '';
}

/** Show "Block type - Heading" in the content blocks list. */
export function blockItemLabel(
  blockLabel: string,
  field: 'title' | 'heading' = 'heading',
) {
  return (props: BlockPreviewProps) => {
    const text = trim(props.fields[field]?.value);
    return text ? `${blockLabel} - ${text}` : blockLabel;
  };
}

export function heroBlockItemLabel(blockLabel: string) {
  return (props: BlockPreviewProps) => {
    const title = trim(props.fields.title?.value);
    if (title) return `${blockLabel} - ${title}`;
    const eyebrow = trim(props.fields.eyebrow?.value);
    if (eyebrow) return `${blockLabel} - ${eyebrow}`;
    return blockLabel;
  };
}
