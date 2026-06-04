import type { Metadata } from 'next';
import { DocsShell } from '@/components/Docs/DocsShell';
import { docs, findDocsPage } from '@/lib/docs-toc';
import { notFound } from 'next/navigation';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Installation | ${docs.title}`,
  description: 'How to get the template running locally.',
};

export default function Page() {
  const found = findDocsPage('installation');
  if (!found) notFound();
  return (
    <DocsShell page={found.page} prev={found.prev} next={found.next} docs={docs} basePath="/docs">
      <Article />
    </DocsShell>
  );
}
