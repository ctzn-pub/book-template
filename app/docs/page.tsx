import { redirect } from 'next/navigation';
import { firstDocsSlug } from '@/lib/docs-toc';

/**
 * The /docs index redirects to the first published page — the conventional
 * docs-site behavior (the sidebar is the navigation, so there's no separate
 * landing). If no page is published yet, fall back to the format landing.
 */
export default function DocsIndexPage() {
  const slug = firstDocsSlug();
  redirect(slug ? `/docs/${slug}` : '/');
}
