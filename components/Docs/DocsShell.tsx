'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import type { Docs, DocsPage } from '@/lib/docs-types';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface DocsShellProps {
  /** The current page (resolved by the route — DocsShell is a client component, so it can't take a lookup *function*). */
  page: DocsPage;
  /** Previous / next page in sidebar order, for the optional footer links. */
  prev?: DocsPage | null;
  next?: DocsPage | null;
  docs: Docs;
  /** Route prefix the docs live under; pages link to `${basePath}/${slug}`. Default '/docs'. */
  basePath?: string;
  /** Link back to the format landing page. Pass null to hide. Default '/'. */
  homeHref?: string | null;
  children: React.ReactNode;
}

/**
 * DocsShell — the DOCS format frame: a persistent left-sidebar table of
 * contents that's always open on desktop, plus a content column. On mobile the
 * sidebar collapses behind a hamburger and slides in as an overlay.
 *
 * Unlike the Book's chapter drawer (a floating pill that opens on demand), the
 * docs sidebar is the primary, ever-present navigation — the reference reading
 * model (Fumadocs / Docusaurus).
 */
export function DocsShell({ page, prev = null, next = null, docs, basePath = '/docs', homeHref = '/', children }: DocsShellProps) {
  const slug = page.slug;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="bg-surface text-body min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lg:hidden -ml-1 rounded-md p-2 text-muted hover:text-body hover:bg-card transition-colors"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            {homeHref && (
              <Link href={homeHref} className="hidden sm:inline text-sm text-muted hover:text-link transition-colors">
                ← Formats
              </Link>
            )}
            {homeHref && <span className="hidden sm:inline text-subtle">/</span>}
            <Link href={basePath} className="text-sm font-display font-semibold text-body hover:text-link transition-colors">
              {docs.title}
            </Link>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* desktop sidebar — always open, sticky under the top bar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border">
          <div className="sticky top-[49px] max-h-[calc(100vh-49px)] overflow-y-auto px-4 py-8">
            <SidebarNav docs={docs} basePath={basePath} currentSlug={slug} />
          </div>
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-surface border-r border-border overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-display font-semibold text-body">{docs.title}</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-md p-2 text-muted hover:text-body hover:bg-card transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 py-6">
                <SidebarNav docs={docs} basePath={basePath} currentSlug={slug} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* content column */}
        <main className="min-w-0 flex-1">
          <article className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-12 prose prose-neutral">
            <header className="mb-8 not-prose">
              <h1 className="text-3xl font-display font-semibold text-body sm:text-4xl">{page.title}</h1>
            </header>
            {children}
          </article>

          {(prev || next) && (
            <nav className="mx-auto max-w-3xl px-6 lg:px-10 pb-12 flex items-stretch gap-4">
              <div className="flex-1">
                {prev && (
                  <Link
                    href={`${basePath}/${prev.slug}`}
                    className="block rounded-md border border-border p-4 hover:border-border-strong transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted">← Previous</p>
                    <p className="mt-1 text-sm font-medium text-body">{prev.title}</p>
                  </Link>
                )}
              </div>
              <div className="flex-1">
                {next && (
                  <Link
                    href={`${basePath}/${next.slug}`}
                    className="block rounded-md border border-border p-4 text-right hover:border-border-strong transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted">Next →</p>
                    <p className="mt-1 text-sm font-medium text-body">{next.title}</p>
                  </Link>
                )}
              </div>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarNav({
  docs,
  basePath,
  currentSlug,
  onNavigate,
}: {
  docs: Docs;
  basePath: string;
  currentSlug: string;
  onNavigate?: () => void;
}) {
  return (
    <nav>
      <ol className="space-y-7">
        {docs.sections.map((section) => (
          <li key={section.title}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{section.title}</p>
            <ul className="mt-2 space-y-0.5">
              {section.pages.map((p) => {
                const isCurrent = p.slug === currentSlug;
                const isLinkable = p.status === 'published' || isCurrent;
                if (!isLinkable) {
                  return (
                    <li key={p.slug}>
                      <span className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted">
                        {p.title}
                        <span className="rounded bg-card px-1 py-0 text-[9px] uppercase tracking-wider text-subtle font-mono">
                          {p.status}
                        </span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={p.slug}>
                    <Link
                      href={`${basePath}/${p.slug}`}
                      onClick={onNavigate}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={[
                        'block rounded-md px-2.5 py-1.5 text-sm transition-colors',
                        isCurrent
                          ? 'bg-card font-medium text-body border-l-2 border-link'
                          : 'text-subtle hover:bg-card hover:text-body',
                      ].join(' ')}
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  );
}
