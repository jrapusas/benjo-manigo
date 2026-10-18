import { useMemo, useState } from 'react';
import { TextField } from '@keystar/ui/text-field';
import {
  ICON_CATALOG,
  ICON_CATALOG_COUNT,
  filterIconCatalog,
} from '../iconCatalog';
import { getIconPreviewPath } from '../../lib/iconPreview';

/** Read-only searchable grid — full Tabler set, A–Z by label. */
export function IconLibraryPanel() {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => filterIconCatalog(query), [query]);

  return (
    <div className="ks-icon-library">
      <p className="ks-icon-library__intro">
        Complete Tabler outline library ({ICON_CATALOG_COUNT.toLocaleString()} icons),
        sorted A–Z. Pick icons in blocks via the icon dropdown — no SVG uploads.
      </p>
      <TextField
        label="Search icons"
        value={query}
        onChange={setQuery}
        placeholder="Search by name or id…"
      />
      <p className="ks-icon-library__count" aria-live="polite">
        Showing {visible.length.toLocaleString()} of{' '}
        {ICON_CATALOG_COUNT.toLocaleString()}
      </p>
      <ul className="ks-icon-library__grid">
        {visible.map((entry) => (
          <li key={entry.id} className="ks-icon-library__card">
            <img
              className="ks-icon-library__thumb"
              src={getIconPreviewPath(entry.id)}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="ks-icon-library__label">{entry.label}</span>
            <code className="ks-icon-library__id">{entry.id}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
