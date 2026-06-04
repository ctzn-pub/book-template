import type { Metadata } from 'next';
import { MagazineShell } from '@/components/Magazine/MagazineShell';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: 'A Feature Story — Magazine layout',
  description: 'A single immersive longform feature — full-bleed hero, big pull-quotes, asymmetric figures.',
};

export default function Page() {
  return (
    <MagazineShell
      kicker="Feature"
      title="The Title of Your Feature Goes Here"
      deck="A standfirst — one or two sentences that set up the piece and make the reader want to keep going. Replace all of this with your own."
      byline="By A. Writer · June 2026"
    >
      <Article />
    </MagazineShell>
  );
}
