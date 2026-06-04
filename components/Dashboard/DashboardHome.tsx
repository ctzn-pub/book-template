'use client';

import * as React from 'react';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/Book/ThemeSwitcher';

export interface Kpi {
  label: string;
  value: string;
  /** Optional delta line, e.g. "+12% vs last quarter". Sign drives color. */
  delta?: string;
  /** Optional one-line context under the value. */
  note?: string;
}

export interface DashboardHomeProps {
  title: string;
  tagline?: string;
  kpis: Kpi[];
  /** Link back to the format landing page. Pass null to hide. Default '/'. */
  homeHref?: string | null;
  /** The body — typically a grid of <DashboardCard> panels. */
  children: React.ReactNode;
}

/**
 * DashboardHome — a single-page report layout: a header, a row of KPI stat
 * cards, then a grid of chart/section panels. For data *reports* rather than
 * prose; everything is on one scrollable page. Theme-aware.
 */
export function DashboardHome({ title, tagline, kpis, homeHref = '/', children }: DashboardHomeProps) {
  return (
    <div className="bg-surface text-body min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
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
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tagline && <p className="mb-6 text-sm text-muted">{tagline}</p>}

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* panels */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">{children}</div>
      </div>
    </div>
  );
}

function deltaColor(delta: string): string {
  const t = delta.trim();
  if (t.startsWith('+')) return 'text-green-600';
  if (t.startsWith('-') || t.startsWith('−')) return 'text-red-600';
  return 'text-muted';
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{kpi.label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-body">{kpi.value}</p>
      {kpi.delta && <p className={`mt-1 text-sm font-medium tabular-nums ${deltaColor(kpi.delta)}`}>{kpi.delta}</p>}
      {kpi.note && <p className="mt-1 text-xs text-muted">{kpi.note}</p>}
    </div>
  );
}

/**
 * DashboardCard — a titled panel in the dashboard grid. Drop a chart, table,
 * or list inside. Pass `wide` to span both columns on large screens.
 */
export function DashboardCard({
  title,
  subtitle,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card p-5 ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="mb-3">
        <h2 className="font-display text-base font-semibold text-body">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
