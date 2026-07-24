import React, { useState, useMemo } from "react";
import { Drawer, Input, Select } from "antd";
import { motion } from "framer-motion";
import {
  Search, ChevronRight, ClipboardList, Check, CircleDot, Flame,
  Boxes, Package, Download, Printer,
} from "lucide-react";
import { useT, Pill, SectionLabel, fmtDate, daysFromNow } from "./shared";

/* ================================================================== */
/*  ORDER SUMMARY — read-only analytics drawer                         */
/*  Everything is derived from existing state; no business logic.      */
/*                                                                     */
/*  Props:                                                             */
/*    open, onClose  — drawer visibility                               */
/*    group          — selected customer planning group                */
/*    poRows         — computed PO rows of the selected group          */
/*    workOrders     — generated work orders (for plant assignments)   */
/*    plants         — plant master list [{ code, name }]              */
/* ================================================================== */

const SUMMARY_STATUS = {
  open: { label: "Pending", tone: "primary" },
  partial: { label: "Partial", tone: "warn" },
  planned: { label: "Completed", tone: "success" },
};

const progressColor = (t, pct) => (pct >= 1 ? t.success : pct > 0 ? t.warn : t.faint);

function HBar({ label, value, max, color, right }) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <span className="w-[70px] truncate font-mono text-[10px] font-bold" style={{ color: t.sub }}>{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: t.inset }}>
        <motion.div className="h-full rounded-full" initial={{ width: 0 }}
          animate={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }} style={{ background: color }} />
      </div>
      <span className="w-[76px] shrink-0 text-right font-mono text-[10px] font-bold" style={{ color: t.text }}>{right}</span>
    </div>
  );
}

function ChartCard({ title, children }) {
  const t = useT();
  return (
    <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  );
}

export default function OrderSummary({ open, onClose, group, poRows, workOrders, plants }) {
  const t = useT();
  const [expandedId, setExpandedId] = useState(null);
  const [fSearch, setFSearch] = useState("");
  const [fStatus, setFStatus] = useState();
  const [fPriority, setFPriority] = useState();
  const [fPlant, setFPlant] = useState();
  const [fProcess, setFProcess] = useState();
  console.log(poRows);
  

  /* Plant assignments per line key, aggregated across generated WOs. */
  const linePlantMap = useMemo(() => {
    const m = {};
    workOrders.forEach((w) => w.sourceLines.forEach((l) => {
      if (!m[l.key]) m[l.key] = {};
      l.plantAssignments.forEach((a) => (m[l.key][a.plant] = (m[l.key][a.plant] || 0) + a.qty));
    }));
    return m;
  }, [workOrders]);

  const pos = useMemo(() => poRows.map((po) => {
    const assigned = po.originalQty - po.pendingQty;
    const lines = po.lines.map((l) => ({ ...l, assigned: l.qty - l.openQty, plants: linePlantMap[l.key] || {} }));
    return { ...po, assigned, progress: po.originalQty ? assigned / po.originalQty : 0, lines };
  }), [poRows, linePlantMap]);

  const totals = useMemo(() => {
    const ordered = pos.reduce((a, p) => a + p.originalQty, 0);
    const assigned = pos.reduce((a, p) => a + p.assigned, 0);
    const items = pos.reduce((a, p) => a + p.itemCount, 0);
    return { ordered, assigned, balance: ordered - assigned, items, progress: ordered ? assigned / ordered : 0 };
  }, [pos]);

  const kpis = useMemo(() => ([
    { label: "Open POs", value: pos.filter((p) => p.status !== "planned").length, icon: ClipboardList, color: t.primary },
    { label: "Completed POs", value: pos.filter((p) => p.status === "planned").length, icon: Check, color: t.success },
    { label: "Partial POs", value: pos.filter((p) => p.status === "partial").length, icon: CircleDot, color: t.warn },
    { label: "High Priority", value: pos.filter((p) => p.priority === "High").length, icon: Flame, color: t.danger },
    { label: "Total Items", value: totals.items, icon: Boxes, color: t.sub },
    { label: "Pending Qty", value: totals.balance.toLocaleString(), icon: Package, color: t.warn },
  ]), [pos, totals, t]);

  /* Charts — always computed from the full (unfiltered) picture. */
  const plantTotals = useMemo(() => {
    const m = {};
    plants.forEach((p) => (m[p.code] = 0));
    const ids = new Set(group?.poIds || []);
    workOrders.forEach((w) => w.sourceLines.forEach((l) => {
      if (!ids.has(l.soId)) return;
      l.plantAssignments.forEach((a) => (m[a.plant] += a.qty));
    }));
    return m;
  }, [workOrders, group, plants]);

  const typeTotals = useMemo(() => {
    const m = { TYRE: 0, ASSEMBLY: 0, RIM: 0 };
    pos.forEach((p) => p.lines.forEach((l) => (m[l.type] += l.qty)));
    return m;
  }, [pos]);

  const deliveryBuckets = useMemo(() => {
    const b = [
      { label: "Overdue", qty: 0, color: t.danger },
      { label: "Next 7 days", qty: 0, color: t.warn },
      { label: "8–15 days", qty: 0, color: t.primary },
      { label: "16+ days", qty: 0, color: t.sub },
    ];
    pos.forEach((p) => p.lines.forEach((l) => {
      if (l.openQty <= 0) return;
      const d = daysFromNow(l.deliveryDate);
      (d < 0 ? b[0] : d <= 7 ? b[1] : d <= 15 ? b[2] : b[3]).qty += l.openQty;
    }));
    return b;
  }, [pos, t]);

  /* Filters apply to the PO table and item summary only. */
  const q = fSearch.trim().toLowerCase();
  const filtered = useMemo(() => pos.map((po) => {
    if (fStatus && po.status !== fStatus) return null;
    if (fPriority && po.priority !== fPriority) return null;
    let lines = po.lines;
    if (fProcess) lines = lines.filter((l) => l.processId === fProcess);
    if (fPlant) lines = lines.filter((l) => (l.plants[fPlant] || 0) > 0);
    if (q && !String(po.id).includes(q)) {
      lines = lines.filter((l) => `${l.processId} ${l.description}`.toLowerCase().includes(q));
    }
    return lines.length ? { ...po, lines } : null;
  }).filter(Boolean), [pos, fStatus, fPriority, fProcess, fPlant, q]);

  const itemSummary = useMemo(() => {
    const m = {};
    filtered.forEach((po) => po.lines.forEach((l) => {
      if (!m[l.processId]) m[l.processId] = { processId: l.processId, description: l.description, ordered: 0, assigned: 0 };
      m[l.processId].ordered += l.qty;
      m[l.processId].assigned += l.assigned;
    }));
    return Object.values(m).map((r) => ({ ...r, balance: r.ordered - r.assigned }));
  }, [filtered]);

  const processOptions = useMemo(() =>
    [...new Set(pos.flatMap((p) => p.lines.map((l) => l.processId)))].map((v) => ({ value: v, label: v })), [pos]);

  const exportCsv = () => {
    const rows = [["PO", "Line", "Process ID", "Description", "Ordered", "Assigned", "Balance", "Plants", "Status"]];
    filtered.forEach((po) => po.lines.forEach((l) => rows.push([
      `PO-${po.id}`, `L${l.lineNo}`, l.processId, `"${l.description}"`,
      l.qty, l.assigned, l.openQty,
      `"${Object.entries(l.plants).map(([p, v]) => `${p}=${v}`).join(" ")}"`,
      SUMMARY_STATUS[l.status].label,
    ])));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${group?.customer || "customer"}-order-summary.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cell = "px-2.5 py-2 text-[11px]";
  const donutC = 2 * Math.PI * 42;

  return (
    <Drawer open={open} onClose={onClose} width="min(1080px, 96vw)" destroyOnClose={false}
      styles={{ body: { background: t.bg, padding: 16 }, header: { background: t.surface, borderBottom: `1px solid ${t.border}` } }}
      title={<span style={{ fontFamily: "'Sora', sans-serif", color: t.text }}>Order Summary</span>}
      footer={
        <div className="flex items-center justify-end gap-2 py-1">
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] font-bold"
            style={{ borderColor: t.border, color: t.sub }}><Download size={12} /> Export Excel</button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] font-bold"
            style={{ borderColor: t.border, color: t.sub }}><Printer size={12} /> Print Summary</button>
          <button onClick={onClose} className="rounded-lg px-4 py-1.5 text-[11.5px] font-bold"
            style={{ background: t.primary, color: t.onPrimary }}>Close</button>
        </div>
      }>
      {group && (
        <div className="flex flex-col gap-4">
          {/* Header summary */}
          <div className="rounded-xl border p-4" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: t.faint }}>Customer</div>
                <div className="text-[16px] font-bold" style={{ color: t.text, fontFamily: "'Sora', sans-serif" }}>{group.customer}</div>
              </div>
              <div className="flex flex-wrap gap-5 text-right">
                {[
                  ["POs", pos.length], ["Line Items", totals.items],
                  ["Ordered Qty", totals.ordered.toLocaleString()],
                  ["Assigned", totals.assigned.toLocaleString()],
                  ["Balance", totals.balance.toLocaleString()],
                ].map(([lab, v]) => (
                  <div key={lab}>
                    <div className="font-mono text-[15px] font-bold" style={{ color: t.text }}>{v}</div>
                    <div className="text-[9px] uppercase tracking-wide" style={{ color: t.faint }}>{lab}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: t.inset }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: `${Math.round(totals.progress * 100)}%` }} transition={{ duration: 0.6 }}
                  style={{ background: progressColor(t, totals.progress) }} />
              </div>
              <span className="font-mono text-[13px] font-bold" style={{ color: t.text }}>{Math.round(totals.progress * 100)}%</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {kpis.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border p-3" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                <Icon size={14} style={{ color }} />
                <div className="mt-1.5 font-mono text-[17px] font-bold" style={{ color: t.text }}>{value}</div>
                <div className="text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ChartCard title="PO Progress">
              <div className="flex flex-col gap-1.5">
                {pos.map((p) => (
                  <HBar key={p.id} label={`PO-${p.id}`} value={p.progress * 100} max={100}
                    color={progressColor(t, p.progress)} right={`${Math.round(p.progress * 100)}%`} />
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Quantity Status">
              <div className="flex items-center gap-4">
                <div className="relative h-[104px] w-[104px] shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke={t.warn} strokeOpacity="0.35" strokeWidth="12" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke={t.success} strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={donutC} initial={{ strokeDashoffset: donutC }}
                      animate={{ strokeDashoffset: donutC * (1 - totals.progress) }} transition={{ duration: 0.6 }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[14px] font-bold" style={{ color: t.text }}>
                    {Math.round(totals.progress * 100)}%
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5" style={{ color: t.sub }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: t.success }} />
                    Assigned <b className="font-mono" style={{ color: t.text }}>{totals.assigned.toLocaleString()}</b>
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: t.sub }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: t.warn, opacity: 0.6 }} />
                    Pending <b className="font-mono" style={{ color: t.text }}>{totals.balance.toLocaleString()}</b>
                  </span>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Plant Allocation">
              <div className="flex flex-col gap-1.5">
                {plants.map((p) => (
                  <HBar key={p.code} label={p.code} value={plantTotals[p.code]}
                    max={Math.max(...Object.values(plantTotals), 1)} color={t.primary}
                    right={plantTotals[p.code].toLocaleString()} />
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Product Type · Ordered Qty">
              <div className="flex flex-col gap-1.5">
                {Object.entries(typeTotals).map(([type, qty]) => (
                  <HBar key={type} label={type} value={qty}
                    max={Math.max(...Object.values(typeTotals), 1)}
                    color={type === "TYRE" ? t.primary : type === "ASSEMBLY" ? t.success : t.warn}
                    right={qty.toLocaleString()} />
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Delivery Timeline · Pending Qty">
              <div className="flex flex-col gap-1.5">
                {deliveryBuckets.map((b) => (
                  <HBar key={b.label} label={b.label} value={b.qty}
                    max={Math.max(...deliveryBuckets.map((x) => x.qty), 1)} color={b.color}
                    right={b.qty.toLocaleString()} />
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Input allowClear size="small" style={{ width: 220 }} value={fSearch}
              prefix={<Search size={12} style={{ color: t.faint }} />}
              placeholder="Search PO, Process ID, Description" onChange={(e) => setFSearch(e.target.value)} />
            <Select allowClear size="small" placeholder="Status" style={{ width: 120 }} value={fStatus} onChange={setFStatus}
              options={Object.entries(SUMMARY_STATUS).map(([v, s]) => ({ value: v, label: s.label }))} />
            <Select allowClear size="small" placeholder="Priority" style={{ width: 105 }} value={fPriority} onChange={setFPriority}
              options={[{ value: "High", label: "High" }, { value: "Routine", label: "Routine" }]} />
            <Select allowClear size="small" placeholder="Plant" style={{ width: 100 }} value={fPlant} onChange={setFPlant}
              options={plants.map((p) => ({ value: p.code, label: p.code }))} />
            <Select allowClear showSearch size="small" placeholder="Process ID" style={{ width: 140 }} value={fProcess}
              onChange={setFProcess} options={processOptions} />
          </div>

          {/* PO progress table — expandable rows, sticky header */}
          <ChartCard title={`Purchase Orders · ${filtered.length}`}>
            <div className="scroll-y max-h-[340px] overflow-x-auto rounded-lg border" style={{ borderColor: t.border }}>
              <div className="min-w-[880px]">
                <div className="sticky top-0 z-10 grid grid-cols-[24px_92px_96px_96px_58px_86px_86px_86px_1fr_100px] border-b text-[9.5px] font-bold uppercase tracking-wide"
                  style={{ background: t.surfaceAlt, borderColor: t.border, color: t.faint }}>
                  {["", "PO", "Order Date", "Delivery", "Items", "Ordered", "Assigned", "Balance", "Progress", "Status"].map((h, i) => (
                    <div key={i} className={cell}>{h}</div>
                  ))}
                </div>
                {filtered.map((po) => {
                  const st = SUMMARY_STATUS[po.status];
                  const isOpen = expandedId === po.id;
                  return (
                    <React.Fragment key={po.id}>
                      <button onClick={() => setExpandedId(isOpen ? null : po.id)}
                        className="grid w-full grid-cols-[24px_92px_96px_96px_58px_86px_86px_86px_1fr_100px] items-center border-b text-left transition-colors"
                        style={{ borderColor: t.border, background: isOpen ? t.primarySoft : "transparent" }}>
                        <div className={cell}><motion.div animate={{ rotate: isOpen ? 90 : 0 }}><ChevronRight size={12} style={{ color: t.faint }} /></motion.div></div>
                        <div className={`${cell} font-mono font-bold`} style={{ color: t.text }}>PO-{po.id}</div>
                        <div className={cell} style={{ color: t.sub }}>{fmtDate(po.orderDate)}</div>
                        <div className={cell} style={{ color: t.sub }}>{fmtDate(po.earliestDelivery)}</div>
                        <div className={`${cell} font-mono`} style={{ color: t.text }}>{po.lines.length}</div>
                        <div className={`${cell} font-mono`} style={{ color: t.text }}>{po.originalQty.toLocaleString()}</div>
                        <div className={`${cell} font-mono`} style={{ color: t.success }}>{po.assigned.toLocaleString()}</div>
                        <div className={`${cell} font-mono`} style={{ color: po.pendingQty > 0 ? t.warn : t.faint }}>{po.pendingQty.toLocaleString()}</div>
                        <div className={`${cell} flex items-center gap-2`}>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: t.inset }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.round(po.progress * 100)}%`, background: progressColor(t, po.progress) }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold" style={{ color: t.text }}>{Math.round(po.progress * 100)}%</span>
                        </div>
                        <div className={cell}><Pill tone={st.tone}>{st.label}</Pill></div>
                      </button>
                      {isOpen && (
                        <div className="border-b px-3 py-2" style={{ borderColor: t.border, background: t.surfaceAlt }}>
                          <div className="grid grid-cols-[44px_92px_1fr_76px_76px_76px_150px_84px] gap-x-2 text-[9px] font-bold uppercase tracking-wide" style={{ color: t.faint }}>
                            {["Line", "Process ID", "Description", "Ordered", "Assigned", "Balance", "Plants", "Status"].map((h) => <div key={h} className="py-1">{h}</div>)}
                          </div>
                          {po.lines.map((l) => {
                            const ls = SUMMARY_STATUS[l.status];
                            return (
                              <div key={l.key} className="grid grid-cols-[44px_92px_1fr_76px_76px_76px_150px_84px] items-center gap-x-2 border-t py-1.5 text-[10.5px]"
                                style={{ borderColor: t.border }}>
                                <div className="font-mono" style={{ color: t.faint }}>L{l.lineNo}</div>
                                <div className="font-mono font-bold" style={{ color: t.text }}>{l.processId}</div>
                                <div className="truncate font-mono" style={{ color: t.sub }} title={l.description}>{l.description}</div>
                                <div className="font-mono" style={{ color: t.text }}>{l.qty.toLocaleString()}</div>
                                <div className="font-mono" style={{ color: t.success }}>{l.assigned.toLocaleString()}</div>
                                <div className="font-mono" style={{ color: l.openQty > 0 ? t.warn : t.faint }}>{l.openQty.toLocaleString()}</div>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(l.plants).length === 0
                                    ? <span style={{ color: t.faint }}>—</span>
                                    : Object.entries(l.plants).map(([p, v]) => (
                                      <span key={p} className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold" style={{ background: t.inset, color: t.sub }}>
                                        {p} · {v.toLocaleString()}
                                      </span>
                                    ))}
                                </div>
                                <div><Pill tone={ls.tone}>{ls.label}</Pill></div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-6 text-center text-[11.5px]" style={{ color: t.faint }}>No purchase orders match the filters.</div>
                )}
              </div>
            </div>
          </ChartCard>

          {/* Item summary — grouped by Process ID */}
          <ChartCard title={`Item Summary · ${itemSummary.length} products`}>
            <div className="scroll-y max-h-[280px] overflow-x-auto rounded-lg border" style={{ borderColor: t.border }}>
              <div className="min-w-[720px]">
                <div className="sticky top-0 z-10 grid grid-cols-[110px_1fr_90px_90px_90px_100px] border-b text-[9.5px] font-bold uppercase tracking-wide"
                  style={{ background: t.surfaceAlt, borderColor: t.border, color: t.faint }}>
                  {["Process ID", "Description", "Ordered", "Assigned", "Balance", "Status"].map((h) => <div key={h} className={cell}>{h}</div>)}
                </div>
                {itemSummary.map((r) => {
                  const st = r.balance === 0 ? SUMMARY_STATUS.planned : r.assigned > 0 ? SUMMARY_STATUS.partial : SUMMARY_STATUS.open;
                  return (
                    <div key={r.processId} className="grid grid-cols-[110px_1fr_90px_90px_90px_100px] items-center border-b" style={{ borderColor: t.border }}>
                      <div className={`${cell} font-mono font-bold`} style={{ color: t.text }}>{r.processId}</div>
                      <div className={`${cell} truncate font-mono`} style={{ color: t.sub }} title={r.description}>{r.description}</div>
                      <div className={`${cell} font-mono`} style={{ color: t.text }}>{r.ordered.toLocaleString()}</div>
                      <div className={`${cell} font-mono`} style={{ color: t.success }}>{r.assigned.toLocaleString()}</div>
                      <div className={`${cell} font-mono`} style={{ color: r.balance > 0 ? t.warn : t.faint }}>{r.balance.toLocaleString()}</div>
                      <div className={cell}><Pill tone={st.tone}>{st.label}</Pill></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartCard>
        </div>
      )}
    </Drawer>
  );
}