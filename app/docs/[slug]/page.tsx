import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsShell } from '@/components/Docs/DocsShell';
import { docs, findDocsPage, getAllDocsSlugs } from '@/lib/docs-toc';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocsSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = findDocsPage(slug);
  if (!found) {
    return { title: 'Not found' };
  }
  return { title: `${found.page.title} | ${docs.title}` };
}

export default async function DocsCatchAllPage({ params }: Props) {
  const { slug } = await params;
  const found = findDocsPage(slug);
  if (!found) {
    notFound();
  }

  return (
    <DocsShell page={found.page} prev={found.prev} next={found.next} docs={docs} basePath="/docs">
      <p className="text-muted italic">
        This page is not yet written. Mark it <span className="font-mono">published</span> in{' '}
        <span className="font-mono">lib/docs-toc.ts</span> and add an{' '}
        <span className="font-mono">app/docs/{slug}/</span> folder to write it.
      </p>
      <p className="text-muted">
        Status: <span className="font-mono">{found.page.status}</span>
      </p>
    </DocsShell>
  );
}
