'use client';

import * as React from 'react';
import { useVizTheme } from "@/viz/theme/provider";

export interface StaticChartV1Props {
  /**
   * Resolved URL or path to the SVG. Caller is responsible for
   * resolving Tigris-relative keys to a usable URL or local path
   * before passing in. The component does no fetching.
   *
   * Acceptable forms:
   *   - Full URL:                "https://cdn.example.com/foo.svg"
   *   - Public CDN URL:          "https://t3.storage.dev/..."
   *   - App-local path:          "/articles/<slug>/data/foo.svg"
   *   - Inline data URI:         "data:image/svg+xml;..."
   */
  svgUrl: string;
  /**
   * Required for accessibility. Describe what the chart shows in
   * one sentence ("Republican confidence in science from 2010 to
   * 2024").
   */
  alt: string;
  /**
   * Optional source line shown below the image, matching the live-
   * chart envelope. If omitted, no source row renders.
   */
  source?: string;
  /**
   * Optional small text shown above the image as the chart title.
   * If your figure already provides a title via `<Figure caption>`,
   * leave this off — two titles look like noise.
   */
  title?: string;
  /**
   * Optional subtitle below the title (same role as the live chart's
   * subtitle). Same advice as `title` — only set if the surrounding
   * Figure isn't already providing context.
   */
  subtitle?: string;
}

/**
 * StaticChartV1 — a pre-rendered chart image (SVG/PNG) inside the standard
 * chart visual envelope (card, padding, optional title / subtitle, source
 * row). Pass the image URL via `svgUrl`.
 *
 * Reach for this when a frozen, pre-rendered chart is the editorial point —
 * an institutionally-published figure, a reference snapshot, or a spot where
 * interactive controls would distract. For live, interactive data prefer
 * `<TimeseriesLineV1>` / `<TimeseriesIndexV1>` (legend toggling, CI overlay).
 *
 * No fetch — the caller resolves the URL (e.g. an asset under `public/`).
 */
export function StaticChartV1({ svgUrl, alt, source, title, subtitle }: StaticChartV1Props) {
  // Active viz theme. With NO <VizThemeProvider> mounted this returns the
  // `editorial` default, so the card still renders standalone. `rc` carries
  // the surface/fg/muted colors and title font for the card chrome.
  const { rc } = useVizTheme();

  return (
    <div
      className="w-full rounded-lg shadow px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5"
      style={{ background: rc.surface }}
    >
      {(title || subtitle) && (
        <div className="mb-2">
          {title && (
            <h2 className="text-base font-semibold leading-snug" style={{ color: rc.fg, fontFamily: rc.fontTitle }}>{title}</h2>
          )}
          {subtitle && (
            <p className="text-xs mt-0.5 leading-snug" style={{ color: rc.muted }}>{subtitle}</p>
          )}
        </div>
      )}

      <div className="w-full">
        <img
          src={svgUrl}
          alt={alt}
          className="block w-full h-auto"
          loading="lazy"
        />
      </div>

      {source && (
        <div
          className="flex flex-col sm:flex-row justify-between items-center mt-3 sm:mt-1 pt-2 border-t"
          style={{ borderColor: rc.grid.stroke }}
        >
          <div className="text-xs text-left order-1 sm:order-none" style={{ color: rc.muted }}>
            Source: {source}
          </div>
        </div>
      )}
    </div>
  );
}

export default StaticChartV1;
