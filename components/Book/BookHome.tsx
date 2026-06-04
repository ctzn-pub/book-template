'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Book, Part } from '@/lib/book-types';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface BookHomeProps {
  book: Book;
  kicker?: string | null;
  attribution?: React.ReactNode | null;
}

const DEFAULT_KICKER = 'A short, one-line description of your book';

/**
 * Format an article number for display.
 *  - "2.2" → "§2.2"  (a sub-section of a multi-article chapter)
 *  - "13"  → "Ch. 13" (a single-article chapter; no section symbol)
 */
function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

const DEFAULT_ATTRIBUTION: React.ReactNode = (
  <>
    Built with the{' '}
    <code className="rounded bg-card px-1 py-0.5 text-[11px]">ctzn.pub</code> book-template.
  </>
);

// Per-part background washes. Rather than fixed off-white tints (which would
// blow out on a dark theme), each band is a faint top-down gradient mixed from
// the active theme's accent + surface, alternating strength by index. On light
// themes this reads as a subtle warm/cool separation between Parts; on the
// Bloomberg dark theme it stays a quiet near-surface wash.
function partTintStyle(index: number): React.CSSProperties {
  const strength = index % 2 === 0 ? 6 : 3; // percent of accent at the top
  return {
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, var(--viz-accent) ${strength}%, var(--color-surface)), var(--color-surface) 70%)`,
  };
}

export function BookHome({ book, kicker = DEFAULT_KICKER, attribution = DEFAULT_ATTRIBUTION }: BookHomeProps) {
  const publishedCount = book.parts
    .flatMap(p => p.chapters)
    .flatMap(c => c.articles)
    .filter(a => a.status === 'published').length;
  const totalCount = book.parts
    .flatMap(p => p.chapters)
    .flatMap(c => c.articles).length;

  return (
    <div className="bg-surface text-body">
      {/* Floating theme picker, top-right over the hero. */}
      <div className="absolute right-4 top-4 z-50 sm:right-6 sm:top-6">
        <ThemeSwitcher />
      </div>
      {/* Hero — asymmetric, big-type editorial cover. The wash is derived from
          the active theme's surface + accent so it reads on light and dark. */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to bottom right, color-mix(in srgb, var(--viz-accent) 7%, var(--color-surface)), var(--color-surface) 55%, color-mix(in srgb, var(--viz-accent) 5%, var(--color-surface)))',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            {kicker !== null && (
              <p className="text-xs uppercase tracking-[0.18em] text-muted mb-6">
                {kicker}
              </p>
            )}
            <h1 className="font-display font-semibold tracking-tight text-body leading-[0.95] text-5xl sm:text-6xl lg:text-8xl xl:text-9xl">
              {book.title}
            </h1>
            <p className="mt-8 text-lg lg:text-2xl text-subtle max-w-2xl leading-snug">
              {book.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 lg:text-right"
          >
            <div className="flex flex-col gap-4 lg:items-end">
              <div className="text-sm font-mono text-muted">
                <span className="text-body font-semibold tabular-nums">{publishedCount}</span>
                <span className="text-muted"> of </span>
                <span className="tabular-nums">{totalCount}</span>
                <span className="text-muted"> articles published</span>
              </div>
              <div className="text-xs text-muted max-w-xs lg:text-right">
                Six parts. Fifteen chapters. Five decades of survey data.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Parts — each is a full-bleed band with a faint theme-derived tint */}
      {book.parts.map((part, i) => (
        <PartBand key={part.numeral} part={part} index={i} />
      ))}

      {attribution !== null && (
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 text-xs text-muted">
            {attribution}
          </div>
        </footer>
      )}
    </div>
  );
}

function PartBand({ part, index }: { part: Part; index: number }) {
  return (
    <section className="relative border-b border-border" style={partTintStyle(index)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Part header — pinned left */}
          <header className="lg:col-span-4 lg:sticky lg:top-32">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Part {part.numeral}
            </p>
            <h2 className="mt-3 font-display font-semibold tracking-tight text-body text-3xl lg:text-5xl leading-[1.05]">
              {part.title}
            </h2>
          </header>

          {/* Chapter tiles — right column */}
          <div className="lg:col-span-8 space-y-8">
            {part.chapters.map((chapter, ci) => {
              // Collapse rendering when a chapter has only one article.
              // Convention from the TOC: single-article chapters use the
              // chapter title as the topic and the article title as a
              // (sometimes shortened) restatement — showing both is
              // redundant noise. The chapter heading itself becomes the
              // link, with the chapter title as the canonical wording.
              const onlyArticle = chapter.articles.length === 1 ? chapter.articles[0] : null;
              const isCollapsed = onlyArticle !== null;

              return (
                <motion.div
                  key={chapter.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: ci * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-border/60 pt-6"
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-mono text-sm tabular-nums text-muted shrink-0">
                      {String(chapter.number).padStart(2, '0')}
                    </span>
                    {isCollapsed && onlyArticle ? (
                      onlyArticle.status === 'published' ? (
                        <Link
                          href={`/${onlyArticle.slug}`}
                          className="font-display font-semibold text-body text-xl lg:text-2xl leading-tight hover:text-link transition-colors group inline-flex items-baseline gap-2"
                        >
                          <span>{chapter.title}</span>
                          <span className="text-link opacity-0 group-hover:opacity-100 transition-opacity text-base">→</span>
                        </Link>
                      ) : (
                        <h3 className="font-display font-semibold text-body text-xl lg:text-2xl leading-tight inline-flex items-baseline gap-3">
                          <span>{chapter.title}</span>
                          <span className="rounded bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle font-mono">
                            {onlyArticle.status}
                          </span>
                        </h3>
                      )
                    ) : (
                      <h3 className="font-display font-semibold text-body text-xl lg:text-2xl leading-tight">
                        {chapter.title}
                      </h3>
                    )}
                  </div>

                  {!isCollapsed && (
                    <ul className="space-y-1.5 ml-9">
                      {chapter.articles.map(article => (
                        <li key={article.slug} className="flex items-baseline gap-3">
                          <span className="w-16 shrink-0 text-xs tabular-nums text-muted">
                            {formatArticleNumber(article.number)}
                          </span>
                          {article.status === 'published' ? (
                            <Link
                              href={`/${article.slug}`}
                              className="text-sm text-link hover:text-link-hover transition-colors group inline-flex items-baseline gap-2"
                            >
                              <span className="border-b border-transparent group-hover:border-link-hover transition-colors">
                                {article.title}
                              </span>
                              <span className="text-link-hover opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-muted inline-flex items-baseline gap-2">
                              <span>{article.title}</span>
                              <span className="rounded bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle font-mono">
                                {article.status}
                              </span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default BookHome;
