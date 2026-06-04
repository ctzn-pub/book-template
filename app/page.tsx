import { BookHome } from '@/components/Book/BookHome';
import { book } from '@/lib/book-toc';

export default function HomePage() {
  return (
    <BookHome
      book={book}
      kicker="A one-line description of your book — what it argues, and from what evidence."
      attribution="Built with the ctzn.pub book-template. Replace this line with your byline, license, or data sources."
    />
  );
}
