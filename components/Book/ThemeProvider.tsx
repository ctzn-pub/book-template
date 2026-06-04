'use client';

import * as React from 'react';
import { VizThemeProvider } from '@/viz/theme/provider';
import { type ThemeName } from '@/viz/theme/themes';
import {
  THEME_STORAGE_KEY,
  THEME_NAMES,
  DEFAULT_THEME_NAME,
  isThemeName,
} from '@/components/Book/theme-config';

// Re-export the shared config so existing imports from this module keep
// working. NOTE: `themeNoFlashScript` is intentionally NOT re-exported here —
// it must be imported from theme-config directly by the server layout, because
// a function re-exported through this 'use client' boundary becomes a client
// reference and can't be called server-side.
export {
  THEME_STORAGE_KEY,
  THEME_LABELS,
  THEME_NAMES,
  DEFAULT_THEME_NAME,
} from '@/components/Book/theme-config';

/**
 * One switch, whole book. This provider is the single owner of the active
 * visual theme. It does two things at once:
 *
 *   1. Sets `data-viz-theme="<name>"` on <html>, which flips the `--viz-*`
 *      CSS variables (viz-theme.css). Those cascade into the book's
 *      `--color-*` tokens (globals.css), re-toning page chrome + prose.
 *   2. Wraps children in <VizThemeProvider>, so Recharts / Plot charts read
 *      the SAME theme via `useVizTheme()` and re-color to match.
 *
 * Because both paths read one theme name, prose and charts can never drift.
 *
 * The chosen theme persists to localStorage. A tiny inline script in
 * app/layout.tsx applies the saved theme to <html> BEFORE first paint, so
 * there's no flash of the default theme on reload (see `themeNoFlashScript`
 * in theme-config.ts).
 */

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  themes: ThemeName[];
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
}

export function ThemeProvider({
  children,
  defaultThemeName = DEFAULT_THEME_NAME,
}: {
  children: React.ReactNode;
  defaultThemeName?: ThemeName;
}) {
  // Read the no-flash script's choice (already on <html>) so the first React
  // render matches the DOM and we avoid a hydration mismatch.
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-viz-theme');
      if (isThemeName(attr)) return attr;
    }
    return defaultThemeName;
  });

  const setTheme = React.useCallback((next: ThemeName) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-viz-theme', next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private mode / storage disabled — theme still applies for the session */
    }
  }, []);

  // Keep the attribute in sync if state changes by any other path.
  React.useEffect(() => {
    document.documentElement.setAttribute('data-viz-theme', theme);
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: THEME_NAMES }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <VizThemeProvider theme={theme}>{children}</VizThemeProvider>
    </ThemeContext.Provider>
  );
}
