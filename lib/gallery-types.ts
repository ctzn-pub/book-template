import type { ArticleStatus } from '@/lib/book-types';

/**
 * Types for the GALLERY format — a flat collection of independent articles,
 * as opposed to the sequential Book format (parts → chapters). The two are
 * deliberately separate models: a gallery has no ordering, no chapters, and
 * no prev/next; each piece stands alone.
 */

export type GalleryArticle = {
  /** URL path AND folder name under app/gallery/<slug>/. */
  slug: string;
  /** Card + page title. */
  title: string;
  /** One- or two-sentence description shown on the gallery card. */
  blurb: string;
  /** 'published' renders the card as a link; 'draft' / 'planned' show it dimmed and unlinked. */
  status: ArticleStatus;
};

export type Gallery = {
  /** Shown in the top bar and as the gallery's heading. */
  title: string;
  /** One-line description under the gallery heading. */
  tagline: string;
  articles: GalleryArticle[];
};

export type GalleryLookup = { article: GalleryArticle } | null;
