'use client';

import * as React from 'react';

export type EmbedRatio = '16:9' | '4:3' | '1:1' | '3:2' | 'auto';

export interface EmbedProps {
  /**
   * The embed URL. For most providers paste the *embed* URL (the one in
   * their "share → embed" iframe `src`), e.g.
   *   - Datawrapper: https://datawrapper.dwcdn.net/abcde/1/
   *   - Observable:  https://observablehq.com/embed/@user/notebook?cell=chart
   *   - Flourish:    https://flo.uri.sh/visualisation/123456/embed
   * YouTube/Vimeo *watch* URLs are normalized to their embed form for you
   * (see `normalizeSrc`), so a plain youtube.com/watch?v=… also works.
   */
  src: string;
  /**
   * Accessible title for the iframe. Required — screen readers announce it,
   * and it's what shows if the embed is blocked. Describe the content, e.g.
   * "Datawrapper chart: vote share by state, 2024".
   */
  title: string;
  /**
   * Aspect ratio of the frame. The embed scales fluidly to the figure width
   * at this ratio. Use 'auto' only for providers that set their own height
   * via postMessage (most don't) — then pass an explicit `height`.
   * Default: '16:9'.
   */
  ratio?: EmbedRatio;
  /**
   * Fixed pixel height. Overrides `ratio`. Use for providers whose content
   * isn't a fixed aspect (some Datawrapper tables, long Flourish stories).
   */
  height?: number;
  /**
   * When true, load the iframe immediately instead of lazily on scroll.
   * Default false — embeds load when scrolled near, which keeps a page full
   * of them fast. Set true only for an above-the-fold hero embed.
   */
  eager?: boolean;
  /**
   * Extra `allow` permissions for the iframe (Permissions Policy). Defaults
   * cover the common video case (autoplay; fullscreen; picture-in-picture).
   * Pass your own to extend, e.g. "clipboard-write; web-share".
   */
  allow?: string;
  /**
   * Sandbox tokens. Untrusted embeds are sandboxed by default to scripts +
   * same-origin + popups + forms, which is enough for charts and players.
   * Pass `false` to drop the sandbox entirely (only for fully-trusted
   * sources that break under it), or a custom string to tailor it.
   */
  sandbox?: string | false;
}

const RATIO_PADDING: Record<Exclude<EmbedRatio, 'auto'>, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '3:2': '66.66%',
  '1:1': '100%',
};

const DEFAULT_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';

const DEFAULT_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation';

/**
 * Normalize common *watch/share* URLs to their *embed* form, so authors can
 * paste the URL from the address bar. Anything we don't recognize is returned
 * unchanged (provider embed URLs already work as-is).
 */
function normalizeSrc(src: string): string {
  try {
    const u = new URL(src);
    const host = u.hostname.replace(/^www\./, '');

    // youtu.be/<id>  and  youtube.com/watch?v=<id>  ->  youtube.com/embed/<id>
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}${u.search}` : src;
    }
    if (host === 'youtube.com' && u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      if (id) {
        const extra = new URLSearchParams(u.search);
        extra.delete('v');
        const qs = extra.toString();
        return `https://www.youtube.com/embed/${id}${qs ? `?${qs}` : ''}`;
      }
    }
    // vimeo.com/<id>  ->  player.vimeo.com/video/<id>
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}${u.search}`;
    }
    return src;
  } catch {
    return src; // not a parseable URL — let the iframe deal with it
  }
}

/**
 * Embed — a responsive, lazy-loaded, sandboxed iframe for third-party
 * interactives (Datawrapper, Observable, Flourish, YouTube, Vimeo, a tweet,
 * a CodePen…). Designed to live inside `<Figure>`, which supplies the caption
 * and width zone:
 *
 *   <Figure caption="Figure 4. An interactive built in Datawrapper.">
 *     <Embed src="https://datawrapper.dwcdn.net/abcde/1/" title="…" ratio="4:3" />
 *   </Figure>
 *
 * Chrome (border, background, placeholder) is theme-aware via the design
 * tokens, so it reads on every theme including the dark one.
 */
export function Embed({
  src,
  title,
  ratio = '16:9',
  height,
  eager = false,
  allow = DEFAULT_ALLOW,
  sandbox = DEFAULT_SANDBOX,
}: EmbedProps) {
  const resolved = normalizeSrc(src);
  const sandboxProp = sandbox === false ? undefined : sandbox;

  // Fixed-height mode (ratio="auto" or an explicit height): a simple box.
  const fixed = height != null || ratio === 'auto';
  const boxStyle: React.CSSProperties = fixed
    ? { height: height != null ? `${height}px` : 480 }
    : { position: 'relative', width: '100%', paddingTop: RATIO_PADDING[ratio] };

  const iframeStyle: React.CSSProperties = fixed
    ? { width: '100%', height: '100%', border: 0 }
    : { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div style={boxStyle}>
        <iframe
          src={resolved}
          title={title}
          loading={eager ? 'eager' : 'lazy'}
          style={iframeStyle}
          allow={allow}
          allowFullScreen
          sandbox={sandboxProp}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
