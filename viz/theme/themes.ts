// registry/theme/themes.ts
//
// Layer 3 of the viz theme system: built-in Theme objects. A Theme is the
// neutral *foundation* (neutrals, typography, stroke/grid behavior) plus a
// restrained accent and categorical ramp, plus OPTIONAL semantic overrides.
//
// The shipped themes are modeled on real editorial-press visual systems —
// Editorial (our default), Times (NYT-inspired), FT (pink-paper), Economist
// (single-red emphasis), Bloomberg (terminal amber-on-black). Each defines
// its own fonts, surface, gridline behavior, party colors, and color ramps
// (sequential + diverging) so the same chart looks visibly different — not
// just lightly tinted — when the user toggles between them.
//
// Data-only: no React, no Plot, no Recharts. The provider (provider.tsx)
// selects one and the adapters translate it per engine.

import { tokens as t } from './tokens';
import { mergeSemantic, SemanticMap, SemanticOverrides } from './semantic';

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  // neutral foundation
  fg: string;       // primary ink (default series color, titles)
  muted: string;    // axis labels, source line, secondary text
  grid: string;     // gridline color
  surface: string;  // chart/tooltip background
  border: string;   // tooltip / table border
  // typography
  fontBody: string;  // axis ticks, labels, body
  fontTitle: string; // title/subtitle (may differ — e.g. serif headings)
  // line/mark behavior
  stroke: number;                              // default series stroke width
  gridStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  gridVertical: boolean;
  // emphasis
  accent: string; // the ONE color used for emphasis when not semantic
  // resolved semantic map (defaults merged with this theme's overrides)
  semantic: SemanticMap;
}

// helper so each theme declaration stays terse
function build(
  base: Omit<Theme, 'semantic'>,
  semOverrides?: SemanticOverrides,
): Theme {
  return { ...base, semantic: mergeSemantic(semOverrides) };
}

// ─── Editorial (DEFAULT) ────────────────────────────────────────────────────
// Tufte-forward, monochrome ink on white. What a component renders with when
// there is no provider. Color appears only via semantic domains or a
// sparingly-used accent. This is our "house" look.
export const editorial: Theme = build({
  name: 'editorial',
  mode: 'light',
  fg:      t.palette.ink,
  muted:   t.palette.gray500,
  grid:    t.palette.gray200,
  surface: t.palette.white,
  border:  t.palette.gray200,
  fontBody:  t.font.sans,
  fontTitle: t.font.sans,
  stroke:  t.stroke.thin,
  gridStyle: 'dashed',
  gridVertical: false,
  accent:  t.palette.blue,
});

// ─── Times — NYT-inspired ───────────────────────────────────────────────────
// Serif headlines on warm-white paper, hairline ink, deep-cool navy for
// Democrats and brick red for Republicans, faint solid horizontal gridlines.
export const times: Theme = build(
  {
    name: 'times',
    mode: 'light',
    fg:      t.palette.timesInk,
    muted:   t.palette.timesMuted,
    grid:    t.palette.timesLine,
    surface: t.palette.timesPaper,
    border:  t.palette.timesLine,
    fontBody:  t.font.timesSans,
    fontTitle: t.font.timesSerif,
    stroke:  t.stroke.regular,
    gridStyle: 'solid',
    gridVertical: false,
    accent:  t.palette.timesAccent,
  },
  {
    party: {
      Democrat:    t.palette.timesDem,
      Republican:  t.palette.timesRep,
      Independent: t.palette.timesMuted,
      Other:       t.palette.gray400,
    },
    categorical: [
      t.palette.timesInk,
      t.palette.timesDem,
      t.palette.timesRep,
      t.palette.timesAccent,
      t.palette.timesMuted,
    ],
    sequential: [...t.palette.nytRamp],
    diverging:  [...t.palette.nytDiverg],
  },
);

// ─── FT — Financial Times pink-paper system ─────────────────────────────────
// Salmon-pink paper surface (the actual #FFF1E5), serif headlines,
// MetricWeb-equivalent sans body, FT signature blue + claret as accent pair.
export const ft: Theme = build(
  {
    name: 'ft',
    mode: 'light',
    fg:      t.palette.ftInk,
    muted:   t.palette.ftMuted,
    grid:    t.palette.ftLine,
    surface: t.palette.ftPaper,
    border:  t.palette.ftLine,
    fontBody:  t.font.ftSans,
    fontTitle: t.font.ftSerif,
    stroke:  t.stroke.regular,
    gridStyle: 'solid',
    gridVertical: false,
    accent:  t.palette.ftAccent,
  },
  {
    party: {
      Democrat:    t.palette.ftAccent,
      Republican:  t.palette.ftClaret,
      Independent: t.palette.ftMuted,
      Other:       t.palette.ftTeal,
    },
    categorical: [
      t.palette.ftClaret,
      t.palette.ftAccent,
      t.palette.ftTeal,
      t.palette.ftInk,
      t.palette.ftMuted,
    ],
    sequential: [...t.palette.ftRamp],
    diverging:  [...t.palette.ftDiverg],
  },
);

// ─── Economist — single-red emphasis system ─────────────────────────────────
// Cool grey-blue paper, bold sans throughout, a single bright red used
// wherever the chart wants to surface its headline finding.
export const economist: Theme = build(
  {
    name: 'economist',
    mode: 'light',
    fg:      t.palette.econInk,
    muted:   t.palette.econMuted,
    grid:    t.palette.econLine,
    surface: t.palette.econPaper,
    border:  t.palette.econLine,
    fontBody:  t.font.econSans,
    fontTitle: t.font.econSans,
    stroke:  t.stroke.thick,
    gridStyle: 'solid',
    gridVertical: false,
    accent:  t.palette.econRed,
  },
  {
    party: {
      Democrat:    t.palette.econAccent,
      Republican:  t.palette.econRed,
      Independent: t.palette.econMuted,
      Other:       t.palette.econInk,
    },
    categorical: [
      t.palette.econRed,
      t.palette.econAccent,
      t.palette.econInk,
      t.palette.econMuted,
      t.palette.econDeepRed,
    ],
    sequential: [...t.palette.econRamp],
    diverging:  [...t.palette.econDiverg],
  },
);

// ─── Bloomberg — terminal amber-on-black ────────────────────────────────────
// Deep black surface, signature amber as primary, cyan and magenta as the
// contrast pair. Dark-mode demonstration.
export const bloomberg: Theme = build(
  {
    name: 'bloomberg',
    mode: 'dark',
    fg:      t.palette.bloombergInk,
    muted:   t.palette.bloombergMuted,
    grid:    t.palette.bloombergLine,
    surface: t.palette.bloombergBg,
    border:  t.palette.bloombergLine,
    fontBody:  t.font.bloombergSans,
    fontTitle: t.font.bloombergSans,
    stroke:  t.stroke.regular,
    gridStyle: 'solid',
    gridVertical: false,
    accent:  t.palette.bloombergAmber,
  },
  {
    party: {
      Democrat:    t.palette.bloombergCyan,
      Republican:  t.palette.bloombergMag,
      Independent: t.palette.bloombergMuted,
      Other:       t.palette.bloombergAmber,
    },
    categorical: [
      t.palette.bloombergAmber,
      t.palette.bloombergCyan,
      t.palette.bloombergMag,
      t.palette.bloombergInk,
      t.palette.bloombergMuted,
    ],
    sequential: [...t.palette.bloombergRamp],
    diverging:  [...t.palette.bloombergDiverg],
  },
);

// ─── Slate — clean dark-editorial ───────────────────────────────────────────
// A neutral, calm dark mode (unlike Bloomberg's amber terminal). Near-black
// cool surface, off-white ink, a single sky-blue accent. The "dark mode most
// people actually want."
export const slate: Theme = build(
  {
    name: 'slate',
    mode: 'dark',
    fg:      t.palette.slateInk,
    muted:   t.palette.slateMuted,
    grid:    t.palette.slateLine,
    surface: t.palette.slateBg,
    border:  t.palette.slateLine,
    fontBody:  t.font.sans,
    fontTitle: t.font.sans,
    stroke:  t.stroke.regular,
    gridStyle: 'dashed',
    gridVertical: false,
    accent:  t.palette.slateAccent,
  },
  {
    party: {
      Democrat:    t.palette.slateDem,
      Republican:  t.palette.slateRep,
      Independent: t.palette.slateMuted,
      Other:       t.palette.slateMuted,
    },
    categorical: [
      t.palette.slateAccent,
      t.palette.slateRep,
      t.palette.slateInk,
      t.palette.slateMuted,
      t.palette.cyan,
    ],
    sequential: [...t.palette.slateRamp],
    diverging:  [...t.palette.slateDiverg],
  },
);

// ─── Brutalist — monospace, hard rules, one hot accent ───────────────────────
// Pure black ink on stark white, monospace everywhere, solid black gridlines,
// thick strokes, electric-blue accent. Opinionated and loud.
export const brutalist: Theme = build(
  {
    name: 'brutalist',
    mode: 'light',
    fg:      t.palette.brutalInk,
    muted:   t.palette.brutalMuted,
    grid:    t.palette.brutalLine,
    surface: t.palette.brutalBg,
    border:  t.palette.brutalLine,
    fontBody:  t.font.brutalMono,
    fontTitle: t.font.brutalMono,
    stroke:  t.stroke.thick,
    gridStyle: 'solid',
    gridVertical: true,
    accent:  t.palette.brutalAccent,
  },
  {
    party: {
      Democrat:    t.palette.brutalAccent,
      Republican:  t.palette.brutalRed,
      Independent: t.palette.brutalMuted,
      Other:       t.palette.brutalInk,
    },
    categorical: [
      t.palette.brutalInk,
      t.palette.brutalAccent,
      t.palette.brutalRed,
      t.palette.brutalMuted,
      t.palette.green,
    ],
    sequential: [...t.palette.brutalRamp],
    diverging:  [...t.palette.brutalDiverg],
  },
);

// ─── Academic — warm paper, serif throughout ─────────────────────────────────
// Serif body AND headings on warm off-white paper, a deep-maroon scholarly
// accent, thin strokes, faint solid grid. Reads like a journal.
export const academic: Theme = build(
  {
    name: 'academic',
    mode: 'light',
    fg:      t.palette.academicInk,
    muted:   t.palette.academicMuted,
    grid:    t.palette.academicLine,
    surface: t.palette.academicBg,
    border:  t.palette.academicLine,
    fontBody:  t.font.academicSerif,
    fontTitle: t.font.academicSerif,
    stroke:  t.stroke.thin,
    gridStyle: 'solid',
    gridVertical: false,
    accent:  t.palette.academicAccent,
  },
  {
    party: {
      Democrat:    t.palette.academicDem,
      Republican:  t.palette.academicRep,
      Independent: t.palette.academicMuted,
      Other:       t.palette.academicMuted,
    },
    categorical: [
      t.palette.academicInk,
      t.palette.academicRep,
      t.palette.academicDem,
      t.palette.academicMuted,
      t.palette.academicAccent,
    ],
    sequential: [...t.palette.academicRamp],
    diverging:  [...t.palette.academicDiverg],
  },
);

// ─── The registry ───────────────────────────────────────────────────────────
export const themes = { editorial, times, ft, economist, bloomberg, slate, brutalist, academic } as const;
export type ThemeName = keyof typeof themes;
export const defaultTheme = editorial;
