import { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Legend
} from "recharts";
import {
  TrendingUp, Factory, Zap, AlertTriangle, CheckCircle,
  Download, Search, ChevronUp, ChevronDown, Filter, Calendar,
  Sun, Moon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  Package, X, Activity, BarChart3, Clock
} from "lucide-react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const PLANTS = ["Plant A", "Plant B", "Plant C", "Plant D"];
const SHIFTS = ["Morning", "Evening", "Night"];
const TYRE_TYPES = ["Radial", "Tubeless", "Off-road", "Truck"];
const STATUSES = ["Completed", "In Progress", "On Hold", "Failed"];

const sd = (n) => { const x = Math.sin(n + 42) * 99999; return x - Math.floor(x); };

const PRODUCTION_DATA = Array.from({ length: 60 }, (_, i) => {
  const plant = PLANTS[Math.floor(sd(i) * PLANTS.length)];
  const shift = SHIFTS[Math.floor(sd(i + 1) * SHIFTS.length)];
  const type = TYRE_TYPES[Math.floor(sd(i + 2) * TYRE_TYPES.length)];
  const date = new Date(2025, Math.floor(sd(i + 3) * 12), Math.floor(sd(i + 4) * 28) + 1);
  const production = Math.floor(sd(i + 5) * 800 + 200);
  const efficiency = Math.floor(sd(i + 6) * 15 + 85);
  const defects = Math.floor(sd(i + 7) * 50);
  
  return {
    id: `PROD-${1000 + i}`,
    plant,
    shift,
    type,
    date: date.toISOString().split("T")[0],
    production,
    dispatch: Math.floor(production * (0.85 + sd(i + 8) * 0.15)),
    efficiency,
    defects,
    status: STATUSES[Math.floor(sd(i + 9) * STATUSES.length)],
  };
});

const MONTHLY_PROD = [
  { month: "Jan", production: 18500, efficiency: 87, defects: 245 },
  { month: "Feb", production: 19200, efficiency: 88, defects: 215 },
  { month: "Mar", production: 20100, efficiency: 89, defects: 198 },
  { month: "Apr", production: 21500, efficiency: 90, defects: 175 },
  { month: "May", production: 20800, efficiency: 89, defects: 192 },
  { month: "Jun", production: 22300, efficiency: 91, defects: 155 },
  { month: "Jul", production: 21900, efficiency: 90, defects: 168 },
  { month: "Aug", production: 23400, efficiency: 92, defects: 142 },
  { month: "Sep", production: 22100, efficiency: 91, defects: 158 },
  { month: "Oct", production: 24200, efficiency: 93, defects: 128 },
  { month: "Nov", production: 25100, efficiency: 94, defects: 112 },
  { month: "Dec", production: 26500, efficiency: 95, defects: 95 },
];

const PLANT_STATS = [
  { name: "Plant A", production: 52000, efficiency: 91, defects: 285, color: "#6366f1" },
  { name: "Plant B", production: 48500, efficiency: 89, defects: 315, color: "#8b5cf6" },
  { name: "Plant C", production: 55200, efficiency: 93, defects: 245, color: "#10b981" },
  { name: "Plant D", production: 43800, efficiency: 87, defects: 365, color: "#f59e0b" },
];

const TYPE_BREAKDOWN = [
  { name: "Radial", value: 48500, color: "#6366f1" },
  { name: "Tubeless", value: 42300, color: "#8b5cf6" },
  { name: "Off-road", value: 35600, color: "#10b981" },
  { name: "Truck", value: 23400, color: "#f59e0b" },
];

// ─── THEMES ────────────────────────────────────────────────────────────────
const LIGHT = {
  "--bg": "#f8fafb",
  "--card": "#ffffff",
  "--border": "#e5e7eb",
  "--tp": "#111827",
  "--ts": "#6b7280",
  "--tt": "#9ca3af",
  "--skeleton": "#e9ecf0",
  "--row-alt": "#f9fafb",
  "--hover": "#f3f4f6",
  "--input-bg": "#f9fafb",
};

const DARK = {
  "--bg": "#0f1117",
  "--card": "#161b22",
  "--border": "#21262d",
  "--tp": "#e6edf3",
  "--ts": "#8b949e",
  "--tt": "#6e7681",
  "--skeleton": "#21262d",
  "--row-alt": "#0d1117",
  "--hover": "#1c2128",
  "--input-bg": "#0d1117",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const fmt = (v) => v.toLocaleString("en-IN");
const STATUS_COLORS = {
  "Completed": { bg: "#10b98118", text: "#10b981", icon: "✓" },
  "In Progress": { bg: "#6366f118", text: "#6366f1", icon: "⟳" },
  "On Hold": { bg: "#f59e0b18", text: "#d97706", icon: "⏸" },
  "Failed": { bg: "#ef444418", text: "#ef4444", icon: "✕" },
};

// ─── SKELETON LOADER ──────────────────────────────────────────────────────
const Skel = ({ h = 16, w = "100%", r = 8 }) => (
  <div style={{
    height: h,
    width: w,
    borderRadius: r,
    background: "var(--skeleton)",
    animation: "pulse 1.6s ease-in-out infinite",
  }} />
);

// ─── STATS CARD ──────────────────────────────────────────────────────────
function StatsCard({ title, value, change, icon: Icon, color, loading }) {
  const pos = change >= 0;
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "18px 20px",
      transition: "transform .18s, box-shadow .18s",
      cursor: "pointer",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Skel h={12} w={90} /><Skel h={28} w={120} /><Skel h={10} w={80} />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ts)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{title}</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={17} style={{ color }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--tp)", fontVariantNumeric: "tabular-nums", marginBottom: 8, letterSpacing: "-0.02em" }}>{value}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            {pos ? <ArrowUpRight size={13} style={{ color: "#10b981" }} /> : <ArrowDownRight size={13} style={{ color: "#ef4444" }} />}
            <span style={{ color: pos ? "#10b981" : "#ef4444", fontWeight: 600 }}>{Math.abs(change)}%</span>
            <span style={{ color: "var(--tt)" }}>vs last month</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FILTER BAR ───────────────────────────────────────────────────────────
function FilterBar({ plant, setPlant, shift, setShift, type, setType, chartType, setChartType, search, setSearch, onExport, dark, setDark }) {
  const inputBase = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "var(--tp)",
    width: "100%",
  };
  const groupStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 140,
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "7px 12px",
  };
  const iconColor = { color: "var(--ts)" };
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "14px 16px",
      marginBottom: 20,
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
    }}>
      <div style={groupStyle}>
        <Factory size={14} style={iconColor} />
        <select value={plant} onChange={e => setPlant(e.target.value)} style={{ ...inputBase }}>
          <option value="all">All Plants</option>
          {PLANTS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div style={groupStyle}>
        <Clock size={14} style={iconColor} />
        <select value={shift} onChange={e => setShift(e.target.value)} style={{ ...inputBase }}>
          <option value="all">All Shifts</option>
          {SHIFTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={groupStyle}>
        <Zap size={14} style={iconColor} />
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputBase }}>
          <option value="all">All Types</option>
          {TYRE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={groupStyle}>
        <BarChart3 size={14} style={iconColor} />
        <select value={chartType} onChange={e => setChartType(e.target.value)} style={{ ...inputBase }}>
          <option value="area">Area Chart</option>
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
      </div>
      <div style={{ ...groupStyle, minWidth: 200 }}>
        <Search size={14} style={iconColor} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." style={{ ...inputBase, flex: 1 }} />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <X size={13} style={{ color: "var(--ts)" }} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
        <button onClick={() => setDark(!dark)} style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--input-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--ts)",
        }}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button onClick={onExport} style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 16px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          transition: "opacity .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".87"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Download size={14} /> Export
        </button>
      </div>
    </div>
  );
}

// ─── DATASET TOGGLE ────────────────────────────────────────────────────────
function DSToggle({ active, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "3px 10px",
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 600,
      border: `1.5px solid ${color}`,
      cursor: "pointer",
      transition: "all .15s",
      background: active ? color + "20" : "transparent",
      color: active ? color : "var(--ts)",
      opacity: active ? 1 : 0.5,
    }}>
      {label}
    </button>
  );
}

// ─── CHART SECTION ────────────────────────────────────────────────────────
function ChartSection({ monthlyData, chartType, loading }) {
  const [ds, setDs] = useState({ production: true, efficiency: true });
  const toggle = k => setDs(p => ({ ...p, [k]: !p[k] }));
  const tt = {
    contentStyle: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      fontSize: 12,
      color: "var(--tp)",
    },
    formatter: (v, n) => [fmt(v), n],
  };
  const cardStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "18px 20px",
  };

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
      <div style={{ ...cardStyle, height: 320 }}><Skel h="100%" /></div>
      <div style={{ ...cardStyle, height: 320 }}><Skel h="100%" /></div>
    </div>
  );

  const renderMain = () => {
    const common = { data: monthlyData, margin: { top: 5, right: 16, left: -8, bottom: 0 } };
    if (chartType === "bar") return (
      <BarChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ts)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--ts)" }} axisLine={false} tickLine={false} />
        <Tooltip {...tt} />
        {ds.production && <Bar dataKey="production" name="Production" fill="#6366f1" radius={[5, 5, 0, 0]} />}
        {ds.efficiency && <Bar dataKey="efficiency" name="Efficiency %" fill="#10b981" radius={[5, 5, 0, 0]} />}
      </BarChart>
    );
    if (chartType === "line") return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ts)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--ts)" }} axisLine={false} tickLine={false} />
        <Tooltip {...tt} />
        {ds.production && <Line type="monotone" dataKey="production" name="Production" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
        {ds.efficiency && <Line type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <defs>
          <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ts)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--ts)" }} axisLine={false} tickLine={false} />
        <Tooltip {...tt} />
        {ds.production && <Area type="monotone" dataKey="production" name="Production" stroke="#6366f1" fill="url(#gP)" strokeWidth={2.5} />}
        {ds.efficiency && <Area type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#10b981" fill="url(#gE)" strokeWidth={2.5} />}
      </AreaChart>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16 }}>
        {/* Main Chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tp)", marginBottom: 2 }}>Production Overview</div>
              <div style={{ fontSize: 11, color: "var(--ts)" }}>Monthly performance metrics</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <DSToggle active={ds.production} label="Units" color="#6366f1" onClick={() => toggle("production")} />
              <DSToggle active={ds.efficiency} label="Efficiency" color="#10b981" onClick={() => toggle("efficiency")} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {renderMain()}
          </ResponsiveContainer>
        </div>

        {/* Plant Stats */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tp)", marginBottom: 2 }}>Plant Performance</div>
          <div style={{ fontSize: 11, color: "var(--ts)", marginBottom: 12 }}>Production by facility</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PLANT_STATS.map(p => (
              <div key={p.name} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--row-alt)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tp)" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--tp)" }}>{fmt(p.production)}</span>
                </div>
                <div style={{ height: 4, background: "var(--hover)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: p.efficiency + "%", background: p.color, transition: "width .3s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Type Distribution */}
      <div style={{ ...cardStyle }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tp)", marginBottom: 2 }}>Type Distribution</div>
        <div style={{ fontSize: 11, color: "var(--ts)", marginBottom: 12 }}>Production by tyre type</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {TYPE_BREAKDOWN.map(t => (
            <div key={t.name} style={{ padding: "12px", borderRadius: 10, background: "var(--row-alt)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tp)" }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.color }}>{fmt(t.value)}</div>
              <div style={{ fontSize: 10, color: "var(--ts)", marginTop: 4 }}>Units produced</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCTION TABLE ─────────────────────────────────────────────────────
const COLS = [
  { key: "id", label: "ID", w: 100 },
  { key: "plant", label: "Plant", w: 90 },
  { key: "shift", label: "Shift", w: 80 },
  { key: "type", label: "Type", w: 100 },
  { key: "production", label: "Production", w: 110 },
  { key: "efficiency", label: "Efficiency", w: 100 },
  { key: "defects", label: "Defects", w: 80 },
  { key: "date", label: "Date", w: 100 },
  { key: "status", label: "Status", w: 110 },
];

const PER_PAGE = 8;

function ProductionTable({ data, loading }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => [...data].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  }), [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const rows = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const onSort = k => {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const pages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, 4, 5];
    if (safePage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  }, [totalPages, safePage]);

  const thStyle = (key) => ({
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 600,
    textAlign: "left",
    color: sortKey === key ? "#6366f1" : "var(--ts)",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    letterSpacing: "0.03em",
    background: "var(--row-alt)",
  });

  if (loading) return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
          {[90, 80, 90, 100, 100, 90, 70, 90].map((w, j) => <Skel key={j} h={12} w={w} />)}
        </div>
      ))}
    </div>
  );

  if (!data.length) return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "64px 20px",
      textAlign: "center",
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#6366f118", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Package size={26} style={{ color: "#6366f1" }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--tp)", marginBottom: 6 }}>No records found</div>
      <div style={{ fontSize: 13, color: "var(--ts)" }}>Try adjusting your filters</div>
    </div>
  );

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 900 }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} style={{ ...thStyle(c.key), width: c.w }} onClick={() => onSort(c.key)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {c.label}
                    {sortKey === c.key
                      ? (sortDir === "asc" ? <ChevronUp size={11} style={{ color: "#6366f1" }} /> : <ChevronDown size={11} style={{ color: "#6366f1" }} />)
                      : <ChevronUp size={11} style={{ color: "var(--tt)", opacity: 0.4 }} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}
                style={{ background: i % 2 === 0 ? "transparent" : "var(--row-alt)", transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--row-alt)"}
              >
                <td style={{ padding: "11px 12px", fontSize: 12, color: "#6366f1", fontFamily: "'Courier New',monospace", fontWeight: 700, borderBottom: "1px solid var(--border)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.id}</td>
                <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 600, color: "var(--tp)", borderBottom: "1px solid var(--border)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.plant}</td>
                <td style={{ padding: "11px 12px", fontSize: 12, color: "var(--ts)", borderBottom: "1px solid var(--border)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.shift}</td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#6366f112", color: "#6366f1", whiteSpace: "nowrap" }}>{row.type}</span>
                </td>
                <td style={{ padding: "11px 12px", fontSize: 12, fontWeight: 700, color: "var(--tp)", fontVariantNumeric: "tabular-nums", fontFamily: "'Courier New',monospace", borderBottom: "1px solid var(--border)" }}>{fmt(row.production)}</td>
                <td style={{ padding: "11px 12px", fontSize: 12, fontWeight: 700, color: row.efficiency >= 90 ? "#10b981" : row.efficiency >= 85 ? "#f59e0b" : "#ef4444", borderBottom: "1px solid var(--border)" }}>{row.efficiency}%</td>
                <td style={{ padding: "11px 12px", fontSize: 12, fontWeight: 600, color: row.defects < 30 ? "#10b981" : row.defects < 50 ? "#f59e0b" : "#ef4444", borderBottom: "1px solid var(--border)" }}>{row.defects}</td>
                <td style={{ padding: "11px 12px", fontSize: 12, color: "var(--ts)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{row.date}</td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: STATUS_COLORS[row.status]?.bg,
                    color: STATUS_COLORS[row.status]?.text,
                    whiteSpace: "nowrap",
                  }}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 12, color: "var(--ts)" }}>
          Showing {Math.min((safePage - 1) * PER_PAGE + 1, data.length)}–{Math.min(safePage * PER_PAGE, data.length)} of <strong style={{ color: "var(--tp)" }}>{data.length}</strong> records
        </span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
            style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--input-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tp)", opacity: safePage === 1 ? 0.35 : 1 }}>
            <ChevronLeft size={13} />
          </button>
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{
                width: 28, height: 28, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .12s",
                border: p === safePage ? "none" : "1px solid var(--border)",
                background: p === safePage ? "#6366f1" : "var(--input-bg)",
                color: p === safePage ? "#fff" : "var(--ts)",
              }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--input-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tp)", opacity: safePage === totalPages ? 0.35 : 1 }}>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
export default function ProductionDashboard() {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plant, setPlant] = useState("all");
  const [shift, setShift] = useState("all");
  const [type, setType] = useState("all");
  const [chartType, setChartType] = useState("area");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const filteredData = useMemo(() => {
    let d = [...PRODUCTION_DATA];
    if (plant !== "all") d = d.filter(x => x.plant === plant);
    if (shift !== "all") d = d.filter(x => x.shift === shift);
    if (type !== "all") d = d.filter(x => x.type === type);
    if (search) {
      const s = search.toLowerCase();
      d = d.filter(x =>
        x.id.toLowerCase().includes(s) ||
        x.plant.toLowerCase().includes(s) ||
        x.type.toLowerCase().includes(s) ||
        x.status.toLowerCase().includes(s)
      );
    }
    return d;
  }, [plant, shift, type, search]);

  const stats = useMemo(() => {
    const totalProduction = filteredData.reduce((s, o) => s + o.production, 0);
    const avgEfficiency = Math.round(filteredData.reduce((s, o) => s + o.efficiency, 0) / (filteredData.length || 1));
    const totalDefects = filteredData.reduce((s, o) => s + o.defects, 0);
    return { totalProduction, avgEfficiency, totalDefects, count: filteredData.length };
  }, [filteredData]);

  const handleExport = () => {
    const header = ["ID", "Plant", "Shift", "Type", "Production", "Dispatch", "Efficiency", "Defects", "Date", "Status"];
    const rows = filteredData.map(o => [o.id, o.plant, o.shift, o.type, o.production, o.dispatch, o.efficiency, o.defects, o.date, o.status]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `production-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const theme = dark ? DARK : LIGHT;

  return (
    <div style={{ ...theme, background: "var(--bg)", minHeight: "100vh", fontFamily: "'Geist','Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        select option { background:${dark ? "#1a1d2e" : "#fff"}; color:${dark ? "#f1f5f9" : "#111"}; }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "24px 20px" }}>
        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Factory size={16} style={{ color: "#fff" }} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--tp)", margin: 0, letterSpacing: "-0.02em" }}>Production Dashboard</h1>
            </div>
            <p style={{ fontSize: 12, color: "var(--ts)", margin: 0 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "#10b98118", border: "1px solid #10b98130" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>Live Data</span>
          </div>
        </div>

        {/* ─── STAT CARDS ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 20 }}>
          <StatsCard title="Total Production" value={loading ? "—" : fmt(stats.totalProduction)} change={15.3} icon={TrendingUp} color="#6366f1" loading={loading} />
          <StatsCard title="Avg Efficiency" value={loading ? "—" : stats.avgEfficiency + "%"} change={8.7} icon={Zap} color="#10b981" loading={loading} />
          <StatsCard title="Total Defects" value={loading ? "—" : stats.totalDefects} change={-4.2} icon={AlertTriangle} color="#ef4444" loading={loading} />
          <StatsCard title="Records" value={loading ? "—" : stats.count} change={12.1} icon={CheckCircle} color="#8b5cf6" loading={loading} />
        </div>

        {/* ─── FILTERS ─── */}
        <FilterBar
          plant={plant} setPlant={setPlant}
          shift={shift} setShift={setShift}
          type={type} setType={setType}
          chartType={chartType} setChartType={setChartType}
          search={search} setSearch={setSearch}
          onExport={handleExport}
          dark={dark} setDark={setDark}
        />

        {/* ─── CHARTS ─── */}
        <ChartSection monthlyData={MONTHLY_PROD} chartType={chartType} loading={loading} />

        {/* ─── TABLE HEADER ─── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tp)" }}>Production Records</div>
            <div style={{ fontSize: 12, color: "var(--ts)", marginTop: 2 }}>{filteredData.length} records matching filters</div>
          </div>
        </div>

        {/* ─── TABLE ─── */}
        <ProductionTable data={filteredData} loading={loading} />

        {/* ─── FOOTER ─── */}
        <div style={{ textAlign: "center", padding: "24px 0 8px", fontSize: 11, color: "var(--tt)" }}>
          Production Dashboard · Real-time monitoring · All data in units
        </div>
      </div>
    </div>
  );
}