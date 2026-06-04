# book-template

A Next.js boilerplate for publishing data-driven MDX writing online, in more
than one **layout format**, with **five switchable visual themes**. Built from
MDX and embedded Recharts figures, with Distill-style typography and a library
of editorial layout components (drop caps, callouts, key numbers, side notes,
pull quotes, small multiples, tab sets, data tables, embeds).

It ships **three worked layouts** you can demo side by side, plus a landing page
that links to each:

| Format | Route | For |
| --- | --- | --- |
| **Book** | `/book` | A sequential, long-form work — parts → chapters → articles, an editorial cover, a chapter TOC drawer, prev/next reading flow. |
| **Gallery** | `/gallery` | A collection of *independent* articles — a card-grid front page, each piece standalone, back-to-gallery navigation. No sequence. |
| **Docs** | `/docs` | A reference layout — a persistent, always-open left-sidebar of sections and pages, collapsible to a drawer on mobile. The Fumadocs / Docusaurus model. |

Each ships worked, lorem-ipsum examples (the book's
[`ch01-getting-started`](app/book/ch01-getting-started/article.mdx) tours every
component; the gallery has two example pieces; the docs site has a few pages).
Read them, then keep the one format you want, delete the rest, and make it your
root route.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the format landing page,
then visit `/book` or `/gallery`. Use the **Theme** button (top-right) to switch
visual themes.

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
  page.tsx              Format landing page — renders <FormatLanding>.
  globals.css           Theme token derivation (--color-* from --viz-*) + chrome.
  book/                 ── THE BOOK FORMAT ──
    page.tsx              Book home — renders <BookHome basePath="/book">.
    [slug]/page.tsx       Placeholder for any TOC entry without a dedicated page.
    ch01-getting-started/ The one worked starter chapter.
      page.tsx              Imports the MDX, wraps in <BookShell basePath="/book">.
      article.mdx           Lorem-ipsum tour of every component.
      data/*.json           Dummy chart data the chapter imports.
  gallery/              ── THE GALLERY FORMAT ──
    page.tsx              Gallery home — renders <GalleryHome>.
    [slug]/page.tsx       Placeholder for any gallery entry without a page.
    first-piece/          A worked standalone article (page.tsx + article.mdx).
    second-piece/         A second, unrelated standalone article.
  docs/                ── THE DOCS FORMAT ──
    page.tsx              Redirects to the first published page.
    [slug]/page.tsx       Placeholder for any docs entry without a page.
    introduction/         Worked docs pages (page.tsx + article.mdx) …
    installation/         … rendered inside the persistent-sidebar shell.
    writing-pages/
components/
  MainArea.tsx          The <main> wrapper.
  FormatLanding.tsx     The root "pick a layout" page (Book / Gallery / Docs).
  Book/
    ThemeProvider.tsx   Owns the active theme (CSS attr + VizThemeProvider).
    ThemeSwitcher.tsx   The reader-facing theme picker.
    ResizeObserverGuard.tsx  Swallows the benign "ResizeObserver loop" warning.
    theme-config.ts     Shared theme constants + the no-flash script string.
    BookShell.tsx       Book article frame — sticky bar + breadcrumb + prev/next.
    BookHome.tsx        Book front page (parts → chapters → articles).
    ChapterTocDrawer.tsx Floating "Contents" pill that opens the TOC.
    Figure.tsx          The Distill-style layout-zone wrapper.
    DropCap, KeyNumber, Callout, SideNote, PullQuote, Quote, Annotation,
    SmallMultiples, TabSet, DataTable, Step, SectionDivider,
    StaticChartV1, Embed   The article-component library (shared by all formats).
    charts/
      timeseries-line-v1.tsx   The default chart component (theme-aware).
      timeseries-index-v1.tsx  Indexed (rebased-to-100) variant.
  Gallery/
    GalleryHome.tsx     Gallery front page (card grid).
    GalleryShell.tsx    Gallery article frame (back-to-gallery, no prev/next).
  Docs/
    DocsShell.tsx       Docs frame — persistent left sidebar + content column.
lib/
  book-toc.ts           The book's TOC — parts, chapters, article order.
  book-types.ts         Book TS types (Book, Part, Chapter, Article).
  gallery-toc.ts        The gallery's flat article list.
  gallery-types.ts      Gallery TS types (Gallery, GalleryArticle).
  docs-toc.ts           The docs sidebar — sections of pages.
  docs-types.ts         Docs TS types (Docs, DocsSection, DocsPage).
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

## Adding a chapter (Book format)

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
mkdir -p app/book/ch02-my-article/data
```

Add a `page.tsx` mirroring the starter chapter (note `basePath="/book"`):

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
    <BookShell slug="ch02-my-article" book={book} findArticle={findArticle} basePath="/book">
      <Article />
    </BookShell>
  );
}
```

### 3. Write the MDX

Open `app/book/ch02-my-article/article.mdx` and write. The editorial components
are imported per-file; copy the import block from
[`app/book/ch01-getting-started/article.mdx`](app/book/ch01-getting-started/article.mdx),
which shows every component in use.

## Adding an article (Gallery format)

Same idea, flatter. Add an entry to [`lib/gallery-toc.ts`](lib/gallery-toc.ts)
(`slug`, `title`, `blurb`, `status`), then create
`app/gallery/<slug>/page.tsx` + `article.mdx`, mirroring `first-piece` — the
page wraps the MDX in `<GalleryShell ... basePath="/gallery">`. There are no
chapters and no prev/next; the front-page grid and a back-to-gallery link are
the whole navigation.

## Adding a page (Docs format)

Add an entry to [`lib/docs-toc.ts`](lib/docs-toc.ts) under a section
(`slug`, `title`, `status`) — that's what builds the sidebar — then create
`app/docs/<slug>/page.tsx` + `article.mdx`, mirroring `introduction`. The page
resolves the entry and passes it to `<DocsShell page=… prev=… next=…>`. The
sidebar is generated from the config, the current page is highlighted
automatically, and `/docs` redirects to the first published page.

> **Why `DocsShell` takes a resolved `page` instead of a lookup function:**
> it's a Client Component (it owns the mobile-drawer state), and functions
> can't be passed from a Server Component across that boundary. So the route
> calls `findDocsPage(slug)` and hands `DocsShell` plain data. (`BookShell` and
> `GalleryShell` are Server Components, so they can still take a `findArticle`
> function.)

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
`app/book/ch01-getting-started/data/` for two complete examples.

### Chart colors follow the theme

The chart resolves series colors from the active theme — **don't** hard-code
hex. Series named with a political identity (`Democrat`/`Republican`,
`Liberal`/`Conservative`) automatically get that theme's party colors; any
other names take neutral categorical slots, by position.

## Embedding third-party interactives

To drop in an external interactive — Datawrapper, Observable, Flourish, a
YouTube/Vimeo clip, a tweet, a CodePen — use `<Embed>` inside a `<Figure>`:

```mdx
import { Embed } from '@/components/Book/Embed';

<Figure caption="Figure 4. An interactive built in Datawrapper.">
  <Embed src="https://datawrapper.dwcdn.net/abcde/1/" title="Vote share by state" ratio="4:3" />
</Figure>
```

It's responsive (set `ratio` — `16:9` default — or an explicit `height`),
**lazy-loads** as the reader scrolls to it, is **sandboxed** by default, and
themes its chrome with the design tokens. YouTube/Vimeo watch URLs are
normalized to embed form, so you can paste the address-bar URL. For a trusted
source that breaks under the sandbox, pass `sandbox={false}`. See Figure 4 in
the starter chapter for a live example.

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

## Picking one format

The landing page exists to demo the formats side by side. For a real site you
usually want **one**. To commit to a format and make it your root:

**Keep the Book, drop the rest**
1. Delete `app/gallery/`, `lib/gallery-toc.ts`, `lib/gallery-types.ts`, and
   `components/Gallery/`, `components/FormatLanding.tsx`.
2. Move `app/book/*` up to `app/` (so the book lives at the root), and pass
   `basePath=""` (or drop the prop) to `<BookHome>` / `<BookShell>` /
   `<ChapterTocDrawer>` so links resolve at the root.
3. Replace `app/page.tsx` with the book home, and edit `lib/book-toc.ts`.

**Keep the Gallery, drop the rest**
1. Delete `app/book/`, `app/docs/`, `lib/book-toc.ts`, `lib/docs-*.ts`,
   `book.config.mjs`, the `charts/` components you don't use, and
   `components/FormatLanding.tsx`.
2. Move `app/gallery/*` up to `app/` and pass `basePath=""` to `<GalleryHome>` /
   `<GalleryShell>`; set `homeHref={null}` to drop the "← Formats" link.
3. Replace `app/page.tsx` with the gallery home, and edit `lib/gallery-toc.ts`.

**Keep the Docs, drop the rest**
1. Delete `app/book/`, `app/gallery/`, `lib/book-toc.ts`, `lib/gallery-*.ts`,
   `book.config.mjs`, and `components/FormatLanding.tsx`.
2. Move `app/docs/*` up to `app/` and pass `basePath=""` to `<DocsShell>`;
   set `homeHref={null}` to drop the "← Formats" link. Point the root
   `app/page.tsx` at the redirect (`redirect('/' + firstDocsSlug())`).
3. Edit `lib/docs-toc.ts`.

Or keep the landing page and all three formats — it's a fine multi-section site as
shipped. The `[slug]` placeholder routes render any TOC/gallery entry that
doesn't yet have its own `page.tsx`, so you can sketch first and write later.

## License

MIT for the boilerplate code (components, scaffolding, scripts). The starter
chapters and gallery pieces are placeholder content — replace them with your
own work.
