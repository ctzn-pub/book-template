import type { Metadata } from 'next';
import { DashboardHome, DashboardCard } from '@/components/Dashboard/DashboardHome';
import TimeseriesLineV1 from '@/components/Book/charts/timeseries-line-v1';
import byGroupRaw from './data/example-by-group.json';
import toplineRaw from './data/example-topline.json';

// The JSON has `ci_lower: null`; the chart types CI fields as `number | undefined`.
// Cast to the component's data prop type (matches how MDX passes these untyped).
type ChartData = React.ComponentProps<typeof TimeseriesLineV1>['data'];
const byGroup = byGroupRaw as unknown as ChartData;
const topline = toplineRaw as unknown as ChartData;

export const metadata: Metadata = {
  title: 'Report — Dashboard layout',
  description: 'A single-page data report — KPI cards and chart panels on one screen.',
};

const KPIS = [
  { label: 'Total', value: '48.2k', delta: '+12% MoM', note: 'vs. 43.1k last month' },
  { label: 'Active', value: '31.7%', delta: '+1.4 pts', note: 'share of total' },
  { label: 'Median', value: '$1,240', delta: '−3% MoM', note: 'down from $1,279' },
  { label: 'Coverage', value: '94%', note: 'of target population' },
];

export default function Page() {
  return (
    <DashboardHome
      title="Quarterly Report"
      tagline="A placeholder dashboard — replace the KPIs and panels with your own. All data here is illustrative."
      kpis={KPIS}
    >
      <DashboardCard title="Trend by group" subtitle="Placeholder series — example data">
        <div className="not-prose">
          <TimeseriesLineV1
            data={byGroup}
            demographicGroups={['Group A', 'Group B', 'Group C']}
            demographic="Series"
            defaultVisibleGroups={['Group A', 'Group B']}
            density="medium"
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Topline metric" subtitle="Placeholder series — example data">
        <div className="not-prose">
          <TimeseriesLineV1
            data={topline}
            demographicGroups={['Overall']}
            demographic="Overall"
            defaultVisibleGroups={['Overall']}
            density="medium"
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Breakdown" subtitle="A simple list panel" wide>
        <ul className="divide-y divide-border text-sm">
          {[
            ['Segment one', '38%'],
            ['Segment two', '27%'],
            ['Segment three', '21%'],
            ['Segment four', '14%'],
          ].map(([label, val]) => (
            <li key={label} className="flex items-center justify-between py-2.5">
              <span className="text-body">{label}</span>
              <span className="tabular-nums text-muted">{val}</span>
            </li>
          ))}
        </ul>
      </DashboardCard>
    </DashboardHome>
  );
}
