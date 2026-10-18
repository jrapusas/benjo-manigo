// REACT ISLAND - Astro can embed React components for interactive or rich-content UI.
// This one renders Keystatic rich-text (document JSON) via DocumentRenderer.
// client:load / client:visible directives (not used here) control when JS hydrates in the browser.

import { DocumentRenderer } from '@keystatic/core/renderer';

// Parameters<typeof Fn>[0] - TypeScript utility: extract the first argument type from a function
type DocumentValue = Parameters<typeof DocumentRenderer>[0]['document'];

type Props = {
  document: DocumentValue;
};

export default function DocumentContent({ document }: Props) {
  if (!document?.length) return null;

  return (
    <div className="prose-content">
      <DocumentRenderer document={document} />
    </div>
  );
}
