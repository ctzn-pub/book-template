import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GalleryShell } from '@/components/Gallery/GalleryShell';
import { gallery, findGalleryArticle, getAllGallerySlugs } from '@/lib/gallery-toc';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGallerySlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = findGalleryArticle(slug);
  if (!found) {
    return { title: 'Not found' };
  }
  return { title: `${found.article.title} | ${gallery.title}` };
}

export default async function GalleryArticlePage({ params }: Props) {
  const { slug } = await params;
  const found = findGalleryArticle(slug);
  if (!found) {
    notFound();
  }

  return (
    <GalleryShell slug={slug} gallery={gallery} findArticle={findGalleryArticle} basePath="/gallery">
      <p className="text-muted italic">
        This piece is not yet written. Mark it <span className="font-mono">published</span> in{' '}
        <span className="font-mono">lib/gallery-toc.ts</span> and add an{' '}
        <span className="font-mono">app/gallery/{slug}/</span> folder to write it.
      </p>
      <p className="text-muted">
        Status: <span className="font-mono">{found.article.status}</span>
      </p>
    </GalleryShell>
  );
}
