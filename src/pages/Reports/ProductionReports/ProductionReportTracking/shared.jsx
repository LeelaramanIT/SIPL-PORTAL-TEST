import React from "react";
import { motion } from "framer-motion";

export const TODAY = new Date().toISOString().slice(0, 10);

// The ERP sends orderStatus as free text (18+ distinct values seen in real data,
// not a fixed enum), so status color can't be a hardcoded lookup table. Instead
// every distinct status string gets a stable color by hashing it into a fixed
// palette — same status always renders the same color, no matter which values
// happen to be present in a given dataset.
const STATUS_PALETTE = [
  "#2E8FE6", "#1DA97C", "#E5A83B", "#7C5CFC", "#EB6834",
  "#0EA5A0", "#D6488A", "#5B8DEF", "#C9A227", "#4E9A51",
];
const NEUTRAL_COLOR = "#8B95A3";

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const statusColorCache = new Map();

export function getStatusColor(status) {
  if (!status || status === "UNSPECIFIED" || status === "MIXED") return NEUTRAL_COLOR;
  if (!statusColorCache.has(status)) {
    statusColorCache.set(status, STATUS_PALETTE[hashString(status) % STATUS_PALETTE.length]);
  }
  return statusColorCache.get(status);
}

// Real orderStatus values arrive SHOUTING ("WAITING FOR PPC STENCIL ASSIGN"); this
// renders them in a calmer title case for display without altering the underlying
// value used for filtering/matching.
export function statusLabel(status) {
  if (status === "MIXED") return "Mixed";
  if (!status || status === "UNSPECIFIED") return "Unspecified";
  return status.replace(/\w\S*/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());
}

// Represents a group of rows (a work order's line items, or an order's work
// orders) by their status: the shared status if every row agrees, or "MIXED"
// when they don't — the same "Multiple" convention the rest of the grouping
// logic already uses for other fields.
export function groupStatus(statuses) {
  const distinct = new Set(statuses);
  return distinct.size === 1 ? statuses[0] : "MIXED";
}

export const LIGHT_THEME = {
  "--bg": "#F3F5F7",
  "--grid": "rgba(15,23,42,0.038)",
  "--card": "#FFFFFF",
  "--card-2": "#FAFBFC",
  "--border": "#E3E7EC",
  "--tp": "#0F1720",
  "--ts": "#586472",
  "--tt": "#8B95A3",
  "--hover": "#F2F5F8",
  "--accent": "#0F6CBD",
  "--accent-soft": "rgba(15,108,189,0.10)",
  "--shadow": "0 1px 2px rgba(16,24,40,.05)",
  "--shadow-lift": "0 10px 28px rgba(16,24,40,.10)",
};

export const DARK_THEME = {
  "--bg": "#0A0D12",
  "--grid": "rgba(255,255,255,0.035)",
  "--card": "#121821",
  "--card-2": "#0E141C",
  "--border": "#212A36",
  "--tp": "#E7ECF3",
  "--ts": "#98A3B2",
  "--tt": "#6A7483",
  "--hover": "#19212C",
  "--accent": "#4DA3F5",
  "--accent-soft": "rgba(77,163,245,0.14)",
  "--shadow": "0 1px 2px rgba(0,0,0,.45)",
  "--shadow-lift": "0 10px 28px rgba(0,0,0,.5)",
};

export function buildTheme(dark) {
  return { ...(dark ? DARK_THEME : LIGHT_THEME) };
}

export function getProgress(row) {
  if (!row.orderQty) return 0;
  return Math.round((row.producedQty / row.orderQty) * 100);
}

// No status value reliably means "done" across 18+ free-text ERP stages, so
// "delayed" is derived from what the data actually guarantees: the ship date has
// passed and the ordered quantity hasn't been fully produced yet.
export function isDelayed(row) {
  return Boolean(row.dueDate) && row.dueDate < TODAY && row.producedQty < row.orderQty;
}

// Groups an order's flat rows by workOrderNo — the same rows already carry
// workOrderNo, so this is purely a derived frontend grouping, not new data.
// Deliberately not run for every order up front: it's a real cost (Map grouping
// + two reduces + a sort + a Set per call), so callers should only invoke this
// for orders a user actually expands, not the full result set on every render.
export function buildWorkOrders(groupRows) {
  const byWorkOrder = new Map();

  groupRows.forEach((row) => {
    if (!byWorkOrder.has(row.workOrderNo)) byWorkOrder.set(row.workOrderNo, []);
    byWorkOrder.get(row.workOrderNo).push(row);
  });

  return Array.from(byWorkOrder.entries()).map(([workOrderNo, lineItems]) => {
    const orderQty = lineItems.reduce((sum, row) => sum + row.orderQty, 0);
    const producedQty = lineItems.reduce((sum, row) => sum + row.producedQty, 0);
    const dueDates = lineItems.map((row) => row.dueDate).filter(Boolean).sort();
    const plants = new Set(lineItems.map((row) => row.plant));

    return {
      workOrderNo,
      hasWorkOrder: lineItems[0].hasWorkOrder,
      rows: lineItems,
      status: groupStatus(lineItems.map((row) => row.status)),
      orderQty,
      producedQty,
      progress: orderQty ? Math.round((producedQty / orderQty) * 100) : 0,
      dueDate: dueDates[0] || "",
      plant: plants.size === 1 ? lineItems[0].plant : "Multiple",
      isDelayed: lineItems.some(isDelayed),
    };
  });
}

export function formatDate(value) {
  if (!value) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

export const fmt = (value) => Number(value || 0).toLocaleString("en-IN");

export function StatusChip({ status }) {
  const color = getStatusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-semibold text-[var(--tp)]"
      style={{ background: `${color}1F` }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      {statusLabel(status)}
    </span>
  );
}

export function DelayedBadge() {
  return (
    <span className="ml-2 inline-block rounded-[3px] bg-[#E5484D] px-1.5 py-[2px] text-[10px] font-bold uppercase tracking-wider text-white">
      Delayed
    </span>
  );
}

export function ProgressBar({ percent, status, produced, ordered, compact }) {
  const color = getStatusColor(status);
  return (
    <div className={compact ? "min-w-[110px]" : "min-w-[140px]"}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--tp)]">{percent}%</span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--tt)]">
          {fmt(produced)}/{fmt(ordered)}
        </span>
      </div>
      <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Wraps the first match of `query` in `text` with a soft, theme-matched highlight —
// deliberately not the browser's default harsh yellow <mark>, and only the first
// occurrence (not every one) so dense table cells stay clean instead of speckled.
export function HighlightText({ text, query }) {
  const value = text == null ? "" : String(text);
  const term = (query || "").trim();
  if (!term) return value;

  const index = value.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return value;

  return (
    <>
      {value.slice(0, index)}
      <mark className="rounded-[3px] bg-[var(--accent-soft)] px-[1px] text-[var(--accent)] transition-colors duration-150">
        {value.slice(index, index + term.length)}
      </mark>
      {value.slice(index + term.length)}
    </>
  );
}

export function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(node) => {
        if (node) node.indeterminate = Boolean(indeterminate) && !checked;
      }}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      className="h-3.5 w-3.5 cursor-pointer rounded-[3px] accent-[var(--accent)]"
    />
  );
}
