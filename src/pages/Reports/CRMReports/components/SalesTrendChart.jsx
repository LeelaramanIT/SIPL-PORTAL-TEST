import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { groupDataByDate } from '../utils/dateHelpers';
import { sum, compactNumberFormat, currencyFormat, numberFormat } from '../utils/analyticsHelpers';
import { CHART_GRID, CHART_AXIS_TEXT } from '../utils/chartTheme';

const CHART_TYPES = [
  { label: 'Area', value: 'area' },
  { label: 'Bar', value: 'bar' },
];

const GRANULARITIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

const METRICS = {
  sales: { label: 'Sales Value', field: 'totalSales', format: compactNumberFormat },
  tyres: { label: 'Tyres Sold', field: 'tyresSold', format: numberFormat },
  orders: { label: 'Order Count', field: 'orderCount', format: numberFormat },
  aov: { label: 'Avg Order Value', field: 'avgOrderValue', format: compactNumberFormat },
};

const aggregator = (records) => ({
  totalSales: sum(records, 'totalPrice'),
  tyresSold: sum(records, 'tyreCount'),
  orderCount: records.length,
  avgOrderValue: records.length ? sum(records, 'totalPrice') / records.length : 0,
});

export default function SalesTrendChart({ filteredData, dateType }) {
  const [chartType, setChartType] = useState('area');
  const [granularity, setGranularity] = useState('monthly');
  const [metric, setMetric] = useState('sales');

  const chartData = useMemo(
    () => groupDataByDate(filteredData, dateType, granularity, aggregator),
    [filteredData, dateType, granularity]
  );

  const activeMetric = METRICS[metric];

  // Shared chart configurations to keep things DRY
  const sharedAxisAndGrid = (
    <>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={CHART_GRID} vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }}
        axisLine={{ stroke: CHART_GRID }}
        tickLine={false}
        minTickGap={24}
      />
      <YAxis
        tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(v) => activeMetric.format(v)}
        width={64}
      />
      <Tooltip
        content={
          <ChartTooltip
            rows={(payload) => {
              const d = payload[0]?.payload;
              if (!d) return [];
              return [
                { label: 'Sales Value', value: currencyFormat(d.totalSales) },
                { label: 'Tyres Sold', value: numberFormat(d.tyresSold) },
                { label: 'Order Count', value: numberFormat(d.orderCount) },
              ];
            }}
          />
        }
      />
    </>
  );

  return (
    <ChartCard
      title="Sales Trend"
      className="col-span-full"
      controls={
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Toggle */}
          <Segmented
            size="small"
            value={chartType}
            onChange={setChartType}
            options={CHART_TYPES}
          />
          {/* Metric Selector */}
          <Segmented
            size="small"
            value={metric}
            onChange={setMetric}
            options={Object.entries(METRICS).map(([value, m]) => ({ label: m.label, value }))}
          />
          {/* Granularity Selector */}
          <Segmented
            size="small"
            value={granularity}
            onChange={setGranularity}
            options={GRANULARITIES}
          />
        </div>
      }
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              {sharedAxisAndGrid}
              <Area
                type="monotone"
                dataKey={activeMetric.field}
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#trendFill)"
                isAnimationActive
                animationDuration={400}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              {sharedAxisAndGrid}
              <Bar
                dataKey={activeMetric.field}
                fill="url(#trendFill)"
                stroke="var(--accent)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                isAnimationActive
                animationDuration={400}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}