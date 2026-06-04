import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { MainArea } from '@/components/MainArea';
import { ThemeProvider } from '@/components/Book/ThemeProvider';
import { ResizeObserverGuard } from '@/components/Book/ResizeObserverGuard';
import { themeNoFlashScript } from '@/components/Book/theme-config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  // Format-neutral default; each page sets its own title/description.
  title: 'ctzn.pub book-template',
  description: 'A multi-format publishing starter — book, gallery, and docs layouts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the no-flash script sets data-viz-theme on
    // <html> before React hydrates, so the server/client attribute differs by
    // design. This scopes the suppression to <html> only.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint — prevents a flash of the
            default theme on reload. Must run before the body renders. */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript() }} />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col font-sans bg-brand-bg text-brand-text selection:bg-brand-primary/30`}
      >
        <ThemeProvider>
          <ResizeObserverGuard />
          <MainArea>{children}</MainArea>
        </ThemeProvider>
      </body>
    </html>
  );
}
