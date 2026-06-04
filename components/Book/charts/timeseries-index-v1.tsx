"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { useVizTheme } from "@/viz/theme/provider";

// --- Type Definitions ---
//
// Same GSS-shape envelope as timeseries-line-v1.tsx so the two charts
// are interchangeable from the article's POV. The only new prop is
// `baselineYear` — every demographic series is rebased to 100 at that
// year, so the chart shows *relative change* across a family rather
// than absolute levels.
interface DataPoint {
    year: string | number | null;
    value: number | null;
    n_actual?: number;
    [key: string]: any;
}

interface ChartData {
    metadata: {
        title: string;
        subtitle?: string;
        question?: string;
        source?: { name: string; id?: string; };
        observations?: number;
        [key: string]: any;
    };
    dataPoints: DataPoint[];
    dataPointMetadata: Array<{ id: string; [key: string]: any; }>;
}

interface TimeseriesIndexProps {
    data: ChartData;
    demographicGroups: string[];
    demographic: string;
    defaultVisibleGroups?: string[];
    /**
     * The year each demographic series is rebased to 100. The chart
     * picks the value of each series at this year (or the closest
     * available year ≥ this year if the exact year is missing) and
     * divides every other point by it × 100. Series that have no
     * observation at or after the baseline are dropped.
     */
    baselineYear: number;
    /**
     * Override the default subtitle "Indexed to <baselineYear> = 100".
     */
    baselineLabel?: string;
    /**
     * Compact rendering for SmallMultiples — same semantics as the
     * line chart variant (no chrome, no internal title, sparse ticks,
     * smaller height). Default: false.
     */
    compact?: boolean;
    /**
     * Override the auto-computed y-axis domain. Used by SmallMultiples
     * to enforce a shared range across panels. Format: [min, max] in
     * index units (typically something like [40, 160]). Default:
     * undefined → auto-scale.
     */
    sharedYDomain?: [number, number];
}

// --- Color resolution ---
// Colors are NOT hard-coded here. They come from the active viz theme
// (viz/theme), so the same chart re-tones itself when the reader switches
// between Editorial / Times / FT / Economist / Bloomberg. Mirrors the
// `groupColor` resolver in timeseries-line-v1 so a chapter that mixes the
// two keeps consistent demographic colors across every theme.
//
// Group names that carry an established political meaning are mapped onto the
// theme's `party` semantic domain (each theme re-tones Democrat/Republican to
// match its masthead). Ideology terms mirror the party convention
// (liberal→Democrat-blue, conservative→Republican-red). Everything else falls
// back to the theme's neutral categorical ramp, by position.
const PARTY_DOMAIN_ALIAS: Record<string, string> = {
    Democrat: 'Democrat',
    Democrats: 'Democrat',
    Republican: 'Republican',
    Republicans: 'Republican',
    Independent: 'Independent',
    Other: 'Other',
    // Ideology mirrors party tonally.
    Liberal: 'Democrat',
    Liberals: 'Democrat',
    Conservative: 'Republican',
    Conservatives: 'Republican',
    Moderate: 'Independent',
    Moderates: 'Independent',
};

/** Map a (possibly composite) group label onto a party-domain category, or null. */
function partyCategoryFor(group: string): string | null {
    if (PARTY_DOMAIN_ALIAS[group]) return PARTY_DOMAIN_ALIAS[group];
    // Composite labels like "18-34 · Liberal" — match the segment after the
    // separator so multi-axis charts still inherit the political color.
    const parts = group.split(/\s*[·•]\s*/);
    for (let i = parts.length - 1; i >= 0; i--) {
        if (PARTY_DOMAIN_ALIAS[parts[i]]) return PARTY_DOMAIN_ALIAS[parts[i]];
    }
    return null;
}

// --- Helpers ---
const generateTicks = (start: number, end: number, interval: number): number[] => {
    const ticks: number[] = [];
    const firstTick = Math.ceil(start / interval) * interval;
    for (let i = firstTick; i <= end; i += interval) {
        if (i <= end) { ticks.push(i); }
    }
    return ticks;
};

const processDataPoint = (d: DataPoint): DataPoint & { year: number | null } => {
    const yearNum = parseInt(String(d.year), 10);
    const valueNum = typeof d.value === 'number' ? d.value : parseFloat(String(d.value));
    return {
        ...d,
        year: isNaN(yearNum) ? null : yearNum,
        value: typeof valueNum === 'number' && !isNaN(valueNum) ? valueNum : null
    };
};

// --- Component ---
export default function TimeseriesIndexV1({
    data, demographicGroups, demographic, defaultVisibleGroups,
    baselineYear, baselineLabel, compact = false, sharedYDomain
}: TimeseriesIndexProps) {
    // Active viz theme. With NO <VizThemeProvider> mounted this returns the
    // `editorial` default, so the chart still renders standalone. `rc` is the
    // Recharts chrome bundle (grid/axis/tooltip colors, fonts); `colorFor`
    // resolves series colors through the theme's semantic map.
    const { rc, colorFor } = useVizTheme();

    // Resolve a series color through the active theme. Political groups map to
    // the `party` domain; everything else takes a neutral categorical slot by
    // position (colorFor with a null domain returns the categorical cycle), so
    // multi-series charts stay legible in every theme.
    const groupColor = (group: string): string => {
        const party = partyCategoryFor(group);
        const idx = demographicGroups.indexOf(group);
        return colorFor(party ? 'party' : null, party ?? group, idx >= 0 ? idx : 0);
    };

    const [visibleGroups, setVisibleGroups] = useState<Set<string>>(
        new Set(defaultVisibleGroups || demographicGroups)
    );

    useEffect(() => {
        setVisibleGroups(new Set(defaultVisibleGroups || demographicGroups));
    }, [demographicGroups, defaultVisibleGroups]);

    if (!data || !data.dataPoints || !Array.isArray(data.dataPoints) || data.dataPoints.length === 0) {
        return <div className="p-4 text-center text-muted">No data available to display chart.</div>;
    }

    const processed = data.dataPoints.map(processDataPoint);
    const validYears = processed.map(d => d.year).filter((y): y is number => y !== null);
    if (validYears.length === 0) {
        return <div className="p-4 text-center text-muted">Data contains no valid years.</div>;
    }

    const minYear = Math.min(...validYears);
    const maxYear = Math.max(...validYears);

    // Group + index per demographic. For each group, find the value at
    // baselineYear (or the smallest year ≥ baselineYear that has data),
    // then rebase every point to (value / baseline) × 100.
    const indexed = useMemo(() => {
        return demographicGroups.map((group, idx) => {
            const points = processed
                .filter(d => d[demographic] === group && d.year !== null && d.value !== null)
                .map(d => d as DataPoint & { year: number; value: number })
                .sort((a, b) => a.year - b.year);

            if (points.length === 0) return { name: group, data: [], colorIndex: idx };

            // Pick the baseline observation: exact year if present,
            // otherwise the smallest year ≥ baselineYear that has data.
            const baseline = points.find(p => p.year === baselineYear)
                ?? points.find(p => p.year >= baselineYear);
            if (!baseline || baseline.value === 0) {
                return { name: group, data: [], colorIndex: idx };
            }

            const rebased = points.map(p => ({
                year: p.year,
                value: (p.value / baseline.value) * 100,
                raw: p.value,
                n_actual: p.n_actual,
            }));
            return { name: group, data: rebased, colorIndex: idx };
        });
    }, [processed, demographicGroups, demographic, baselineYear]);

    // Compute auto y-domain from visible series.
    const yDomain = useMemo<[number, number]>(() => {
        if (sharedYDomain) return sharedYDomain;
        let min = Infinity;
        let max = -Infinity;
        let hasData = false;
        for (const g of indexed) {
            if (!visibleGroups.has(g.name)) continue;
            for (const p of g.data) {
                hasData = true;
                if (p.value < min) min = p.value;
                if (p.value > max) max = p.value;
            }
        }
        if (!hasData || !isFinite(min) || !isFinite(max)) return [50, 150];
        const range = max - min;
        const buffer = Math.max(10, range * 0.15);
        return [Math.floor((min - buffer) / 10) * 10, Math.ceil((max + buffer) / 10) * 10];
    }, [indexed, visibleGroups, sharedYDomain]);

    const xTickInterval = compact ? 20 : 5;
    const xTicks = generateTicks(minYear, maxYear, xTickInterval);

    const handleLegendClick = (entry: { value: string }) => {
        setVisibleGroups(prev => {
            const next = new Set(prev);
            if (next.has(entry.value)) next.delete(entry.value);
            else next.add(entry.value);
            return next;
        });
    };

    const yAxisTickFormatter = (v: number | string) => {
        const n = Number(v);
        if (isNaN(n)) return String(v);
        return n.toFixed(0);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0 || label === undefined) return null;
        const visible = payload.filter((s: any) => visibleGroups.has(s.name));
        if (visible.length === 0) return null;
        return (
            <div
                className="p-3 shadow-lg rounded-md text-sm max-w-xs"
                style={{ background: rc.tooltip.background, border: rc.tooltip.border, color: rc.tooltip.color }}
            >
                <p className="font-semibold mb-2" style={{ color: rc.fg }}>{`Year: ${label}`}</p>
                {visible.map((s: any) => {
                    const color = groupColor(s.name);
                    const raw = s.payload?.raw;
                    return (
                        <div key={s.name} className="mb-1.5 last:mb-0">
                            <p className="font-medium" style={{ color }}>{s.name}</p>
                            <p style={{ color }}>
                                {`Index: ${s.value != null ? s.value.toFixed(1) : 'N/A'}`}
                            </p>
                            {raw != null && (
                                <p className="text-xs" style={{ color: rc.muted }}>
                                    {`Raw: ${raw.toFixed(1)}%`}
                                </p>
                            )}
                            {s.payload?.n_actual && (
                                <p className="text-xs" style={{ color: rc.muted }}>
                                    {`N: ${s.payload.n_actual.toLocaleString()}`}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const subtitle = baselineLabel ?? `Indexed to ${baselineYear} = 100`;

    return (
        <div
            className={
                compact
                    ? "w-full p-2"
                    : "w-full rounded-lg shadow px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5"
            }
            style={compact ? undefined : { background: rc.surface }}
        >
            {!compact && (
                <div className="mb-2">
                    <h2 className="text-base font-semibold leading-snug" style={{ color: rc.fg, fontFamily: rc.fontTitle }}>{data.metadata.title}</h2>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: rc.muted }}>{subtitle}</p>
                    {data.metadata.question && <p className="text-xs italic mt-0.5 leading-snug" style={{ color: rc.muted }}>{data.metadata.question}</p>}
                </div>
            )}

            <div className={compact ? "h-[200px] md:h-[220px] w-full" : "h-[450px] md:h-[500px] w-full"}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid
                            strokeDasharray={rc.grid.strokeDasharray}
                            stroke={rc.grid.stroke}
                            vertical={rc.grid.vertical}
                            horizontal={!rc.grid.hide}
                        />

                        <XAxis
                            dataKey="year" type="number"
                            domain={[minYear, maxYear]}
                            allowDataOverflow={true}
                            ticks={xTicks}
                            tick={{ fontSize: compact ? 10 : 11, fill: rc.axisTick.fill, fontFamily: rc.axisTick.fontFamily }}
                            padding={{ left: 10, right: 10 }}
                            tickFormatter={(year) => String(year)}
                            interval={0}
                            axisLine={{ stroke: rc.grid.stroke }}
                            tickLine={{ stroke: rc.grid.stroke }}
                        />

                        <YAxis
                            tickFormatter={yAxisTickFormatter}
                            domain={yDomain}
                            allowDataOverflow={false}
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: compact ? 10 : 11, fill: rc.axisTick.fill, fontFamily: rc.axisTick.fontFamily }}
                            width={compact ? 36 : 50}
                        />

                        {/* Reference line at index = 100 (the baseline). Sits
                            behind the data lines so it reads as a guide,
                            not a series. */}
                        <ReferenceLine y={100} stroke={rc.muted} strokeDasharray="4 2" />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: rc.muted, strokeWidth: 1, strokeDasharray: '3 3' }} />

                        {!compact && (
                            <Legend verticalAlign="bottom" align="center" height={40} onClick={handleLegendClick}
                                iconSize={10} wrapperStyle={{ paddingTop: '10px' }}
                                formatter={(value) => {
                                    const isVisible = visibleGroups.has(value);
                                    return (<span style={{ color: isVisible ? rc.fg : rc.muted, cursor: 'pointer', marginLeft: '4px', fontSize: '12px', fontFamily: rc.fontBody }}>{value}</span>);
                                }} />
                        )}

                        {indexed.map((group) => {
                            const color = groupColor(group.name);
                            return (
                                <Line
                                    key={group.name} type="linear"
                                    data={group.data}
                                    dataKey="value" name={group.name} stroke={color} strokeWidth={rc.stroke}
                                    dot={{ r: 3, fill: color, strokeWidth: 1, stroke: rc.surface }}
                                    activeDot={{ r: 5, strokeWidth: 1, stroke: rc.surface }}
                                    hide={!visibleGroups.has(group.name)}
                                    connectNulls={true}
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {!compact && (
                <div
                    className="flex flex-col sm:flex-row justify-between items-center mt-3 sm:mt-1 pt-2 border-t"
                    style={{ borderColor: rc.grid.stroke }}
                >
                    <div className="text-xs text-left order-1 sm:order-none" style={{ color: rc.muted }}>
                        Source: {data.metadata.source?.name || 'Not specified'}
                        {data.metadata.observations && ` (${data.metadata.observations.toLocaleString()} Observations)`}
                    </div>
                </div>
            )}
        </div>
    );
}
