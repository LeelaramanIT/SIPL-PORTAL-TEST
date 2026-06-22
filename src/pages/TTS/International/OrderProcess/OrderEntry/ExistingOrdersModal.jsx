import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../../../../../utils/axios";
// Point this at your shared axios instance (the one that already has
// baseURL / auth headers / interceptors configured elsewhere in the app)
// . // ⚠️ adjust this path to match your project structure

// ─── API config ────────────────────────────────────────────────────────────
// If your `api` instance's baseURL already includes "/api", drop that
// prefix here so you don't end up calling "/api/api/OrderProcess".
const ORDER_LIST_ENDPOINT = "/OrderProcess";

// ─── Status config ────────────────────────────────────────────────────────────
// recordStatus from backend is currently only "Draft" / "DRAFT" / "FINAL".
// Normalized to two states for now. Add more keys here later if backend
// introduces e.g. "CONFIRMED", "SHIPPED", "INVOICED", "CANCELLED" — the
// normalizeStatus() function below just needs a matching case added.
const STATUS = {
  draft: {
    label: "Draft",
    dot: "bg-slate-400",
    text: "text-slate-500",
    pill: "border-slate-300/60 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
  final: {
    label: "Final",
    dot: "bg-emerald-400",
    text: "text-emerald-500",
    pill: "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

// Fallback color for order types we don't have an explicit pill style for.
const DEFAULT_TYPE_PILL = "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400";

// Known type pill colors, matched against orderTypeName (case-insensitive,
// partial match) so "Standard Sales Order" still hits the "Standard" style.
const ORDER_TYPE_PILL_RULES = [
  ["standard", "bg-blue-500/10 text-blue-500 border-blue-400/30"],
  ["agreement", "bg-purple-500/10 text-purple-500 border-purple-400/30"],
  ["make-to-stock", "bg-amber-500/10 text-amber-500 border-amber-400/30"],
  ["trial", "bg-cyan-500/10 text-cyan-500 border-cyan-400/30"],
  ["inter-plant", "bg-emerald-500/10 text-emerald-500 border-emerald-400/30"],
];

function getTypePill(typeName) {
  const t = (typeName || "").toLowerCase();
  const match = ORDER_TYPE_PILL_RULES.find(([key]) => t.includes(key));
  return match ? match[1] : DEFAULT_TYPE_PILL;
}

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

// ─── Normalizers ──────────────────────────────────────────────────────────
// recordStatus comes back inconsistently cased ("Draft", "DRAFT", "FINAL").
function normalizeStatus(recordStatus) {
  const s = (recordStatus || "").toUpperCase();
  if (s === "FINAL") return "final";
  return "draft"; // default / fallback for "DRAFT" or anything unrecognized
}

// orderDate / desiredShipDate / createdDate arrive as full ISO timestamps
// (e.g. "2026-05-22T00:00:00"). Slice to YYYY-MM-DD for display.
function toDateOnly(isoString) {
  if (!isoString) return "—";
  return isoString.slice(0, 10);
}

// Maps one raw API order object -> the shape the UI renders.
// Kept as a single pure function so it's the only place to touch when
// backend adds fields (e.g. amount/totalAmount).
function mapApiOrder(raw) {
  return {
    id: raw.orderNo || `#${raw.orderID}`,
    orderID: raw.orderID,
    customer: raw.customerName || "—",
    customerCode: raw.customerCode || "",
    type: raw.orderTypeName || raw.orderTypeCode || "—",
    date: toDateOnly(raw.orderDate),
    shipDate: toDateOnly(raw.desiredShipDate),
    createdDate: raw.createdDate || null,
    items: raw.orderLineItemsQty ?? 0,
    // Backend doesn't return an amount yet. Once it does (e.g. `amount` or
    // `totalAmount`), this picks it up automatically — no other code needs
    // to change. Until then this stays null and the UI shows "—".
    amount: raw.amount ?? raw.totalAmount ?? null,
    currency: raw.currency || null,
    status: normalizeStatus(raw.recordStatus),
    rawStatus: raw.recordStatus,
    entity: raw.entityCode || raw.entityName || "—",
    entityName: raw.entityName || "",
    salesRep: raw.salesRep || "—",
    email: raw.email || "",
    phone: raw.phone || "",
    contactPerson: raw.contactPerson || "",
    customerPO: raw.customerPO || "",
    orderCategory: raw.orderCategory || "",
  };
}

// ─── Trigger button (place this next to your existing header buttons) ─────────
export function ExistingOrdersButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--primary)]/5 px-4 py-2 text-xs font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      <span className="text-base leading-none">📋</span>
      Existing Orders
    </motion.button>
  );
}

// ─── Amount formatting (handles missing amount + missing currency) ───────────
function formatAmt(amount, currency) {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: currency ? "currency" : "decimal",
      currency: currency || undefined,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Invalid/empty currency code from backend — fall back to plain number.
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
  }
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ExistingOrdersModal({ open, onClose, onOpen, onSelectOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selected, setSelected] = useState(null);
  const searchRef = useRef(null);

  // ── Fetch orders from the real API ──────────────────────────────────────
  // Using your `api` (axios) instance — it auto-parses JSON into res.data
  // and throws on non-2xx responses, so no res.ok / res.json() needed here.
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(ORDER_LIST_ENDPOINT);
      const json = res.data;
      if (!json.success) throw new Error(json.message || "Failed to load orders");
      setOrders((json.data || []).map(mapApiOrder));
    } catch (err) {
      // axios error responses carry the server payload under err.response.data
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || err.message || "Something went wrong while loading orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openOrder = useCallback(async ()=>{
    
  },[])

  // Fetch when modal opens; reset transient UI state each time.
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(null);
      fetchOrders();
      setTimeout(() => searchRef.current?.focus(), 120);
    }
  }, [open, fetchOrders]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Distinct order types present in the current data set, derived live —
  // this replaces the old hardcoded ORD_TYPES list since orderTypeName
  // values come straight from the backend and may vary/expand over time.
  const availableTypes = useMemo(() => {
    const set = new Set(orders.map((o) => o.type).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders
      .filter((o) => {
        if (statusFilter !== "All" && o.status !== statusFilter) return false;
        if (typeFilter !== "All" && o.type !== typeFilter) return false;
        if (!q) return true;
        return `${o.id} ${o.customer} ${o.customerCode} ${o.type} ${o.customerPO}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-asc":
            return a.date.localeCompare(b.date);
          case "date-desc":
            return b.date.localeCompare(a.date);
          case "amount-desc":
            return (b.amount ?? -Infinity) - (a.amount ?? -Infinity);
          case "amount-asc":
            return (a.amount ?? Infinity) - (b.amount ?? Infinity);
          default:
            return 0;
        }
      });
  }, [orders, search, statusFilter, typeFilter, sortBy]);

  const detailOrder = selected ? orders.find((o) => o.id === selected) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-4 z-[401] mx-auto flex max-w-[1300px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(0,0,0,.25)] dark:border-slate-800 dark:bg-[#0f1117] sm:inset-8"
            style={{ maxHeight: "calc(100vh - 4rem)" }}
          >
            {/* ── Header ── */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-[#161820]">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-lg">📋</span>
                <div>
                  <h2 className="font-serif text-base font-semibold text-slate-900 dark:text-white">Existing Orders</h2>
                  <p className="text-[10px] text-slate-500">
                    {loading ? "Loading…" : `${filtered.length} of ${orders.length} orders`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchOrders}
                  title="Refresh"
                  className="flex size-8 items-center justify-center rounded-lg text-sm text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  ⟳
                </button>
                <button
                  type="button"
                  onClick={onOpen}
                  className="hidden items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-600 transition hover:bg-amber-500/20 dark:text-amber-400 sm:flex"
                >
                  ＋ New Order
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            {/* ── Toolbar: search + filters ── */}
            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-[#0f1117]">
              {/* Search */}
              <div className="mb-2.5 flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/15 dark:border-slate-700 dark:bg-slate-900">
                <span className="text-sm text-slate-400">🔍</span>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order #, customer name, code, PO…"
                  className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                )}
              </div>

              {/* Filter chips row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Status filter */}
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status:</div>
                <div className="flex flex-wrap gap-1">
                  {["All", "draft", "final"].map((s) => {
                    const cfg = s !== "All" ? STATUS[s] : null;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={cx(
                          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
                          statusFilter === s
                            ? s === "All"
                              ? "border-slate-400 bg-slate-200 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                              : cx("border", cfg.pill)
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                        )}
                      >
                        {cfg && <span className={cx("size-1.5 rounded-full", cfg.dot)} />}
                        {s === "All" ? "All" : STATUS[s].label}
                      </button>
                    );
                  })}
                </div>

                {/* Type filter — derived live from data, not hardcoded */}
                <div className="ml-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type:</div>
                <div className="flex flex-wrap gap-1">
                  {availableTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={cx(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
                        typeFilter === t
                          ? t === "All"
                            ? "border-slate-400 bg-slate-200 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            : cx("border", getTypePill(t))
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="ml-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-desc">Highest value</option>
                    <option value="amount-asc">Lowest value</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Body: list + optional detail pane ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* List */}
              <div
                className={cx(
                  "flex min-h-0 flex-col overflow-y-auto",
                  detailOrder ? "w-[55%] border-r border-slate-200 dark:border-slate-800" : "w-full"
                )}
              >
                {loading ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
                    <span className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
                    <p className="text-sm font-semibold text-slate-500">Loading orders…</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
                    <span className="text-4xl opacity-30">⚠️</span>
                    <p className="text-sm font-semibold text-red-500">{error}</p>
                    <button type="button" onClick={fetchOrders} className="text-xs text-amber-500 hover:text-amber-400">
                      Try again
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
                    <span className="text-4xl opacity-30">📭</span>
                    <p className="text-sm font-semibold text-slate-500">No orders match your filters</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                        setTypeFilter("All");
                      }}
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((order, i) => {
                      const st = STATUS[order.status];
                      const isSelected = selected === order.id;
                      return (
                        <motion.li
                          key={order.orderID ?? order.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025, duration: 0.18 }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelected(isSelected ? null : order.id)}
                            className={cx(
                              "flex w-full items-start gap-3 px-5 py-3.5 text-left transition",
                              isSelected ? "bg-amber-500/[.06] dark:bg-amber-500/[.08]" : "hover:bg-slate-50 dark:hover:bg-white/[.025]"
                            )}
                          >
                            {/* Status dot */}
                            <span className={cx("mt-2 size-2 shrink-0 rounded-full", st.dot)} />

                            {/* Main info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <code className="text-[11px] font-bold text-amber-500 dark:text-amber-400">{order.id}</code>
                                <span
                                  className={cx(
                                    "rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
                                    getTypePill(order.type)
                                  )}
                                >
                                  {order.type}
                                </span>
                                <span className={cx("rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide", st.pill)}>
                                  {st.label}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                                {order.customer === "—" ? (
                                  <em className="font-normal not-italic text-slate-400">No customer set</em>
                                ) : (
                                  order.customer
                                )}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                <span className="text-[10px] text-slate-400">Order: {order.date}</span>
                                <span className="text-[10px] text-slate-400">Ship: {order.shipDate}</span>
                                <span className="text-[10px] text-slate-400">
                                  {order.items} line{order.items !== 1 ? "s" : ""}
                                </span>
                                <span className="text-[10px] text-slate-400">{order.entity}</span>
                              </div>
                            </div>

                            {/* Amount — shows "—" gracefully until backend provides it */}
                            <div className="shrink-0 text-right">
                              <strong className="block font-mono text-sm font-bold text-slate-800 dark:text-white">
                                {formatAmt(order.amount, order.currency)}
                              </strong>
                              {order.currency && (
                                <small className="text-[9px] uppercase tracking-widest text-slate-400">{order.currency}</small>
                              )}
                            </div>

                            {/* Arrow */}
                            <motion.span
                              animate={{ rotate: isSelected ? 90 : 0 }}
                              transition={{ duration: 0.15 }}
                              className="ml-1 mt-3 shrink-0 text-xs text-slate-300 dark:text-slate-600"
                            >
                              ›
                            </motion.span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Detail pane */}
              <AnimatePresence>
                {detailOrder && (
                  <motion.div
                    key={detailOrder.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="flex w-[45%] flex-col overflow-y-auto bg-slate-50 p-5 dark:bg-[#0c0e13]"
                  >
                    {/* Detail header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <code className="text-sm font-bold text-amber-500 dark:text-amber-400">{detailOrder.id}</code>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className={cx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", getTypePill(detailOrder.type))}>
                            {detailOrder.type}
                          </span>
                          <span className={cx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", STATUS[detailOrder.status].pill)}>
                            {STATUS[detailOrder.status].label}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        ✕
                      </button>
                    </div>

                    {/* Stats grid */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {[
                        ["Customer", detailOrder.customer],
                        ["Customer Code", detailOrder.customerCode || "—"],
                        ["Entity", detailOrder.entity],
                        ["Order Date", detailOrder.date],
                        ["Ship Date", detailOrder.shipDate],
                        ["Line Items", `${detailOrder.items} lines`],
                        ["Sales Rep", detailOrder.salesRep],
                        ["Customer PO", detailOrder.customerPO || "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                          <p className="mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Total — placeholder-safe until backend sends amount */}
                    <div className={cx("mb-4 rounded-xl border p-4 text-center", STATUS[detailOrder.status].pill)}>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Order Total</p>
                      <p className="font-serif text-2xl font-semibold">
                        {detailOrder.amount === null ? (
                          <span className="text-sm font-normal opacity-60">Not available yet</span>
                        ) : (
                          formatAmt(detailOrder.amount, detailOrder.currency)
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            // Fetch full order details by ID then return the full payload
                            const id = detailOrder.orderID ?? detailOrder.id;
                            const res = await api.get(`${ORDER_LIST_ENDPOINT}/${id}`);
                            // Backend responses vary: prefer res.data.data, fallback to res.data
                            const payload = res?.data?.data ?? res?.data ?? null;
                            onSelectOrder?.(payload || detailOrder);
                          } catch (err) {
                            console.error("Failed to fetch order details:", err);
                            // Fallback to sending the lightweight detail object so caller can still open
                            onSelectOrder?.(detailOrder);
                          } finally {
                            onClose();
                          }
                        }}
                        className="w-full rounded-lg border-0 bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        📂 Open Order
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          📄 Copy to New
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          👁 Preview PDF
                        </button>
                      </div>
                    </div>

                    {/* Contact info (from API, replaces old hardcoded Activity stub) */}
                    {(detailOrder.contactPerson || detailOrder.email || detailOrder.phone) && (
                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</p>
                        <div className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] dark:border-slate-800 dark:bg-slate-900">
                          {detailOrder.contactPerson && (
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">Contact</span>
                              <span className="truncate text-slate-700 dark:text-slate-200">{detailOrder.contactPerson}</span>
                            </div>
                          )}
                          {detailOrder.email && (
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">Email</span>
                              <span className="truncate text-slate-700 dark:text-slate-200">{detailOrder.email}</span>
                            </div>
                          )}
                          {detailOrder.phone && (
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">Phone</span>
                              <span className="truncate text-slate-700 dark:text-slate-200">{detailOrder.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-[#0f1117]">
              <span>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} · Press{" "}
                <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">Esc</kbd> to close
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}