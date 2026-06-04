import type { Article, Book } from '@/lib/book-types';

/**
 * The book's table of contents — the single source of truth for structure
 * and navigation. Edit this to shape your book.
 *
 * Hierarchy: a Book has Parts; a Part has Chapters; a Chapter has Articles.
 * For a simple book, one Part with several Chapters (one Article each) is
 * plenty — Parts exist for longer works that group chapters into sections.
 *
 * Each Article needs:
 *   - `slug`   the URL path AND the folder name under app/<slug>/.
 *   - `number` shown in the UI ("Ch. 1", or "§1.2" for a sub-section).
 *   - `title`  short title for nav and breadcrumbs.
 *   - `status` 'published' renders the article; 'draft' / 'planned' show a
 *              placeholder via the catch-all app/[slug] route (no folder
 *              needed yet) — handy for sketching the whole TOC up front.
 *
 * The starter ships ONE worked chapter (`ch01-getting-started`) that shows
 * every layout component, plus two planned stubs so you can see how the
 * status system and the placeholder route behave. Replace all of it.
 */
export const book: Book = {
  title: 'Your Book Title',
  subtitle: 'A short, evocative subtitle that says what the book is about',
  parts: [
    {
      numeral: 'I',
      title: 'Part One',
      chapters: [
        {
          number: 1,
          title: 'Getting Started: A Tour of the Components',
          articles: [
            { slug: 'ch01-getting-started', number: '1', title: 'Getting Started', status: 'published' },
          ],
        },
        {
          number: 2,
          title: 'Your Second Chapter',
          articles: [
            { slug: 'ch02-second-chapter', number: '2', title: 'Your Second Chapter', status: 'planned' },
          ],
        },
      ],
    },
    {
      numeral: 'II',
      title: 'Part Two',
      chapters: [
        {
          number: 3,
          title: 'Your Third Chapter',
          articles: [
            { slug: 'ch03-third-chapter', number: '3', title: 'Your Third Chapter', status: 'planned' },
          ],
        },
      ],
    },
  ],
};

export const allArticles: Array<Article & { partNumeral: string; chapter: number }> =
  book.parts.flatMap(part =>
    part.chapters.flatMap(ch =>
      ch.articles.map(a => ({ ...a, partNumeral: part.numeral, chapter: ch.number }))
    )
  );

export function findArticle(slug: string) {
  const idx = allArticles.findIndex(a => a.slug === slug);
  if (idx === -1) return null;
  return {
    article: allArticles[idx],
    prev: idx > 0 ? allArticles[idx - 1] : null,
    next: idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
  };
}

export function getPublishedSlugs(): string[] {
  return allArticles.filter(a => a.status === 'published').map(a => a.slug);
}

export function getAllSlugs(): string[] {
  return allArticles.map(a => a.slug);
}
