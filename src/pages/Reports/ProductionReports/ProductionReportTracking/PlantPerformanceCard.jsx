import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select } from "antd";
import {
  BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { LayoutGrid, ArrowDownWideNarrow } from "lucide-react";
import { fmt } from "./shared";

// Literal colors, not var(--card)/var(--tp)/etc: this card is rendered inside an
// antd Modal, which portals to document.body by default — outside the .po-app
// element that defines those CSS custom properties via inline style. Any var()
// reference here resolves to nothing there, which is what made the tooltip render
// with a black background and made bars/gridlines/axis ticks render solid black
// too (SVG fill/stroke fall back to black, not transparent, when a var() is invalid).
const CHART_INK = "#8B95A3";
const CHART_GRID = "#E3E7EC";
const CHART_ACCENT = "#0F6CBD";
const CHART_HOVER = "#F2F5F8";
const CHART_LINE = "#1DA97C";

// Bars use raw units; the % line is a different unit (0-100), so it renders against
// its own right-side axis and gets [value, name] pairs from the shared tooltip
// formatter so it reads unambiguously as "72%" instead of a bare "72".
function plantTooltipFormatter(value, name) {
  return name === "Production %" ? [`${value}%`, name] : [fmt(value), name];
}

const tooltipStyle = {
  contentStyle: {
    background: "#FFFFFF",
    border: "1px solid #E3E7EC",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
    lineHeight: 1.5,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
  },
  labelStyle: { color: "#0F1720", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#3D4552", padding: "2px 0" },
  wrapperStyle: { zIndex: 60, outline: "none", pointerEvents: "none" },
  allowEscapeViewBox: { x: true, y: true },
};

const axisProps = {
  tick: { fontSize: 10, fill: CHART_INK },
  axisLine: false,
  tickLine: false,
};

const CHART_VIEWS = [
  { key: "grouped", label: "Grouped", icon: LayoutGrid },
  { key: "ranked", label: "Ranked", icon: ArrowDownWideNarrow },
];

// Same aggregation SummaryPanel used before this was extracted — orderQty/producedQty
// summed per plant, unchanged.
function buildPlantData(rows) {
  const byPlant = new Map();
  rows.forEach((row) => {
    const current = byPlant.get(row.plant) || { plant: row.plant, ordered: 0, produced: 0 };
    current.ordered += row.orderQty;
    current.produced += row.producedQty;
    byPlant.set(row.plant, current);
  });
  return Array.from(byPlant.values())
    .map((entry) => ({ ...entry, rate: entry.ordered ? Math.round((entry.produced / entry.ordered) * 100) : 0 }))
    .sort((a, b) => b.ordered - a.ordered);
}

export default function PlantPerformanceCard({ rows, delay }) {
  const [chartView, setChartView] = useState("grouped");
  const [selectedPlants, setSelectedPlants] = useState([]);

  const plantData = useMemo(() => buildPlantData(rows), [rows]);
  const plantOptions = useMemo(
    () => plantData.map((entry) => ({ value: entry.plant, label: entry.plant })),
    [plantData]
  );

  const visibleData = useMemo(() => {
    const filtered = selectedPlants.length
      ? plantData.filter((entry) => selectedPlants.includes(entry.plant))
      : plantData;
    return chartView === "ranked" ? [...filtered].sort((a, b) => b.rate - a.rate) : filtered;
  }, [plantData, selectedPlants, chartView]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--tp)]">Ordered vs Produced by Plant</h3>
          <p className="mt-0.5 text-[11px] text-[var(--tt)]">
            {chartView === "ranked"
              ? "Ranked by completion rate, highest first"
              : "Ordered vs produced units, with production % per plant"}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card-2)] p-0.5">
          {CHART_VIEWS.map((view) => (
            <button
              key={view.key}
              onClick={() => setChartView(view.key)}
              title={`${view.label} chart`}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                chartView === view.key
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--ts)] hover:text-[var(--tp)]"
              }`}
            >
              <view.icon size={12} />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select
          mode="multiple"
          allowClear
          size="small"
          placeholder="All plants"
          style={{ minWidth: 200 }}
          maxTagCount="responsive"
          value={selectedPlants}
          onChange={setSelectedPlants}
          options={plantOptions}
        />
        {selectedPlants.length > 0 && (
          <button
            onClick={() => setSelectedPlants([])}
            className="text-[11px] font-medium text-[var(--accent)] hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {visibleData.length === 0 ? (
        <div className="flex h-[196px] items-center justify-center text-[12px] text-[var(--tt)]">
          No plant data for this selection
        </div>
      ) : chartView === "grouped" ? (
        <>
          <ResponsiveContainer width="100%" height={196}>
            <ComposedChart data={visibleData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="2 4" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="plant" {...axisProps} />
              <YAxis yAxisId="left" {...axisProps} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]}
                tickFormatter={(value) => `${value}%`} {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: CHART_HOVER }} formatter={plantTooltipFormatter} />
              <Bar yAxisId="left" dataKey="ordered" name="Ordered" fill={CHART_GRID} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="produced" name="Produced" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="rate" name="Production %"
                stroke={CHART_LINE} strokeWidth={2} dot={{ r: 3, fill: CHART_LINE }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {[
              { label: "Ordered", color: CHART_GRID },
              { label: "Produced", color: CHART_ACCENT },
              { label: "Production %", color: CHART_LINE },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-[10.5px] text-[var(--ts)]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(196, visibleData.length * 34)}>
          <BarChart data={visibleData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="2 4" stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="plant" width={56} axisLine={false} tickLine={false}
              tick={{ fontSize: 10, fill: CHART_INK }} />
            <Tooltip {...tooltipStyle} cursor={{ fill: CHART_HOVER }} formatter={(value) => fmt(value)} />
            <Bar dataKey="ordered" name="Ordered" fill={CHART_GRID} radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="produced" name="Produced" fill={CHART_ACCENT} radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 grid grid-cols-4 gap-2">
        {visibleData.map((entry) => (
          <div key={entry.plant} className="rounded-lg border border-[var(--border)] bg-[var(--card-2)] px-2 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-[var(--tt)]">{entry.plant}</div>
            <div className="font-mono text-[14px] font-bold tabular-nums text-[var(--tp)]">{entry.rate}%</div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
