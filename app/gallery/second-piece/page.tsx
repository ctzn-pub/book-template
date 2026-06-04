import type { Metadata } from 'next';
import { GalleryShell } from '@/components/Gallery/GalleryShell';
import { gallery, findGalleryArticle } from '@/lib/gallery-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `A Second, Unrelated Piece | ${gallery.title}`,
  description: 'Another independent gallery article on a different topic.',
};

export default function Page() {
  return (
    <GalleryShell slug="second-piece" gallery={gallery} findArticle={findGalleryArticle} basePath="/gallery">
      <Article />
    </GalleryShell>
  );
}
