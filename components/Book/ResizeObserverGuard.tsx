'use client';

import * as React from 'react';

/**
 * Swallows the benign "ResizeObserver loop" warnings that Recharts'
 * ResponsiveContainer (and other measure-then-layout components) can emit
 * while a chart-heavy page is scrolled or resized:
 *
 *   - "ResizeObserver loop limit exceeded"
 *   - "ResizeObserver loop completed with undelivered notifications."
 *
 * These are not real errors — the browser is telling you it deferred a resize
 * callback to the next frame, which is harmless. But some setups surface them
 * loudly: a red console line, or (in dev / certain error-overlay tooling) a
 * full-screen error overlay that *looks* like the page crashed. This guard
 * stops the specific event from propagating to those overlays. It does NOT
 * touch any other error.
 *
 * Mounted once at the app root (app/layout.tsx). Renders nothing.
 */
export function ResizeObserverGuard() {
  React.useEffect(() => {
    const RO_MESSAGES = [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications.',
    ];
    const isRO = (text: unknown) =>
      typeof text === 'string' && RO_MESSAGES.some((m) => text.includes(m));

    // 1) Stop the window 'error' event for this specific message so it never
    //    reaches Next's dev error overlay or any window.onerror handler.
    const onError = (e: ErrorEvent) => {
      if (isRO(e.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    // Capture phase so we run before overlay listeners attached to window.
    window.addEventListener('error', onError, true);

    // 2) Some toolchains also pipe it through console.error → overlay. Filter
    //    just that one line; pass everything else straight through.
    const origConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      if (args.some(isRO)) return;
      origConsoleError(...(args as Parameters<typeof console.error>));
    };

    return () => {
      window.removeEventListener('error', onError, true);
      console.error = origConsoleError;
    };
  }, []);

  return null;
}
