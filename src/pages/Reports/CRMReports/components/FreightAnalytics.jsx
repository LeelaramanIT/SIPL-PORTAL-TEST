import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { toSortedArray, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_GRID, CHART_AXIS_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';

export default function FreightAnalytics({ data, onSelect }) {
  const sorted = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), 'orderCount'), [data]);

  return (
    <ChartCard title="Freight Type Distribution">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="key" tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={compactNumberFormat} width={48} />
            <Tooltip
              cursor={{ fill: CHART_HOVER_FILL }}
              content={
                <ChartTooltip
                  rows={(payload) => {
                    const d = payload[0]?.payload;
                    if (!d) return [];
                    return [
                      { label: 'Orders', value: numberFormat(d.orderCount) },
                      { label: 'Sales', value: currencyFormat(d.totalSales) },
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="orderCount"
              radius={[6, 6, 0, 0]}
              maxBarSize={64}
              fill="var(--accent)"
              onClick={(d) => onSelect('freightTypes', d.key)}
              cursor="pointer"
              isAnimationActive
              animationDuration={350}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
