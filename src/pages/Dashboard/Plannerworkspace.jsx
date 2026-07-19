import React, { useState, useMemo, useCallback } from "react";
import { ConfigProvider, theme, Table, Tag, Tooltip, InputNumber, Modal, message, Select, Input, Checkbox, Segmented, Badge } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  X,
  Package,
  AlertTriangle,
  Factory,
  TrendingDown,
  TrendingUp,
  Layers,
  ShieldCheck,
  Warehouse,
  ArrowRight,
  ArrowLeft,
  Users,
  Search,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data — replace with API data from Sales Order / Stock / Plant  */
/* ------------------------------------------------------------------ */

const PLANTS = [
  { code: "MMN", name: "Maraimalai Nagar", capacity: 1500, available: 600 },
  { code: "PDK", name: "Pudhupettai", capacity: 1200, available: 700 },
  { code: "SITL", name: "SITL Sri Lanka", capacity: 800, available: 500 },
  { code: "SLTL", name: "SLTL Sri Lanka", capacity: 600, available: 500 },
];

// Purchase Order headers
const ORDER_HEADERS = [
  { id: 1001, customer: "Apex Motors", priority: "High", dest: "Domestic", orderDateOffset: -35 },
  { id: 1032, customer: "Apex Motors", priority: "Routine", dest: "Domestic", orderDateOffset: -20 },
  { id: 1080, customer: "Apex Motors", priority: "Routine", dest: "Domestic", orderDateOffset: -10 },
  { id: 1105, customer: "Continental Traders", priority: "High", dest: "Export", orderDateOffset: -25 },
  { id: 1110, customer: "Continental Traders", priority: "Routine", dest: "Export", orderDateOffset: -12 },
  { id: 1122, customer: "Silverline Tyres", priority: "High", dest: "Domestic", orderDateOffset: -30 },
  { id: 1130, customer: "Metro Wheels Inc", priority: "Routine", dest: "Domestic", orderDateOffset: -15 },
  { id: 1145, customer: "Metro Wheels Inc", priority: "Routine", dest: "Domestic", orderDateOffset: -8 },
  { id: 1160, customer: "Vantage Auto Parts", priority: "High", dest: "Export", orderDateOffset: -22 },
  { id: 1172, customer: "Global Rubber Co", priority: "Routine", dest: "Export", orderDateOffset: -5 },
  { id: 1188, customer: "Silverline Tyres", priority: "Routine", dest: "Domestic", orderDateOffset: -18 },
  { id: 1201, customer: "Apex Motors", priority: "High", dest: "Domestic", orderDateOffset: -6 },
];

// [soId, item, brand, rim, qty, deliveryOffsetDays] — a PO can carry multiple line items
const RAW_LINES = [
  [1001, "195/65R15", "TrekMax All-Season", "R15", 500, 12],
  [1032, "195/65R15", "TrekMax All-Season", "R15", 800, 40],
  [1032, "205/55R16", "RoadPro Sport", "R16", 150, 40],
  [1080, "195/65R15", "TrekMax All-Season", "R15", 700, 55],
  [1105, "205/55R16", "RoadPro Sport", "R16", 300, 8],
  [1105, "215/60R17", "DuraGrip HT", "R17", 150, 8],
  [1110, "205/55R16", "RoadPro Sport", "R16", 450, 20],
  [1122, "215/60R17", "DuraGrip HT", "R17", 600, 5],
  [1130, "185/70R14", "CityRide Eco", "R14", 250, 33],
  [1145, "185/70R14", "CityRide Eco", "R14", 400, 47],
  [1145, "195/65R15", "TrekMax All-Season", "R15", 100, 47],
  [1160, "235/65R18", "TerraMax SUV", "R18", 900, 18],
  [1172, "195/65R15", "TrekMax All-Season", "R15", 350, 60],
  [1188, "215/60R17", "DuraGrip HT", "R17", 500, 27],
  [1201, "205/55R16", "RoadPro Sport", "R16", 200, 10],
];

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const daysFromNow = (d) => Math.round((d - new Date()) / 86400000);

function buildLineItems() {
  const seq = {};
  return RAW_LINES.map(([soId, item, brand, rim, qty, offset], idx) => {
    seq[soId] = (seq[soId] || 0) + 1;
    const header = ORDER_HEADERS.find((h) => h.id === soId);
    return {
      key: `${soId}-L${seq[soId]}`,
      soId,
      lineNo: seq[soId],
      item,
      brand,
      rim,
      qty,
      type: "TYRE",
      processId: `P-${String(6126 + idx * 11).padStart(6, "0")}`,
      description: `${brand.toUpperCase()} | ${item} | ${rim}`,
      customer: header.customer,
      priority: header.priority,
      dest: header.dest,
      deliveryDate: addDays(offset),
      specKey: `${item}|${rim}`,
    };
  });
}
const INITIAL_LINE_ITEMS = buildLineItems();
const LINE_ITEM_BY_KEY = Object.fromEntries(INITIAL_LINE_ITEMS.map((l) => [l.key, l]));

const ORIGINAL_PO_STATS = {};
RAW_LINES.forEach(([soId, , , , qty]) => {
  if (!ORIGINAL_PO_STATS[soId]) ORIGINAL_PO_STATS[soId] = { totalQty: 0, itemCount: 0 };
  ORIGINAL_PO_STATS[soId].totalQty += qty;
  ORIGINAL_PO_STATS[soId].itemCount += 1;
});

const ITEM_OPTIONS = [...new Set(RAW_LINES.map((l) => l[1]))];
const RIM_OPTIONS = [...new Set(RAW_LINES.map((l) => l[3]))];
const BRAND_OPTIONS = [...new Set(RAW_LINES.map((l) => l[2]))];

// Warehouse finished-goods stock, keyed by spec (item|rim)
const INITIAL_STOCK = {
  "195/65R15|R15": 350,
  "205/55R16|R16": 180,
  "215/60R17|R17": 0,
  "185/70R14|R14": 600,
  "235/65R18|R18": 0,
};

const EMPTY_QUICK = {
  urgent: false,
  stockAvailable: false,
  stockShortage: false,
  readyToCombine: false,
  alreadyPlanned: false,
  notAssigned: false,
};

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                   */
/* ------------------------------------------------------------------ */

function urgency(days) {
  if (days <= 15) return { color: "#f4685c", bg: "rgba(244,104,92,0.14)" };
  if (days <= 30) return { color: "#f2a93c", bg: "rgba(242,169,60,0.14)" };
  return { color: "#7d879c", bg: "rgba(125,135,156,0.12)" };
}

const STATUS_STYLE = {
  open: { label: "Not Assigned", color: "#5b8def", bg: "rgba(91,141,239,0.14)" },
  partial: { label: "Partially Planned", color: "#f2a93c", bg: "rgba(242,169,60,0.14)" },
  planned: { label: "Already Planned", color: "#34d399", bg: "rgba(52,211,153,0.14)" },
};

function greedyAllocate(totalQty, plants) {
  const alloc = {};
  plants.forEach((p) => (alloc[p.code] = 0));
  if (totalQty <= 0) return alloc;
  const remaining = plants.map((p) => ({ code: p.code, left: p.available })).sort((a, b) => b.left - a.left);
  let toPlace = totalQty;
  for (const r of remaining) {
    if (toPlace <= 0) break;
    const take = Math.min(r.left, toPlace);
    alloc[r.code] += take;
    toPlace -= take;
  }
  if (toPlace > 0) {
    const biggest = [...plants].sort((a, b) => b.available - a.available)[0];
    alloc[biggest.code] += toPlace;
  }
  return alloc;
}

const cardStyle = { background: "#161d2b", borderColor: "#2a3346" };
const chipStyle = { background: "#1c2436", color: "#8b93a7", border: "1px solid #2a3346" };

/* ------------------------------------------------------------------ */
/*  Radial capacity gauge                                              */
/* ------------------------------------------------------------------ */

function RadialGauge({ code, name, allocated, capacity, available }) {
  const pct = available > 0 ? Math.min(allocated / available, 1.4) : 0;
  const over = allocated > available;
  const color = over ? "#f4685c" : pct > 0.7 ? "#f2a93c" : "#34d399";
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(pct, 1));

  return (
    <div className="flex flex-col items-center gap-2 px-2">
      {over && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: "rgba(244,104,92,0.16)", color: "#f4685c" }}
        >
          <AlertTriangle size={11} strokeWidth={2.5} />
          Exceeds by {allocated - available}
        </motion.div>
      )}
      <div className="relative h-[100px] w-[100px]">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#232c3f" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-base font-semibold" style={{ color: "#e8ecf4" }}>
            {available > 0 ? Math.round((allocated / available) * 100) : 0}%
          </span>
          <span className="text-[10px]" style={{ color: "#7d879c" }}>of avail.</span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-sm font-semibold" style={{ color: "#e8ecf4" }}>
          <Factory size={12} style={{ color: "#7d879c" }} /> {code}
        </div>
        <div className="text-[10px]" style={{ color: "#7d879c" }}>{name}</div>
        <div className="mt-1 font-mono text-[10px]" style={{ color: "#7d879c" }}>
          {allocated.toLocaleString()} / {available.toLocaleString()} avail
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Work order card                                                     */
/* ------------------------------------------------------------------ */

function WorkOrderCard({ wo, onChangeAllocation, onRemove }) {
  const allocatedTotal = Object.values(wo.allocations).reduce((a, b) => a + b, 0);
  const validated = allocatedTotal === wo.manufacturingDeficit;
  const fullyFromStock = wo.manufacturingDeficit === 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-xl border p-4" style={cardStyle}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold" style={{ color: "#f2a93c" }}>{wo.id}</span>
            <Tag className="!m-0 !border-0 !text-[10px] !font-semibold"
              style={{ background: wo.committed ? "rgba(52,211,153,0.14)" : "rgba(91,141,239,0.14)", color: wo.committed ? "#34d399" : "#5b8def" }}>
              {wo.committed ? "COMMITTED" : "DRAFT"}
            </Tag>
          </div>
          <div className="mt-1 text-sm font-medium" style={{ color: "#e8ecf4" }}>
            {wo.customer} <span style={{ color: "#7d879c" }}>· {wo.dest}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold" style={{ color: "#e8ecf4" }}>{wo.totalOrdered.toLocaleString()}</div>
          <div className="text-[10px]" style={{ color: "#7d879c" }}>total ordered</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {wo.sourceLines.map((l) => (
          <span key={l.key} className="rounded-md px-2 py-0.5 font-mono text-[10px]" style={chipStyle}>
            PO-{l.soId} L{l.lineNo} · {l.qty}
          </span>
        ))}
      </div>

      <div className="mt-3 rounded-lg border p-2.5" style={{ borderColor: "#2a3346", background: "#1c2436" }}>
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#8b93a7" }}>
          <Warehouse size={12} /> STOCK CHECK
        </div>
        <div className="space-y-1">
          {wo.specBreakdown.map((s) => (
            <div key={s.specKey} className="flex items-center justify-between text-[11px]" style={{ color: "#c3c9d6" }}>
              <span className="font-mono">{s.item} · {s.rim}</span>
              <span className="flex items-center gap-1.5">
                <span>{s.ordered.toLocaleString()} ordered</span>
                <ArrowRight size={10} style={{ color: "#5b6478" }} />
                <span style={{ color: s.stockApplied > 0 ? "#34d399" : "#5b6478" }}>{s.stockApplied.toLocaleString()} stock</span>
                <ArrowRight size={10} style={{ color: "#5b6478" }} />
                <span className="font-semibold" style={{ color: s.deficit > 0 ? "#f2a93c" : "#34d399" }}>{s.deficit.toLocaleString()} to make</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {fullyFromStock ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
          <ShieldCheck size={14} /> Fulfilled entirely from warehouse stock
        </div>
      ) : (
        <>
          <div className="mt-3 mb-1.5 text-[11px] font-semibold" style={{ color: "#8b93a7" }}>
            PLANT ALLOCATION · deficit {wo.manufacturingDeficit.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLANTS.map((p) => {
              const val = wo.allocations[p.code] || 0;
              const overAvail = val > p.available;
              return (
                <div key={p.code} className="rounded-lg border px-2.5 py-2"
                  style={{ borderColor: overAvail ? "#f4685c66" : "#2a3346", background: overAvail ? "rgba(244,104,92,0.06)" : "#1c2436" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: "#8b93a7" }}>{p.code}</span>
                    <span className="text-[10px]" style={{ color: "#5b6478" }}>avail {p.available}</span>
                  </div>
                  <InputNumber size="small" min={0} value={val} disabled={wo.committed}
                    onChange={(v) => onChangeAllocation(wo.id, p.code, v || 0)} className="mt-1 w-full" controls={false} />
                  {overAvail && (
                    <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: "#f4685c" }}>
                      <AlertTriangle size={10} /> +{val - p.available} over
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-3 flex items-center justify-between">
        {!fullyFromStock && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: validated ? "#34d399" : "#f2a93c" }}>
            {validated ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
            {validated ? "Validated" : "Unbalanced"} · {allocatedTotal.toLocaleString()} / {wo.manufacturingDeficit.toLocaleString()}
          </div>
        )}
        {!wo.committed && (
          <button onClick={() => onRemove(wo.id)} className="ml-auto text-[11px] font-medium hover:text-[#f4685c]" style={{ color: "#5b6478" }}>
            Dissolve
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggestion card (AI consolidation, grouped by spec)                 */
/* ------------------------------------------------------------------ */

function SuggestionCard({ g, onAccept, onDismiss }) {
  const inWindow = g.variance <= 45;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}
      className="rounded-xl border-l-4 p-3.5"
      style={{ background: "#1c2033", borderColor: "#f2a93c", borderTop: "1px solid #2a3346", borderRight: "1px solid #2a3346", borderBottom: "1px solid #2a3346" }}>
      <div className="flex items-center gap-2">
        <Sparkles size={14} style={{ color: "#f2a93c" }} />
        <span className="font-mono text-[12px] font-semibold" style={{ color: "#f2a93c" }}>{g.item} · {g.rim}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {g.pos.map((id) => (
          <span key={id} className="rounded-md px-2 py-0.5 font-mono text-[10px]" style={chipStyle}>PO-{id}</span>
        ))}
      </div>
      <div className="mt-2 space-y-1 text-[11px]" style={{ color: "#8b93a7" }}>
        <div className="flex items-center gap-1.5"><Check size={11} style={{ color: "#34d399" }} /> Same customer, same item, same rim, same brand</div>
        <div className="flex items-center gap-1.5">
          {inWindow ? <Check size={11} style={{ color: "#34d399" }} /> : <AlertTriangle size={11} style={{ color: "#f2a93c" }} />}
          Delivery spread {g.variance}d {inWindow ? "(within 45d window)" : "(outside 45d window)"}
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={11} style={{ color: "#34d399" }} />
          {g.total.toLocaleString()} ordered · {g.stockAvail.toLocaleString()} in stock → {g.deficit.toLocaleString()} to manufacture
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <button onClick={onAccept} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#f2a93c", color: "#161000" }}>
          <Check size={12} /> Accept
        </button>
        <button onClick={onDismiss} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium" style={{ color: "#7d879c" }}>
          <X size={12} /> Dismiss
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function PlannerWorkspace() {
  const [lineItems, setLineItems] = useState(INITIAL_LINE_ITEMS);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [workOrders, setWorkOrders] = useState([]);
  const [woSeq, setWoSeq] = useState(1);
  const [commitOpen, setCommitOpen] = useState(false);
  const [commitQty, setCommitQty] = useState({});

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLineKeys, setSelectedLineKeys] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [poFilters, setPoFilters] = useState({ search: "", priority: undefined, dest: undefined, item: undefined, rim: undefined, brand: undefined, quick: EMPTY_QUICK });
  const [dismissed, setDismissed] = useState([]);
  const [rightTab, setRightTab] = useState("suggestions");

  const goToCustomer = (name) => {
    setSelectedCustomer(name);
    setSelectedLineKeys([]);
    setPoFilters({ search: "", priority: undefined, dest: undefined, item: undefined, rim: undefined, brand: undefined, quick: EMPTY_QUICK });
  };
  const goToCustomerList = () => {
    setSelectedCustomer(null);
    setSelectedLineKeys([]);
  };

  const toggleLineSelect = (key) => {
    setSelectedLineKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  /* ---- customer summaries ---- */
  const customerSummaries = useMemo(() => {
    const names = [...new Set(ORDER_HEADERS.map((h) => h.customer))];
    return names.map((name) => {
      const pos = ORDER_HEADERS.filter((h) => h.customer === name);
      const openLines = lineItems.filter((l) => l.customer === name);
      const pendingQty = openLines.reduce((a, b) => a + b.qty, 0);
      const urgent = openLines.some((l) => daysFromNow(l.deliveryDate) <= 15);
      return { name, totalPOs: pos.length, pendingQty, pendingItems: openLines.length, urgent };
    });
  }, [lineItems]);
  const filteredCustomers = customerSummaries.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  /* ---- PO summaries for selected customer ---- */
  const poSummaries = useMemo(() => {
    if (!selectedCustomer) return [];
    const rows = ORDER_HEADERS.filter((h) => h.customer === selectedCustomer).map((h) => {
      const orig = ORIGINAL_PO_STATS[h.id];
      const openLines = lineItems.filter((l) => l.soId === h.id);
      const pendingQty = openLines.reduce((a, b) => a + b.qty, 0);
      const status = pendingQty === 0 ? "planned" : pendingQty === orig.totalQty ? "open" : "partial";
      const allLinesOfPO = INITIAL_LINE_ITEMS.filter((l) => l.soId === h.id);
      const earliestDelivery = allLinesOfPO.reduce((min, l) => (l.deliveryDate < min ? l.deliveryDate : min), allLinesOfPO[0].deliveryDate);
      const specKeysOpen = [...new Set(openLines.map((l) => l.specKey))];
      const stockAvailable = openLines.some((l) => (stock[l.specKey] || 0) >= l.qty);
      const stockShortage = openLines.some((l) => (stock[l.specKey] || 0) < l.qty);
      return { ...h, orderDate: addDays(h.orderDateOffset), originalQty: orig.totalQty, originalItemCount: orig.itemCount, pendingQty, pendingItemCount: openLines.length, status, earliestDelivery, specKeysOpen, stockAvailable, stockShortage };
    });
    const specCount = {};
    rows.forEach((r) => r.specKeysOpen.forEach((k) => (specCount[k] = (specCount[k] || 0) + 1)));
    return rows.map((r) => ({ ...r, readyToCombine: r.specKeysOpen.some((k) => specCount[k] > 1) }));
  }, [selectedCustomer, lineItems, stock]);

  const filteredPOs = poSummaries.filter((po) => {
    const f = poFilters;
    if (f.search && !String(po.id).includes(f.search)) return false;
    if (f.priority && po.priority !== f.priority) return false;
    if (f.dest && po.dest !== f.dest) return false;
    if (f.item || f.rim || f.brand) {
      const linesOfPO = INITIAL_LINE_ITEMS.filter((l) => l.soId === po.id);
      const match = linesOfPO.some((l) => (!f.item || l.item === f.item) && (!f.rim || l.rim === f.rim) && (!f.brand || l.brand === f.brand));
      if (!match) return false;
    }
    const q = f.quick;
    if (q.urgent && daysFromNow(po.earliestDelivery) > 15) return false;
    if (q.stockAvailable && !po.stockAvailable) return false;
    if (q.stockShortage && !po.stockShortage) return false;
    if (q.readyToCombine && !po.readyToCombine) return false;
    if (q.alreadyPlanned && po.status !== "planned") return false;
    if (q.notAssigned && po.status !== "open") return false;
    return true;
  });

  const toggleQuick = (key) => setPoFilters((prev) => ({ ...prev, quick: { ...prev.quick, [key]: !prev.quick[key] } }));

  /* ---- consolidation preview for individually selected line items ---- */
  const selectionGroups = useMemo(() => {
    if (selectedLineKeys.length === 0) return [];
    const lines = lineItems
      .filter((l) => selectedLineKeys.includes(l.key))
      .map((l) => ({ ...l, committed: Math.max(0, Math.min(commitQty[l.key] ?? l.qty, l.qty)) }));
    const groups = {};
    lines.forEach((l) => {
      if (!groups[l.specKey]) groups[l.specKey] = { specKey: l.specKey, item: l.item, rim: l.rim, brand: l.brand, lines: [] };
      groups[l.specKey].lines.push(l);
    });
    return Object.values(groups).map((g) => ({ ...g, total: g.lines.reduce((a, b) => a + b.committed, 0) }));
  }, [selectedLineKeys, lineItems, commitQty]);

  /* ---- AI suggestions for selected customer ---- */
  const suggestions = useMemo(() => {
    if (!selectedCustomer) return [];
    const openLines = lineItems.filter((l) => l.customer === selectedCustomer);
    const groups = {};
    openLines.forEach((l) => {
      if (!groups[l.specKey]) groups[l.specKey] = { specKey: l.specKey, item: l.item, rim: l.rim, brand: l.brand, lines: [] };
      groups[l.specKey].lines.push(l);
    });
    return Object.values(groups)
      .filter((g) => new Set(g.lines.map((l) => l.soId)).size >= 2)
      .filter((g) => !dismissed.includes(`${selectedCustomer}|${g.specKey}`))
      .map((g) => {
        const total = g.lines.reduce((a, b) => a + b.qty, 0);
        const pos = [...new Set(g.lines.map((l) => l.soId))];
        const offsets = g.lines.map((l) => daysFromNow(l.deliveryDate));
        const variance = Math.max(...offsets) - Math.min(...offsets);
        const stockAvail = stock[g.specKey] || 0;
        return { ...g, total, pos, variance, stockAvail, deficit: Math.max(total - stockAvail, 0) };
      });
  }, [selectedCustomer, lineItems, stock, dismissed]);

  /* ---- core WO builder (stock check → deficit → plant allocation) ---- */
  /* Only the Commit Qty entered per line item is consumed. Any remaining     */
  /* quantity on a line (originalQty - committedQty) stays open on the PO.    */
  const buildWorkOrder = useCallback(
    (keys) => {
      const picked = lineItems.filter((l) => keys.includes(l.key));
      if (picked.length === 0) return;

      // Clamp each line's commit qty to its currently available qty — never allow more than what's open.
      const committedByKey = {};
      picked.forEach((l) => {
        const raw = commitQty[l.key] ?? l.qty;
        committedByKey[l.key] = Math.max(0, Math.min(raw, l.qty));
      });

      const activePicked = picked.filter((l) => committedByKey[l.key] > 0);
      if (activePicked.length === 0) {
        message.warning("Enter a Commit Qty greater than 0 for at least one selected line item");
        return;
      }

      const groups = {};
      activePicked.forEach((l) => {
        const committed = committedByKey[l.key];
        if (!groups[l.specKey]) groups[l.specKey] = { specKey: l.specKey, item: l.item, rim: l.rim, ordered: 0 };
        groups[l.specKey].ordered += committed;
      });

      const stockUpdates = {};
      const specBreakdown = Object.values(groups).map((g) => {
        const avail = stock[g.specKey] || 0;
        const stockApplied = Math.min(g.ordered, avail);
        stockUpdates[g.specKey] = avail - stockApplied;
        return { ...g, stockApplied, deficit: g.ordered - stockApplied };
      });
      const manufacturingDeficit = specBreakdown.reduce((a, b) => a + b.deficit, 0);
      const totalOrdered = activePicked.reduce((a, b) => a + committedByKey[b.key], 0);
      const allocations = greedyAllocate(manufacturingDeficit, PLANTS);
      const wo = {
        id: `WO-${String(woSeq).padStart(3, "0")}`,
        customer: activePicked[0].customer,
        dest: activePicked[0].dest,
        totalOrdered,
        manufacturingDeficit,
        specBreakdown,
        sourceLines: activePicked.map((p) => ({ key: p.key, soId: p.soId, lineNo: p.lineNo, qty: committedByKey[p.key], customer: p.customer })),
        allocations,
        committed: false,
      };

      setWorkOrders((prev) => [wo, ...prev]);
      setWoSeq((n) => n + 1);
      setStock((prev) => ({ ...prev, ...stockUpdates }));

      // Reduce each committed line by its committed amount; keep the remainder open on the PO.
      // A line is only removed entirely once its full remaining qty has been committed.
      setLineItems((prev) =>
        prev
          .map((l) => {
            if (!(l.key in committedByKey)) return l;
            const remaining = l.qty - committedByKey[l.key];
            return remaining > 0 ? { ...l, qty: remaining } : null;
          })
          .filter(Boolean)
      );

      // Clear selection + commit qty entries for the lines just processed.
      setSelectedLineKeys((prev) => prev.filter((k) => !(k in committedByKey)));
      setCommitQty((prev) => {
        const next = { ...prev };
        Object.keys(committedByKey).forEach((k) => delete next[k]);
        return next;
      });

      message.success(
        manufacturingDeficit > 0
          ? `${wo.id} created · ${totalOrdered.toLocaleString()} committed · ${manufacturingDeficit.toLocaleString()} units to manufacture`
          : `${wo.id} created · ${totalOrdered.toLocaleString()} committed · fully covered by stock`
      );
    },
    [lineItems, stock, woSeq, commitQty]
  );

  const changeAllocation = (woId, plantCode, value) => {
    setWorkOrders((prev) => prev.map((w) => (w.id === woId ? { ...w, allocations: { ...w.allocations, [plantCode]: value } } : w)));
  };

  const removeWorkOrder = (woId) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo) return;
    setStock((prev) => {
      const next = { ...prev };
      wo.specBreakdown.forEach((s) => (next[s.specKey] = (next[s.specKey] || 0) + s.stockApplied));
      return next;
    });
    // Each sourceLine.qty here is the amount that was committed to this WO.
    // If the line is still open (partial commit), add the qty back to it.
    // If the line was fully consumed and removed, recreate it from the original template.
    setLineItems((prev) => {
      let next = [...prev];
      wo.sourceLines.forEach((l) => {
        const idx = next.findIndex((li) => li.key === l.key);
        if (idx >= 0) {
          next = next.map((li, i) => (i === idx ? { ...li, qty: li.qty + l.qty } : li));
        } else {
          const original = LINE_ITEM_BY_KEY[l.key];
          if (original) next = [...next, { ...original, qty: l.qty }];
        }
      });
      return next;
    });
    setWorkOrders((prev) => prev.filter((w) => w.id !== woId));
    message.info(`${woId} dissolved · committed quantities and stock returned`);
  };

  const draftCount = workOrders.filter((w) => !w.committed).length;
  const handleCommit = () => {
    setWorkOrders((prev) => prev.map((w) => ({ ...w, committed: true })));
    setCommitOpen(false);
    message.success("Plan committed · capacity, stock, and PO statuses updated");
  };

  const capacityByPlant = useMemo(
    () => PLANTS.map((p) => ({ ...p, allocated: workOrders.reduce((sum, w) => sum + (w.allocations[p.code] || 0), 0) })),
    [workOrders]
  );

  const selectedLinesData = lineItems.filter((l) => selectedLineKeys.includes(l.key));
  const selectedCommittedQty = selectedLinesData.reduce(
    (a, l) => a + Math.max(0, Math.min(commitQty[l.key] ?? l.qty, l.qty)),
    0
  );

  /* ---- PO table columns ---- */
  const poColumns = [
    {
      title: "PO #", dataIndex: "id", width: 100,
      render: (id) => <span className="font-mono text-[12px] font-semibold" style={{ color: "#e8ecf4" }}>PO-{id}</span>,
    },
    {
      title: "Order Date", dataIndex: "orderDate", width: 100,
      render: (d) => <span className="text-[12px]" style={{ color: "#8b93a7" }}>{fmtDate(d)}</span>,
    },
    {
      title: "Delivery", dataIndex: "earliestDelivery", width: 140, sorter: (a, b) => a.earliestDelivery - b.earliestDelivery,
      render: (d) => {
        const days = daysFromNow(d);
        const u = urgency(days);
        return (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.color, boxShadow: `0 0 0 3px ${u.bg}` }} />
            <span className="text-[12px]" style={{ color: "#c3c9d6" }}>{fmtDate(d)}</span>
            <span className="text-[10px]" style={{ color: u.color }}>{days}d</span>
          </div>
        );
      },
    },
    {
      title: "Select", width: 60,
      render: (_, po) => (
        <div className="flex flex-col gap-1.5">
          {lineItems.filter((l) => l.soId === po.id).map((l) => (
            <Checkbox key={l.key} checked={selectedLineKeys.includes(l.key)} onChange={() => toggleLineSelect(l.key)} />
          ))}
        </div>
      ),
    },
    {
      title: "Type", width: 70,
      render: (_, po) => (
        <div className="flex flex-col gap-1.5">
          {lineItems.filter((l) => l.soId === po.id).map((l) => (
            <span key={l.key} className="text-[11px] font-medium" style={{ color: "#c3c9d6" }}>{l.type}</span>
          ))}
        </div>
      ),
    },
    {
      title: "Process ID", width: 110,
      render: (_, po) => (
        <div className="flex flex-col gap-1.5">
          {lineItems.filter((l) => l.soId === po.id).map((l) => (
            <span key={l.key} className="font-mono text-[11px]" style={{ color: "#8b93a7" }}>{l.processId}</span>
          ))}
        </div>
      ),
    },
    {
      title: "Description", width: 220,
      render: (_, po) => (
        <div className="flex flex-col gap-1.5">
          {lineItems.filter((l) => l.soId === po.id).map((l) => (
            <span key={l.key} className="truncate text-[11px]" style={{ color: "#e8ecf4" }} title={l.description}>
              {l.description}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Commit Qty", width: 100,
      render: (_, po) => (
        <div className="flex flex-col gap-1.5">
          {lineItems.filter((l) => l.soId === po.id).map((l) => {
            const selected = selectedLineKeys.includes(l.key);
            const value = Math.max(0, Math.min(commitQty[l.key] ?? l.qty, l.qty));
            return (
              <InputNumber
                key={l.key}
                size="small"
                min={0}
                max={l.qty}
                value={value}
                disabled={!selected}
                onChange={(v) => {
                  const clamped = Math.max(0, Math.min(v ?? 0, l.qty));
                  setCommitQty((prev) => ({ ...prev, [l.key]: clamped }));
                }}
                style={{ width: 76 }}
                controls={false}
              />
            );
          })}
        </div>
      ),
    },
    {
      title: "Total Qty", width: 80, align: "right",
      render: (_, po) => (
        <div className="flex flex-col gap-1.5">
          {lineItems.filter((l) => l.soId === po.id).map((l) => (
            <span key={l.key} className="font-mono text-[12px] font-semibold" style={{ color: "#e8ecf4" }}>
              {l.qty.toLocaleString()}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Priority", dataIndex: "priority", width: 84,
      render: (v) => (
        <Tag className="!m-0 !border-0 !text-[10px]" style={{ background: v === "High" ? "rgba(244,104,92,0.14)" : "rgba(125,135,156,0.12)", color: v === "High" ? "#f4685c" : "#8b93a7" }}>{v}</Tag>
      ),
    },
    { title: "Dest.", dataIndex: "dest", width: 80 },
    {
      title: "Status", dataIndex: "status", width: 130,
      render: (s) => <Tag className="!m-0 !border-0 !text-[10px] !font-semibold" style={{ background: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].color }}>{STATUS_STYLE[s].label}</Tag>,
    },
  ];

  const quickChips = [
    { key: "urgent", label: "Urgent" },
    { key: "stockAvailable", label: "Stock Available" },
    { key: "stockShortage", label: "Stock Shortage" },
    { key: "readyToCombine", label: "Ready to Combine" },
    { key: "alreadyPlanned", label: "Already Planned" },
    { key: "notAssigned", label: "Not Assigned" },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: "#f2a93c", colorBgContainer: "#161d2b", colorBgElevated: "#161d2b", colorBorder: "#2a3346", colorText: "#e8ecf4", colorTextSecondary: "#8b93a7", borderRadius: 8, fontFamily: "Manrope, sans-serif" } }}>
      <div className="flex h-screen w-full flex-col overflow-hidden" style={{ background: "radial-gradient(1200px 600px at 15% -10%, rgba(91,141,239,0.08), transparent), radial-gradient(900px 500px at 100% 0%, rgba(242,169,60,0.06), transparent), #0f1420", fontFamily: "Manrope, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
          .font-mono { font-family: 'JetBrains Mono', monospace; }
          .ant-table { background: transparent !important; }
          .ant-table-thead > tr > th { background: #161d2b !important; color: #7d879c !important; border-bottom: 1px solid #2a3346 !important; font-size: 11px !important; text-transform: uppercase; letter-spacing: 0.04em; }
          .ant-table-tbody > tr > td { border-bottom: 1px solid #1e2636 !important; padding: 9px 12px !important; vertical-align: top; }
          .ant-table-tbody > tr:hover > td { background: #1a2233 !important; }
          .ant-table-tbody > tr.ant-table-row-selected > td { background: rgba(242,169,60,0.06) !important; }
          .ant-checkbox-inner { background: #1c2436 !important; border-color: #3a4560 !important; }
          .scroll-thin::-webkit-scrollbar { width: 6px; height: 6px; }
          .scroll-thin::-webkit-scrollbar-track { background: transparent; }
          .scroll-thin::-webkit-scrollbar-thumb { background: #2a3346; border-radius: 999px; }
          .scroll-thin::-webkit-scrollbar-thumb:hover { background: #3a4560; }
          .ant-segmented { background: #1c2436 !important; border: 1px solid #2a3346 !important; }
          .ant-segmented-item-selected { background: #f2a93c !important; color: #161000 !important; }
          .ant-segmented-item-label { color: #8b93a7; font-weight: 600; font-size: 12px; }
          .ant-segmented-item-selected .ant-segmented-item-label { color: #161000 !important; }
        `}</style>

        {/* Header + breadcrumb — fixed, compact strip so content below gets full viewport height */}
        <div className="shrink-0 border-b px-5 py-3" style={{ borderColor: "#1e2636" }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={18} style={{ color: "#f2a93c" }} />
                <h1 className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#f4f6fb" }}>Advanced Work Order Planning</h1>
              </div>
              <p className="mt-0.5 text-[12px]" style={{ color: "#7d879c" }}>Customer → Purchase Orders → Items → Consolidation → Stock Check → Plant Assignment → Commit</p>
            </div>
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#7d879c" }}>
              <button onClick={goToCustomerList} className="flex items-center gap-1 font-semibold hover:text-[#f2a93c]" style={{ color: selectedCustomer ? "#7d879c" : "#f2a93c" }}>
                <Users size={13} /> Customers
              </button>
              {selectedCustomer && (
                <>
                  <ChevronRight size={13} />
                  <span className="font-semibold" style={{ color: "#f2a93c" }}>{selectedCustomer}</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main content — fills remaining viewport height; each column scrolls independently */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-5 xl:grid-cols-[1.15fr_1fr]">
          {/* LEFT: drill-down */}
          <div className="flex min-h-0 flex-col">
            {!selectedCustomer ? (
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                className="flex min-h-0 flex-1 flex-col rounded-xl border p-4" style={cardStyle}>
                <div className="mb-3 flex shrink-0 items-center justify-between">
                  <h2 className="text-[12px] font-bold tracking-wide" style={{ color: "#8b93a7" }}>CUSTOMERS ({filteredCustomers.length})</h2>
                  <Input prefix={<Search size={13} style={{ color: "#5b6478" }} />} placeholder="Search customer" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} style={{ width: 200 }} size="small" />
                </div>
                <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                  {filteredCustomers.map((c) => (
                    <button key={c.name} onClick={() => goToCustomer(c.name)}
                      className="flex items-center justify-between rounded-lg border px-3.5 py-3 text-left transition-colors hover:border-[#f2a93c66]"
                      style={{ background: "#1c2436", borderColor: "#2a3346" }}>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#e8ecf4" }}>
                          {c.urgent && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#f4685c" }} />}
                          {c.name}
                        </div>
                        <div className="mt-0.5 text-[11px]" style={{ color: "#7d879c" }}>
                          {c.totalPOs} PO{c.totalPOs !== 1 ? "s" : ""} · {c.pendingItems} pending item{c.pendingItems !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold" style={{ color: "#e8ecf4" }}>{c.pendingQty.toLocaleString()}</div>
                          <div className="text-[10px]" style={{ color: "#7d879c" }}>pending qty</div>
                        </div>
                        <ChevronRight size={16} style={{ color: "#5b6478" }} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                className="flex min-h-0 flex-1 flex-col rounded-xl border p-4" style={cardStyle}>
                <div className="mb-3 flex shrink-0 items-center justify-between">
                  <button onClick={goToCustomerList} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#8b93a7" }}>
                    <ArrowLeft size={13} /> Back
                  </button>
                  <h2 className="text-[12px] font-bold tracking-wide" style={{ color: "#8b93a7" }}>PURCHASE ORDERS ({filteredPOs.length})</h2>
                </div>

                {/* Filters */}
                <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
                  <Input prefix={<Search size={12} style={{ color: "#5b6478" }} />} placeholder="PO number" size="small" style={{ width: 120 }}
                    value={poFilters.search} onChange={(e) => setPoFilters((p) => ({ ...p, search: e.target.value }))} />
                  <Select allowClear size="small" placeholder="Priority" style={{ width: 100 }} value={poFilters.priority}
                    onChange={(v) => setPoFilters((p) => ({ ...p, priority: v }))} options={[{ value: "High", label: "High" }, { value: "Routine", label: "Routine" }]} />
                  <Select allowClear size="small" placeholder="Destination" style={{ width: 110 }} value={poFilters.dest}
                    onChange={(v) => setPoFilters((p) => ({ ...p, dest: v }))} options={[{ value: "Domestic", label: "Domestic" }, { value: "Export", label: "Export" }]} />
                  <Select allowClear size="small" placeholder="Tyre Size" style={{ width: 110 }} value={poFilters.item}
                    onChange={(v) => setPoFilters((p) => ({ ...p, item: v }))} options={ITEM_OPTIONS.map((v) => ({ value: v, label: v }))} />
                  <Select allowClear size="small" placeholder="Rim" style={{ width: 90 }} value={poFilters.rim}
                    onChange={(v) => setPoFilters((p) => ({ ...p, rim: v }))} options={RIM_OPTIONS.map((v) => ({ value: v, label: v }))} />
                  <Select allowClear size="small" placeholder="Brand" style={{ width: 150 }} value={poFilters.brand}
                    onChange={(v) => setPoFilters((p) => ({ ...p, brand: v }))} options={BRAND_OPTIONS.map((v) => ({ value: v, label: v }))} />
                </div>
                <div className="mb-3 flex shrink-0 flex-wrap gap-1.5">
                  {quickChips.map((q) => (
                    <button key={q.key} onClick={() => toggleQuick(q.key)}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                      style={{ background: poFilters.quick[q.key] ? "#f2a93c" : "#1c2436", color: poFilters.quick[q.key] ? "#161000" : "#8b93a7", border: "1px solid #2a3346" }}>
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* Table fills remaining space of the card; its own body scrolls independently */}
                <div className="min-h-0 flex-1">
                  <Table
                    size="small"
                    columns={poColumns}
                    dataSource={filteredPOs}
                    pagination={false}
                    rowKey="id"
                    scroll={{ y: "calc(100% - 40px)", x: 1240 }}
                  />
                </div>

                {/* Selected line items — pinned drawer at the bottom of the card, capped height so it never pushes the layout */}
                <AnimatePresence>
                  {selectionGroups.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 shrink-0 overflow-hidden">
                      <div className="rounded-lg border p-3" style={{ borderColor: "#2a3346", background: "#12182580" }}>
                        <h3 className="mb-2 text-[11px] font-bold tracking-wide" style={{ color: "#8b93a7" }}>
                          SELECTED LINE ITEMS · {selectedLineKeys.length} line{selectedLineKeys.length !== 1 ? "s" : ""} selected
                        </h3>
                        <div className="scroll-thin flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
                          {selectionGroups.map((g) => (
                            <div key={g.specKey} className="rounded-lg border p-2.5" style={{ borderColor: "#2a3346", background: "#1c2436" }}>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[12px] font-semibold" style={{ color: "#e8ecf4" }}>{g.item} · {g.rim} <span style={{ color: "#7d879c" }}>({g.brand})</span></span>
                                <button onClick={() => buildWorkOrder(g.lines.map((l) => l.key))}
                                  className="rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#f2a93c", color: "#161000" }}>
                                  Create Work Order
                                </button>
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {g.lines.map((l) => (
                                  <span key={l.key} className="rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ background: "#161d2b", color: "#8b93a7" }}>
                                    PO-{l.soId} L{l.lineNo} · {l.committed.toLocaleString()}/{l.qty.toLocaleString()}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: "#f2a93c" }}>Commit Total: {g.total.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* RIGHT: suggestions / work orders / capacity — switched via tabs so no section can push the page into overscroll */}
          <div className="flex min-h-0 flex-col gap-3">
            {!selectedCustomer ? (
              <div className="rounded-xl border p-4 text-[12px]" style={{ ...cardStyle, color: "#7d879c" }}>
                Select a customer to see AI consolidation suggestions for their open purchase orders.
              </div>
            ) : (
              <>
                <Segmented
                  block
                  value={rightTab}
                  onChange={setRightTab}
                  className="shrink-0"
                  options={[
                    { label: `Suggestions${suggestions.length ? ` (${suggestions.length})` : ""}`, value: "suggestions" },
                    { label: `Work Orders${workOrders.length ? ` (${workOrders.length})` : ""}`, value: "workorders" },
                    { label: "Capacity", value: "capacity" },
                  ]}
                />

                <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pr-1">
                  {rightTab === "suggestions" && (
                    <div className="flex flex-col gap-3">
                      <AnimatePresence>
                        {suggestions.length === 0 && (
                          <div className="rounded-xl border p-3 text-[12px]" style={{ ...cardStyle, color: "#7d879c" }}>
                            No multi-PO consolidation opportunities for {selectedCustomer} right now.
                          </div>
                        )}
                        {suggestions.map((g) => (
                          <SuggestionCard key={g.specKey} g={g} onAccept={() => buildWorkOrder(g.lines.map((l) => l.key))}
                            onDismiss={() => setDismissed((prev) => [...prev, `${selectedCustomer}|${g.specKey}`])} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {rightTab === "workorders" && (
                    <div className="rounded-xl border p-4" style={cardStyle}>
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-[12px] font-bold tracking-wide" style={{ color: "#8b93a7" }}>MANUFACTURING WORK ORDERS</h2>
                        <span className="text-[11px]" style={{ color: "#5b6478" }}>{workOrders.length} active</span>
                      </div>
                      {workOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-6" style={{ color: "#5b6478" }}>
                          <Package size={22} />
                          <p className="text-[12px]">Select purchase orders and create a Work Order from the consolidation preview</p>
                        </div>
                      )}
                      <div className="flex flex-col gap-3">
                        <AnimatePresence>
                          {workOrders.map((wo) => (
                            <WorkOrderCard key={wo.id} wo={wo} onChangeAllocation={changeAllocation} onRemove={removeWorkOrder} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {rightTab === "capacity" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-xl border p-4" style={cardStyle}>
                      <h2 className="mb-2 text-[12px] font-bold tracking-wide" style={{ color: "#8b93a7" }}>PLANT CAPACITY & UTILIZATION</h2>
                      <div className="flex flex-wrap justify-around gap-y-4">
                        {capacityByPlant.map((p) => <RadialGauge key={p.code} {...p} />)}
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer — fixed */}
        <div className="shrink-0 border-t px-5 py-3" style={{ borderColor: "#1e2636", background: "#12182580" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 text-[12px]" style={{ color: "#8b93a7" }}>
              <span>Selected Lines: <span className="font-mono font-semibold" style={{ color: "#e8ecf4" }}>{selectedLineKeys.length}</span></span>
              <span>Commit Qty: <span className="font-mono font-semibold" style={{ color: "#e8ecf4" }}>{selectedCommittedQty.toLocaleString()}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedLineKeys([])} disabled={selectedLineKeys.length === 0}
                className="rounded-lg px-3 py-1.5 text-[12px] font-medium disabled:opacity-40" style={{ color: "#8b93a7", border: "1px solid #2a3346" }}>
                Clear Selection
              </button>
              <button onClick={() => setCommitOpen(true)} disabled={draftCount === 0}
                className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold shadow-[0_0_16px_rgba(52,211,153,0.35)] disabled:opacity-40 disabled:shadow-none"
                style={{ background: "#34d399", color: "#052e1c" }}>
                <ShieldCheck size={13} /> Commit Plan {draftCount > 0 ? `(${draftCount})` : ""}
              </button>
            </div>
          </div>
        </div>

        <Modal open={commitOpen} onCancel={() => setCommitOpen(false)} onOk={handleCommit} okText="Commit" title="Commit consolidation plan?">
          <p style={{ color: "#8b93a7" }}>This will lock {draftCount} draft work order{draftCount !== 1 ? "s" : ""} and persist plant allocations, stock reservations, and PO statuses.</p>
        </Modal>
      </div>
    </ConfigProvider>
  );
}