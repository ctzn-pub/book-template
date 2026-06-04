'use client';

import * as React from 'react';
import { Palette, Check } from 'lucide-react';
import { themes, type ThemeName } from '@/viz/theme/themes';
import { useTheme, THEME_LABELS } from '@/components/Book/ThemeProvider';

/**
 * Reader-facing theme picker. Renders a small "Theme" button that opens a
 * menu of the registered visual themes (Editorial / Times / FT / Economist /
 * Bloomberg). Picking one flips the whole book — chrome, prose, and charts —
 * via <ThemeProvider>.
 *
 * Each menu row shows a three-swatch preview (surface / ink / accent) pulled
 * straight from the theme object, so the choice is visible before committing.
 */
export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const names = Object.keys(themes) as ThemeName[];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change visual theme"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-body hover:bg-card transition-colors"
      >
        <Palette className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Visual theme
          </p>
          {names.map((name) => {
            const t = themes[name];
            const active = name === theme;
            return (
              <button
                key={name}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-body hover:bg-card transition-colors"
              >
                <span
                  className="flex h-4 w-7 shrink-0 overflow-hidden rounded-sm border border-border"
                  aria-hidden
                >
                  <span className="flex-1" style={{ background: t.surface }} />
                  <span className="flex-1" style={{ background: t.fg }} />
                  <span className="flex-1" style={{ background: t.accent }} />
                </span>
                <span className="flex-1" style={{ fontFamily: t.fontTitle }}>
                  {THEME_LABELS[name]}
                </span>
                {active && <Check className="h-3.5 w-3.5 text-link" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
