import React, { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  draft:     { label: "Draft",     dot: "bg-slate-400",   text: "text-slate-500",   pill: "border-slate-300/60 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  pending:   { label: "Pending",   dot: "bg-amber-400",   text: "text-amber-500",   pill: "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  confirmed: { label: "Confirmed", dot: "bg-blue-400",    text: "text-blue-500",    pill: "border-blue-400/40 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  shipped:   { label: "Shipped",   dot: "bg-emerald-400", text: "text-emerald-500", pill: "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  invoiced:  { label: "Invoiced",  dot: "bg-purple-400",  text: "text-purple-500",  pill: "border-purple-400/40 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  cancelled: { label: "Cancelled", dot: "bg-red-400",     text: "text-red-500",     pill: "border-red-400/40 bg-red-500/10 text-red-600 dark:text-red-400" },
};

const ORDER_TYPE_PILL = {
  "Standard":    "bg-blue-500/10 text-blue-500 border-blue-400/30",
  "Agreement":   "bg-purple-500/10 text-purple-500 border-purple-400/30",
  "Make-to-Stock":"bg-amber-500/10 text-amber-500 border-amber-400/30",
  "Trial":       "bg-cyan-500/10 text-cyan-500 border-cyan-400/30",
  "Inter-Plant": "bg-emerald-500/10 text-emerald-500 border-emerald-400/30",
};

// ─── Mock data (replace with your Redux selector / API call) ─────────────────
const MOCK_ORDERS = [
  { id: "SO-2026-0412", customer: "EASTMAN INDUSTRIES LIMITED", customerCode: "DE0061", type: "Standard",    date: "2026-05-20", shipDate: "2026-06-03", items: 8,  amount: 42850.00,  currency: "USD", status: "shipped",   entity: "ENT-001" },
  { id: "SO-2026-0411", customer: "AGRIQUIP MACHINERY SDN BHD", customerCode: "OEM0202", type: "Standard",  date: "2026-05-18", shipDate: "2026-06-01", items: 3,  amount: 11200.50,  currency: "USD", status: "invoiced",  entity: "ENT-001" },
  { id: "SO-2026-0410", customer: "AEROINDEC MEXICO",           customerCode: "OEM0204", type: "Agreement", date: "2026-05-15", shipDate: "2026-06-10", items: 12, amount: 98400.00,  currency: "EUR", status: "confirmed", entity: "ENT-004" },
  { id: "SO-2026-0409", customer: "POLIVUL SAS",                customerCode: "DE0209",  type: "Standard",  date: "2026-05-14", shipDate: "2026-05-28", items: 5,  amount: 6750.00,   currency: "USD", status: "draft",     entity: "ENT-001" },
  { id: "SO-2026-0408", customer: "EASTMAN INDUSTRIES LIMITED", customerCode: "DE0061",  type: "Standard",  date: "2026-05-12", shipDate: "2026-05-26", items: 20, amount: 184200.00, currency: "USD", status: "invoiced",  entity: "ENT-001" },
  { id: "PRD-2026-0089", customer: "—",                         customerCode: "",        type: "Make-to-Stock", date: "2026-05-10", shipDate: "2026-06-10", items: 6, amount: 31000.00, currency: "INR", status: "confirmed", entity: "ENT-002" },
  { id: "TRL-2026-0044", customer: "—",                         customerCode: "",        type: "Trial",     date: "2026-05-09", shipDate: "2026-06-04", items: 4,  amount: 8400.00,   currency: "INR", status: "pending",   entity: "ENT-002" },
  { id: "SO-2026-0407", customer: "AGRIQUIP MACHINERY SDN BHD", customerCode: "OEM0202", type: "Standard",  date: "2026-05-07", shipDate: "2026-05-22", items: 9,  amount: 27300.00,  currency: "USD", status: "shipped",   entity: "ENT-001" },
  { id: "SO-2026-0406", customer: "AEROINDEC MEXICO",           customerCode: "OEM0204", type: "Standard",  date: "2026-05-05", shipDate: "2026-05-20", items: 7,  amount: 53100.00,  currency: "EUR", status: "invoiced",  entity: "ENT-004" },
  { id: "IPT-2026-0012", customer: "—",                         customerCode: "",        type: "Inter-Plant", date: "2026-05-03", shipDate: "2026-05-18", items: 15, amount: 44800.00, currency: "INR", status: "shipped",   entity: "ENT-002" },
  { id: "SO-2026-0405", customer: "POLIVUL SAS",                customerCode: "DE0209",  type: "Standard",  date: "2026-05-01", shipDate: "2026-05-15", items: 2,  amount: 3200.00,   currency: "USD", status: "cancelled", entity: "ENT-001" },
  { id: "SO-2026-0404", customer: "EASTMAN INDUSTRIES LIMITED", customerCode: "DE0061",  type: "Agreement", date: "2026-04-28", shipDate: "2026-05-15", items: 18, amount: 120000.00, currency: "USD", status: "invoiced",  entity: "ENT-001" },
];

const STATUSES  = ["All", "draft", "pending", "confirmed", "shipped", "invoiced", "cancelled"];
const ORD_TYPES = ["All", "Standard", "Agreement", "Make-to-Stock", "Trial", "Inter-Plant"];

function cx(...args) { return args.filter(Boolean).join(" "); }

// ─── Trigger button (place this next to your existing header buttons) ─────────
export function ExistingOrdersButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--primary)]/5 px-4 py-2 text-xs font-semibold text-[var(--primary] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      <span className="text-base leading-none">📋</span>
      Existing Orders
    </motion.button>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ExistingOrdersModal({ open, onClose, onOpen }) {
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [sortBy,     setSortBy]     = useState("date-desc");
  const [selected,   setSelected]   = useState(null);
  const searchRef = useRef(null);

  // Auto-focus search when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 120);
      setSearch("");
      setSelected(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_ORDERS
      .filter((o) => {
        if (statusFilter !== "All" && o.status !== statusFilter) return false;
        if (typeFilter   !== "All" && o.type   !== typeFilter)   return false;
        if (!q) return true;
        return `${o.id} ${o.customer} ${o.customerCode} ${o.type}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-asc":    return a.date.localeCompare(b.date);
          case "date-desc":   return b.date.localeCompare(a.date);
          case "amount-desc": return b.amount - a.amount;
          case "amount-asc":  return a.amount - b.amount;
          default:            return 0;
        }
      });
  }, [search, statusFilter, typeFilter, sortBy]);

  const formatAmt = (n, cur) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur || "USD", maximumFractionDigits: 0 }).format(n);

  // ── Detail pane (right side when an order is selected) ────────────────────
  const detailOrder = selected ? MOCK_ORDERS.find((o) => o.id === selected) : null;

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
                  <p className="text-[10px] text-slate-500">{filtered.length} of {MOCK_ORDERS.length} orders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                  placeholder="Search by order #, customer name, code…"
                  className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                )}
              </div>

              {/* Filter chips row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Status filter */}
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Status:
                </div>
                <div className="flex flex-wrap gap-1">
                  {STATUSES.map((s) => {
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

                {/* Type filter */}
                <div className="ml-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Type:
                </div>
                <div className="flex flex-wrap gap-1">
                  {ORD_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={cx(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
                        typeFilter === t
                          ? t === "All"
                            ? "border-slate-400 bg-slate-200 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            : cx("border", ORDER_TYPE_PILL[t])
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
              <div className={cx("flex min-h-0 flex-col overflow-y-auto", detailOrder ? "w-[55%] border-r border-slate-200 dark:border-slate-800" : "w-full")}>
                {filtered.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
                    <span className="text-4xl opacity-30">📭</span>
                    <p className="text-sm font-semibold text-slate-500">No orders match your filters</p>
                    <button
                      type="button"
                      onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); }}
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((order, i) => {
                      const st  = STATUS[order.status];
                      const isSelected = selected === order.id;
                      return (
                        <motion.li
                          key={order.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025, duration: 0.18 }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelected(isSelected ? null : order.id)}
                            className={cx(
                              "flex w-full items-start gap-3 px-5 py-3.5 text-left transition",
                              isSelected
                                ? "bg-amber-500/[.06] dark:bg-amber-500/[.08]"
                                : "hover:bg-slate-50 dark:hover:bg-white/[.025]"
                            )}
                          >
                            {/* Status dot */}
                            <span className={cx("mt-2 size-2 shrink-0 rounded-full", st.dot)} />

                            {/* Main info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <code className="text-[11px] font-bold text-amber-500 dark:text-amber-400">{order.id}</code>
                                <span className={cx("rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide", ORDER_TYPE_PILL[order.type] || "border-slate-300 text-slate-500")}>
                                  {order.type}
                                </span>
                                <span className={cx("rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide", st.pill)}>
                                  {st.label}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                                {order.customer === "—" ? <em className="font-normal not-italic text-slate-400">Internal order</em> : order.customer}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                <span className="text-[10px] text-slate-400">Order: {order.date}</span>
                                <span className="text-[10px] text-slate-400">Ship: {order.shipDate}</span>
                                <span className="text-[10px] text-slate-400">{order.items} line{order.items !== 1 ? "s" : ""}</span>
                                <span className="text-[10px] text-slate-400">{order.entity}</span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="shrink-0 text-right">
                              <strong className="block font-mono text-sm font-bold text-slate-800 dark:text-white">
                                {formatAmt(order.amount, order.currency)}
                              </strong>
                              <small className="text-[9px] uppercase tracking-widest text-slate-400">{order.currency}</small>
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
                          <span className={cx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", ORDER_TYPE_PILL[detailOrder.type])}>
                            {detailOrder.type}
                          </span>
                          <span className={cx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", STATUS[detailOrder.status].pill)}>
                            {STATUS[detailOrder.status].label}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                    </div>

                    {/* Stats grid */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {[
                        ["Customer",    detailOrder.customer === "—" ? "Internal" : detailOrder.customer],
                        ["Entity",      detailOrder.entity],
                        ["Order Date",  detailOrder.date],
                        ["Ship Date",   detailOrder.shipDate],
                        ["Line Items",  `${detailOrder.items} lines`],
                        ["Currency",    detailOrder.currency],
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                          <p className="mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className={cx("mb-4 rounded-xl border p-4 text-center", STATUS[detailOrder.status].pill)}>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Order Total</p>
                      <p className="font-serif text-2xl font-semibold">{formatAmt(detailOrder.amount, detailOrder.currency)}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => { onClose(); }}
                        className="w-full rounded-lg border-0 bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        📂 Open Order
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          📄 Copy to New
                        </button>
                        <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          👁 Preview PDF
                        </button>
                      </div>
                    </div>

                    {/* Activity stub */}
                    <div className="mt-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity</p>
                      <div className="space-y-2">
                        {[
                          { icon: "✅", text: "Order confirmed by system", time: "2d ago" },
                          { icon: "📦", text: "Items picked at warehouse", time: "1d ago" },
                          { icon: "🚚", text: "Shipped via DHL Express",   time: "5h ago" },
                        ].map((act) => (
                          <div key={act.text} className="flex items-start gap-2 text-[11px]">
                            <span>{act.icon}</span>
                            <span className="flex-1 text-slate-600 dark:text-slate-300">{act.text}</span>
                            <span className="shrink-0 text-slate-400">{act.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-[#0f1117]">
              <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""} · Press <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">Esc</kbd> to close</span>
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}