import type { Metadata } from 'next';
import { FormatLanding } from '@/components/FormatLanding';

export const metadata: Metadata = {
  title: 'ctzn.pub book-template — layout formats',
  description:
    'A multi-format publishing starter: a sequential book, a gallery of independent articles, and a docs-style sidebar layout. Five switchable themes.',
};

export default function HomePage() {
  return <FormatLanding />;
}
