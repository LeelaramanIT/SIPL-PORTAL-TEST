import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { toSortedArray, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_PALETTE, CHART_GRID, CHART_AXIS_TEXT, CHART_LABEL_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';

const VIEWS = {
  tyreSize: { label: 'Tyre Size', filterKey: 'tyreSizes', topN: 10, color: CHART_PALETTE[0] },
  platform: { label: 'Platform', filterKey: 'platforms', topN: 10, color: CHART_PALETTE[1] },
  rimType: { label: 'Rim Type', filterKey: 'rimTypes', topN: 10, color: CHART_PALETTE[2] },
};

export default function ProductAnalytics({ tyreSizeData, platformData, rimTypeData, onSelect }) {
  const [view, setView] = useState('tyreSize');
  const source = { tyreSize: tyreSizeData, platform: platformData, rimType: rimTypeData }[view];
  const config = VIEWS[view];

  const sorted = useMemo(
    () => toSortedArray(new Map(source.map((d) => [d.key, d])), 'totalSales', config.topN),
    [source, config.topN]
  );

  return (
    <ChartCard
      title="Product & Tyre Analytics"
      controls={
        <Segmented
          size="small"
          value={view}
          onChange={setView}
          options={Object.entries(VIEWS).map(([value, v]) => ({ label: v.label, value }))}
        />
      }
    >
      <div style={{ height: Math.max(200, sorted.length * 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={compactNumberFormat} />
            <YAxis type="category" dataKey="key" tick={{ fontSize: 11.5, fill: CHART_LABEL_TEXT }} axisLine={false} tickLine={false} width={92} />
            <Tooltip
              cursor={{ fill: CHART_HOVER_FILL }}
              content={
                <ChartTooltip
                  rows={(payload) => {
                    const d = payload[0]?.payload;
                    if (!d) return [];
                    return [
                      { label: 'Sales', value: currencyFormat(d.totalSales) },
                      { label: 'Tyres Sold', value: numberFormat(d.tyresSold) },
                      { label: 'Avg Rate', value: `₹${numberFormat(d.avgRate)}` },
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="totalSales"
              radius={[0, 6, 6, 0]}
              maxBarSize={18}
              fill={config.color}
              onClick={(d) => onSelect(config.filterKey, d.key)}
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
