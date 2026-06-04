'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface SlidesShellProps {
  title: string;
  /** One node per slide. Each fills the viewport. */
  slides: React.ReactNode[];
  /** Link back to the format landing page. Pass null to hide. Default '/'. */
  homeHref?: string | null;
}

/**
 * SlidesShell — MDX as a deck. Full-viewport vertical sections you advance
 * with the arrow keys (↑/↓, PageUp/PageDown, Space), the scroll wheel, or the
 * on-screen buttons. A dot rail shows position; a top progress bar fills as you
 * go. Built on CSS scroll-snap so scroll + mobile work without extra JS.
 *
 * Theme-aware — slides inherit the surface/ink/accent tokens.
 */
export function SlidesShell({ title, slides, homeHref = '/' }: SlidesShellProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const count = slides.length;

  const goTo = React.useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(count - 1, i));
      const container = containerRef.current;
      if (!container) return;
      const target = container.children[clamped] as HTMLElement | undefined;
      target?.scrollIntoView({ behavior: 'smooth' });
    },
    [count],
  );

  // Track which slide is in view (the snap target nearest the top).
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = Array.from(container.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = sections.indexOf(e.target as HTMLElement);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { root: container, threshold: 0.6 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [count]);

  // Keyboard navigation.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        goTo(active + 1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        goTo(active - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(count - 1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, count, goTo]);

  return (
    <div className="bg-surface text-body">
      {/* progress bar */}
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-card">
        <div
          className="h-full bg-link transition-[width] duration-300"
          style={{ width: `${count > 1 ? (active / (count - 1)) * 100 : 100}%` }}
        />
      </div>

      {/* top bar */}
      <div className="fixed inset-x-0 top-1 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            {homeHref && (
              <>
                <Link href={homeHref} className="text-muted hover:text-link transition-colors">
                  ← Formats
                </Link>
                <span className="text-subtle">/</span>
              </>
            )}
            <span className="font-display font-semibold text-body">{title}</span>
            <span className="text-xs tabular-nums text-muted">
              {active + 1} / {count}
            </span>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* dot rail */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => goTo(i)}
            className={[
              'h-2.5 w-2.5 rounded-full border border-border transition-colors',
              i === active ? 'bg-link border-link' : 'bg-transparent hover:bg-card',
            ].join(' ')}
          />
        ))}
      </div>

      {/* prev / next buttons */}
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          className="rounded-full border border-border bg-surface/90 p-2 text-body backdrop-blur hover:bg-card disabled:opacity-30 transition-colors"
        >
          <ChevronUp size={18} />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(active + 1)}
          disabled={active === count - 1}
          className="rounded-full border border-border bg-surface/90 p-2 text-body backdrop-blur hover:bg-card disabled:opacity-30 transition-colors"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* the deck — scroll-snap container */}
      <div
        ref={containerRef}
        className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth"
      >
        {slides.map((slide, i) => (
          <section
            key={i}
            className="flex min-h-screen snap-start items-center justify-center px-6 py-20"
          >
            <div className="prose prose-neutral max-w-2xl text-center">{slide}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
