// Theme configuration shared by the server layout and the client provider.
// NO 'use client' here on purpose: app/layout.tsx (a Server Component) imports
// `themeNoFlashScript` to inline it in <head>, and a client module's exports
// can't be *called* from the server. Keeping this plain data + a string
// builder lets both sides use it.

import { themes, defaultTheme, type ThemeName } from '@/viz/theme/themes';

export const THEME_STORAGE_KEY = 'book-theme';

export const THEME_LABELS: Record<ThemeName, string> = {
  editorial: 'Editorial',
  times: 'Times',
  ft: 'FT',
  economist: 'Economist',
  bloomberg: 'Bloomberg',
};

/** Theme names in display order, derived from the registry (never hand-listed). */
export const THEME_NAMES = Object.keys(themes) as ThemeName[];

export const DEFAULT_THEME_NAME = defaultTheme.name as ThemeName;

export function isThemeName(value: string | null): value is ThemeName {
  return !!value && value in themes;
}

/**
 * Inline script string for app/layout.tsx <head>. Runs before paint to apply
 * the saved theme (or the default) to <html>, preventing a theme flash on
 * load. Dependency-free and tiny on purpose.
 */
export function themeNoFlashScript(defaultThemeName: ThemeName = DEFAULT_THEME_NAME): string {
  return `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var valid=${JSON.stringify(
    THEME_NAMES,
  )};document.documentElement.setAttribute('data-viz-theme', valid.indexOf(t)>-1?t:'${defaultThemeName}');}catch(e){document.documentElement.setAttribute('data-viz-theme','${defaultThemeName}');}})();`;
}
