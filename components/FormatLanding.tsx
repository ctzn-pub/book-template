import * as React from 'react';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

/**
 * The template's front door. This repo ships more than one *layout format* —
 * a sequential Book, a flat Gallery of independent articles, and (planned) a
 * docs-style sidebar layout. This page lets a visitor jump to a live demo of
 * each, and reminds the author that they pick ONE format for their own site
 * (then delete this landing page and the formats they don't use).
 *
 * Everything here is theme-aware via the design tokens, so the format picker
 * re-tones with the rest of the template.
 */

type Format = {
  href: string | null;
  eyebrow: string;
  title: string;
  blurb: string;
  bullets: string[];
  status: 'live' | 'planned';
};

const FORMATS: Format[] = [
  {
    href: '/book',
    eyebrow: 'Format 01',
    title: 'Book',
    blurb:
      'A sequential, long-form work. Parts → chapters → articles, an editorial cover, a chapter table-of-contents drawer, and prev/next navigation that carries the reader straight through.',
    bullets: ['Multi-part structure', 'Chapter TOC drawer', 'Prev / next reading flow'],
    status: 'live',
  },
  {
    href: '/gallery',
    eyebrow: 'Format 02',
    title: 'Gallery',
    blurb:
      'A collection of unrelated standalone articles. The front page is a grid of cards; each piece stands on its own with a back-to-gallery link. No sequence, no chapters.',
    bullets: ['Card-grid front page', 'Independent articles', 'Back-to-gallery navigation'],
    status: 'live',
  },
  {
    href: '/docs',
    eyebrow: 'Format 03',
    title: 'Docs',
    blurb:
      'A reference layout with a persistent, always-open left sidebar of contents and a content column beside it — the Fumadocs / Docusaurus reading model.',
    bullets: ['Always-open left sidebar', 'Reference reading model', 'Collapsible on mobile'],
    status: 'live',
  },
];

export function FormatLanding() {
  return (
    <div className="bg-surface text-body min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-10 py-3">
          <span className="text-sm font-display font-semibold text-body">ctzn.pub · book-template</span>
          <ThemeSwitcher />
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 pt-16 pb-10 lg:pt-24 lg:pb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">A multi-format publishing starter</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-body sm:text-5xl">
          One template, several ways to publish.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-subtle">
          Pick the layout that fits your content — a sequential book, a gallery of
          independent pieces, or a docs-style sidebar. Each is a live demo below.
          They share the same components, typography, and five switchable themes
          (try the <span className="font-medium text-body">Theme</span> button,
          top-right).
        </p>
      </section>

      {/* format cards */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FORMATS.map((f) => (
            <FormatCard key={f.title} format={f} />
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted">
          Building your own site? Keep one format, delete the rest, and make it your
          root route. See the README for how each is wired.
        </p>
      </section>
    </div>
  );
}

function FormatCard({ format }: { format: Format }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">{format.eyebrow}</span>
        {format.status === 'planned' ? (
          <span className="rounded bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle font-mono">
            Planned
          </span>
        ) : (
          <span className="text-link opacity-0 transition-opacity group-hover:opacity-100">→</span>
        )}
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold text-body">{format.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-subtle">{format.blurb}</p>
      <ul className="mt-4 space-y-1.5">
        {format.bullets.map((b) => (
          <li key={b} className="flex items-baseline gap-2 text-sm text-muted">
            <span className="text-link" aria-hidden>
              ·
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {format.status === 'live' && (
        <p className="mt-5 text-sm font-medium text-link group-hover:text-link-hover transition-colors">
          View the {format.title.toLowerCase()} demo →
        </p>
      )}
    </>
  );

  const cardClass =
    'group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors';

  if (format.href) {
    return (
      <Link href={format.href} className={`${cardClass} hover:border-border-strong`}>
        {inner}
      </Link>
    );
  }
  return <div className={`${cardClass} opacity-70`}>{inner}</div>;
}
