import * as React from 'react';
import Link from 'next/link';
import type { Gallery, GalleryLookup } from '@/lib/gallery-types';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface GalleryShellProps {
  slug: string;
  gallery: Gallery;
  findArticle: (slug: string) => GalleryLookup;
  /** Route prefix the gallery lives under. Default '/gallery'. */
  basePath?: string;
  children: React.ReactNode;
}

/**
 * GalleryShell — the reading frame for a single GALLERY article. Like
 * BookShell, it supplies the sticky bar, the article title header, and prose
 * typography — but there is NO prev/next (gallery pieces are independent).
 * Instead, every article links back to the gallery.
 */
export function GalleryShell({ slug, gallery, findArticle, basePath = '/gallery', children }: GalleryShellProps) {
  const found = findArticle(slug);
  if (!found) {
    throw new Error(`GalleryShell: no article found for slug "${slug}"`);
  }
  const { article } = found;

  return (
    <div className="bg-surface text-body min-h-screen flex flex-col">
      <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12 py-2.5">
          <Link
            href={basePath}
            className="text-sm font-display font-semibold text-body hover:text-link transition-colors"
          >
            {gallery.title}
          </Link>
          <ThemeSwitcher />
        </div>
      </div>

      <nav className="mx-auto max-w-3xl w-full px-6 pt-8 text-sm text-muted">
        <Link href={basePath} className="hover:text-link">
          {gallery.title}
        </Link>
        <span className="mx-2 text-subtle">/</span>
        <span>{article.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl w-full px-6 py-10 prose prose-neutral">
        <header className="mb-10 not-prose">
          <h1 className="text-3xl font-display font-semibold text-body sm:text-4xl">
            {article.title}
          </h1>
        </header>
        {children}
      </article>

      <footer className="mt-auto border-t border-border bg-card">
        <nav className="mx-auto flex max-w-3xl px-6 py-8">
          <Link
            href={basePath}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-body hover:border-border-strong transition-colors"
          >
            <span aria-hidden>←</span>
            <span>All articles in {gallery.title}</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
