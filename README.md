# book-template

A Next.js boilerplate for publishing a long-form, data-driven online book —
multi-part, multi-chapter, multi-article — built from MDX and embedded
Recharts figures. Distill-style typography, a sticky book bar, a chapter
table-of-contents drawer, a small library of editorial layout components
(drop caps, callouts, key numbers, side notes, pull quotes, small multiples,
tab sets, data tables), and **five switchable visual themes**.

The template ships with **one worked starter chapter** —
[`app/ch01-getting-started`](app/ch01-getting-started/article.mdx) — that
demonstrates every component with placeholder (lorem-ipsum) prose and dummy
chart data. Read it once as a tour, then replace it with your own book.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The book home page is
the front page; each article lives at `/<slug>`. Use the **Theme** button in
the top bar to switch visual themes.

To build for production:

```bash
pnpm build
pnpm start
```

## Visual themes

The whole book — page chrome, prose typography, **and** the charts — is
themed by a single attribute, `data-viz-theme`, on `<html>`. Five themes
ship, modeled on real editorial-press systems:

| Theme       | Look                                              |
|-------------|---------------------------------------------------|
| `editorial` | Monochrome ink on white (default). Quiet, Tufte-forward. |
| `times`     | Serif headlines, warm paper, navy/brick.          |
| `ft`        | Salmon-pink paper, serif heads, FT blue + claret. |
| `economist` | Cool grey paper, bold sans, single-red emphasis.  |
| `bloomberg` | Terminal amber on near-black. A **dark** theme.   |

The reader picks one with the `<ThemeSwitcher>` in the top bar; the choice
persists to `localStorage` and is applied before first paint (no flash).

### How it works (one source of truth)

```
viz/theme/{tokens,themes}.ts   the theme definitions (color, type, stroke)
        │  pnpm theme:css
        ▼
viz/theme/viz-theme.css        generated: a --viz-* block per theme,
        │                       keyed by [data-viz-theme="…"]
        ▼
app/globals.css                --color-* / font tokens DERIVE from --viz-*
        │                       (so they can never drift from the charts)
        ▼
tailwind.config.ts             bg-surface, text-body, font-display, prose …
```

`components/Book/ThemeProvider.tsx` owns the active theme: it sets
`data-viz-theme` on `<html>` (which flips the CSS tokens above) **and** wraps
the app in `<VizThemeProvider>` so charts read the same theme via
`useVizTheme()`. Because both paths read one name, prose and charts always
match.

### Changing or adding a theme

The themes live in the `viz/theme/` bundle, copied from the
[`ontopic-viz-components`](https://github.com/ctzn-pub/ontopic-viz-components)
registry. To retune or add one, edit `viz/theme/tokens.ts` /
`viz/theme/themes.ts`, then regenerate the CSS:

```bash
pnpm theme:css     # rewrites viz/theme/viz-theme.css
```

See [`viz/theme/THEME-AUTHORING.md`](viz/theme/THEME-AUTHORING.md) for the
full guide. To change the **default** theme, pass it to `<ThemeProvider>` in
`app/layout.tsx` (and to `themeNoFlashScript()`), or change `defaultTheme` in
`viz/theme/themes.ts`.

## Project layout

```
app/
  layout.tsx            Root layout — fonts, ThemeProvider, no-flash script.
  page.tsx              Front page — renders <BookHome>.
  globals.css           Theme token derivation (--color-* from --viz-*) + chrome.
  [slug]/page.tsx       Fallback route for any TOC entry without a dedicated
                        page.tsx (renders a placeholder — handy for stubs).
  ch01-getting-started/ The one worked starter chapter.
    page.tsx              Imports the MDX, wraps in <BookShell>.
    article.mdx           Lorem-ipsum tour of every component.
    data/*.json           Dummy chart data the chapter imports.
components/
  MainArea.tsx          The <main> wrapper.
  Book/
    ThemeProvider.tsx   Owns the active theme (CSS attr + VizThemeProvider).
    ThemeSwitcher.tsx   The reader-facing theme picker.
    theme-config.ts     Shared theme constants + the no-flash script string.
    BookShell.tsx       Sticky book bar + breadcrumb + footer nav.
    BookHome.tsx        Front-page layout (parts → chapters → articles).
    ChapterTocDrawer.tsx Floating "Contents" pill that opens the TOC.
    Figure.tsx          The Distill-style layout-zone wrapper.
    DropCap, KeyNumber, Callout, SideNote, PullQuote, Quote, Annotation,
    SmallMultiples, TabSet, DataTable, Step, SectionDivider,
    StaticChartV1      The article-component library.
    charts/
      timeseries-line-v1.tsx   The default chart component (theme-aware).
      timeseries-index-v1.tsx  Indexed (rebased-to-100) variant.
lib/
  book-toc.ts           The book's table of contents — single source of
                        truth for parts, chapters, article order.
  book-types.ts         Shared TS types (Book, Part, Chapter, Article).
  utils.ts              cn() — clsx + tailwind-merge.
viz/
  theme/                The chart + article theme system (see above).
  ui/{label,switch}.tsx Small Radix-backed primitives the chart uses.
  utils/cn.ts           Same cn() utility (chart-local copy).
public/                 Static assets (images, pre-rendered chart SVGs).
scripts/
  fetch-article-data.mjs  Optional: pull JSON aggregates from a remote bucket.
book.config.mjs         Optional per-article remote-data manifest.
mdx-components.tsx      MDX provider stub.
tailwind.config.ts      Token → CSS-variable mapping (no baked-in colors).
next.config.ts          Next + MDX wiring.
```

## Adding a new chapter

Three steps. None require touching component code.

### 1. Add a TOC entry

Edit [`lib/book-toc.ts`](lib/book-toc.ts). Add an article under a chapter:

```ts
{
  number: 2,
  title: 'My Chapter',
  articles: [
    { slug: 'ch02-my-article', number: '2', title: 'My Article', status: 'draft' },
  ],
},
```

`status` is `'planned' | 'draft' | 'published'`. Only `'published'` articles
are linked from the home page; all three render (non-published ones via the
`[slug]` placeholder route, so you can sketch a whole outline before writing).

### 2. Create the folder

```bash
mkdir -p app/ch02-my-article/data
```

Add a `page.tsx` mirroring the starter chapter:

```tsx
import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Ch. 2 My Article | ${book.title}`,
  description: 'A one-line description of the article.',
};

export default function Page() {
  return (
    <BookShell slug="ch02-my-article" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
```

### 3. Write the MDX

Open `app/ch02-my-article/article.mdx` and write. The editorial components
are imported per-file; copy the import block from
[`app/ch01-getting-started/article.mdx`](app/ch01-getting-started/article.mdx),
which shows every component in use.

## Data shape

Charts read JSON imported directly from `app/<slug>/data/*.json`. Each blob:

```json
{
  "metadata": {
    "title": "...",
    "subtitle": "...",
    "source": { "id": "example", "name": "..." },
    "demo_key": ["Series"],
    "demo_title": "Group"
  },
  "dataPointMetadata": [
    { "id": "year", "name": "Year", "type": "ordinal" },
    { "id": "value", "name": "%", "type": "quantitative", "value_suffix": "%" }
  ],
  "dataPoints": [
    { "year": "1976", "Series": "Group A", "value": 30.0, "n_actual": 800,
      "ci_lower": null, "ci_upper": null, "standard_error": 1.2 }
  ]
}
```

Years are **strings**. `value` is the point estimate in display units (a
percent, not a proportion). `n_actual`, CI bounds, and `standard_error` are
optional but enable hover-tooltip detail and the "Show 95% CI" toggle. The
`demographic` column name (here `Series`) is passed to the chart as the
`demographic` prop; its values are the `demographicGroups`. See
`app/ch01-getting-started/data/` for two complete examples.

### Chart colors follow the theme

The chart resolves series colors from the active theme — **don't** hard-code
hex. Series named with a political identity (`Democrat`/`Republican`,
`Liberal`/`Conservative`) automatically get that theme's party colors; any
other names take neutral categorical slots, by position.

## More chart components

This template bundles two time-series charts. For maps, scatter plots, forest
plots, ridge plots, slopegraphs, choropleths, and dozens more — all sharing
the same theme system — pull from the
[`ontopic-viz-components`](https://github.com/ctzn-pub/ontopic-viz-components)
registry with its `viz` CLI:

```bash
# one-time: clone + link the CLI (see that repo's README)
viz add recharts/gss/timeseries-line-v1
viz add plot/stats/forest-plot-v1
viz add maplibre/geo/choropleth-v1
```

`viz add` copies the component (and any `@/viz/ui` / `@/viz/utils` helpers it
needs) into your `viz/` tree and installs its npm deps. Because the theme
bundle here came from the same registry, added components theme themselves
with no extra wiring.

## Optional: fetching data from a remote bucket

The starter chapter ships its data locally, so you don't need this. If you
keep pre-aggregated JSON in a Tigris (S3-compatible) bucket, the included
fetch script can populate `app/<slug>/data/`:

```bash
cp .env.example .env      # fill in the TIGRIS_* values
# declare each article's files in book.config.mjs, then:
pnpm fetch-data                  # all articles
pnpm fetch-data ch02-my-article  # one article
```

Swap the body of `scripts/fetch-article-data.mjs` if your data lives
elsewhere — nothing else cares where the JSON came from. Delete the script
and `book.config.mjs` entirely if all your data is local.

## Editorial conventions

The `components/Book/` library is opinionated:

- **Number every figure**, sequentially through the article.
- **Captions state the finding**, not the variable name.
- **Cross-reference every figure** in the prose, by number, near the chart.
- **One `<DropCap>`, one `<KeyNumber>`, at most one `<PullQuote>`** per article.
- **`<Figure width="…">`** sets editorial weight: `body` (default),
  `body-outset` (~880px hero), `page-outset` (~1080px wide / grid),
  `screen-inset` (≤1 per article).
- **Wrap every chart in `<div className="not-prose">`** inside the `<Figure>`,
  so prose styling doesn't leak into the chart.

## Starting clean

When you're ready to remove the starter chapter:

1. Delete `app/ch01-getting-started/`.
2. Edit `lib/book-toc.ts` — replace the `book` constant with your outline.
3. Update the home-page copy in `app/page.tsx`.

The `[slug]` placeholder route renders any TOC entry that doesn't yet have a
`page.tsx`.

## License

MIT for the boilerplate code (components, scaffolding, scripts). The starter
chapter is placeholder content — replace it with your own work.
