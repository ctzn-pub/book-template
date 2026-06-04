import type { Metadata } from 'next';
import { SlidesShell } from '@/components/Slides/SlidesShell';

export const metadata: Metadata = {
  title: 'A Deck — Slides layout',
  description: 'MDX as a presentation — full-viewport sections you advance with arrow keys or scroll.',
};

// Each entry is one full-viewport slide. Replace with your own; you can put any
// JSX here — headings, lists, charts, images.
const SLIDES = [
  <>
    <p className="text-xs uppercase tracking-[0.25em] text-link">Slides layout</p>
    <h1 className="font-display text-5xl font-bold text-body">Your Deck Title</h1>
    <p className="text-lg text-subtle">
      Advance with the ↓ arrow, the scroll wheel, the dots on the right, or the buttons below.
    </p>
  </>,
  <>
    <h2 className="font-display text-4xl font-semibold text-body">One idea per slide</h2>
    <p className="text-lg text-subtle">
      Keep each slide to a single point. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
  </>,
  <>
    <h2 className="font-display text-4xl font-semibold text-body">Lists work too</h2>
    <ul className="mx-auto inline-block text-left text-lg text-subtle">
      <li>First point</li>
      <li>Second point</li>
      <li>Third point</li>
    </ul>
  </>,
  <>
    <h2 className="font-display text-4xl font-semibold text-body">Drop anything in</h2>
    <p className="text-lg text-subtle">A chart, an image, a quote — each slide is just JSX.</p>
    <div className="not-prose mx-auto mt-6 flex h-48 max-w-md items-center justify-center rounded-lg border border-border bg-card text-muted">
      Your chart / image
    </div>
  </>,
  <>
    <h2 className="font-display text-4xl font-semibold text-body">The End</h2>
    <p className="text-lg text-subtle">
      Edit <code className="rounded bg-card px-1 py-0.5 text-sm">app/slides/page.tsx</code> to write your own deck.
    </p>
  </>,
];

export default function Page() {
  return <SlidesShell title="Your Deck" slides={SLIDES} />;
}
