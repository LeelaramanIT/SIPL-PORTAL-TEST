import { useMemo, useState } from 'react';
import { Select, Segmented } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import ChartCard from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';
import { CHART_GRID, CHART_AXIS_TEXT } from '../utils/chartTheme';

const COLUMN_WIDTH = 34;
const CHART_HEIGHT = 420;
const LABEL_AREA_HEIGHT = 110;

const METRICS = {
  qty: { label: 'QTY', field: 'qty', tickFormat: numberFormat },
  tonnage: { label: 'TONNAGE', field: 'tonnage', tickFormat: (v) => numberFormat(v, 1) },
  salesValue: { label: 'SALES VALUE', field: 'salesValue', tickFormat: compactNumberFormat },
};

/** Numeric-aware sort so "6.50-10" sorts after "6.00-9" and "4.00-4" sorts before "4.00-8" — a plain string sort gets both wrong. */
const compareTyreSize = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function buildColumns(records) {
  const monthGroups = new Map(); // monthKey -> { label, sortDate, sizes: Map(tyreSize -> {qty,tonnage,salesValue}) }

  records.forEach((r) => {
    const monthKey = r.createdDate.format('YYYY-MM');
    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, { label: r.createdDate.format('MMMM YYYY'), sortDate: r.createdDate, sizes: new Map() });
    }
    const group = monthGroups.get(monthKey);
    if (!group.sizes.has(r.tyreSize)) {
      group.sizes.set(r.tyreSize, { qty: 0, tonnage: 0, salesValue: 0 });
    }
    const agg = group.sizes.get(r.tyreSize);
    agg.qty += r.tyreCount;
    agg.tonnage += r.totalWeight / 1000;
    agg.salesValue += r.totalPrice;
  });

  const sortedMonths = Array.from(monthGroups.entries()).sort((a, b) => a[1].sortDate.valueOf() - b[1].sortDate.valueOf());

  const columns = [];
  sortedMonths.forEach(([monthKey, group]) => {
    columns.push({ type: 'header', catKey: `header::${monthKey}`, label: group.label });
    const sizes = Array.from(group.sizes.entries()).sort((a, b) => compareTyreSize(a[0], b[0]));
    sizes.forEach(([tyreSize, metrics]) => {
      columns.push({
        type: 'column',
        catKey: `${monthKey}::${tyreSize}`,
        label: tyreSize,
        monthLabel: group.label,
        tyreSize,
        ...metrics,
      });
    });
  });

  return columns;
}

function XAxisTick({ x, y, payload, lookup }) {
  const col = lookup.get(payload.value);
  if (!col) return null;

  if (col.type === 'header') {
    return (
      <text x={x} y={y + 10} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--accent)" transform={`rotate(-60 ${x} ${y + 10})`}>
        {col.label}
      </text>
    );
  }
  return (
    <text x={x} y={y + 10} textAnchor="end" fontSize={10.5} fill={CHART_AXIS_TEXT} transform={`rotate(-60 ${x} ${y + 10})`}>
      {col.label}
    </text>
  );
}

export default function MonthlyTyreSizeChart({ dataset }) {
  const [leadCrms, setLeadCrms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metric, setMetric] = useState('qty');

  const filterOptions = useMemo(
    () => ({
      leadCrms: Array.from(new Set(dataset.map((r) => r.leadCrm))).sort(),
      categories: Array.from(new Set(dataset.map((r) => r.category))).sort(),
    }),
    [dataset]
  );

  const filteredRecords = useMemo(() => {
    return dataset.filter((r) => {
      if (leadCrms.length && !leadCrms.includes(r.leadCrm)) return false;
      if (categories.length && !categories.includes(r.category)) return false;
      return true;
    });
  }, [dataset, leadCrms, categories]);

  const columns = useMemo(() => buildColumns(filteredRecords), [filteredRecords]);
  const lookup = useMemo(() => new Map(columns.map((c) => [c.catKey, c])), [columns]);
  const dataColumnCount = useMemo(() => columns.filter((c) => c.type === 'column').length, [columns]);
  const headerKeys = useMemo(() => columns.filter((c) => c.type === 'header').map((c) => c.catKey), [columns]);

  const activeMetric = METRICS[metric];
  const chartWidth = Math.max(560, columns.length * COLUMN_WIDTH);

  return (
    <ChartCard
      title="Monthly Tyre Size Sales"
      className="col-span-full"
      controls={
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            mode="multiple"
            showSearch
            allowClear
            maxTagCount="responsive"
            placeholder="CRM Lead"
            value={leadCrms}
            onChange={setLeadCrms}
            options={filterOptions.leadCrms.map((v) => ({ label: v, value: v }))}
            className="min-w-[160px]"
          />
          <Select
            mode="multiple"
            showSearch
            allowClear
            maxTagCount="responsive"
            placeholder="Category"
            value={categories}
            onChange={setCategories}
            options={filterOptions.categories.map((v) => ({ label: v, value: v }))}
            className="min-w-[160px]"
          />
          <Segmented
            size="small"
            value={metric}
            onChange={setMetric}
            options={Object.entries(METRICS).map(([value, m]) => ({ label: m.label, value }))}
          />
        </div>
      }
    >
      <div className="text-[12.5px] text-[var(--foreground)]/55">
        Showing <span className="font-medium text-[var(--foreground)]">{numberFormat(dataColumnCount)}</span> tyre-size entries
        across <span className="font-medium text-[var(--foreground)]">{numberFormat(headerKeys.length)}</span> months — scroll
        sideways for the full range.
      </div>

      {columns.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-[var(--foreground)]/40 text-[13px]">
          No records match the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <BarChart
            width={chartWidth}
            height={CHART_HEIGHT}
            data={columns}
            margin={{ top: 8, right: 12, left: 0, bottom: LABEL_AREA_HEIGHT }}
            barCategoryGap={2}
          >
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            {headerKeys.map((key) => (
              <ReferenceLine key={key} x={key} stroke={CHART_GRID} strokeDasharray="2 3" />
            ))}
            <XAxis
              dataKey="catKey"
              interval={0}
              axisLine={{ stroke: CHART_GRID }}
              tickLine={false}
              tick={<XAxisTick lookup={lookup} />}
            />
            <YAxis
              type="number"
              tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }}
              axisLine={false}
              tickLine={false}
              tickFormatter={activeMetric.tickFormat}
              width={56}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in srgb, var(--foreground) 6%, transparent)' }}
              content={
                <ChartTooltip
                  rows={(payload) => {
                    const d = payload[0]?.payload;
                    if (!d || d.type === 'header') return [];
                    return [
                      { label: 'Month', value: d.monthLabel },
                      { label: 'Tyre Size', value: d.tyreSize },
                      { label: 'QTY', value: numberFormat(d.qty) },
                      { label: 'Tonnage', value: `${numberFormat(d.tonnage, 2)} T` },
                      { label: 'Sales Value', value: currencyFormat(d.salesValue) },
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey={activeMetric.field}
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              isAnimationActive
              animationDuration={300}
            />
          </BarChart>
        </div>
      )}
    </ChartCard>
  );
}