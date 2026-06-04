/**
 * Per-article remote-data manifest.
 *
 * OPTIONAL. Only needed if you fetch pre-computed chart JSON from a remote
 * store (e.g. a Tigris/S3 bucket) instead of committing it under
 * app/<slug>/data/. The starter chapter ships its data locally, so this list
 * is empty by default.
 *
 * `scripts/fetch-article-data.mjs` reads this and, for each entry, downloads
 * every `{ graphId, filename }` into `app/<slug>/data/<filename>`. Run it with:
 *   pnpm fetch-data            # all articles
 *   pnpm fetch-data <slug>     # one article
 *
 * Shape:
 *   {
 *     slug: 'ch02-second-chapter',
 *     files: [
 *       { graphId: 'some/remote/key', filename: 'series-a.json' },
 *       { graphId: 'other/remote/key', filename: 'series-b.json' },
 *     ],
 *   }
 *
 * The `graphId` → URL mapping lives in fetch-article-data.mjs (swap it for
 * your own data source if you don't use Tigris). Delete this file and the
 * fetch script entirely if all your data is local.
 */
export const articles = [
  // {
  //   slug: 'ch02-second-chapter',
  //   files: [
  //     { graphId: 'example/series', filename: 'series.json' },
  //   ],
  // },
];
