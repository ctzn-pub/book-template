import * as React from 'react';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface MagazineShellProps {
  /** Small label above the title (e.g. "Feature", "Essay"). */
  kicker?: string;
  title: string;
  /** Standfirst / deck — the large summary line under the title. */
  deck?: string;
  /** Byline + date line, e.g. "By A. Writer · June 2026". */
  byline?: string;
  /** Link back to the format landing page. Pass null to hide. Default '/'. */
  homeHref?: string | null;
  children: React.ReactNode;
}

/**
 * MagazineShell — a single immersive feature article. A full-bleed tinted
 * hero with oversized title + standfirst, then a generous single reading
 * column. Pair with the magazine MDX components (big pull-quotes, asymmetric
 * <Figure> outsets) for a longform-feature feel — the opposite of the Book's
 * multi-chapter structure.
 *
 * Theme-aware: the hero wash is mixed from the active theme's accent + surface.
 */
export function MagazineShell({ kicker, title, deck, byline, homeHref = '/', children }: MagazineShellProps) {
  return (
    <div className="bg-surface text-body min-h-screen">
      {/* minimal floating bar — magazine wants the hero to dominate */}
      <div className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {homeHref ? (
            <Link href={homeHref} className="text-sm text-muted hover:text-link transition-colors">
              ← Formats
            </Link>
          ) : (
            <span />
          )}
          <ThemeSwitcher />
        </div>
      </div>

      {/* full-bleed hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, color-mix(in srgb, var(--viz-accent) 14%, var(--color-surface)), var(--color-surface))',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 pt-28 pb-16 lg:pt-36 lg:pb-20 text-center">
          {kicker && (
            <p className="text-xs uppercase tracking-[0.25em] text-link">{kicker}</p>
          )}
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-body sm:text-6xl">
            {title}
          </h1>
          {deck && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-subtle sm:text-xl">
              {deck}
            </p>
          )}
          {byline && (
            <p className="mt-8 text-sm uppercase tracking-wider text-muted">{byline}</p>
          )}
        </div>
      </header>

      {/* reading column — slightly wider than the book for a feature feel */}
      <article className="mx-auto max-w-2xl px-6 py-14 prose prose-neutral prose-lg">
        {children}
      </article>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-2xl px-6 py-10 text-sm text-muted">
          {homeHref && (
            <Link href={homeHref} className="hover:text-link transition-colors">
              ← Back to all formats
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
