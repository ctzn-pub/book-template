import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

/**
 * All colors resolve to CSS custom properties defined in app/globals.css,
 * which in turn derive from the active viz theme (`--viz-*`, switched by the
 * `data-viz-theme` attribute). So changing the theme re-tones every class
 * below — there are no baked-in hex values here.
 */
const config: Config = {
  // Both Bloomberg and Slate are dark themes — either triggers `dark:` utilities.
  darkMode: ['class', '[data-viz-theme="bloomberg"], [data-viz-theme="slate"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './viz/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'var(--color-surface)',
          card: 'var(--color-card)',
          cardHover: 'var(--color-card-hover)',
          border: 'var(--color-border)',
          primary: 'var(--color-link)',
          secondary: 'var(--color-link-hover)',
          text: 'var(--color-body)',
          muted: 'var(--color-muted)',
          subtle: 'var(--color-subtle-bg)',
        },
        // Article design tokens — the Distill-style components read these
        // ("bg-surface", "text-body", "text-muted", "border-border", …).
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        'code-bg': 'var(--color-code-bg)',
        body: 'var(--color-body)',
        subtle: 'var(--color-subtle)',
        muted: 'var(--color-muted)',
        link: 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
      },
      fontFamily: {
        // The webfont is always loaded (next/font sets --font-inter etc.);
        // the theme decides which stack to prefer via --font-book-*.
        sans: ['var(--font-book-sans)', 'var(--font-inter)', 'sans-serif'],
        display: ['var(--font-book-display)', 'var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      typography: {
        // Flip the default `prose` (and `prose-neutral`) palette to the tokens
        // so MDX body copy re-tones with the theme.
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-subtle)',
            '--tw-prose-headings': 'var(--color-body)',
            '--tw-prose-lead': 'var(--color-subtle)',
            '--tw-prose-links': 'var(--color-link)',
            '--tw-prose-bold': 'var(--color-body)',
            '--tw-prose-counters': 'var(--color-muted)',
            '--tw-prose-bullets': 'var(--color-border-strong)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-quotes': 'var(--color-subtle)',
            '--tw-prose-quote-borders': 'var(--color-border-strong)',
            '--tw-prose-captions': 'var(--color-muted)',
            '--tw-prose-code': 'var(--color-body)',
            '--tw-prose-th-borders': 'var(--color-border-strong)',
            '--tw-prose-td-borders': 'var(--color-border)',
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
