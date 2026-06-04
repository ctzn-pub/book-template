import type { Metadata } from 'next';
import { BookHome } from '@/components/Book/BookHome';
import { book } from '@/lib/book-toc';

export const metadata: Metadata = {
  title: `${book.title} — Book layout`,
  description: book.subtitle,
};

export default function BookHomePage() {
  return (
    <BookHome
      book={book}
      basePath="/book"
      kicker="A one-line description of your book — what it argues, and from what evidence."
      attribution="Built with the ctzn.pub book-template. Replace this line with your byline, license, or data sources."
    />
  );
}
