import { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, DollarSign, BarChart2,
  Download, Search, ChevronUp, ChevronDown, Filter, Calendar,
  Sun, Moon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  Package, X, Activity
} from "lucide-react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const CUSTOMERS = [
  "Rahul Sharma","Priya Patel","Amit Kumar","Sneha Singh","Raj Mehta",
  "Anjali Gupta","Vikram Rao","Deepa Nair","Arjun Reddy","Kavya Iyer",
  "Sanjay Verma","Meera Krishnan","Nikhil Joshi","Pooja Agarwal",
];
const PRODUCTS = [
  "MacBook Pro 14\"","iPhone 15 Pro","iPad Air M2","AirPods Pro 2",
  "Apple Watch S9","Samsung Galaxy S24","Dell XPS 15","Sony Bravia 65\"",
  "LG UltraWide 34\"","Logitech MX Keys","WD My Passport","Kindle Scribe",
];
const CATEGORIES = ["Laptops","Smartphones","Tablets","Audio","Wearables","Accessories","Displays","Storage"];
const STATUSES = ["Delivered","Processing","Pending","Cancelled"];
const BASE_PRICES = [129999,134999,79999,24999,44999,99999,149999,169999,59999,11999,7999,24999];

const sd = (n) => { const x = Math.sin(n + 42) * 99999; return x - Math.floor(x); };

const ALL_ORDERS = Array.from({ length: 64 }, (_, i) => {
  const qty = Math.max(1, Math.floor(sd(i) * 8));
  const date = new Date(2025, Math.floor(sd(i+10)*4), Math.floor(sd(i+20)*27)+1);
  return {
    id: `ORD-${1000 + i}`,
    customer: CUSTOMERS[Math.floor(sd(i+1) * CUSTOMERS.length)],
    product:  PRODUCTS [Math.floor(sd(i+2) * PRODUCTS.length)],
    category: CATEGORIES[Math.floor(sd(i+3) * CATEGORIES.length)],
    quantity: qty,
    price: BASE_PRICES[Math.floor(sd(i+4) * BASE_PRICES.length)] * qty,
    date: date.toISOString().split("T")[0],
    status: STATUSES[Math.floor(sd(i+5) * STATUSES.length)],
  };
});

const MONTHLY = [
  { month:"Jan", sales:2850000, revenue:2280000, orders:145 },
  { month:"Feb", sales:3420000, revenue:2736000, orders:178 },
  { month:"Mar", sales:2980000, revenue:2384000, orders:156 },
  { month:"Apr", sales:4120000, revenue:3296000, orders:212 },
  { month:"May", sales:3780000, revenue:3024000, orders:198 },
  { month:"Jun", sales:4560000, revenue:3648000, orders:234 },
  { month:"Jul", sales:3920000, revenue:3136000, orders:205 },
  { month:"Aug", sales:4890000, revenue:3912000, orders:256 },
  { month:"Sep", sales:4250000, revenue:3400000, orders:221 },
  { month:"Oct", sales:5120000, revenue:4096000, orders:268 },
  { month:"Nov", sales:5890000, revenue:4712000, orders:302 },
  { month:"Dec", sales:6780000, revenue:5424000, orders:348 },
];

const CAT_DATA = [
  { name:"Laptops",      value:8920000, color:"#6366f1" },
  { name:"Smartphones",  value:7340000, color:"#8b5cf6" },
  { name:"Tablets",      value:4120000, color:"#a78bfa" },
  { name:"Wearables",    value:3450000, color:"#f59e0b" },
  { name:"Audio",        value:2890000, color:"#10b981" },
  { name:"Displays",     value:2340000, color:"#06b6d4" },
  { name:"Accessories",  value:1780000, color:"#ec4899" },
  { name:"Storage",      value:1290000, color:"#94a3b8" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (v) => {
  if (v >= 10000000) return `₹${(v/10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v/100000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
};
const fmtFull = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const STATUS_STYLE = {
  Delivered:  { bg:"#10b98118", text:"#10b981" },
  Processing: { bg:"#6366f118", text:"#6366f1" },
  Pending:    { bg:"#f59e0b18", text:"#d97706" },
  Cancelled:  { bg:"#ef444418", text:"#ef4444" },
};

// ─── THEMES ──────────────────────────────────────────────────────────────────
const LIGHT = {
  "--bg":         "#f1f3f8",
  "--card":       "#ffffff",
  "--border":     "#e4e6ef",
  "--tp":         "#0f1117",
  "--ts":         "#6b7280",
  "--tt":         "#9ca3af",
  "--skeleton":   "#e9ebf3",
  "--row-alt":    "#f8f9fc",
  "--hover":      "#f3f4f8",
  "--input-bg":   "#f8f9fc",
};
const DARK = {
  "--bg":         "#0d0f18",
  "--card":       "#161928",
  "--border":     "#252840",
  "--tp":         "#f1f5f9",
  "--ts":         "#8892a4",
  "--tt":         "#535f76",
  "--skeleton":   "#1e2235",
  "--row-alt":    "#191c2e",
  "--hover":      "#1e2235",
  "--input-bg":   "#0d0f18",
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Skel = ({ h = 16, w = "100%", r = 8 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: "var(--skeleton)", animation: "pulse 1.6s ease-in-out infinite" }} />
);

// ─── STATS CARD ──────────────────────────────────────────────────────────────
function StatsCard({ title, value, change, icon: Icon, color, loading }) {
  const pos = change >= 0;
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "18px 20px",
      transition: "transform .18s, box-shadow .18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    >
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Skel h={12} w={90} /><Skel h={28} w={120} /><Skel h={10} w={80} />
        </div>
      ) : (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:12, fontWeight:500, color:"var(--ts)", letterSpacing:"0.04em", textTransform:"uppercase" }}>{title}</span>
            <div style={{ width:36, height:36, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon size={17} style={{ color }} />
            </div>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:"var(--tp)", fontVariantNumeric:"tabular-nums", marginBottom:8, letterSpacing:"-0.02em" }}>{value}</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
            {pos ? <ArrowUpRight size={13} style={{ color:"#10b981" }} /> : <ArrowDownRight size={13} style={{ color:"#ef4444" }} />}
            <span style={{ color: pos ? "#10b981" : "#ef4444", fontWeight:600 }}>{Math.abs(change)}%</span>
            <span style={{ color:"var(--tt)" }}>vs last period</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FILTER BAR ──────────────────────────────────────────────────────────────
function FilterBar({ dateRange, setDateRange, category, setCategory, chartType, setChartType, search, setSearch, onExport, dark, setDark }) {
  const inputBase = {
    background:"transparent", border:"none", outline:"none", fontSize:13,
    color:"var(--tp)", width:"100%",
  };
  const groupStyle = {
    display:"flex", alignItems:"center", gap:8, flex:1, minWidth:140,
    background:"var(--input-bg)", border:"1px solid var(--border)",
    borderRadius:10, padding:"7px 12px",
  };
  const iconColor = { color:"var(--ts)" };

  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--border)",
      borderRadius:16, padding:"14px 16px", marginBottom:20,
      display:"flex", flexWrap:"wrap", gap:10, alignItems:"center",
    }}>
      <div style={groupStyle}>
        <Calendar size={14} style={iconColor} />
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{...inputBase}}>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div style={groupStyle}>
        <Filter size={14} style={iconColor} />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{...inputBase}}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={groupStyle}>
        <BarChart2 size={14} style={iconColor} />
        <select value={chartType} onChange={e => setChartType(e.target.value)} style={{...inputBase}}>
          <option value="area">Area Chart</option>
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
      </div>
      <div style={{ ...groupStyle, minWidth:200 }}>
        <Search size={14} style={iconColor} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{...inputBase, flex:1}} />
        {search && (
          <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex" }}>
            <X size={13} style={{ color:"var(--ts)" }} />
          </button>
        )}
      </div>
      <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
        <button onClick={() => setDark(!dark)} style={{
          width:34, height:34, borderRadius:10, border:"1px solid var(--border)",
          background:"var(--input-bg)", display:"flex", alignItems:"center",
          justifyContent:"center", cursor:"pointer", color:"var(--ts)",
        }}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button onClick={onExport} style={{
          display:"flex", alignItems:"center", gap:6, padding:"7px 16px",
          borderRadius:10, border:"none", cursor:"pointer", fontSize:13,
          fontWeight:600, color:"#fff",
          background:"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          transition:"opacity .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".87"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>
    </div>
  );
}

// ─── DATASET TOGGLE ──────────────────────────────────────────────────────────
function DSToggle({ active, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"3px 10px", borderRadius:8, fontSize:11, fontWeight:600,
      border:`1.5px solid ${color}`, cursor:"pointer", transition:"all .15s",
      background: active ? color+"20" : "transparent",
      color: active ? color : "var(--ts)", opacity: active ? 1 : 0.5,
    }}>
      {label}
    </button>
  );
}

// ─── CHART SECTION ────────────────────────────────────────────────────────────
function ChartSection({ monthlyData, chartType, loading }) {
  const [ds, setDs] = useState({ sales:true, revenue:true });
  const toggle = k => setDs(p => ({ ...p, [k]: !p[k] }));

  const tt = {
    contentStyle: {
      background:"var(--card)", border:"1px solid var(--border)",
      borderRadius:10, fontSize:12, color:"var(--tp)",
    },
    formatter: (v, n) => [fmt(v), n],
  };

  const cardStyle = {
    background:"var(--card)", border:"1px solid var(--border)",
    borderRadius:16, padding:"18px 20px",
  };

  if (loading) return (
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:20 }}>
      <div style={{ ...cardStyle, height:320 }}><Skel h="100%" /></div>
      <div style={{ ...cardStyle, height:320 }}><Skel h="100%" /></div>
    </div>
  );

  const renderMain = () => {
    const common = { data: monthlyData, margin:{ top:5, right:16, left:-8, bottom:0 } };
    if (chartType === "bar") return (
      <BarChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--ts)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:10, fill:"var(--ts)" }} tickFormatter={v=>`₹${v/100000}L`} axisLine={false} tickLine={false} />
        <Tooltip {...tt} />
        {ds.sales   && <Bar dataKey="sales"   name="Sales"   fill="#6366f1" radius={[5,5,0,0]} />}
        {ds.revenue && <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[5,5,0,0]} />}
      </BarChart>
    );
    if (chartType === "line") return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--ts)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:10, fill:"var(--ts)" }} tickFormatter={v=>`₹${v/100000}L`} axisLine={false} tickLine={false} />
        <Tooltip {...tt} />
        {ds.sales   && <Line type="monotone" dataKey="sales"   name="Sales"   stroke="#6366f1" strokeWidth={2.5} dot={{ r:3 }} activeDot={{ r:5 }} />}
        {ds.revenue && <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r:3 }} activeDot={{ r:5 }} />}
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <defs>
          <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--ts)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:10, fill:"var(--ts)" }} tickFormatter={v=>`₹${v/100000}L`} axisLine={false} tickLine={false} />
        <Tooltip {...tt} />
        {ds.sales   && <Area type="monotone" dataKey="sales"   name="Sales"   stroke="#6366f1" fill="url(#gS)" strokeWidth={2.5} />}
        {ds.revenue && <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#gR)" strokeWidth={2.5} />}
      </AreaChart>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:16 }}>
        {/* Main Chart */}
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--tp)", marginBottom:2 }}>Sales Overview</div>
              <div style={{ fontSize:11, color:"var(--ts)" }}>Monthly performance</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <DSToggle active={ds.sales}   label="Sales"   color="#6366f1" onClick={()=>toggle("sales")} />
              <DSToggle active={ds.revenue} label="Revenue" color="#10b981" onClick={()=>toggle("revenue")} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {renderMain()}
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div style={cardStyle}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--tp)", marginBottom:2 }}>Category Split</div>
          <div style={{ fontSize:11, color:"var(--ts)", marginBottom:12 }}>Revenue by segment</div>
          <ResponsiveContainer width="100%" height={148}>
            <PieChart>
              <Pie data={CAT_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={64} dataKey="value" paddingAngle={2} strokeWidth={0}>
                {CAT_DATA.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, fontSize:12, color:"var(--tp)" }} formatter={v=>[fmt(v)]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:4 }}>
            {CAT_DATA.slice(0,5).map(c => (
              <div key={c.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:7, height:7, borderRadius:2, background:c.color, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:"var(--ts)" }}>{c.name}</span>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:"var(--tp)", fontVariantNumeric:"tabular-nums" }}>{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Bar */}
      <div style={{ ...cardStyle }}>
        <div style={{ fontSize:14, fontWeight:700, color:"var(--tp)", marginBottom:2 }}>Monthly Orders</div>
        <div style={{ fontSize:11, color:"var(--ts)", marginBottom:12 }}>Order count per month</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={MONTHLY} margin={{ top:5, right:16, left:-8, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--ts)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"var(--ts)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, fontSize:12, color:"var(--tp)" }} />
            <Bar dataKey="orders" name="Orders" radius={[6,6,0,0]}>
              {MONTHLY.map((_, i) => <Cell key={i} fill={i === MONTHLY.length-1 ? "#f59e0b" : "#6366f1"} fillOpacity={i === MONTHLY.length-1 ? 1 : 0.55} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── SALES TABLE ─────────────────────────────────────────────────────────────
const COLS = [
  { key:"id",       label:"Order ID",   w:100 },
  { key:"customer", label:"Customer",   w:140 },
  { key:"product",  label:"Product",    w:170 },
  { key:"category", label:"Category",   w:110 },
  { key:"quantity", label:"Qty",        w:50  },
  { key:"price",    label:"Total",      w:130 },
  { key:"date",     label:"Date",       w:100 },
  { key:"status",   label:"Status",     w:100 },
];
const PER_PAGE = 8;

function SalesTable({ data, loading }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage]       = useState(1);

  const sorted = useMemo(() => [...data].sort((a,b) => {
    const av=a[sortKey], bv=b[sortKey];
    const cmp = typeof av==="number" ? av-bv : String(av).localeCompare(String(bv));
    return sortDir==="asc" ? cmp : -cmp;
  }), [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const rows       = sorted.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE);

  const onSort = k => {
    if (k === sortKey) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const pages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length:totalPages }, (_,i) => i+1);
    if (safePage <= 3) return [1,2,3,4,5];
    if (safePage >= totalPages-2) return [totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    return [safePage-2,safePage-1,safePage,safePage+1,safePage+2];
  }, [totalPages, safePage]);

  const thStyle = (key) => ({
    padding:"10px 12px", fontSize:11, fontWeight:600, textAlign:"left",
    color: sortKey===key ? "#6366f1" : "var(--ts)",
    borderBottom:"1px solid var(--border)", cursor:"pointer",
    userSelect:"none", whiteSpace:"nowrap", letterSpacing:"0.03em",
    background:"var(--row-alt)",
  });

  if (loading) return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
      {Array.from({length:8}).map((_,i)=>(
        <div key={i} style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:16 }}>
          {[100,130,160,100,40,120,90,80].map((w,j) => <Skel key={j} h={12} w={w} />)}
        </div>
      ))}
    </div>
  );

  if (!data.length) return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--border)",
      borderRadius:16, padding:"64px 20px", textAlign:"center",
    }}>
      <div style={{ width:56, height:56, borderRadius:14, background:"#6366f118", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <Package size={26} style={{ color:"#6366f1" }} />
      </div>
      <div style={{ fontSize:15, fontWeight:600, color:"var(--tp)", marginBottom:6 }}>No orders found</div>
      <div style={{ fontSize:13, color:"var(--ts)" }}>Try adjusting your filters or search term</div>
    </div>
  );

  return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed", minWidth:860 }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} style={{ ...thStyle(c.key), width:c.w }} onClick={()=>onSort(c.key)}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {c.label}
                    {sortKey===c.key
                      ? (sortDir==="asc" ? <ChevronUp size={11} style={{ color:"#6366f1" }}/> : <ChevronDown size={11} style={{ color:"#6366f1" }}/>)
                      : <ChevronUp size={11} style={{ color:"var(--tt)", opacity:0.4 }}/>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}
                style={{ background: i%2===0?"transparent":"var(--row-alt)", transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--hover)"}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"var(--row-alt)"}
              >
                <td style={{ padding:"11px 12px", fontSize:12, color:"#6366f1", fontFamily:"'Courier New',monospace", fontWeight:700, borderBottom:"1px solid var(--border)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.id}</td>
                <td style={{ padding:"11px 12px", fontSize:13, fontWeight:600, color:"var(--tp)", borderBottom:"1px solid var(--border)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.customer}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:"var(--ts)", borderBottom:"1px solid var(--border)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.product}</td>
                <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:6, background:"#6366f112", color:"#6366f1", whiteSpace:"nowrap" }}>{row.category}</span>
                </td>
                <td style={{ padding:"11px 12px", fontSize:13, fontWeight:600, color:"var(--tp)", textAlign:"center", borderBottom:"1px solid var(--border)" }}>{row.quantity}</td>
                <td style={{ padding:"11px 12px", fontSize:12, fontWeight:700, color:"var(--tp)", fontVariantNumeric:"tabular-nums", fontFamily:"'Courier New',monospace", borderBottom:"1px solid var(--border)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{fmtFull(row.price)}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:"var(--ts)", borderBottom:"1px solid var(--border)", whiteSpace:"nowrap" }}>{row.date}</td>
                <td style={{ padding:"11px 12px", borderBottom:"1px solid var(--border)" }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20,
                    background: STATUS_STYLE[row.status]?.bg,
                    color: STATUS_STYLE[row.status]?.text,
                    whiteSpace:"nowrap",
                  }}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderTop:"1px solid var(--border)" }}>
        <span style={{ fontSize:12, color:"var(--ts)" }}>
          Showing {Math.min((safePage-1)*PER_PAGE+1, data.length)}–{Math.min(safePage*PER_PAGE, data.length)} of <strong style={{ color:"var(--tp)" }}>{data.length}</strong> orders
        </span>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage===1}
            style={{ width:28, height:28, borderRadius:8, border:"1px solid var(--border)", background:"var(--input-bg)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--tp)", opacity:safePage===1?0.35:1 }}>
            <ChevronLeft size={13} />
          </button>
          {pages.map(p => (
            <button key={p} onClick={()=>setPage(p)}
              style={{ width:28, height:28, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .12s",
                border: p===safePage ? "none" : "1px solid var(--border)",
                background: p===safePage ? "#6366f1" : "var(--input-bg)",
                color: p===safePage ? "#fff" : "var(--ts)",
              }}>
              {p}
            </button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}
            style={{ width:28, height:28, borderRadius:8, border:"1px solid var(--border)", background:"var(--input-bg)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--tp)", opacity:safePage===totalPages?0.35:1 }}>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const [dark,       setDark]       = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [dateRange,  setDateRange]  = useState("all");
  const [category,   setCategory]   = useState("all");
  const [chartType,  setChartType]  = useState("area");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const filteredOrders = useMemo(() => {
    let o = [...ALL_ORDERS];
    if (category !== "all") o = o.filter(x => x.category === category);
    if (search) {
      const s = search.toLowerCase();
      o = o.filter(x =>
        x.id.toLowerCase().includes(s) ||
        x.customer.toLowerCase().includes(s) ||
        x.product.toLowerCase().includes(s) ||
        x.status.toLowerCase().includes(s)
      );
    }
    return o;
  }, [category, search]);

  const monthlyData = useMemo(() => {
    if (dateRange === "7d")  return MONTHLY.slice(-1).map(d => ({ ...d, sales:Math.round(d.sales*.22), revenue:Math.round(d.revenue*.22), orders:Math.round(d.orders*.22) }));
    if (dateRange === "30d") return MONTHLY.slice(-1);
    if (dateRange === "3m")  return MONTHLY.slice(-3);
    return MONTHLY;
  }, [dateRange]);

  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((s,o) => s+o.price, 0);
    const totalOrders = filteredOrders.length;
    const customers  = new Set(filteredOrders.map(o => o.customer)).size;
    return { totalSales, totalOrders, customers };
  }, [filteredOrders]);

  const handleExport = () => {
    const header = ["Order ID","Customer","Product","Category","Quantity","Total Price","Date","Status"];
    const rows   = filteredOrders.map(o => [o.id,o.customer,o.product,o.category,o.quantity,o.price,o.date,o.status]);
    const csv    = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob   = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = `sales-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const theme = dark ? DARK : LIGHT;

  return (
    <div style={{ ...theme, background:"var(--bg)", minHeight:"100vh", fontFamily:"'Geist','Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        select option { background:#1a1d2e; color:#f1f5f9 }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:5px; height:5px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px }
      `}</style>

      <div style={{ maxWidth:1380, margin:"0 auto", padding:"24px 20px" }}>

        {/* ── TOPBAR ── */}
        {/* <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Activity size={16} style={{ color:"#fff" }} />
              </div>
              <h1 style={{ fontSize:20, fontWeight:800, color:"var(--tp)", margin:0, letterSpacing:"-0.02em" }}>Sales Dashboard</h1>
            </div>
            <p style={{ fontSize:12, color:"var(--ts)", margin:0 }}>
              {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20, background:"#10b98118", border:"1px solid #10b98130" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:12, fontWeight:600, color:"#10b981" }}>Live Data</span>
          </div>
        </div> */}

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
          <StatsCard title="Total Sales"     value={loading ? "—" : fmt(stats.totalSales)}    change={12.5}  icon={DollarSign}   color="#6366f1" loading={loading} />
          <StatsCard title="Total Orders"    value={loading ? "—" : stats.totalOrders}         change={8.2}   icon={ShoppingCart}  color="#8b5cf6" loading={loading} />
          <StatsCard title="Customers"       value={loading ? "—" : stats.customers}           change={-3.1}  icon={Users}         color="#f59e0b" loading={loading} />
          <StatsCard title="Revenue Growth"  value={loading ? "—" : "24.8%"}                  change={24.8}  icon={TrendingUp}    color="#10b981" loading={loading} />
        </div>

        {/* ── FILTERS ── */}
        <FilterBar
          dateRange={dateRange} setDateRange={v=>{setDateRange(v);}}
          category={category}   setCategory={setCategory}
          chartType={chartType} setChartType={setChartType}
          search={search}       setSearch={setSearch}
          onExport={handleExport}
          dark={dark} setDark={setDark}
        />

        {/* ── CHARTS ── */}
        <ChartSection monthlyData={monthlyData} chartType={chartType} loading={loading} />

        {/* ── TABLE HEADER ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--tp)" }}>Order Details</div>
            <div style={{ fontSize:12, color:"var(--ts)", marginTop:2 }}>{filteredOrders.length} orders matching current filters</div>
          </div>
        </div>

        {/* ── TABLE ── */}
        <SalesTable data={filteredOrders} loading={loading} />

        {/* ── FOOTER ── */}
        <div style={{ textAlign:"center", padding:"24px 0 8px", fontSize:11, color:"var(--tt)" }}>
          Sales Dashboard · Data refreshed daily · All amounts in INR
        </div>
      </div>
    </div>
  );
}