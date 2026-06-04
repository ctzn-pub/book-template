import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Ch. 1 Getting Started | ${book.title}`,
  description:
    'A tour of every layout and chart component the template ships with. Replace this chapter with your own.',
};

export default function Page() {
  return (
    <BookShell slug="ch01-getting-started" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
