"use client";

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ErrorBar,
    ReferenceArea,
    Text
} from 'recharts';
import { Label } from "@/viz/ui/label";
import { Switch } from "@/viz/ui/switch";
import { useVizTheme } from "@/viz/theme/provider";

// --- Type Definitions ---
interface DataPoint {
    year: string | number | null;
    value: number | null;
    ci_lower?: number;
    ci_upper?: number;
    n_actual?: number;
    standard_error?: number;
    [key: string]: any;
}

interface TooltipPayloadItem {
    name: string;
    value: number | null;
    color: string;
    payload: DataPoint;
    dataKey: string;
    stroke?: string;
    fill?: string;
}

interface DataPointMetadataItem {
    id: string;
    categories?: string[];
    value_prefix?: string | object;
    value_suffix?: string | object;
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
    dataPointMetadata: DataPointMetadataItem[];
}

interface TimeTrendDemoChartProps {
    data: ChartData;
    demographicGroups: string[];
    demographic: string;
    defaultVisibleGroups?: string[];
    /**
     * When true, renders a stripped-down version of the chart suitable for
     * small-multiples grids:
     *   - no card chrome (bg-white, shadow, rounded corners) — the wrapper
     *     provides the frame
     *   - no internal title / subtitle / question block
     *   - no source line and no CI toggle footer
     *   - no Recharts legend (the wrapper renders one shared legend)
     *   - no presidential reference areas or president-name labels
     *     (illegible at panel size, mistaken for gridlines)
     *   - sparser x-axis ticks (every 20 years, not every 5)
     *   - smaller axis-tick font, smaller chart height
     *
     * The caller is expected to provide a single shared title/source/legend
     * outside the grid. Default: false.
     */
    compact?: boolean;
    /**
     * Vertical density. Three modes:
     *   - 'comfortable' (default): ~450–500px tall. For hero charts —
     *     <Figure width="page-outset"> or single big standalone charts.
     *   - 'medium': ~320–360px tall. For inline article charts inside
     *     <Figure width="body" | "body-outset">. Reduces vertical eat
     *     so prose flows past the chart instead of being broken by it.
     *   - 'compact': ~200–220px tall. Drives SmallMultiples panels;
     *     also strips chrome (see `compact` prop). Setting `compact={true}`
     *     implies `density="compact"` regardless of this prop.
     */
    density?: 'comfortable' | 'medium' | 'compact';
    /**
     * When set, overrides the chart's auto-computed y-axis domain. Used by
     * <SmallMultiples> to enforce a shared range across panels so visual
     * comparison works. Format: [min, max] in the same units as the data
     * (typically 0–100 for percentages). Default: undefined → auto-scale.
     */
    sharedYDomain?: [number, number];
}

// --- Color resolution ---
// Colors are NOT hard-coded here. They come from the active viz theme
// (viz/theme), so the same chart re-tones itself when the reader switches
// between Editorial / Times / FT / Economist / Bloomberg. See
// `useGroupColor` below, which binds the theme's `colorFor` / `colorScale`
// resolvers to a group name.
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
const presidentialTerms = [
    { start: 1971, end: 1976, party: "Republican", president: "Nixon/Ford" },
    { start: 1976, end: 1980, party: "Democrat", president: "Carter" },
    { start: 1980, end: 1992, party: "Republican", president: "Reagan/Bush" },
    { start: 1992, end: 2000, party: "Democrat", president: "Clinton" },
    { start: 2000, end: 2008, party: "Republican", president: "Bush" },
    { start: 2008, end: 2016, party: "Democrat", president: "Obama" },
    { start: 2016, end: 2020, party: "Republican", president: "Trump" },
    { start: 2020, end: 2024, party: "Democrat", president: "Biden" },
];

// --- Helper Functions ---
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
export default function TimeTrendDemoChart({
    data, demographicGroups, demographic, defaultVisibleGroups,
    compact = false, density = 'comfortable', sharedYDomain
}: TimeTrendDemoChartProps) {
    // `compact={true}` is shorthand for the smallest mode (used by SmallMultiples).
    const effectiveDensity = compact ? 'compact' : density;

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

    // Lazy init so we don't allocate a fresh Set on every render. The init
    // arg is read once on mount; afterwards state flows from setVisibleGroups.
    const [visibleGroups, setVisibleGroups] = useState<Set<string>>(
        () => new Set(defaultVisibleGroups || demographicGroups)
    );
    const [showCI, setShowCI] = useState(false);

    // Stabilise the dep keys. Inline JSX arrays change identity every render,
    // which used to fire this effect every render → setState → re-render
    // loop. Hashing the contents into a string makes the effect react only
    // when the actual values change, not the array reference.
    const groupsKey = demographicGroups.join('|');
    const visibleKey = (defaultVisibleGroups || demographicGroups).join('|');
    useEffect(() => {
        setVisibleGroups(new Set(defaultVisibleGroups || demographicGroups));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupsKey, visibleKey]);

    if (!data || !data.dataPoints || !Array.isArray(data.dataPoints) || data.dataPoints.length === 0) {
        return <div className="p-4 text-center text-gray-500">No data available to display chart.</div>;
    }

    const processedDataPoints = data.dataPoints.map(processDataPoint);
    const allValidYearsNumeric = processedDataPoints.map(d => d.year).filter((year): year is number => year !== null);

    if (allValidYearsNumeric.length === 0) {
        return <div className="p-4 text-center text-gray-500">Data contains no valid years.</div>;
    }

    const minYearInData = Math.min(...allValidYearsNumeric);
    const maxYearInData = Math.max(...allValidYearsNumeric);

    const relevantPresidentialTerms = presidentialTerms.filter(term =>
        term.end >= minYearInData && term.start <= maxYearInData
    );
    const firstRelevantBandStart = relevantPresidentialTerms.length > 0
        ? Math.min(...relevantPresidentialTerms.map(t => t.start)) : minYearInData;
    const xAxisMin = Math.min(firstRelevantBandStart, minYearInData);
    const xAxisMax = maxYearInData;
    // Sparser ticks in compact mode — every 5 years collides into a smudge
    // in narrow small-multiples columns. Every 20 years gives ~3 labels per
    // panel for a 50-year range, which is readable.
    const xTickInterval = compact ? 20 : 5;
    const xAxisTicks = generateTicks(xAxisMin, xAxisMax, xTickInterval);

    const groupedData = demographicGroups.map(group => {
        const groupData = processedDataPoints
            .filter(d => d[demographic] === group && d.year !== null)
            .map(d => d as DataPoint & { year: number })
            .sort((a, b) => a.year - b.year);
        return { name: group, data: groupData };
    });
    const hasCIData = groupedData.some(g =>
        g.data.some(d => d.standard_error !== undefined || (d.ci_lower !== undefined && d.ci_upper !== undefined))
    );

    const getVisibleBounds = (): { min: number; max: number } => {
        let overallMin = Infinity;
        let overallMax = -Infinity;
        let hasVisibleData = false;

        groupedData
            .filter(group => visibleGroups.has(group.name))
            .forEach(group => {
                group.data.forEach(point => {
                    if (point.value === null) return;
                    hasVisibleData = true;
                    let currentMin = point.value;
                    let currentMax = point.value;

                    if (showCI) {
                        if (point.ci_lower !== undefined && point.ci_lower !== null) { currentMin = point.ci_lower; }
                        else if (typeof point.standard_error === 'number' && !isNaN(point.standard_error)) { currentMin = point.value - 1.96 * point.standard_error; }
                        if (point.ci_upper !== undefined && point.ci_upper !== null) { currentMax = point.ci_upper; }
                        else if (typeof point.standard_error === 'number' && !isNaN(point.standard_error)) { currentMax = point.value + 1.96 * point.standard_error; }
                    }

                    if (typeof currentMin === 'number' && !isNaN(currentMin)) { overallMin = Math.min(overallMin, currentMin); }
                    if (typeof currentMax === 'number' && !isNaN(currentMax)) { overallMax = Math.max(overallMax, currentMax); }
                });
            });

        return hasVisibleData && isFinite(overallMin) && isFinite(overallMax)
            ? { min: overallMin, max: overallMax } : { min: 0, max: 100 };
    };

    const { min: effectiveMin, max: effectiveMax } = getVisibleBounds();
    let yDomain: [number, number] = [0, 100];

    // sharedYDomain wins over auto-scaling — used by <SmallMultiples> to
    // enforce a shared range across panels.
    if (sharedYDomain) {
        yDomain = sharedYDomain;
    } else if (isFinite(effectiveMin) && isFinite(effectiveMax)) {
        const dataRange = effectiveMax - effectiveMin;
        const buffer = Math.max(5, dataRange * 0.15);
        const lowerBound = effectiveMin - buffer;
        const upperBound = effectiveMax + buffer;
        const finalMin = Math.max(0, lowerBound);
        const finalMax = Math.min(100, upperBound);
        const minRange = 10;

        if (finalMin >= finalMax) {
             const centerValue = Math.min(100, Math.max(0, (effectiveMin + effectiveMax) / 2));
             yDomain = [Math.max(0, Math.floor((centerValue - minRange / 2) / 5) * 5), Math.min(100, Math.ceil((centerValue + minRange / 2) / 5) * 5)];
             if (yDomain[0] >= yDomain[1]) { yDomain = [Math.max(0, finalMin - 5), Math.min(100, finalMax + 5)]; }
        } else if (finalMax - finalMin < minRange) {
             const midPoint = (finalMin + finalMax) / 2;
             yDomain = [Math.max(0, Math.floor((midPoint - minRange / 2) / 5) * 5), Math.min(100, Math.ceil((midPoint + minRange / 2) / 5) * 5)];
             if (yDomain[0] >= yDomain[1]) {
                 yDomain = [Math.max(0, finalMin - buffer), Math.min(100, finalMax + buffer)];
                 if(yDomain[0] >= yDomain[1]) yDomain = [Math.max(0, finalMin - 5), Math.min(100, finalMax + 5)];
             }
        } else {
            yDomain = [finalMin, finalMax];
        }
    }

    const handleLegendClick = (entry: { value: string }) => {
        setVisibleGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entry.value)) {
                newSet.delete(entry.value);
            } else {
                newSet.add(entry.value);
            }
            return newSet;
        });
    };

    const yAxisTickFormatter = (value: number | string): string => {
        const metadata = data.dataPointMetadata.find(d => d.id === 'value');
        const prefixValue = metadata?.value_prefix;
        const suffixValue = metadata?.value_suffix;
        const prefix = (prefixValue && (typeof prefixValue !== 'object' || Object.keys(prefixValue).length > 0)) ? String(prefixValue) : '';
        const suffix = (suffixValue && (typeof suffixValue !== 'object' || Object.keys(suffixValue).length > 0)) ? String(suffixValue) : '%';
        const num = Number(value);
        if (isNaN(num)) return String(value);
        const formattedValue = num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        return `${prefix}${formattedValue}${suffix}`;
    };

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string | number }) => {
        if (!active || !payload || payload.length === 0 || label === undefined) return null;
        const visiblePayload = payload.filter(series => visibleGroups.has(series.name));
        if (visiblePayload.length === 0) return null;
        const valueMetadata = data.dataPointMetadata.find(m => m.id === 'value');
        const suffix = (typeof valueMetadata?.value_suffix === 'string') ? valueMetadata.value_suffix : '%';
        const prefix = (typeof valueMetadata?.value_prefix === 'string') ? valueMetadata.value_prefix : '';

        return (
            <div
                className="p-3 shadow-lg rounded-md text-sm max-w-xs"
                style={{ background: rc.tooltip.background, border: rc.tooltip.border, color: rc.tooltip.color }}
            >
                <p className="font-semibold mb-2" style={{ color: rc.fg }}>{`Year: ${label}`}</p>
                {visiblePayload.map((series) => {
                    const color = groupColor(series.name);
                    const pointData = series.payload;
                    return (
                        <div key={series.name} className="mb-1.5 last:mb-0">
                            <p className="font-medium" style={{ color: color }}>{series.name}</p>
                            <p className="text-gray-600" style={{ color: color }}>
                                {`Value: ${series.value != null ? `${prefix}${series.value.toFixed(1)}${suffix}` : 'N/A'}`}
                            </p>
                            {pointData?.ci_lower !== undefined && pointData?.ci_upper !== undefined && (
                                <p className="text-xs" style={{ color: rc.muted }}>
                                    {`95% CI: [${pointData.ci_lower.toFixed(1)}%, ${pointData.ci_upper.toFixed(1)}%]`}
                                </p>
                            )}
                            {pointData?.n_actual && (
                                <p className="text-xs" style={{ color: rc.muted }}>
                                    {`N: ${pointData.n_actual.toLocaleString()}`}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className={
                compact
                    ? "w-full p-2"
                    : `w-full rounded-lg shadow px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5`
            }
            style={compact ? undefined : { background: rc.surface }}
        >
            {!compact && (
                <div className="mb-2">
                    <h2 className="text-base font-semibold leading-snug" style={{ color: rc.fg, fontFamily: rc.fontTitle }}>{data.metadata.title}</h2>
                    {data.metadata.subtitle && <p className="text-xs mt-0.5 leading-snug" style={{ color: rc.muted }}>{data.metadata.subtitle}</p>}
                    {data.metadata.question && <p className="text-xs italic mt-0.5 leading-snug" style={{ color: rc.muted }}>{data.metadata.question}</p>}
                </div>
            )}

            <div
                className={
                    effectiveDensity === 'compact'
                        ? 'h-[200px] md:h-[220px] w-full'
                        : effectiveDensity === 'medium'
                        ? 'h-[300px] md:h-[340px] w-full'
                        : 'h-[450px] md:h-[500px] w-full'
                }
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        key={`${demographic}-${showCI}`}
                        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                        {!compact && relevantPresidentialTerms.map((term, index) => (
                            <ReferenceArea key={`term-bg-${index}`} x1={term.start} x2={term.end} yAxisId="left"
                                fill={groupColor(term.party)} fillOpacity={0.07}
                                ifOverflow="visible" shapeRendering="crispEdges" />
                        ))}

                        <CartesianGrid
                            strokeDasharray={rc.grid.strokeDasharray}
                            stroke={rc.grid.stroke}
                            vertical={rc.grid.vertical}
                            horizontal={!rc.grid.hide}
                        />

                        <XAxis
                            dataKey="year" type="number"
                            domain={[xAxisMin, xAxisMax]}
                            allowDataOverflow={true}
                            ticks={xAxisTicks}
                            tick={{ fontSize: compact ? 10 : 11, fill: rc.axisTick.fill, fontFamily: rc.axisTick.fontFamily }}
                            padding={{ left: 10, right: 10 }}
                            tickFormatter={(year) => String(year)}
                            interval={0}
                            axisLine={{ stroke: rc.grid.stroke }}
                            tickLine={{ stroke: rc.grid.stroke }}
                        />

                        <YAxis
                            yAxisId="left"
                            tickFormatter={yAxisTickFormatter}
                            domain={yDomain}
                            allowDataOverflow={false}
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: compact ? 10 : 11, fill: rc.axisTick.fill, fontFamily: rc.axisTick.fontFamily }}
                            width={compact ? 36 : 50}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: rc.muted, strokeWidth: 1, strokeDasharray: '3 3' }} />

                        {!compact && (
                            <Legend verticalAlign="bottom" align="center" height={40} onClick={handleLegendClick}
                                iconSize={10} wrapperStyle={{ paddingTop: '10px' }}
                                formatter={(value) => {
                                    const isVisible = visibleGroups.has(value);
                                    return (<span style={{ color: isVisible ? rc.fg : rc.muted, cursor: 'pointer', marginLeft: '4px', fontSize: '12px', fontFamily: rc.fontBody }}>{value}</span>);
                                }} />
                        )}

                        {groupedData.map((group) => {
                            const color = groupColor(group.name);
                            return (
                                <Line
                                    key={group.name} yAxisId="left" type="linear"
                                    data={group.data}
                                    dataKey="value" name={group.name} stroke={color} strokeWidth={rc.stroke}
                                    dot={{ r: 3, fill: color, strokeWidth: 1, stroke: rc.surface }}
                                    activeDot={{ r: 5, strokeWidth: 1, stroke: rc.surface }}
                                    hide={!visibleGroups.has(group.name)}
                                    connectNulls={true}
                                    isAnimationActive={false}
                                >
                                    {showCI && hasCIData && (
                                        <ErrorBar
                                            dataKey={(d: DataPoint) => (typeof d.standard_error === 'number' && !isNaN(d.standard_error)) ? (1.96 * d.standard_error) : 0}
                                            width={4} strokeWidth={1.5} stroke={color}
                                            opacity={0.35} direction="y"
                                        />
                                    )}
                                </Line>
                            );
                        })}

                        {!compact && relevantPresidentialTerms.map((term, index) => (
                            <Text
                                key={`term-label-${index}`}
                                x={(term.start + term.end) / 2}
                                y={typeof yDomain[1] === 'number' ? yDomain[1] - 3 : 97}
                                textAnchor="middle"
                                verticalAnchor="start"
                                fill={rc.muted}
                                fontSize={10}
                            >
                                {term.president}
                            </Text>
                        ))}

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

                    <div className="flex items-center space-x-2 order-2 sm:order-none">
                        <Switch
                            id="show-ci" checked={showCI} onCheckedChange={setShowCI}
                            disabled={!hasCIData}
                        />
                        <Label htmlFor="show-ci" className="text-xs" style={{ color: rc.muted, opacity: hasCIData ? 1 : 0.6 }}>
                            Show 95% CI
                        </Label>
                    </div>
                </div>
            )}
        </div>
    );
}
