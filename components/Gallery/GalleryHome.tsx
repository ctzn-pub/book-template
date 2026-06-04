import * as React from 'react';
import Link from 'next/link';
import type { Gallery, GalleryArticle } from '@/lib/gallery-types';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface GalleryHomeProps {
  gallery: Gallery;
  /** Route prefix the gallery lives under; cards link to `${basePath}/${slug}`. Default '/gallery'. */
  basePath?: string;
  /** Link back to the format landing page. Pass null to hide. Default '/'. */
  homeHref?: string | null;
}

/**
 * GalleryHome — the front page for the GALLERY format. A responsive grid of
 * cards, one per independent article (title + blurb). Unlike the Book format's
 * editorial cover, there's no sequence and no chapters — just a collection.
 *
 * Theme-aware via the design tokens.
 */
export function GalleryHome({ gallery, basePath = '/gallery', homeHref = '/' }: GalleryHomeProps) {
  return (
    <div className="bg-surface text-body min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-10 py-3">
          <div className="flex items-center gap-3 text-sm">
            {homeHref && (
              <>
                <Link href={homeHref} className="text-muted hover:text-link transition-colors">
                  ← Formats
                </Link>
                <span className="text-subtle">/</span>
              </>
            )}
            <span className="font-display font-semibold text-body">{gallery.title}</span>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 lg:px-10 pt-16 pb-10 lg:pt-20">
        <h1 className="font-display text-4xl font-semibold leading-tight text-body sm:text-5xl">
          {gallery.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-subtle">{gallery.tagline}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-10 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.articles.map((article) => (
            <GalleryCard key={article.slug} article={article} basePath={basePath} />
          ))}
        </div>
      </section>
    </div>
  );
}

function GalleryCard({ article, basePath }: { article: GalleryArticle; basePath: string }) {
  const isLive = article.status === 'published';

  const inner = (
    <>
      {!isLive && (
        <span className="self-start rounded bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle font-mono">
          {article.status}
        </span>
      )}
      <h2 className="font-display text-xl font-semibold text-body">{article.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-subtle">{article.blurb}</p>
      {isLive && (
        <p className="mt-4 text-sm font-medium text-link group-hover:text-link-hover transition-colors">
          Read →
        </p>
      )}
    </>
  );

  const cardClass = 'group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors';

  if (isLive) {
    return (
      <Link href={`${basePath}/${article.slug}`} className={`${cardClass} hover:border-border-strong`}>
        {inner}
      </Link>
    );
  }
  return <div className={`${cardClass} opacity-60`}>{inner}</div>;
}
