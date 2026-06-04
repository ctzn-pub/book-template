import type { Metadata } from 'next';
import { GalleryHome } from '@/components/Gallery/GalleryHome';
import { gallery } from '@/lib/gallery-toc';

export const metadata: Metadata = {
  title: `${gallery.title} — Gallery layout`,
  description: gallery.tagline,
};

export default function GalleryHomePage() {
  return <GalleryHome gallery={gallery} basePath="/gallery" homeHref="/" />;
}
