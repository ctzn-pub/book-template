import type { Docs, DocsPage } from '@/lib/docs-types';

/**
 * The docs site's contents — the single source of truth for the DOCS format.
 * Sections of pages, rendered as a persistent left sidebar. Order here is the
 * sidebar order (and the order prev/next walks).
 *
 * The starter ships a few lorem pages across two sections; replace them.
 */
export const docs: Docs = {
  title: 'Docs',
  tagline: 'A reference layout with an always-open left sidebar.',
  sections: [
    {
      title: 'Getting Started',
      pages: [
        { slug: 'introduction', title: 'Introduction', status: 'published' },
        { slug: 'installation', title: 'Installation', status: 'published' },
      ],
    },
    {
      title: 'Guides',
      pages: [
        { slug: 'writing-pages', title: 'Writing Pages', status: 'published' },
        { slug: 'configuration', title: 'Configuration', status: 'draft' },
      ],
    },
  ],
};

/** All pages, flattened in sidebar order (used for prev/next + static params). */
export const docsPages: DocsPage[] = docs.sections.flatMap(s => s.pages);

export function findDocsPage(slug: string) {
  const idx = docsPages.findIndex(p => p.slug === slug);
  if (idx === -1) return null;
  return {
    page: docsPages[idx],
    prev: idx > 0 ? docsPages[idx - 1] : null,
    next: idx < docsPages.length - 1 ? docsPages[idx + 1] : null,
  };
}

/** The slug the /docs index should redirect/link to (first published page). */
export function firstDocsSlug(): string | null {
  const first = docsPages.find(p => p.status === 'published');
  return first ? first.slug : null;
}

export function getAllDocsSlugs(): string[] {
  return docsPages.map(p => p.slug);
}
