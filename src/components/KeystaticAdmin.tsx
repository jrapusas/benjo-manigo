import '../styles/color-themes.css';
import '../styles/keystatic-admin.css';
import { Keystatic } from '@keystatic/core/ui';
// eslint-disable-next-line import/no-unresolved
import config from 'virtual:keystatic-config';
import KeystaticMediaLibraryMeta from './KeystaticMediaLibraryMeta';
import KeystaticSidebarSiteLinks from './KeystaticSidebarSiteLinks';

const appSlug = {
  envName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG',
  value: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
};

export default function KeystaticAdmin() {
  return (
    <div className="ks-admin-app">
      <KeystaticSidebarSiteLinks />
      <KeystaticMediaLibraryMeta />
      <Keystatic config={config} appSlug={appSlug} />
    </div>
  );
}
