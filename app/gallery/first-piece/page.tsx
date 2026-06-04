import type { Metadata } from 'next';
import { GalleryShell } from '@/components/Gallery/GalleryShell';
import { gallery, findGalleryArticle } from '@/lib/gallery-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `A First Standalone Piece | ${gallery.title}`,
  description: 'An example gallery article — a self-contained essay with no reading sequence.',
};

export default function Page() {
  return (
    <GalleryShell slug="first-piece" gallery={gallery} findArticle={findGalleryArticle} basePath="/gallery">
      <Article />
    </GalleryShell>
  );
}
