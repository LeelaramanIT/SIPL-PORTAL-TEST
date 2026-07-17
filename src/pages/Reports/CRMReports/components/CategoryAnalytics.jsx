import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { toSortedArray, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_PALETTE } from '../utils/chartTheme';

export default function CategoryAnalytics({ data, onSelect }) {
  const sorted = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), 'totalSales'), [data]);
  const totalSales = useMemo(() => sorted.reduce((acc, d) => acc + d.totalSales, 0), [sorted]);

  return (
    <ChartCard title="Category Sales Distribution">
      <div className="relative h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="totalSales"
              nameKey="key"
              innerRadius={60}
              outerRadius={86}
              paddingAngle={2}
              onClick={(d) => onSelect('categories', d.key)}
              cursor="pointer"
              isAnimationActive
              animationDuration={350}
            >
              {sorted.map((entry, i) => (
                <Cell key={entry.key} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  rows={(payload) => {
                    const d = payload[0]?.payload;
                    if (!d) return [];
                    return [
                      { label: 'Sales', value: currencyFormat(d.totalSales) },
                      { label: 'Tyres', value: numberFormat(d.tyresSold) },
                      { label: 'Share', value: `${d.salesShare.toFixed(1)}%` },
                    ];
                  }}
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-[var(--foreground)]/80 text-[12px]">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-14px' }}>
          <span className="text-[var(--foreground)]/40 text-[11px]">Total</span>
          <span className="text-[var(--foreground)] font-semibold text-[16px] tabular-nums">{compactNumberFormat(totalSales)}</span>
        </div>
      </div>
    </ChartCard>
  );
}
