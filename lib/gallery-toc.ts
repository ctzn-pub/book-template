import type { Gallery, GalleryArticle } from '@/lib/gallery-types';

/**
 * The gallery's contents — the single source of truth for the GALLERY format.
 * A flat list of independent articles. Order here is only the display order on
 * the front page; there is no reading sequence and no prev/next.
 *
 * Each article needs a `slug` (= folder under app/gallery/<slug>/), a `title`,
 * a `blurb` (the card description), and a `status`. The starter ships two
 * worked example articles; replace them with your own.
 */
export const gallery: Gallery = {
  title: 'The Gallery',
  tagline: 'A collection of independent pieces — each one stands on its own.',
  articles: [
    {
      slug: 'first-piece',
      title: 'A First Standalone Piece',
      blurb:
        'An example gallery article. Unlike a book chapter, it has no “next” — it’s a self-contained essay you can read in any order. Replace it with your own.',
      status: 'published',
    },
    {
      slug: 'second-piece',
      title: 'A Second, Unrelated Piece',
      blurb:
        'Another independent article on a different topic entirely. The gallery front page is just a grid of these cards; add as many as you like.',
      status: 'published',
    },
    {
      slug: 'draft-piece',
      title: 'A Piece In Progress',
      blurb:
        'A draft card — shown dimmed and unlinked until you mark it “published”. Handy for sketching out the gallery before everything is written.',
      status: 'draft',
    },
  ],
};

export const galleryArticles: GalleryArticle[] = gallery.articles;

export function findGalleryArticle(slug: string) {
  const article = galleryArticles.find(a => a.slug === slug);
  return article ? { article } : null;
}

export function getPublishedGallerySlugs(): string[] {
  return galleryArticles.filter(a => a.status === 'published').map(a => a.slug);
}

export function getAllGallerySlugs(): string[] {
  return galleryArticles.map(a => a.slug);
}
