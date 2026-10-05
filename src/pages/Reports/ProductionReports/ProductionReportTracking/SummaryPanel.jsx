import React, { useEffect, useMemo, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Layers, CircleDashed, Factory, PackageCheck, AlertTriangle,
  TrendingUp, Tag, Boxes, CalendarClock, Users, PieChart as PieChartIcon, LayoutGrid,
} from "lucide-react";
import { getStatusColor, statusLabel, isDelayed, fmt, TODAY } from "./shared";
import PlantPerformanceCard from "./PlantPerformanceCard";

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (next) => setDisplay(Math.round(next)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{fmt(display)}</>;
}

function KpiCard({ label, value, share, shareLabel, icon: Icon, color, active, danger, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-[var(--card)] p-4 text-left transition-shadow"
      style={{
        borderColor: active ? color : "var(--border)",
        boxShadow: active ? `0 0 0 1px ${color}, var(--shadow-lift)` : "var(--shadow)",
      }}
    >
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--ts)]">{label}</span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]"
          style={{ background: `${color}1A`, color }}
        >
          <Icon size={14} />
        </span>
      </div>

      <div
        className="mt-3 font-mono text-[28px] font-bold leading-none tracking-tight tabular-nums sm:text-[30px]"
        style={{ color: danger && value > 0 ? "#E5484D" : "var(--tp)" }}
      >
        <CountUp value={value} />
      </div>

      <div className="mt-3">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--border)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${share}%` }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1.5 text-[10px] text-[var(--tt)]">
          <span className="font-mono font-semibold text-[var(--ts)]">{share}%</span> {shareLabel}
        </div>
      </div>
    </motion.button>
  );
}

function Panel({ title, subtitle, icon: Icon, headerExtra, children, span, delay }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 ${span || ""}`}
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon size={13} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-semibold text-[var(--tp)]">{title}</h3>
            <p className="truncate text-[11px] text-[var(--tt)]">{subtitle}</p>
          </div>
        </div>
        {headerExtra}
      </div>
      {children}
    </motion.section>
  );
}

function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card-2)] p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          title={option.label}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
            value === option.key
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--ts)] hover:text-[var(--tp)]"
          }`}
        >
          <option.icon size={12} />
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 className="mb-0.5 mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tt)]">{children}</h2>
  );
}

function ChartEmptyState({ height = 180, message = "No data for this selection" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 text-center" style={{ height }}>
      <span className="text-[12px] font-medium text-[var(--ts)]">{message}</span>
      <span className="text-[10px] text-[var(--tt)]">Try adjusting the filters above</span>
    </div>
  );
}

// Custom cell so each block uses the same categorical color as the donut view,
// with the label only shown once a block is big enough to hold it legibly.
function TypeTreemapCell({ x, y, width, height, type, value, color }) {
  const showLabel = width > 46 && height > 28;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={color} stroke="#FFFFFF" strokeWidth={2} />
      {showLabel && (
        <text x={x + 8} y={y + 18} fontSize={11} fontWeight={600} fill="#FFFFFF">
          {type}
        </text>
      )}
      {showLabel && (
        <text x={x + 8} y={y + 33} fontSize={10} fill="#FFFFFF" fillOpacity={0.85}>
          {fmt(value)}
        </text>
      )}
    </g>
  );
}

const TYPE_VIEWS = [
  { key: "donut", label: "Donut", icon: PieChartIcon },
  { key: "treemap", label: "Treemap", icon: LayoutGrid },
];

function MiniLegend({ items }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[10.5px] text-[var(--ts)]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

const tooltipStyle = {
  // Literal colors on purpose, not var(--card)/var(--tp)/etc: this panel is rendered
  // inside an antd Modal, which portals to document.body by default — outside the
  // .po-app element that defines those CSS custom properties via inline style. Any
  // var() reference here would resolve to nothing there, which is what was making
  // the tooltip render with a transparent/black background and unreadable text.
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
  // Keeps the tooltip fully inside the viewport near chart edges instead of being
  // clipped, and guarantees it paints above the modal's own layers.
  wrapperStyle: { zIndex: 60, outline: "none", pointerEvents: "none" },
  allowEscapeViewBox: { x: true, y: true },
};

// Literal, same reason as tooltipStyle above: SVG fill/stroke fall back to solid
// black (not transparent) when a var() reference is invalid, so axis ticks and
// gridlines would render as black shapes instead of just disappearing.
const CHART_INK = "#8B95A3";
const CHART_GRID = "#E3E7EC";
const CHART_ACCENT = "#0F6CBD";
const CHART_HOVER = "#F2F5F8";

const axisProps = {
  tick: { fontSize: 10, fill: CHART_INK },
  axisLine: false,
  tickLine: false,
};

// Recharts wraps long category labels onto two lines; this keeps each one on a single line.
function SingleLineTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={3} textAnchor="end" fontSize={10} fill={CHART_INK}>
      {payload.value}
    </text>
  );
}

function weekStart(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  return date.toISOString().slice(0, 10);
}

// Fixed-order categorical set for identity-type dimensions (e.g. tyre Type) that
// don't already have a reserved status color. Anything past slot 5 folds into
// a neutral "Other" bucket rather than generating a new hue.
const CATEGORICAL_COLORS = ["#2E7FD6", "#7C5CFC", "#0EA5A0", "#EB6834", "#D6488A"];
const OTHER_COLOR = "#8B95A3";

export default function SummaryPanel({ rows, kpis, statusFilter, onSelectStatus, progressFilter, onSelectProgress }) {
  const [typeView, setTypeView] = useState("donut");

  // The ERP's orderStatus is free text (18+ distinct values seen live), not a fixed
  // enum, so the status mix is built from whatever statuses actually appear in the
  // current rows rather than a hardcoded list.
  const statusData = useMemo(() => {
    const counts = new Map();
    rows.forEach((row) => counts.set(row.status, (counts.get(row.status) || 0) + 1));
    return Array.from(counts.entries())
      .map(([key, value]) => ({ key, name: statusLabel(key), value, color: getStatusColor(key) }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const scheduleData = useMemo(() => {
    const byWeek = new Map();
    rows
      .filter((row) => row.dueDate)
      .forEach((row) => {
        const key = weekStart(row.dueDate);
        const current = byWeek.get(key) || { week: key, units: 0, orders: 0, overdue: 0 };
        current.units += row.orderQty - row.producedQty;
        current.orders += 1;
        if (isDelayed(row)) current.overdue += 1;
        byWeek.set(key, current);
      });

    return Array.from(byWeek.values())
      .sort((a, b) => a.week.localeCompare(b.week))
      .map((entry) => {
        // Day-first label: "2026-06-07" -> "07/06" (DD/MM).
        const [, month, day] = entry.week.split("-");
        return { ...entry, label: `${day}/${month}` };
      });
  }, [rows]);

  const customerData = useMemo(() => {
    const byCustomer = new Map();
    rows.forEach((row) => {
      const current = byCustomer.get(row.customerName) || { name: row.customerName, ordered: 0, produced: 0 };
      current.ordered += row.orderQty;
      current.produced += row.producedQty;
      byCustomer.set(row.customerName, current);
    });
    return Array.from(byCustomer.values())
      .sort((a, b) => b.ordered - a.ordered)
      .slice(0, 6)
      .map((entry) => ({
        ...entry,
        short: entry.name.length > 18 ? `${entry.name.slice(0, 17)}…` : entry.name,
      }));
  }, [rows]);

  // NEW — Chart 1: Production Trend. Ordered vs produced volume by week of orderDate
  // (the schedule chart above is dueDate/remaining-units based; this is orderDate/
  // volume based, so it answers a different question: is production keeping pace
  // with new orders over time).
  const trendData = useMemo(() => {
    const byWeek = new Map();
    rows
      .filter((row) => row.orderDate)
      .forEach((row) => {
        const key = weekStart(row.orderDate);
        const current = byWeek.get(key) || { week: key, ordered: 0, produced: 0 };
        current.ordered += row.orderQty;
        current.produced += row.producedQty;
        byWeek.set(key, current);
      });
    return Array.from(byWeek.values())
      .sort((a, b) => a.week.localeCompare(b.week))
      .map((entry) => {
        // Day-first label: "2026-06-07" -> "07/06" (DD/MM).
        const [, month, day] = entry.week.split("-");
        return { ...entry, label: `${day}/${month}` };
      });
  }, [rows]);

  // NEW — Chart 2: Type Mix. Composition by tyre type, distinct from the existing
  // Status Mix (stage) and Plant (facility) breakdowns.
  const typeData = useMemo(() => {
    const byType = new Map();
    rows.forEach((row) => {
      const key = row.tyreType || "Unspecified";
      byType.set(key, (byType.get(key) || 0) + 1);
    });

    const sorted = Array.from(byType.entries())
      .map(([type, value]) => ({ type, value }))
      .sort((a, b) => b.value - a.value);

    const top = sorted.slice(0, CATEGORICAL_COLORS.length).map((entry, index) => ({
      ...entry,
      color: CATEGORICAL_COLORS[index],
    }));
    const rest = sorted.slice(CATEGORICAL_COLORS.length);
    if (rest.length) {
      top.push({ type: "Other", value: rest.reduce((sum, entry) => sum + entry.value, 0), color: OTHER_COLOR });
    }
    return top;
  }, [rows]);

  // Category Performance. Ordered vs produced by product category (POB/SRT/PBB/...),
  // so management can see which categories are keeping pace with orders.
  const categoryData = useMemo(() => {
    const byCategory = new Map();
    rows.forEach((row) => {
      const key = row.category || "Uncategorized";
      const current = byCategory.get(key) || { category: key, ordered: 0, produced: 0 };
      current.ordered += row.orderQty;
      current.produced += row.producedQty;
      byCategory.set(key, current);
    });
    return Array.from(byCategory.values())
      .map((entry) => ({ ...entry, rate: entry.ordered ? Math.round((entry.produced / entry.ordered) * 100) : 0 }))
      .sort((a, b) => b.ordered - a.ordered);
  }, [rows]);

  const totalUnits = rows.reduce((sum, row) => sum + row.orderQty, 0);
  const producedUnits = rows.reduce((sum, row) => sum + row.producedQty, 0);
  const overallRate = totalUnits ? Math.round((producedUnits / totalUnits) * 100) : 0;
  const pct = (value) => (kpis.total ? Math.round((value / kpis.total) * 100) : 0);

  return (
    <div className="mb-5 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard index={0} label="Total Line Items" value={kpis.total} share={overallRate}
          shareLabel="of ordered volume produced" icon={Layers} color="var(--accent)"
          active={!statusFilter && !progressFilter} onClick={() => { onSelectStatus(null); onSelectProgress(null); }} />
        <KpiCard index={1} label="Not Started" value={kpis.notStarted} share={pct(kpis.notStarted)}
          shareLabel="of all line items" icon={CircleDashed} color="#8B95A3"
          active={progressFilter === "NOT_STARTED"} onClick={() => onSelectProgress("NOT_STARTED")} />
        <KpiCard index={2} label="In Progress" value={kpis.inProgress} share={pct(kpis.inProgress)}
          shareLabel="of all line items" icon={Factory} color="#2E8FE6"
          active={progressFilter === "IN_PROGRESS"} onClick={() => onSelectProgress("IN_PROGRESS")} />
        <KpiCard index={3} label="Fully Produced" value={kpis.fullyProduced} share={pct(kpis.fullyProduced)}
          shareLabel="of all line items" icon={PackageCheck} color="#1DA97C"
          active={progressFilter === "FULLY_PRODUCED"} onClick={() => onSelectProgress("FULLY_PRODUCED")} />
        <KpiCard index={4} label="Delayed" value={kpis.delayed} share={pct(kpis.delayed)}
          shareLabel="past due date" icon={AlertTriangle} color="#E5484D" danger
          active={statusFilter === "DELAYED"} onClick={() => onSelectStatus("DELAYED")} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Panel title="Status Mix" subtitle="Line items by current ERP stage" icon={PieChartIcon} delay={0.1}>
          <div className="relative">
            <ResponsiveContainer width="100%" height={196}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                  onClick={(entry) => onSelectStatus(entry.key)}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} cursor="pointer"
                      opacity={!statusFilter || statusFilter === entry.key ? 1 : 0.28} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[26px] font-bold leading-none tabular-nums text-[var(--tp)]">
                {rows.length}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-[var(--tt)]">Line Items</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {statusData.map((entry) => (
              <button key={entry.key} onClick={() => onSelectStatus(entry.key)}
                className="flex items-center gap-1.5 text-[11px] text-[var(--ts)] hover:text-[var(--tp)]">
                <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                {entry.name}
                <span className="font-mono font-semibold text-[var(--tp)]">{entry.value}</span>
              </button>
            ))}
          </div>
        </Panel>

        <PlantPerformanceCard rows={rows} delay={0.15} />
      </div>

      <SectionLabel>Trends &amp; Composition</SectionLabel>

      <Panel title="Production Trend" subtitle="Ordered vs produced volume, by order week" icon={TrendingUp} delay={0.18}>
        {trendData.length === 0 ? (
          <ChartEmptyState message="No dated orders to trend yet" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} cursor={{ stroke: CHART_GRID }} formatter={(value) => fmt(value)}
                  labelFormatter={(label) => `Week of ${label}`} />
                <Line type="monotone" dataKey="ordered" name="Ordered" stroke={CHART_INK} strokeWidth={2}
                  dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="produced" name="Produced" stroke={CHART_ACCENT} strokeWidth={2}
                  dot={{ r: 3, fill: CHART_ACCENT }} />
              </LineChart>
            </ResponsiveContainer>
            <MiniLegend items={[
              { label: "Ordered", color: CHART_INK },
              { label: "Produced", color: CHART_ACCENT },
            ]} />
          </>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Type Mix" subtitle="Line items by tyre type" icon={Tag} delay={0.22}
          headerExtra={<SegmentedToggle options={TYPE_VIEWS} value={typeView} onChange={setTypeView} />}>
          {typeData.length === 0 ? (
            <ChartEmptyState />
          ) : typeView === "donut" ? (
            <>
              <ResponsiveContainer width="100%" height={168}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="type" innerRadius={50} outerRadius={76}
                    paddingAngle={3} stroke="none">
                    {typeData.map((entry) => <Cell key={entry.type} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(value) => fmt(value)} />
                </PieChart>
              </ResponsiveContainer>
              <MiniLegend items={typeData.map((entry) => ({ label: `${entry.type} (${entry.value})`, color: entry.color }))} />
            </>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={168}>
                <Treemap data={typeData} dataKey="value" stroke="#FFFFFF" content={<TypeTreemapCell />}
                  isAnimationActive={false}>
                  <Tooltip {...tooltipStyle} formatter={(value) => fmt(value)} />
                </Treemap>
              </ResponsiveContainer>
              <MiniLegend items={typeData.map((entry) => ({ label: `${entry.type} (${entry.value})`, color: entry.color }))} />
            </>
          )}
        </Panel>

        <Panel title="Category Performance" subtitle="Ordered vs produced, by product category" icon={Boxes} delay={0.26}>
          {categoryData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={168}>
                <BarChart data={categoryData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="2 4" stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="category" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: CHART_HOVER }} formatter={(value) => fmt(value)} />
                  <Bar dataKey="ordered" name="Ordered" fill={CHART_GRID} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="produced" name="Produced" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <MiniLegend items={[
                  { label: "Ordered", color: CHART_GRID },
                  { label: "Produced", color: CHART_ACCENT },
                ]} />
                <div className="flex flex-wrap gap-1.5">
                  {categoryData.map((entry) => (
                    <span key={entry.category}
                      className="rounded-full border border-[var(--border)] bg-[var(--card-2)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--ts)]">
                      {entry.category} {entry.rate}%
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>

      <SectionLabel>Details</SectionLabel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Delivery Schedule" subtitle="Units still to produce, by due week" icon={CalendarClock} delay={0.3}>
          {scheduleData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={scheduleData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: CHART_HOVER }} formatter={(value) => fmt(value)}
                    labelFormatter={(label) => `Week of ${label}`} />
                  <Bar dataKey="units" name="Units remaining" radius={[4, 4, 0, 0]} maxBarSize={38}>
                    {scheduleData.map((entry) => (
                      <Cell key={entry.week} fill={entry.overdue > 0 ? "#E5484D" : CHART_ACCENT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-[10px] text-[var(--tt)]">
                One bar per due week. Red marks a week containing overdue work. Today is {TODAY}.
              </p>
            </>
          )}
        </Panel>

        <Panel title="Top Customers by Volume" subtitle="Ordered vs produced units, highest first" icon={Users} delay={0.34}>
          {customerData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={customerData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="short" width={124} interval={0}
                  axisLine={false} tickLine={false} tick={<SingleLineTick />} />
                <Tooltip {...tooltipStyle} cursor={{ fill: CHART_HOVER }} formatter={(value) => fmt(value)} />
                <Bar dataKey="ordered" name="Ordered" fill={CHART_GRID} radius={[0, 4, 4, 0]} barSize={9} />
                <Bar dataKey="produced" name="Produced" fill={CHART_ACCENT} radius={[0, 4, 4, 0]} barSize={9} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>
    </div>
  );
}
