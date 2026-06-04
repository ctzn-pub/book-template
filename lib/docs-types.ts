import type { ArticleStatus } from '@/lib/book-types';

/**
 * Types for the DOCS format — a reference layout with a persistent left
 * sidebar. Lighter than the Book model: docs are organized as flat sections
 * of pages (e.g. "Getting Started → Installation"), with no part numerals,
 * chapter numbers, or prev/next-as-narrative. The sidebar is the navigation.
 */

export type DocsPage = {
  /** URL path AND folder name under app/docs/<slug>/. */
  slug: string;
  /** Sidebar label + page title. */
  title: string;
  /** 'published' links in the sidebar; 'draft' / 'planned' show dimmed. */
  status: ArticleStatus;
};

export type DocsSection = {
  /** Section heading in the sidebar (e.g. "Getting Started"). */
  title: string;
  pages: DocsPage[];
};

export type Docs = {
  /** Shown in the sidebar header and the top bar. */
  title: string;
  /** One-line description under the title on the index page. */
  tagline: string;
  sections: DocsSection[];
};

export type DocsLookup = {
  page: DocsPage;
  /** Flat prev/next within the sidebar order — optional footer convenience. */
  prev: DocsPage | null;
  next: DocsPage | null;
} | null;
