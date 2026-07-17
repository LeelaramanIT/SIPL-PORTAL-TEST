import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { toSortedArray, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_GRID, CHART_AXIS_TEXT, CHART_LABEL_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';

const VISUALS = [
  { label: 'H-Bar', value: 'hbar' },
  { label: 'V-Bar', value: 'vbar' },
  { label: 'Pie', value: 'pie' },
];

const METRICS = {
  totalSales: { label: 'Sales Value', format: compactNumberFormat, tooltipFormat: currencyFormat },
  tyresSold: { label: 'Tyres', format: numberFormat, tooltipFormat: numberFormat },
  customerCount: { label: 'Customers', format: numberFormat, tooltipFormat: numberFormat },
  orderCount: { label: 'Orders', format: numberFormat, tooltipFormat: numberFormat },
};

const BAR_COLOR = 'var(--accent)';
const BAR_COLOR_HOVER = 'color-mix(in srgb, var(--accent) 80%, black)';

// Helper palette for the Pie Chart slices (uses variations of your accent color)
const PIE_COLORS = [
  'var(--accent)',
  'color-mix(in srgb, var(--accent) 85%, black)',
  'color-mix(in srgb, var(--accent) 70%, black)',
  'color-mix(in srgb, var(--accent) 55%, black)',
  'color-mix(in srgb, var(--accent) 40%, black)',
  'color-mix(in srgb, var(--accent) 85%, white)',
  'color-mix(in srgb, var(--accent) 70%, white)',
  'color-mix(in srgb, var(--accent) 55%, white)',
];

function PerformanceBarChart({ data, filterKey, onSelect, topN }) {
  const [visualType, setVisualType] = useState('hbar');
  const [metric, setMetric] = useState('totalSales');
  
  const sorted = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), metric, topN), [data, metric, topN]);
  const activeMetric = METRICS[metric];

  // Calculated dynamic height for horizontal layout; fallback to fixed height for vertical/pie
  const chartHeight = visualType === 'hbar' ? Math.max(220, sorted.length * 34) : 280;

  // Extracted custom tooltip logic to keep it DRY across all 3 chart types
  const renderTooltip = (
    <Tooltip
      cursor={visualType !== 'pie' ? { fill: CHART_HOVER_FILL } : false}
      content={
        <ChartTooltip
          rows={(payload) => {
            const d = payload[0]?.payload;
            if (!d) return [];
            // Handle both pie payload structure and bar payload structure
            const targetData = d.payload || d;
            return [
              { label: 'Name', value: targetData.key },
              { label: activeMetric.label, value: activeMetric.tooltipFormat(targetData[metric]) }
            ];
          }}
        />
      }
    />
  );

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Segmented
          size="small"
          value={visualType}
          onChange={setVisualType}
          options={VISUALS}
        />
        <Segmented
          size="small"
          value={metric}
          onChange={setMetric}
          options={Object.entries(METRICS).map(([value, m]) => ({ label: m.label, value }))}
        />
      </div>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {visualType === 'hbar' && (
            <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }}
                axisLine={false}
                tickLine={false}
                tickFormatter={activeMetric.format}
              />
              <YAxis
                type="category"
                dataKey="key"
                tick={{ fontSize: 11.5, fill: CHART_LABEL_TEXT }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              {renderTooltip}
              <Bar
                dataKey={metric}
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
                onClick={(d) => onSelect(filterKey, d.key)}
                cursor="pointer"
                isAnimationActive
                animationDuration={350}
              >
                {sorted.map((entry) => (
                  <Cell key={entry.key} fill={BAR_COLOR} className="hover:fill-[var(--hover)]" style={{ '--hover': BAR_COLOR_HOVER }} />
                ))}
              </Bar>
            </BarChart>
          )}

          {visualType === 'vbar' && (
            <BarChart data={sorted} layout="horizontal" margin={{ top: 12, right: 8, left: 0, bottom: 24 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis
                type="category"
                dataKey="key"
                tick={{ fontSize: 10, fill: CHART_LABEL_TEXT }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                type="number"
                tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }}
                axisLine={false}
                tickLine={false}
                tickFormatter={activeMetric.format}
              />
              {renderTooltip}
              <Bar
                dataKey={metric}
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
                onClick={(d) => onSelect(filterKey, d.key)}
                cursor="pointer"
                isAnimationActive
                animationDuration={350}
              >
                {sorted.map((entry) => (
                  <Cell key={entry.key} fill={BAR_COLOR} className="hover:fill-[var(--hover)]" style={{ '--hover': BAR_COLOR_HOVER }} />
                ))}
              </Bar>
            </BarChart>
          )}

          {visualType === 'pie' && (
            <PieChart>
              {renderTooltip}
              <Pie
                data={sorted}
                dataKey={metric}
                nameKey="key"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                cursor="pointer"
                onClick={(d) => onSelect(filterKey, d.payload.key)}
                isAnimationActive
                animationDuration={350}
              >
                {sorted.map((entry, index) => (
                  <Cell key={entry.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function LeadCrmPerformance({ data, onSelect }) {
  return (
    <ChartCard title="Lead CRM Performance">
      <PerformanceBarChart data={data} filterKey="leadCrms" onSelect={onSelect} topN={10} />
    </ChartCard>
  );
}

export function ManagerCrmPerformance({ data, onSelect }) {
  return (
    <ChartCard title="Manager CRM Performance">
      <PerformanceBarChart data={data} filterKey="managerCrms" onSelect={onSelect} topN={10} />
    </ChartCard>
  );
}