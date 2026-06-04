import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { MainArea } from '@/components/MainArea';
import { ThemeProvider } from '@/components/Book/ThemeProvider';
import { themeNoFlashScript } from '@/components/Book/theme-config';
import { book } from '@/lib/book-toc';

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
  title: book.title,
  description: book.subtitle,
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
          <MainArea>{children}</MainArea>
        </ThemeProvider>
      </body>
    </html>
  );
}
