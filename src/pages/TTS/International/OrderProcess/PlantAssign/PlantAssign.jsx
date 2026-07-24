import React, { useState, useMemo, useEffect, useRef } from "react";
import { ConfigProvider, theme as antTheme, InputNumber, Input, Select, Modal, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Search, Sun, Moon, ChevronRight, Factory, Package, AlertTriangle,
  Check, ShieldCheck, Undo2, ClipboardList, CircleDot,
  Boxes, CalendarClock, Flame, Eye, Users, Maximize2, Minimize2, BarChart3,
  CheckCheck, XSquare, FilterX, Download, ArrowRight,
  Pencil,
} from "lucide-react";
import { THEMES, ThemeCtx, useT, Pill, SectionLabel, fmtDate, daysFromNow } from "./Shared";
import OrderSummary from "./OrderSummary";

/* ================================================================== */
/*  DATA — replace with API data (unchanged business data & rules)     */
/* ================================================================== */

/* Plant capacity management will be added in a future update. */
const PLANTS = [
  { code: "MMN", name: "Maraimalai Nagar" },
  { code: "PDK", name: "Pudhupettai" },
  { code: "SITL", name: "SITL Sri Lanka" },
  { code: "SLTL", name: "SLTL Sri Lanka" },
];

const ORDER_HEADERS = [
  { id: 1001, customer: "SUN-TWS AMERCIA INC", priority: "High", dest: "Export", orderDateOffset: -35 },
  { id: 1032, customer: "SUN-TWS AMERCIA INC", priority: "Routine", dest: "Export", orderDateOffset: -20 },
  { id: 1080, customer: "SUN-TWS AMERCIA INC", priority: "Routine", dest: "Export", orderDateOffset: -10 },
  { id: 1105, customer: "INDUSTRIAL TYRE NETWORK LTD", priority: "High", dest: "Export", orderDateOffset: -25 },
  { id: 1110, customer: "INDUSTRIAL TYRE NETWORK LTD", priority: "Routine", dest: "Export", orderDateOffset: -12 },
  { id: 1122, customer: "PROFESSIONAL INDUSTRIAL TIRE CO,INC", priority: "High", dest: "Export", orderDateOffset: -30 },
  { id: 1130, customer: "TVH PARTS CO", priority: "Routine", dest: "Export", orderDateOffset: -15 },
  { id: 1145, customer: "TVH PARTS CO", priority: "Routine", dest: "Export", orderDateOffset: -8 },
  { id: 1160, customer: "PANAMA FORKLIFT COMPANY, INC", priority: "High", dest: "Export", orderDateOffset: -22 },
  { id: 1172, customer: "NEXEN CORP", priority: "Routine", dest: "Export", orderDateOffset: -5 },
  { id: 1188, customer: "PROFESSIONAL INDUSTRIAL TIRE CO,INC", priority: "Routine", dest: "Export", orderDateOffset: -18 },
  { id: 1201, customer: "SUN-TWS AMERCIA INC", priority: "High", dest: "Export", orderDateOffset: -6 },
];

/* ------------------------------------------------------------------ */
/*  PRODUCT MASTER                                                     */
/*  Raw product records as they come from the company database with    */
/*  their relationships. Replace with the API response.                */
/* ------------------------------------------------------------------ */
const PRODUCT_SOURCE = [
  { processId: "P-004331", description: "SRT | TL | 7.00-12 LUG | 5.00 | TANTOR | WIDEWALL" },
  { processId: "P-004332", description: "SRT | TL | 6.50-10 LUG | 5.00 | TANTOR | WIDEWALL" },
  { processId: "P-004333", description: "SRT | TL | 6.00-9 LUG | 4.00 | TANTOR | WIDEWALL" },
  { processId: "P-004335", description: "SRT | TL | 18X7-8 LUG | 4.33 | TANTOR | WIDEWALL" },
  { processId: "P-008588", description: "POB | SM | 21X9X15 SM | 0 | NUMA | P" },
  { processId: "P-008741", description: "SRT | NP | 18X7-8 LUG | 4.33 | NUMAPRIME | PREMIUM" },
  { processId: "P-008886", description: "SRT | NP | 6.00-9 LUG | 4.00 | NUMAPRIME | PREMIUM" },
  { processId: "P-008910", description: "POB | SM | 21X8X15 SM | 0 | NUMA | P" },
  { processId: "00317R01", description: "00317R01 | 5.00 S-12/V" },
  { processId: "00350R01", description: "00350R01 | 3.75I-8", standaloneRim: true },
  { processId: "00390R00", description: "00390R00 | 7.50-20", standaloneRim: true },
  { processId: "00390R01", description: "00390R01 | 7.50-20", standaloneRim: true },
  { processId: "00434R03", description: "00434R03 | 3.00D-8", standaloneRim: true },
  { processId: "00441R06", description: "00441R06 | 2.50C-8", standaloneRim: true },
  { processId: "00442R00", description: "00442R00 | 18X7", standaloneRim: true },
  { processId: "00445R05", description: "00445R05 | 4.33R-8", standaloneRim: true },
  { processId: "P085038A", description: "POB | SM | 21X8X15 SM | 0 | NUMA | P", assembly: true, rimProcessId: "00350R02", direction: "ND" },
  { processId: "P009664A", description: "SRT | TL | 10.00-20 LUG | 7.00 | TALON | -", assembly: true, rimProcessId: "00390R01", direction: "ND" },
  { processId: "P009665A", description: "SRT | TL | 12.00-20 LUG | 8.00 | TALON | -", assembly: true, rimProcessId: "00390R02", direction: "ND" },
  { processId: "P193538A", description: "SRT | TL | 4.00-4 LUG | 2.50 | TANTOR | WIDEWALL", assembly: true, rimProcessId: "00434R04", direction: "ND" },
  { processId: "P189658B", description: "SRT | NP | 15X4½-8 LUG | 3.00 | NUMAPRIME | PREMIUM", assembly: true, rimProcessId: "00441R01", direction: "LH" },
  { processId: "P189658A", description: "SRT | NP | 15X4½-8 LUG | 3.00 | NUMAPRIME | PREMIUM", assembly: true, rimProcessId: "00442R01", direction: "ND" },
  { processId: "P189658D", description: "SRT | NP | 15X4½-8 LUG | 3.00 | NUMAPRIME | PREMIUM", assembly: true, rimProcessId: "00445R01", direction: "ND" },
  { processId: "P189658C", description: "SRT | NP | 15X4½-8 LUG | 3.00 | NUMAPRIME | PREMIUM", assembly: true, rimProcessId: "00453R32", direction: "RH" },
];

/* Transforms raw product records into the Product Master JSON.        */
/* Rules apply dynamically — new products need no code changes:        */
/*   Tyre           → EDCNo null,      AssemblyStatus 0, RimStatus 0, Direction null */
/*   Standalone Rim → EDCNo ProcessID, AssemblyStatus 0, RimStatus 1, Direction null */
/*   Assembly       → EDCNo rim PID,   AssemblyStatus 1, RimStatus 0, Direction ND/LH/RH */
const toProductMaster = (p) => ({
  ProcessID: p.processId,
  Description: p.description,
  EDCNo: p.assembly ? p.rimProcessId : p.standaloneRim ? p.processId : null,
  AssemblyStatus: p.assembly ? 1 : 0,
  RimStatus: !p.assembly && p.standaloneRim ? 1 : 0,
  Direction: p.assembly ? p.direction ?? "ND" : null,
});

const PRODUCT_MASTER = PRODUCT_SOURCE.map(toProductMaster);
const PRODUCT_BY_ID = Object.fromEntries(PRODUCT_MASTER.map((p) => [p.ProcessID, p]));

const productType = (p) => (p.AssemblyStatus === 1 ? "ASSEMBLY" : p.RimStatus === 1 ? "RIM" : "TYRE");

/* Display-only parsing of the combined Description string. */
const productDisplay = (p) => {
  const parts = p.Description.split("|").map((s) => s.trim());
  if (parts.length <= 2) return { item: parts[1] || parts[0], brand: "—", sidewall: "—" };
  return { item: parts[2] || "—", brand: parts[4] || "—", sidewall: parts[5] || "—" };
};

/* ------------------------------------------------------------------ */
/*  SAMPLE PO LINE ITEMS                                               */
/*  [soId, processId, qty, deliveryOffset] — deterministic generator:  */
/*  every PO gets 10–40 lines with a mix of Tyres, Assemblies and      */
/*  Split Rims, using only ProcessIDs from the Product Master.         */
/* ------------------------------------------------------------------ */
const TYRE_IDS = PRODUCT_MASTER.filter((p) => p.AssemblyStatus === 0 && p.RimStatus === 0).map((p) => p.ProcessID);
const RIM_IDS = PRODUCT_MASTER.filter((p) => p.RimStatus === 1).map((p) => p.ProcessID);
const ASSEMBLY_IDS = PRODUCT_MASTER.filter((p) => p.AssemblyStatus === 1).map((p) => p.ProcessID);

const QTY_STEPS = [50, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000];
const PO_DELIVERY_OFFSET = { 1001: 12, 1032: 40, 1080: 55, 1105: 8, 1110: 20, 1122: 5, 1130: 33, 1145: 47, 1160: 18, 1172: 60, 1188: 27, 1201: 10 };

const RAW_LINES = ORDER_HEADERS.flatMap((h, hi) => {
  const count = 10 + ((hi * 9 + 3) % 31); // 10..40, varied per PO
  return Array.from({ length: count }, (_, i) => {
    /* Pattern: tyre, tyre, assembly, rim → ~50/25/25 mix in every PO */
    const pool = i % 4 === 2 ? ASSEMBLY_IDS : i % 4 === 3 ? RIM_IDS : TYRE_IDS;
    const pid = pool[(hi * 3 + i) % pool.length];
    const qty = QTY_STEPS[(hi * 5 + i * 3) % QTY_STEPS.length];
    return [h.id, pid, qty, PO_DELIVERY_OFFSET[h.id]];
  });
});

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(v ?? 0, hi));

function buildLineItems() {
  const seq = {};
  return RAW_LINES.map(([soId, pid, qty, offset]) => {
    seq[soId] = (seq[soId] || 0) + 1;
    const header = ORDER_HEADERS.find((h) => h.id === soId);
    const product = PRODUCT_BY_ID[pid];
    const d = productDisplay(product);
    return {
      key: `${soId}-L${seq[soId]}`, soId, lineNo: seq[soId], qty,
      processId: product.ProcessID,
      description: product.Description,
      edcNo: product.EDCNo,
      direction: product.Direction,
      type: productType(product),
      item: d.item, brand: d.brand, sidewall: d.sidewall,
      customer: header.customer, priority: header.priority, dest: header.dest,
      deliveryDate: addDays(offset), specKey: product.ProcessID,
    };
  });
}
const INITIAL_LINE_ITEMS = buildLineItems();
const LINE_BY_KEY = Object.fromEntries(INITIAL_LINE_ITEMS.map((l) => [l.key, l]));

const ORIGINAL_PO_STATS = {};
RAW_LINES.forEach(([soId, , qty]) => {
  if (!ORIGINAL_PO_STATS[soId]) ORIGINAL_PO_STATS[soId] = { totalQty: 0, itemCount: 0 };
  ORIGINAL_PO_STATS[soId].totalQty += qty;
  ORIGINAL_PO_STATS[soId].itemCount += 1;
});

/* Customer planning groups exactly as returned by the backend.           */
/* The same customer may appear in multiple groups — render each entry    */
/* as-is, never merge, never explain the separation.                      */
const CUSTOMER_GROUPS = [
  { groupId: "CG-01", customer: "SUN-TWS AMERCIA INC", poIds: [1001, 1032, 1080] },
  { groupId: "CG-02", customer: "SUN-TWS AMERCIA INC", poIds: [1201] },
  { groupId: "CG-03", customer: "INDUSTRIAL TYRE NETWORK LTD", poIds: [1105, 1110] },
  { groupId: "CG-04", customer: "PROFESSIONAL INDUSTRIAL TIRE CO,INC", poIds: [1122, 1188] },
  { groupId: "CG-05", customer: "TVH PARTS CO", poIds: [1130, 1145] },
  { groupId: "CG-06", customer: "PANAMA FORKLIFT COMPANY, INC", poIds: [1160] },
  { groupId: "CG-07", customer: "NEXEN CORP", poIds: [1172] },
];
const GROUP_BY_PO = {};
CUSTOMER_GROUPS.forEach((g) => g.poIds.forEach((id) => (GROUP_BY_PO[id] = g.groupId)));
const groupById = (id) => CUSTOMER_GROUPS.find((g) => g.groupId === id) || null;

const customerCode = (name) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 3);

const sumAsg = (asg) => Object.values(asg || {}).reduce((a, b) => a + (b || 0), 0);

/* Theme (THEMES/ThemeCtx/useT) and shared primitives (Pill, SectionLabel, */
/* fmtDate, daysFromNow) live in ./shared and are imported above.          */

function urgencyTone(days) {
  if (days <= 15) return "danger";
  if (days <= 30) return "warn";
  return "neutral";
}

const LINE_STATUS = {
  open: { label: "Open", tone: "primary" },
  partial: { label: "Partial", tone: "warn" },
  planned: { label: "Planned", tone: "success" },
};
const PO_STATUS = {
  open: { label: "Not Assigned", tone: "primary" },
  partial: { label: "Partially Planned", tone: "warn" },
  planned: { label: "Planned", tone: "success" },
};

/* Empty state for every multi-select filter (single source of truth). */
const EMPTY_FILTERS = {
  po: [], processId: [], assembly: [], brand: [],
  size: [], sidewall: [], type: [], priority: [], status: [],
};

/* ================================================================== */
/*  LEFT — CUSTOMER SIDEBAR                                            */
/* ================================================================== */

function CustomerCard({ c, active, onClick }) {
  const t = useT();
  return (
    <motion.button layout onClick={onClick} whileTap={{ scale: 0.985 }}
      className="w-full rounded-xl border p-3.5 text-left transition-colors"
      style={{
        background: active ? t.primarySoft : t.surface,
        borderColor: active ? t.primaryBorder : t.border,
        boxShadow: active ? "none" : t.shadow,
      }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold"
            style={{ background: active ? t.primary : t.inset, color: active ? t.onPrimary : t.sub }}>
            {c.code}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold" style={{ color: t.text }}>{c.name}</div>
            <div className="text-[11px]" style={{ color: t.faint }}>
              {c.openPOs} open PO{c.openPOs !== 1 ? "s" : ""} · {c.pendingItems} item{c.pendingItems !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[13px] font-bold" style={{ color: t.text }}>{c.pendingQty.toLocaleString()}</div>
          <div className="text-[9.5px]" style={{ color: t.faint }}>pending</div>
        </div>
      </div>
      {(c.high || c.urgent) && (
        <div className="mt-2 flex gap-1.5">
          {c.urgent && <Pill tone="danger" icon={Flame}>Urgent delivery</Pill>}
          {c.high && <Pill tone="warn">High priority</Pill>}
        </div>
      )}
      <div className="mt-2.5 h-1 overflow-hidden rounded-full" style={{ background: t.inset }}>
        <motion.div className="h-full rounded-full" style={{ background: c.progress >= 1 ? t.success : t.primary }}
          initial={false} animate={{ width: `${Math.round(c.progress * 100)}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div className="mt-1 text-[9.5px]" style={{ color: t.faint }}>{Math.round(c.progress * 100)}% planned</div>
    </motion.button>
  );
}

/* ================================================================== */
/*  CENTER — PO CARD + LINE ITEMS                                      */
/* ================================================================== */

function LineRow({ row, selected, onToggle, commit, onCommit }) {
  const t = useT();
  const open = row.openQty > 0;
  const committed = open ? clamp(commit ?? row.openQty, 0, row.openQty) : 0;
  const remaining = row.openQty - committed;
  const days = daysFromNow(row.deliveryDate);
  const st = LINE_STATUS[row.status];
  return (
    <motion.div layout onClick={() => open && onToggle()}
      className="rounded-lg border px-3 py-2.5 transition-colors"
      style={{
        background: selected ? t.primarySoft : t.surfaceAlt,
        borderColor: selected ? t.primaryBorder : t.border,
        cursor: open ? "pointer" : "default",
        opacity: open ? 1 : 0.6,
      }}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors"
          style={{
            background: selected ? t.primary : t.surface,
            borderColor: selected ? t.primary : t.borderStrong,
          }}>
          {selected && <Check size={12} strokeWidth={3.5} color={t.onPrimary} />}
        </div>

        <div className="min-w-[210px] flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[12.5px] font-bold" style={{ color: t.text }}>{row.item}</span>
            <span className="text-[11.5px] font-semibold" style={{ color: t.sub }}>{row.brand}</span>
            <Pill tone="neutral">{row.sidewall}</Pill>
            <Pill tone="neutral">{row.type}</Pill>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 font-mono text-[10px]" style={{ color: t.faint }}>
            <span>L{row.lineNo}</span><span>{row.processId}</span>
            {row.edcNo && <span>EDC {row.edcNo}</span>}
            {row.direction && <span>{row.direction}</span>}
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={10} />{fmtDate(row.deliveryDate)}
              <span style={{ color: days <= 15 ? t.danger : days <= 30 ? t.warn : t.faint }}>· {days}d</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[62px] text-right">
            <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Available</div>
            <div className="font-mono text-[13px] font-bold" style={{ color: t.text }}>{row.openQty.toLocaleString()}</div>
          </div>
          <div className="w-[86px]" onClick={(e) => e.stopPropagation()}>
            <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Commit</div>
            <InputNumber size="small" min={0} max={row.openQty} controls={false} disabled={!selected}
              value={committed} onChange={(v) => onCommit(clamp(v, 0, row.openQty))}
              className="mt-0.5 w-full font-mono" />
          </div>
          <div className="w-[62px] text-right">
            <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Remaining</div>
            <div className="font-mono text-[13px] font-bold" style={{ color: selected && remaining > 0 ? t.warn : t.sub }}>
              {selected ? remaining.toLocaleString() : row.openQty.toLocaleString()}
            </div>
          </div>
          <div className="w-[72px] text-right"><Pill tone={st.tone}>{st.label}</Pill></div>
        </div>
      </div>
    </motion.div>
  );
}

/* PO header now carries a tri-state select-all checkbox for its own open lines. */
function POCard({ po, expanded, onToggle, selectedKeys, onToggleLine, onToggleAll, commitQty, onCommit }) {
  const t = useT();
  const days = daysFromNow(po.earliestDelivery);
  const ps = PO_STATUS[po.status];
  const openKeys = po.lines.filter((l) => l.openQty > 0).map((l) => l.key);
  const selCount = openKeys.filter((k) => selectedKeys.includes(k)).length;
  const allSel = openKeys.length > 0 && selCount === openKeys.length;
  const someSel = selCount > 0 && !allSel;
  return (
    <motion.div layout transition={{ layout: { duration: 0.28, ease: "easeOut" } }}
      className="overflow-hidden rounded-xl border"
      style={{
        background: t.surface,
        borderColor: expanded ? t.primaryBorder : t.border,
        boxShadow: expanded ? t.shadowLg : t.shadow,
      }}>
      <div className="group flex w-full items-center gap-4 px-4 py-3.5 text-left">
        {/* Per-PO select all (does not toggle the accordion) */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleAll(po, !allSel); }}
          disabled={openKeys.length === 0}
          aria-label="Select all open lines in this purchase order"
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors disabled:opacity-30"
          style={{
            background: allSel || someSel ? t.primary : t.surface,
            borderColor: allSel || someSel ? t.primary : t.borderStrong,
          }}>
          {allSel && <Check size={12} strokeWidth={3.5} color={t.onPrimary} />}
          {someSel && <span className="h-[2px] w-[9px] rounded-full" style={{ background: t.onPrimary }} />}
        </button>

        <button onClick={onToggle} className="flex flex-1 items-center gap-4 text-left">
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} style={{ color: t.faint }} />
          </motion.div>
          <div className="min-w-[110px]">
            <div className="font-mono text-[13.5px] font-bold" style={{ color: t.text }}>PO-{po.id}</div>
            <div className="text-[10.5px]" style={{ color: t.faint }}>{fmtDate(po.orderDate)}</div>
          </div>
          <div className="hidden min-w-[130px] sm:block">
            <div className="text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: t.faint }}>Delivery</div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: t.text }}>
              <span className="h-1.5 w-1.5 rounded-full"
                style={{ background: days <= 15 ? t.danger : days <= 30 ? t.warn : t.faint }} />
              {fmtDate(po.earliestDelivery)}
              <span className="text-[10px] font-bold" style={{ color: days <= 15 ? t.danger : days <= 30 ? t.warn : t.faint }}>{days}d</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {selCount > 0 && <Pill tone="primary" icon={Check}>{selCount} selected</Pill>}
            {po.priority === "High" && <Pill tone="danger">High</Pill>}
            <Pill tone="neutral">{po.dest}</Pill>
            <Pill tone={ps.tone}>{ps.label}</Pill>
            <div className="ml-1 hidden text-right md:block">
              <div className="font-mono text-[13.5px] font-bold" style={{ color: t.text }}>
                {po.pendingQty.toLocaleString()}<span className="text-[10px] font-medium" style={{ color: t.faint }}> / {po.originalQty.toLocaleString()}</span>
              </div>
              <div className="text-[9.5px]" style={{ color: t.faint }}>{po.itemCount} line item{po.itemCount !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26, ease: "easeOut" }}>
            <div className="border-t px-4 py-3" style={{ borderColor: t.border, background: t.mode === "light" ? "#fbfcfe" : t.inset }}>
              <div className="flex flex-col gap-2">
                {po.lines.map((row, i) => (
                  <motion.div key={row.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22 }}>
                    <LineRow row={row} selected={selectedKeys.includes(row.key)}
                      onToggle={() => onToggleLine(row.key)}
                      commit={commitQty[row.key]} onCommit={(v) => onCommit(row.key, v)} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function POSkeleton() {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[68px] animate-pulse rounded-xl border"
          style={{ background: t.surface, borderColor: t.border, animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

/* Searchable multi-select filter with Select all / Clear inside the dropdown. */
function MultiFilter({ placeholder, width = 150, value, onChange, options }) {
  const t = useT();
  return (
    <Select
      mode="multiple" allowClear showSearch size="small"
      placeholder={placeholder} value={value} onChange={onChange}
      style={{ minWidth: width, maxWidth: 220 }} maxTagCount="responsive" options={options}
      filterOption={(input, opt) => String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase())}
      popupMatchSelectWidth={false}
      dropdownRender={(menu) => (
        <>
          <div className="flex items-center justify-between px-2.5 py-1.5"
            style={{ borderBottom: `1px solid ${t.border}` }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: t.faint }}>{placeholder}</span>
            <div className="flex items-center gap-2.5">
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(options.map((o) => o.value))}
                className="text-[11px] font-bold" style={{ color: t.primary }}>Select all</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange([])}
                className="text-[11px] font-bold" style={{ color: t.danger }}>Clear</button>
            </div>
          </div>
          {menu}
        </>
      )} />
  );
}

/* ================================================================== */
/*  RIGHT — BASKET / STOCK / PLANTS / PREVIEW                          */
/* ================================================================== */

function StatRow({ label, value, tone, first }) {
  const t = useT();
  const color = tone === "success" ? t.success : tone === "warn" ? t.warn : t.text;
  return (
    <div className="flex items-center justify-between py-1.5"
      style={{ borderTop: first ? "none" : `1px solid ${t.border}` }}>
      <span className="text-[11.5px]" style={{ color: t.sub }}>{label}</span>
      <span className="font-mono text-[13px] font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

/* ==================================================================
   DROP-IN UPDATE — replace LineAssignmentCard and PlantAssignment
   in WorkOrderPlanning.jsx with the two components below.

   Also update the React import at the top of the file:
     import React, { useState, useMemo, useEffect, useRef } from "react";
   and add Pencil to the lucide-react import:
     import { ..., Pencil } from "lucide-react";

   Nothing else in the file changes.
   ================================================================== */

/* Card behaviour:
   - Incomplete  → always expanded, split inputs visible, red border.
   - Completed   → auto-collapses into a locked read-only summary:
                   green border, "Planned" pill, plant chips, and an
                   Edit Assignment button. No InputNumbers visible.
   - Edit Assignment (or clicking the header) re-expands with inputs;
     Done collapses it again. If an edit makes it incomplete, it stays
     open until it is fully assigned again.
   - `flash` briefly tints the card green after a batch assign.       */
function LineAssignmentCard({ line, commit, asg, onChange, selected, onToggleSelect, flash }) {
  const t = useT();
  const assigned = sumAsg(asg);
  const remaining = commit - assigned;
  const ok = commit > 0 && remaining === 0;
  const [editing, setEditing] = useState(false);
  const wasOk = useRef(ok);

  /* Auto-collapse the moment assignment reaches 100%. */
  useEffect(() => {
    if (ok && !wasOk.current) setEditing(false);
    wasOk.current = ok;
  }, [ok]);

  const expanded = !ok || editing;
  const parts = Object.entries(asg).filter(([, q2]) => q2 > 0);

  return (
    <motion.div layout id={`asg-card-${line.key}`}
      className="overflow-hidden rounded-lg border transition-colors duration-500"
      style={{
        borderColor: selected ? t.primary : ok ? t.success : t.danger,
        background: flash ? t.successSoft : selected ? t.primarySoft : t.surfaceAlt,
      }}>
      <div className="flex w-full items-center gap-2.5 px-3 py-2.5">
        {/* Batch-select checkbox — feeds the Assign Selected action in the toolbar above. */}
        <button onClick={onToggleSelect} aria-label="Select line for batch assignment"
          className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border transition-colors"
          style={{ background: selected ? t.primary : t.surface, borderColor: selected ? t.primary : t.borderStrong }}>
          {selected && <Check size={11} strokeWidth={3.5} color={t.onPrimary} />}
        </button>
        {/* Completed cards toggle via header; incomplete cards are always open. */}
        <button onClick={() => ok && setEditing((e) => !e)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          style={{ cursor: ok ? "pointer" : "default" }}>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }}><ChevronRight size={13} style={{ color: t.faint }} /></motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11.5px] font-bold" style={{ color: t.text }}>PO-{line.soId} · L{line.lineNo}</span>
              <span className="font-mono text-[11px] font-semibold" style={{ color: t.sub }}>{line.item}</span>
            </div>
            <div className="mt-0.5 truncate font-mono text-[9.5px]" style={{ color: t.faint }}>
              {line.processId}{line.edcNo ? ` · EDC ${line.edcNo}` : ""}{line.direction ? ` · ${line.direction}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[12px] font-bold" style={{ color: t.text }}>{commit.toLocaleString()}</div>
            <div className="text-[8.5px]" style={{ color: t.faint }}>commit</div>
          </div>
          <Pill tone={ok ? "success" : "danger"} icon={ok ? Check : AlertTriangle}>
            {ok ? "Planned" : `${remaining.toLocaleString()} left`}
          </Pill>
        </button>
      </div>

      {/* Collapsed summary — where the qty went, at a glance. Read-only. */}
      {!expanded && (
        <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2" style={{ borderColor: t.border }}>
          {parts.map(([code, q2]) => (
            <Pill key={code} tone="neutral" icon={Factory}>{code} · {q2.toLocaleString()}</Pill>
          ))}
          <button onClick={() => setEditing(true)}
            className="ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold transition-colors"
            style={{ borderColor: t.border, background: t.surface, color: t.sub }}>
            <Pencil size={10} /> Edit Assignment
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="border-t px-3 py-2.5" style={{ borderColor: t.border }}>
              <div className="text-[10.5px]" style={{ color: t.sub }}>
                {line.brand} · {line.sidewall} · <span className="font-mono">{line.description}</span>
              </div>

              <div className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: t.faint }}>
                Plant split
              </div>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {PLANTS.map((plant) => {
                  const code = plant.code;
                  const val = asg[code] || 0;
                  return (
                    <div key={code} className="rounded-lg border p-2" style={{ borderColor: t.border, background: t.surface }}>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold" style={{ color: t.text }}>
                          <Factory size={10} style={{ color: t.faint }} /> {code}
                        </span>
                      </div>
                      <div className="truncate text-[8.5px]" style={{ color: t.faint }}>{plant.name}</div>
                      <InputNumber size="small" min={0} max={commit} controls={false} value={val}
                        onChange={(v) => onChange(code, clamp(v, 0, commit))} className="mt-1 w-full font-mono" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-bold"
                style={{ background: ok ? t.successSoft : t.dangerSoft, color: ok ? t.success : t.danger }}>
                {ok ? <Check size={12} /> : <AlertTriangle size={12} />}
                {assigned.toLocaleString()} / {commit.toLocaleString()} assigned
                {!ok && <span>· assignment incomplete · {remaining.toLocaleString()} remaining</span>}
                {ok && (
                  <button onClick={() => setEditing(false)}
                    className="ml-auto rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: t.success, color: t.mode === "light" ? "#fff" : "#06281a" }}>
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlantAssignment({ lines, committedByKey, lineAlloc, mode, onMode, directPlant, onDirectPlant, onBatchAssign, onChange }) {
  const t = useT();
  const total = lines.reduce((a, l) => a + committedByKey[l.key], 0);

  /* Split-mode batch controls — one search + one selection, applied to the cards below. */
  const [splitSearch, setSplitSearch] = useState("");
  const [picked, setPicked] = useState([]);
  const [batchPlant, setBatchPlant] = useState(null);
  const [flashKeys, setFlashKeys] = useState([]); // brief green tint on freshly assigned cards

  const sq = splitSearch.trim().toLowerCase();
  const splitLines = lines.filter((l) => !sq ||
    [`PO-${l.soId}`, l.soId, `L${l.lineNo}`, l.lineNo, l.processId, l.description, l.item]
      .filter(Boolean).map(String).join(" ").toLowerCase().includes(sq));
  const splitKeys = splitLines.map((l) => l.key);
  const allShownPicked = splitKeys.length > 0 && splitKeys.every((k) => picked.includes(k));
  const someShownPicked = splitKeys.some((k) => picked.includes(k)) && !allShownPicked;
  const pickedShown = picked.filter((k) => splitKeys.includes(k));

  /* Overall progress across ALL selected lines (independent of search). */
  const doneCount = lines.filter((l) => sumAsg(lineAlloc[l.key]) === committedByKey[l.key]).length;
  const allDone = lines.length > 0 && doneCount === lines.length;

  const togglePick = (k) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const toggleSelectAllShown = () =>
    setPicked((p) => (allShownPicked ? p.filter((k) => !splitKeys.includes(k)) : [...new Set([...p, ...splitKeys])]));

  const assignBatch = () => {
    if (pickedShown.length === 0 || !batchPlant) return;
    onBatchAssign(pickedShown, batchPlant);
    message.success(`${pickedShown.length} line item${pickedShown.length !== 1 ? "s" : ""} assigned to ${batchPlant}`);
    /* Flash the assigned cards green for a second, then scroll to the first one. */
    setFlashKeys(pickedShown);
    setTimeout(() => setFlashKeys([]), 1100);
    const firstKey = pickedShown[0];
    setPicked((p) => p.filter((k) => !pickedShown.includes(k)));
    setTimeout(() => {
      document.getElementById(`asg-card-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };
  return (
    <div className="rounded-xl border p-3.5" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
      <SectionLabel right={
        <div className="flex rounded-lg p-0.5" style={{ background: t.inset }}>
          {[["direct", "Direct"], ["combination", "Split"]].map(([m, label]) => (
            <button key={m} onClick={() => onMode(m)}
              className="rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors"
              style={{
                background: mode === m ? t.surface : "transparent",
                color: mode === m ? t.primary : t.faint,
                boxShadow: mode === m ? t.shadow : "none",
              }}>
              {label}
            </button>
          ))}
        </div>
      }>Plant Assignment</SectionLabel>

      {/* Assignment progress — remaining work at a glance. */}
      {lines.length > 0 && (
        <div className="mb-3 rounded-lg border px-3 py-2" style={{ borderColor: t.border, background: t.surfaceAlt }}>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide" style={{ color: t.faint }}>
            <span>Assignment progress</span>
            <span className="font-mono" style={{ color: allDone ? t.success : t.text }}>
              {doneCount} / {lines.length} lines assigned
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: t.inset }}>
            <motion.div className="h-full rounded-full" initial={false}
              animate={{ width: `${Math.round((doneCount / lines.length) * 100)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ background: allDone ? t.success : t.primary }} />
          </div>
        </div>
      )}

      {mode === "direct" ? (
        <>
          <Select value={directPlant} onChange={onDirectPlant} placeholder="Select plant"
            className="w-full" options={PLANTS.map((p) => ({ value: p.code, label: `${p.code} — ${p.name}` }))} />
          {directPlant ? (
            <>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {lines.map((l) => (
                  <div key={l.key} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                    style={{ borderColor: t.border, background: t.surfaceAlt }}>
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-bold" style={{ color: t.text }}>
                        PO-{l.soId} · L{l.lineNo} · {l.processId}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px]" style={{ color: t.sub }} title={l.description}>
                        {l.description}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold" style={{ color: t.text }}>
                      {committedByKey[l.key].toLocaleString()}
                      <Pill tone="primary" icon={Factory}>{directPlant}</Pill>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold"
                style={{ background: t.successSoft, color: t.success }}>
                <Check size={12} /> All {lines.length} line item{lines.length !== 1 ? "s" : ""} → {directPlant} · {total.toLocaleString()} qty
              </div>
            </>
          ) : (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold"
              style={{ background: t.warnSoft, color: t.warn }}>
              <AlertTriangle size={12} /> Select a plant to assign all committed quantities
            </div>
          )}
        </>
      ) : (
        <>
          {/* One search + one selection — filters the cards below and drives Assign Selected. */}
          <Input allowClear size="small" prefix={<Search size={12} style={{ color: t.faint }} />}
            placeholder="Search PO, Process ID, Description, Line No…"
            value={splitSearch} onChange={(e) => setSplitSearch(e.target.value)} className="mb-2" />

          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <button onClick={toggleSelectAllShown} disabled={splitKeys.length === 0}
              className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-bold transition-colors disabled:opacity-40"
              style={{ borderColor: t.border, background: t.surfaceAlt, color: t.sub }}>
              <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border"
                style={{ background: allShownPicked || someShownPicked ? t.primary : t.surface, borderColor: allShownPicked || someShownPicked ? t.primary : t.borderStrong }}>
                {allShownPicked && <Check size={10} strokeWidth={3.5} color={t.onPrimary} />}
                {someShownPicked && <span className="h-[2px] w-[8px] rounded-full" style={{ background: t.onPrimary }} />}
              </span>
              Select all
            </button>
            <span className="text-[10.5px]" style={{ color: t.sub }}>
              <span className="font-mono font-bold" style={{ color: t.text }}>{pickedShown.length}</span> selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Select value={batchPlant} onChange={setBatchPlant} placeholder="Plant" size="small" style={{ minWidth: 150 }}
                options={PLANTS.map((p) => ({ value: p.code, label: `${p.code} — ${p.name}` }))} />
              <button onClick={assignBatch} disabled={pickedShown.length === 0 || !batchPlant}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: t.primary, color: t.onPrimary }}>
                <CheckCheck size={13} /> Assign Selected
              </button>
            </div>
          </div>

          {/* Same list, filtered by the same search — completed cards collapse to summaries. */}
          <div className="flex flex-col gap-2">
            {splitLines.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-center text-[10.5px]"
                style={{ borderColor: t.borderStrong, color: t.faint }}>No line items match your search.</div>
            )}
            {splitLines.map((l) => (
              <LineAssignmentCard key={l.key} line={l} commit={committedByKey[l.key]}
                asg={lineAlloc[l.key] || {}} selected={picked.includes(l.key)}
                flash={flashKeys.includes(l.key)}
                onToggleSelect={() => togglePick(l.key)}
                onChange={(code, v) => onChange(l.key, code, v)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}




function WOCard({ wo, onUndo }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="overflow-hidden rounded-xl border" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
        <motion.div animate={{ rotate: open ? 90 : 0 }}><ChevronRight size={14} style={{ color: t.faint }} /></motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12.5px] font-bold" style={{ color: t.primary }}>{wo.id}</span>
            <Pill tone={wo.committed ? "success" : "primary"}>{wo.committed ? "Committed" : "Draft"}</Pill>
          </div>
          <div className="mt-0.5 truncate text-[11px]" style={{ color: t.sub }}>
            {wo.customer} · {wo.poCount} PO{wo.poCount !== 1 ? "s" : ""} · {wo.sourceLines.length} line{wo.sourceLines.length !== 1 ? "s" : ""} · {wo.createdBy} · {fmtDate(wo.createdAt)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[13.5px] font-bold" style={{ color: t.text }}>{wo.totalOrdered.toLocaleString()}</div>
          <div className="text-[9px]" style={{ color: t.faint }}>committed qty</div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}>
            <div className="border-t px-3.5 py-3" style={{ borderColor: t.border, background: t.surfaceAlt }}>
              <div className="flex flex-col gap-1.5">
                {wo.sourceLines.map((l) => (
                  <div key={l.key} className="rounded-lg border px-2.5 py-2" style={{ borderColor: t.border, background: t.surface }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[10.5px] font-bold" style={{ color: t.text }}>
                        PO-{l.soId} · L{l.lineNo} · {l.item}
                      </span>
                      <span className="font-mono text-[10.5px] font-bold" style={{ color: t.text }}>{l.qty.toLocaleString()}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[9px]" style={{ color: t.faint }}>
                      {l.processId}{l.edcNo ? ` · EDC ${l.edcNo}` : ""}{l.direction ? ` · ${l.direction}` : ""}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {l.plantAssignments.map((a) => (
                        <Pill key={a.plant} tone="neutral" icon={Factory}>{a.plant} · {a.qty.toLocaleString()}</Pill>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
                {[
                  ["Manufacturing qty", wo.manufacturingDeficit, t.warn],
                  ["Committed qty", wo.totalOrdered, t.text],
                ].map(([lab, v, c]) => (
                  <div key={lab} className="rounded-lg border py-1.5" style={{ borderColor: t.border, background: t.surface }}>
                    <div className="font-mono text-[12.5px] font-bold" style={{ color: c }}>{v.toLocaleString()}</div>
                    <div className="text-[8.5px] uppercase tracking-wide" style={{ color: t.faint }}>{lab}</div>
                  </div>
                ))}
              </div>
              {!wo.committed && (
                <button onClick={() => onUndo(wo.id)}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors"
                  style={{ borderColor: t.border, color: t.danger }}>
                  <Undo2 size={12} /> Undo work order
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Grouped PO block inside the review popup — reuses LineRow for lines. */
function BasketPOGroup({ po, rows, onToggleLine, commitQty, onCommit }) {
  const t = useT();
  const [open, setOpen] = useState(true);
  const commitTotal = rows.reduce((a, r) => a + clamp(commitQty[r.key] ?? r.openQty, 0, r.openQty), 0);
  return (
    <div className="overflow-hidden rounded-xl border" style={{ background: t.surface, borderColor: t.border }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left">
        <motion.div animate={{ rotate: open ? 90 : 0 }}><ChevronRight size={14} style={{ color: t.faint }} /></motion.div>
        <span className="font-mono text-[12.5px] font-bold" style={{ color: t.text }}>PO-{po.id}</span>
        <span className="text-[10.5px]" style={{ color: t.faint }}>{fmtDate(po.orderDate)}</span>
        {po.priority === "High" && <Pill tone="danger">High</Pill>}
        <Pill tone="neutral">{po.dest}</Pill>
        <span className="ml-auto text-[10.5px]" style={{ color: t.sub }}>
          {rows.length} line{rows.length !== 1 ? "s" : ""} · commit <span className="font-mono font-bold" style={{ color: t.text }}>{commitTotal.toLocaleString()}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col gap-2 border-t px-3 py-2.5" style={{ borderColor: t.border }}>
              {rows.map((row) => (
                <LineRow key={row.key} row={row} selected
                  onToggle={() => onToggleLine(row.key)}
                  commit={commitQty[row.key]} onCommit={(v) => onCommit(row.key, v)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  MAIN                                                               */
/* ================================================================== */

export default function WorkOrderPlanning() {
  const [mode, setMode] = useState("light");
  const t = THEMES[mode];

  /* -------- business state (logic preserved from original) -------- */
  const [lineItems, setLineItems] = useState(INITIAL_LINE_ITEMS);
  const [workOrders, setWorkOrders] = useState([]);
  const [woSeq, setWoSeq] = useState(1);

  /* -------- UI state -------- */
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expandedPO, setExpandedPO] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [commitQty, setCommitQty] = useState({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [lineAlloc, setLineAlloc] = useState({}); // { [lineKey]: { [plantCode]: qty } }
  const [assignMode, setAssignMode] = useState("direct"); // "direct" | "combination"
  const [directPlant, setDirectPlant] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [lineSearch, setLineSearch] = useState("");         // global search box
  const [filters, setFilters] = useState(EMPTY_FILTERS);    // multi-select filters
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [commitAllOpen, setCommitAllOpen] = useState(false);
  const [flash, setFlash] = useState(null);
  const [switchTarget, setSwitchTarget] = useState(null);
  /* Layout-only state — never touches selection or planning data. */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [poFullscreen, setPoFullscreen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const selectedGroup = groupById(selectedGroupId);

  /* One basket = one customer planning group. Owner is set by the first
     selected line and cleared automatically when the basket becomes empty. */
  const basketGroupId = selectedKeys.length > 0 ? GROUP_BY_PO[LINE_BY_KEY[selectedKeys[0]].soId] : null;
  const basketCustomer = basketGroupId ? groupById(basketGroupId)?.customer : null;

  const setFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  /* -------- customer entries — one per backend group, rendered as-is -------- */
  const customers = useMemo(() => {
    return CUSTOMER_GROUPS.map((g) => {
      const pos = ORDER_HEADERS.filter((h) => g.poIds.includes(h.id));
      const openLines = lineItems.filter((l) => g.poIds.includes(l.soId));
      const pendingQty = openLines.reduce((a, b) => a + b.qty, 0);
      const originalQty = pos.reduce((a, h) => a + ORIGINAL_PO_STATS[h.id].totalQty, 0);
      const openPOIds = new Set(openLines.map((l) => l.soId));
      return {
        groupId: g.groupId, name: g.customer, code: customerCode(g.customer),
        openPOs: openPOIds.size, totalPOs: pos.length,
        pendingQty, pendingItems: openLines.length,
        urgent: openLines.some((l) => daysFromNow(l.deliveryDate) <= 15),
        high: pos.some((h) => h.priority === "High" && openPOIds.has(h.id)),
        progress: originalQty ? (originalQty - pendingQty) / originalQty : 1,
      };
    });
  }, [lineItems]);

  const visibleCustomers = customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  /* -------- POs of the selected group only (no grouping — one card per PO) -------- */
  const poRows = useMemo(() => {
    if (!selectedGroup) return [];
    return ORDER_HEADERS.filter((h) => selectedGroup.poIds.includes(h.id)).map((h) => {
      const orig = ORIGINAL_PO_STATS[h.id];
      const original = INITIAL_LINE_ITEMS.filter((l) => l.soId === h.id);
      const lines = original.map((ol) => {
        const live = lineItems.find((l) => l.key === ol.key);
        const openQty = live ? live.qty : 0;
        const status = openQty === 0 ? "planned" : openQty === ol.qty ? "open" : "partial";
        return { ...ol, openQty, status };
      });
      const pendingQty = lines.reduce((a, l) => a + l.openQty, 0);
      const status = pendingQty === 0 ? "planned" : pendingQty === orig.totalQty ? "open" : "partial";
      const earliestDelivery = original.reduce((m, l) => (l.deliveryDate < m ? l.deliveryDate : m), original[0].deliveryDate);
      return {
        ...h, orderDate: addDays(h.orderDateOffset), lines,
        originalQty: orig.totalQty, itemCount: orig.itemCount,
        pendingQty, status, earliestDelivery,
      };
    });
  }, [selectedGroup, lineItems]);

  /* -------- filter option lists — built from the selected group's live lines -------- */
  const filterOptions = useMemo(() => {
    const rows = poRows.flatMap((po) => po.lines);
    const uniq = (arr) => [...new Set(arr.filter((v) => v != null && v !== ""))];
    const opt = (arr) => uniq(arr).sort().map((v) => ({ value: v, label: String(v) }));
    return {
      po: uniq(rows.map((l) => l.soId)).sort().map((v) => ({ value: v, label: `PO-${v}` })),
      processId: opt(rows.map((l) => l.processId)),
      assembly: opt(rows.filter((l) => l.type === "ASSEMBLY").map((l) => l.processId)),
      brand: opt(rows.map((l) => l.brand)),
      size: opt(rows.map((l) => l.item)),
      sidewall: opt(rows.map((l) => l.sidewall)),
      type: opt(rows.map((l) => l.type)),
      priority: opt(rows.map((l) => l.priority)),
      status: [
        { value: "open", label: "Open" },
        { value: "partial", label: "Partial" },
        { value: "planned", label: "Planned" },
      ],
    };
  }, [poRows]);

  /* -------- combined search + filter pipeline (display only, selection is preserved) -------- */
  const q = lineSearch.trim().toLowerCase();
  const filtersActive = q !== "" || Object.values(filters).some((a) => a.length > 0);

  const lineMatchesSearch = (l) =>
    !q ||
    [`PO-${l.soId}`, l.soId, l.processId, l.edcNo, l.description, l.item, l.brand, l.sidewall, l.type, l.direction, l.customer]
      .filter(Boolean).map(String).join(" ").toLowerCase().includes(q);

  const inSet = (arr, val) => arr.length === 0 || arr.includes(val);
  const lineFiltered = (l) =>
    lineMatchesSearch(l) &&
    inSet(filters.po, l.soId) &&
    inSet(filters.processId, l.processId) &&
    (filters.assembly.length === 0 || filters.assembly.includes(l.processId)) &&
    inSet(filters.brand, l.brand) &&
    inSet(filters.size, l.item) &&
    inSet(filters.sidewall, l.sidewall) &&
    inSet(filters.type, l.type) &&
    inSet(filters.priority, l.priority) &&
    inSet(filters.status, l.status);

  const shownPOs = useMemo(() => {
    return poRows
      .map((po) => ({ ...po, lines: po.lines.filter(lineFiltered) }))
      .filter((po) => po.lines.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poRows, q, filters]);

  /* Open line keys currently visible after search + filters. */
  const visibleOpenKeys = useMemo(
    () => shownPOs.flatMap((po) => po.lines.filter((l) => l.openQty > 0).map((l) => l.key)),
    [shownPOs]
  );
  const visibleSelectedCount = visibleOpenKeys.filter((k) => selectedKeys.includes(k)).length;
  const allVisibleSelected = visibleOpenKeys.length > 0 && visibleSelectedCount === visibleOpenKeys.length;

  /* -------- selection draft — full commit qty goes to manufacturing -------- */
  const draft = useMemo(() => {
    const picked = lineItems.filter((l) => selectedKeys.includes(l.key));
    const committedByKey = {};
    picked.forEach((l) => (committedByKey[l.key] = clamp(commitQty[l.key] ?? l.qty, 0, l.qty)));
    const active = picked.filter((l) => committedByKey[l.key] > 0);
    const totalCommit = active.reduce((a, l) => a + committedByKey[l.key], 0);
    const selectedQty = picked.reduce((a, l) => a + l.qty, 0);
    return {
      picked, active, committedByKey, totalCommit, selectedQty,
      remaining: selectedQty - totalCommit, deficit: totalCommit,
      pos: [...new Set(active.map((l) => l.soId))],
    };
  }, [selectedKeys, commitQty, lineItems]);

  /* Keeps the assignment map in sync with the selection.                  */
  /* Direct mode: every line gets 100% of its commit qty on the selected   */
  /* plant. Combination mode: lines start at 0 and the planner enters the  */
  /* split manually; typed values are preserved. No capacity checks.       */
  const draftSig = draft.active.map((l) => `${l.key}:${draft.committedByKey[l.key]}`).join("|");
  useEffect(() => {
    if (!reviewOpen) return;
    setLineAlloc((prev) => {
      const next = {};
      draft.active.forEach((l) => {
        next[l.key] = assignMode === "direct" && directPlant
          ? { [directPlant]: draft.committedByKey[l.key] }
          : prev[l.key] || {};
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftSig, reviewOpen, assignMode, directPlant]);

  /* Split-mode batch assign: give each chosen line 100% of its commit qty on one     */
  /* plant (zeroing its other plants). Only the passed keys change; the rest untouched. */
  const batchAssignSplit = (keys, plant) => {
    setLineAlloc((prev) => {
      const next = { ...prev };
      keys.forEach((k) => { next[k] = { [plant]: draft.committedByKey[k] }; });
      return next;
    });
  };

  /* Basket grouped by PO for the review popup — rows shaped for LineRow reuse. */
  const basketPOGroups = useMemo(() => {
    const map = {};
    draft.picked.forEach((l) => {
      (map[l.soId] = map[l.soId] || []).push({
        ...l, openQty: l.qty,
        status: l.qty === LINE_BY_KEY[l.key].qty ? "open" : "partial",
      });
    });
    return Object.entries(map).map(([soId, rows]) => {
      const header = ORDER_HEADERS.find((h) => h.id === Number(soId));
      return { po: { ...header, orderDate: addDays(header.orderDateOffset) }, rows };
    });
  }, [draft.picked]);

  /* Aggregated draft totals per plant (preview chips, WO allocations). */
  const draftPlantTotals = useMemo(() => {
    const m = {};
    PLANTS.forEach((p) => (m[p.code] = 0));
    draft.active.forEach((l) => {
      Object.entries(lineAlloc[l.key] || {}).forEach(([c, q2]) => (m[c] += q2 || 0));
    });
    return m;
  }, [draft.active, lineAlloc]);

  const setAssignQty = (key, code, v) =>
    setLineAlloc((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [code]: Math.max(0, v || 0) } }));

  /* Every selected line must be fully assigned: assigned qty === commit qty, per line. */
  const allAssigned = draft.active.length > 0 &&
    draft.active.every((l) => sumAsg(lineAlloc[l.key]) === draft.committedByKey[l.key]);

  /* -------- actions -------- */
  const clearFilters = () => { setLineSearch(""); setFilters(EMPTY_FILTERS); };

  const doSwitchGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setExpandedPO(null);
    clearFilters();
    setSidebarOpen(false); // collapse customer list to give POs more room
    setLoadingPOs(true);
    setTimeout(() => setLoadingPOs(false), 380);
  };

  const pickGroup = (groupId) => {
    if (groupId === selectedGroupId) return;
    /* Basket belongs to another planning group — confirm before switching. */
    if (basketGroupId && basketGroupId !== groupId) { setSwitchTarget(groupId); return; }
    doSwitchGroup(groupId);
  };

  const confirmSwitch = () => {
    const groupId = switchTarget;
    setSwitchTarget(null);
    clearSelection();
    doSwitchGroup(groupId);
  };

  const toggleLine = (key) => {
    const line = LINE_BY_KEY[key];
    /* Reject lines that belong to a different planning group than the basket owner. */
    if (!selectedKeys.includes(key) && basketGroupId && GROUP_BY_PO[line.soId] !== basketGroupId) {
      message.error(`Selection basket belongs to ${basketCustomer}. A work order can contain only one customer.`);
      return;
    }
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  /* Select all open lines of a single PO (used by the per-PO header checkbox). */
  const toggleAllInPO = (po, select) => {
    const openKeys = po.lines.filter((l) => l.openQty > 0).map((l) => l.key);
    if (select) {
      if (basketGroupId && GROUP_BY_PO[po.id] !== basketGroupId) {
        message.error(`Selection basket belongs to ${basketCustomer}. A work order can contain only one customer.`);
        return;
      }
      setSelectedKeys((prev) => [...new Set([...prev, ...openKeys])]);
    } else {
      setSelectedKeys((prev) => prev.filter((k) => !openKeys.includes(k)));
    }
  };

  /* Select / deselect every open line currently visible after search + filters. */
  const selectAllVisible = () => {
    if (visibleOpenKeys.length === 0) return;
    if (basketGroupId && basketGroupId !== selectedGroupId) {
      message.error(`Selection basket belongs to ${basketCustomer}. A work order can contain only one customer.`);
      return;
    }
    setSelectedKeys((prev) => [...new Set([...prev, ...visibleOpenKeys])]);
  };
  const deselectVisible = () => setSelectedKeys((prev) => prev.filter((k) => !visibleOpenKeys.includes(k)));

  const clearSelection = () => { setSelectedKeys([]); setCommitQty({}); setLineAlloc({}); setReviewOpen(false); };

  /* Export currently selected line items to CSV (client-side download). */
  const exportSelected = () => {
    if (selectedKeys.length === 0) { message.warning("No rows selected to export"); return; }
    const rows = lineItems.filter((l) => selectedKeys.includes(l.key));
    const headers = ["PO", "Line", "ProcessID", "AssemblyID", "EDCNo", "Type", "Item", "Brand", "Sidewall", "Direction", "Qty", "DeliveryDate", "Customer", "Priority", "Status"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(",")]
      .concat(rows.map((l) => [
        `PO-${l.soId}`, l.lineNo, l.processId, l.type === "ASSEMBLY" ? l.processId : "",
        l.edcNo, l.type, l.item, l.brand, l.sidewall, l.direction, l.qty,
        fmtDate(l.deliveryDate), l.customer, l.priority,
        l.qty === LINE_BY_KEY[l.key].qty ? "Open" : "Partial",
      ].map(esc).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `selected-orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    message.success(`Exported ${rows.length} line item${rows.length !== 1 ? "s" : ""}`);
  };

  const generateWO = () => {
    if (draft.active.length === 0) { message.warning("Enter a commit quantity greater than 0 for at least one line"); return; }
    if (new Set(draft.active.map((l) => GROUP_BY_PO[l.soId])).size > 1) {
      message.error("A work order can contain only one customer");
      return;
    }
    if (!allAssigned) { message.warning("Every selected line item must be fully assigned to plants"); return; }
    const first = draft.active[0];
    const wo = {
      id: `WO-${String(woSeq).padStart(3, "0")}`,
      customer: first.customer, dest: first.dest,
      totalOrdered: draft.totalCommit,
      manufacturingDeficit: draft.deficit,
      /* Per-line traceability: each line carries its own plant assignments. */
      sourceLines: draft.active.map((l) => ({
        key: l.key, soId: l.soId, lineNo: l.lineNo,
        processId: l.processId, edcNo: l.edcNo, direction: l.direction, item: l.item,
        qty: draft.committedByKey[l.key],
        plantAssignments: Object.entries(lineAlloc[l.key] || {})
          .filter(([, q2]) => q2 > 0)
          .map(([plant, qty]) => ({ plant, qty })),
      })),
      allocations: { ...draftPlantTotals },
      poCount: draft.pos.length,
      committed: false, createdBy: "kaju", createdAt: new Date(),
    };

    /* Reduce committed lines; remainder stays open on the PO. */
    setLineItems((prev) =>
      prev.map((l) => {
        if (!(l.key in draft.committedByKey) || draft.committedByKey[l.key] === 0) return l;
        const remaining = l.qty - draft.committedByKey[l.key];
        return remaining > 0 ? { ...l, qty: remaining } : null;
      }).filter(Boolean)
    );
    setWorkOrders((prev) => [wo, ...prev]);
    setWoSeq((n) => n + 1);
    clearSelection();
    setFlash(wo.id);
    setTimeout(() => setFlash(null), 1700);
  };

  /* Undo: return committed quantities to their POs. */
  const undoWO = (woId) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo || wo.committed) return;
    setLineItems((prev) => {
      let next = [...prev];
      wo.sourceLines.forEach((l) => {
        const idx = next.findIndex((li) => li.key === l.key);
        if (idx >= 0) next = next.map((li, i) => (i === idx ? { ...li, qty: li.qty + l.qty } : li));
        else if (LINE_BY_KEY[l.key]) next = [...next, { ...LINE_BY_KEY[l.key], qty: l.qty }];
      });
      return next;
    });
    setWorkOrders((prev) => prev.filter((w) => w.id !== woId));
    message.info(`${woId} undone · quantities returned to purchase orders`);
  };

  const draftCount = workOrders.filter((w) => !w.committed).length;
  const commitAll = () => {
    setWorkOrders((prev) => prev.map((w) => ({ ...w, committed: true })));
    setCommitAllOpen(false);
    message.success("Plan committed · work orders and PO statuses locked");
  };

  const hasSelection = selectedKeys.length > 0;

  /* ================================================================ */

  return (
    <ThemeCtx.Provider value={t}>
      <ConfigProvider theme={{
        algorithm: mode === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: t.primary, colorBgContainer: t.surface, colorBgElevated: t.surface,
          colorBorder: t.borderStrong, colorText: t.text, colorTextSecondary: t.sub,
          borderRadius: 8, fontFamily: "'Instrument Sans', sans-serif",
        },
      }}>
        <div className="flex h-screen w-full flex-col overflow-hidden"
          style={{ background: `${t.haze}, ${t.bg}`, fontFamily: "'Instrument Sans', sans-serif", color: t.text }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
            .font-mono { font-family: 'IBM Plex Mono', monospace !important; }
            .scroll-y { overflow-y: auto; scrollbar-width: thin; }
            .scroll-y::-webkit-scrollbar { width: 6px; }
            .scroll-y::-webkit-scrollbar-track { background: transparent; }
            .scroll-y::-webkit-scrollbar-thumb { background: ${t.borderStrong}; border-radius: 999px; }
            .ant-input-number-input { font-family: 'IBM Plex Mono', monospace !important; font-weight: 600; }
          `}</style>

          {/* ---------- STICKY HEADER ---------- */}
          <header className="z-20 flex shrink-0 items-center justify-between border-b px-5 py-3"
            style={{ borderColor: t.border, background: t.surface, boxShadow: t.shadow }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: t.primary }}>
                <Layers size={18} color={t.onPrimary} />
              </div>
              <div>
                <h1 className="text-[15.5px] font-bold leading-tight tracking-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}>Order Fulfillment</h1>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: t.faint }}>
                  <span className={selectedGroup ? "" : "font-bold"} style={{ color: selectedGroup ? t.faint : t.primary }}>Customers</span>
                  {selectedGroup && (<><ChevronRight size={11} /><span className="font-bold" style={{ color: t.primary }}>{selectedGroup.customer}</span></>)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {draftCount > 0 && <Pill tone="warn" icon={ClipboardList}>{draftCount} draft WO{draftCount !== 1 ? "s" : ""}</Pill>}
              <button onClick={() => setSidebarOpen((o) => !o)}
                className="flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-colors"
                style={{
                  borderColor: sidebarOpen ? t.primaryBorder : t.border,
                  background: sidebarOpen ? t.primarySoft : t.surfaceAlt,
                  color: sidebarOpen ? t.primary : t.sub,
                }}
                aria-label="Toggle customer list">
                <Users size={14} /> Customers
              </button>
              <button onClick={() => setMode(mode === "light" ? "dark" : "light")}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                style={{ borderColor: t.border, background: t.surfaceAlt, color: t.sub }}
                aria-label="Toggle theme">
                {mode === "light" ? <Moon size={15} /> : <Sun size={15} />}
              </button>
            </div>
          </header>

          {/* ---------- BODY ---------- */}
          <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
            <div className={`grid h-full min-h-0 grid-cols-1 gap-4 p-4 ${
              poFullscreen
                ? "lg:grid-cols-[minmax(0,1fr)]"
                : sidebarOpen
                  ? "lg:grid-cols-[290px_minmax(0,1fr)_370px]"
                  : "lg:grid-cols-[minmax(0,1fr)_370px]"
            }`}>

              {/* LEFT — Customers (collapsible, hidden in PO full screen) */}
              <AnimatePresence initial={false}>
              {sidebarOpen && !poFullscreen && (
              <motion.aside key="customer-panel" className="flex min-h-0 flex-col"
                initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                <SectionLabel>Customers · {visibleCustomers.length}</SectionLabel>
                <Input allowClear size="middle" prefix={<Search size={13} style={{ color: t.faint }} />}
                  placeholder="Search customers" value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)} className="mb-3 shrink-0" />
                <div className="scroll-y flex min-h-0 flex-1 flex-col gap-2.5 pr-1">
                  {visibleCustomers.map((c, i) => (
                    <motion.div key={c.groupId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.045, duration: 0.28 }}>
                      <CustomerCard c={c} active={selectedGroupId === c.groupId} onClick={() => pickGroup(c.groupId)} />
                    </motion.div>
                  ))}
                </div>
              </motion.aside>
              )}
              </AnimatePresence>

              {/* CENTER — Purchase Orders */}
              <main className="flex min-h-0 flex-col">
                {!selectedGroup ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center"
                    style={{ borderColor: t.borderStrong, color: t.faint }}>
                    <Boxes size={34} strokeWidth={1.5} />
                    <div className="text-[14px] font-bold" style={{ color: t.sub }}>Pick a customer to start planning</div>
                    <div className="max-w-[300px] text-[12px]">Open a customer, expand their purchase orders and select line items to build a work order.</div>
                  </div>
                ) : (
                  <>
                    {/* Global search — matches PO, Process ID, Assembly, EDC, Description, Size, Brand, Sidewall, Customer */}
                    <Input allowClear size="middle" className="mb-2.5 shrink-0"
                      prefix={<Search size={14} style={{ color: t.faint }} />}
                      placeholder="Search PO, Process ID, Assembly, EDC No, Description, Size, Brand, Sidewall, Customer…"
                      value={lineSearch} onChange={(e) => setLineSearch(e.target.value)} />

                    {/* Multi-select filter bar */}
                    <div className="mb-2.5 flex shrink-0 flex-wrap items-center gap-2">
                      <MultiFilter placeholder="PO" width={110} value={filters.po}
                        onChange={(v) => setFilter("po", v)} options={filterOptions.po} />
                      <MultiFilter placeholder="Process ID" value={filters.processId}
                        onChange={(v) => setFilter("processId", v)} options={filterOptions.processId} />
                      <MultiFilter placeholder="Assembly" value={filters.assembly}
                        onChange={(v) => setFilter("assembly", v)} options={filterOptions.assembly} />
                      <MultiFilter placeholder="Brand" width={120} value={filters.brand}
                        onChange={(v) => setFilter("brand", v)} options={filterOptions.brand} />
                      <MultiFilter placeholder="Tyre Size" value={filters.size}
                        onChange={(v) => setFilter("size", v)} options={filterOptions.size} />
                      <MultiFilter placeholder="Sidewall" width={120} value={filters.sidewall}
                        onChange={(v) => setFilter("sidewall", v)} options={filterOptions.sidewall} />
                      <MultiFilter placeholder="Order Type" width={120} value={filters.type}
                        onChange={(v) => setFilter("type", v)} options={filterOptions.type} />
                      <MultiFilter placeholder="Priority" width={110} value={filters.priority}
                        onChange={(v) => setFilter("priority", v)} options={filterOptions.priority} />
                      <MultiFilter placeholder="Status" width={120} value={filters.status}
                        onChange={(v) => setFilter("status", v)} options={filterOptions.status} />
                      {filtersActive && (
                        <button onClick={clearFilters}
                          className="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-bold transition-colors"
                          style={{ borderColor: t.border, background: t.surfaceAlt, color: t.danger }}>
                          <FilterX size={11} /> Clear filters
                        </button>
                      )}
                    </div>

                    {/* Toolbar — selection actions + live selection stats */}
                    <div className="mb-3 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2"
                      style={{ borderColor: t.border, background: t.surface, boxShadow: t.shadow }}>
                      <SectionLabel>Purchase Orders · {shownPOs.length}</SectionLabel>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button onClick={selectAllVisible} disabled={visibleOpenKeys.length === 0 || allVisibleSelected}
                          className="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-bold transition-colors disabled:opacity-40"
                          style={{ borderColor: t.primaryBorder, background: t.primarySoft, color: t.primary }}>
                          <CheckCheck size={11} /> Select all visible
                        </button>
                        <button onClick={deselectVisible} disabled={visibleSelectedCount === 0}
                          className="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-bold transition-colors disabled:opacity-40"
                          style={{ borderColor: t.border, background: t.surfaceAlt, color: t.sub }}>
                          <XSquare size={11} /> Unselect visible
                        </button>
                        <button onClick={exportSelected} disabled={!hasSelection}
                          className="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-bold transition-colors disabled:opacity-40"
                          style={{ borderColor: t.border, background: t.surfaceAlt, color: t.sub }}>
                          <Download size={11} /> Export selected
                        </button>
                      </div>

                      {/* Live selection stats — preserved across search & filters */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px]" style={{ color: t.sub }}>
                        <span className="inline-flex items-center gap-1">
                          <CircleDot size={11} style={{ color: hasSelection ? t.primary : t.faint }} />
                          Selected rows <span className="font-mono font-bold" style={{ color: t.text }}>{selectedKeys.length}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          Selected qty <span className="font-mono font-bold" style={{ color: t.text }}>{draft.selectedQty.toLocaleString()}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          Visible rows <span className="font-mono font-bold" style={{ color: t.text }}>{visibleOpenKeys.length}</span>
                        </span>
                      </div>

                      <div className="ml-auto flex flex-wrap items-center gap-1.5">
                        <button onClick={() => setSummaryOpen(true)}
                          className="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-bold transition-colors"
                          style={{ borderColor: t.border, background: t.surfaceAlt, color: t.sub }}>
                          <BarChart3 size={11} /> Order Summary
                        </button>
                        <button onClick={() => setPoFullscreen((f) => !f)}
                          className="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10.5px] font-bold transition-colors"
                          style={{
                            borderColor: poFullscreen ? t.primaryBorder : t.border,
                            background: poFullscreen ? t.primarySoft : t.surfaceAlt,
                            color: poFullscreen ? t.primary : t.sub,
                          }}>
                          {poFullscreen ? <><Minimize2 size={11} /> Exit full screen</> : <><Maximize2 size={11} /> Full screen</>}
                        </button>
                        <button onClick={() => setReviewOpen(true)} disabled={!hasSelection}
                          className="flex h-6 items-center gap-1.5 rounded-md px-2.5 text-[10.5px] font-bold transition-opacity disabled:opacity-40"
                          style={{ background: t.primary, color: t.onPrimary }}>
                          Continue with selected <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="scroll-y min-h-0 flex-1 pr-1">
                      {loadingPOs ? <POSkeleton /> : (
                        <div className="flex flex-col gap-3 pb-4">
                          {shownPOs.length === 0 && (
                            <div className="rounded-xl border border-dashed p-8 text-center text-[12px]"
                              style={{ borderColor: t.borderStrong, color: t.faint }}>
                              {filtersActive ? "No line items match your search or filters." : "No purchase orders match the current filters."}
                            </div>
                          )}
                          {shownPOs.map((po, i) => (
                            <motion.div key={po.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.26 }}>
                              {/* While searching/filtering, matching POs auto-expand showing only matching lines */}
                              <POCard po={po} expanded={filtersActive ? true : expandedPO === po.id}
                                onToggle={() => setExpandedPO(expandedPO === po.id ? null : po.id)}
                                selectedKeys={selectedKeys} onToggleLine={toggleLine}
                                onToggleAll={toggleAllInPO}
                                commitQty={commitQty}
                                onCommit={(key, v) => setCommitQty((p) => ({ ...p, [key]: v }))} />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </main>

              {/* RIGHT — Selection basket (sticky column, hidden in PO full screen) */}
              <AnimatePresence initial={false}>
              {!poFullscreen && (
              <motion.aside key="planning-panel" className="scroll-y flex min-h-0 flex-col gap-3 pr-1"
                initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                {/* Summary */}
                <div className="rounded-xl border p-4" style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadow }}>
                  <SectionLabel right={hasSelection && (
                    <button onClick={clearSelection} className="text-[10.5px] font-bold" style={{ color: t.danger }}>Clear</button>
                  )}>Selection Basket</SectionLabel>

                  {!hasSelection ? (
                    <div className="flex flex-col items-center gap-2 py-5 text-center" style={{ color: t.faint }}>
                      <Package size={26} strokeWidth={1.5} />
                      <span className="text-[11.5px]">Select line items from one or more purchase orders. The selection stays while you browse other POs, search, or filter.</span>
                    </div>
                  ) : (
                    <>
                      {/* Basket owner — one basket = one customer */}
                      <div className="mb-2.5 flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: t.primarySoft, border: `1px solid ${t.primaryBorder}` }}>
                        <div>
                          <div className="text-[8.5px] font-bold uppercase tracking-[0.08em]" style={{ color: t.faint }}>Customer</div>
                          <div className="text-[12.5px] font-bold" style={{ color: t.text }}>{basketCustomer}</div>
                        </div>
                        <Pill tone="primary" icon={ShieldCheck}>Locked</Pill>
                      </div>
                      <div className="mb-2.5 grid grid-cols-2 gap-2">
                        {[
                          ["POs", draft.pos.length], ["Line Items", draft.active.length],
                        ].map(([lab, v]) => (
                          <div key={lab} className="rounded-lg py-2 text-center" style={{ background: t.surfaceAlt }}>
                            <div className="font-mono text-[16px] font-bold">{v}</div>
                            <div className="text-[9px] uppercase tracking-wide" style={{ color: t.faint }}>{lab}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <StatRow first label="Selected qty" value={draft.selectedQty.toLocaleString()} />
                        <StatRow label="Commit qty" value={draft.totalCommit.toLocaleString()} />
                        <StatRow label="Stays on POs" value={draft.remaining.toLocaleString()} tone={draft.remaining > 0 ? "warn" : undefined} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {draft.pos.map((id) => (
                          <span key={id} className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                            style={{ background: t.inset, color: t.sub }}>PO-{id}</span>
                        ))}
                      </div>
                      <motion.button whileTap={{ scale: 0.98 }} onClick={() => setReviewOpen(true)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12.5px] font-bold"
                        style={{ background: t.primary, color: t.onPrimary, boxShadow: t.shadow }}>
                        <Eye size={14} /> View &amp; Review
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Work order list */}
                {workOrders.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <SectionLabel right={draftCount > 0 && (
                      <button onClick={() => setCommitAllOpen(true)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold"
                        style={{ background: t.successSoft, color: t.success }}>
                        <Check size={11} /> Commit {draftCount} draft{draftCount !== 1 ? "s" : ""}
                      </button>
                    )}>Work Orders · {workOrders.length}</SectionLabel>
                    <AnimatePresence>
                      {workOrders.map((wo) => <WOCard key={wo.id} wo={wo} onUndo={undoWO} />)}
                    </AnimatePresence>
                  </div>
                )}
              </motion.aside>
              )}
              </AnimatePresence>
            </div>
          </div>

          {/* ---------- STICKY ACTION BAR ---------- */}
          <footer className="z-20 flex shrink-0 items-center justify-between border-t px-5 py-2.5"
            style={{ borderColor: t.border, background: t.surface }}>
            <div className="flex items-center gap-4 text-[11.5px]" style={{ color: t.sub }}>
              <span className="inline-flex items-center gap-1.5">
                <CircleDot size={12} style={{ color: hasSelection ? t.primary : t.faint }} />
                <span className="font-mono font-bold" style={{ color: t.text }}>{selectedKeys.length}</span> selected
              </span>
              <span className="hidden sm:inline">Selected qty <span className="font-mono font-bold" style={{ color: t.text }}>{draft.selectedQty.toLocaleString()}</span></span>
              <span className="hidden sm:inline">Commit <span className="font-mono font-bold" style={{ color: t.text }}>{draft.totalCommit.toLocaleString()}</span></span>
              <span className="hidden md:inline-flex items-center gap-1">
                <Factory size={12} style={{ color: t.warn }} />
                <span className="font-mono font-bold" style={{ color: t.warn }}>{draft.deficit.toLocaleString()}</span> to manufacture
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearSelection} disabled={!hasSelection}
                className="rounded-lg border px-3 py-1.5 text-[11.5px] font-bold transition-opacity disabled:opacity-40"
                style={{ borderColor: t.border, color: t.sub }}>Clear</button>
              <button onClick={() => setReviewOpen(true)} disabled={!hasSelection}
                className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[11.5px] font-bold transition-opacity disabled:opacity-40"
                style={{ background: t.primary, color: t.onPrimary }}>
                <Eye size={13} /> Review &amp; Generate
              </button>
            </div>
          </footer>

          {/* ---------- SUCCESS FLASH ---------- */}
          <AnimatePresence>
            {flash && (
              <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: mode === "light" ? "rgba(21,27,40,0.25)" : "rgba(0,0,0,0.45)" }}>
                <motion.div initial={{ scale: 0.85, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="flex flex-col items-center gap-3 rounded-2xl border px-10 py-8"
                  style={{ background: t.surface, borderColor: t.border, boxShadow: t.shadowLg }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: t.successSoft }}>
                    <Check size={28} strokeWidth={3} style={{ color: t.success }} />
                  </motion.div>
                  <div className="text-center">
                    <div className="font-mono text-[16px] font-bold" style={{ color: t.text }}>{flash} created</div>
                    <div className="mt-0.5 text-[11.5px]" style={{ color: t.sub }}>PO quantities and plant assignments updated</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- WORK ORDER REVIEW POPUP ---------- */}
          <Modal open={reviewOpen && hasSelection} onCancel={() => setReviewOpen(false)}
            width="90%" centered style={{ maxWidth: 1400 }}
            styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingRight: 6 } }}
            title={
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span style={{ fontFamily: "'Sora', sans-serif" }}>Work Order Review</span>
                <span className="text-[12px] font-medium" style={{ color: t.sub }}>
                  {basketCustomer} · {draft.pos.length} PO{draft.pos.length !== 1 ? "s" : ""} · {draft.active.length} line{draft.active.length !== 1 ? "s" : ""} · commit {draft.totalCommit.toLocaleString()}
                </span>
              </div>
            }
            footer={
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setReviewOpen(false)}
                  className="rounded-lg border px-3.5 py-1.5 text-[12px] font-bold"
                  style={{ borderColor: t.border, color: t.sub }}>Cancel</button>
                <button onClick={generateWO} disabled={!allAssigned}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ background: t.success, color: mode === "light" ? "#fff" : "#06281a" }}>
                  <ShieldCheck size={13} /> Move To PI
                </button>
                {/* <button onClick={generateWO} disabled={!allAssigned}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ background: t.success, color: mode === "light" ? "#fff" : "#06281a" }}>
                  <ShieldCheck size={13} /> Generate Work Order
                </button> */}
              </div>
            }>
            {/* Section 1 — summary */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                ["Customer", basketCustomer], ["POs", draft.pos.length], ["Line Items", draft.active.length],
                ["Selected Qty", draft.selectedQty.toLocaleString()],
                ["Commit Qty", draft.totalCommit.toLocaleString()],
                ["Stays on POs", draft.remaining.toLocaleString()],
              ].map(([lab, v]) => (
                <div key={lab} className="rounded-lg px-2 py-2 text-center" style={{ background: t.surfaceAlt }}>
                  <div className="truncate font-mono text-[13px] font-bold" style={{ color: t.text }}>{v}</div>
                  <div className="text-[8.5px] uppercase tracking-wide" style={{ color: t.faint }}>{lab}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {/* Section 2 — selected POs grouped, expandable, commit qty editable */}
              <div>
                <SectionLabel>Selected Purchase Orders · {basketPOGroups.length}</SectionLabel>
                <div className="flex flex-col gap-2.5">
                  {basketPOGroups.map(({ po, rows }) => (
                    <BasketPOGroup key={po.id} po={po} rows={rows}
                      onToggleLine={toggleLine} commitQty={commitQty}
                      onCommit={(key, v) => setCommitQty((p) => ({ ...p, [key]: v }))} />
                  ))}
                </div>
              </div>

              {/* Sections 3 & 4 — existing plant assignment + preview */}
              <div className="flex flex-col gap-3">
                <PlantAssignment lines={draft.active} committedByKey={draft.committedByKey}
                  lineAlloc={lineAlloc} mode={assignMode} onMode={setAssignMode}
                  directPlant={directPlant} onDirectPlant={setDirectPlant}
                  onBatchAssign={batchAssignSplit}
                  onChange={setAssignQty} />

                <div className="rounded-xl border p-4"
                  style={{ background: t.surface, borderColor: t.primaryBorder, boxShadow: t.shadow }}>
                  <SectionLabel>Work Order Preview</SectionLabel>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[15px] font-bold" style={{ color: t.primary }}>
                        WO-{String(woSeq).padStart(3, "0")}
                      </div>
                      <div className="text-[11px]" style={{ color: t.sub }}>
                        {basketCustomer} · {draft.pos.length} PO{draft.pos.length !== 1 ? "s" : ""} · {draft.active.length} line{draft.active.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[17px] font-bold">{draft.totalCommit.toLocaleString()}</div>
                      <div className="text-[9px]" style={{ color: t.faint }}>commit qty</div>
                    </div>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
                    {[
                      ["To manufacture", draft.deficit.toLocaleString(), t.warn],
                      ["Plants used", PLANTS.filter((p) => (draftPlantTotals[p.code] || 0) > 0).length, t.sub],
                    ].map(([lab, v, c]) => (
                      <div key={lab} className="rounded-lg py-1.5" style={{ background: t.surfaceAlt }}>
                        <div className="font-mono text-[12.5px] font-bold" style={{ color: c }}>{v}</div>
                        <div className="text-[8.5px] uppercase tracking-wide" style={{ color: t.faint }}>{lab}</div>
                      </div>
                    ))}
                  </div>
                  {draft.deficit > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {PLANTS.filter((p) => (draftPlantTotals[p.code] || 0) > 0).map((p) => (
                        <Pill key={p.code} tone="neutral" icon={Factory}>{p.code} · {(draftPlantTotals[p.code] || 0).toLocaleString()}</Pill>
                      ))}
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold"
                    style={{ background: allAssigned ? t.successSoft : t.dangerSoft, color: allAssigned ? t.success : t.danger }}>
                    {allAssigned ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                    {allAssigned ? "All line items fully assigned · ready to generate" : "Some line items are not fully assigned to plants"}
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          {/* ---------- ORDER SUMMARY DRAWER (read-only analytics) ---------- */}
          {summaryOpen && (
            <OrderSummary open={summaryOpen} onClose={() => setSummaryOpen(false)}
            group={selectedGroup} poRows={poRows} workOrders={workOrders} plants={PLANTS} />)}

          <Modal open={!!switchTarget} onCancel={() => setSwitchTarget(null)} onOk={confirmSwitch}
            okText="Clear basket & continue" cancelText="Cancel" okButtonProps={{ danger: true }}
            title="Switch customer?">
            <p style={{ color: t.sub }}>
              The selection basket already contains items for <b style={{ color: t.text }}>{basketCustomer}</b>.
              You selected <b style={{ color: t.text }}>{groupById(switchTarget)?.customer}</b>.
            </p>
            <p style={{ color: t.sub }}>
              A work order can contain only one customer. Continuing will clear all selected line items,
              commit quantities, and plant assignments.
            </p>
          </Modal>

          <Modal open={commitAllOpen} onCancel={() => setCommitAllOpen(false)} onOk={commitAll} okText="Commit plan"
            title="Commit all draft work orders?">
            <p style={{ color: t.sub }}>
              This locks {draftCount} draft work order{draftCount !== 1 ? "s" : ""} and permanently persists plant
              allocations, stock reservations, and purchase order statuses. Undo is no longer possible after commit.
            </p>
          </Modal>
        </div>
      </ConfigProvider>
    </ThemeCtx.Provider>
  );
}