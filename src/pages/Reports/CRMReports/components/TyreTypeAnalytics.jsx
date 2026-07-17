import { useMemo, useState } from 'react';
import { Button, Table } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { toSortedArray, sum, groupBy, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_GRID, CHART_AXIS_TEXT, CHART_LABEL_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';

const BAR_COLOR = 'var(--accent)';
const BAR_COLOR_HOVER = 'color-mix(in srgb, var(--accent) 80%, black)';
const PLOT_CONTAINER_HEIGHT = 350; // Standardized, predictable height for both views

/** TYRE SIZE-wise breakdown of a single tyre type, computed from the already-filtered dataset. */
function buildDrilldown(filteredData, tyreType) {
  const records = filteredData.filter((r) => r.tyreType === tyreType);
  const groups = groupBy(records, (r) => r.tyreSize);
  return Array.from(groups.entries())
    .map(([tyreSize, groupRecords]) => ({
      tyreSize,
      orderCount: groupRecords.length,
      tyresSold: sum(groupRecords, 'tyreCount'),
      totalSales: sum(groupRecords, 'totalPrice'),
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

export default function TyreTypeAnalytics({ data, filteredData, onSelect }) {
  const [selectedTyreType, setSelectedTyreType] = useState(null);

  const sorted = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), 'totalSales'), [data]);
  const drilldown = useMemo(
    () => (selectedTyreType ? buildDrilldown(filteredData, selectedTyreType) : []),
    [filteredData, selectedTyreType]
  );

  if (selectedTyreType) {
    return (
      <ChartCard
        title={`Tyre Size Breakdown — ${selectedTyreType}`}
        controls={
          <div className="flex items-center gap-2">
            <Button size="small" icon={<ArrowLeftOutlined />} onClick={() => setSelectedTyreType(null)}>
              Back
            </Button>
            <Button size="small" type="primary" onClick={() => onSelect('tyreTypes', selectedTyreType)}>
              Filter dashboard
            </Button>
          </div>
        }
      >
        {/* Set a explicit, clean container height matching the chart height */}
        <div style={{ height: PLOT_CONTAINER_HEIGHT }} className="overflow-hidden">
          <Table
            size="small"
            dataSource={drilldown}
            rowKey="tyreSize"
            pagination={false}
            scroll={{ y: 280 }} // Keeps table headers sticky, scrolls only the body elegantly
            columns={[
              { title: 'Tyre Size', dataIndex: 'tyreSize', key: 'tyreSize' },
              { title: 'Orders', dataIndex: 'orderCount', key: 'orderCount', width: 90, render: numberFormat, sorter: (a, b) => a.orderCount - b.orderCount },
              { title: 'Qty', dataIndex: 'tyresSold', key: 'tyresSold', width: 90, render: numberFormat, sorter: (a, b) => a.tyresSold - b.tyresSold },
              {
                title: 'Revenue',
                dataIndex: 'totalSales',
                key: 'totalSales',
                width: 120,
                render: currencyFormat,
                sorter: (a, b) => a.totalSales - b.totalSales,
                defaultSortOrder: 'descend',
              },
            ]}
          />
        </div>
      </ChartCard>
    );
  }

  // Handle case where chart dataset has way too many entries (preventing massive layout stretch)
  const isScrollNeeded = sorted.length > 8;

  return (
    <ChartCard title="Tyre Type Performance">
      <div 
        style={{ height: PLOT_CONTAINER_HEIGHT }} 
        className="flex flex-col justify-between"
      >
        {/* Scroll container wraps ONLY the chart element itself when item count exceeds 8 */}
        <div className={`w-full flex-grow ${isScrollNeeded ? 'overflow-y-auto pr-1' : 'overflow-hidden'}`}>
          <div style={{ height: Math.max(PLOT_CONTAINER_HEIGHT - 35, sorted.length * 36) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={compactNumberFormat}
                />
                <YAxis 
                  type="category" 
                  dataKey="key" 
                  tick={{ 
                    fontSize: 11, 
                    fill: CHART_LABEL_TEXT,
                    style: { textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
                  }} 
                  axisLine={false} 
                  tickLine={false} 
                  width={90} 
                />
                <Tooltip
                  cursor={{ fill: CHART_HOVER_FILL }}
                  content={
                    <ChartTooltip
                      rows={(payload) => {
                        const d = payload[0]?.payload;
                        if (!d) return [];
                        return [
                          { label: 'Orders', value: numberFormat(d.orderCount) },
                          { label: 'Tyres Sold', value: numberFormat(d.tyresSold) },
                          { label: 'Revenue', value: currencyFormat(d.totalSales) },
                          { label: 'Avg Price', value: `₹${numberFormat(d.avgSellingPrice)}` },
                        ];
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="totalSales"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                  onClick={(d) => setSelectedTyreType(d.key)}
                  cursor="pointer"
                  isAnimationActive
                  animationDuration={350}
                >
                  {sorted.map((entry) => (
                    <Cell key={entry.key} fill={BAR_COLOR} className="hover:fill-[var(--hover)]" style={{ '--hover': BAR_COLOR_HOVER }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--foreground)]/50 tracking-wide">
          💡 Click a bar to see its Tyre Size-wise breakdown.
        </div>
      </div>
    </ChartCard>
  );
}