import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { groupDataByDate } from '../utils/dateHelpers';
import { average, numberFormat } from '../utils/analyticsHelpers';
import { CHART_PALETTE, CHART_GRID, CHART_AXIS_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';

const BUCKET_COLOR = 'var(--accent)';
const TREND_COLOR = CHART_PALETTE[2];

export default function DispatchAnalytics({ dispatchBuckets, validDispatchRecords }) {
  const monthlyTrend = useMemo(
    () =>
      groupDataByDate(validDispatchRecords, 'createdDate', 'monthly', (records) => ({
        avgDispatchDays: average(records, 'dispatchDays'),
      })),
    [validDispatchRecords]
  );

  return (
    <>
      <ChartCard title="Dispatch Time Distribution">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dispatchBuckets} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                cursor={{ fill: CHART_HOVER_FILL }}
                content={
                  <ChartTooltip
                    rows={(payload) => {
                      const d = payload[0]?.payload;
                      if (!d) return [];
                      return [
                        { label: 'Orders', value: numberFormat(d.count) },
                        { label: 'Share', value: `${d.percentage.toFixed(1)}%` },
                      ];
                    }}
                  />
                }
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48} fill={BUCKET_COLOR} isAnimationActive animationDuration={350} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Monthly Avg. Dispatch Time">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={{ stroke: CHART_GRID }} tickLine={false} minTickGap={20} />
              <YAxis tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={false} tickLine={false} width={36} unit="d" />
              <Tooltip
                content={
                  <ChartTooltip
                    rows={(payload) => {
                      const d = payload[0]?.payload;
                      if (!d) return [];
                      return [{ label: 'Avg Days', value: d.avgDispatchDays.toFixed(1) }];
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="avgDispatchDays"
                stroke={TREND_COLOR}
                strokeWidth={2}
                dot={{ r: 3, fill: TREND_COLOR }}
                isAnimationActive
                animationDuration={350}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </>
  );
}
